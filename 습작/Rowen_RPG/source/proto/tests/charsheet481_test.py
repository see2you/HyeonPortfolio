"""캐릭터 · NPC 새 시트(현이 준 21종 + 주인공 공격 시트) — 해독이 원본과 같은가 · 방향/프레임 · 크기 · 공격 칸 · 초상 · 양감 설정과의 관계
   사용: python3 tests/charsheet481_test.py [html] [shots 폴더]"""
import sys,os,json,io,base64
import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright
HTML=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else 'rowen_mmo_local.html');OUT=sys.argv[2] if len(sys.argv)>2 else 'shots';os.makedirs(OUT,exist_ok=True)
SP=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','art_src','char','sprites')
res=[];chk=lambda n,c,v='':(res.append(bool(c)),print(('PASS ' if c else 'FAIL ')+n,v))
PX="const px=c=>c.getContext('2d').getImageData(0,0,c.width,c.height).data,cnt=c=>{const d=px(c);let n=0;for(let i=3;i<d.length;i+=4)if(d[i])n++;return n;},dif=(a,b)=>{const A=px(a),B=px(b);let n=0;for(let i=0;i<A.length;i+=4)if(A[i+3]!==B[i+3]||A[i]!==B[i]||A[i+1]!==B[i+1]||A[i+2]!==B[i+2])n++;return n;};"
def png(u):return np.array(Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))).convert('RGBA'))
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=180000);pg.evaluate("localStorage.clear()")
    pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0");J=pg.evaluate
    IDS=[c['id'] for c in json.load(open(os.path.join(SP,'sprites.json'),encoding='utf-8'))['characters']]
    # --- 1. 그림 데이터 ---
    M=J("({ids:Object.keys(__g._art.CHARART),atk:Object.keys(__g._art.CHARATK),meta:__g._art.CHARMETA})")
    chk('구운 캐릭터 21명(주인공 + NPC 20명) · 공격 시트는 주인공',sorted(M['ids'])==sorted(IDS) and len(IDS)==21 and M['atk']==['hero'],(len(M['ids']),M['atk']))
    chk('규격: 칸 48×72 · 앵커 (24, 68) · 방향 아래/왼쪽/오른쪽/위 · 공격 칸 80×80 · 앵커 (40, 72) · 110/60/90/140ms',M['meta']['cell']==[48,72] and M['meta']['anchor']==[24,68] and M['meta']['rows']==['down','left','right','up'] and M['meta']['atk']['cell']==[80,80] and M['meta']['atk']['anchor']==[40,72] and M['meta']['atk']['dur']==[.11,.06,.09,.14],M['meta'])
    bad=[]
    for cid in ('hero','orvin','pip','taon'):
        src=np.array(Image.open(os.path.join(SP,cid+'.png')).convert('RGBA'));src[src[...,3]==0]=0
        for r,d in enumerate(['down','left','right','up']):
            for col,(wk,f) in enumerate([(False,0),(True,0),(True,1),(True,2),(True,3)]):
                a=png(J("([i,d,w,f])=>__g._art.getSprite(i,d,w,f).toDataURL()",[cid,d,wk,f]));a[a[...,3]==0]=0
                if not np.array_equal(a,src[r*72:r*72+71,col*48:(col+1)*48]):bad.append((cid,d,col))
    chk('해독한 칸이 원본 PNG와 한 칸도 다르지 않다(주인공 · 오르빈 · 핍 · 타온 × 4방향 × 5칸)',not bad,bad[:4])
    A=J("(ids)=>{"+PX+"const A=__g._art,o={};for(const id of ids){const r={hk:0,size:[],same:true,idle:[],walk:[],n:[],foot:true,lh:0};for(const d of ['down','left','right','up']){const I=[0,1].map(f=>A.getSprite(id,d,false,f)),W=[0,1,2,3].map(f=>A.getSprite(id,d,true,f)),all=I.concat(W);"
        "r.hk=I[0].hk||0;r.size=[I[0].width,I[0].height];if(d==='down')r.lh=I[0].lh;if(!all.every(c=>c.width===48&&c.height===71&&c.hk===I[0].hk))r.same=false;r.idle.push(dif(I[0],I[1]));r.walk.push(Math.min(dif(W[0],W[1]),dif(W[1],W[2]),dif(W[2],W[3]),dif(W[3],W[0])));r.n.push(...all.map(cnt));"
        "for(const c of all){const q=px(c);let ok=false;for(let y=67;y<71;y++)for(let x=0;x<48;x++)if(q[(y*48+x)*4+3])ok=true;if(!ok)r.foot=false;}}o[id]=r;}return o}",IDS)
    chk('21명 × 4방향: 캔버스 48×71 · hk 0.575 · 서 있기 2 + 걷기 4장의 크기가 같다',all(v['same'] and abs(v['hk']-.575)<1e-9 for v in A.values()),[k for k,v in A.items() if not v['same']])
    chk('걷기 4장은 서로 다르고(시트의 걷기 칸) 서 있기 2장도 다르다(윗몸 1칸 숨쉬기)',all(min(v['walk'])>0 and min(v['idle'])>0 for v in A.values()),[k for k,v in A.items() if not(min(v['walk'])>0 and min(v['idle'])>0)])
    chk('발이 캔버스 맨 아래(땅)에 닿는다 — 모든 프레임의 아래 4줄에 그림이 있다',all(v['foot'] for v in A.values()),[k for k,v in A.items() if not v['foot']])
    lh={k:round(v['lh'],1) for k,v in A.items()}
    chk('키(월드 칸): 어른 32~37 · 아이(리아 · 핀 · 키키 · 핍) 29~33이고 어른보다 작다',all(32<=lh[k]<=37 for k in IDS if k not in ('lia','fin','kiki','pip')) and all(29<=lh[k]<=33 for k in ('lia','fin','kiki','pip')) and max(lh[k] for k in ('lia','fin','kiki','pip'))<lh['hero'],lh)
    # --- 2. 필드 ---
    J("__g.S.autoQ=false;__g.step(10,.05)")
    F=J("(()=>{const g=__g,A=g._art;g.render();const o={};for(const n of g.npcList){if(n.way)continue;const im=n.m.userData.img;o[n.id]=[im.hk||0,Math.abs(n.m.scale.x-im.width*im.hk)<.01,!!n.deco];}return o})()")
    chk('필드의 NPC 메시: 전부 구운 그림 · 메시 크기 = 캔버스 × hk',len(F)>=5 and all(v[0]>0 and v[1] for v in F.values()),F)
    dn=J("(()=>{const g=__g,A=g._art,n=g.npcList.find(n=>n.deco);if(!n)return null;const o=[];for(const d of ['left','right','up','down']){n.dir=d;n.mv=1;n.walk=.2;g.render();o.push(n.m.userData.img===A.getSprite(n.id,d,true,Math.floor(.2*7)%4));}n.mv=0;return [n.id,o]})()")
    chk('돌아다니는 NPC는 가는 방향의 걷기 칸을 쓴다(왼쪽 · 오른쪽 · 위 · 아래)',dn and all(dn[1]),dn)
    fc=J("(()=>{const c=document.querySelector('#face canvas'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i])n++;return [c.width,c.height,n]})()")
    chk('왼쪽 위 얼굴 초상: 머리를 잘라 낸 정사각형 캔버스',fc[0]==fc[1] and 30<=fc[0]<=56 and fc[2]>300,fc)
    J("__g.openBag()");pg.wait_for_timeout(150);bg=J("(()=>{const c=document.querySelector('.dmid canvas.hero');return c?[c.width,c.height]:null})()");pg.screenshot(path=f"{OUT}/charsheet_bag.png");J("__g.closeWin&&__g.closeWin()")
    chk('가방 창의 주인공 그림: 몸 전체가 들어가는 캔버스(예전 22×34 고정이 아니다)',bg and bg[0]>=28 and bg[1]>=55,bg)
    # --- 3. 공격 칸 ---
    K=J("(()=>{const A=__g._art;return [.05,.12,.2,.3,.41].map(e=>{const c=A.charAtk('hero','left',e);return c?[c.atk,c.width,c.height,c.hk]:null})})()")
    chk('공격 칸: 0.05초 준비 · 0.12초 베기 · 0.2초 팔로스루 · 0.3초 복귀 · 0.4초 뒤 끝(80×75 · 같은 hk)',K[4] is None and [k[0] for k in K[:4]]==[0,1,2,3] and all(k[1:]==[80,75,.575] for k in K[:4]),K)
    src=np.array(Image.open(os.path.join(SP,'hero_attack.png')).convert('RGBA'));src[src[...,3]==0]=0
    a=png(J("__g._art.charAtk('hero','right',.12).toDataURL()"));a[a[...,3]==0]=0
    chk('공격 칸도 원본(hero_attack.png · 검기 포함)과 같다',np.array_equal(a,src[2*80:2*80+75,80:160]))
    G=J("""(()=>{const g=__g,P=g.player;g.mobs.forEach(m=>{m.atk=0;m.aggro=false;});P.dir='right';P.swing=0;P.spin=0;g.render();const o={};const im=()=>{g.render();const i=g._art.pimg;return i.atk==null?-1:i.atk;};
      o.before=im();P.swing=.001;o.f0=im();g.step(1,.12);P.dir='right';o.f1=im();o.w=g._art.wvis;g.step(1,.1);P.dir='right';o.f2=im();g.step(1,.1);P.dir='right';o.f3=im();g.step(1,.12);o.after=im();
      P.swing=.001;P.spin=.4;g.render();o.spin=im();o.wspin=g._art.wvis;P.spin=0;P.swing=0;g.step(1,.5);g.render();return o})()""")
    chk('필드: 휘두르면 공격 칸 0→1→2→3 뒤 평소 그림 · 공격 칸이 나오는 동안 옛 무기 그림은 숨김 · 회전 베기는 예전처럼 무기 그림',G and G['before']==-1 and [G['f0'],G['f1'],G['f2'],G['f3']]==[0,1,2,3] and G['after']==-1 and G['w'] is False and G['spin']==-1 and G['wspin'] is True,G)
    J("(()=>{const g=__g,P=g.player;const c=g.ZONES.z1.c;P.x=c[0];P.y=c[1];g.snapCam();g.setAuto(true);})()");seen=set()
    for i in range(160):
        r=J("(()=>{const g=__g;g.step(1,.03);g.render();const i=g._art.pimg;return i.atk==null?-1:i.atk})()")
        seen.add(r)
        if seen>={0,1,2,3}:break
    pg.screenshot(path=f"{OUT}/charsheet_fight.png");J("__g.setAuto(false)")
    chk('자동 사냥으로 실제 평타를 치면 공격 칸 네 개가 다 나온다',seen>={0,1,2,3},sorted(seen))
    # --- 4. 양감 설정 · 화면 ---
    V=J("(()=>{const A=__g._art;A.setVolume(false);const a=A.getSprite('hero','down',false,0),m0=A.MONSPR.squirrel[0];A.setVolume(true,.5);const b=A.getSprite('hero','down',false,0),m1=A.MONSPR.squirrel[0];return [a===b,m0!==m1]})()")
    chk('도트 양감 설정: 캐릭터 그림은 그대로(양감이 이미 그려져 있다) · 몬스터만 바뀐다',V==[True,True],V)
    J("(()=>{const g=__g,n=g.npcList.find(n=>n.id==='orvin');g.player.x=n.x+30;g.player.y=n.y+30;g.player.dir='down';g.snapCam();g.step(4,.02);g.render();})()");pg.screenshot(path=f"{OUT}/charsheet_village.png")
    chk('JS 오류 없음',not errs,errs[:3])
    b.close()
print(f"{sum(res)}/{len(res)}");sys.exit(0 if all(res) else 1)
