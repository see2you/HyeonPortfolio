"""v4.49 G1-b1 (지시서 §G1) 원거리 원형 + 몬스터 투사체 — 들꽃요정(로웬 도토리 숲 Lv5~6) 먼저
1) 배정: MOB_B에서 원거리는 들꽃요정 하나 · 솜꼬리 들판(z1) 종은 전부 근접 · 들꽃요정 체력 ×0.8 · 다른 종 그대로
2) 조준: 거리 110 안 → 가는 예고선(line w4 · aim) · dangerAt은 조준선을 위험으로 보지 않음 · 1.2초 뒤 투사체 · 예고선 사라짐
3) 투사체: 가만히 있으면 맞음(피해 > 0 · shotHit +1) · 쏘는 순간 옆으로 비켜 있으면 0 · 사거리 끝에서 사라짐
4) 물러남: 70 안이면 물러남(멀어짐) · 집에서 150 넘으면 더 안 물러나고 근접으로 할큄
5) 정리: 조준 중 처치 → 예고선 지움 · 사망/지역 이동 → 투사체 지움 · 어그로 풀림 → 조준 취소
6) 자동 회피: 투사체 길은 자동 전투에 0.3초 뒤부터 위험 · 수동이면 끼어들지 않음
7) 피해 예산: 서 있기 60초 원거리 ÷ 근접(같은 종 · 같은 레벨, 씨앗 16개) = 0.90~1.15 (Lv5 · Lv6) · 자동 전투 피격률은 출력만(v4.50: 측정은 rangedpack450_test.py로 옮김)
8) 투사체 16개 동시 step 시간 · 이전 세이브 이어하기 · 화면(예고선 + 투사체 · 버전) shots/v449_*.png"""
import os,sys,time
sys.path.insert(0,os.path.dirname(__file__));from fx_util import SETUP_JS
from playwright.sync_api import sync_playwright
HTML=os.path.abspath('rowen_mmo_local.html');ARGS=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']
os.makedirs('shots',exist_ok=True)
PREP="""(d)=>{const g=__g,S=g.S,P=g.player;S.autoQ=false;g.setAuto(false);const m=g.mobs.find(e=>e.sp==='fairy'&&!e.boss&&!e.eliteOf);if(!m._h0)m._h0={x:m.home.x,y:m.home.y};m.home.x=m._h0.x;m.home.y=m._h0.y;
  for(const e of g.mobs){if(e!==m){e.aggro=false;e.ret=false;e.dead=true;e.deadT=-1e9;e.respawn=1e9;}}m.dead=false;m.x=m.home.x;m.y=m.home.y;m.atkT=0;m.wind=0;m.aim=null;m.aggro=true;m.ret=false;m.max=m.hp=1e9;
  g.shots.length=0;g.tele.length=0;P.x=m.x+d;P.y=m.y;P.hp=1e6;P.shield=0;P.dash=0;g.clearStatus();window.__m=m;return {x:m.x,y:m.y};}"""
RUN="""([lv,sec,seed,beh,auto])=>{const g=__g,S=g.S,P=g.player;let a=seed>>>0;if(seed<0){const K=[.5,.31,.77,.12,.64,.45,.58,.23][(-seed)%8];Math.random=()=>K;}else Math.random=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
 const keep=g.MOB_B.fairy;if(beh==='melee')delete g.MOB_B.fairy;
 const m=g.mobs.find(e=>e.sp==='fairy'&&!e.boss&&!e.eliteOf);if(!m._h0)m._h0={x:m.home.x,y:m.home.y};m.home.x=m._h0.x;m.home.y=m._h0.y;for(const e of g.mobs){if(e!==m){e.aggro=false;e.ret=false;e.dead=true;e.deadT=-1e9;e.respawn=1e9;}}
 m.dead=false;m.lv=lv;const ms=g.mobStats(lv,false);m.atk=ms.atk;m.def=ms.def;m.max=m.hp=1e9;m.x=m.home.x;m.y=m.home.y;m.atkT=1;m.wind=0;m.aim=null;m.aggro=true;m.ret=false;
 const px=m.x+90,py=m.y;P.x=px;P.y=py;P.hp=1e8;P.shield=0;P.mp=9999;S.hpPot=0;g.shots.length=0;g.tele.length=0;const n0=g.STAT.shotN||0,h0=g.STAT.shotHit||0;
 g.setAuto(!!auto);if(auto)g.setTarget(m);
 for(let i=0;i<sec*20;i++){P.lastHit=1e12;g.step(1,.05);m.hp=1e9;if(!auto){P.x=px;P.y=py;m.home.x=(m.x+px)/2;m.home.y=(m.y+py)/2;}if(P.hp<1e7)P.hp=1e8;}
 const taken=1e8-P.hp;if(keep)g.MOB_B.fairy=keep;g.setAuto(false);return {taken,shots:(g.STAT.shotN||0)-n0,hits:(g.STAT.shotHit||0)-h0};}"""
ok=0
def chk(c,msg):
    global ok
    assert c,msg;ok+=1;print('  ok',msg)
with sync_playwright() as p:
    b=p.chromium.launch(args=ARGS);pg=b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    pg.evaluate("localStorage.clear()");pg.click('#btnStart',timeout=60000);pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    chk(pg.evaluate("__g.GAME_VER||document.getElementById('verTag').textContent").startswith('v4.'),'버전 표시')
    # 1) 배정 · 체력
    r=pg.evaluate("""()=>{const g=__g;const ranged=Object.keys(g.MOB_B).filter(k=>g.MOB_B[k].b==='ranged');const z1=g.MAPS.rowen.zones.z1.mobs.map(x=>x[0]);
      const f=g.mobs.filter(m=>m.sp==='fairy'&&!m.boss&&!m.eliteOf),o=g.mobs.filter(m=>m.zone==='z2'&&m.sp!=='fairy'&&!m.boss&&!m.eliteOf);
      return {ranged,z1b:z1.map(s=>g.mobBeh({sp:s})),fk:f.map(m=>m.max/g.mobStats(m.lv,false).hp),ok:o.map(m=>m.max/g.mobStats(m.lv,false).hp)};}""")
    chk('fairy' in r['ranged'] and all(k in ('fairy','mist','embertree','cavemush','mosswisp','flamewisp') for k in r['ranged']),'원거리 배정에 들꽃요정 · 지시서 6종 밖은 없음(v4.52부터 안개정령 · 불티나무도) '+str(r['ranged']))
    chk(all(b=='melee' for b in r['z1b']),'솜꼬리 들판 종은 전부 근접')
    chk(r['fk'] and all(abs(k-.8)<.03 for k in r['fk']),'들꽃요정 체력 ×0.8 '+str([round(k,3) for k in r['fk'][:3]]))
    chk(r['ok'] and all(abs(k-1)<.03 for k in r['ok']),'도토리 숲 다른 종 체력 그대로')
    pg.evaluate(SETUP_JS,6)
    # 2) 조준
    pg.evaluate(PREP,90)
    r=pg.evaluate("""()=>{const g=__g,P=g.player,m=window.__m;g.step(1,.05);const e=g.tele.find(x=>x.aim);const dz=g.dangerAt(P.x,P.y,8,false);
      const out={aim:!!e,kind:e&&e.kind,w:e&&e.w,dz:!!dz,shots0:g.shots.length};for(let i=0;i<22;i++){g.step(1,.05);P.x=m.x+90;P.y=m.y;}out.shotsMid=g.shots.length;
      for(let i=0;i<3;i++){g.step(1,.05);P.x=m.x+90;P.y=m.y;}out.aimAfter=g.tele.some(x=>x.aim);out.shotsEnd=g.STAT.shotN;return out;}""")
    chk(r['aim'] and r['kind']=='line' and r['w']==4,'조준 시작 → 가는 직선 예고선')
    chk(not r['dz'],'조준선은 위험 판정에 안 듦')
    chk(r['shotsMid']==0,'1.2초 전에는 쏘지 않음')
    chk(not r['aimAfter'],'조준 끝 → 예고선 사라짐')
    # 3) 투사체 맞음 / 비킴
    r=pg.evaluate("""()=>{const g=__g,P=g.player,m=window.__m;const px=P.x,py=P.y,h0=g.STAT.shotHit||0;P.hp=1e6;for(let i=0;i<20;i++){g.step(1,.05);P.x=px;P.y=py;}return {taken:1e6-P.hp,hit:(g.STAT.shotHit||0)-h0};}""")
    chk(r['hit']>=1 and r['taken']>0,'가만히 있으면 투사체에 맞음 (명중 '+str(r['hit'])+')')
    pg.evaluate(PREP,90)
    r=pg.evaluate("""()=>{const g=__g,P=g.player,m=window.__m;for(let i=0;i<24;i++){g.step(1,.05);P.x=m.x+90;P.y=m.y;}while(!g.shots.length)g.step(1,.01);P.y+=40;P.hp=1e6;const h0=g.STAT.shotHit||0;
      let maxD=0,gone=-1;for(let i=0;i<30;i++){g.step(1,.05);P.x=m.x+90;P.y=m.y+40;if(g.shots[0])maxD=g.shots[0].d;else if(gone<0)gone=i;}return {taken:1e6-P.hp,hit:(g.STAT.shotHit||0)-h0,maxD,gone,max:g.RANGED.range*g.RANGED.fly};}""")
    chk(r['hit']==0 and r['taken']==0,'쏘는 순간 비켜 있으면 피해 0')
    chk(r['gone']>=0 and r['maxD']<=r['max']+1,'사거리 끝에서 사라짐 (%.0f/%.0f)'%(r['maxD'],r['max']))
    # 4) 물러남 · 몰리면 근접
    pg.evaluate(PREP,40)
    r=pg.evaluate("""()=>{const g=__g,P=g.player,m=window.__m;m.atkT=2;const d0=Math.hypot(m.x-P.x,m.y-P.y);for(let i=0;i<10;i++){g.step(1,.05);P.x=m.home.x+40;P.y=m.home.y;}const d1=Math.hypot(m.x-P.x,m.y-P.y);
      m.x=m.home.x-152;m.y=m.home.y;P.x=m.x+20;P.y=m.y;m.atkT=0;m.wind=0;const x0=m.x;let wind=false;P.hp=1e6;for(let i=0;i<30;i++){g.step(1,.05);P.x=m.x+20;P.y=m.y;if(m.wind>0)wind=true;}
      return {d0,d1,wind,moved:Math.abs(m.x-x0),taken:1e6-P.hp,aim:!!m.aim};}""")
    chk(r['d1']>r['d0']+5,'70 안이면 물러남 (%.0f→%.0f)'%(r['d0'],r['d1']))
    chk(r['wind'] and r['taken']>0,'집에서 150 밖에 몰리면 근접으로 할큄')
    # 5) 정리
    pg.evaluate(PREP,90)
    r=pg.evaluate("""()=>{const g=__g,P=g.player,m=window.__m;g.step(1,.05);const a=g.tele.some(x=>x.aim);m.hp=1;g.hurtMob?g.hurtMob(m,999,true):(m.dead=true);if(!m.dead)m.dead=true;g.step(1,.05);const b=g.tele.some(x=>x.aim);return {a,b};}""")
    chk(r['a'] and not r['b'],'조준 중 처치 → 예고선 지움')
    pg.evaluate(PREP,90)
    r=pg.evaluate("""()=>{const g=__g,P=g.player,m=window.__m;g.step(1,.05);const a=!!m.aim;m.x=m.home.x+220;P.x=m.x+60;P.y=m.y;for(let i=0;i<3;i++)g.step(1,.05);return {a,aggro:m.aggro,aim:!!m.aim,tele:g.tele.some(x=>x.aim)};}""")
    chk(r['a'] and not r['aggro'] and not r['aim'] and not r['tele'],'어그로 풀림 → 조준 취소')
    pg.evaluate(PREP,90)
    r=pg.evaluate("""()=>{const g=__g,P=g.player,m=window.__m;for(let i=0;i<10;i++)g.mobShoot(m,P.x,P.y);const n=g.shots.length;P.hp=1;g.hurtPlayer(9999,m);const after=g.shots.length;
      const dead=P.dead;return {n,after,dead};}""")
    chk(r['n']==10 and r['after']==0,'사망 → 투사체 지움')
    pg.evaluate("()=>{const g=__g;if(g.player.dead)g.revive();}");pg.wait_for_timeout(300);pg.evaluate("__g.step(40,.05)")
    pg.evaluate("()=>{const g=__g,P=g.player,m=window.__m;for(let i=0;i<5;i++)g.mobShoot(m,P.x+3,P.y);}")
    r=pg.evaluate("async()=>{const g=__g;const n=g.shots.length;await g.doTravel('kardo');return {n,after:g.shots.length,map:g.map};}")
    chk(r['n']>=5 and r['after']==0,'지역 이동 → 투사체 지움 ('+str(r['map'])+')')
    r=pg.evaluate("async()=>{const g=__g;await g.doTravel('rowen');return g.map;}")
    pg.evaluate(SETUP_JS,6)
    # 6) 자동 회피
    pg.evaluate(PREP,90)
    r=pg.evaluate("""()=>{const g=__g,P=g.player,m=window.__m;m.aggro=false;m.atkT=99;g.mobShoot(m,P.x,P.y);const a0=!!g.dangerAt(P.x,P.y,8,true),m0=!!g.dangerAt(P.x,P.y,8,false);
      g.shotTick(.31);const s=g.shots[0];const a1=!!(s&&g.dangerAt(P.x,P.y,8,true));g.shots.length=0;
      g.mobShoot(m,P.x,P.y);const x0=P.x,y0=P.y;for(let i=0;i<12;i++)g.step(1,.05);const manualMoved=Math.hypot(P.x-x0,P.y-y0);return {a0,m0,a1,manualMoved};}""")
    chk(r['m0'] and not r['a0'],'투사체 길: 바로 위험 · 자동 전투는 0.3초 전엔 안 봄')
    chk(r['a1'],'0.3초 뒤 자동 전투가 투사체 길을 피함')
    chk(r['manualMoved']<1,'수동 조작이면 자동 회피가 끼어들지 않음')
    # 7) 피해 예산
    rows=[];pgM=pg;pg=b.new_page(viewport={'width':1280,'height':720});pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000);pg.evaluate("localStorage.clear()");pg.click('#btnStart',timeout=60000);pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    for lv in (5,6):
        pg.evaluate(SETUP_JS,lv)
        mel=[pg.evaluate(RUN,[lv,60,s,'melee',0]) for s in range(1,33)];rng=[pg.evaluate(RUN,[lv,60,s,'ranged',0]) for s in range(1,33)]
        au=[pg.evaluate(RUN,[lv,60,s,'ranged',1]) for s in range(1,17)];am=[pg.evaluate(RUN,[lv,60,s,'melee',1]) for s in range(1,17)]
        ratio=sum(x['taken'] for x in rng)/sum(x['taken'] for x in mel);sh=sum(x['shots'] for x in au);hi=sum(x['hits'] for x in au);ar=sum(x['taken'] for x in au)/sum(x['taken'] for x in am)
        rows.append((lv,round(ratio,3),hi,sh,round(hi/max(1,sh),3),round(ar,3)));print('  budget lv',lv,'idle ratio',round(ratio,3),'auto hit',hi,'/',sh,round(hi/max(1,sh),3),'auto ratio',round(ar,3))
        chk(.90<=ratio<=1.15,'Lv%d 서 있기 피해 예산 %.3f (0.90~1.15)'%(lv,ratio))
        print('  INFO Lv%d 무적 요정 쫓기 피격률 %.2f — v4.50부터 피격률은 rangedpack450(실제 무리 처치까지)이 잰다'%(lv,hi/max(1,sh)))
        chk(sh>0,'Lv%d 자동 전투 중 투사체가 나옴'%lv)
        chk(ar<1,'Lv%d 자동 전투 피해가 근접형보다 적음 %.3f'%(lv,ar))
    # 8) 16개 step 시간 · 화면 · 이어하기
    pg.close();pg=pgM
    pg.evaluate(PREP,90)
    r=pg.evaluate("""()=>{const g=__g,P=g.player,m=window.__m;m.aggro=false;m.atkT=99;for(let i=0;i<20;i++)g.mobShoot(m,P.x+(i%5)*30-60,P.y+(i%4)*30-45);const n=g.shots.length;const t0=performance.now();for(let i=0;i<100;i++){g.shotTick(.0005);}return {n,ms:(performance.now()-t0)/100};}""")
    chk(r['n']==16,'투사체 풀 16개 상한')
    chk(r['ms']<2,'투사체 16개 한 틱 %.3fms'%r['ms'])
    pg.evaluate(PREP,95)
    pg.evaluate("""()=>{const g=__g,P=g.player,m=window.__m;m.max=m.hp=60;g.setTarget&&g.setTarget(m);for(let i=0;i<14;i++){g.step(1,.05);P.x=m.x+95;P.y=m.y;}g.mobShoot(m,P.x,P.y);g.shotTick(.2);m.atkT=0;g.step(1,.05);for(let i=0;i<10;i++){g.step(1,.05);P.x=m.x+95;P.y=m.y;}
      const m2=g.mobs.find(e=>e.sp==='fairy'&&e!==m);if(m2){m2.dead=false;m2.x=m.x+30;m2.y=m.y-40;m2.aggro=true;m2.atkT=0;m2.aim=null;}g.step(1,.05);g.snap();g.render();}""")
    pg.screenshot(path='shots/v449_ranged.png')
    vis=pg.evaluate("()=>({tele:__g.tele.filter(x=>x.aim).length,shots:__g.shots.length,ver:document.getElementById('verTag').textContent})")
    print('  screen',vis);chk(vis['tele']>=1 and vis['shots']>=1,'화면: 예고선 + 투사체가 함께')
    pg.evaluate("__g.save&&__g.save()")
    pg.close()
    pg=b.new_page(viewport={'width':1280,'height':720});errs2=[];pg.on('pageerror',lambda e:errs2.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    has=pg.evaluate("!!document.getElementById('btnCont')&&!document.getElementById('btnCont').hidden")
    if has:pg.click('#btnCont',timeout=60000)
    else:pg.click('#btnStart',timeout=60000)
    pg.wait_for_timeout(600);pg.evaluate("window.requestAnimationFrame=()=>0;__g.step(100,.05)")
    chk(not errs2,'이어하기 → 오류 없음 '+str(errs2[:2]))
    b.close()
chk(not errs,'페이지 오류 없음 '+str(errs[:2]))
print('ranged449',ok,'ok')
print('TABLE',rows)
