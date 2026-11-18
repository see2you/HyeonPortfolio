#!/usr/bin/env python3
"""(기록용) 현이 준 몬스터 55종 한 장 그림에서 스프라이트를 오려 낸 방법 — art_src/mon/*.png는 이 도구로 만들었다.
   사용: python3 tools/monart_cut.py <한 장 그림.png> <결과 폴더>      (pip install rembg onnxruntime scipy 필요 · 모델을 내려받는다)
   1) 칸 찾기: 바탕(남색)이 아닌 덩어리 가운데 80픽셀보다 큰 사각형 55개 → 5줄 × 11칸(줄마다 왼쪽부터 ORDER 순서)
   2) 오려 내기: 칸의 가장 흔한 색 = 바탕. 학습된 배경 제거(rembg · isnet-general-use, 4배로 키워서)로 덩어리를 잡고,
      바탕과의 '밝기 + 초록 기' 차이가 큰 픽셀을 더한다(어두운 몸이 초록 바탕과 섞여 뚫리지 않게). 이름표 줄(아래 31픽셀)은 뺀다
   3) 스프라이트로: 반으로 줄이고(원본 2픽셀 ≈ 도트 1칸) 알파를 딱 자르고 40색으로 줄인다 → <종>.png
   그림의 줄 · 칸 순서가 다르면 ORDER를 고친다. 모든 몬스터는 오른쪽을 보거나 정면이어야 한다(왼쪽을 보면 좌우로 뒤집어 저장)."""
import sys, os, numpy as np
from collections import Counter
from PIL import Image
from scipy import ndimage as ndi
ORDER=[['squirrel','frog','turtle','leafdrop','acornboar','sparrow','fairy','honeybug','mudpuff','firefly','g_rowen'],
       ['windfox','bull','sheep','rat','lark','grasssnake','locust','sunflower','earthgolem','jelly','g_plains'],
       ['mole','snail','rockcrab','crystalbat','stonebeetle','oregolem','goat','sandlizard','mosswisp','cavemush','g_rock'],
       ['waterslime','clam','carp','lotus','kingfisher','mist','lakesnake','puffer','otter','watergolem','g_lake'],
       ['emberslime','lavalizard','ashbat','obsidiancrab','volsheep','flamewisp','magmagolem','sulfurbeetle','embertree','phoenix','g_volcano']]
LABEL=31
def cells(a):
    c=Counter(map(tuple,(a[::3,::3]//8*8).reshape(-1,3)));bg=np.array(c.most_common(1)[0][0])+4
    lab,n=ndi.label(ndi.binary_opening(np.abs(a-bg).sum(2)>40,iterations=2))
    cs=[(o[0].start,o[1].start,o[0].stop-o[0].start,o[1].stop-o[1].start) for o in ndi.find_objects(lab) if (o[0].stop-o[0].start)>80 and (o[1].stop-o[1].start)>80]
    cs.sort(key=lambda c:c[0]+c[2]/2);return [sorted(cs[i*11:(i+1)*11],key=lambda c:c[1]) for i in range(5)]
def feat(p):
    L=p@np.array([.3,.59,.11]);return np.stack([L*.7,(p[...,0]-p[...,1]),(p[...,2]-p[...,1])],-1)
def cut(a,cell,ses,Z=4):
    from rembg import remove
    y,x,h,w=cell;sub=a[y:y+h,x:x+w].astype(float)
    q=(sub[4:-4,4:-4]//6*6).reshape(-1,3).astype(int);mode=np.array(Counter(map(tuple,q)).most_common(1)[0][0])+3
    allp=sub.reshape(-1,3);ring=allp[np.abs(allp-mode).sum(1)<24];bg=np.median(ring,0)
    dr=np.sqrt(((feat(ring)-feat(bg[None])[0])**2).sum(1));T=max(14,(dr.std()+dr.mean())*3.0)
    s8=sub.astype(np.uint8).copy();s8[h-LABEL:]=bg.astype(np.uint8)
    al=np.array(remove(Image.fromarray(s8).resize((w*Z,h*Z),Image.BICUBIC),session=ses,only_mask=True).resize((w,h),Image.BILINEAR))>110
    d=np.sqrt(((feat(sub)-feat(bg[None])[0])**2).sum(2))
    m=(al&(d>T*.45))|((d>T*1.6)&ndi.binary_dilation(al,iterations=3));m[h-LABEL:]=False;m[:3]=False
    m=ndi.binary_opening(m,iterations=1);lab,n=ndi.label(m,structure=np.ones((3,3)));sz=ndi.sum(m,lab,range(1,n+1))
    m=ndi.binary_fill_holes(np.isin(lab,[i+1 for i,s in enumerate(sz) if s>=max(30,sz.max()*.02)]))
    ys,xs=np.where(m);y0,y1,x0,x1=ys.min(),ys.max()+1,xs.min(),xs.max()+1
    rgba=np.zeros((y1-y0,x1-x0,4),np.uint8);rgba[...,:3]=sub[y0:y1,x0:x1];rgba[...,3]=m[y0:y1,x0:x1]*255;return rgba
def sprite(rgba,f=.5,colors=40):
    a=rgba.astype(float);H,W=a.shape[:2];al=a[...,3]>0;inner=ndi.binary_erosion(al,iterations=1)
    idx=ndi.distance_transform_edt(~inner,return_distances=False,return_indices=True);rgb=a[...,:3][idx[0],idx[1]];edge=al&~inner;a[...,:3][edge]=rgb[edge]*.82   # 가장자리의 바탕 기운을 안쪽 색으로 덮는다
    nh,nw=max(1,round(H*f)),max(1,round(W*f));pm=a.copy();pm[...,:3]*=(a[...,3:4]/255)
    box=lambda ch:np.array(Image.fromarray(ch.astype(np.float32),mode='F').resize((nw,nh),Image.BOX))
    A=box(pm[...,3]);out=np.zeros((nh,nw,4),np.uint8);m=A>=118
    for i in range(3):out[...,i]=np.clip(np.where(A>1,box(pm[...,i])/np.maximum(A,1)*255,0),0,255)
    out[...,3]=m*255;px=out[m][:,:3]
    if len(px)>colors:out[m,:3]=np.array(Image.fromarray(px.reshape(-1,1,3),'RGB').quantize(colors,method=Image.MEDIANCUT,dither=Image.NONE).convert('RGB')).reshape(-1,3)
    ys,xs=np.where(m);return out[ys.min():ys.max()+1,xs.min():xs.max()+1]
if __name__=='__main__':
    from rembg import new_session
    src,out=sys.argv[1],sys.argv[2];os.makedirs(out,exist_ok=True);a=np.array(Image.open(src).convert('RGB')).astype(int);ses=new_session('isnet-general-use')
    for r,names in zip(cells(a),ORDER):
        for cell,n in zip(r,names):Image.fromarray(sprite(cut(a,cell,ses))).save(os.path.join(out,n+'.png'));print(n)
