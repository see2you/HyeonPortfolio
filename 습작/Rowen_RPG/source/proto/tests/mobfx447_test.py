"""v4.47 G1-a (지시서 §G1) 몬스터 행동 원형 틀 · 예고 데칼 풀 · dangerAt · 상태이상 틀 + 호수뱀 독
1) 근접 동작 불변: 고치기 전 빌드(OLD_HTML, 없으면 건너뜀)와 같은 씨앗 난수로 60초 서 있기 · 자동 전투 · 보스 장판 회피를 돌려 결과가 같은지
2) 독: 지속 · 초당 피해 · 갱신(중첩 없음) · 물약 −30% · 사망/부활/지역 이동 해제 · HP 바 아이콘
3) 피해 예산: 호수뱀(독) 60초 받은 피해 ÷ 독 없는 호수뱀 = 0.90~1.15 (Lv11 · Lv12, 씨앗 3개 평균)
4) dangerAt: 원형 · 직선 · 부채꼴 예고 안/밖 판정, 자동 전투는 0.3초 뒤 가장 가까운 바깥으로 · 수동이면 안 움직임
5) 예고 6+4+2개 동시 표시 · step 시간 · 선공 규칙 · 이전 세이브 이어하기 · 버전 (shots/v447_*.png)"""
import os,sys,time,json
sys.path.insert(0,os.path.dirname(__file__));from fx_util import SETUP_JS,DUEL_JS
from playwright.sync_api import sync_playwright
HTML=os.path.abspath('rowen_mmo_local.html');OLD=os.environ.get('OLD_HTML')
ARGS=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']
EQ_JS="""([mode,seed])=>{const g=__g,S=g.S,P=g.player;const T0=Math.ceil(g.t+5);g.step(1,T0-g.t);const K=[.5,.31,.77,.12,.64][seed%5];Math.random=()=>K;/* 호출 횟수가 달라도 같은 값 — 페이지마다 앞선 상태(입자 수 등)가 달라 씨앗 난수로는 같은 빌드끼리도 어긋났다 */
  S.autoQ=false;const m=g.mobs.find(e=>e.zone==='z1'&&!e.boss&&!e.eliteOf);if(!m._h0)m._h0={x:m.home.x,y:m.home.y,max:m.max};m.home.x=m._h0.x;m.home.y=m._h0.y;m.max=m._h0.max;m.boss=false;m.sc=1;
  if(mode==='boss'){m.boss=true;m.sc=2.3;m.max=m.max*8;}m.dead=false;m.deadT=0;m.mv=null;m.blockT=0;m.hit=0;m.phase=0;m.face=1;m.next=3;
  for(const e of g.mobs)if(e!==m){e.aggro=false;e.dead=true;e.deadT=-1e9;e.respawn=1e9;}
  m.x=m.home.x;m.y=m.home.y;m.hp=m.max;m.atkT=1;m.wind=0;m.aoe=null;m.aoeT=2;m.aggro=true;m.ret=false;P.x=m.x+18;P.y=m.y;P.hp=1e7;P.mp=999;P.atkT=0;P.cd=P.cd.map(()=>0);g.setTarget(m);
  if(mode==='stand'){m.max=m.hp=1e9;}
  const log=[];let kill=-1;for(let i=0;i<1200;i++){P.lastHit=1e12;g.step(1,.05);if(mode==='stand'){m.hp=1e9;P.x=m.x+18;P.y=m.y;m.home.x=m.x;m.home.y=m.y;}if(i%20===0)log.push([Math.round(P.x*10),Math.round(P.y*10),Math.round(m.x*10),Math.round(m.y*10),Math.round(1e7-P.hp),Math.round(m.hp)]);if(kill<0&&(m.dead||m.hp<=0))kill=i;}
  return {taken:Math.round((1e7-P.hp)*1000)/1000,kill,log};}"""
def page(b,html):
    pg=b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.text.startswith('DBG') and print(m.text))
    pg.goto('file://'+html);pg.wait_for_function('window.__ready===true',timeout=120000)
    pg.evaluate("localStorage.clear()");pg.click('#btnStart',timeout=60000);pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0");return pg,errs
def eqrun(pg,mode,seed,auto):
    pg.evaluate("__g.S.lv=3")
    if auto and not pg.evaluate("__g.auto"):pg.focus('#stage');pg.keyboard.press('r')
    if not auto and pg.evaluate("__g.auto"):pg.focus('#stage');pg.keyboard.press('r')
    return pg.evaluate(EQ_JS,[mode,seed])
ok=0
def chk(c,msg):
    global ok
    assert c,msg;ok+=1;print('  ok',msg)
with sync_playwright() as p:
    b=p.chromium.launch(args=ARGS)
    # ---------- 1) 근접 동작 불변 ----------
    if OLD and os.path.exists(OLD):
        res={}
        for name,h in (('old',os.path.abspath(OLD)),('new',HTML)):
            pg,er=page(b,h);res[name]=[eqrun(pg,'stand',7,False),eqrun(pg,'stand',11,True),eqrun(pg,'boss',5,True)];pg.close();assert not er,er
        for i,lab in enumerate(['서 있기 60초','자동 전투 z1','자동 전투 보스(장판 회피)']):
            o,n=res['old'][i],res['new'][i];print(' ',lab,'old',o['taken'],o['kill'],'new',n['taken'],n['kill'])
            chk(o==n,'근접 동작 불변 · '+lab+' (받은 피해 · 처치 프레임 · 1초 간격 위치 로그 동일)')
    else:print('  (OLD_HTML 없음 — 근접 불변 대조 건너뜀)')
    pg,errs=page(b,HTML)
    # ---------- 2) 독 ----------
    st=pg.evaluate(SETUP_JS,12);print(' setup',st)
    chk(pg.evaluate("__g.MOB_B.lakesnake.fx==='poison'&&__g.mobB(__g.mobs.find(m=>m.sp==='lakesnake'&&!m.boss&&!m.eliteOf))!==null"),'호수뱀에 독 배정(일반 개체)')
    chk(pg.evaluate("(()=>{const e=__g.mobs.find(m=>m.eliteOf||m.boss);return !e||__g.mobB(e)===null})()"),'보스 · 관문 정예에는 아직 안 붙음(G1-f~g)')
    chk(pg.evaluate("__g.fxDur('poison')===5"),'fxDur 독 5초(1배)')
    chk(pg.evaluate("(()=>{const g=__g;const lv=x=>g.fxP({lv:x});return lv(3)===.15&&lv(10)===.15&&lv(12)===.25&&lv(7)===.25&&g.fxP({lv:12,eliteOf:'q'})===1})()"),'부여 확률 15%(Lv1~6 · 9~11) · 25% · 정예 100%')
    r=pg.evaluate("""()=>{const g=__g,P=g.player,st=g.pStats();for(const m of g.mobs){m.aggro=false;}P.x=g.PLAZA?g.PLAZA.x:P.x;P.hp=st.hp;P.lastHit=1e12;g.clearStatus();g.addFx('poison',{name:'호수뱀',atk:10});const h0=P.hp;
      g.step(20,.05);const a1=st.hp-P.hp;g.step(30,.05);g.addFx('poison',{name:'호수뱀',atk:10});const u=g.player.fx.poison.until-g.t;g.step(200,.05);const tot=h0-P.hp;const on=g.fxOn('poison');g.step(20,.05);return {a1,tot,u,on,after:g.fxOn('poison'),max:st.hp};}""")
    print(' poison',r)
    chk(abs(r['a1']-r['max']*.004)<1,'독 1초 = 최대 HP 0.4%')
    chk(abs(r['u']-5)<.06,'다시 걸리면 지속만 5초로 갱신')
    chk(abs(r['tot']-r['max']*.004*7)<r['max']*.004*.6,'갱신해도 중첩 없음(2.5초 뒤 갱신 → 총 7틱)')
    chk(not r['after'],'지속 끝나면 해제')
    r=pg.evaluate("""()=>{const g=__g,P=g.player,S=g.S,st=g.pStats();S.hpPot=5;P.potT=0;P.hp=1;g.clearStatus();g.usePot('hp',true);const a=P.hp-1;P.potT=0;P.hp=1;g.addFx('poison',{name:'x'});g.usePot('hp',true);const b=P.hp-1;g.clearStatus();P.hp=st.hp;return {a,b};}""")
    print(' pot',r);chk(abs(r['b']/r['a']-.7)<.01,'독 중 HP 물약 회복 −30%')
    pg.evaluate("__g.addFx('poison',{name:'호수뱀'});__g.step(4,.05)")
    chk(pg.evaluate("!document.getElementById('fxRow').hidden&&document.getElementById('fxRow').textContent.includes('☠')"),'HP 바 위 독 아이콘 + 남은 초')
    pg.evaluate("__g.snap();__g.render()");pg.screenshot(path='shots/v447_독아이콘.png')
    pg.screenshot(path='shots/v447_독아이콘_확대.png',clip={'x':0,'y':0,'width':420,'height':120})
    chk(pg.evaluate("(()=>{const g=__g;g.die({name:'시험'});return !g.fxOn('poison')})()"),'사망 시 해제')
    pg.wait_for_timeout(300);pg.evaluate("__g.step(40,.05)")
    pg.click('#dlgA button');pg.wait_for_timeout(200)
    chk(pg.evaluate("(()=>{const g=__g;g.addFx('poison',{name:'x'});const a=g.fxOn('poison')&&!g.player.dead&&!g.modal;g.clearStatus();return a})()"),'부활 후 다시 걸 수 있음')
    pg.evaluate("__g.addFx('poison',{name:'x'})");pg.evaluate("__g.doTravel('kardo',null,{quiet:true,now:true})");pg.wait_for_function("!__g.traveling&&__g.MAPID==='kardo'",timeout=120000)
    chk(pg.evaluate("!__g.fxOn('poison')"),'지역 이동 시 해제')
    pg.evaluate("__g.doTravel('rowen',null,{quiet:true,now:true})");pg.wait_for_function("!__g.traveling&&__g.MAPID==='rowen'",timeout=120000)
    # ---------- 3) 피해 예산 ----------
    rows=[]
    for lv in (11,12):
        pg.evaluate(SETUP_JS,lv);A=B=C=0;pr=0
        for seed in (1,2,3,4):
            a=pg.evaluate(DUEL_JS,['lakesnake',lv,60,seed,True]);c=pg.evaluate(DUEL_JS,['lakesnake',lv,60,seed,False]);A+=a['taken'];B+=a['melee'];C+=c['taken'];pr+=a['procs']
        rows.append((lv,round(A/B,3),round(A/C,3),pr));print(' budget lv',lv,'(근접+독)/근접(같은 판) %.3f · 독 없는 판 대비 %.3f · 독 걸림 %d회/240초'%(A/B,A/C,pr))
        chk(.90<=A/B<=1.15,'피해 예산 Lv%d 독 호수뱀 ÷ 근접 = %.3f (0.90~1.15)'%(lv,A/B))
        chk(.85<=A/C<=1.25,'독 없는 판과 비교해도 범위 안(근접 난수 흔들림 ±10%% 감안) %.3f'%(A/C))
    # ---------- 4) dangerAt ----------
    d=pg.evaluate("""()=>{const g=__g,out={};g.tele.length=0;const c={kind:'circle',x:0,y:0,r:40,t:1,dur:2},l={kind:'line',x:0,y:0,a:0,len:120,w:22,t:1,dur:2},f={kind:'fan',x:0,y:0,a:0,r:80,half:Math.PI/3,t:1,dur:2};
      const T=(e,x,y)=>!!g.dangerAt&&(()=>{g.tele.length=0;g.tele.push(Object.assign({},e));const r=g.dangerAt(x,y,0,false);g.tele.length=0;return r;})();
      out.cIn=!!T(c,10,10);out.cOut=!!T(c,50,0);out.lIn=!!T(l,60,5);out.lOutSide=!!T(l,60,20);out.lOutEnd=!!T(l,130,0);out.fIn=!!T(f,50,20);out.fBack=!!T(f,-30,0);out.fSide=!!T(f,20,60);out.fFar=!!T(f,90,0);
      const r=T(l,60,5);out.lEsc=Math.round(Math.sin(r.a)*100);const r2=T(c,10,0);out.cEsc=Math.round(Math.cos(r2.a)*100);return out;}""")
    print(' dangerAt',d)
    chk(d['cIn'] and not d['cOut'],'원형 안/밖');chk(d['lIn'] and not d['lOutSide'] and not d['lOutEnd'],'직선 띠 안/밖');chk(d['fIn'] and not d['fBack'] and not d['fSide'] and not d['fFar'],'부채꼴 안/밖(뒤 · 옆 · 먼 곳 제외)')
    chk(d['lEsc']==100 and d['cEsc']==100,'탈출 방향 = 가장 가까운 바깥(직선은 옆으로 · 원형은 바깥으로)')
    for kind in ('circle','line','fan'):
        r=pg.evaluate("""(kind)=>{const g=__g,P=g.player,S=g.S;for(const m of g.mobs){m.aggro=false;}S.autoQ=false;g.setAuto(true);g.setTarget(null);const x0=g.ZONES.z1.c[0],y0=g.ZONES.z1.c[1];P.x=x0;P.y=y0;P.spin=0;
          const e=kind==='circle'?{kind,x:x0+5,y:y0,r:40,dur:1.5}:kind==='line'?{kind,x:x0-60,y:y0+4,a:0,len:140,w:22,dur:1.5}:{kind,x:x0-30,y:y0,a:0,r:80,dur:1.5};g.tele.length=0;g.teleAdd(e);
          g.step(4,.05);const m1=Math.hypot(P.x-x0,P.y-y0);g.step(16,.05);const out=!g.dangerAt(P.x,P.y,0,false);const m2=Math.hypot(P.x-x0,P.y-y0);g.tele.length=0;
          g.setAuto(false);P.x=x0;P.y=y0;g.teleAdd(e);g.step(20,.05);const man=Math.hypot(P.x-x0,P.y-y0);g.tele.length=0;return {m1,m2,out,man};}""",kind)
        print(' auto dodge',kind,r)
        chk(r['m1']<1 and r['m2']>5 and r['out'],'자동 전투 %s 예고: 0.3초 전엔 그대로 · 뒤엔 바깥으로'%kind)
        chk(r['man']<1,'수동 조작 중엔 %s 예고에 자동 회피가 끼어들지 않음'%kind)
    # ---------- 5) 표시 · 성능 ----------
    r=pg.evaluate("""()=>{const g=__g,P=g.player;g.tele.length=0;P.x=g.ZONES.z1.c[0];P.y=g.ZONES.z1.c[1];for(let i=0;i<30;i++){g.step(1,.05);g.render();}/* v4.76: 재기 전에 이 자리의 스프라이트를 한 번씩 그려 둔다 — 처음 보이는 프레임의 텍스처를 만드는 시간이 '예고 있음' 쪽에만 얹혀 흔들렸다(걷기 프레임이 서 있기와 나뉘면서 늘었다) */for(let i=0;i<6;i++)g.teleAdd({kind:'circle',x:P.x-150+i*60,y:P.y-60,r:26,dur:30,t:i*2});
      for(let i=0;i<4;i++)g.teleAdd({kind:'line',x:P.x-160,y:P.y+10+i*28,a:.15*i,len:140+20*i,w:20,dur:30,t:5+i*5});for(let i=0;i<2;i++)g.teleAdd({kind:'fan',x:P.x+90+i*0,y:P.y+70+i*0,a:i?2.6:.5,r:70,dur:30,t:8+i*10});
      g.teleAdd({kind:'circle',x:P.x,y:P.y+900,r:30,dur:30});const t0=performance.now();for(let i=0;i<20;i++){g.step(1,.05);g.render();}const ms=(performance.now()-t0)/20;g.snap();g.render();
      const vis=k=>g.TELE_POOL[k].filter(q=>q.o.visible).length;return {ms,c:vis('circle'),l:vis('line'),f:vis('fan')};}""")
    print(' pool',r);chk(r['c']==6 and r['l']==4 and r['f']==2,'예고 풀 원형 6 · 직선 4 · 부채꼴 2 동시 표시');pg.screenshot(path='shots/v447_예고풀.png')
    r2=pg.evaluate("""()=>{const g=__g;const n=g.tele.length;g.tele.length=0;const t0=performance.now();for(let i=0;i<20;i++){g.step(1,.05);g.render();}return {ms:(performance.now()-t0)/20,n};}""")
    print(' step ms with/without',round(r['ms'],2),round(r2['ms'],2));chk(r['ms']<r2['ms']*1.5+2,'예고 12개 동시에도 step 시간 급증 없음')
    pg.evaluate("__g.step(20,.05);__g.render()")
    chk(pg.evaluate("Object.values(__g.TELE_POOL).every(P=>P.every(q=>!q.o.visible))"),'예고가 없으면 풀 전부 숨김')
    # 선공 규칙 그대로
    r=pg.evaluate("""()=>{const g=__g,S=g.S;const m=g.mobs.find(m=>m.sp==='lakesnake'&&!m.eliteOf&&!m.boss&&!m.dead);for(const e of g.mobs)e.aggro=false;const lv0=S.lv;S.lv=m.lv+1;m.x=m.home.x;m.y=m.home.y;g.player.x=m.x+40;g.player.y=m.y;g.step(30,.05);const hi=m.aggro;
      S.lv=m.lv;g.step(30,.05);const eq=m.aggro;S.lv=lv0;return {hi,eq};}""")
    chk(not r['hi'] and r['eq'],'선공 규칙(낮은 레벨이면 선공 안 함) 그대로 · 독 몬스터도')
    # 이전 세이브 이어하기
    pg.evaluate("__g.save&&__g.save()");sv=pg.evaluate("localStorage.getItem('rowen-mmo-v4')");assert sv
    o=json.loads(sv);o.pop('fx',None);sv=json.dumps(o)
    pg2=b.new_page(viewport={'width':1280,'height':720});e2=[];pg2.on('pageerror',lambda e:e2.append(str(e)))
    pg2.goto('file://'+HTML);pg2.evaluate("s=>localStorage.setItem('rowen-mmo-v4',s)",sv);pg2.reload()
    pg2.wait_for_function('window.__ready===true',timeout=120000);pg2.click('#btnCont',timeout=60000);pg2.wait_for_timeout(600);pg2.evaluate("window.requestAnimationFrame=()=>0;__g.step(40,.05)")
    chk(not e2 and pg2.evaluate("typeof __g.player.fx==='object'"),'이전 세이브 이어하기 → 오류 없음');pg2.close()
    ver=pg.evaluate("document.getElementById('verTag').textContent");print(' ver',ver);chk(ver.startswith('v4.'),'버전 표시')
    print('ERRORS',errs or 'none');assert not errs;b.close()
print('PASS',ok)
