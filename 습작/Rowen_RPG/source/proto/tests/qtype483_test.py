"""v4.83 G10 새 서브 유형 (지시서 §G10) — 탐색(reach) · 방어(wave) · 보상 택1(pick)
1) 배치: 지역마다 탐색 2 · 방어 1 · 택1 2 = 15개 · 옛 곁가지 서브 15개와 바꿔 끼움(관문 · 메인의 서브 수 그대로) · 주는 사람이 그 지역 NPC
2) 탐색: 지점 3곳(사냥터 안 · 서로 떨어짐) · 반경 안에 들어가야 확인 · 진행 표시 · 매복(확률 고정) · 자동 진행이 순회해서 끝냄
3) 방어: 지점에 서야 웨이브 · 3 · 4 · 5마리 · 다 잡아야 다음 · 벗어나 있으면 안 옴 · 웨이브 몬스터는 다시 안 나옴 · 다른 퀘스트 처치 수에 안 듦 · 자동 진행이 끝냄
4) 택1: 자동 진행은 고르지 않고 기다림(자동 버튼 없음) · 고르면 그 보상만 · [나중에] → 자동 진행이 다른 일을 함 · 다시 가면 고를 수 있음
5) 옛 서브 세이브 이전(끝냄 · 보상 전 · 진행 중 · 받기 전) · 이어하기 · 버전 · 화면(shots/v483_*.png)"""
import os,sys,json
from playwright.sync_api import sync_playwright
HTML=os.path.abspath('rowen_mmo_local.html');os.makedirs('shots',exist_ok=True);N=[0,0]
def chk(c,msg):
    N[0]+=1;N[1]+=0 if c else 1;print(('ok  ' if c else 'FAIL'),msg)
def boot(b,save=None):
    pg=b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML)
    if save is not None:pg.evaluate("s=>localStorage.setItem('rowen-mmo-v4',s)",json.dumps(save));pg.reload()
    pg.wait_for_function('window.__ready===true',timeout=120000)
    if save is None:pg.evaluate("localStorage.clear()")
    pg.click('#btnStart' if save is None else '#btnCont',timeout=60000);pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0");return pg,errs
# 캐릭터를 세게 만들고(죽지 않게) 서브 하나를 진행 중으로
PREP="""(id)=>{const g=__g,S=g.S,P=g.player;S.lv=40;S.st={str:150,vit:150,dex:30,int:30};S.autoPot=false;S.hpPot=0;S.autoGrow=false;S.maps=['rowen','kardo','erna'];P.hp=g.pStats().hp;
  if(id){S.sq[id]={st:'active',n:0};}g.save();return g.pStats().hp;}"""
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']);pg,errs=boot(b)
    ver=pg.evaluate("document.body.innerText.match(/v4\\.\\d+/)[0]");chk(ver.startswith('v4.'),'버전 표시 '+ver)
    E=lambda s,a=None:pg.evaluate(s,a)
    # 1) 배치
    D=E("""()=>{const g=__g,o={};for(const id of Object.values(g.XQ_OLD)){const q=g.SUBQ[id];o[id]={type:q.type,pick:!!q.rw.pick,np:q.rw.pick?q.rw.pick.length:0,map:g.ZALL[q.zone].map,giver:g.NALL[q.giver].map,n:q.n};}
      const used=[],old=[];for(const q of g.QUESTS)for(const s of q.subs||[]){if(g.XQ_OLD[s])old.push(s);if(Object.values(g.XQ_OLD).includes(s))used.push(s);}
      return {o,used,old,nsub:g.QUESTS.reduce((a,q)=>a+(q.subs||[]).length,0),keep:Object.keys(g.XQ_OLD).every(k=>!!g.SUBQ[k])};}""")
    cnt={}
    for id,d in D['o'].items():
        k='pick' if d['pick'] else d['type'];cnt.setdefault(d['map'],{}).setdefault(k,0);cnt[d['map']][k]+=1
    chk(all(cnt[m]=={'reach':2,'wave':1,'pick':2} for m in ('rowen','kardo','erna')) and len(D['o'])==15,'지역마다 탐색 2 · 방어 1 · 택1 2 '+json.dumps(cnt))
    chk(sorted(D['used'])==sorted(D['o'].keys()) and not D['old'] and D['keep'],'새 서브 15개가 모두 메인에 달렸고 옛 id는 메인에 없다(옛 데이터는 남아 있음) · 서브 총수 %d'%D['nsub'])
    chk(all(d['map']==d['giver'] for d in D['o'].values()),'주는 사람이 그 사냥터와 같은 지역')
    chk(all(2<=d['np']<=3 for d in D['o'].values() if d['pick']),'택1 보상은 2~3개')
    # 2) 탐색 ex1 (로웬 z3)
    E("window.R0=Math.random");E(PREP,'ex1');E("__g.S.autoQ=false;__g.step(2,.05)")
    R=E("""()=>{const g=__g,s=g.S.sq.ex1,Z=g.ZALL.z3.r;return {pts:s.pts,inz:s.pts.every(p=>p[0]>=Z[0]-40&&p[0]<=Z[2]+40&&p[1]>=Z[1]-40&&p[1]<=Z[3]+40),min:Math.min(...s.pts.flatMap((a,i)=>s.pts.slice(i+1).map(b=>Math.hypot(a[0]-b[0],a[1]-b[1])))),n:s.n,goal:g.qGoal?0:0}}""")
    chk(len(R['pts'])==3 and R['inz'] and R['min']>80,'탐색 지점 3곳 · 사냥터 안 · 서로 %d 이상 떨어짐'%R['min'])
    r=E("""()=>{const g=__g,s=g.S.sq.ex1,P=g.player,p=s.pts[1];Math.random=()=>.99;P.x=p[0]+g.XQ.r+6;P.y=p[1];g.step(2,.05);const a=s.n;P.x=p[0]+g.XQ.r-4;g.step(2,.05);const b=s.n,v=s.v;g.step(20,.05);return [a,b,v,s.n,s.st]}""")
    chk(r==[0,1,2,1,'active'],'반경 밖 = 그대로 · 반경 안 = 지점 확인 1/3(같은 지점은 한 번만) '+str(r))
    amb=E("""()=>{const g=__g,s=g.S.sq.ex1,P=g.player,p=s.pts[0];for(const m of g.mobsAll())m.aggro=false;Math.random=()=>.01;P.x=p[0];P.y=p[1];g.step(1,.05);const n=g.mobsAll().filter(m=>m.aggro&&!m.dead).length;Math.random=()=>.99;return [s.n,n]}""")
    chk(amb[0]==2 and 1<=amb[1]<=2,'매복(확률 고정) → 가까운 몬스터 %d마리가 덤빔'%amb[1])
    tr=E("(()=>{Math.random=R0;__g.step(12,.05);const e=[...document.querySelectorAll('#qlist .qe')].map(x=>x.innerText.replace(/\\n/g,' ')).find(x=>x.includes('평원 길 살피기'));return e||''})()")
    chk('2/3' in tr,'트래커 카드 진행 표시 「%s」'%tr[:50])
    pg.evaluate("__g.snap&&__g.snap();__g.render()");pg.screenshot(path='shots/v483_탐색.png')
    mm=E("(()=>{const c=document.querySelector('#mini')||document.querySelector('.mm canvas'),g=c.getContext('2d'),d=g.getImageData(0,0,c.width,c.height).data;let n=0;for(let i=0;i<d.length;i+=4)if(d[i]===0x8f&&d[i+1]===0xe8&&d[i+2]===0xff)n++;return n})()")
    chk(mm>=8,'미니맵에 남은 탐색 지점 표시(하늘색 %d칸)'%mm)
    # 자동 진행으로 끝까지(지점 → 보상)
    E("(()=>{const g=__g,S=g.S;S.sq.ex1={st:'active',n:0};S.autoQ=true;g.subGo('ex1');})()")
    for i in range(80):
        E("__g.step(40,.05)")
        if E("__g.S.sq.ex1.st")=='clear':break
    chk(E("__g.S.sq.ex1.st")=='clear','자동 진행이 지점 3곳을 돌고 보상까지 받음(%d회 · %s)'%(i,E("JSON.stringify(__g.S.sq.ex1)")[:60]))
    # 3) 방어 ex3 (로웬 z3)
    E("(()=>{const g=__g,S=g.S;S.autoQ=false;g.cancelNav&&g.cancelNav();g.setAuto(false);S.sq.ex3={st:'active',n:0};const c=g.ZALL.z3.c;g.player.x=c[0];g.player.y=c[1];g.step(2,.05);})()")
    WV=E("__g.XQ.wave");chk(WV==[3,4,5],'웨이브 크기 '+str(WV))
    w=E("""()=>{const g=__g,s=g.S.sq.ex3,P=g.player,p=s.pts[0],out={};P.x=p[0]+g.XQ.near+30;P.y=p[1];g.step(4,.05);out.far=g.xqWaveMobs('ex3').filter(m=>!m.dead).length;
      P.x=p[0];P.y=p[1];P.hp=1e7;g.step(1,.05);const W=g.xqWaveMobs('ex3');out.w1=W.filter(m=>!m.dead).length;out.agg=W.every(m=>m.aggro);out.zone=W.every(m=>m.zone==='z3');out.lo=W.every(m=>m.lv===Math.min(g.S.lv,g.ZALL.z3.mobs.find(r=>r[0]===m.sp)[1]));out.nob=W.every(m=>g.mobBeh(m)!=='burst');
      const k0=g.S.kills,qn=g.S.qn,sq=JSON.stringify(Object.fromEntries(Object.entries(g.S.sq).filter(([k])=>k!=='ex3').map(([k,v])=>[k,v.n])));
      const L=W.filter(m=>!m.dead);L.slice(0,-1).forEach(m=>g.killMob(m));out.mid=[s.n,g.xqWaveMobs('ex3').filter(m=>!m.dead).length];g.killMob(L[L.length-1]);out.after1=s.n;
      out.other=sq===JSON.stringify(Object.fromEntries(Object.entries(g.S.sq).filter(([k])=>k!=='ex3').map(([k,v])=>[k,v.n])))&&qn===g.S.qn;
      g.step(20,.05);out.gap=g.xqWaveMobs('ex3').filter(m=>!m.dead).length;g.step(60,.05);P.hp=1e7;out.w2=g.xqWaveMobs('ex3').filter(m=>!m.dead).length;
      for(const m of g.xqWaveMobs('ex3'))if(!m.dead)g.killMob(m);out.after2=s.n;g.step(200,.05);P.hp=1e7;out.resp=g.xqWaveMobs('ex3').filter(m=>!m.dead).length;
      for(const m of g.xqWaveMobs('ex3'))if(!m.dead)g.killMob(m);out.end=[s.n,s.st];g.step(300,.05);out.gone=g.xqWaveMobs('ex3').filter(m=>!m.dead).length;return out;}""")
    chk(w['far']==0,'지점에서 떨어져 있으면 웨이브가 오지 않는다')
    chk(w['nob'],'웨이브에 자폭형이 없다')
    chk(w['w1']==WV[0] and w['agg'] and w['zone'] and w['lo'],'지점에 서면 1웨이브 %d마리(종마다 가장 낮은 레벨) · 모두 덤빔 · 그 사냥터 소속'%WV[0])
    chk(w['mid']==[0,1] and w['after1']==1 and w['other'],'하나 남기고 처치 = 아직 0/3 · 다 잡아야 1/3 · 다른 퀘스트 처치 수에 안 듦 '+str(w['mid']))
    chk(w['gap']==0 and w['w2']==WV[1] and w['after2']==2 and w['resp']==WV[2],'다음 웨이브는 %.1f초 뒤 · 2웨이브 %d · 3웨이브 %d마리'%(E("__g.XQ.gap"),w['w2'],w['resp']))
    chk(w['end']==[3,'done'] and w['gone']==0,'3웨이브를 막으면 완료 · 웨이브 몬스터는 다시 나오지 않는다 '+str(w['end']))
    # 자동 진행으로 방어 끝까지
    E("(()=>{const g=__g,S=g.S;S.qi=g.QUESTS.findIndex(q=>(q.subs||[]).includes('ex3'));S.qs='active';S.qn=0;S.hpPot=20;S.mpPot=20;for(const m of g.xqWaveMobs('ex3')){m.dead=true;m.respawn=1e9;m.mesh.visible=false;}S.sq.ex3={st:'active',n:0};S.autoQ=true;const c=g.ZALL.z2.c;g.player.x=c[0];g.player.y=c[1];g.autoNext();})()");shot=False
    for i in range(160):
        E("__g.step(40,.05)")
        if not shot and E("__g.xqWaveMobs('ex3').filter(m=>!m.dead).length")>=3:
            pg.evaluate("__g.snap&&__g.snap();__g.render()");pg.screenshot(path='shots/v483_방어.png');shot=True
        if E("__g.S.sq.ex3.st")=='clear':break
    if E("__g.S.sq.ex3.st")!='clear':print('  DBG',E("(()=>{const g=__g,P=g.player,W=g.xqWaveMobs('ex3');return JSON.stringify({p:[Math.round(P.x),Math.round(P.y)],nav:g.nav&&g.nav.label,hunt:g.hunt&&[g.hunt.zone,g.hunt.sub],auto:g.auto,autoQ:g.S.autoQ,dead:P.dead,hp:Math.round(P.hp),pot:g.S.hpPot,tg:g.target&&[g.target.wave||g.target.sp,Math.round(g.target.hp)],modal:g.modal&&g.modal.name,win:!!g.win,W:W.map(m=>[Math.round(m.x),Math.round(m.y),Math.round(m.hp),m.aggro?1:0,m.ret?1:0,m.dead?1:0].join('/'))})})()"))
    chk(E("__g.S.sq.ex3.st")=='clear' and E("__g.player.dead")==False,'자동 진행이 방어 3웨이브를 끝내고 보상까지(%d회 · %s)'%(i,E("JSON.stringify(__g.S.sq.ex3)")[:70]))
    # 4) 택1 ex2
    E("(()=>{const g=__g,S=g.S;S.autoQ=true;g.cancelNav&&g.cancelNav();S.sq.ex2={st:'done',n:6};window.G0=S.gold;window.ST0=S.stone;g.subGo('ex2');})()")
    for i in range(60):
        E("__g.step(40,.05)")
        if E("!!(__g.modal&&__g.modal.pick)"):break
    m=E("(()=>{const m=__g.modal;return m?{pick:m.pick,btns:m.btns.map(b=>b.t),auto:!!m.autoBtn}:null})()")
    chk(m and m['pick']=='ex2' and len(m['btns'])==4 and m['btns'][-1]=='나중에' and not m['auto'],'택1 창: 보상 3개 + [나중에] · 자동 버튼 없음 '+str(m and m['btns']))
    E("__g.step(200,.05)");chk(E("__g.S.sq.ex2.st")=='done' and E("!!(__g.modal&&__g.modal.pick)"),'자동 진행은 고르지 않고 기다린다(10초 뒤에도 그대로)')
    pg.evaluate("__g.snap&&__g.snap();__g.render()");pg.screenshot(path='shots/v483_택1.png')
    bx=E("(()=>{const bs=[...document.querySelectorAll('#dlgA button')].map(e=>e.getBoundingClientRect());return bs.every(r=>r.bottom<=innerHeight&&r.right<=innerWidth&&r.top>=0)&&bs.length})()")
    chk(bx==4,'택1 버튼 4개가 화면 안(스크롤 없이)')
    E("__g.modal.btns[3].f()");E("__g.step(120,.05)")
    chk(E("__g.S.sq.ex2.hold")==1 and E("__g.S.sq.ex2.st")=='done' and not E("!!(__g.modal&&__g.modal.pick)"),'[나중에] → 보상 전 그대로 · 자동 진행이 그 창을 다시 열지 않는다')
    E("(()=>{__g.S.autoQ=false;__g.cancelNav&&__g.cancelNav();__g.subGo('ex2');})()")
    for i in range(60):
        E("__g.step(40,.05)")
        if E("!!(__g.modal&&__g.modal.pick)"):break
    r=E("(()=>{const g=__g,S=g.S,sh=S.shard;g.modal.btns[1].f();return {st:S.sq.ex2.st,gold:S.gold-G0,stone:S.stone-ST0,sh:S.shard-sh,hold:S.sq.ex2.hold||0}})()")
    chk(r['st']=='clear' and r['gold']<100 and r['stone']==6 and r['sh']==0 and r['hold']==0,'직접 다시 가서 두 번째를 고름 → 강화석 6만(골드 · 권능 파편 묶음은 안 받음) '+json.dumps(r))
    chk(E("(()=>{const g=__g;g.S.sq.ex5={st:'done',n:30};const s0=g.S.stone;g.claimSub('ex5');const a=g.S.sq.ex5.st;g.claimSub('ex5',9);return a==='done'&&g.S.sq.ex5.st==='done'&&g.S.stone===s0})()"),'고르지 않은 채(또는 없는 번호로)는 보상을 받을 수 없다')
    # 5) 세이브 이전
    E("__g.save()");base=json.loads(E("localStorage.getItem('rowen-mmo-v4')"))
    s=json.loads(json.dumps(base))
    for k in ('ex1','ex2','ex3','ex5','ex4'):s['sq'].pop(k,None)
    s['sq'].update({'sd1':{'st':'clear','n':20},'sd2':{'st':'done','n':6},'sd3':{'st':'active','n':5},'sd4':{'st':'avail','n':0},'ht1':{'st':'active','n':12}})
    pg2,e2=boot(b,s);pg2.evaluate("__g.step(10,.05)")
    r=pg2.evaluate("(()=>{const q=__g.S.sq;return [q.ex1&&q.ex1.st,q.ex2&&q.ex2.st,q.ex3&&q.ex3.st,q.ex4&&q.ex4.st,q.ex5&&q.ex5.st,['sd1','sd2','sd3','sd4','ht1'].filter(k=>q[k]).length]})()")
    chk(r==['clear','done','avail','avail','avail',0] and not e2,'옛 서브 세이브: 끝냄 → 끝냄 · 보상 전 → 보상 전 · 진행 중/받기 전 → 새 서브 받기 전 · 옛 항목 없음 %s %s'%(r,e2[:1]))
    vt=pg2.evaluate("(()=>{const e=document.getElementById('verTag'),r=e.getBoundingClientRect();return [e.textContent,r.left,r.bottom,innerHeight]})()")
    chk(vt[0].startswith('v4.') and vt[1]<200 and vt[2]<=vt[3],'왼쪽 아래 버전 %s 화면 안'%vt[0])
    chk(not errs,'페이지 오류 없음 '+str(errs[:2]))
    b.close()
print('%d/%d ok'%(N[0]-N[1],N[0]));sys.exit(1 if N[1] else 0)
