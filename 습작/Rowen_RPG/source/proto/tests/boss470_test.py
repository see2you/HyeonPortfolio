"""v4.70 G1-g2 (지시서 §G1) 보스 패턴 — 에르나 3보스(거목 불티나무 q27 · 흑요석 대게 q30 · 불새 여왕 홍염 q32)
1) 배정: q27 3갈래 + 불씨 장판(남는 불 4초 · 화상) · q30 방어 태세 + 돌진 · q32 급강하(돌진) + 3연속(화상) + 광폭 · 지역 보스판(fb7 · fb8)도 같은 패턴
2) 패턴별: 예고 안 = 피해 · 밖 = 0 · 남는 불(1초마다 ×0.3 · 4번 · 화상 · 밖이면 0 · 보스가 쓰러지면 사라짐) · 방어 태세 배율
3) 자동 전투로 처치까지: 동시 예고 1개 · 패턴 사이 2.5초 이상 · 7초 칸 · 자동 회피 · 초당 받은 피해(옛 장판 대비) 표
4) 타깃 창 ♛ 칩(불씨 장판 · 급강하) · 이전 세이브 이어하기 · 왼쪽 아래 버전 · 스크린샷(shots/v470_*.png)"""
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

ISO_JS="""([qid,k,mode,N])=>{const g=__g,P=g.player,q=g.QUESTS.find(x=>x.id===qid);const m=g.spawnElite(q);
  for(const e of g.mobs)if(e!==m){e.aggro=false;e.ret=false;e.dead=true;e.deadT=-1e9;e.respawn=1e9;}
  m.dead=false;m.hp=m.max;m.x=m.home.x;m.y=m.home.y;m.aggro=true;m.ret=false;m.bp=null;m.rage=false;m.aoeT=99;m.atkT=99;m.wind=0;m.gdU=0;m.gdN=0;
  g.setAuto(false);P.x=m.x+40;P.y=m.y;P.hp=1e8;P.shield=0;P.dash=0;g.clearStatus();g.S.hpPot=0;
  g.bpStart(m,k,40);const id=m.bp.id,kinds=g.tele.filter(e=>e.bid===id).map(e=>e.kind+(e.aim?'*':''));let fxs={},firstHit=-1,lockAt=-1,shot=0,gOn=-1,gOff=-1;
  for(let i=0;i<(N||80);i++){m.aoeT=99;if(k!=='guard')m.atkT=99;
    if(mode==='out'){if(k==='volley'&&m.bp&&m.bp.lk&&lockAt<0){lockAt=i;P.x=m.x-70;}if(k==='fan'&&i===2){P.x=m.x-70;P.y=m.y;}if(k==='tri'&&i===0)P.y+=90;if((k==='aoe'||k==='ember')&&i===2)P.x+=120;if(k==='dash'&&m.bp&&m.bp.lk&&lockAt<0){lockAt=i;P.y+=70;}}
    if(mode==='in'&&(k==='volley'||k==='dash')&&m.bp&&m.bp.lk&&lockAt<0)lockAt=i;if(mode==='in'&&k==='dash')m.bp&&(m.bp.n=0);
    P.lastHit=1e12;const nb=m.bp&&m.bp.n;g.step(1,.05);if(mode==='out'&&k==='tri'&&m.bp&&m.bp.n>nb)P.y+=90;
    shot=Math.max(shot,g.shots.filter(s=>s.bk===k).length);if(k==='guard'){if(gOn<0&&g.guardOn(m))gOn=i;if(gOn>=0&&gOff<0&&!g.guardOn(m))gOff=i;}
    if(firstHit<0&&P.hp<1e8)firstHit=i;for(const f in P.fx)if(g.fxOn(f))fxs[f]=1;}
  const fireN=g.STAT.bp&&g.STAT.bp.fire;const r={k,fire:fireN?[fireN.n,fireN.hit]:null,dmg:Math.round(1e8-P.hp),kinds,firstHit,lockAt,shot,gOn,gOff,fx:Object.keys(fxs),bp:!!m.bp,left:g.tele.filter(e=>e.bid===id).length};g.clearStatus();return r;}"""
FIGHT_JS="""([qid,seed,pat,hpK])=>{const g=__g,P=g.player,S=g.S,q=g.QUESTS.find(x=>x.id===qid);const keep=g.BOSS_PAT[qid];if(!pat)delete g.BOSS_PAT[qid];
  const m=g.spawnElite(q);for(const e of g.mobs)if(e!==m){e.aggro=false;e.ret=false;e.dead=true;e.deadT=-1e9;e.respawn=1e9;}
  if(!m._mx)m._mx=m.max;m.max=Math.round(m._mx*hpK);m.dead=false;m.hp=m.max;m.x=m.home.x;m.y=m.home.y;m.aggro=false;m.ret=false;m.bp=null;m.rage=false;m.aoe=null;m.aoeT=5;m.atkT=1;m.wind=0;m.pi=0;
  g.STAT.bp={};g.STAT.bpRage=0;P.x=m.x+60;P.y=m.y;P.hp=1e8;P.mp=1e4;P.shield=0;g.clearStatus();S.hpPot=0;P.cd=P.cd.map(()=>0);g.resetAuto();g.setAuto(true);g.setTarget(m);
  let i=0,starts=[],ends=[],prev=null,maxTele=0,rageCd=null,taken=0;for(;i<20*240;i++){P.mp=1e4;P.lastHit=1e12;P.hp=1e8;const h0=P.hp;g.step(1,.05);if(P.hp<h0&&h0-P.hp<1e7)taken+=h0-P.hp;const c=m.bp;if(c&&c!==prev){starts.push([g.t,c.k]);}if(!c&&prev)ends.push(g.t);prev=c;
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
    b=p.chromium.launch(args=ARGS);errs=[];pg=page(b,errs,'erna')
    ver=pg.evaluate("document.getElementById('verTag').textContent");chk(ver.startswith('v4.')and ver>='v4.70','버전 표시 '+ver)
    r=pg.evaluate("""(()=>{const g=__g,B=g.BOSS_PAT;const el=id=>g.spawnElite(g.QUESTS.find(q=>q.id===id));const a=el('q27'),b=el('q30'),c=el('q32');
      const f=['q27','q30'].map(id=>!!g.bossPat({boss:true,eliteOf:id,field:true}));
      return {q27:B.q27.p.join('+')+'/'+B.q27.fx.ember+'/'+B.q27.fx.fire,q30:B.q30.p.join('+')+'/'+!!B.q30.fx,q32:B.q32.p.join('+')+'/'+B.q32.fx.tri+'/'+B.q32.rage+'/'+g.bpName(B.q32,'dash'),
        pa:!!g.bossPat(a)&&!!g.bossPat(b)&&!!g.bossPat(c),f,n:Object.keys(B).length,mobB:[a,b,c].map(x=>g.mobB(x)),fire:[g.BPAT.fire.life,g.BPAT.fire.mul,g.BPAT.fire.iv]};})()""")
    print(' 배정',r)
    chk(r['q27']=='volley+ember/burn/burn' and r['q30']=='guard+dash/false' and r['q32']=='dash+tri/burn/true/급강하','패턴 표: 불티나무 3갈래+불씨 장판(화상) · 흑요석 대게 방어 태세+돌진 · 홍염 급강하+3연속(화상)+광폭')
    chk(r['pa'] and all(r['f']) and r['n']==9,'관문 정예 9종 모두 패턴 · 지역 보스판(fb7 · fb8)에도')
    chk(r['fire']==[4,0.3,1] and all(x is None for x in r['mobB']),'남는 불 4초 · 1초마다 ×0.3 · 보스 mobB는 null')
    pg.evaluate(SETUP_JS,37)
    for qid,k,kind,N in (('q27','volley',['line*']*3,80),('q27','ember',['circle'],130),('q30','dash',['line*'],80),('q32','dash',['line*'],80),('q32','tri',['circle'],80)):
        pg.evaluate(SEED,7);a=pg.evaluate(ISO_JS,[qid,k,'in',N]);pg.evaluate(SEED,7);o=pg.evaluate(ISO_JS,[qid,k,'out',N]);print(' ',qid,k,'안',a,'밖',o)
        chk(a['kinds']==kind,qid+' '+k+' 예고 표시 '+str(a['kinds']))
        chk(a['dmg']>0 and o['dmg']==0,qid+' '+k+' 예고 안 = 피해 '+str(a['dmg'])+' · 밖 = 0')
        chk(not a['bp'] and a['left']==0,qid+' '+k+' 끝나면 패턴 · 예고 정리(남는 불 포함)')
        if k=='ember':chk('burn' in a['fx'] and 'burn' not in o['fx'],'불씨 장판 명중 = 화상 · 빗나가면 없음')
        if k=='tri':chk('burn' in a['fx'] and 'burn' not in o['fx'],'홍염 3연속 명중 = 화상')
        if k=='dash':chk(not a['fx'],qid+' 돌진 상태이상 없음')
    # 남는 불 — 장판은 피하고 불 안에 서 있기 / 밖
    r=pg.evaluate("""(()=>{const g=__g,P=g.player,q=g.QUESTS.find(x=>x.id==='q27'),m=g.spawnElite(q);for(const e of g.mobs)if(e!==m){e.aggro=false;e.dead=true;e.deadT=-1e9;e.respawn=1e9;}
      const one=(stay,kill)=>{m.dead=false;m.hp=m.max;m.x=m.home.x;m.y=m.home.y;m.aggro=true;m.ret=false;m.bp=null;m.aoeT=99;m.atkT=99;g.setAuto(false);P.x=m.x+60;P.y=m.y;P.hp=1e8;g.clearStatus();g.STAT.bp={};g.STAT.bpFire=0;
        g.bpStart(m,'ember',60);const x0=P.x,y0=P.y,id=m.bp.id;let hits=[],lin=0,fx=0,life=0;for(let i=0;i<120;i++){m.aoeT=99;m.atkT=99;P.lastHit=1e12;if(i===26)P.y+=90;if(i===29&&stay)P.y=y0;if(kill&&i===60)g.killMob(m);const fh=(g.STAT.bp.fire||{hit:0}).hit;g.step(1,.05);if((g.STAT.bp.fire||{hit:0}).hit>fh)hits.push(i);
          const L=g.tele.filter(e=>e.bid===id&&e.lin);if(L.length){lin++;life=i;}if(g.fxOn('burn'))fx=1;}
        const r={hits,lin,fx,fire:g.STAT.bp.fire,nf:g.STAT.bpFire,left:g.tele.filter(e=>e.bid===id).length};g.clearStatus();return r;};
      const a=one(true,false),o=one(false,false),k=one(true,true);for(const e of g.mobs)if(e.deadT<-1e8)e.respawn=0;return {a,o,k};})()""")
    print(' fire',r)
    a,o,k=r['a'],r['o'],r['k']
    chk(a['nf']==1 and abs(a['lin']-80)<=2,'불씨 장판이 터진 자리에 남는 불 4초 ('+str(a['lin'])+'프레임)')
    chk(len(a['hits'])==4 and a['fire']=={'n':4,'hit':4} and a['fx']==1,'불 안에 서 있으면 1초마다 4번 피해 + 화상 '+str(a['hits']))
    chk(all(h2-h1 in (19,20,21) for h1,h2 in zip(a['hits'],a['hits'][1:])),'남는 불 간격 1초')
    chk(len(o['hits'])==0 and o['fire']['hit']==0 and o['fx']==0,'불 밖이면 피해 0 · 화상 없음')
    chk(k['lin']<=34 and k['left']==0,'보스가 쓰러지면 남는 불도 사라짐')
    # 불 데미지 크기: 서 있기 1초 ≈ 장판의 0.3/2.2 비율
    # 자동 전투가 남는 불에서 걸어 나오는지
    r=pg.evaluate("""(()=>{const g=__g,P=g.player,q=g.QUESTS.find(x=>x.id==='q27'),m=g.spawnElite(q);for(const e of g.mobs)if(e!==m){e.aggro=false;e.dead=true;e.deadT=-1e9;e.respawn=1e9;}
      m.dead=false;m.hp=m.max=1e9;m.x=m.home.x;m.y=m.home.y;m.aggro=true;m.ret=false;m.bp=null;m.aoeT=99;m.atkT=99;P.x=m.x+50;P.y=m.y;P.hp=1e8;g.clearStatus();g.STAT.bp={};g.resetAuto();g.setAuto(true);g.setTarget(m);
      const id=++window.__fid||(window.__fid=900000);g.bpFire(m,P.x,P.y,id);const x0=P.x,y0=P.y;let out=-1;for(let i=0;i<80;i++){m.aoeT=99;m.atkT=99;P.lastHit=1e12;g.step(1,.05);if(out<0&&Math.hypot(P.x-x0,P.y-y0)>=g.BPAT.fire.r)out=i;}
      g.setAuto(false);const f=g.STAT.bp.fire;for(const e of g.mobs)if(e.deadT<-1e8)e.respawn=0;return {out,f};})()""")
    print(' auto fire',r)
    chk(0<=r['out']<=20 and r['f']['hit']<=1,'자동 전투가 남는 불에서 1초 안에 걸어 나옴 (프레임 '+str(r['out'])+' · 맞음 '+str(r['f']['hit'])+')')
    c=pg.evaluate(CAST_JS,['q30']);print(' guard dmg',c)
    chk(c['on'] and abs(c['ba']-0.3)<.03 and abs(c['sk']-0.7)<.03,'흑요석 대게 웅크림 중 평타 ×%.2f · 스킬 ×%.2f'%(c['ba'],c['sk']))
    pg.close()
    rows=[]
    for qid,lv,HPK in (('q27',34,3),('q30',37,3),('q32',40,1)):
        pgF=page(b,errs,'erna');pgF.evaluate(SETUP_JS,lv)
        for seed in (3,9):
            pgF.evaluate(SEED,seed);n=pgF.evaluate(FIGHT_JS,[qid,seed,True,HPK]);pgF.evaluate(SEED,seed);o=pgF.evaluate(FIGHT_JS,[qid,seed,False,HPK])
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
            if qid=='q32':chk(n['rage']==1,'홍염 광폭 1회')
            if qid=='q30':chk(n['sec']/o['sec']<=1.45,'흑요석 대게 처치 시간 옛 대비 %.2f (≤1.45)'%(n['sec']/o['sec']))
        pgF.close()
    pg=page(b,errs,'erna');pg.evaluate(SETUP_JS,34)
    r=pg.evaluate("""(()=>{const g=__g,P=g.player,q=g.QUESTS.find(x=>x.id==='q27'),m=g.spawnElite(q);m.dead=false;m.hp=m.max;m.aggro=true;m.ret=false;m.bp=null;m.x=m.home.x;m.y=m.home.y;P.x=m.x+60;P.y=m.y+10;P.hp=1e8;
      g.setTarget(m);g.bpStart(m,'ember',60);for(let i=0;i<34;i++){m.atkT=99;m.aoeT=99;P.lastHit=1e12;if(i===26)P.x+=90;g.step(1,.05);}g.tgtInfo(m);P.hp=g.pStats().hp;g.snapCam();g.render();const e=document.getElementById('tgtI');const r=e.getBoundingClientRect();return {tx:e.textContent,hid:e.hidden,tip:e.title,in:r.top>=0&&r.bottom<=720&&r.right<=1280,lin:g.tele.filter(x=>x.lin).length};})()""")
    print(' tgt',r)
    chk(r['tx']=='','타깃 창 ♛ 칩 · 3갈래 · 불씨 장판 → 화상')
    chk('남음' in r['tip'] and r['in'] and r['lin']==1,'풀이에 남는 불 · 타깃 창 화면 안 · 남는 불 그림')
    pg.screenshot(path='shots/v470_불티나무_남는불.png')
    r=pg.evaluate("""(()=>{const g=__g,P=g.player,q=g.QUESTS.find(x=>x.id==='q32'),m=g.spawnElite(q);m.dead=false;m.hp=m.max;m.aggro=true;m.ret=false;m.bp=null;m.x=m.home.x;m.y=m.home.y;P.x=m.x+70;P.y=m.y+10;P.hp=1e8;
      g.setTarget(m);g.bpStart(m,'dash',70);for(let i=0;i<6;i++){m.aoeT=99;m.atkT=99;P.lastHit=1e12;g.step(1,.05);}g.tgtInfo(m);P.hp=g.pStats().hp;g.snapCam();g.render();return {st:g.mobState(m),tx:document.getElementById('tgtI').textContent};})()""")
    print(' q32 tgt',r);chk(r['st']=='급강하 예고' and r['tx']=='','홍염: 타깃 창 "급강하 예고" · 광폭')
    pg.screenshot(path='shots/v470_홍염_급강하.png')
    vt=pg.evaluate("(()=>{const r=document.getElementById('verTag').getBoundingClientRect();return [r.left,r.bottom];})()");chk(vt[0]<200 and vt[1]>600,'왼쪽 아래 버전 표시')
    pg.evaluate("(()=>{__g.closeModal();__g.save();})()")
    sv=pg.evaluate("localStorage.getItem('rowen-mmo-v4')");pg.close()
    chk('"lin"' not in sv and '"bpFire"' not in sv,'세이브에 패턴 · 남는 불 상태 없음(런타임)')
    e2=[];pg2=b.new_page(viewport={'width':1280,'height':720});pg2.on('pageerror',lambda e:e2.append(str(e)))
    pg2.goto('file://'+HTML);pg2.evaluate("s=>localStorage.setItem('rowen-mmo-v4',s)",sv);pg2.reload();pg2.wait_for_function('window.__ready===true',timeout=120000);pg2.click('#btnCont',timeout=60000);pg2.wait_for_timeout(600);pg2.evaluate("window.requestAnimationFrame=()=>0;__g.step(40,.05);__g.render()")
    chk(not e2,'이전 세이브 이어하기 → 오류 없음')
    pg2.close();b.close()
    chk(not errs,'페이지 오류 없음 '+str(errs[:2]))
    print('표(자동 전투 · 처치까지):')
    for qid,lv,seed,n,o,rt in rows:print('  %s Lv%d s%d  새 %.1f초 피해 %d  옛 %.1f초 피해 %d  초당 피해비 %.2f  %s'%(qid,lv,seed,n['sec'],n['taken'],o['sec'],o['taken'],rt,json.dumps(n['bp'])))
print('PASS',ok)
