#!/usr/bin/env python3
"""몬스터 그림 굽기: art_src/mon/<종>.png(현의 그림에서 오려 반으로 줄인 스프라이트) → monart.js(const MONART={…})
   사용: proto 폴더에서 `python3 tools/monart_bake.py` → monart.js가 다시 만들어진다. 그 뒤 build.sh.
   · 색: 게임 배경(밝은 풀밭)에 맞춰 조금 밝고 선명하게(명도 V^0.88 · 채도 ×1.10 — TONE) → 종마다 32색으로 줄임
   · 표시 배율 hk: art_src/mon/_scale.json의 [예전 그림의 가로, 세로](월드 칸)와 넓이가 K(1.15)²배가 되게 — 화면에서의 크기를 예전과 비슷하게 유지
   · 부호: 색 번호(0 = 투명) · 길이 쌍을 이어 base64. 해독은 art.js의 monPix()
   · 다리(v4.76): art_src/mon/_legs.json에 적힌 종은 다리 칸을 같이 굽는다 — [왼쪽 열, 오른쪽 열, 시작 줄, 묶음(0/1)] · 먼 다리부터(가까운 다리가 위에 그려진다).
     "auto"면 바닥 쪽에서 따로 떨어진 덩어리를 다리로 본다(detect_legs). 틀리게 잡히는 종은 _legs.json에 직접 적는다. 해독 · 걷기 합성은 art.js의 monPix() · monFrame()
   그림을 바꾸려면 PNG를 갈아 끼우고 다시 굽는다. 새 종이면 _scale.json에 [가로, 세로]를 적고 art.js의 MON_MOVE에 움직임을 한 줄 넣는다."""
import os, json, base64, sys
import numpy as np
from PIL import Image
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..');SRC=os.path.join(ROOT,'art_src','mon');K=1.15;TONE=(.88,1.10);COLORS=32
def tone(p):
    rgb=p[...,:3].astype(float)/255;mx=rgb.max(2);mn=rgb.min(2);s=np.where(mx>0,(mx-mn)/np.maximum(mx,1e-6),0)
    v2=mx**TONE[0];s2=np.clip(s*TONE[1],0,1);c=np.where(mx[...,None]>0,rgb/np.maximum(mx[...,None],1e-6),1)
    c2=1-(1-c)*np.where(s[...,None]>0,(s2/np.maximum(s,1e-6))[...,None],1);out=p.copy();out[...,:3]=np.clip(c2*v2[...,None],0,1)*255;return out
def detect_legs(m,wlim=.42,maxfrac=.34):
    """바닥에서 위로 띠를 넓혀 가며, 띠에 닿는 열 덩어리가 2개 이상이고 가장 넓은 덩어리가 그림 폭의 42% 이하인 가장 높은 띠 = 다리 구간. 덩어리 안의 홈(발 사이)에서 한 번 더 나눈다."""
    h,w=m.shape;bot=np.full(w,-1)
    for x in range(w):
        ys=np.nonzero(m[:,x])[0]
        if len(ys):bot[x]=ys[-1]
    best=None
    for B in range(2,max(3,round(h*maxfrac))+1):
        y0=h-B;on=bot>=y0;segs=[];s=-1
        for x in range(w+1):
            o=x<w and on[x]
            if o and s<0:s=x
            if not o and s>=0:segs.append([s,x-1]);s=-1
        wmax=max([b-a+1 for a,b in segs] or [0])
        if len(segs)>=2 and wmax<=w*wlim:best=(y0,segs)
        elif best:break
    if not best:return []
    top,segs=best;out=[]
    for a,b in segs:
        cuts=[];x=a+2
        while x<=b-2:
            l=bot[(cuts[-1] if cuts else a):x].max();r=bot[x+1:b+1].max()
            if bot[x]<=min(l,r)-1 and (x-(cuts[-1] if cuts else a))>=3 and (b-x)>=3:cuts.append(x);x+=3
            else:x+=1
        q=a
        for c in cuts:out.append([q,c-1,top]);q=c
        out.append([q,b,top])
    return out
def legs_of(m,spec):
    L=detect_legs(m) if spec=='auto' else [list(q) for q in spec];L.sort(key=lambda q:q[0]);n=len(L);h,w=m.shape
    for i,q in enumerate(L):
        if len(q)<4:q.append([0,1,1,0][i] if n==4 else i%2)          # 네 다리는 대각선끼리 한 묶음(앞뒤 쌍 안에서 번갈아)
        q.append(max(int(np.nonzero(m[:,x])[0][-1]) if m[:,x].any() else 0 for x in range(q[0],q[1]+1)))
    L.sort(key=lambda q:q[4]);return [q[:4] for q in L]               # 발이 낮은(가까운) 다리가 뒤 = 위에 그려진다
def enc(path,old,legs=None):
    p=tone(np.array(Image.open(path).convert('RGBA')));h,w=p.shape[:2];m=p[...,3]>0
    q=Image.fromarray(p[m][:,:3].reshape(-1,1,3),'RGB').quantize(COLORS,method=Image.MEDIANCUT,dither=Image.NONE)
    pal=np.array(q.getpalette()[:COLORS*3]).reshape(-1,3);ids=np.array(q).reshape(-1);used=sorted(set(ids.tolist()));remap={v:i+1 for i,v in enumerate(used)}
    idx=np.zeros((h,w),np.uint8);idx[m]=[remap[v] for v in ids];flat=idx.reshape(-1);out=bytearray();i=0;n=len(flat)
    while i<n:
        v=flat[i];j=i
        while j<n and flat[j]==v and j-i<255:j+=1
        out+=bytes([int(v),j-i]);i=j
    r=[w,h,round(float(np.sqrt(old[0]*old[1]*K*K/(w*h))),3),''.join('%02x%02x%02x'%tuple(pal[v]) for v in used),base64.b64encode(bytes(out)).decode()]
    if legs is not None:r.append(legs_of(m,legs))
    return r
def main():
    sc=json.load(open(os.path.join(SRC,'_scale.json')));order=sc['order'];D={}
    LG=json.load(open(os.path.join(SRC,'_legs.json'),encoding='utf-8'))
    for n in order:D[n]=enc(os.path.join(SRC,n+'.png'),sc['size'][n],LG.get(n))
    js="/* 만들어진 파일 — 손으로 고치지 않는다(tools/monart_bake.py가 art_src/mon/*.png에서 굽는다) */\nconst MONART={\n"+",\n".join(f" {n}:{json.dumps(D[n],separators=(',',':'))}" for n in order)+"\n};\n"
    open(os.path.join(ROOT,'monart.js'),'w',encoding='utf-8').write(js);print('monart.js',len(js),'bytes ·',len(order),'종 · 다리',{n:len(D[n][5]) for n in order if len(D[n])>5})
if __name__=='__main__':main()
