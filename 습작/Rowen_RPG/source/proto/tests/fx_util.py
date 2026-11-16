"""v4.47 상태이상 · 행동 원형 테스트 공용: 같은 레벨 '현실적인' 캐릭터(티어 장비 고급 +3 전 부위)를 만들고 종 하나와 60초 싸움"""
SETUP_JS="""(lv)=>{const g=__g,S=g.S;S.autoQ=false;g.setAuto&&g.setAuto(false);if(S.lv<lv)g.gainXp((function(){let n=0;for(let L=S.lv;L<lv;L++)n+=g.need(L);return n+1;})());
  g.autoGrowNow();const t=lv<8?1:lv<16?2:lv<24?3:lv<32?4:5;for(const sl of ['weapon','helm','armor','cloak','gloves','boots','neck','ring1','ring2']){const k=sl.startsWith('ring')?'ring':sl;const it=g.newItem(k,t,1);it.en=3;S.items.push(it);if(S.eq[sl])S.eq[sl]=null;S.eq[sl]=it.u;}
  const st=g.pStats();g.player.hp=st.hp;return {lv:S.lv,hp:st.hp,def:st.def,atk:st.atk};}"""
# 가만히 서서 종 sp(레벨 lv) 한 마리에게 sec초 맞는다. 받은 피해(근접 · 독)와 물약 미사용
DUEL_JS="""([sp,lv,sec,seed,fx])=>{const g=__g,S=g.S,P=g.player;let a=seed>>>0;Math.random=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
  const keep=g.MOB_B[sp];if(!fx)delete g.MOB_B[sp];
  const m=g.mobs.find(e=>e.sp===sp&&!e.boss&&!e.eliteOf);m.dead=false;m.deadT=0;for(const e of g.mobs){if(e!==m){e.aggro=false;e.ret=false;e.dead=true;e.deadT=-1e9;e.respawn=1e9;}}
  m.lv=lv;const ms=g.mobStats(lv,false);m.atk=ms.atk;m.def=ms.def;m.max=m.hp=1e9;m.x=m.home.x;m.y=m.home.y;m.atkT=1;m.wind=0;m.aggro=true;m.ret=false;
  P.x=m.x+18;P.y=m.y;const st=g.pStats();P.hp=1e8;P.shield=0;g.clearStatus();const f0=g.STAT.fxDmg||0,n0=g.STAT.fxN||0;S.hpPot=0;
  let hits=0;for(let i=0;i<sec*20;i++){P.lastHit=1e12;g.step(1,.05);m.hp=1e9;P.x=m.x+18;P.y=m.y;m.home.x=m.x;m.home.y=m.y;}
  const taken=1e8-P.hp,fxd=(g.STAT.fxDmg||0)-f0;if(keep)g.MOB_B[sp]=keep;g.clearStatus();P.hp=st.hp;for(const e of g.mobs){if(e.deadT<-1e8){e.respawn=0;}}
  return {taken,fxd,melee:taken-fxd,procs:(g.STAT.fxN||0)-n0,maxhp:st.hp,lv:m.lv};}"""
