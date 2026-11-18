#!/usr/bin/env python3
"""캐릭터 그림 굽기: art_src/char/<이름>.png(현의 그림에서 그대로 오린 주인공 · NPC) → charart.js(const CHARART={…})
   사용: proto 폴더에서 `python3 tools/charart_bake.py` → charart.js가 다시 만들어진다. 그 뒤 build.sh.
   · 굽는 표: art_src/char/_chars.json — hk(표시 배율)와 캐릭터 · 방향마다 [파일, 다리가 시작되는 줄]
   · 색 · 부호는 몬스터와 같다(tools/monart_bake.py의 enc — 명도 V^0.88 · 채도 ×1.10 · 32색 · 줄길이 부호). 해독 · 걷기 합성은 art.js의 monPix() · charFrame()
   NPC를 더하려면: PNG를 art_src/char에 넣고(투명 배경 · 주인공과 같은 도트 밀도 · 발이 맨 아랫줄) _chars.json에 한 줄. 옆 · 뒷모습이 있으면 left · right · up도 적는다."""
import os, json, importlib.util
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..');SRC=os.path.join(ROOT,'art_src','char')
spec=importlib.util.spec_from_file_location('monart_bake',os.path.join(os.path.dirname(os.path.abspath(__file__)),'monart_bake.py'));mb=importlib.util.module_from_spec(spec);spec.loader.exec_module(mb)
def main():
    T=json.load(open(os.path.join(SRC,'_chars.json'),encoding='utf-8'));D={}
    for cid,dirs in T['chars'].items():
        D[cid]={}
        for d,(fn,leg) in dirs.items():
            e=mb.enc(os.path.join(SRC,fn+'.png'),[1,1]);e[2]=T['hk'];D[cid][d]=e+[0,leg]
    js="/* 만들어진 파일 — 손으로 고치지 않는다(tools/charart_bake.py가 art_src/char/*.png에서 굽는다) */\nconst CHARART={\n"+",\n".join(" %s:{%s}"%(c,",".join("%s:%s"%(d,json.dumps(v,separators=(',',':'))) for d,v in D[c].items())) for c in D)+"\n};\n"
    open(os.path.join(ROOT,'charart.js'),'w',encoding='utf-8').write(js);print('charart.js',len(js),'bytes ·',{c:list(D[c]) for c in D})
if __name__=='__main__':main()
