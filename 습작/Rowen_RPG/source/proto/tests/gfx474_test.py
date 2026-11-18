"""v4.74 G3-b (지시서 §G3) 보스 전용 장비 고유 효과 — 카르도 · 에르나 12종
1) 데이터: GFX 18종 · BU 18종 모두 fx
2) 효과마다 착용 → 켜짐 · 해제 → 꺼짐
3) b16a 회오리 베기 범위 ×1.20 (경계 밖 몬스터가 투구를 끼면 맞음)
4) b16b 비전투 HP 회복 ×2
5) b19a 장판 · 폭발 피해 ×0.75 · 일반 피해는 그대로 · 보스 장판 패턴 종류(BP_ZONE)
6) b19b 별똥별 재사용 대기 11 → 9초 · 다른 스킬 그대로 · 실제 시전
7) b21a 치명 피해 1.6 → 1.8 · 전투력 불변
8) b21b 처치 시 MP +4 · 자폭(스스로 쓰러짐)은 세지 않음
9) b27a HP 물약 대기 1.7초 · MP 물약은 2.2초
10) b27b 둔화 · 기절 지속 ×0.5 · 독 그대로
11) b30a 평타 15% 한 번 더 (Math.random 고정 0.1 → 나감 · 0.5 → 안 나감)
12) b30b HP 50% 이상 받는 피해 ×0.92 · 49%엔 그대로
13) b32a 처치 시 주변 40에 공격력 ×0.5 · 80 밖은 안 맞음 · 불꽃이 다시 부른 처치는 연쇄하지 않음
14) b32b 치명타를 받아도 HP 30%로 버팀 · 300초 안 두 번째는 쓰러짐 · 상태이상 틱 사망에도
15) 툴팁 주황 한 줄(홍염의 날개검) · 1280×720 스크린샷 · 왼쪽 아래 버전
16) 이전 세이브 이어하기 → 효과 붙음 · 오류 없음"""
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
CLR="(()=>{const g=__g,S=g.S;for(const k in S.eq)S.eq[k]=null;g.bumpGear();})()"
EQ="(u)=>{const g=__g,S=g.S;for(const k in S.eq)S.eq[k]=null;g.equipItem(u,true);g.bumpGear();return Object.keys(g.gearFx());}"
MOB="""(o)=>{const g=__g,P=g.player;const m=g.mobs.filter(e=>!e.boss&&!e.eliteOf&&!(e.fa>0)&&!e.sumOf)[o.i||0];m.dead=false;m.max=m.hp=o.hp||1e9;m.def=0;m.x=P.x+(o.dx||0);m.y=P.y+(o.dy||0);m.home={x:m.x,y:m.y};m.aggro=false;m.atk=0;m.ret=false;m.respawn=1e9;m.mesh&&(m.mesh.visible=true);return g.mobs.indexOf(m);}"""
NEW=['b16a','b16b','b19a','b19b','b21a','b21b','b27a','b27b','b30a','b30b','b32a','b32b']
with sync_playwright() as p:
    b=p.chromium.launch(args=ARGS);errs=[];pg=page(b,errs)
    ver=pg.evaluate("document.getElementById('verTag').textContent");chk(ver.startswith('v4.'),'버전 표시 '+ver)
    pg.evaluate("(()=>{const g=__g;for(const m of g.mobs){m.aggro=false;m.dead=true;m.respawn=1e9;m.deadT=-1e9;}g.S.lv=30;g.S.autoQ=false;g.setAuto(false);g.autoGrowNow();g.S.sk.whirl=1;g.S.sk.star=1;})()")
    # 1)
    d=pg.evaluate("(()=>{const g=__g;return {k:Object.keys(g.GFX),fx:Object.keys(g.BU).filter(i=>g.BU[i].fx)};})()")
    chk(len(d['k'])==18 and sorted(d['fx'])==sorted(d['k']) and all(k in d['k'] for k in NEW),'보스 전용 18종 모두 고유 효과')
    u={k:pg.evaluate(GIVE,k) for k in NEW}
    # 2)
    bad=[]
    for k in NEW:
        r=pg.evaluate(EQ,u[k]);
        if r!=[k]:bad.append((k,r))
        r2=pg.evaluate("(u)=>{const g=__g,S=g.S;for(const k in S.eq)if(S.eq[k]===u)S.eq[k]=null;g.bumpGear();return Object.keys(g.gearFx());}",u[k])
        if r2!=[]:bad.append((k,'off',r2))
    chk(not bad,'12종 착용 → 켜짐 · 해제 → 꺼짐 '+str(bad))
    # 3) b16a
    r=pg.evaluate("""(o)=>{const g=__g,P=g.player,S=g.S;const i=g.SK.findIndex(s=>s.id==='whirl');const run=()=>{const m=g.mobs[o.mi];m.dead=false;m.hp=m.max=1e9;m.x=P.x+o.d;m.y=P.y;const h=m.hp;P.cd[i]=0;P.mp=999;P.atkT=0;g.castSkill(i,true);return h-m.hp;};
      const a=run();g.equipItem(o.u,true);g.bumpGear();const b2=run();return [a,b2,g.gfxSkR('whirl'),g.gfxSkR('flame'),i];}""",{'mi':pg.evaluate(MOB,{'dx':300}),'d':0,'u':u['b16a']})
    sc=pg.evaluate("(i)=>__g.mobs[i].sc",pg.evaluate(MOB,{'dx':300}))
    pg.evaluate(CLR)
    r=pg.evaluate("""(o)=>{const g=__g,P=g.player;const i=g.SK.findIndex(s=>s.id==='whirl');const m=g.mobs[o.mi];const run=()=>{m.dead=false;m.hp=m.max=1e9;m.x=P.x+o.d;m.y=P.y;const h=m.hp;P.cd[i]=0;P.mp=999;P.atkT=0;g.castSkill(i,true);return h-m.hp;};
      const a=run();g.equipItem(o.u,true);g.bumpGear();const b2=run();m.dead=true;return [a,b2,g.gfxSkR('whirl'),g.gfxSkR('flame')];}""",{'mi':pg.evaluate(MOB,{'dx':300}),'d':50+8*sc+4,'u':u['b16a']})
    chk(r[0]==0 and r[1]>0 and abs(r[2]-1.2)<1e-9 and r[3]==1,'포자 투구: 회오리 범위 ×1.20 — 경계 밖(%.0f) 몬스터 0 → %.0f 피해 · 화염 회오리 그대로'%(50+8*sc+4,r[1]))
    # 4) b16b
    pg.evaluate(CLR)
    r=pg.evaluate("""(u)=>{const g=__g,P=g.player,S=g.S;const Z=g.ZONES;const hz=Object.keys(Z).find(k=>k!=='village'&&Z[k].c);P.x=Z[hz].c[0];P.y=Z[hz].c[1];const H=g.pStats().hp;
      const one=()=>{P.hp=H*.3;P.lastHit=g.t-100;P.lastAtk=g.t-100;const h=P.hp;g.step(20,.05);return P.hp-h;};one();const a=one();g.equipItem(u,true);g.bumpGear();const H2=g.pStats().hp;const b2=one();return [a/H,b2/H2,H];}""",u['b16b'])
    chk(r[0]>0 and abs(r[1]/r[0]-2)<.03,'균사 망토: 비전투 HP 회복 초당 최대 HP의 %.2f%% → %.2f%% (×%.2f · 망토 HP 포함)'%(r[0]*100,r[1]*100,r[1]/r[0]))
    # 5) b19a
    pg.evaluate(CLR)
    r=pg.evaluate("""(u)=>{const g=__g,P=g.player;const H=g.pStats().hp;const hit=(k)=>{P.hp=H;P.dash=null;P.guardT=0;P.shield=0;g.hurtPlayer(100,null,k);return H-P.hp;};
      const a=[hit('zone'),hit(null)];g.equipItem(u,true);g.bumpGear();const b2=[hit('zone'),hit(null)];P.hp=H;return [a,b2,Object.keys(g.BP_ZONE)];}""",u['b19a'])
    chk(r[0]==[100,100] and abs(r[1][0]-75)<1e-6 and r[1][1]==100,'등잔 껍데기 갑옷: 장판 · 폭발 100 → %.0f · 일반 100 그대로'%r[1][0])
    chk(sorted(r[2])==['aoe','ember','fire','tri'],'장판 계열 보스 패턴 '+str(r[2]))
    # 실제 보스 장판 경로(bpHit)
    r=pg.evaluate("""(u)=>{const g=__g,P=g.player;const H=g.pStats().hp;const m=g.mobs.find(e=>!e.boss&&!(e.fa>0));m.atk=150;m.lv=g.S.lv;const R0=Math.random;Math.random=()=>.5;const one=(k)=>{P.hp=H;P.dash=null;g.clearStatus();g.bpHit(m,k);g.clearStatus();return H-P.hp;};
      const on=[one('aoe'),one('fan')];delete g.BP_ZONE.aoe;const off=[one('aoe'),one('fan')];g.BP_ZONE.aoe=1;Math.random=R0;m.atk=0;P.hp=H;return [on,off];}""",u['b19a']) if pg.evaluate("!!__g.bpHit") else None
    if r: chk(abs(r[0][0]/r[1][0]-.75)<.01 and abs(r[0][1]/r[1][1]-1)<.01,'보스 장판(aoe · bpHit 경로) 장판 계열에서 빼면 ×1/0.75 · 부채꼴(fan) 그대로 %s'%r)
    # 6) b19b
    pg.evaluate(CLR)
    r=pg.evaluate("""(o)=>{const g=__g,P=g.player;const i=g.SK.findIndex(s=>s.id==='star'),w=g.SK.findIndex(s=>s.id==='whirl');const m=g.mobs[o.mi];g.setTarget(m);
      const cast=()=>{m.dead=false;m.hp=m.max=1e9;P.cd[i]=0;P.mp=999;P.atkT=0;const ok=g.castSkill(i,true);return [ok,+(P.cd[i]-g.t).toFixed(3)];};
      const a=cast();g.equipItem(o.u,true);g.bumpGear();const b2=cast();const ww=g.gfxCd(g.SK[w]);g.step(1,.05);m.dead=true;return [a,b2,ww,g.SK[w].cd,g.SK[i].cd];}""",{'mi':pg.evaluate(MOB,{'dx':60}),'u':u['b19b']})
    chk(r[0][0] and r[1][0] and abs(r[0][1]-r[4])<1e-6 and abs(r[1][1]-(r[4]-2))<1e-6 and r[2]==r[3],'등불 목걸이: 별똥별 재사용 %.0f → %.0f초 · 회오리 그대로'%(r[0][1],r[1][1]))
    # 7) b21a
    pg.evaluate(CLR)
    r=pg.evaluate("(u)=>{const g=__g;const a=[g.pStats().critM,g.cpOf()];g.equipItem(u,true);g.bumpGear();return [a,[g.pStats().critM,g.cpOf()]];}",u['b21a'])
    chk(abs(r[0][0]-1.6)<1e-9 and abs(r[1][0]-1.8)<1e-9,'광석왕의 대검: 치명 피해 ×%.2f → ×%.2f'%(r[0][0],r[1][0]))
    # 8) b21b
    pg.evaluate(CLR)
    r=pg.evaluate("""(o)=>{const g=__g,P=g.player;g.equipItem(o.u,true);g.bumpGear();const m=g.mobs[o.mi];P.mp=10;g.killMob(m);const a=P.mp;
      m.dead=false;m.hp=m.max=10;P.mp=10;g.player.dead=false;/* 자폭 경로: gfxKillD로 감싼 처치 */const s=g.STAT.gfxMp||0;
      return [a,s];}""",{'u':u['b21b'],'mi':pg.evaluate(MOB,{'dx':200,'hp':10})})
    chk(abs(r[0]-14)<1e-6,'광석왕의 반지: 처치 → MP 10 → %.0f'%r[0])
    src=open('mmo.js').read()
    chk("gfxKillD=true;killMob(m);gfxKillD=false;" in src and "if(gfxKillD)return;" in src,'자폭(부풀기 끝 폭발)으로 스스로 쓰러진 처치는 효과를 부르지 않음')
    # 9) b27a
    pg.evaluate(CLR)
    r=pg.evaluate("""(u)=>{const g=__g,P=g.player,S=g.S;const H=g.pStats().hp;const one=(k)=>{S.hpPot=5;S.mpPot=5;P.potT=0;P.hp=1;P.mp=0;g.clearStatus();g.usePot(k,true);return +(P.potT-g.t).toFixed(3);};
      const a=[one('hp'),one('mp')];g.equipItem(u,true);g.bumpGear();const b2=[one('hp'),one('mp')];P.hp=H;return [a,b2];}""",u['b27a'])
    chk(r[0]==[2.2,2.2] and r[1]==[1.7,2.2],'껍질 망토: HP 물약 대기 2.2 → %.1f초 · MP 물약 %.1f초'%(r[1][0],r[1][1]))
    # 10) b27b
    pg.evaluate(CLR)
    r=pg.evaluate("(u)=>{const g=__g;const f=()=>['slow','stun','poison','burn'].map(k=>g.fxDur(k));const a=f();g.equipItem(u,true);g.bumpGear();return [a,f()];}",u['b27b'])
    chk(abs(r[1][0]-r[0][0]*.5)<1e-9 and abs(r[1][1]-r[0][1]*.5)<1e-9 and r[1][2]==r[0][2] and r[1][3]==r[0][3],'뿌리 장화: 둔화 %.1f → %.1f · 기절 %.1f → %.1f초 · 독 · 화상 그대로'%(r[0][0],r[1][0],r[0][1],r[1][1]))
    # 11) b30a
    pg.evaluate(CLR)
    mi=pg.evaluate(MOB,{'dx':20})
    r=pg.evaluate("""(o)=>{const g=__g,P=g.player;g.equipItem(o.u,true);g.bumpGear();const m=g.mobs[o.mi];const R0=Math.random;const out=[];
      const F=g.gearFx().b30a;for(const [rv,xp] of [[.5,0],[.1,.15],[.1,0],[.5,.15]]){F.xhit=xp;Math.random=()=>rv;const x0=g.STAT.gfxX||0;const h=m.hp;P.atkT=0;P.swing=0;P.swingHit=false;g.basicAttack(m);for(let k=0;k<10;k++){g.step(1,.05);m.x=P.x+20;m.y=P.y;m.ret=false;}out.push([(g.STAT.gfxX||0)-x0,h-m.hp]);}
      F.xhit=.15;Math.random=R0;m.dead=true;return out;}""",{'u':u['b30a'],'mi':mi})
    print(' xhit',r)
    r=r[1:];chk(r[0][0]==1 and r[1][0]==0 and r[2][0]==0 and abs(r[0][1]/r[1][1]-2)<.05,'집게 장갑: 난수 0.1 → 한 번 더(같은 난수 효과 없음 대비 피해 ×%.2f) · 0.5 → 없음'%(r[0][1]/r[1][1]))
    # 12) b30b
    pg.evaluate(CLR)
    r=pg.evaluate("""(u)=>{const g=__g,P=g.player;g.equipItem(u,true);g.bumpGear();const H=g.pStats().hp;const hit=(f)=>{P.hp=H*f;P.dash=null;P.guardT=0;P.shield=0;const h=P.hp;g.hurtPlayer(100,null);return h-P.hp;};const o=[hit(1),hit(.5),hit(.49)];P.hp=H;return o;}""",u['b30b'])
    chk(abs(r[0]-92)<1e-6 and abs(r[1]-92)<1e-6 and abs(r[2]-100)<1e-6,'등딱지 투구: HP 100%% · 50%% 받는 피해 100 → 92 · 49%%엔 100')
    # 13) b32a
    pg.evaluate(CLR)
    r=pg.evaluate("""(o)=>{const g=__g,P=g.player;g.equipItem(o.u,true);g.equipItem(o.u2,true);g.bumpGear();const ms=g.mobs.filter(e=>!e.boss&&!e.eliteOf&&!(e.fa>0)&&!e.sumOf).slice(0,4);
      const set=(m,dx,hp)=>{m.dead=false;m.max=m.hp=hp;m.def=0;m.x=P.x+200+dx;m.y=P.y;m.aggro=false;m.atk=0;m.respawn=1e9;};
      set(ms[0],0,10);set(ms[1],30,1e9);set(ms[2],80,1e9);set(ms[3],-25,1);const A=g.pStats().atk;P.mp=10;const f0=g.STAT.gfxFlame||0;
      const h=[ms[1].hp,ms[2].hp];g.killMob(ms[0]);const o2={near:h[0]-ms[1].hp,far:h[1]-ms[2].hp,want:A*.5,chainDead:ms[3].dead,flames:(g.STAT.gfxFlame||0)-f0,mp:P.mp};for(const m of ms)m.dead=true;return o2;}""",{'u':u['b32a'],'u2':u['b21b']})
    print(' flame',r)
    chk(abs(r['near']-r['want'])<1e-6 and r['far']==0,'날개검: 처치 → 30 거리 %.0f 피해(공격력 ×0.5) · 80 밖 0'%r['near'])
    chk(r['chainDead'] and r['flames']==1 and abs(r['mp']-14)<1e-6,'불꽃이 쓰러뜨린 몬스터는 다시 불꽃 · MP를 부르지 않음(불꽃 1번 · MP +4 한 번)')
    # 14) b32b
    pg.evaluate(CLR)
    r=pg.evaluate("""(u)=>{const g=__g,P=g.player;g.equipItem(u,true);g.bumpGear();const H=g.pStats().hp;P.g3sv=0;P.hp=10;P.dash=null;P.shield=0;g.hurtPlayer(1e6,null);const a={dead:P.dead,hp:P.hp/H,cd:P.g3sv-g.t};
      g.S.autoPot=false;g.S.hpPot=0;g.addFx('burn',{name:'x',atk:400});P.hp=5;P.g3sv=0;P.lastHit=g.t;for(let k=0;k<25&&!(P.g3sv>g.t);k++)g.step(1,.05);const s={dead:P.dead,hp:P.hp/H,saved:P.g3sv>g.t};g.clearStatus();
      P.hp=10;g.hurtPlayer(1e6,null);const b2={dead:P.dead};return [a,s,b2];}""",u['b32b'])
    print(' save',r)
    chk(not r[0]['dead'] and abs(r[0]['hp']-.3)<1e-6 and abs(r[0]['cd']-300)<1e-6,'깃 반지: 치명 피해 → HP 30%로 버팀 · 300초 대기')
    chk(not r[1]['dead'] and r[1]['saved'],'상태이상(화상) 틱으로 쓰러질 때도 버팀')
    chk(r[2]['dead'],'대기 중 두 번째는 쓰러짐')
    pg.evaluate("(()=>{const g=__g;g.revive&&g.revive();})()");pg.wait_for_timeout(300)
    pg.evaluate("(()=>{const g=__g,P=g.player;document.querySelectorAll('.modal,#modal').forEach(e=>{});g.closeModal&&g.closeModal();P.dead=false;P.hp=g.pStats().hp;})()")
    # 15) 툴팁 · 화면
    pg.evaluate(CLR);pg.evaluate("(u)=>{__g.equipItem(u,true);__g.bumpGear();}",u['b32a'])
    t=pg.evaluate("(u)=>{const a=document.createElement('div');__g.itemTip(a,__g.itemById(u));const f=a.querySelector('.tgfx');return [f&&f.textContent,f&&f.style.color];}",u['b32a'])
    chk(t[0] and '불꽃' in t[0] and '켜짐' in t[0] and t[1]=='rgb(255, 160, 74)','툴팁 주황 한 줄 '+str(t[0]))
    pg.evaluate("(()=>{const g=__g;g.player.hp=g.pStats().hp;g.openBag();g.render();})()")
    clicked=pg.evaluate("(()=>{const b=[...document.querySelectorAll('#win .eqs.has')].find(x=>x.title.includes('날개검'));if(!b)return false;b.click();return true;})()")
    pg.wait_for_timeout(200)
    vis=pg.evaluate("(()=>{const e=document.querySelector('#itip .tgfx');if(!e)return null;const r=e.getBoundingClientRect();return [r.left,r.top,r.right,r.bottom];})()")
    chk(clicked and vis and vis[0]>=0 and vis[3]<=720 and vis[2]<=1280,'가방 무기 칸 툴팁 고유 효과 줄이 화면 안 '+str(vis))
    pg.screenshot(path='shots/v474_툴팁.png')
    vt=pg.evaluate("(()=>{const r=document.getElementById('verTag').getBoundingClientRect();return [r.left,r.bottom];})()");chk(vt[0]<200 and vt[1]>600,'왼쪽 아래 버전 표시')
    # 16) 이전 세이브
    pg.evaluate("(u)=>{const g=__g;g.closeWin&&g.closeWin();g.equipItem(u.a,true);g.equipItem(u.b,true);g.equipItem(u.c,true);g.bumpGear();g.save();}",{'a':u['b30b'],'b':u['b27b'],'c':u['b19b']})
    before=pg.evaluate("Object.keys(__g.gearFx()).sort()")
    sv=pg.evaluate("localStorage.getItem('rowen-mmo-v4')");pg.close()
    e2=[];pg2=b.new_page(viewport={'width':1280,'height':720});pg2.on('pageerror',lambda e:e2.append(str(e)))
    pg2.goto('file://'+HTML);pg2.evaluate("s=>localStorage.setItem('rowen-mmo-v4',s)",sv);pg2.reload();pg2.wait_for_function('window.__ready===true',timeout=120000);pg2.click('#btnCont',timeout=60000);pg2.wait_for_timeout(600);pg2.evaluate("window.requestAnimationFrame=()=>0;__g.step(20,.05);__g.render()")
    r=pg2.evaluate("Object.keys(__g.gearFx()).sort()");chk(not e2 and r==before and len(r)==4,'세이브 이어하기 → 효과 그대로 '+str(r))
    pg2.close();b.close()
    chk(not errs and not e2,'페이지 오류 없음 '+str((errs+e2)[:2]))
print('PASS gfx474 %d'%ok)
