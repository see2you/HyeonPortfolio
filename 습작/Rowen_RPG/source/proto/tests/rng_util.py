"""v4.50 G1-b2 원거리 원형 측정 공용: 실제 체력 몬스터 무리를 자동 전투로 '처치까지' 잡으며 피격률 · 피해를 잰다.
PACK_JS([sp,lv,n,seed,beh]) — 지금 맵에서 종 sp 일반 개체 n마리(레벨 lv · 실제 능력치 · 원거리면 체력 ×hpK)를 집 근처에 두고
플레이어를 무리에서 100 떨어뜨린 뒤 자동 전투로 다 잡을 때까지(최대 120초). beh='melee'면 같은 무리를 근접형(체력 그대로)으로.
돌려주는 값: taken(받은 피해) · shots · hits · sec(처치까지 초) · killed"""
PACK_JS="""([sp,lv,n,seed,beh])=>{const g=__g,S=g.S,P=g.player;let a=seed>>>0;Math.random=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
 const keep=g.MOB_B[sp];if(beh==='melee')delete g.MOB_B[sp];const rng=g.mobBeh({sp})==='ranged';
 const L=g.mobs.filter(e=>e.sp===sp&&!e.boss&&!e.eliteOf).slice(0,n);if(L.length<n){if(keep)g.MOB_B[sp]=keep;return null;}
 for(const e of g.mobs){e.aggro=false;e.ret=false;e.aim=null;if(!L.includes(e)){e.dead=true;e.deadT=-1e9;e.respawn=1e9;}}
 const c=L[0],rot=(seed*2.399963)%6.2832;/* 씨앗마다 무리 방향 · 다가오는 방향을 돌린다(지형 · 나무가 한 방향만 막아 결과가 씨앗과 무관해지던 것) */if(!c._h0)c._h0={x:c.home.x,y:c.home.y};const cx=c._h0.x,cy=c._h0.y;
 L.forEach((m,i)=>{const an=rot+i*2.1;m.home.x=cx+Math.cos(an)*(window.__gap||70)*(i>0);m.home.y=cy+Math.sin(an)*(window.__gap||70)*(i>0);m.x=m.home.x;m.y=m.home.y;m.dead=false;m.deadT=0;m.respawn=1e9;m.lv=lv;const ms=g.mobStats(lv,false);m.atk=ms.atk;m.def=ms.def;m.max=m.hp=Math.max(1,Math.round(ms.hp*(rng?g.RANGED.hpK:1)));m.atkT=.5+i*.4;m.wind=0;m.aggro=true;m.ret=false;m.aim=null;});
 g.shots.length=0;g.tele.length=0;g.clearStatus();P.dead=false;P.x=cx+Math.cos(rot+1)*100;P.y=cy+Math.sin(rot+1)*100;P.hp=1e8;P.shield=0;P.mp=9999;P.dash=0;S.hpPot=0;g.setTarget(null);g.resetAuto&&g.resetAuto();P.cd.fill(0);P.atkT=0;P.spin=0;P.swing=0;P.buffT=0;P.guardT=0;P.fervT=0;P.dead=false;
 const n0=g.STAT.shotN||0,h0=g.STAT.shotHit||0;g.setAuto(true);let sec=0;
 while(sec<120&&L.some(m=>!m.dead)){g.step(1,.05);sec+=.05;P.lastHit=1e12;if(P.hp<1e7)P.hp=1e8;}
 const taken=1e8-P.hp;g.setAuto(false);for(const m of L){m.respawn=1e9;m.dead=true;m.deadT=-1e9;}g.shots.length=0;g.tele.length=0;if(keep)g.MOB_B[sp]=keep;
 return {taken,shots:(g.STAT.shotN||0)-n0,hits:(g.STAT.shotHit||0)-h0,sec,killed:L.filter(m=>m.dead).length};}"""
