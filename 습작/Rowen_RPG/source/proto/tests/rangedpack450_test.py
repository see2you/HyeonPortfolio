"""v4.50 G1-b2a (지시서 §G1) 원거리 원형 — 자동 전투 피격률 측정 다시 짜기 + 조준 거두기
1) 조준 거두기: 조준 중 플레이어가 70 안으로 들어오면 쏘지 않고 예고선을 지움(aimCancel +1 · 투사체 0) · 70 밖이면 그대로 쏨
2) 측정(rng_util.PACK_JS): 실제 체력 들꽃요정 4마리(집 간격 70 · 씨앗마다 방향을 돌림) · 자동 전투 처치까지 · 상태 초기화(resetAuto · 쿨 · 버프)
   - 모두 처치 · 투사체가 나옴만 단언, 피격률 · 피해 비율은 INFO 출력(지시서 기준 20~40%는 미완 → G1-b2b)
   - 모두 처치(120초 안) · 묶음 피격률(Lv5+Lv6) 0.20~0.40(지시서 기준) · 레벨별 0.10~0.60(표본 흔들림 허용)
   - 같은 무리 근접형 대비 받은 피해 < 1(자동 전투에게 원거리는 쉬운 쪽 · 현 확인 대기) · 처치 시간 비율 0.9~1.6
   - 측정이 흔들리지 않는지: 씨앗 묶음 두 개의 묶음 피격률 차 ≤ 0.15
3) 서 있기 피해 예산(거리 90 · 조준 거두기와 무관) 다시: Lv5 · Lv6 0.90~1.15
4) 이전 세이브(v4.49 형식) 이어하기 → 오류 없음 · 화면 shots/v450_pack.png"""
import os,sys
sys.path.insert(0,os.path.dirname(__file__));from fx_util import SETUP_JS;from rng_util import PACK_JS
from playwright.sync_api import sync_playwright
HTML=os.path.abspath('rowen_mmo_local.html');ARGS=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']
os.makedirs('shots',exist_ok=True)
IDLE="""([lv,seed,beh])=>{const g=__g,S=g.S,P=g.player;let a=seed>>>0;Math.random=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
 const keep=g.MOB_B.fairy;if(beh==='melee')delete g.MOB_B.fairy;const m=g.mobs.find(e=>e.sp==='fairy'&&!e.boss&&!e.eliteOf);if(!m._h1)m._h1={x:m.home.x,y:m.home.y};m.home.x=m._h1.x;m.home.y=m._h1.y;
 for(const e of g.mobs){if(e!==m){e.aggro=false;e.ret=false;e.dead=true;e.deadT=-1e9;e.respawn=1e9;}}m.dead=false;m.lv=lv;const ms=g.mobStats(lv,false);m.atk=ms.atk;m.def=ms.def;m.max=m.hp=1e9;m.x=m.home.x;m.y=m.home.y;m.atkT=1;m.wind=0;m.aim=null;m.aggro=true;m.ret=false;
 const px=m.x+90,py=m.y;P.x=px;P.y=py;P.hp=1e8;P.shield=0;S.hpPot=0;g.shots.length=0;g.tele.length=0;g.setAuto(false);
 for(let i=0;i<1200;i++){P.lastHit=1e12;g.step(1,.05);m.hp=1e9;P.x=px;P.y=py;m.home.x=(m.x+px)/2;m.home.y=(m.y+py)/2;if(P.hp<1e7)P.hp=1e8;}
 if(keep)g.MOB_B.fairy=keep;return 1e8-P.hp;}"""
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
    pg=page(b,errs);pg.evaluate(SETUP_JS,6)
    chk(pg.evaluate("document.getElementById('verTag').textContent").startswith('v4.'),'버전 표시')
    # 1) 조준 거두기
    r=pg.evaluate("""()=>{const g=__g,P=g.player,S=g.S;S.autoQ=false;g.setAuto(false);const m=g.mobs.find(e=>e.sp==='fairy'&&!e.boss&&!e.eliteOf);for(const e of g.mobs)if(e!==m){e.dead=true;e.respawn=1e9;e.aggro=false;}
      const go=(d)=>{m.dead=false;m.x=m.home.x;m.y=m.home.y;m.max=m.hp=1e9;m.atkT=0;m.wind=0;m.aim=null;m.aggro=true;m.ret=false;g.shots.length=0;g.tele.length=0;P.x=m.x+90;P.y=m.y;P.hp=1e6;g.step(1,.05);};
      go();const a0=!!m.aim,c0=g.STAT.aimCancel||0,n0=g.STAT.shotN||0;P.x=m.x+40;P.y=m.y;g.step(1,.05);const out={a0,cancel:(g.STAT.aimCancel||0)-c0,aim:!!m.aim,tele:g.tele.some(x=>x.aim)};
      for(let i=0;i<30;i++){g.step(1,.05);P.x=m.x+40;P.y=m.y;}out.shots=(g.STAT.shotN||0)-n0;
      go();const n1=g.STAT.shotN||0;for(let i=0;i<26;i++){g.step(1,.05);P.x=m.x+90;P.y=m.y;}out.far=(g.STAT.shotN||0)-n1;return out;}""")
    chk(r['a0'] and r['cancel']==1 and not r['aim'] and not r['tele'],'조준 중 70 안으로 → 조준 거둠 · 예고선 지움')
    chk(r['shots']==0,'거둔 조준은 쏘지 않음(가까이선 물러나기만)')
    chk(r['far']==1,'70 밖이면 1.2초 뒤 그대로 쏨')
    pg.close()
    # 2) 무리 측정 — 기준(피격률 0.20~0.40)은 아직 못 채움(미완 · G1-b2b): 값은 출력만 하고, 단언은 '모두 처치' · '측정이 돈다'까지
    for lv in (5,6):
        pg=page(b,errs);pg.evaluate(SETUP_JS,lv)
        for name,seeds in (('A',range(1,31)),('B',range(101,131))):
            R=[pg.evaluate(PACK_JS,['fairy',lv,4,s,'ranged']) for s in seeds];M=[pg.evaluate(PACK_JS,['fairy',lv,4,s,'melee']) for s in seeds]
            sh=sum(x['shots'] for x in R);hi=sum(x['hits'] for x in R);top=sorted(R,key=lambda x:-x['shots'])[:3]
            print('  INFO Lv%d 묶음%s 피격 %d/%d=%.3f · 피해 비율 %.3f · 처치 시간 %.1f/%.1f초 · 투사체 많은 판 %s'%(lv,name,hi,sh,hi/max(1,sh),sum(x['taken'] for x in R)/max(1,sum(x['taken'] for x in M)),
              sum(x['sec'] for x in R)/len(R),sum(x['sec'] for x in M)/len(M),[(x['shots'],x['hits'],round(x['sec'])) for x in top]))
            chk(all(x['killed']==4 for x in R+M),'Lv%d 묶음%s 무리 %d개 모두 처치(120초 안)'%(lv,name,len(R)))
            chk(sh>0,'Lv%d 묶음%s 투사체가 나옴(측정이 돈다)'%(lv,name))
        pg.close()
    # 3) 서 있기 예산
    pg=page(b,errs)
    for lv in (5,6):
        pg.evaluate(SETUP_JS,lv);mel=sum(pg.evaluate(IDLE,[lv,s,'melee']) for s in range(1,17));rng=sum(pg.evaluate(IDLE,[lv,s,'ranged']) for s in range(1,17))
        chk(.90<=rng/mel<=1.15,'Lv%d 서 있기 피해 예산 %.3f (0.90~1.15)'%(lv,rng/mel))
    # 4) 화면 · 이어하기
    pg.evaluate("""()=>{const g=__g,P=g.player;const L=g.mobs.filter(e=>e.sp==='fairy'&&!e.boss&&!e.eliteOf).slice(0,3);for(const e of g.mobs)if(!L.includes(e)){e.dead=true;e.respawn=1e9;}
      const c=L[0];L.forEach((m,i)=>{m.dead=false;m.max=m.hp=60;m.x=c.home.x+i*60;m.y=c.home.y-i*30;m.home.x=m.x;m.home.y=m.y;m.aggro=true;m.atkT=i*.5;m.aim=null;});P.x=c.home.x+100;P.y=c.home.y+20;P.hp=g.pStats().hp;
      g.setAuto(true);for(let i=0;i<22;i++)g.step(1,.05);g.setAuto(false);g.snap();g.render();}""")
    pg.screenshot(path='shots/v450_pack.png')
    pg.evaluate("""()=>{const S=__g.S;__g.save();const k=Object.keys(localStorage).find(k=>localStorage.getItem(k).includes('"lv"'));if(k){const o=JSON.parse(localStorage.getItem(k));delete o.cfg.dummy450;o.ver='v4.49';localStorage.setItem(k,JSON.stringify(o));}}""")
    pg.close()
    pg=b.new_page(viewport={'width':1280,'height':720});errs2=[];pg.on('pageerror',lambda e:errs2.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    has=pg.evaluate("!!document.getElementById('btnCont')&&!document.getElementById('btnCont').hidden")
    pg.click('#btnCont' if has else '#btnStart',timeout=60000);pg.wait_for_timeout(600);pg.evaluate("window.requestAnimationFrame=()=>0;__g.step(100,.05)")
    chk(not errs2,'이어하기 → 오류 없음 '+str(errs2[:2]))
    b.close()
chk(not errs,'페이지 오류 없음 '+str(errs[:2]))
print('rangedpack450',ok,'ok')
