"""몬스터 새 도트(현의 그림 55종을 오려 넣음) — 그림 데이터 · 걷는 4프레임 합성 · 표시 배율(hk) · 크기를 쓰는 곳 · 양감 옵션 · 화면
   사용: python3 tests/monart_test.py [html] [shots 폴더]"""
import sys,os,json
from playwright.sync_api import sync_playwright
HTML=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else 'rowen_mmo_local.html');OUT=sys.argv[2] if len(sys.argv)>2 else 'shots';os.makedirs(OUT,exist_ok=True)
res=[];chk=lambda n,c,v='':(res.append(bool(c)),print(('PASS ' if c else 'FAIL ')+n,v))
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=180000);pg.evaluate("localStorage.clear()")
    pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0");J=pg.evaluate
    chk('버전 v4.x',J("document.getElementById('verTag').textContent").startswith('v4.'))
    A=J("""(()=>{const S=__g._art.MONSPR,o={};const cnt=c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0,x0=1e9,x1=-1,y0=1e9,y1=-1;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(d[(y*c.width+x)*4+3]>8){n++;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}return [n,x0,x1,y0,y1];};
      for(const k in S){const f=S[k];o[k]={n:f.length,hk:f[0].hk||0,lh:f[0].lh||0,lw:f[0].lw||0,w:f[0].width,h:f[0].height,same:f.every(c=>c.width===f[0].width&&c.height===f[0].height),px:f.map(cnt)};}return o})()""")
    chk('몬스터 55종 전부 새 그림(표시 배율 hk가 있다) · 4프레임 · 프레임 크기 같음',len(A)==55 and all(v['n']==4 and v['hk']>0 and v['same'] for v in A.values()),[k for k,v in A.items() if not(v['n']==4 and v['hk']>0 and v['same'])])
    chk('도트 밀도 약 2배: 표시 배율 0.4~1.2',all(.4<=v['hk']<=1.2 for v in A.values()),{k:v['hk'] for k,v in A.items() if not .4<=v['hk']<=1.2})
    chk('화면에서의 크기(월드 칸): 일반 종 높이 12~46 · 너비 12~46',all(12<=v['lh']<=46 and 12<=v['lw']<=46 for k,v in A.items() if not k.startswith('g_')),{k:(round(v['lh']),round(v['lw'])) for k,v in A.items() if not(14<=v['lh']<=46 and 14<=v['lw']<=46) and not k.startswith('g_')})
    chk('프레임마다 그림이 캔버스 밖으로 잘리지 않는다(왼 · 오 · 위 여백 ≥ 0, 픽셀 수가 기본의 80~125%)',all(all(q[1]>=0 and q[2]<=v['w']-1 and q[3]>=0 and .8<=q[0]/v['px'][0][0]<=1.25 for q in v['px']) for v in A.values()),[k for k,v in A.items() if not all(.8<=q[0]/v['px'][0][0]<=1.25 for q in v['px'])][:5])
    mv=J("""(()=>{const S=__g._art.MONSPR;const diff=(a,b)=>{const A=a.getContext('2d').getImageData(0,0,a.width,a.height).data,B=b.getContext('2d').getImageData(0,0,b.width,b.height).data;let n=0;for(let i=3;i<A.length;i+=4)if((A[i]>8)!==(B[i]>8))n++;return n;};const o={};for(const k in S)o[k]=[diff(S[k][0],S[k][1]),diff(S[k][1],S[k][2]),diff(S[k][2],S[k][3]),diff(S[k][3],S[k][0])];return o})()""")
    chk('걷는 동작: 모든 종이 프레임마다 모양이 달라진다(한 장 그림에서 합성)',all(sum(1 for d in v if d>0)>=3 for v in mv.values()),[k for k,v in mv.items() if sum(1 for d in v if d>0)<3])
    chk('서 있을 때(0↔1 프레임)는 얌전하다: 달라지는 픽셀이 걷는 프레임(2 · 3)보다 적다(뱀 · 물고기 제외)',sum(1 for k,v in mv.items() if v[0]<=max(v[1],v[2])+2)>=45,sum(1 for k,v in mv.items() if v[0]<=max(v[1],v[2])+2))
    J("__g.S.autoQ=false;__g.step(20,.05)")
    m=J("""(()=>{const g=__g,m=g.mobs.find(x=>!x.dead&&x.sp==='squirrel');const c=g.ZONES.z1.c;g.player.x=m.x-60;g.player.y=m.y+10;m.atk=0;g.snapCam();g.step(3,.02);g.render();const im=m.mesh.userData.img;
      return {sx:m.mesh.scale.x,sy:m.mesh.scale.y,w:im.width,h:im.height,hk:im.hk,sc:m.sc,vis:m.mesh.visible}})()""")
    chk('필드의 솜꼬리다람쥐: 메시 크기 = 그림 크기 × hk × 배율(예전 크기대 15~40칸)',abs(m['sx']-m['w']*m['hk']*m['sc'])<.01 and 15<=m['sx']<=40 and m['vis'],m)
    sz=J("(()=>{const g=__g;return {h:g.monH?g.monH('squirrel'):null,w:g.monW?g.monW('squirrel'):null}})()")
    L=J("""(()=>{const g=__g,S=g._art.MONSPR,l=__g._art.MONSPR.squirrel[0];return {flipHk:!!(g._art&&S.squirrel[0].hk),lh:l.lh,lw:l.lw}})()""")
    chk('크기 값(이름표 · 대상 고리 · 누르기 판정이 쓰는 값)은 월드 칸 단위: 다람쥐 높이 15~30',15<=L['lh']<=30 and 15<=L['lw']<=40,L)
    J("(()=>{const g=__g,m=g.mobs.find(x=>!x.dead&&x.sp==='squirrel');g.setTarget?g.setTarget(m):(g.target=m);g.step(4,.02);g.render();})()")
    pg.screenshot(path=f"{OUT}/monart_field.png")
    v=J("(()=>{const g=__g,A=g._art;const a=A.MONSPR.squirrel[0];A.setVolume(true);const b=A.MONSPR.squirrel[0];g.step(3,.02);g.render();A.setVolume(false);return {same:a===b,hk:b.hk}})()")
    chk('설정의 도트 양감을 켜도 새 몬스터 그림은 그대로(배율 유지 · 오류 없음)',v['same'] and v['hk']>0,v)
    hit=J("""(()=>{const g=__g,m=g.mobs.find(x=>!x.dead&&x.sp==='squirrel');const p0=m.hp;g.hurtMob?0:0;m.hit=.2;g.step(1,.01);g.render();const im=m.mesh.userData.img;return {hk:im.hk||0,w:im.width}})()""")
    chk('맞을 때 번쩍이는 흰 실루엣도 같은 배율',hit['hk']>0,hit)
    for z,mp in (('z3','rowen'),):
        J(f"(()=>{{const g=__g,c=g.ZONES['{z}'].c;g.player.x=c[0];g.player.y=c[1];g.mobs.forEach(m=>m.atk=0);g.snapCam();g.step(20,.03);g.render();}})()");pg.screenshot(path=f"{OUT}/monart_{z}.png")
    chk('JS 오류 없음',not errs,errs[:3])
    b.close()
print(f"{sum(res)}/{len(res)}");sys.exit(0 if all(res) else 1)
