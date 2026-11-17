"""v4.62 G1-e1 (지시서 §G1) 상태이상 화상 · 둔화 · 기절 — 각 1종 첫 배정
1) 배정: 용암도마뱀 화상(근접) · 안개정령 둔화(투사체만) · 초원황소 기절(돌진 명중만) · fxBy 거름
2) 화상: 초당 건 몬스터 공격력 ×0.05 고정(방어 무시) · 4초 · 갱신(중첩 없음)
3) 둔화: 이동 ×0.6 · 공격 속도 ×0.8 · 3초
4) 기절: 0.8초 · 이동 · 평타 · 스킬 불가 · 물약 자동 사용은 됨 · 같은 개체 6초 면역 · 다른 개체는 걸림
5) 피해 예산: 용암도마뱀(화상) 60초 서 있기 ÷ 화상 없음 = 0.90~1.15 (Lv13 · 14 로웬 · Lv34 · 35 에르나, 씨앗 8개)
6) HUD 아이콘 3종 · 사망/지역 이동 해제 · 이전 세이브 이어하기 · 버전 (shots/v462_*.png)"""
import os,sys,json
sys.path.insert(0,os.path.dirname(__file__));from fx_util import SETUP_JS,DUEL_JS
from playwright.sync_api import sync_playwright
HTML=os.path.abspath('rowen_mmo_local.html');ARGS=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']
ok=0
def chk(c,msg):
    global ok
    assert c,msg;ok+=1;print('  ok',msg)
def page(b):
    pg=b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    pg.evaluate("localStorage.clear()");pg.click('#btnStart',timeout=60000);pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0");return pg,errs
def travel(pg,mp):
    pg.evaluate("__g.doTravel('%s',null,{quiet:true,now:true})"%mp);pg.wait_for_function("!__g.traveling&&__g.MAPID==='%s'"%mp,timeout=120000)
with sync_playwright() as p:
    b=p.chromium.launch(args=ARGS);pg,errs=page(b)
    # 1) 배정
    r=pg.evaluate("""()=>{const g=__g,B=g.MOB_B;return {lz:B.lavalizard.fx,mi:[B.mist.fx,B.mist.fxBy],bu:[B.bull.fx,B.bull.fxBy],defs:['burn','slow','stun'].every(k=>g.FXDEF[k]&&g.FXDEF[k].ic)}}""")
    print(' assign',r)
    chk(r['lz']=='burn' and r['mi']==['slow','shot'] and r['bu']==['stun','charge'] and r['defs'],'배정: 용암도마뱀 화상 · 안개정령 둔화(투사체) · 초원황소 기절(돌진)')
    r=pg.evaluate("""()=>{const g=__g;g.clearStatus();const m={sp:'bull',lv:8,name:'초원황소',atk:20};const a=g.mobFx(m,'melee');const b=g.fxOn('stun');g.clearStatus();const m2={sp:'mist',lv:26,name:'안개정령',atk:20};
      let melee=0;for(let i=0;i<40;i++){if(g.mobFx(m2,'melee'))melee++;g.clearStatus();}let shot=0;for(let i=0;i<400;i++){if(g.mobFx(m2,'shot'))shot++;g.clearStatus();}return {a,b,melee,shot};}""")
    print(' fxBy',r)
    chk(not r['a'] and not r['b'],'초원황소 근접 타격으로는 기절 안 걸림(fxBy charge)')
    chk(r['melee']==0 and 60<=r['shot']<=140,'안개정령 근접은 둔화 없음 · 투사체 명중 25%% (%d/400)'%r['shot'])
    # 2) 화상
    r=pg.evaluate("""()=>{const g=__g,P=g.player,st=g.pStats();for(const m of g.mobs)m.aggro=false;P.hp=st.hp;P.lastHit=1e12;g.clearStatus();g.addFx('burn',{name:'용암도마뱀',atk:200});const h0=P.hp;
      g.step(20,.05);const a1=h0-P.hp;g.step(30,.05);g.addFx('burn',{name:'용암도마뱀',atk:200});const u=P.fx.burn.until-g.t;g.step(200,.05);const tot=h0-P.hp;const after=g.fxOn('burn');
      P.hp=st.hp;const d0=g.S.lv;g.addFx('burn',{name:'x',atk:200});const hb=P.hp;const sv=g.pStats;g.step(20,.05);const a2=hb-P.hp;g.clearStatus();P.hp=st.hp;return {a1,tot,u,after,a2};}""")
    print(' burn',r)
    chk(abs(r['a1']-10)<.01,'화상 1초 = 공격력 200 × 0.05 = 10 (방어 무시 고정)')
    chk(abs(r['u']-4)<.06,'다시 걸리면 지속만 4초로 갱신')
    chk(abs(r['tot']-10*6)<.01,'갱신해도 중첩 없음(2.5초 뒤 갱신 → 총 6틱)')
    chk(not r['after'],'지속 끝나면 해제')
    # 3) 둔화
    r=pg.evaluate("""()=>{const g=__g,P=g.player;g.clearStatus();const a=g.pSPD();g.addFx('slow',{name:'안개정령'});const b=g.pSPD();P.atkT=1;g.step(10,.05);const at=P.atkT;const u=P.fx.slow.until-g.t;g.step(60,.05);const c=g.pSPD(),off=g.fxOn('slow');return {a,b,at,u,c,off};}""")
    print(' slow',r)
    chk(abs(r['b']/r['a']-.6)<1e-6,'둔화 이동 속도 ×0.6');chk(abs(r['at']-(1-.5*.8))<.02,'둔화 공격 속도 −20%%(0.5초에 공격 대기 0.4만 줄어듦: %.3f)'%r['at'])
    chk(not r['off'] and abs(r['c']-r['a'])<1e-6,'3초 뒤 해제 · 속도 되돌아옴')
    # 4) 기절
    r=pg.evaluate("""()=>{const g=__g,P=g.player,S=g.S,st=g.pStats();g.clearStatus();for(const e of g.mobs)e.aggro=false;const m=g.mobs.find(e=>!e.dead&&!e.boss&&!e.eliteOf);P.x=m.x+14;P.y=m.y;P.atkT=0;P.cd=P.cd.map(()=>0);P.mp=999;g.setTarget(m);
      const m1={sp:'bull',lv:8,name:'초원황소',atk:20},m2={sp:'bull',lv:8,name:'초원황소',atk:20};const a=g.mobFx(m1,'charge');const on=g.fxOn('stun');const ba=g.basicAttack(m);const ca=g.castSkill(1,true);
      S.autoPot=true;S.hpPot=5;P.potT=0;P.hp=st.hp*.2;P.lastHit=g.t;g.setAuto(true);const x0=P.x,y0=P.y,n0=S.hpPot;g.step(4,.05);const moved=Math.hypot(P.x-x0,P.y-y0),pot=n0-S.hpPot;
      g.step(14,.05);const off=!g.fxOn('stun');g.setAuto(false);const again=g.mobFx(m1,'charge');g.clearStatus();const other=g.mobFx(m2,'charge');g.clearStatus();g.step(110,.05);g.clearStatus();const later=g.mobFx(m1,'charge');g.clearStatus();P.hp=st.hp;
      return {a,on,ba,ca,moved,pot,off,again,other,later};}""")
    print(' stun',r)
    chk(r['a'] and r['on'],'돌진 명중 → 기절(100%)');chk(not r['ba'] and not r['ca'],'기절 중 평타 · 스킬 불가')
    chk(r['moved']<.01,'기절 중 자동 전투도 움직이지 않음');chk(r['pot']>=1,'기절 중에도 물약 자동 사용')
    chk(r['off'],'0.8초 뒤 풀림');chk(not r['again'] and r['other'] and r['later'],'같은 개체 6초 면역 · 다른 개체는 걸림 · 6초 지나면 다시')
    r=pg.evaluate("""()=>{const g=__g;g.clearStatus();const m=g.mobs.find(e=>e.sp==='bull'&&!e.boss&&!e.eliteOf)||g.mobs.find(e=>!e.boss&&!e.eliteOf);const e=g.teleAdd({kind:'line',x:m.x,y:m.y,a:0,len:100,w:22,dur:.27,aim:false,keep:true,ownC:m});
      m.chg={ph:'aim',t:.6,lk:true,L:.27,e};g.addFx('stun',{name:'초원황소'});const un=!m.chg.lk&&e.aim===true&&m.chg.t<.8-.27;m.chg=null;g.tele.length=0;g.clearStatus();return {un,L:g.MOB_B.bull.lj};}""")
    print(' hold',r);chk(r['un'],'기절이 걸리면 이미 고정된 다른 돌진 예고를 따라가기로 되돌림(기절 중 고정 보류 · 풀린 뒤 반응할 틈)');chk(abs(r['L']-.025)<1e-9,'초원황소 고정 시간 0.27~0.295초 무작위(lj 0.025)')
    # 6) HUD
    pg.evaluate("__g.clearStatus();__g.addFx('burn',{name:'a',atk:1});__g.addFx('slow',{name:'b'});__g.addFx('poison',{name:'c'});__g.step(6,.05)")
    print(' dbg',pg.evaluate("({dead:__g.player.dead,fx:Object.keys(__g.player.fx),modal:!!__g.modal})"))
    tx=pg.evaluate("document.getElementById('fxRow').textContent");print(' hud',tx)
    chk(pg.evaluate("!document.getElementById('fxRow').hidden") and '♨' in tx and '≈' in tx and '☠' in tx,'HP 바 위 아이콘(화상 · 둔화 · 독) + 남은 초')
    pg.evaluate("__g.snap();__g.render()");pg.screenshot(path='shots/v462_상태이상.png');pg.screenshot(path='shots/v462_상태이상_확대.png',clip={'x':0,'y':0,'width':420,'height':120})
    pg.evaluate("__g.addFx('stun',{name:'d'});__g.step(4,.05)");chk('✶' in pg.evaluate("document.getElementById('fxRow').textContent"),'기절 아이콘')
    travel(pg,'kardo');chk(pg.evaluate("!__g.fxOn('burn')&&!__g.fxOn('slow')"),'지역 이동 시 해제')
    travel(pg,'rowen')
    # 5) 피해 예산
    for mp,lvs in (('rowen',(13,14)),('erna',(34,35))):
        if mp!='rowen':travel(pg,mp)
        for lv in lvs:
            pg.evaluate(SETUP_JS,lv);A=B=C=0;pr=0
            for seed in range(1,9):
                a=pg.evaluate(DUEL_JS,['lavalizard',lv,60,seed,True]);c=pg.evaluate(DUEL_JS,['lavalizard',lv,60,seed,False]);A+=a['taken'];B+=a['melee'];C+=c['taken'];pr+=a['procs']
            print(' budget',mp,lv,'same %.3f nofx %.3f procs %d/480s'%(A/B,A/C,pr))
            chk(.90<=A/B<=1.15,'피해 예산 Lv%d 용암도마뱀 화상 ÷ 근접 = %.3f (0.90~1.15)'%(lv,A/B))
            chk(.85<=A/C<=1.20,'화상 없는 판 대비 %.3f'%(A/C))
    # 이전 세이브
    pg.evaluate("__g.save&&__g.save()");sv=pg.evaluate("localStorage.getItem('rowen-mmo-v4')");o=json.loads(sv);sv=json.dumps(o)
    pg2=b.new_page(viewport={'width':1280,'height':720});e2=[];pg2.on('pageerror',lambda e:e2.append(str(e)))
    pg2.goto('file://'+HTML);pg2.evaluate("s=>localStorage.setItem('rowen-mmo-v4',s)",sv);pg2.reload();pg2.wait_for_function('window.__ready===true',timeout=120000);pg2.click('#btnCont',timeout=60000);pg2.wait_for_timeout(600);pg2.evaluate("window.requestAnimationFrame=()=>0;__g.step(40,.05)")
    chk(not e2,'이전 세이브 이어하기 → 오류 없음(새 저장 필드 없음)');pg2.close()
    ver=pg.evaluate("document.getElementById('verTag').textContent");print(' ver',ver);chk(ver.startswith('v4.'),'버전 표시')
    print('ERRORS',errs or 'none');assert not errs;b.close()
print('PASS',ok)
