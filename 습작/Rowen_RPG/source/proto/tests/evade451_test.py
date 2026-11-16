"""v4.51 G1-b2b (지시서 §G1) 닿을 수 없는 원거리 몬스터의 회피(evade) 규칙 + 피격률 맞추기
1) 막힌 플레이어(자리 고정) + 들꽃요정 4마리 · 자동 전투 60초 → 회피 ≥1 · 투사체 ≤ 20 · 회피한 요정은 집에서 체력 가득 · 쏘지 않고 돌아감
2) 회피한 대상은 자동 전투가 8초 건너뜀(target 아님 · nearestMob 제외) · 집 도착 뒤 3초 선공 안 함
3) 돌아가는 중 맞으면 다시 싸움(회피 표시 지움) · 근접형은 회피하지 않음 · 서 있기(다가가지 않음)는 회피 없음 → 서 있기 예산 0.90~1.15 그대로
4) 무리 측정(rng_util.PACK_JS — 막힌 칸 자리 피함): 묶음 A/B × Lv5 · Lv6 — 모두 처치 · 묶음 피격률(Lv5+Lv6) 0.20~0.40 · A/B 차 ≤ 0.15 · 한 판 최대 투사체 ≤ 20
5) 이전 세이브(v4.50 형식) 이어하기 → 오류 없음 · 화면 shots/v451_evade.png · 버전"""
import os,sys
sys.path.insert(0,os.path.dirname(__file__));from fx_util import SETUP_JS;from rng_util import PACK_JS
from playwright.sync_api import sync_playwright
HTML=os.path.abspath('rowen_mmo_local.html');ARGS=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']
os.makedirs('shots',exist_ok=True)
SEED="let a=%d>>>0;Math.random=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};"
STUCK="""([n,sec,keepX])=>{const g=__g,S=g.S,P=g.player;%s
 const L=g.mobs.filter(e=>e.sp==='fairy'&&!e.boss&&!e.eliteOf).slice(0,n);for(const e of g.mobs)if(!L.includes(e)){e.dead=true;e.deadT=-1e9;e.respawn=1e9;e.aggro=false;}
 const c=L[0];if(!c._h0)c._h0={x:c.home.x,y:c.home.y};L.forEach((m,i)=>{m.home.x=c._h0.x+(i%%2)*60;m.home.y=c._h0.y+(i>>1)*60;m.x=m.home.x;m.y=m.home.y;m.dead=false;m.respawn=1e9;m.atkT=.3+i*.4;m.wind=0;m.aim=null;m.aggro=true;m.ret=false;m.evd=false;m.evU=0;m.evL=0;m.hp=m.max;});
 const px=c._h0.x+30,py=c._h0.y+150;P.x=px;P.y=py;P.hp=1e8;P.shield=0;P.mp=9999;S.hpPot=0;g.shots.length=0;g.tele.length=0;g.clearStatus();g.resetAuto();P.cd.fill(0);
 const n0=g.STAT.shotN||0,e0=g.STAT.evade||0,log=[];let maxRetHit=0;g.setAuto(true);
 for(let s=0;s<sec;s+=.05){const h=L.map(m=>m.hp);g.step(1,.05);if(keepX){P.x=px;P.y=py;}P.lastHit=1e12;if(P.hp<1e7)P.hp=1e8;
   for(const m of L){if(m.evd&&m.ret&&m.aim)log.push('aimWhileRet');if(m.evU>g.t&&g.target===m)log.push('targetEvaded');}}
 g.setAuto(false);const out={shots:(g.STAT.shotN||0)-n0,evade:(g.STAT.evade||0)-e0,log:[...new Set(log)],L:L.map(m=>({hp:m.hp,max:m.max,ret:m.ret,evd:!!m.evd,dh:Math.round(Math.hypot(m.x-m.home.x,m.y-m.home.y)),aggro:m.aggro,evL:m.evL||0,evU:m.evU||0})),t:g.t};
 return out;}"""
IDLE="""([lv,seed,beh])=>{const g=__g,S=g.S,P=g.player;let a=seed>>>0;Math.random=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
 const keep=g.MOB_B.fairy;if(beh==='melee')delete g.MOB_B.fairy;const m=g.mobs.find(e=>e.sp==='fairy'&&!e.boss&&!e.eliteOf);if(!m._h1)m._h1={x:m.home.x,y:m.home.y};m.home.x=m._h1.x;m.home.y=m._h1.y;
 for(const e of g.mobs){if(e!==m){e.aggro=false;e.ret=false;e.dead=true;e.deadT=-1e9;e.respawn=1e9;}}m.dead=false;m.lv=lv;const ms=g.mobStats(lv,false);m.atk=ms.atk;m.def=ms.def;m.max=m.hp=1e9;m.x=m.home.x;m.y=m.home.y;m.atkT=1;m.wind=0;m.aim=null;m.aggro=true;m.ret=false;
 S.autoQ=false;g.cancelNav&&g.cancelNav();m.evd=false;m.evU=0;m.evL=0;P.dead=false;const px=m.x+90,py=m.y;P.x=px;P.y=py;P.hp=1e8;P.shield=0;S.hpPot=0;g.shots.length=0;g.tele.length=0;g.setAuto(false);const e0=g.STAT.evade||0;
 for(let i=0;i<1200;i++){P.lastHit=1e12;g.step(1,.05);m.hp=1e9;P.x=px;P.y=py;m.home.x=(m.x+px)/2;m.home.y=(m.y+py)/2;if(P.hp<1e7)P.hp=1e8;}
 if(keep)g.MOB_B.fairy=keep;return [1e8-P.hp,(g.STAT.evade||0)-e0];}"""
def page(b,errs):
    pg=b.new_page(viewport={'width':1280,'height':720});pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    pg.evaluate("localStorage.clear()");pg.click('#btnStart',timeout=60000);pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0");return pg
ok=0
def chk(c,msg):
    global ok
    assert c,msg;ok+=1;print('  ok',msg)
with sync_playwright() as p:
    b=p.chromium.launch(args=ARGS);errs=[]
    pg=page(b,errs);pg.evaluate(SETUP_JS,6);pg.evaluate("__g.S.autoQ=false")
    chk(pg.evaluate("document.getElementById('verTag').textContent").startswith('v4.'),'버전 표시')
    E=pg.evaluate("__g.EVADE");chk(E['t']==4 and E['skip']==8 and E['lock']==3,'EVADE 표 %s'%E)
    # 1) 막힌 플레이어
    r=pg.evaluate(STUCK%(SEED%7),[4,60,True]);print('  INFO 막힘',r)
    chk(r['evade']>=1,'막힌 채 60초 → 회피 %d회'%r['evade'])
    chk(r['shots']<=20,'막힌 채 60초 투사체 %d발 ≤ 20 (v4.50: 120초 180발)'%r['shots'])
    chk('aimWhileRet' not in r['log'],'회피로 돌아가는 동안 조준 · 사격 안 함')
    chk('targetEvaded' not in r['log'],'회피 중인 대상은 자동 전투 타깃이 아님')
    back=[x for x in r['L'] if x['evL']>0]
    chk(back and all(x['hp']==x['max'] for x in back),'회피 뒤 집에 닿은 요정 체력 가득 (%d마리)'%len(back))
    # 2) 건너뛰기 · 선공 잠금
    q=pg.evaluate("""()=>{const g=__g,P=g.player;const m=g.mobs.find(e=>e.sp==='fairy'&&!e.boss&&!e.eliteOf);m.dead=false;m.respawn=1e9;m.x=m.home.x;m.y=m.home.y;m.hp=m.max-1;m.aggro=true;m.ret=false;P.x=m.x+90;P.y=m.y;
      g.mobEvade(m);const o={ret:m.ret,aggro:m.aggro,skip:Math.round((m.evU-g.t)*10)/10};for(let i=0;i<4;i++)g.step(1,.05);o.home=m.ret===false&&m.hp===m.max;o.lock=Math.round((m.evL-g.t)*10)/10;
      P.x=m.x+30;P.y=m.y;for(let i=0;i<10;i++)g.step(1,.05);o.aggroLock=m.aggro;o.near=!!g.nearestMob&&0;return o;}""")
    print('  INFO',q);chk(q['ret'] and not q['aggro'] and abs(q['skip']-8)<.11,'mobEvade → 돌아감 · 어그로 풀림 · 자동 전투 8초 건너뜀')
    chk(q['home'] and 2.5<q['lock']<=3.01,'집 도착 → 체력 가득 · 3초 선공 잠금')
    chk(not q['aggroLock'],'선공 잠금 중엔 30 안에 있어도 덤비지 않음')
    h=pg.evaluate("""()=>{const g=__g,P=g.player;const m=g.mobs.find(e=>e.sp==='fairy'&&!e.boss&&!e.eliteOf);m.x=m.home.x+60;m.y=m.home.y;m.aggro=true;g.mobEvade(m);g.hurtMob(m,1,false);return {aggro:m.aggro,ret:m.ret,evd:m.evd,evU:m.evU};}""")
    chk(h['aggro'] and not h['ret'] and not h['evd'] and h['evU']==0,'돌아가는 중 맞으면 다시 싸움 · 회피 표시 지움')
    mel=pg.evaluate("""()=>{const g=__g,P=g.player;const m=g.mobs.find(e=>e.sp==='rabbit'||(!g.mobB(e)&&!e.boss&&!e.eliteOf));m.dead=false;m.aggro=true;m.ret=false;const e0=g.STAT.evade||0;g.resetAuto();for(let i=0;i<200;i++){g.apWatch(m);g.step(1,.05);P.x=m.x+150;P.y=m.y;m.aggro=true;}return [g.mobBeh(m),(g.STAT.evade||0)-e0];}""")
    chk(mel[0]=='melee' and mel[1]==0,'근접형은 다가가지 못해도 회피하지 않음')
    pg.close()
    # 3) 서 있기 예산 + 회피 없음
    pg=page(b,errs)
    for lv in (5,6):
        pg.evaluate(SETUP_JS,lv);M=[pg.evaluate(IDLE,[lv,s,'melee']) for s in range(1,33)];R=[pg.evaluate(IDLE,[lv,s,'ranged']) for s in range(1,33)]
        ratio=sum(x[0] for x in R)/sum(x[0] for x in M)
        print('  INFO 서 있기 Lv%d 근접 %s · 원거리 %s'%(lv,sorted(round(x[0]) for x in M)[-4:],sorted(round(x[0]) for x in R)[-4:]))
        chk(.90<=ratio<=1.15 and sum(x[1] for x in R)==0,'Lv%d 서 있기 예산 %.3f (0.90~1.15) · 회피 0'%(lv,ratio))
    pg.close()
    # 4) 무리 측정
    G={'A':[0,0],'B':[0,0]};mx=0
    for lv in (5,6):
        pg=page(b,errs);pg.evaluate(SETUP_JS,lv)
        for name,seeds in (('A',range(1,31)),('B',range(101,131))):
            R=[pg.evaluate(PACK_JS,['fairy',lv,4,s,'ranged']) for s in seeds]
            sh=sum(x['shots'] for x in R);hi=sum(x['hits'] for x in R);G[name][0]+=hi;G[name][1]+=sh;mx=max(mx,max(x['shots'] for x in R))
            print('  INFO Lv%d 묶음%s 피격 %d/%d=%.3f · 처치 %.1f초 · 최대 %d발'%(lv,name,hi,sh,hi/max(1,sh),sum(x['sec'] for x in R)/len(R),max(x['shots'] for x in R)))
            chk(all(x['killed']==4 for x in R),'Lv%d 묶음%s 모두 처치'%(lv,name))
        pg.close()
    ra,rb=G['A'][0]/G['A'][1],G['B'][0]/G['B'][1];allr=(G['A'][0]+G['B'][0])/(G['A'][1]+G['B'][1])
    print('  INFO 묶음 A %.3f · B %.3f · 전체 %.3f'%(ra,rb,allr))
    chk(.20<=ra<=.40 and .20<=rb<=.40,'묶음 피격률 A %.3f · B %.3f (0.20~0.40)'%(ra,rb))
    chk(abs(ra-rb)<=.15,'A/B 차 %.3f ≤ 0.15'%abs(ra-rb))
    chk(mx<=20,'한 판 최대 투사체 %d ≤ 20'%mx)
    # 5) 화면 · 이어하기
    pg=page(b,errs);pg.evaluate(SETUP_JS,6);pg.evaluate("__g.S.autoQ=false")
    pg.evaluate(STUCK%(SEED%3),[3,4.6,True]);pg.evaluate("()=>{__g.snap();__g.render();}");pg.screenshot(path='shots/v451_evade.png')
    pg.evaluate("""()=>{__g.save();const k=Object.keys(localStorage).find(k=>localStorage.getItem(k).includes('"lv"'));if(k){const o=JSON.parse(localStorage.getItem(k));o.ver='v4.50';localStorage.setItem(k,JSON.stringify(o));}}""")
    pg.close()
    pg=b.new_page(viewport={'width':1280,'height':720});errs2=[];pg.on('pageerror',lambda e:errs2.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    has=pg.evaluate("!!document.getElementById('btnCont')&&!document.getElementById('btnCont').hidden")
    pg.click('#btnCont' if has else '#btnStart',timeout=60000);pg.wait_for_timeout(600);pg.evaluate("window.requestAnimationFrame=()=>0;__g.step(100,.05)")
    chk(not errs2,'이어하기 → 오류 없음 '+str(errs2[:2]))
    b.close()
chk(not errs,'페이지 오류 없음 '+str(errs[:2]))
print('evade451',ok,'ok')
