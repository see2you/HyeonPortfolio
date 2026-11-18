"""v4.73 G3-a (지시서 §G3) 보스 전용 장비 고유 효과 — 효과 엔진(gearFx · 훅 4개) + 로웬 6종
1) 데이터: GFX 6종 · BU[id].fx 붙음 · 아직 효과 없는 12종(G3-b)은 fx 없음
2) 착용 → gearFx에 켜짐 · 해제 → 꺼짐 · 컬렉션 등록(장비 사라짐) → 꺼짐
3) b6a 평타 3번째마다 ×1.40 (1,1,1.4,1,1,1.4) · 실제 평타 피해가 3번째에 커짐
4) b6b 이동 속도 ×1.06
5) b10a 독 지속 ×0.5 (다른 상태이상은 그대로)
6) b10b MP 물약 회복 ×1.25
7) b12a 평타 → 화상 3초 · 초당 공격력 ×0.10 · 3번 · 갱신 시 1초 박자 유지 · 끝나면 사라짐
8) b12b HP 30% 이하 공격 +12% · 31%엔 없음 · 전투력(cpOf · noBuff)에는 안 들어감
9) 툴팁: 주황 '◆ 고유 효과' 한 줄 · 착용 중 '켜짐'
10) 이전 세이브(보스 장비가 있는) 이어하기 → 효과 붙음 · 오류 없음
11) 화면: 가방 장갑 칸 툴팁 1280×720 · 왼쪽 아래 버전(shots/v473_*.png)"""
import os,sys
sys.path.insert(0,os.path.dirname(__file__))
from rng_probe452 import page,ARGS,HTML
from playwright.sync_api import sync_playwright
os.makedirs('shots',exist_ok=True)
ok=0
def chk(c,msg):
    global ok
    assert c,msg;ok+=1;print('  ok',msg)
GIVE="(id)=>{const g=__g,S=g.S;const it=g.newBU(id);S.items.push(it);g.bumpGear();return it.u;}"
EQ="(u)=>{const g=__g;g.equipItem(u,true);g.bumpGear();return Object.keys(g.gearFx());}"
with sync_playwright() as p:
    b=p.chromium.launch(args=ARGS);errs=[];pg=page(b,errs)
    ver=pg.evaluate("document.getElementById('verTag').textContent");chk(ver.startswith('v4.'),'버전 표시 '+ver)
    pg.evaluate("(()=>{const g=__g;for(const m of g.mobs){m.aggro=false;m.dead=true;m.respawn=1e9;m.deadT=-1e9;}g.S.lv=12;g.S.autoQ=false;g.setAuto(false);g.autoGrowNow();})()")
    # 1) 데이터
    d=pg.evaluate("(()=>{const g=__g;return {k:Object.keys(g.GFX),fx:Object.keys(g.BU).filter(i=>g.BU[i].fx),n:Object.keys(g.BU).length};})()")
    chk(d['k'][:6]==['b6a','b6b','b10a','b10b','b12a','b12b'] and d['fx']==d['k'] and d['n']==18,'로웬 6종에 고유 효과(v4.74부터 18종 모두)');d['k']=d['k'][:6]
    # 2) 착용 · 해제 · 등록
    u={k:pg.evaluate(GIVE,k) for k in d['k']}
    r=pg.evaluate(EQ,u['b12a']);chk(r==['b12a'],'용암 장갑 착용 → 켜짐 '+str(r))
    r=pg.evaluate("(()=>{const g=__g;g.unequip('gloves',true);return Object.keys(g.gearFx());})()");chk(r==[],'해제 → 꺼짐')
    r=pg.evaluate("""(u)=>{const g=__g,S=g.S;g.equipItem(u,true);const a=Object.keys(g.gearFx());S.items=S.items.filter(i=>i.u!==u);g.bumpGear();return [a,Object.keys(g.gearFx())];}""",u['b12a'])
    chk(r[0]==['b12a'] and r[1]==[],'장비가 가방에서 사라지면(등록 · 분해) → 꺼짐')
    pg.evaluate("(()=>{const g=__g;g.S.eq.gloves=null;g.bumpGear();})()")
    r=pg.evaluate("""(u)=>{const g=__g,S=g.S;for(const c of g.COLL){const i=c.req.findIndex(q=>q.bu==='b6b');if(i>=0){const ok=g.collRegister(c.id,i,u);g.bumpGear();return {ok,has:!!g.itemById(u),fx:Object.keys(g.gearFx())};}}return null;}""",u['b6b'])
    print(' coll',r)
    chk(r is None or (r['ok'] and not r['has'] and r['fx']==[]),'컬렉션 등록 → 장비가 사라져 효과 없음 '+str(r))
    u['b6b']=pg.evaluate(GIVE,'b6b')
    # 3) b6a
    pg.evaluate(EQ,u['b6a'])
    r=pg.evaluate("(()=>{const g=__g,P=g.player;P.g3n=0;const m=g.mobs[0];return [1,2,3,4,5,6].map(()=>g.gfxBasic(m));})()")
    chk([round(x,3) for x in r]==[1,1,1.4,1,1,1.4],'엄니 도끼: 평타 3번째마다 ×1.40 '+str(r))
    # 실제 평타 경로: 같은 난수로 3번 → 3번째만 1.4배
    r=pg.evaluate("""(()=>{const g=__g,P=g.player,S=g.S;Math.random=()=>.5;const m=g.mobs.find(e=>!e.boss&&!e.eliteOf);m.dead=false;m.max=m.hp=1e9;m.def=0;m.x=P.x+20;m.y=P.y;m.home={x:m.x,y:m.y};m.aggro=false;m.atk=0;P.g3n=0;const out=[];
      for(let i=0;i<3;i++){const h=m.hp;P.atkT=0;P.swing=0;P.swingHit=false;const ok=g.basicAttack(m);for(let k=0;k<8;k++){g.step(1,.05);m.x=P.x+20;m.y=P.y;m.ret=false;}out.push(ok?h-m.hp:-1);}m.dead=true;return out;})()""")
    print(' basic',r);chk(r[0]>0 and abs(r[1]/r[0]-1)<.02 and abs(r[2]/r[0]-1.4)<.03,'실제 평타 3번째 피해 ×1.40 (%.0f · %.0f · %.0f)'%tuple(r))
    # 4) b6b
    r=pg.evaluate("(u)=>{const g=__g;const a=g.pSPD();g.equipItem(u,true);g.bumpGear();return [a,g.pSPD(),g.SPD];}",u['b6b'])
    chk(abs(r[0]-r[2])<1e-9 and abs(r[1]/r[0]-1.06)<1e-9,'가죽 장화: 이동 속도 ×1.06 (%.2f → %.2f)'%(r[0],r[1]))
    # 5) b10a
    r=pg.evaluate("(u)=>{const g=__g;const a=[g.fxDur('poison'),g.fxDur('burn')];g.equipItem(u,true);g.bumpGear();return [a,[g.fxDur('poison'),g.fxDur('burn')],g.FXDEF.poison.dur];}",u['b10a'])
    chk(r[0][0]==r[2] and abs(r[1][0]-r[2]*.5)<1e-9 and r[1][1]==r[0][1],'비늘 갑옷: 독 지속 %.1f → %.1f초 · 화상 그대로'%(r[0][0],r[1][0]))
    r=pg.evaluate("(()=>{const g=__g,P=g.player;g.clearStatus();g.addFx('poison',{name:'x',atk:10});const d=P.fx.poison.until-g.t;g.clearStatus();return d;})()")
    chk(abs(r-pg.evaluate("__g.FXDEF.poison.dur")*.5)<1e-6,'실제로 걸린 독 남은 시간 %.2f초'%r)
    # 6) b10b
    r=pg.evaluate("""(u)=>{const g=__g,P=g.player,S=g.S;const one=()=>{S.mpPot=5;P.potT=0;P.mp=0;g.usePot('mp',true);return P.mp;};const a=one(),m0=g.pStats().mp;g.equipItem(u,true);g.bumpGear();const b=one();return [a,b,Math.max(30,m0*.4),Math.max(30,g.pStats().mp*.4)];}""",u['b10b'])
    chk(abs(r[0]-r[2])<1e-6 and abs(r[1]-r[3]*1.25)<1e-6,'물뱀 눈 목걸이: MP 물약 %.0f → %.0f (기본 %.0f ×1.25 · 목걸이 MP +20 포함)'%(r[0],r[1],r[3]))
    # 7) b12a
    u['b12a']=pg.evaluate(GIVE,'b12a');pg.evaluate(EQ,u['b12a'])
    r=pg.evaluate("""(()=>{const g=__g,P=g.player;const m=g.mobs.find(e=>!e.boss&&!e.eliteOf&&!(e.fa>0));m.dead=false;m.max=m.hp=1e9;m.x=P.x+300;m.y=P.y;m.aggro=false;m.ret=false;
      g.gfxAfterBasic(m);const b=JSON.parse(JSON.stringify(m.gburn)),dps=g.pStats().atk*.10,t0=g.t,h0=m.hp,ticks=[];let last=m.hp;
      for(let i=0;i<100;i++){g.step(1,.05);m.x=P.x+300;m.y=P.y;if(m.hp<last){ticks.push(+(g.t-t0).toFixed(2));last=m.hp;}}
      return {u:b.u-t0,dps:b.dps,want:dps,dmg:h0-m.hp,ticks,left:m.gburn};})()""")
    print(' burn',r)
    chk(abs(r['u']-3)<1e-6 and abs(r['dps']-r['want'])<1e-6,'화상 3초 · 초당 %.1f (공격력 ×0.10)'%r['dps'])
    chk(len(r['ticks'])==3 and abs(r['dmg']-3*r['dps'])<1e-3 and r['left'] is None,'1초마다 3번 · 합 %.1f · 끝나면 사라짐 %s'%(r['dmg'],r['ticks']))
    r=pg.evaluate("""(()=>{const g=__g,P=g.player;const m=g.mobs.find(e=>!e.boss&&!e.eliteOf&&!(e.fa>0));m.max=m.hp=1e9;g.gfxAfterBasic(m);const tk=m.gburn.tk;g.step(10,.05);g.gfxAfterBasic(m);const o={same:m.gburn.tk===tk,u:m.gburn.u-g.t};g.step(5,.05);g.gfxAfterBasic(m);g.step(100,.05);m.dead=true;return o;})()""")
    chk(r['same'] and abs(r['u']-3)<1e-6,'다시 때리면 3초로 갱신 · 1초 박자는 유지(중첩 없음)')
    # 8) b12b
    r=pg.evaluate("""(u)=>{const g=__g,P=g.player;g.unequip('gloves',true);g.equipItem(u,true);g.bumpGear();const H=g.pStats().hp;
      P.hp=H;const full=g.pStats().atk,cp0=g.cpOf();P.hp=Math.floor(H*.31);const a31=g.pStats().atk;P.hp=Math.floor(H*.25);const a25=g.pStats().atk,nb=g.pStats(null,true).atk,cp1=g.cpOf();P.hp=H;return {full,a31,a25,nb,cp0,cp1};}""",u['b12b'])
    print(' low',r)
    chk(r['a31']==r['full'] and abs(r['a25']/r['full']-1.12)<.02,'심장 반지: HP 25%% 공격 %d → %d (+12%%) · 31%%엔 그대로'%(r['full'],r['a25']))
    chk(r['nb']==r['full'] and r['cp0']==r['cp1'],'전투력 · noBuff 능력치에는 안 들어감')
    # 9) 툴팁 + 11) 화면
    pg.evaluate("(()=>{const g=__g;g.unequip('ring1',true);g.unequip('ring2',true);g.S.eq.gloves=null;g.bumpGear();})()")
    pg.evaluate(EQ,u['b12a']);pg.evaluate(EQ,u['b12b'])
    t=pg.evaluate("(u)=>{const g=__g;const a=document.createElement('div'),b=document.createElement('div');g.itemTip(a,g.itemById(u));const n=g.newItem('gloves',2,1);g.S.items.push(n);g.itemTip(b,n);g.S.items.pop();const f=a.querySelector('.tgfx');return [f&&f.textContent,f&&f.style.color,!!b.querySelector('.tgfx')];}",u['b12a'])
    chk(t[0] and '고유 효과' in t[0] and '켜짐' in t[0] and t[1]=='rgb(255, 160, 74)' and not t[2],'툴팁 주황 한 줄 '+str(t[0])+' · 효과 없는 장비엔 줄 없음')
    t=pg.evaluate("(u)=>{const a=document.createElement('div');__g.itemTip(a,__g.itemById(u));return a.querySelector('.tgfx').textContent;}",pg.evaluate(GIVE,'b6b'))
    chk('착용 중에만' in t,'착용 안 한 장비: '+t)
    pg.evaluate("(()=>{const g=__g;g.player.hp=g.pStats().hp;g.openBag();g.render();})()")
    clicked=pg.evaluate("(()=>{const b=[...document.querySelectorAll('#win .eqs.has')].find(x=>x.title.includes('용암 장갑'));if(!b)return false;b.click();return true;})()")
    pg.wait_for_timeout(200)
    vis=pg.evaluate("(()=>{const e=document.querySelector('#itip .tgfx');if(!e)return null;const r=e.getBoundingClientRect();return [r.left,r.top,r.right,r.bottom];})()")
    chk(clicked and vis and vis[0]>=0 and vis[3]<=720 and vis[2]<=1280,'가방 장갑 칸 툴팁에 고유 효과 줄이 화면 안 '+str(vis))
    pg.screenshot(path='shots/v473_툴팁.png')
    vt=pg.evaluate("(()=>{const r=document.getElementById('verTag').getBoundingClientRect();return [r.left,r.bottom];})()");chk(vt[0]<200 and vt[1]>600,'왼쪽 아래 버전 표시')
    # 10) 이전 세이브
    pg.evaluate("(()=>{__g.closeWin&&__g.closeWin();__g.save();})()");before=pg.evaluate("Object.keys(__g.gearFx()).sort()")
    sv=pg.evaluate("localStorage.getItem('rowen-mmo-v4')");pg.close()
    e2=[];pg2=b.new_page(viewport={'width':1280,'height':720});pg2.on('pageerror',lambda e:e2.append(str(e)))
    pg2.goto('file://'+HTML);pg2.evaluate("s=>localStorage.setItem('rowen-mmo-v4',s)",sv);pg2.reload();pg2.wait_for_function('window.__ready===true',timeout=120000);pg2.click('#btnCont',timeout=60000);pg2.wait_for_timeout(600);pg2.evaluate("window.requestAnimationFrame=()=>0;__g.step(20,.05);__g.render()")
    r=pg2.evaluate("Object.keys(__g.gearFx()).sort()");chk(not e2 and r==before and len(r)==6,'세이브 이어하기 → 장비 효과 그대로 붙음(이전 코드 불필요) '+str(r))
    pg2.close();b.close()
    chk(not errs and not e2,'페이지 오류 없음 '+str((errs+e2)[:2]))
print('PASS gfx473 %d'%ok)
