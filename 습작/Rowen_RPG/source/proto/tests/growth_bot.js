/* v4.10 성장 봇: 플레이어 대역. 자동 진행은 제작·강화·컬렉션을 하지 않으므로, 시뮬레이션에서 "수동 플레이"를 흉내 낸다.
   주기적으로 (1) 컬렉션 등록 (2) 제작(일반→고급→희귀↑, 지금 장비보다 좋아질 때) (3) 주문서 구입·강화 (4) 장착 정리 (5) 수련 사냥 중이면 지역 보스 토벌 */
window.__bot=function(opt){const g=__g,S=g.S;opt=opt||{};const log=[];if(g.win||g.modal||g.traveling||g.player.dead)return log;
  const reserve=()=>Math.max(400,22*(10+3*S.lv)+12*(12+3*S.lv))*(opt.lite?3:1);
  /* 1) 장착 정리 (신앙 포함 점수) */
  g.autoEquipAll();
  /* 2) 컬렉션 등록: 장착 중이 아닌 후보를 모두 등록 (단, 지금 장착보다 좋은 장비는 먼저 장착됐으므로 남는 것만) */
  for(const c of g.COLL){if(g.collDone(c))continue;c.req.forEach((r,i)=>{if(g.collReg(c,i))return;const cand=g.collCand(r);if(cand&&!(opt.keepMat&&!r.bu&&cand.g>=1&&false)){g.collRegister(c.id,i,cand.u);log.push('reg '+c.id);}});}
  /* 2c) 제작 성장 퀘스트: 가장 높은 등급 재료가 있는 (부위, 단계)에서 등급 사슬 (일반 2 → 고급 → 희귀 ...) — 이 사슬 재료는 분해하지 않는다 */
  window.__chain=null;
  for(const id in S.sq){const sq=g.SUBQ[id];if(!sq||!sq.grow||sq.grow!=='craft'||S.sq[id].st!=='active')continue;
    const pool=S.items.filter(it=>!it.bu&&!g.isEq(it)&&!it.lock&&it.g<sq.g&&it.t<=g.craftTierMax()).sort((a,b)=>b.g-a.g||b.t-a.t);
    const base=pool[0]||{k:'ring',t:Math.min(g.craftTierMax(),g.tierOfLv(S.lv))},K=base.k,T2=base.t;window.__chain=K+T2;
    const mk=(gr,d)=>{if(d>6)return false;const ck=g.craftCheck(K,T2,gr);if(ck.ok){const r=g.craftItem(K,T2,gr);log.push('craftQ '+K+T2+'g'+gr+(r&&r.ok?'':'x'));return !!(r&&r.ok);}
      const R=g.CRAFT_EQ[gr];if(R.rcp&&!g.cnt(R.rcp))return false;if(g.cnt(g.oreKey(T2))<R.ore(T2)||!g.cnt(g.dsgKey(K,T2)))return false;if(R.need){const have=g.craftMats(K,T2,R.need.g,R.need.n).length;for(let j=have;j<R.need.n;j++)if(!mk(R.need.g,d+1))return false;return mk(gr,d+1);}return false;};
    mk(sq.g,0);}
  /* 2b) 컬렉션용 저단계 장비 제작 (일반·고급 · 강화 조건 없음) */
  {let k2=0;for(const c of g.COLL){if(opt.lite||g.collDone(c)||k2>=3||g.cnt(g.oreKey(1))+g.cnt(g.oreKey(3))+g.cnt(g.oreKey(5))<20)continue;c.req.forEach((r,i)=>{if(k2>=3||r.bu||g.collReg(c,i)||g.collCand(r)||(r.g||0)>1||r.en)return;const t=r.t||1;if(t>g.craftTierMax())return;
    if((r.g||0)===0){const ck=g.craftCheck(r.k,t,0);if(ck.ok&&S.gold-ck.gold>=reserve()){g.craftItem(r.k,t,0);k2++;log.push('craftC '+r.k+t);}}
    else{let guard=0;while(g.craftMats(r.k,t,0,2).length<2&&guard++<2){const ck=g.craftCheck(r.k,t,0);if(!ck.ok||S.gold-ck.gold<reserve())break;g.craftItem(r.k,t,0);}const ck=g.craftCheck(r.k,t,1);if(ck.ok&&S.gold-ck.gold>=reserve()){g.craftItem(r.k,t,1);k2++;log.push('craftC '+r.k+t+'g1');}}});}
  for(const c of g.COLL){if(g.collDone(c))continue;c.req.forEach((r,i)=>{if(g.collReg(c,i))return;const cand=g.collCand(r);if(cand)g.collRegister(c.id,i,cand.u);});}}
  /* 2d) 분해: 지난 단계 장비 · 같은 부위 일반이 2개 넘는 것 (컬렉션 재료 · 보스 장비 · 지금보다 좋은 것 제외) → 강화석 */
  {const T0=Math.min(g.craftTierMax(),g.tierOfLv(S.lv)),keep={},us=[];for(const it of S.items){if(it.bu||g.isEq(it)||it.lock||g.collNeeds(it)||g.betterThanEq(it)||window.__chain===it.k+it.t)continue;
      if(it.t<T0||it.g>=2&&false){us.push(it.u);continue;}const key=it.k+it.t+it.g;keep[key]=(keep[key]||0)+1;if(keep[key]>(it.g?1:2))us.push(it.u);}
    if(us.length){const r=g.disassemble(us,true);if(r.n)log.push('dis '+r.n+' +'+r.st);}}
  /* 3) 제작 */
  const T=Math.min(g.craftTierMax(),g.tierOfLv(S.lv)),KINDS=['weapon','armor','helm','gloves','boots','cloak','neck','ring'];
  for(const k of KINDS){const slot=k==='ring'?g.targetSlot({k:'ring'}):k,cur=S.eq[slot]&&g.itemById(S.eq[slot]),cs=cur?g.cpScore(cur):-1;
    for(let gr=4;gr>=1;gr--){const ck=g.craftCheck(k,T,gr);if(!ck.ok)continue;if(S.gold-ck.gold<reserve())continue;if(g.cpScore({k,t:T,g:gr,en:0})<=cs)continue;const r=g.craftItem(k,T,gr);log.push('craft '+k+T+'g'+gr+(r&&r.ok?'':'x'));break;}
    /* 일반 재료 쌓기: 고급으로 올리려고 같은 부위 일반 2개 */
    const cur2=S.eq[slot]&&g.itemById(S.eq[slot]),cs2=cur2?g.cpScore(cur2):-1;
    if(g.cpScore({k,t:T,g:1,en:0})>cs2){let mats=g.craftMats(k,T,0,2).length,guard=0;while(mats<2&&guard++<2){const ck=g.craftCheck(k,T,0);if(!ck.ok||S.gold-ck.gold<reserve()||g.cnt(g.oreKey(T))<ck.ore+g.CRAFT_EQ[1].ore(T))break;g.craftItem(k,T,0);log.push('craft '+k+T+'g0');mats=g.craftMats(k,T,0,2).length;}
      const ck=g.craftCheck(k,T,1);if(ck.ok&&S.gold-ck.gold>=reserve()){g.craftItem(k,T,1);log.push('craft '+k+T+'g1');}}
    if(!cur2){const ck=g.craftCheck(k,T,0);if(ck.ok&&S.gold-ck.gold>=reserve()){g.craftItem(k,T,0);log.push('craft '+k+T+'g0 (empty)');}}}
  g.autoEquipAll();
  /* 4) 강화: 축복 → 안전 구간 → 남는 골드로 그 위 */
  const eqd=s=>S.eq[s]&&g.itemById(S.eq[s]);
  const ACC=['neck','ring1','ring2'],ARM=['armor','helm','gloves','boots','cloak'];
  const plan=[['weapon',5],...ARM.map(x=>[x,5]),...ACC.map(x=>[x,1])];
  const tryEnch=(s,cap)=>{const it=eqd(s);if(!it||it.en>=cap)return false;let ck=g.enchCheck(it);
    if(!ck.ok&&ck.c&&S.stone<ck.c.stone){const need=ck.c.stone-S.stone;if(S.gold-need*g.stonePrice()-ck.c.gold<reserve())return false;g.buyStone(need);ck=g.enchCheck(it);}
    if(!ck.ok||S.gold-ck.c.gold<reserve()*.5)return false;g.enchant(it.u,false);return true;};
  for(const [s] of plan){const it=eqd(s);if(it&&g.cnt('bls')&&it.en<g.enchSafe(it.k)&&g.enchCheck(it,true).ok){g.enchant(it.u,true);log.push('bless '+s);}}
  let n=0;for(const [s,cap] of plan){while(n<40&&tryEnch(s,cap)){n++;}}
  const over=opt.over||[['weapon',8],...ARM.map(x=>[x,6]),...ACC.map(x=>[x,3])];
  if(!opt.lite&&S.gold>reserve()*3)for(const [s,cap] of over){let k=0;while(k++<6&&S.gold>reserve()*2&&tryEnch(s,cap))n++;}
  if(n)log.push('ench x'+n);
  g.autoEquipAll();
  /* 4b) 보스 컬렉션 대기: 다른 맵의 지역 보스가 필요하면 그 맵으로 */
  const needB=Object.keys(S.sq).some(id=>{const q=g.SUBQ[id];return q&&(q.grow==='bcoll'||q.grow==='reg')&&S.sq[id].st==='active';});
  if(!opt.lite&&g.trainFor&&needB&&!g.fieldBossInfo().some(m=>!m.dead&&!g.COLL.find(c=>c.id==='bc'+m.eliteOf.slice(1)&&g.collDone(c)))){
    const q=g.QUESTS.find((q,i)=>q.elite&&i<S.qi&&!g.collDone(g.COLL.find(c=>c.id==='bc'+q.id.slice(1)))&&g.MAPS&&q.zone&&g.ZALL[q.zone].map!==g.map);
    if(q&&S.hpPot>=10){const mid=g.ZALL[q.zone].map;g.travelTo(mid,()=>{});log.push('travel '+mid+' for '+q.id);return log;}}
  /* 5) 수련 사냥(성장 대기) 중이면 같은 맵의 지역 보스 토벌 */
  if(g.trainFor&&S.hpPot>=8&&(!opt.lite||needB)){const f=g.pStats().faith,fb=g.fieldBossInfo().filter(m=>!m.dead&&f>=m.fa*.85).sort((a,b)=>(g.collDone(g.COLL.find(c=>c.id==='bc'+a.eliteOf.slice(1)))?1:0)-(g.collDone(g.COLL.find(c=>c.id==='bc'+b.eliteOf.slice(1)))?1:0));
    if(fb.length&&!(g.hunt&&g.hunt.mob&&fb.includes(g.hunt.mob))){const m=fb[0];g.goHunt(m.zone,null,m,'지역 보스');log.push('fieldboss '+m.name);}}
  g.growthTick();return log;};
