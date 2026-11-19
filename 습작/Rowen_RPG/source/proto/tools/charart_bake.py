#!/usr/bin/env python3
"""캐릭터 그림 굽기(v4.80): art_src/char/sprites/*.png(현이 준 캐릭터 · NPC 시트 21종 + 주인공 공격 시트) → charart.js
   사용: proto 폴더에서 `python3 tools/charart_bake.py` → charart.js가 다시 만들어진다. 그 뒤 build.sh.
   · 굽는 표: art_src/char/_chars.json(hk · 발끝 여유 · 공격 시트) + art_src/char/sprites/sprites.json(묶음에 들어 있던 칸 · 앵커 · 캐릭터 목록)
   · 그림은 손대지 않는다(색 · 크기 그대로). 시트 한 장 = 팔레트(6자리 hex 이어 붙임) + '색 번호(0 = 투명) 바이트열을 raw deflate로 줄인 것'의 base64.
     해독은 art.js의 inflate() · sheetPix() — 브라우저에 동기 inflate가 없어 작은 해독기를 넣었다(이미지 태그로 읽으면 비동기라 시작 순서가 꼬인다).
   · 만들어지는 것: CHARMETA(칸 · 앵커 · 방향 · hk · 공격 프레임 시간) · CHARART[id]=[가로, 세로, 팔레트, 부호] · CHARATK[id]=같은 형식
   캐릭터를 더하거나 바꾸려면: 같은 규격의 PNG를 sprites/에 넣고 sprites.json의 characters에 한 줄 → 굽기 → build.sh."""
import os, json, zlib, base64
import numpy as np
from PIL import Image
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..');SRC=os.path.join(ROOT,'art_src','char');SP=os.path.join(SRC,'sprites')
def enc(path):
    a=np.array(Image.open(path).convert('RGBA'));h,w=a.shape[:2];m=a[...,3]>127
    cols,inv=np.unique(a[m][:,:3],axis=0,return_inverse=True);assert len(cols)<=255,(path,len(cols))
    idx=np.zeros((h,w),np.uint8);idx[m]=inv+1
    c=zlib.compressobj(9,zlib.DEFLATED,-15);raw=c.compress(idx.tobytes())+c.flush()
    return [w,h,''.join('%02x%02x%02x'%tuple(int(v) for v in q) for q in cols),base64.b64encode(raw).decode()]
def main():
    T=json.load(open(os.path.join(SRC,'_chars.json'),encoding='utf-8'));J=json.load(open(os.path.join(SP,'sprites.json'),encoding='utf-8'));M=J['meta'];A={};K={}
    meta={'hk':T['hk'],'cell':[M['cell']['w'],M['cell']['h']],'anchor':[M['anchor']['x'],M['anchor']['y']],'rows':M['rows'],'foot':T['foot']}
    for c in J['characters']:
        A[c['id']]=enc(os.path.join(SP,c['file']));assert A[c['id']][0]==meta['cell'][0]*len(M['cols']) and A[c['id']][1]==meta['cell'][1]*len(M['rows']),c['id']
        if 'attack' in c:
            t=c['attack'];K[c['id']]=enc(os.path.join(SP,T.get('attack') or t['file']));assert t['rows']==M['rows']
            meta['atk']={'cell':[t['cell']['w'],t['cell']['h']],'anchor':[t['anchor']['x'],t['anchor']['y']],'dur':[d/1000 for d in t['durations_ms']],'hit':t['hit_frame']}
    d=lambda o:json.dumps(o,separators=(',',':'),ensure_ascii=False)
    js="/* 만들어진 파일 — 손으로 고치지 않는다(tools/charart_bake.py가 art_src/char/sprites/*.png에서 굽는다) */\nconst CHARMETA="+d(meta)+";\nconst CHARART={\n"+",\n".join(" %s:%s"%(k,d(v)) for k,v in A.items())+"\n};\nconst CHARATK={\n"+",\n".join(" %s:%s"%(k,d(v)) for k,v in K.items())+"\n};\n"
    open(os.path.join(ROOT,'charart.js'),'w',encoding='utf-8').write(js);print('charart.js',len(js),'bytes ·',len(A),'명 · 공격',list(K))
if __name__=='__main__':main()
