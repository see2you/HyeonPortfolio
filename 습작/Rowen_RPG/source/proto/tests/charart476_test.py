"""v4.76 캐릭터 새 도트(주인공 가죽갑옷 기사 · 샘플 NPC 5명) · 새 그림 양감(volHD · 기본 켬) · 몬스터 다리 번갈아 걷기
   사용: python3 tests/charart476_test.py [html] [shots 폴더]"""
import sys,os,json
from playwright.sync_api import sync_playwright
HTML=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else 'rowen_mmo_local.html');OUT=sys.argv[2] if len(sys.argv)>2 else 'shots';os.makedirs(OUT,exist_ok=True)
res=[];chk=lambda n,c,v='':(res.append(bool(c)),print(('PASS ' if c else 'FAIL ')+n,v))
PX="const px=c=>c.getContext('2d').getImageData(0,0,c.width,c.height).data,cnt=c=>{const d=px(c);let n=0;for(let i=3;i<d.length;i+=4)if(d[i])n++;return n;},dif=(a,b)=>{const A=px(a),B=px(b);let n=0;for(let i=3;i<A.length;i+=4)if((A[i]>0)!==(B[i]>0))n++;return n;};"
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=180000);pg.evaluate("localStorage.clear()")
    pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0");J=pg.evaluate
    # --- 1. 캐릭터 그림 ---
    C=J("(()=>{const A=__g._art.CHARART,o={};for(const k in A)o[k]=Object.keys(A[k]);return o})()")
    chk('구운 캐릭터: 주인공 네 방향 + NPC 5명(한스 · 미라 · 오르빈 · 리아 · 브람)',sorted(C.get('hero',[]))==['down','left','right','up'] and all(k in C for k in ('hans','mira','orvin','lia','bram')),C)
    H=J("(()=>{"+PX+"const A=__g._art,o={};for(const d of ['down','left','right','up']){const I=[0,1].map(f=>A.getSprite('hero',d,false,f)),W=[0,1,2,3].map(f=>A.getSprite('hero',d,true,f)),all=I.concat(W);"
        "o[d]={hk:I[0].hk||0,lh:I[0].lh,lw:I[0].lw,w:I[0].width,h:I[0].height,same:all.every(c=>c.width===I[0].width&&c.height===I[0].height),n:all.map(cnt),idle:dif(I[0],I[1]),walk:[dif(W[0],W[1]),dif(W[1],W[2]),dif(W[2],W[3]),dif(W[3],W[0])]};}return o})()")
    chk('주인공: 네 방향 모두 구운 그림(hk) · 프레임 크기 같음 · 키 36~42칸(예전 34칸의 약 1.15배)',all(v['hk']>0 and v['same'] and 36<=v['lh']<=42 for v in H.values()),{k:(v['hk'],round(v['lh'],1)) for k,v in H.items()})
    chk('주인공: 서 있기 2장(숨쉬기)과 걷기 4장이 방향마다 다 다르다',all(v['idle']>0 and all(d>0 for d in v['walk']) for v in H.values()),{k:(v['idle'],v['walk']) for k,v in H.items()})
    chk('주인공: 프레임마다 픽셀 수가 기본의 92~105%(잘리거나 깨지지 않는다)',all(all(.92<=n/v['n'][0]<=1.05 for n in v['n']) for v in H.values()),{k:v['n'] for k,v in H.items()})
    N=J("(()=>{const A=__g._art,o={};for(const id of ['hans','mira','orvin','lia','bram','fin','nell']){const c=A.getSprite(id,'down',false,0);o[id]=[c.hk||0,c.width,c.height,Math.round(c.lh||c.height)];}return o})()")
    chk('NPC: 샘플 5명은 구운 그림(키 31~42칸) · 나머지(핀 · 넬)는 예전 22×34 그림',all(N[k][0]>0 and 31<=N[k][3]<=42 for k in ('hans','mira','orvin','lia','bram')) and N['fin'][0]==0 and N['nell'][0]==0,N)
    pm=J("(()=>{const g=__g,p=g.pMesh||null;g.step(2,.02);g.render();const c=document.querySelector('#face canvas');return {fw:c.width,fh:c.height}})()")
    chk('왼쪽 위 얼굴: 구운 그림 크기의 캔버스(정사각형 · 예전 22칸이 아니다)',pm['fw']==pm['fh'] and pm['fw']>30,pm)
    # --- 2. 양감 ---
    V=J("({on:__g.VOL_ON,av:__g._art.ART_VOL,cfg:[__g.S.cfg.vol,__g.S.cfg.volK,__g.S.cfg.vol476]})")
    chk('새 게임: 도트 양감 기본 켬 · 세기 보통(0.5)',V['on'] is True and abs(V['av']-.5)<1e-9 and V['cfg']==[True,.5,True],V)
    LIT="""(get)=>{const A=__g._art,px=c=>c.getContext('2d').getImageData(0,0,c.width,c.height).data,lum=(d,i)=>.3*d[i]+.59*d[i+1]+.11*d[i+2];
      A.setVolume(false);const a=get(A),pa=px(a);A.setVolume(true,.5);const b=get(A),pb=px(b);const w=a.width,h=a.height;let al=0,col=0,tl=0,br=0,tr=0,bl=0,x0=w,x1=0,y0=h,y1=0;
      for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(pa[(y*w+x)*4+3]){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
      const cx=(x0+x1)/2,cy=(y0+y1)/2;
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(pa[i+3]!==pb[i+3]){al++;continue;}if(!pa[i+3])continue;const d=lum(pb,i)-lum(pa,i);if(d)col++;if(x<cx&&y<cy)tl+=d;else if(x>=cx&&y>=cy)br+=d;else if(x>=cx&&y<cy)tr+=d;else bl+=d;}
      return {same:a===b,al,col,tl:Math.round(tl),br:Math.round(br),tr:Math.round(tr),bl:Math.round(bl),hk:[a.hk,b.hk]};}"""
    for nm,get in (('주인공 앞모습',"A=>A.getSprite('hero','down',false,0)"),('주인공 왼쪽 모습',"A=>A.getSprite('hero','left',false,0)"),('주인공 오른쪽 모습',"A=>A.getSprite('hero','right',false,0)"),('장로 오르빈',"A=>A.getSprite('orvin','down',false,0)"),('도토리멧돼지(오른쪽을 봄)',"A=>A.MONSPR.acornboar[0]"),('도토리멧돼지(왼쪽을 봄 · 뒤집은 그림)',"A=>A.MONSPRL.acornboar[0]"),('광석골렘',"A=>A.MONSPR.oregolem[0]")):
        r=J("(()=>{const f="+LIT+";return f("+get+");})()")
        chk('양감 · '+nm+': 모양은 그대로 색만 바뀐다 · 빛은 왼쪽 위(왼쪽 위가 밝아지고 오른쪽 아래가 어두워진다 · 왼쪽 절반 > 오른쪽 절반)',(not r['same']) and r['al']==0 and r['col']>40 and r['tl']>0 and r['br']<0 and r['tl']+r['bl']>r['tr']+r['br'],r)
    tg=J("(()=>{const g=__g,A=g._art;A.setVolume(false);const a=A.ART_VOL,m0=A.MONSPR.squirrel[0];A.setVolume(true,.3);const b=A.ART_VOL;A.setVolume(true,.5);return {off:a,weak:b,on:A.ART_VOL,hk:m0.hk}})()")
    chk('setVolume: 끔 0 · 약 0.3 · 보통 0.5로 새 그림 세기가 따라간다',tg['off']==0 and abs(tg['weak']-.3)<1e-9 and abs(tg['on']-.5)<1e-9,tg)
    # --- 3. 몬스터 다리 번갈아 걷기 ---
    LEG=['squirrel','acornboar','windfox','bull','sheep','rat','goat','otter','volsheep','g_plains','turtle','locust','mole','stonebeetle','sandlizard','lavalizard','sulfurbeetle','rockcrab','clam','obsidiancrab','earthgolem','oregolem','watergolem','magmagolem','g_rock']
    G=J("(L)=>{"+PX+"const A=__g._art,o={};for(const k of L){const S=A.MONSPR[k],a=A.MONART[k],legs=a[5]||[];"
        "const col=new Set();for(const q of legs)for(let x=q[0];x<=q[1];x++)col.add(x+4);/* 캔버스 왼쪽 여백 4칸 */const y1=7+a[1]-1;/* 그림의 맨 아랫줄(위 여백 7칸) */const bot=c=>{const d=px(c),w=c.width;let s='';for(let x=0;x<w;x++)s+=!col.has(x)?'.':(d[(y1*w+x)*4+3]||d[((y1-1)*w+x)*4+3])?'1':'0';return s;};"
        "o[k]={leg:A.monLegged(k),n:legs.length,g:[...new Set(legs.map(q=>q[3]))].length,idle:dif(S[0],S[1]),w13:dif(S[3],S[5]),w02:dif(S[2],S[4]),b1:bot(S[3]),b3:bot(S[5]),b0:bot(S[0]),bi:bot(S[1])};}return o}",LEG)
    chk('다리로 걷는 25종: 다리 칸이 2개 이상이고 두 묶음으로 나뉜다',all(v['leg'] and v['n']>=2 and v['g']==2 for v in G.values()),{k:(v['n'],v['g']) for k,v in G.items() if not(v['leg'] and v['n']>=2 and v['g']==2)})
    chk('번갈아 내딛는다: 발을 든 두 프레임(걷기 2번째 · 4번째)에서 땅에 닿은 발이 서로 다르다',all(v['b1']!=v['b3'] and v['w13']>0 for v in G.values()),[k for k,v in G.items() if not(v['b1']!=v['b3'] and v['w13']>0)])
    chk('서 있을 때는 발이 제자리(숨쉬기만): 맨 아래 두 줄이 그대로',all(v['b0']==v['bi'] and v['idle']>0 for v in G.values()),[k for k,v in G.items() if not(v['b0']==v['bi'] and v['idle']>0)])
    oth=J("(()=>{const A=__g._art;return Object.keys(A.MONSPR).filter(k=>!A.monLegged(k)).length})()")
    chk('나머지 30종은 예전 움직임(통통 뛰기 · 날기 · 물결 등) 그대로',oth==30,oth)
    J("__g.S.autoQ=false;__g.step(20,.05)")
    fr=J("""(()=>{const g=__g,A=g._art,o={};for(const sp of ['squirrel','leafdrop']){const m=g.mobs.find(x=>!x.dead&&x.sp===sp);if(!m){o[sp]=null;continue;}g.player.x=m.x-70;g.player.y=m.y+8;g.snapCam();
        const idx=()=>{g.render();const im=m.mesh.userData.img;let i=A.MONSPR[sp].indexOf(im);if(i<0)i=A.MONSPRL[sp].indexOf(im);return i;};const r=[];
        m.hit=0;m.aggro=false;m.moving=false;r.push(idx());m.moving=true;m.phase=.3;r.push(idx());m.moving=false;m.aggro=true;r.push(idx());m.aggro=false;o[sp]=r;}return o})()""")
    chk('프레임 고르기 · 다람쥐(다리로 걷는 종): 서 있기 0~1 · 걸을 때 2~5 · 제자리에서 싸울 때는 서 있기',fr['squirrel'] and fr['squirrel'][0] in (0,1) and fr['squirrel'][1]>=2 and fr['squirrel'][2] in (0,1),fr['squirrel'])
    chk('프레임 고르기 · 풀잎방울(통통 뛰는 종): 싸울 때도 뛰는 프레임(2~5)',fr['leafdrop'] and fr['leafdrop'][0] in (0,1) and fr['leafdrop'][1]>=2 and fr['leafdrop'][2]>=2,fr['leafdrop'])
    # --- 4. 화면 · 저장 ---
    J("(()=>{const g=__g,n=g.npcList.find(n=>n.id==='orvin');g.player.x=n.x+30;g.player.y=n.y+30;g.player.dir='down';g.snapCam();g.step(4,.02);g.render();})()");pg.screenshot(path=f"{OUT}/charart_village.png")
    sc=J("(()=>{const g=__g;g.render();const n=g.npcList.find(n=>n.id==='orvin'),im=n.m.userData.img;return {sx:n.m.scale.x,w:im.width,hk:im.hk}})()")
    chk('필드의 장로 오르빈: 메시 크기 = 그림 크기 × hk',abs(sc['sx']-sc['w']*sc['hk'])<.01,sc)
    J("(()=>{const g=__g;g.S.cfg.vol=false;g.setVolume(false);g.save();})()");pg.evaluate("window.requestAnimationFrame=window.__raf||window.requestAnimationFrame")
    pg.reload();pg.wait_for_function('window.__ready===true',timeout=180000);pg.click('#btnCont');pg.wait_for_timeout(400)
    V2=pg.evaluate("({on:__g.VOL_ON,av:__g._art.ART_VOL,cfg:[__g.S.cfg.vol,__g.S.cfg.vol476]})")
    chk('직접 끈 양감은 이어하기로 다시 들어와도 꺼져 있다(기본 켬은 한 번만 적용)',V2['on'] is False and V2['av']==0 and V2['cfg']==[False,True],V2)
    chk('JS 오류 없음',not errs,errs[:3])
    b.close()
print(f"{sum(res)}/{len(res)}");sys.exit(0 if all(res) else 1)
