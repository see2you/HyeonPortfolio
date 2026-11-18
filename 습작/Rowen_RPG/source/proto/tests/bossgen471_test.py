"""v4.71 G1-g3 (지시서 §G1) 침공 보스 · 균열의 주인 — '그 종의 원형 + ① 장판'
1) 배정: 침공 보스 · 균열의 주인 = BOSS_GEN(① 장판 · 새 예고 풀) · 침공 불새(phoenix)는 돌진 원형 · 균열의 주인은 그 종 원형(로웬 호수뱀 근접+독 · 카르도 등잔달팽이 방어 태세 · 에르나 잿빛박쥐 돌진) · 관문 정예 표(BOSS_PAT 9)는 그대로
2) ① 장판: 예고 안 = 피해 · 밖 = 0 · 원형 특수 공격과 겹치지 않음(동시 예고 1개 · 사이 2.5초 이상)
3) 자동 전투로 처치까지: 초당 받은 피해 옛 대비(옛 = 침공은 옛 장판 + 근접 · 균열은 원형만) 표 · 0.75~1.30
4) 타깃 창(원형 칩 + ♛ 장판) · 이전 세이브 이어하기 · 왼쪽 아래 버전 · 스크린샷(shots/v471_*.png)"""
import os,sys,json
sys.path.insert(0,os.path.dirname(__file__))
from rng_probe452 import page,ARGS,HTML
from fx_util import SETUP_JS
from rift_util import Rift
from playwright.sync_api import sync_playwright
os.makedirs('shots',exist_ok=True)
ok=0
def chk(c,msg):
    global ok
    if os.environ.get('PROBE') and not c:print('  FAIL',msg);return
    assert c,msg;ok+=1;print('  ok',msg)
SEED="""(seed)=>{let a=seed>>>0;Math.random=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}"""
# 침공 보스를 원하는 사냥터에 세운다(hi=true면 마지막 사냥터)
INV_JS="""(hi)=>{const g=__g,r=Math.random;Math.random=()=>hi?.99:.01;g.invSpawn();Math.random=r;const m=g.inv.m;window.__bm=m;return {sp:m.sp,lv:m.lv,zone:m.zone,beh:g.mobBeh(m),gen:!!(g.bossPat(m)||{}).gen};}"""
# 자동 전투로 처치까지 — old=true면 옛 동작(침공: 옛 장판 + 근접 · 균열: 원형만)을 플래그를 잠시 빼서 흉내
FIGHT_JS="""([old,hpK])=>{const g=__g,P=g.player,S=g.S,m=window.__bm;const fl={inv:m.inv,rb:m.riftBoss};if(old){m.inv=false;m.riftBoss=false;}
  for(const e of g.mobs)if(e!==m&&!e.dead){e.aggro=false;e.ret=false;e.dead=true;e.deadT=-1e9;e.respawn=1e9;}
  if(!m._mx)m._mx=m.max;m.max=Math.round(m._mx*hpK);m.dead=false;m.hp=m.max;m.x=m.home.x;m.y=m.home.y;m.aggro=false;m.ret=false;m.bp=null;m.aoe=null;m.aoeT=5;m.atkT=1;m.wind=0;m.chg=null;m.aim=null;m.gdU=0;m.gdN=0;m.stag=0;m.chgCd=0;m.spE=-99;m.bpE=-99;
  if(g.rift)g.rift.clear=1;g.STAT.bp={};P.x=m.x+60;P.y=m.y;P.hp=1e8;P.mp=1e4;P.shield=0;g.clearStatus();S.hpPot=0;P.cd=P.cd.map(()=>0);g.resetAuto();g.setAuto(true);g.setTarget(m);
  let i=0,taken=0,maxTele=0,both=0,ev=[],pb=false,ps=false,oldAoe=0,bpN=0,bpHit=0,spN=0;
  for(;i<20*300;i++){P.mp=1e4;P.lastHit=1e12;P.hp=1e8;const h0=P.hp;g.step(1,.05);if(P.hp<h0&&h0-P.hp<1e7)taken+=h0-P.hp;
    const own=new Set();for(const e of g.tele){if(e.ownP===m)own.add('p'+e.bid);if(e.ownC===m||e.own===m||e.ownB===m)own.add('s');}if(m.aoe)own.add('o');maxTele=Math.max(maxTele,own.size);
    const b=!!m.bp,s=g.spBusy(m);if(b&&s)both++;if(b!==pb)ev.push([g.t,'b',b]);if(s!==ps){ev.push([g.t,'s',s]);if(s)spN++;}pb=b;ps=s;if(m.aoe&&m.aoe.t===0)oldAoe++;if(m.dead)break;}
  g.setAuto(false);m.max=m._mx;if(old){m.inv=fl.inv;m.riftBoss=fl.rb;}if(g.rift)g.rift.clear=0;
  /* 장판이 끝난 뒤 → 특수 공격 시작 · 특수 공격이 끝난 뒤 → 장판 시작 사이 */
  let gaps=[],lastEnd={b:null,s:null};for(const [tt,k,on] of ev){const o=k==='b'?'s':'b';if(on&&lastEnd[o]!=null)gaps.push(Math.round((tt-lastEnd[o])*100)/100);if(!on)lastEnd[k]=tt;if(on)lastEnd[o]=null;}
  for(const e of g.mobs)if(e.deadT<-1e8)e.respawn=0;const bp=g.STAT.bp.aoe||{n:0,hit:0};
  return {sec:Math.round(i/2)/10,dead:m.dead,taken:Math.round(taken),maxTele,both,gaps,bp,spN,oldAoe};}"""
ISO_JS="""(mode)=>{const g=__g,P=g.player,m=window.__bm;for(const e of g.mobs)if(e!==m){e.aggro=false;e.ret=false;e.dead=true;e.deadT=-1e9;e.respawn=1e9;}
  m.dead=false;m.hp=m.max;m.x=m.home.x;m.y=m.home.y;m.aggro=true;m.ret=false;m.bp=null;m.aoeT=99;m.atkT=99;m.chgCd=1e9;m.gdN=1e9;m.gdU=0;m.chg=null;m.wind=0;g.setAuto(false);P.x=m.x+40;P.y=m.y;P.hp=1e8;P.shield=0;P.dash=0;g.clearStatus();g.S.hpPot=0;
  g.bpStart(m,'aoe',40);const id=m.bp.id,kinds=g.tele.filter(e=>e.bid===id).map(e=>e.kind);for(let i=0;i<40;i++){m.aoeT=99;m.atkT=99;if(mode==='out'&&i===2)P.x+=120;P.lastHit=1e12;g.step(1,.05);}
  const r={dmg:Math.round(1e8-P.hp),kinds,bp:!!m.bp,left:g.tele.filter(e=>e.bid===id).length,bpE:m.bpE>0};for(const e of g.mobs)if(e.deadT<-1e8)e.respawn=0;g.clearStatus();return r;}"""
rows=[]
def fight(pg,name,lv,hpK,seeds=(3,9)):
    for seed in seeds:
        pg.evaluate(SEED,seed);n=pg.evaluate(FIGHT_JS,[False,hpK]);pg.evaluate(SEED,seed);o=pg.evaluate(FIGHT_JS,[True,hpK])
        rt=(n['taken']/max(1,n['sec']))/max(1e-9,o['taken']/max(1,o['sec']))
        rows.append((name,lv,seed,n,o,rt));print(' ',name,'Lv',lv,'seed',seed,'새',n,'옛',{k:o[k] for k in ('sec','taken','oldAoe','spN')},'초당 피해비 %.2f'%rt)
        chk(n['dead'] and o['dead'],name+' 자동 전투 처치('+str(n['sec'])+'초 · 옛 '+str(o['sec'])+'초)')
        chk(n['maxTele']<=1 and n['both']==0 and n['oldAoe']==0,name+' 동시 예고 1개 · 장판과 원형 특수 공격이 겹치지 않음 · 옛 장판 없음')
        chk(all(x>=2.44 for x in n['gaps']),name+' 장판 ↔ 원형 특수 공격 사이 2.5초 이상(한 프레임 0.05초 오차) '+str(sorted(n['gaps'])[:4]))
        chk(n['bp']['n']>=2 and n['bp']['hit']<n['bp']['n'],name+' ① 장판 %d회 · 자동 회피 동작(피격 %d)'%(n['bp']['n'],n['bp']['hit']))
        chk(0.75<=rt<=1.30,name+' 초당 받은 피해 옛 대비 %.2f (0.75~1.30)'%rt)
        if o['spN']>=2:chk(n['spN']>=1,name+' 원형 특수 공격도 그대로(%d회 · 옛 %d)'%(n['spN'],o['spN']))
with sync_playwright() as p:
    b=p.chromium.launch(args=ARGS);errs=[]
    # --- 침공 보스 ---
    for mid,lv,hi,want,beh in (('rowen',20,True,'phoenix','charge'),('rowen',20,False,'watergolem','melee'),('kardo',27,True,'watergolem','melee'),('erna',39,True,'magmagolem','melee')):
        pg=page(b,errs,mid);pg.evaluate(SETUP_JS,lv)
        if ok==0:
            ver=pg.evaluate("document.getElementById('verTag').textContent");chk(ver.startswith('v4.')and ver>='v4.71','버전 표시 '+ver)
            r=pg.evaluate("(()=>{const g=__g;return {gen:g.BOSS_GEN.p.join('+')+'/'+(g.BOSS_GEN.gen?'T':'F'),n:Object.keys(g.BOSS_PAT).length,el:!!g.bossPat({boss:true,eliteOf:'q6'})&&!g.bossPat({boss:true,eliteOf:'q6'}).gen,plain:g.bossPat({boss:true})}})()")
            chk(r['gen']=='aoe/T' and r['n']==9 and r['el'] and r['plain'] is None,'BOSS_GEN = ① 장판 · 관문 정예 표 9종 그대로 '+str(r))
        r=pg.evaluate(INV_JS,hi);print(' 침공',mid,r)
        chk(r['sp']==want and r['beh']==beh and r['gen'],'침공 보스 '+want+' → 원형 '+beh+' + ① 장판')
        if want=='phoenix':
            a=pg.evaluate(ISO_JS,'in');o=pg.evaluate(ISO_JS,'out');print('  iso',a,o)
            chk(a['kinds']==['circle'] and a['dmg']>0 and o['dmg']==0,'① 장판 예고(원형) 안 = 피해 %d · 밖 = 0'%a['dmg'])
            chk(not a['bp'] and a['left']==0 and a['bpE'],'장판이 끝나면 패턴 · 예고 정리')
        fight(pg,'침공 '+want+'@'+mid,lv,1)
        if want=='phoenix':
            r=pg.evaluate("""(()=>{const g=__g,P=g.player,m=window.__bm;m.dead=false;m.hp=m.max;m.aggro=true;m.ret=false;m.bp=null;m.x=m.home.x;m.y=m.home.y;P.x=m.x+60;P.y=m.y+10;P.hp=1e8;g.setTarget(m);m.spE=-99;g.bpStart(m,'aoe',60);for(let i=0;i<6;i++){m.atkT=99;m.aoeT=99;P.lastHit=1e12;g.step(1,.05);}
              g.tgtInfo(m);P.hp=g.pStats().hp;g.snapCam();g.render();const e=document.getElementById('tgtI'),rc=e.getBoundingClientRect();return {st:g.mobState(m),tx:e.textContent,tip:e.title,in:rc.top>=0&&rc.bottom<=720&&rc.right<=1280};})()""")
            print('  tgt',r);chk(r['tx']=='' and r['st']=='장판','타깃 창: 돌진 · ♛장판 칩 · 상태 "장판" · 화면 안')
            pg.screenshot(path='shots/v471_침공불새_장판.png')
            vt=pg.evaluate("(()=>{const r=document.getElementById('verTag').getBoundingClientRect();return [r.left,r.bottom];})()");chk(vt[0]<200 and vt[1]>600,'왼쪽 아래 버전 표시')
        if want=='magmagolem':
            r=pg.evaluate("(()=>{const g=__g,m=window.__bm;g.setTarget(m);g.tgtInfo(m);return document.getElementById('tgtI').textContent})()");print('  tgt',r)
            chk(r=='','v4.79 근접 침공 보스 타깃 창: 패턴 숨김')
        pg.close()
    # --- 균열의 주인 ---
    for mid,lv,sp,beh in (('rowen',13,'lakesnake','melee'),('kardo',24,'snail','guard'),('erna',36,'ashbat','charge')):
        pg=page(b,errs,mid);pg.evaluate(SETUP_JS,lv);pg.evaluate("__g.S.riftKey=1;__g.S.hpPot=50;__g.step(1,.05)")
        R=Rift(pg);R.enter(calm=False)
        r=pg.evaluate("(()=>{const g=__g,m=g.riftElite();window.__bm=m;return {sp:m.sp,lv:m.lv,beh:g.mobBeh(m),gen:!!(g.bossPat(m)||{}).gen,boss:!!m.boss}})()");print(' 균열',mid,r)
        chk(r['sp']==sp and r['beh']==beh and r['gen'],'균열의 주인('+mid+') '+sp+' → 원형 '+beh+' + ① 장판')
        fight(pg,'균열 '+sp+'@'+mid,lv,1)
        if sp=='snail':
            r=pg.evaluate("""(()=>{const g=__g,P=g.player,m=window.__bm;m.dead=false;m.hp=m.max;m.aggro=true;m.ret=false;m.bp=null;m.x=m.home.x;m.y=m.home.y;P.x=m.x+50;P.y=m.y+10;P.hp=1e8;g.setTarget(m);m.gdU=g.t+2;m.gdN=g.t+8;g.tgtInfo(m);P.hp=g.pStats().hp;g.snapCam();g.render();
              const e=document.getElementById('tgtI');return {st:g.mobState(m),tx:e.textContent};})()""");print('  tgt',r)
            chk(r['tx']=='' and r['st']=='웅크림','균열의 주인 타깃 창: 방어 태세 · ♛장판 · "웅크림"')
            pg.screenshot(path='shots/v471_균열주인_웅크림.png')
            pg.evaluate("(()=>{__g.rift.clear=0;})()")
        if sp=='lakesnake':
            r=pg.evaluate("(()=>{const g=__g,m=window.__bm;g.setTarget(m);g.tgtInfo(m);return document.getElementById('tgtI').textContent})()");print('  tgt',r)
            chk(r=='','v4.79 균열의 주인 타깃 창: 패턴 숨김')
        pg.close()
    # --- 이전 세이브 ---
    pg=page(b,errs,'rowen');pg.evaluate("(()=>{__g.closeModal();__g.save();})()");sv=pg.evaluate("localStorage.getItem('rowen-mmo-v4')");pg.close()
    chk('"spE"' not in sv and '"bpE"' not in sv,'세이브에 패턴 상태 없음(런타임)')
    e2=[];pg2=b.new_page(viewport={'width':1280,'height':720});pg2.on('pageerror',lambda e:e2.append(str(e)))
    pg2.goto('file://'+HTML);pg2.evaluate("s=>localStorage.setItem('rowen-mmo-v4',s)",sv);pg2.reload();pg2.wait_for_function('window.__ready===true',timeout=120000);pg2.click('#btnCont',timeout=60000);pg2.wait_for_timeout(600);pg2.evaluate("window.requestAnimationFrame=()=>0;__g.step(40,.05);__g.render()")
    chk(not e2,'이전 세이브 이어하기 → 오류 없음');pg2.close();b.close()
    chk(not errs,'페이지 오류 없음 '+str(errs[:2]))
print('표(자동 전투 · 처치까지):')
for name,lv,seed,n,o,rt in rows:print('  %s Lv%d s%d  새 %.1f초 피해 %d (장판 %d/%d · 원형 %d)  옛 %.1f초 피해 %d (옛 장판 %d · 원형 %d)  초당 피해비 %.2f'%(name,lv,seed,n['sec'],n['taken'],n['bp']['hit'],n['bp']['n'],n['spN'],o['sec'],o['taken'],o['oldAoe'],o['spN'],rt))
print('PASS',ok)
