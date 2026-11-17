"""v4.69 G1-g1 (지시서 §G1) 보스 패턴 — 카르도 3보스(거대 동굴버섯 q16 · 등잔달팽이 q19 · 광석골렘 왕 q21)
1) 배정: q16 3갈래 투사체(둔화) + 졸개 소환 · q19 방어 태세 + 3연속 장판(화상) · q21 장판 + 휩쓸기(기절) + 광폭 · 지역 보스판(fb4~6)도 같은 패턴 · 에르나(q27 등)는 옛 장판 그대로
2) 패턴별: 3갈래 = 줄 3개 예고(따라감 → 고정) → 투사체 3발 · 맞으면 둔화 · 밖이면 0 / 방어 태세 = 0.5초 깜빡임 → 2.5초 웅크림(평타 −70% · 스킬 −30% · 그동안 공격 없음) / 3연속 화상 / 휩쓸기 기절
3) 졸개 소환: 체력 50%에 한 번 3마리(그 사냥터 동굴버섯) · 보스가 쓰러지거나 집에 돌아가면 사라지고 목록에서 빠짐
4) 자동 전투로 처치까지: 동시 예고 1개 · 패턴 사이 2.5초 이상 · 7초 칸 · 자동 회피 동작 · 초당 받은 피해(옛 장판 대비) 표 · 방어 태세 처치 시간
5) 타깃 창 ♛ 칩 · 대응법 · 이전 세이브 이어하기 · 왼쪽 아래 버전 · 스크린샷(shots/v469_*.png)"""
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

ISO_JS="""([qid,k,mode])=>{const g=__g,P=g.player,q=g.QUESTS.find(x=>x.id===qid);const m=g.spawnElite(q);
  for(const e of g.mobs)if(e!==m){e.aggro=false;e.ret=false;e.dead=true;e.deadT=-1e9;e.respawn=1e9;}
  m.dead=false;m.hp=m.max;m.x=m.home.x;m.y=m.home.y;m.aggro=true;m.ret=false;m.bp=null;m.rage=false;m.aoeT=99;m.atkT=99;m.wind=0;m.gdU=0;m.gdN=0;
  g.setAuto(false);P.x=m.x+40;P.y=m.y;P.hp=1e8;P.shield=0;P.dash=0;g.clearStatus();g.S.hpPot=0;
  g.bpStart(m,k,40);const id=m.bp.id,kinds=g.tele.filter(e=>e.bid===id).map(e=>e.kind+(e.aim?'*':''));let fxs={},firstHit=-1,lockAt=-1,shot=0,gOn=-1,gOff=-1;
  for(let i=0;i<80;i++){m.aoeT=99;if(k!=='guard')m.atkT=99;
    if(mode==='out'){if(k==='volley'&&m.bp&&m.bp.lk&&lockAt<0){lockAt=i;P.x=m.x-70;}if(k==='fan'&&i===2){P.x=m.x-70;P.y=m.y;}if(k==='tri'&&i===0)P.y+=90;if(k==='aoe'&&i===2)P.x+=120;}
    if(mode==='in'&&k==='volley'&&m.bp&&m.bp.lk&&lockAt<0)lockAt=i;
    P.lastHit=1e12;const nb=m.bp&&m.bp.n;g.step(1,.05);if(mode==='out'&&k==='tri'&&m.bp&&m.bp.n>nb)P.y+=90;
    shot=Math.max(shot,g.shots.filter(s=>s.bk===k).length);if(k==='guard'){if(gOn<0&&g.guardOn(m))gOn=i;if(gOn>=0&&gOff<0&&!g.guardOn(m))gOff=i;}
    if(firstHit<0&&P.hp<1e8)firstHit=i;for(const f in P.fx)if(g.fxOn(f))fxs[f]=1;}
  const r={k,dmg:Math.round(1e8-P.hp),kinds,firstHit,lockAt,shot,gOn,gOff,fx:Object.keys(fxs),bp:!!m.bp,left:g.tele.filter(e=>e.bid===id).length};g.clearStatus();return r;}"""
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

CAST_JS="""([qid])=>{const g=__g,P=g.player,q=g.QUESTS.find(x=>x.id===qid),m=g.spawnElite(q);m.dead=false;m.hp=m.max=1e9;m.def=0;m.aggro=true;m.ret=false;m.bp=null;m.aoeT=99;m.atkT=99;m.gdU=0;m.gdN=0;P.x=m.x+30;P.y=m.y;
  const SEEDF=s=>{let a=s;Math.random=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};};
  const hit=(sk)=>{SEEDF(5);const h=m.hp;g.playerHit(m,1,sk);return h-m.hp;};const a0=hit(),s0=hit('x');g.bpStart(m,'guard',30);for(let i=0;i<14;i++){m.aoeT=99;g.step(1,.05);}const on=g.guardOn(m),a1=hit(),s1=hit('x');return {on,ba:a1/a0,sk:s1/s0};}"""
with sync_playwright() as p:
    b=p.chromium.launch(args=ARGS);errs=[];pg=page(b,errs,'kardo')
    ver=pg.evaluate("document.getElementById('verTag').textContent");chk(ver.startswith('v4.')and ver>='v4.69','버전 표시 '+ver)
    r=pg.evaluate("""(()=>{const g=__g,B=g.BOSS_PAT;const el=id=>g.spawnElite(g.QUESTS.find(q=>q.id===id));const a=el('q16'),b=el('q19'),c=el('q21');
      const f=['q16','q19','q21'].map(id=>!!g.bossPat({boss:true,eliteOf:id,field:true}));
      return {q16:B.q16.p.join('+')+'/'+B.q16.fx.volley+'/'+B.q16.sum,q19:B.q19.p.join('+')+'/'+B.q19.fx.tri,q21:B.q21.p.join('+')+'/'+B.q21.fx.fan+'/'+B.q21.rage,
        pa:!!g.bossPat(a)&&!!g.bossPat(b)&&!!g.bossPat(c),f,other:['q27','q30','q32'].map(id=>g.bossPat({boss:true,eliteOf:id})),mobB:[a,b,c].map(x=>g.mobB(x))};})()""")
    print(' 배정',r)
    chk(r['q16']=='volley/slow/cavemush' and r['q19']=='guard+tri/burn' and r['q21']=='aoe+fan/stun/true','패턴 표: 동굴버섯 3갈래(둔화)+소환 · 등잔달팽이 방어 태세+3연속(화상) · 광석골렘 왕 ①+②(기절)+⑥')
    chk(r['pa'] and all(r['f']),'관문 정예 3종 · 지역 보스판(fb4~6)에 패턴')
    chk(all(x is None for x in r['other']) and all(x is None for x in r['mobB']),'에르나 보스(q27 · q30 · q32 — G1-g2)는 옛 장판 · 보스 mobB는 null')
    pg.evaluate(SETUP_JS,25)
    for qid,k,kind in (('q16','volley',['line*']*3),('q19','tri',['circle']),('q21','aoe',['circle']),('q21','fan',['fan'])):
        pg.evaluate(SEED,7);a=pg.evaluate(ISO_JS,[qid,k,'in']);pg.evaluate(SEED,7);o=pg.evaluate(ISO_JS,[qid,k,'out']);print(' ',qid,k,'안',a,'밖',o)
        chk(a['kinds']==kind,k+' 예고 표시 '+str(a['kinds']))
        chk(a['dmg']>0 and o['dmg']==0,k+' 예고 안 = 피해 '+str(a['dmg'])+' · 밖 = 0')
        chk(not a['bp'] and a['left']==0,k+' 끝나면 패턴 · 예고 정리')
        if k=='volley':
            chk(abs(a['lockAt']-12)<=1 and a['shot']==3,'3갈래: 0.6초 따라감 → 0.5초 고정 → 3발 (고정 프레임 '+str(a['lockAt'])+' · 발 '+str(a['shot'])+')')
            chk('slow' in a['fx'] and 'slow' not in o['fx'],'3갈래 명중 = 둔화 · 빗나가면 없음')
        if k=='tri':chk('burn' in a['fx'] and 'burn' not in o['fx'],'등잔달팽이 3연속 명중 = 화상')
        if k=='fan':chk('stun' in a['fx'] and 'stun' not in o['fx'],'광석골렘 왕 휩쓸기 명중 = 기절')
        if k=='aoe':chk(not a['fx'],'장판 상태이상 없음')
    # 방어 태세
    pg.evaluate(SEED,7);a=pg.evaluate(ISO_JS,['q19','guard','in']);print(' guard',a)
    chk(abs(a['gOn']-9)<=1 and abs((a['gOff']-a['gOn'])-50)<=1,'방어 태세: 0.5초 깜빡임 → 2.5초 웅크림 (프레임 '+str(a['gOn'])+'→'+str(a['gOff'])+')')
    chk(a['dmg']==0 or a['firstHit']<a['gOn'] or a['firstHit']>=a['gOff'],'웅크린 동안 공격 없음')
    c=pg.evaluate(CAST_JS,['q19']);print(' guard dmg',c)
    chk(c['on'] and abs(c['ba']-0.3)<.03 and abs(c['sk']-0.7)<.03,'웅크림 중 평타 ×%.2f · 스킬 ×%.2f'%(c['ba'],c['sk']))
    # 졸개 소환
    r=pg.evaluate("""(()=>{const g=__g,P=g.player,q=g.QUESTS.find(x=>x.id==='q16'),m=g.spawnElite(q);for(const e of g.mobs)if(e!==m){e.aggro=false;e.dead=true;e.deadT=-1e9;e.respawn=1e9;}
      m.dead=false;m.max=m.max;m.hp=m.max;m.aggro=true;m.ret=false;m.bp=null;m.aoeT=99;m.atkT=99;m.x=m.home.x;m.y=m.home.y;P.x=m.x+40;P.y=m.y;P.hp=1e8;g.setAuto(false);
      const n0=g.mobs.length;g.step(1,.05);const a=g.mobs.filter(e=>e.sumOf===m).length;m.hp=Math.floor(m.max*.49);g.step(1,.05);const S1=g.mobs.filter(e=>e.sumOf===m);
      const sp=[...new Set(S1.map(e=>e.sp))],ag=S1.every(e=>e.aggro&&!e.dead&&e.zone===m.zone),near=S1.every(e=>Math.hypot(e.x-m.x,e.y-m.y)<80);m.hp=Math.floor(m.max*.3);g.step(1,.05);const again=g.mobs.filter(e=>e.sumOf===m).length;
      g.killMob(S1[0]);for(let i=0;i<30;i++)g.step(1,.05);const resp1=S1[0].respawn,inList1=g.mobs.includes(S1[0]);
      g.killMob(m);const gone=S1.every(e=>e.dead&&e.gone);for(let i=0;i<30;i++)g.step(1,.05);const left=g.mobs.filter(e=>e.sumOf===m).length;
      m.dead=false;m.hp=m.max;m.aggro=true;m.ret=false;m.x=m.home.x;m.y=m.home.y;m.hp=Math.floor(m.max*.4);g.step(1,.05);const b2=g.mobs.filter(e=>e.sumOf===m&&!e.dead).length;
      m.x=m.home.x+300;g.step(1,.05);const ret=m.ret,b3=g.mobs.filter(e=>e.sumOf===m&&!e.dead).length;for(let i=0;i<30;i++)g.step(1,.05);const b4=g.mobs.filter(e=>e.sumOf===m).length;
      for(const e of g.mobs)if(e.deadT<-1e8)e.respawn=0;return {a,n:S1.length,sp,ag,near,again,resp1,inList1,gone,left,b2,ret,b3,b4,stat:g.STAT.bpSum,n0,n1:g.mobs.length};})()""")
    print(' summon',r)
    chk(r['a']==0 and r['n']==3 and r['sp']==['cavemush'] and r['ag'] and r['near'],'체력 50%에 졸개 3마리(동굴버섯 · 어그로 · 보스 곁)')
    chk(r['again']==3,'한 번만(30%에서 더 나오지 않음)')
    chk(r['resp1']>=1e8 and not r['inList1'],'졸개는 다시 나오지 않고 목록에서 빠짐')
    chk(r['gone'] and r['left']==0,'보스가 쓰러지면 졸개도 사라짐')
    chk(r['b2']==3 and r['ret'] and r['b3']==0 and r['b4']==0,'다시 싸우면 또 3마리 · 보스가 추격 한계로 돌아가면 사라짐')
    chk(r['n1']<=r['n0'],'몬스터 목록 크기 원래대로 (%d → %d)'%(r['n0'],r['n1']))
    pg.close()
    rows=[];HPK=3
    for qid,lv in (('q16',21),('q19',25),('q21',28)):
        pgF=page(b,errs,'kardo');pgF.evaluate(SETUP_JS,lv)
        for seed in (3,9):
            pgF.evaluate(SEED,seed);n=pgF.evaluate(FIGHT_JS,[qid,seed,True,HPK]);pgF.evaluate(SEED,seed);o=pgF.evaluate(FIGHT_JS,[qid,seed,False,HPK])
            pgF.evaluate("(()=>{for(const e of __g.mobs)if(e.sumOf){e.dead=true;e.gone=true;}})()")
            dps_n=n['taken']/max(1,n['sec']);dps_o=o['taken']/max(1,o['sec']);rt=dps_n/dps_o if dps_o else 0
            rows.append((qid,lv,seed,n,o,rt))
            print(' ',qid,'Lv',lv,'seed',seed,'새',n,'옛',{'sec':o['sec'],'taken':o['taken']},'초당 피해비 %.2f'%rt)
            chk(n['dead'] and o['dead'],qid+' 자동 전투 처치('+str(n['sec'])+'초 · 옛 '+str(o['sec'])+'초)')
            chk(n['maxTele']<=1,qid+' 동시에 하는 패턴 1개')
            chk(all(x>=2.5 for x in n['gaps']),qid+' 패턴 사이 최소 2.5초 '+str(n['gaps'][:6]))
            chk(all(x>=6.9 for x in n['sp']),qid+' 패턴 칸 7초 '+str(n['sp'][:6]))
            for k,v in n['bp'].items():
                if v['n']>=2 and k!='guard':chk(v['hit']<v['n'],qid+' 자동 회피가 '+k+' 예고에 동작(피격 '+str(v['hit'])+'/'+str(v['n'])+')')
            chk(0.75<=rt<=1.30,qid+' 초당 받은 피해 옛 장판 대비 %.2f (0.75~1.30)'%rt)
            if qid=='q21':chk(n['rage']==1,'광석골렘 왕 광폭 1회')
            if qid=='q19':chk(n['sec']/o['sec']<=1.45,'등잔달팽이 처치 시간 옛 대비 %.2f (≤1.45)'%(n['sec']/o['sec']))
        pgF.close()
    pg=page(b,errs,'kardo');pg.evaluate(SETUP_JS,21)
    r=pg.evaluate("""(()=>{const g=__g,P=g.player,q=g.QUESTS.find(x=>x.id==='q16'),m=g.spawnElite(q);m.dead=false;m.hp=m.max;m.aggro=true;m.ret=false;m.bp=null;m.x=m.home.x;m.y=m.home.y;P.x=m.x+55;P.y=m.y+15;P.hp=1e8;
      g.setTarget(m);g.bpStart(m,'volley',55);for(let i=0;i<14;i++){m.atkT=99;P.lastHit=1e12;g.step(1,.05);}g.tgtInfo(m);P.hp=g.pStats().hp;g.snapCam();g.render();const e=document.getElementById('tgtI');const r=e.getBoundingClientRect();return {tx:e.textContent,hid:e.hidden,tip:e.title,in:r.top>=0&&r.bottom<=720&&r.right<=1280};})()""")
    print(' tgt',r)
    chk(not r['hid'] and r['tx'].startswith('♛') and '3갈래' in r['tx'],'타깃 창 ♛ 칩 · 3갈래 투사체')
    chk('둔화' in r['tx'] and '100%' in r['tx'] and '졸개' in r['tx'],'칩: 3갈래 명중 100% → 둔화 · 졸개 소환 대응법')
    chk(r['in'],'타깃 창 화면 안')
    pg.screenshot(path='shots/v469_동굴버섯_3갈래.png')
    r=pg.evaluate("""(()=>{const g=__g,P=g.player,q=g.QUESTS.find(x=>x.id==='q19'),m=g.spawnElite(q);m.dead=false;m.hp=m.max;m.aggro=true;m.ret=false;m.bp=null;m.x=m.home.x;m.y=m.home.y;P.x=m.x+45;P.y=m.y+10;P.hp=1e8;
      g.setTarget(m);g.bpStart(m,'guard',45);for(let i=0;i<16;i++){m.aoeT=99;P.lastHit=1e12;g.step(1,.05);}g.tgtInfo(m);P.hp=g.pStats().hp;g.snapCam();g.render();return {st:g.mobState(m),tx:document.getElementById('tgtI').textContent};})()""")
    print(' guard tgt',r);chk(r['st']=='웅크림' and '웅크림' in r['tx'] and '스킬' in r['tx'],'타깃 창 "웅크림" · 대응법(큰 스킬 아끼기)')
    pg.screenshot(path='shots/v469_등잔달팽이_방어태세.png')
    vt=pg.evaluate("(()=>{const r=document.getElementById('verTag').getBoundingClientRect();return [r.left,r.bottom];})()");chk(vt[0]<200 and vt[1]>600,'왼쪽 아래 버전 표시')
    pg.evaluate("(()=>{__g.closeModal();__g.save();})()")
    sv=pg.evaluate("localStorage.getItem('rowen-mmo-v4')");pg.close()
    chk('"sumOf"' not in sv and '"sumD"' not in sv,'세이브에 패턴 · 졸개 상태 없음(런타임)')
    e2=[];pg2=b.new_page(viewport={'width':1280,'height':720});pg2.on('pageerror',lambda e:e2.append(str(e)))
    pg2.goto('file://'+HTML);pg2.evaluate("s=>localStorage.setItem('rowen-mmo-v4',s)",sv);pg2.reload();pg2.wait_for_function('window.__ready===true',timeout=120000);pg2.click('#btnCont',timeout=60000);pg2.wait_for_timeout(600);pg2.evaluate("window.requestAnimationFrame=()=>0;__g.step(40,.05);__g.render()")
    chk(not e2,'이전 세이브 이어하기 → 오류 없음')
    pg2.close();b.close()
    chk(not errs,'페이지 오류 없음 '+str(errs[:2]))
    print('표(자동 전투 · 처치까지):')
    for qid,lv,seed,n,o,rt in rows:print('  %s Lv%d s%d  새 %.1f초 피해 %d  옛 %.1f초 피해 %d  초당 피해비 %.2f  %s'%(qid,lv,seed,n['sec'],n['taken'],o['sec'],o['taken'],rt,json.dumps(n['bp'])))
print('PASS',ok)
