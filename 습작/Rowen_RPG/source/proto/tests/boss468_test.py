"""v4.68 G1-f (지시서 §G1) 보스 패턴 — 로웬 3보스(왕멧돼지 q6 · 큰물뱀 q10 · 마그마골렘 군주 q12)
1) 배정: BOSS_PAT q6 ①+③ · q10 ①+②(독) · q12 ①+④+⑥(화상) · 지역 보스판(field)도 같은 패턴 · 다른 보스(q16 등)는 옛 장판 그대로
2) 패턴별: 예고 표시(원형 · 부채꼴 · 직선 · 원형 3개) → 정해진 시간 뒤 판정 → 예고 밖이면 피해 0 / 안이면 피해 · 상태이상(독 · 화상)
3) 광폭: 체력 30% 이하 → 근접 주기 1.6초 · 타깃 창 상태 '광폭'
4) 한 보스가 동시에 하는 패턴 1개 · 패턴 사이 최소 2.5초 · 패턴 칸 7초(옛 장판과 같은 박자)
5) 자동 전투: 같은 레벨 캐릭터로 처치까지 — 패턴마다 피격률 · 초당 받은 피해(옛 장판 대비) 표 · 자동 회피가 모든 예고 종류에 동작
6) 타깃 창 ♛ 칩 · 대응법 한 줄 · 이전 세이브 이어하기 · 왼쪽 아래 버전 · 스크린샷(shots/v468_*.png)"""
import os,sys,json
sys.path.insert(0,os.path.dirname(__file__))
from rng_probe452 import page,ARGS,HTML
from fx_util import SETUP_JS
from playwright.sync_api import sync_playwright
os.makedirs('shots',exist_ok=True)
ok=0
def chk(c,msg):
    global ok
    assert c,msg;ok+=1;print('  ok',msg)
SEED="""(seed)=>{let a=seed>>>0;Math.random=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}"""
# 패턴 하나만 떼어 시험: 근접 · 다음 패턴은 막고 bpStart로 직접 건다. mode in = 가만히 · out = 예고 밖으로 옮김
ISO_JS="""([qid,k,mode])=>{const g=__g,P=g.player,q=g.QUESTS.find(x=>x.id===qid);const m=g.spawnElite(q);
  for(const e of g.mobs)if(e!==m){e.aggro=false;e.ret=false;e.dead=true;e.deadT=-1e9;e.respawn=1e9;}
  m.dead=false;m.hp=m.max;m.x=m.home.x;m.y=m.home.y;m.aggro=true;m.ret=false;m.bp=null;m.rage=false;m.aoeT=99;m.atkT=99;m.wind=0;
  g.setAuto(false);P.x=m.x+40;P.y=m.y;P.hp=1e8;P.shield=0;P.dash=0;g.clearStatus();g.S.hpPot=0;
  g.bpStart(m,k,40);const id=m.bp.id,kinds=g.tele.filter(e=>e.bid===id).map(e=>e.kind+(e.aim?'*':''));let n0=g.tele.filter(e=>e.bid===id).length,fxs={},firstHit=-1,lockAt=-1;
  for(let i=0;i<80;i++){m.atkT=99;m.aoeT=99;
    if(mode==='out'){if(k==='aoe'&&i===2)P.x+=120;if(k==='fan'&&i===2){P.x=m.x-70;P.y=m.y;}if(k==='dash'&&m.bp&&m.bp.lk&&lockAt<0){lockAt=i;P.y+=60;}
      if(k==='tri'&&i===0)P.y+=90;}
    if(mode==='in'&&k==='dash'&&m.bp&&m.bp.lk&&lockAt<0)lockAt=i;
    P.lastHit=1e12;const nb=m.bp&&m.bp.n;g.step(1,.05);if(mode==='out'&&k==='tri'&&m.bp&&m.bp.n>nb)P.y+=90;if(firstHit<0&&P.hp<1e8)firstHit=i;for(const f in P.fx)if(g.fxOn(f))fxs[f]=1;}
  const r={k,dmg:Math.round(1e8-P.hp),kinds,firstHit,lockAt,fx:Object.keys(fxs),bp:!!m.bp,left:g.tele.filter(e=>e.bid===id).length};g.clearStatus();return r;}"""
# 자동 전투로 처치까지(받은 피해만 잼 · 체력 넉넉) — pat=false면 패턴 표를 잠시 빼서 옛 장판으로
FIGHT_JS="""([qid,seed,pat,hpK])=>{const g=__g,P=g.player,S=g.S,q=g.QUESTS.find(x=>x.id===qid);const keep=g.BOSS_PAT[qid];if(!pat)delete g.BOSS_PAT[qid];
  const m=g.spawnElite(q);for(const e of g.mobs)if(e!==m){e.aggro=false;e.ret=false;e.dead=true;e.deadT=-1e9;e.respawn=1e9;}
  if(!m._mx)m._mx=m.max;m.max=Math.round(m._mx*hpK);m.dead=false;m.hp=m.max;m.x=m.home.x;m.y=m.home.y;m.aggro=false;m.ret=false;m.bp=null;m.rage=false;m.aoe=null;m.aoeT=5;m.atkT=1;m.wind=0;m.pi=0;
  g.STAT.bp={};g.STAT.bpRage=0;P.x=m.x+60;P.y=m.y;P.hp=1e8;P.mp=1e4;P.shield=0;g.clearStatus();S.hpPot=0;P.cd=P.cd.map(()=>0);g.resetAuto();g.setAuto(true);g.setTarget(m);
  let i=0,starts=[],ends=[],prev=null,maxTele=0,rageCd=null,taken=0;for(;i<20*240;i++){P.mp=1e4;P.lastHit=1e12;const h0=P.hp;g.step(1,.05);if(P.hp<h0&&h0-P.hp<1e7)taken+=h0-P.hp;const c=m.bp;if(c&&c!==prev){starts.push([g.t,c.k]);}if(!c&&prev)ends.push(g.t);prev=c;
    const ids=new Set(g.tele.filter(e=>e.ownP===m).map(e=>e.bid));maxTele=Math.max(maxTele,ids.size);if(m.rage&&rageCd==null&&m.wind>0)rageCd=m.atkT;if(m.dead)break;}
  g.setAuto(false);if(!pat)g.BOSS_PAT[qid]=keep;m.max=m._mx;
  let gaps=[];for(let j=0;j<ends.length&&j+1<starts.length;j++)gaps.push(Math.round((starts[j+1][0]-ends[j])*100)/100);
  const sp=[];for(let j=1;j<starts.length;j++)sp.push(Math.round((starts[j][0]-starts[j-1][0])*100)/100);
  for(const e of g.mobs)if(e.deadT<-1e8)e.respawn=0;
  return {sec:Math.round(i/2)/10,dead:m.dead,taken:Math.round(taken),bp:g.STAT.bp,rage:g.STAT.bpRage||0,gaps,sp,maxTele,rageCd,ks:starts.map(s=>s[1]).join('')};}"""
with sync_playwright() as p:
    b=p.chromium.launch(args=ARGS);errs=[];pg=page(b,errs)
    ver=pg.evaluate("document.getElementById('verTag').textContent");chk(ver.startswith('v4.'),'버전 표시 '+ver)
    # 1) 배정
    r=pg.evaluate("""(()=>{const g=__g,B=g.BOSS_PAT;const el=id=>g.spawnElite(g.QUESTS.find(q=>q.id===id));const a=el('q6'),b=el('q10'),c=el('q12');
      const f=['q6','q10'].map(id=>[id,!!g.bossPat({boss:true,eliteOf:id,field:true})]);/* 지역 보스판 = 같은 q의 elite를 eliteOf로 만든 개체(ensureFieldBosses) */
      const other={boss:true,eliteOf:'q99'};return {q6:B.q6.p.join('+'),q10:B.q10.p.join('+')+'/'+B.q10.fx.fan,q12:B.q12.p.join('+')+'/'+B.q12.fx.tri+'/'+B.q12.rage,
        pa:!!g.bossPat(a)&&!!g.bossPat(b)&&!!g.bossPat(c),f,other:g.bossPat(other),norm:g.bossPat({boss:false,eliteOf:null}),mobB:g.mobB(a)};})()""")
    print(' 배정',r)
    chk(r['q6']=='aoe+dash' and r['q10']=='aoe+fan/poison' and r['q12']=='aoe+tri/burn/true','패턴 표: 왕멧돼지 ①+③ · 큰물뱀 ①+②(독) · 마그마골렘 군주 ①+④+⑥(화상)')
    chk(r['pa'],'관문 정예 3종에 패턴')
    chk(all(v for k,v in r['f'] if k in ('q6','q10','q12')) and any(k=='q6' for k,v in r['f']),'지역 보스판(fb1 · fb2)도 같은 패턴 '+str(r['f']))
    chk(r['other'] is None and r['norm'] is None and r['mobB'] is None,'패턴 표에 없는 보스(q99)는 옛 장판 · 일반 몬스터 없음 · mobB는 그대로 null')
    # 2) 패턴별 판정
    pg.evaluate(SETUP_JS,13)
    for qid,k,kind in (('q6','aoe',['circle']),('q6','dash',['line*']),('q10','fan',['fan']),('q12','tri',['circle'])):
        pg.evaluate(SEED,7);a=pg.evaluate(ISO_JS,[qid,k,'in']);pg.evaluate(SEED,7);o=pg.evaluate(ISO_JS,[qid,k,'out']);print(' ',qid,k,'안',a,'밖',o)
        chk(a['kinds']==kind,k+' 예고 표시 '+str(a['kinds']))
        chk(a['dmg']>0 and o['dmg']==0,k+' 예고 안 = 피해 '+str(a['dmg'])+' · 밖 = 0')
        chk(not a['bp'] and a['left']==0,k+' 끝나면 패턴 · 예고 정리')
        if k=='aoe':chk(abs(a['firstHit']-27)<=1,'장판 1.4초 뒤 판정 (프레임 '+str(a['firstHit'])+')')
        if k=='fan':chk(abs(a['firstHit']-19)<=1,'휩쓸기 1.0초 뒤 판정 (프레임 '+str(a['firstHit'])+')')
        if k=='dash':chk(a['lockAt']>=9 and a['lockAt']<=11 and a['firstHit']>=19,'돌진 0.5초 따라감 → 0.5초 고정 → 돌진 (고정 '+str(a['lockAt'])+' · 명중 '+str(a['firstHit'])+')')
        if k=='tri':chk(a['dmg']>0 and abs(a['firstHit']-19)<=1,'3연속 첫 장판 1.0초 뒤')
        if k=='fan':chk('poison' in a['fx'] and 'poison' not in o['fx'],'휩쓸기 명중 = 독 · 빗나가면 없음')
        if k=='tri':chk('burn' in a['fx'] and 'burn' not in o['fx'],'3연속 장판 명중 = 화상 · 빗나가면 없음')
        if k in('aoe','dash'):chk(not a['fx'],k+' 상태이상 없음')
    # 3연속 장판은 세 개 · 0.5초 간격
    r=pg.evaluate("""(()=>{const g=__g,P=g.player,q=g.QUESTS.find(x=>x.id==='q12'),m=g.spawnElite(q);m.dead=false;m.aggro=true;m.ret=false;m.bp=null;m.aoeT=99;m.atkT=99;P.x=m.x+40;P.y=m.y;P.hp=1e8;
      g.bpStart(m,'tri',40);const id=m.bp.id,ts=[],n1=m.bp.n;let n=n1;for(let i=0;i<50;i++){m.atkT=99;m.aoeT=99;g.step(1,.05);const c=m.bp?m.bp.n:n;if(c>n)ts.push(i);n=c;}g.clearStatus();return {ts,n1,n:g.STAT.bp.tri};})()""")
    print(' tri',r);chk(r['n1']==1 and len(r['ts'])==2 and abs(r['ts'][0]-9)<=1 and abs(r['ts'][1]-19)<=1,'3연속: 0 · 0.5 · 1.0초에 하나씩(첫 개는 시작 때) '+str(r['ts']))
    # 3) 광폭
    r=pg.evaluate("""(()=>{const g=__g,P=g.player,q=g.QUESTS.find(x=>x.id==='q12'),m=g.spawnElite(q);for(const e of g.mobs)if(e!==m){e.aggro=false;e.dead=true;e.deadT=-1e9;e.respawn=1e9;}
      m.dead=false;m.hp=m.max;m.aggro=true;m.ret=false;m.bp=null;m.rage=false;m.aoeT=99;m.atkT=0;m.x=m.home.x;m.y=m.home.y;P.x=m.x+20;P.y=m.y;P.hp=1e8;g.setAuto(false);
      g.step(2,.05);const a0=m.rage,cd0=m.atkT;m.hp=Math.floor(m.max*.29);m.atkT=0;m.wind=0;g.step(2,.05);const cd1=m.atkT;g.setTarget(m);g.tgtInfo(m);
      const st=g.mobState(m),tx=document.getElementById('tgtI').textContent;m.hp=m.max;m.x=m.home.x+3;m.ret=true;g.step(2,.05);const back=m.rage;for(const e of g.mobs)if(e.deadT<-1e8)e.respawn=0;return {a0,cd0,cd1,r:m.rage,st,tx,back};})()""")
    print(' rage',r)
    chk(r['a0'] is False and abs(r['cd0']-2.2)<.11,'광폭 전 근접 주기 2.2초')
    chk(abs(r['cd1']-1.6)<.11,'체력 30% 이하 → 근접 주기 1.6초 '+str(r['cd1']))
    chk(r['st']=='광폭' and r['tx']=='','타깃 창 상태 "광폭"')
    chk(r['back'] is False,'집에 돌아가 체력을 되찾으면 광폭 풀림')
    # 4) 5) 자동 전투로 처치 — 새 페이지(앞 시험이 올린 레벨 없이) · 보스 레벨 = 캐릭터 레벨 · 체력 ×HPK(패턴이 여러 번 나오게 · 옛/새 같은 값)
    rows=[];pgF=page(b,errs);HPK=3
    for qid,lv in (('q6',8),('q10',13),('q12',16)):
        pgF.evaluate(SETUP_JS,lv)
        for seed in (3,9):
            pgF.evaluate(SEED,seed);n=pgF.evaluate(FIGHT_JS,[qid,seed,True,HPK]);pgF.evaluate(SEED,seed);o=pgF.evaluate(FIGHT_JS,[qid,seed,False,HPK])
            dps_n=n['taken']/max(1,n['sec']);dps_o=o['taken']/max(1,o['sec'])
            rows.append((qid,lv,seed,n,o,dps_n/dps_o if dps_o else 0))
            print(' ',qid,'Lv',lv,'seed',seed,'새',n,'옛',{'sec':o['sec'],'taken':o['taken']},'초당 피해비 %.2f'%(dps_n/dps_o if dps_o else 0))
            chk(n['dead'] and o['dead'],qid+' 자동 전투 처치('+str(n['sec'])+'초 · 옛 '+str(o['sec'])+'초)')
            chk(n['maxTele']<=1,qid+' 동시에 하는 패턴 1개')
            chk(all(x>=2.5 for x in n['gaps']),qid+' 패턴 사이 최소 2.5초 '+str(n['gaps'][:6]))
            chk(all(x>=6.9 for x in n['sp']),qid+' 패턴 칸 7초 '+str(n['sp'][:6]))
            P=json.loads(json.dumps(n['bp']))
            for k,v in P.items():
                if v['n']>=2:chk(v['hit']<v['n'],qid+' 자동 회피가 '+k+' 예고에 동작(피격 '+str(v['hit'])+'/'+str(v['n'])+')')
            if qid=='q12':chk(n['rage']==1,'마그마골렘 군주 광폭 1회')
    pgF.close()
    # 6) 타깃 창 ♛ 칩
    r=pg.evaluate("""(()=>{const g=__g,P=g.player,q=g.QUESTS.find(x=>x.id==='q10'),m=g.spawnElite(q);m.dead=false;m.hp=m.max;m.aggro=true;m.ret=false;m.bp=null;m.x=m.home.x;m.y=m.home.y;P.x=m.x+40;P.y=m.y;P.hp=1e8;
      g.setTarget(m);g.bpStart(m,'fan',40);for(let i=0;i<8;i++){m.atkT=99;P.lastHit=1e12;g.step(1,.05);}g.tgtInfo(m);P.hp=g.pStats().hp;g.snapCam();g.render();const e=document.getElementById('tgtI');const r=e.getBoundingClientRect();return {tx:e.textContent,hid:e.hidden,tip:e.title,in:r.top>=0&&r.bottom<=720&&r.right<=1280};})()""")
    print(' tgt',r)
    chk(r['tx']=='','타깃 창 ♛ 칩 · 지금 하는 패턴 "휩쓸기 예고"')
    chk('독' not in r['tx'],'상태이상 칩 "휩쓸기 명중 100% → 독"')
    chk('원 밖으로' not in r['tx'],'대응법 한 줄(패턴마다)')
    chk(r['in'],'타깃 창 화면 안')
    pg.screenshot(path='shots/v468_큰물뱀_휩쓸기.png')
    pg.evaluate("""(()=>{const g=__g,P=g.player,q=g.QUESTS.find(x=>x.id==='q12'),m=g.spawnElite(q);m.dead=false;m.hp=Math.floor(m.max*.25);m.rage=true;m.aggro=true;m.ret=false;m.bp=null;m.x=m.home.x;m.y=m.home.y;P.x=m.x+50;P.y=m.y+10;P.hp=1e8;
      g.setTarget(m);g.bpStart(m,'tri',50);for(let i=0;i<11;i++){m.atkT=99;P.lastHit=1e12;g.step(1,.05);}g.tgtInfo(m);P.hp=g.pStats().hp;g.snapCam();g.render();})()""")
    pg.screenshot(path='shots/v468_골렘군주_3연속.png')
    vt=pg.evaluate("(()=>{const r=document.getElementById('verTag').getBoundingClientRect();return [r.left,r.bottom];})()");chk(vt[0]<200 and vt[1]>600,'왼쪽 아래 버전 표시')
    # 이전 세이브(새 저장 필드 없음 — 패턴 상태는 런타임)
    pg.evaluate("(()=>{__g.closeModal();__g.save();})()")
    sv=pg.evaluate("localStorage.getItem('rowen-mmo-v4')");pg.close()
    chk('"bp"' not in sv and '"rage"' not in sv,'세이브에 패턴 상태 없음(런타임)')
    e2=[];pg2=b.new_page(viewport={'width':1280,'height':720});pg2.on('pageerror',lambda e:e2.append(str(e)))
    pg2.goto('file://'+HTML);pg2.evaluate("s=>localStorage.setItem('rowen-mmo-v4',s)",sv);pg2.reload();pg2.wait_for_function('window.__ready===true',timeout=120000);pg2.click('#btnCont',timeout=60000);pg2.wait_for_timeout(600);pg2.evaluate("window.requestAnimationFrame=()=>0;__g.step(40,.05);__g.render()")
    chk(not e2,'이전 세이브 이어하기 → 오류 없음')
    pg2.close();b.close()
    chk(not errs,'페이지 오류 없음 '+str(errs[:2]))
    print('표(자동 전투 · 처치까지):')
    for qid,lv,seed,n,o,rt in rows:print('  %s Lv%d s%d  새 %.1f초 피해 %d  옛 %.1f초 피해 %d  초당 피해비 %.2f  %s'%(qid,lv,seed,n['sec'],n['taken'],o['sec'],o['taken'],rt,json.dumps(n['bp'])))
print('PASS',ok)
