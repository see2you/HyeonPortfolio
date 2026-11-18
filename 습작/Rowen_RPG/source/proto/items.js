/* =====================================================================
   v4.8 아이템 · 장비 · 가방 (리니지 라이크)
   - 장비 9부위 × 5티어(지역) × 5등급, 몬스터 드롭(자동 획득)
   - 무기/갑옷 마법 주문서로 강화 — 안전 강화(무기 +6 · 방어구 +4) 이후 확률, 파괴·하락 없음, 3연속 실패마다 +5%p
   - 무게: 50% 이상 자연 회복 정지 · 82% 이상 공격·스킬 불가 · 100% 초과 획득 불가
   - 재화 짝: 주문서(상점 골드 · 제작 강화석 · 드롭 → 강화) · 강화석(드롭 · 분해 · 퀘스트 → 주문서 제작)
   ===================================================================== */
const GRADES=[
  {n:'일반',c:'#d8d2c4',m:1,dis:1},
  {n:'고급',c:'#7ad870',m:1.15,dis:2},
  {n:'희귀',c:'#62a8ff',m:1.35,dis:4},
  {n:'영웅',c:'#ff6a58',m:1.6,dis:8},
  {n:'전설',c:'#c88cff',m:2,dis:16}];
const SLOTS=['weapon','helm','armor','cloak','gloves','boots','neck','ring1','ring2'];
const SLOTN={weapon:'무기',helm:'투구',armor:'갑옷',cloak:'망토',gloves:'장갑',boots:'장화',neck:'목걸이',ring:'반지',ring1:'반지',ring2:'반지'};
const slotKind=s=>s.startsWith('ring')?'ring':s;
const TIERS=[null,
  {iL:1,area:'로웬',mat:'가죽',w:'club',wn:'나무 몽둥이',ck:'천 망토',nk:'나무 목걸이',rk:'구리 반지',col:{a:'#9a6a3a',b:'#c89058',c:'#6a4424',g:'#d8b070'}},
  {iL:8,area:'로웬',mat:'청동',w:'axe',wn:'돌 도끼',ck:'사냥꾼 망토',nk:'호박 목걸이',rk:'은 반지',col:{a:'#b87a3a',b:'#e8b060',c:'#7a4a20',g:'#f0d080'}},
  {iL:16,area:'카르도',mat:'강철',w:'spear',wn:'은빛 창',ck:'협곡 망토',nk:'수정 목걸이',rk:'수정 반지',col:{a:'#9aa4b4',b:'#d8e0ec',c:'#5a6474',g:'#6ab0ff'}},
  {iL:24,area:'카르도',mat:'미스릴',w:'sword',wn:'미스릴 장검',ck:'바람 망토',nk:'달빛 목걸이',rk:'미스릴 반지',col:{a:'#8ab8d8',b:'#e0f4ff',c:'#4a7a9a',g:'#a8f0ff'}},
  {iL:32,area:'에르나',mat:'흑요석',w:'obsword',wn:'흑요석 검',ck:'불꽃 망토',nk:'불새 목걸이',rk:'홍염 반지',col:{a:'#4a3a5a',b:'#8a6aaa',c:'#2a2034',g:'#ff6a3a'}}];
const TIER_MAX=5,tierOfLv=L=>L<8?1:L<16?2:L<24?3:L<32?4:5;
/* 기본 능력치 (iL = 티어 아이템 레벨, 등급 배율 m) */
function itemBase(kind,iL,g){const m=GRADES[g].m,r=v=>Math.round(v*m);
  switch(kind){
    case 'weapon':return{atk:r(4+1.6*iL)};
    case 'armor':return{def:r(1+.3*iL),hp:r(6+2.4*iL)};
    case 'helm':return{def:r(.5+.15*iL),hp:r(3+1.2*iL)};
    case 'boots':return{def:r(.5+.14*iL),hp:r(2.5+1*iL)};
    case 'gloves':return{atk:r(1+.35*iL),def:r(.3+.08*iL)};
    case 'cloak':return{hp:r(5+1.8*iL),mp:r(4+1.2*iL)};
    case 'neck':return{hp:r(4+1.5*iL),skm:+((.02+.0015*iL)*m).toFixed(3)};
    case 'ring':return{atk:r(1+.3*iL),crit:+((.005+.0004*iL)*m).toFixed(4)};}
  return{};}
/* 강화 1단계당 */
/* v4.14 강화 (제우스: 오만의 신 방식): 무기·방어구 안전 강화 +5 · 장신구 +1, 그 위는 확률. 재료 = 강화석 + 골드 (주문서 없음).
   싱글 완화: 실패해도 파괴·하락 없음(3연속 실패마다 +5%p). 축복받은 강화 주문서: 안전 구간에서 +1~3 */
const ENCH={weapon:{atk:5},armor:{def:2,hp:10},helm:{def:1,hp:5},boots:{def:1,hp:5},gloves:{def:1,atk:1},cloak:{hp:8,mp:3},neck:{hp:8,skm:.006},ring:{atk:2,crit:.003}};
const isAcc=k=>k==='neck'||k==='ring',canEnch=k=>!!ENCH[k];
const ENH={max:10,safe:{weapon:5,armor:5,acc:1},rate:{weapon:[.7,.6,.5,.4,.35],armor:[.7,.6,.5,.45,.4],acc:[.6,.5,.4,.35,.3,.25,.2,.2,.2]},failBonus:.05};
const enchCls=k=>k==='weapon'?'weapon':isAcc(k)?'acc':'armor',enchSafe=k=>ENH.safe[enchCls(k)];
/* v4.45 보조 강화석(아이온 '강화 보조제' 방식): 안전 구간 위에서만 · 단계 k(0~3)마다 강화석 +100% · 성공 확률 +5%p(최대 95%) — 남는 강화석으로 시도 수(골드 수수료)를 줄인다 */
ENH.aid={max:3,rate:.05,cap:.95};
const enchAid=(it,aid)=>it.en<enchSafe(it.k)?0:Math.max(0,Math.min(ENH.aid.max,aid==null?(S.encAid|0):aid|0));
function enchRate(it,aid){const k=enchCls(it.k),s=ENH.safe[k];if(it.en<s)return 1;const a=enchAid(it,aid),b=Math.min(1,(ENH.rate[k][it.en-s]||.2)+Math.floor((it.ff||0)/3)*ENH.failBonus);return a?Math.min(Math.max(b,ENH.aid.cap),b+a*ENH.aid.rate):b;}
/* 강화 비용: 강화석은 단계·지역에 비례(무기 ×1.5 · 장신구 ×2), 골드는 수수료 */
function enchCost(it,aid){const m=it.k==='weapon'?1.5:isAcc(it.k)?2:1,st=Math.max(1,Math.round((1+it.en*.6)*(1+.5*(it.t-1))*m)),a=enchAid(it,aid);return{stone:st*(1+a),gold:Math.round(60*it.t*(it.en+1)*(it.bu?1.5:1)),aid:a,base:st};}
const STATN={atk:'공격력',def:'방어',hp:'최대 HP',mp:'최대 MP',crit:'치명',skm:'스킬 피해',faith:'신앙'};
const statFmt=(k,v)=>k==='crit'||k==='skm'?'+'+(v*100).toFixed(1)+(k==='crit'?'%p':'%'):'+'+v;
const WT={weapon:40,armor:55,helm:20,cloak:15,gloves:15,boots:20,neck:3,ring:3};
/* v4.9 드롭 (리니지M 방식): 일반 몬스터는 낮은 확률로 일반/고급만. 희귀 이상은 지역 보스(관문 정예 · 침공 보스)의 낮은 확률 또는 제작.
   지역 보스는 장비 1개 + 제작 비법서 · 축복받은 주문서를 확률로 */
const DROP={eq:.04,hi:.15,ore:.18,dsg:.06,slot:{weapon:1,armor:1,helm:1,cloak:1,gloves:1,boots:1,neck:.6,ring:.8},
  boss:{grade:[[4,.01],[3,.05],[2,.20],[1,.60]],rcp2:.40,rcp3:.12,rcp4:.03,bls:.25,dsg:1}};
/* v4.14 제작 재료: 지역 광물 + 지역 장비 도면(무기·방어구·장신구) + 골드. 1·2단계 로웬 · 3·4단계 카르도 · 5단계 에르나 */
const REG=t=>t<=2?1:t<=4?2:3,REGN=['','로웬','카르도','에르나'],MAP_REG={rowen:1,kardo:2,erna:3};
const PART=k=>k==='weapon'?'w':isAcc(k)?'c':'a',PARTN={w:'무기',a:'방어구',c:'장신구'};
const oreKey=t=>'ore'+REG(t),dsgKey=(k,t)=>'d'+PART(k)+REG(t);
const BAG_SLOTS=80;
/* 묶음 아이템: 기존 세이브 필드(hpPot 등)는 그대로 두고 가방에서 같은 칸으로 보여 준다 */
const STK={
  hp:{n:'HP 물약',cat:'use',w:3,ic:'pot',col:'#e8584a',desc:()=>'최대 HP의 35% 회복 (Q) · 소지 한도 '+POT_CAP.hp,f:'hpPot'},
  mp:{n:'MP 물약',cat:'use',w:3,ic:'pot',col:'#5aa0e8',desc:()=>'최대 MP의 40% 회복 (E) · 소지 한도 '+POT_CAP.mp,f:'mpPot'},
  ret:{n:'귀환 주문서',cat:'use',w:1,ic:'scroll',col:'#8ad870',desc:()=>'즉시 마을로 귀환 (B) · 소지 한도 '+POT_CAP.scroll,f:'scroll'},
  /* v4.66 G12-a 버프 물약(지시서 §G12 · MMORPG 라이크 상점 구매형 시간제 버프): 5분 · 같은 종류는 시간만 갱신 · 사망하면 사라짐 · 전투력(cpOf)에 넣지 않음 */
  spdp:{n:'가속 물약',cat:'use',w:2,ic:'pot',col:'#5fe0b8',desc:()=>bufDesc('spdp')},
  atkp:{n:'힘의 물약',cat:'use',w:2,ic:'pot',col:'#ff8a3a',desc:()=>bufDesc('atkp')},
  defp:{n:'수호 물약',cat:'use',w:2,ic:'pot',col:'#c0a8ff',desc:()=>bufDesc('defp')},
  cure:{n:'정화 물약',cat:'use',w:1,ic:'pot',col:'#e8f6ff',desc:()=>'독 · 화상 · 둔화를 바로 풀고 '+CURE_K.imm+'초 동안 셋에 걸리지 않는다 · 기절은 풀지 못함 · 소지 한도 '+CURE_K.cap+' · 물약 상인'},/* v4.67 G12-b */
  stone:{n:'강화석',cat:'mat',w:.2,ic:'gem',col:'#7ac8ff',desc:()=>'장비 강화 재료 (강화 창) · 장비 분해 · 몬스터 · 퀘스트 · 대장장이 상점',f:'stone'},
  shard:{n:'권능 파편',cat:'mat',w:0,ic:'gem',col:'#ffd860',desc:()=>'신의 권능 각성 재료 (P)',f:'shard'},
  bls:{n:'축복받은 강화 주문서',cat:'use',w:1,ic:'scroll',col:'#ffd860',desc:()=>'강화 창에서 사용 · 안전 강화 구간에서 +1~3 (강화석 없이 골드만) · 지역 보스 · 퀘스트'},
  rcp2:{n:'희귀 제작 비법서',cat:'mat',w:1,ic:'book',col:'#62a8ff',desc:()=>'희귀 장비 제작 재료 · 지역 보스(관문 정예 · 침공)에게서 얻는다'},
  rcp3:{n:'영웅 제작 비법서',cat:'mat',w:1,ic:'book',col:'#ff6a58',desc:()=>'영웅 장비 제작 재료 · 지역 보스에게서 낮은 확률로'},
  rcp4:{n:'전설 제작 비법서',cat:'mat',w:1,ic:'book',col:'#c88cff',desc:()=>'전설 장비 제작 재료 · 지역 보스에게서 매우 낮은 확률로'},
  book_dash:{n:'스킬서 · 돌진 찌르기',cat:'use',w:5,ic:'book',col:'#62a8ff',book:'dash'},
  book_roar:{n:'스킬서 · 전투 함성',cat:'use',w:5,ic:'book',col:'#ff9a4a',book:'roar'},
  book_quake:{n:'스킬서 · 대지 가르기',cat:'use',w:5,ic:'book',col:'#c89a60',book:'quake'},
};
for(const r of [1,2,3]){const C=['','#b8a088','#c8d8e8','#8a5ab8'][r];STK['ore'+r]={n:REGN[r]+' '+['','철광석','은광석','흑요석 원석'][r],cat:'mat',w:.2,ic:'gem',col:C,desc:()=>REGN[r]+' 장비('+(r===1?'1·2':r===2?'3·4':'5')+'단계) 제작 재료 · '+REGN[r]+' 몬스터 · 퀘스트 · 토벌 의뢰'};
  for(const p of ['w','a','c'])STK['d'+p+r]={n:REGN[r]+' '+PARTN[p]+' 도면',cat:'mat',w:0,ic:'book',col:{w:'#e08a5a',a:'#6aa0d8',c:'#c8a0e8'}[p],desc:()=>REGN[r]+' '+PARTN[p]+(p==='a'?'(투구·갑옷·망토·장갑·장화)':p==='c'?'(목걸이·반지)':'')+' 제작에 1장 · '+REGN[r]+' 몬스터 낮은 확률 · 지역 보스 · 퀘스트'};}
const STK_ORDER=['hp','mp','ret','spdp','atkp','defp','cure','bls','book_dash','book_roar','book_quake','stone','ore1','ore2','ore3','dw1','da1','dc1','dw2','da2','dc2','dw3','da3','dc3','rcp2','rcp3','rcp4','shard'];
const stonePrice=()=>40+4*S.lv;
/* v4.66 G12-a 버프 물약 표 — 효과 · 지속(초) · 소지 한도 · 값 */
const BUFP={spdp:{ic:'»',mv:.15,as:.10,txt:'이동 속도 +15% · 공격 속도 +10%'},atkp:{ic:'⚔',atk:.08,txt:'공격력 +8%'},defp:{ic:'⛊',dr:.08,txt:'받는 피해 −8%'}},BUF_K={dur:300,cap:5,p0:150,pL:18};
const BUF_IDS=Object.keys(BUFP),bufPrice=()=>BUF_K.p0+BUF_K.pL*S.lv;
/* v4.67 G12-b 정화 물약 — fx: 푸는 상태이상(기절 제외) · imm: 면역 초 · 값 p0+pL×Lv */
const CURE_K={fx:['poison','burn','slow'],imm:10,cap:5,p0:60,pL:4},curePrice=()=>CURE_K.p0+CURE_K.pL*S.lv;
const bufDesc=k=>BUFP[k].txt+' · '+(BUF_K.dur/60)+'분 · 다시 마시면 시간만 처음으로 · 쓰러지면 사라짐 · 소지 한도 '+BUF_K.cap+' · 물약 상인';
/* 퀘스트 보상 정리: 예전 주문서 보상 → 강화석(장당 3) · 축복 주문서 */
function normRwStk(o){if(!o)return;const conv={wsc:['stone',3],asc:['stone',3],wscB:['bls',1],ascB:['bls',1]};for(const k in conv)if(o[k]){const [nk,m]=conv[k];o[nk]=(o[nk]||0)+o[k]*m;delete o[k];}}
const cnt=k=>{const d=STK[k];if(!d)return 0;return d.f?S[d.f]||0:(S.bag[k]||0);};
const setCnt=(k,v)=>{const d=STK[k];if(d.f)S[d.f]=v;else S.bag[k]=v;};
function addStk(k,n){if(n<=0)return 0;setCnt(k,cnt(k)+n);if(acqSrc&&acqStk(k))acqLog({cat:/^(book_|rcp)/.test(k)?'book':'mat',k,n:STK[k].n,q:n,src:acqSrc,z:acqZone});return n;}
/* v4.31 획득 기록 — 자동 사냥 중 무엇을 어디서 얻었는지. 고급 이상 장비 · 보스 전용 장비 · 도면 · 제작 비법서 · 스킬서 · 축복 주문서만, 최근 ACQ_MAX건(새것이 앞).
   가방 가득 · 무게 초과로 줍지 못한 장비도 '놓침'으로 남긴다. 상점 구입 · 분해 · 제작 결과 · 광물 · 강화석 · 물약은 남기지 않는다(너무 많아 정작 볼 것을 가림) */
const ACQ_MAX=50,ACQ_MERGE=3000;let acqSrc=null,acqZone=null;
const acqStk=k=>k==='bls'||/^rcp\d$/.test(k)||k.startsWith('book_')||/^d[wac]\d$/.test(k);
function acqSrcOf(m){if(!m)return null;if(typeof m==='string')return m;const kind=m.inv?'침공':m.field?'필드 보스':m.eliteOf?'관문 정예':m.boss?'보스':'';return (kind?kind+' · ':'')+m.name+' Lv '+m.lv;}
function acqZoneOf(m){if(m&&m.zone&&typeof ZALL!=='undefined'&&ZALL[m.zone])return ZALL[m.zone].name;return typeof MAPS!=='undefined'&&MAPS[MAPID]?MAPS[MAPID].name:'';}
function withAcq(src,z,f){const a=acqSrc,b=acqZone;acqSrc=src;acqZone=z;try{return f();}finally{acqSrc=a;acqZone=b;}}
function acqLog(e){if(!S)return;const L=S.acq||(S.acq=[]),now=Date.now(),p=L[0];
  /* 같은 곳에서 같은 재료를 잇달아 얻으면 한 줄로 합친다(퀘스트 보상 도면 2장 등) */
  if(p&&!e.u&&!p.u&&p.k===e.k&&p.src===e.src&&!p.miss===!e.miss&&now-p.at<ACQ_MERGE){p.q=(p.q||1)+(e.q||1);p.at=now;return;}
  e.at=now;L.unshift(e);if(L.length>ACQ_MAX)L.length=ACQ_MAX;}
const acqMissNew=()=>!!(S&&S.acq&&S.acq.some(e=>e.miss&&e.at>(S.acqSeen||0)));
/* v4.9 제작 (리니지M: 일반·고급은 적은 재료로 확정, 희귀 이상은 제작 비법서 + 확률 제작). 실패하면 비법서·강화석·골드만 잃고 재료 장비는 남는다(싱글 완화). 대성공 5%: 결과물 +1~3 */
const CRAFT_EQ=[
  {need:null,ore:t=>2+t,gold:t=>20+30*t*t,rate:1},
  {need:{g:0,n:2},ore:t=>3+t,gold:t=>60*t*t,rate:1},
  {need:{g:1,n:1},rcp:'rcp2',ore:t=>4+2*t,gold:t=>150*t*t,rate:.8},
  {need:{g:2,n:1},rcp:'rcp3',ore:t=>6+3*t,gold:t=>300*t*t,rate:.5},
  {need:{g:3,n:1},rcp:'rcp4',ore:t=>8+4*t,gold:t=>600*t*t,rate:.3}];
const CRAFT_GREAT=.05,CRAFT_KINDS=['weapon','helm','armor','cloak','gloves','boots','neck','ring'];
const craftTierMax=()=>S.maps.includes('erna')?5:S.maps.includes('kardo')?4:2;

/* =====================================================================
   v4.10 신앙 (지역·보스 권장 스탯)
   - 출처: 장비 등급(높은 등급 · 높은 단계일수록) · 강화 단계(무기·방어구 +1당 1) · 컬렉션 · 지역 보스 전용 장비
   - 지역(사냥터)·보스마다 요구 신앙이 있고, 모자라면 주는 피해↓ · 받는 피해↑ (faithMul)
   ===================================================================== */
const FAITH_G=[0,1,2,4,6];
const gradeFaith=(g,t)=>Math.round(FAITH_G[g]*(1+.25*((t||1)-1)));
/* 지역 보스 전용 장비 (리니지M 보스 드롭 장비): 관문 정예(지역 보스)만 떨어뜨린다. 퀘스트 첫 처치는 a 확정 · b 35%, 다시 나타난 지역 보스는 40%로 둘 중 하나 */
const BU={
  b6a:{q:'q6',n:'왕멧돼지 엄니 도끼',k:'weapon',t:2,g:2,fa:3,x:{atk:2}},
  b6b:{q:'q6',n:'왕멧돼지 가죽 장화',k:'boots',t:2,g:2,fa:3,x:{hp:20}},
  b10a:{q:'q10',n:'큰물뱀 비늘 갑옷',k:'armor',t:2,g:2,fa:4,x:{def:2}},
  b10b:{q:'q10',n:'물뱀 눈 목걸이',k:'neck',t:2,g:2,fa:4,x:{mp:20}},
  b12a:{q:'q12',n:'군주의 용암 장갑',k:'gloves',t:2,g:3,fa:5,x:{atk:3}},
  b12b:{q:'q12',n:'마그마 심장 반지',k:'ring',t:2,g:3,fa:5,x:{crit:.01}},
  b16a:{q:'q16',n:'파수꾼의 포자 투구',k:'helm',t:3,g:2,fa:5,x:{hp:40}},
  b16b:{q:'q16',n:'균사 망토',k:'cloak',t:3,g:2,fa:5,x:{mp:30}},
  b19a:{q:'q19',n:'등잔 껍데기 갑옷',k:'armor',t:3,g:3,fa:6,x:{def:4}},
  b19b:{q:'q19',n:'여왕의 등불 목걸이',k:'neck',t:3,g:3,fa:6,x:{skm:.02}},
  b21a:{q:'q21',n:'광석왕의 대검',k:'weapon',t:4,g:3,fa:7,x:{atk:6}},
  b21b:{q:'q21',n:'광석왕의 반지',k:'ring',t:4,g:3,fa:7,x:{atk:3}},
  b27a:{q:'q27',n:'불티나무 껍질 망토',k:'cloak',t:5,g:3,fa:8,x:{hp:60}},
  b27b:{q:'q27',n:'거목의 뿌리 장화',k:'boots',t:5,g:3,fa:8,x:{def:3}},
  b30a:{q:'q30',n:'대게 집게 장갑',k:'gloves',t:5,g:3,fa:9,x:{atk:6}},
  b30b:{q:'q30',n:'흑요석 등딱지 투구',k:'helm',t:5,g:3,fa:9,x:{def:4}},
  b32a:{q:'q32',n:'홍염의 날개검',k:'weapon',t:5,g:4,fa:12,x:{atk:12}},
  b32b:{q:'q32',n:'홍염의 깃 반지',k:'ring',t:5,g:4,fa:12,x:{crit:.02}}};
for(const id in BU)BU[id].id=id;
const buOfQ=qid=>Object.values(BU).filter(b=>b.q===qid);
const BU_FIRST_B=.35,BU_FIELD=.40,BU_PITY=3,BU_INV=.10,FIELD_RESP=150;
/* ===== 장비 인스턴스 ===== */
function newItem(k,t,g){return{u:++S.nu,k,t:clamp(t,1,TIER_MAX),g:clamp(g,0,4),en:0,ff:0};}
function newBU(id){const b=BU[id];return{u:++S.nu,k:b.k,t:b.t,g:b.g,en:0,ff:0,bu:id};}
function itemName(it){if(it.bu)return (it.en?'+'+it.en+' ':'')+BU[it.bu].n;const T=TIERS[it.t],base=it.k==='weapon'?T.wn:it.k==='cloak'?T.ck:it.k==='neck'?T.nk:it.k==='ring'?T.rk:T.mat+' '+SLOTN[it.k];return (it.en?'+'+it.en+' ':'')+base;}
function itemStats(it){const o=Object.assign({},itemBase(it.k,TIERS[it.t].iL,it.g)),E=ENCH[it.k];if(E&&it.en)for(const s in E)o[s]=(o[s]||0)+E[s]*it.en;
  const B=it.bu&&BU[it.bu];if(B)for(const s in B.x)o[s]=+((o[s]||0)+B.x[s]).toFixed(4);
  const fa=(B?B.fa:gradeFaith(it.g,it.t))+(E?it.en:0);if(fa)o.faith=fa;return o;}
const itemW=it=>Math.round(WT[it.k]*(1+.1*(it.t-1)));
const itemById=u=>S.items.find(i=>i.u===u);
const equippedU=()=>new Set(Object.values(S.eq).filter(Boolean));
const isEq=it=>equippedU().has(it.u);
const slotOf=it=>{for(const s of SLOTS)if(S.eq[s]===it.u)return s;return null;};
/* 장착 합계 (pStats에서 매 프레임 쓰므로 버전 캐시) */
let gearV=-1,gearC=null;const gearDirty=()=>{gearV=-1;lastQKey='';};
function gearSum(){if(gearV===S.nu*1000+(S.gv||0)&&gearC)return gearC;const o={atk:0,def:0,hp:0,mp:0,crit:0,skm:0,faith:0};
  for(const s of SLOTS){const it=S.eq[s]&&itemById(S.eq[s]);if(!it)continue;const st=itemStats(it);for(const k in st)o[k]+=st[k];}
  const cb=collSum();for(const k in cb)o[k]+=cb[k];
  gearC=o;gearV=S.nu*1000+(S.gv||0);return o;}
const bumpGear=()=>{S.gv=(S.gv||0)+1;gearDirty();};
/* 비교용 전투력: 해당 아이템으로 바꿨을 때 */
function cpWith(slot,u){const old=S.eq[slot];S.eq[slot]=u;bumpGear();const c=cpOf();S.eq[slot]=old;bumpGear();return c;}
function targetSlot(it){if(it.k!=='ring')return it.k;if(!S.eq.ring1)return 'ring1';if(!S.eq.ring2)return 'ring2';
  const a=itemById(S.eq.ring1),b=itemById(S.eq.ring2);return cpScore(a)<=cpScore(b)?'ring1':'ring2';}
function cpScore(it){if(!it)return 0;const s=itemStats(it);return (s.atk||0)*6+(s.def||0)*4+(s.hp||0)*.6+(s.mp||0)*.4+(s.crit||0)*1200+(s.skm||0)*660+(s.faith||0)*FAITH_CP;}
const FAITH_CP=10;
function equipItem(u,silent){const it=itemById(u);if(!it)return false;const prev=slotOf(it);if(prev)return false;const s=targetSlot(it);S.eq[s]=u;bumpGear();
  const st=pStats();player.hp=Math.min(player.hp,st.hp);player.mp=Math.min(player.mp,st.mp);if(!silent)toast(itemName(it)+' 장착',true);save();return true;}
function unequip(slot,silent){const u=S.eq[slot];if(!u)return false;S.eq[slot]=null;bumpGear();const st=pStats();player.hp=Math.min(player.hp,st.hp);player.mp=Math.min(player.mp,st.mp);if(!silent)toast(itemName(itemById(u))+' 해제');save();return true;}
/* 무게 */
function weightNow(){let w=0;for(const it of S.items)w+=itemW(it);for(const k in STK)w+=STK[k].w*cnt(k);return w;}
const weightMax=()=>1500+25*(S.st.str+S.st.vit)+15*S.lv;
const wPct=()=>weightNow()/weightMax();
const bagUsed=()=>S.items.length+STK_ORDER.filter(k=>cnt(k)>0).length;
/* 획득 */
function addItem(it,from){const src=from?acqSrc||acqSrcOf(from):null,lg=src&&(it.g>=1||it.bu),rec=miss=>acqLog({cat:'eq',n:itemName(it),g:it.g,bu:it.bu?1:0,u:miss?0:it.u,miss:miss?1:0,src,z:acqZone||acqZoneOf(from)});
  if(bagUsed()>=BAG_SLOTS){toastThr('가방이 가득 찼다 · 분해하거나 정리하자 (I)');if(lg)rec(1);return false;}
  if(weightNow()+itemW(it)>weightMax()){toastThr('무게 초과 · '+itemName(it)+'을(를) 들 수 없다');if(lg)rec(1);return false;}
  it.nw=1;S.items.push(it);if(lg)rec(0);autoLockNew(it);STAT.drops=(STAT.drops||0)+1;lastQKey='';
  if(S.cfg.autoEq&&!isEq(it)){const s=targetSlot(it),cur=S.eq[s]&&itemById(S.eq[s]);if(!cur||cpWith(s,it.u)>cpOf()+1){equipItem(it.u,true);toast('자동 장착 · '+GRADES[it.g].n+' '+itemName(it),true);}}
  return true;}
let toastT=0;function toastThr(m){if(t<toastT)return;toastT=t+4;toast(m);}
function rollGrade(boss){const r=Math.random();if(!boss)return r<DROP.hi?1:0;for(const [g,p] of DROP.boss.grade)if(r<p)return g;return 0;}
function rollSlot(){const W=DROP.slot;let s=0;for(const k in W)s+=W[k];let r=Math.random()*s;for(const k in W){r-=W[k];if(r<=0)return k;}return 'weapon';}
/* 지역 보스 전용 장비 드롭 */
function dropBU(m){let L=[];if(m.eliteOf){const q=QUESTS.find(x=>x.id===m.eliteOf),B=buOfQ(m.eliteOf);if(!B.length)return;
    if(m.field){const cq=curQ(),force=S.qs==='active'&&cq.type==='fboss'&&cq.boss===m.eliteOf;/* v4.24 천장: 같은 필드 보스에서 연속 2번 못 얻으면 3번째는 확정 */const bm=S.buMiss||(S.buMiss={}),pity=(bm[m.eliteOf]||0)>=BU_PITY-1;if(force||pity||Math.random()<BU_FIELD){bm[m.eliteOf]=0;/* 아직 컬렉션에 못 넣었고 등록할 수 있는 사본(미장착 · 미잠금)이 없는 쪽을 우선 — v4.24: 장착 중인 사본은 '갖고 있음'으로 치지 않는다 */const want=B.filter(b=>!COLL.some(c=>c.req.some((r,i)=>r.bu===b.id&&!collReg(c,i)))?false:!S.items.some(x=>x.bu===b.id&&!isEq(x)&&!x.lock));L.push(want.length?want[Math.floor(Math.random()*want.length)]:B[Math.random()<.5?0:1]);}else bm[m.eliteOf]=(bm[m.eliteOf]||0)+1;}else{L.push(B[0]);if(Math.random()<BU_FIRST_B)L.push(B[1]);}}
  else if(m.inv){const cl=QUESTS.filter((q,i)=>i<S.qi&&q.elite&&qMap(q)===MAPID).flatMap(q=>buOfQ(q.id));if(cl.length&&Math.random()<BU_INV)L.push(cl[Math.floor(Math.random()*cl.length)]);}
  L.forEach((b,i)=>{const it=newBU(b.id);if(addItem(it,m)){floatTxt(m.x,m.y-46-i*9,'★ '+b.n,GRADES[b.g].c,true);banner('보스 전용 장비',b.n+' · 신앙 +'+b.fa,true);STAT.bu=(STAT.bu||0)+1;}});}
function dropFrom(m){return withAcq(acqSrcOf(m),acqZoneOf(m),()=>dropFrom0(m));}
function dropFrom0(m){dropBU(m);const tier=tierOfLv(m.lv),n=m.boss?1:Math.random()<DROP.eq?1:0;
  for(let i=0;i<n;i++){const it=newItem(rollSlot(),tier,rollGrade(m.boss));if(addItem(it,m)){const G=GRADES[it.g];floatTxt(m.x,m.y-30-i*8,G.n+' '+itemName(it),G.c,it.g>=2);
      if(it.g>=3)banner(G.n+' 장비 획득',itemName(it),true);else if(it.g>=2)toast(G.n+' · '+itemName(it)+' 획득',true);else if(betterThanEq(it))toast('더 좋은 장비 · '+itemName(it)+' (가방 I)',true);}}
  {const r=(m.zone&&ZALL[m.zone]&&MAP_REG[ZALL[m.zone].map])||REG(tier),tr=r===1?1:r===2?3:5;if(Math.random()<(m.boss?1:DROP.ore)){const n=m.boss?3+2*r:1;addStk('ore'+r,n);if(m.boss||Math.random()<.3)floatTxt(m.x,m.y-34,'+'+STK['ore'+r].n+' '+n,STK['ore'+r].col);}
    if(Math.random()<(m.boss?DROP.boss.dsg:DROP.dsg)){const k=dsgRand(r);addStk(k,1);floatTxt(m.x,m.y-52,'+'+STK[k].n,STK[k].col,true);toast(STK[k].n+' 획득',true);}}
  if(m.boss){const B=DROP.boss;for(const k of ['rcp2','rcp3','rcp4','bls'])if(Math.random()<B[k]){addStk(k,1);floatTxt(m.x,m.y-40,'+'+STK[k].n,STK[k].col,true);toast(STK[k].n+' 획득',true);}}
}
const dsgRand=r=>{const x=Math.random();return 'd'+(x<.3?'w':x<.75?'a':'c')+r;};
/* 분해 → 강화석 */
const disYield=it=>GRADES[it.g].dis*(it.bu?2:1)+(it.t-1)+Math.floor(it.en/2);
function disassemble(us,silent){let n=0,st=0;for(const u of us){const i=S.items.findIndex(x=>x.u===u);if(i<0)continue;const it=S.items[i];if(isEq(it)||it.lock)continue;st+=disYield(it);S.items.splice(i,1);n++;}
  if(n){S.stone+=st;STAT.dis=(STAT.dis||0)+n;bumpGear();if(!silent)toast('분해 '+n+'개 · 강화석 +'+st,true);save();}return{n,st};}
/* 자동 분해: 무게 45% 이상 또는 가방 90% 이상일 때, 설정 등급 이하 · 미장착 · 잠기지 않음 · 지금 장비보다 좋지 않은 것 */
function autoDisCheck(){const g=S.cfg.autoDis;if(g==null||g<0)return;if(wPct()<.45&&bagUsed()<BAG_SLOTS*.9)return;
  const us=S.items.filter(it=>it.g<=g&&!it.bu&&!isEq(it)&&!it.lock&&!betterThanEq(it)&&!collNeeds(it)).map(it=>it.u);if(!us.length)return;const r=disassemble(us,true);
  if(r.n)toast('자동 분해 · '+GRADES[g].n+(g?'까지 ':' ')+r.n+'개 → 강화석 +'+r.st+' (설정에서 변경)',true);}
/* v4.32 자동 잠금: 설정 등급 이상을 얻으면 바로 잠근다 — 아직 컬렉션에 등록할 수 있는 장비는 등록을 막지 않도록 잠그지 않는다 */
function autoLockOk(it){const g=S.cfg&&S.cfg.autoLock;return g!=null&&g>=0&&it.g>=g&&!it.lock&&!collNeeds(it);}
function autoLockNew(it){if(!autoLockOk(it))return false;it.lock=1;toast('자동 잠금 🔒 '+GRADES[it.g].n+' '+itemName(it)+' (설정에서 변경)',true);return true;}
/* v4.32 일괄 잠금 대상 */
const LOCK_SETS=[['eq','장착 중인 장비',it=>isEq(it)],['hi','영웅 이상 (가방)',it=>!isEq(it)&&it.g>=3],['en','강화한 장비 +1 이상 (가방)',it=>!isEq(it)&&it.en>=1],['bu','보스 전용 ★ (가방)',it=>!isEq(it)&&!!it.bu]];
function lockSet(id,on){const L=LOCK_SETS.find(x=>x[0]===id);if(!L)return 0;let n=0;for(const it of S.items)if(L[2](it)&&!it.lock===!!on){it.lock=on?1:0;n++;}if(n)save();return n;}
function unlockAll(){let n=0;for(const it of S.items)if(it.lock){it.lock=0;n++;}if(n)save();return n;}
function betterThanEq(it){const s=targetSlot(it),cur=S.eq[s]&&itemById(S.eq[s]);return !cur||cpScore(it)>cpScore(cur);}
/* 강화 */

/* 축복받은 주문서: 안전 구간 안에서는 +0~2 → +1~3, +3~5 → +1~2, 그 위 +1 (리니지). 안전 구간을 넘어서는 일반과 같은 확률로 +1 */
function blessUp(en){const m=en<=2?3:en<=5?2:1;return 1+Math.floor(Math.random()*m);}
/* blessed: 축복받은 강화 주문서 1장 + 골드 (강화석 없음) */
function enchCheck(it,blessed){if(!it||!canEnch(it.k))return{ok:false,why:'강화할 수 없다'};if(it.en>=ENH.max)return{ok:false,why:'최대 강화'};const c=enchCost(it,blessed?0:null);
  if(S.gold<c.gold)return{ok:false,why:'골드 부족',c};if(blessed){if(!cnt('bls'))return{ok:false,why:'축복받은 강화 주문서가 없다',c};}else if(S.stone<c.stone)return{ok:false,why:'강화석 '+S.stone+'/'+c.stone,c};return{ok:true,c};}
function enchant(u,blessed){const it=itemById(u),ck=enchCheck(it,blessed);if(!ck.ok)return it&&it.en>=ENH.max?{max:true,it}:null;
  S.gold-=ck.c.gold;if(blessed)setCnt('bls',cnt('bls')-1);else{S.stone-=ck.c.stone;if(ck.c.aid)STAT.aidSt=(STAT.aidSt||0)+ck.c.stone-ck.c.base;}STAT.ench=(STAT.ench||0)+1;STAT.enchG=(STAT.enchG||0)+ck.c.gold;
  if(blessed&&it.en<enchSafe(it.k)){const up=Math.min(ENH.max-it.en,blessUp(it.en));it.en+=up;it.ff=0;bumpGear();growthEvent('ench',it);save();return{ok:true,it,rate:1,up};}
  const rate=enchRate(it,blessed?0:null),ok=Math.random()<rate;
  if(ok){it.en++;it.ff=0;bumpGear();growthEvent('ench',it);}else it.ff=(it.ff||0)+1;save();return{ok,it,rate,up:ok?1:0};}
function enchantEquipped(slot){const it=S.eq[slot]&&itemById(S.eq[slot]);if(!it||it.en>=ENH.max){S.stone+=4;return false;}it.en++;bumpGear();return true;}
/* 무기 스프라이트(휘두르기) = 장착 무기 티어 */
const weapSpr=()=>{const it=S.eq.weapon&&itemById(S.eq.weapon);return it?TIERS[it.t].w:'club';};
/* 미스릴 장검 스프라이트 (art.js에 없는 종류) */
const _mkWeapon0=mkWeapon;
mkWeapon=function(k){if(k!=='sword')return _mkWeapon0(k);const c=mk(24,9),g=c.getContext('2d'),p=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
  p(0,4,4,1,'#4a3a2a');p(0,3,3,1,'#2a2018');p(4,1,1,7,'#c8d8e8');p(3,2,1,5,'#8aa0b8');p(5,3,15,3,'#8ab8d8');p(5,3,15,1,'#e0f4ff');p(20,4,2,1,'#e0f4ff');p(6,4,13,1,'#6a98b8');return c;};

/* ===== 픽셀 아이콘 (12×12 문자 지도) ===== */
const ICONMAP={
  helm:['............','....kkkk....','...kbbaak...','..kbaaaack..','..kaaaaack..','.kaaggaaack.','.kaakkkkack.','.kak....kck.','.kak....kck.','..k......k..','............','............'],
  armor:['............','..kk....kk..','.kbak..kack.','.kaaakkaaak.','.kkaabbaakk.','..kaabbaak..','..kaaggaak..','..kaaaaaak..','..kcccccck..','..kaaaaaak..','...kkkkkk...','............'],
  cloak:['............','....kggk....','...kabbak...','..kaabbaak..','..kaaaaaak..','.kaaaaaaaak.','.kaacaacaak.','.kaacaacaak.','kaaacaacaaak','kaacaaaacaak','kkkkkkkkkkkk','............'],
  gloves:['............','....k.k.k...','...kbkbkbk..','...kakakak..','..kkaaaaaak.','.kbkaaaaaak.','.kaakaaaaak.','..kaaaaaak..','...kaaaak...','...kggggk...','...kkkkkk...','............'],
  boots:['............','...kkkkk....','...kbaak....','...kbaak....','...kaaak....','...kaaak....','...kaaakkk..','..kbaaaaaakk','..kaaaaaaaak','..kgggggggck','..kkkkkkkkkk','............'],
  neck:['............','..aa....aa..','.a..a..a..a.','.a...aa...a.','..a......a..','...a....a...','....a..a....','.....aa.....','....kggk....','....kgbk....','.....kk.....','............'],
  ring:['............','.....kk.....','....kggk....','....kgbk....','....kaak....','...ka..ak...','..ka....ak..','..ka....ak..','...ka..ak...','....kaak....','............','............'],
  pot:['............','.....ww.....','.....ww.....','....kkkk....','....k..k....','...kbaaak...','..kbaaaaak..','..kaaaaaak..','..kaaaaaak..','..kcaaaack..','...kkkkkk...','............'],
  scroll:['............','.kkkkkkkkkk.','kwwwwwwwwwwk','.kkkkkkkkkk.','..kpppppppk.','..kpcccccpk.','..kppppppk..','..kpcccpppk.','..kpppaaapk.','.kkkkkabakk.','kwwwwwaaawwk','.kkkkkkkkkk.'],
  gem:['............','.....kk.....','....kbbk....','...kbaaak...','..kbaaaaak..','..kaaaaack..','...kaaack...','....kack....','.....kk.....','............','............','............'],
  book:['............','..kkkkkkkk..','.kaaaaaaabk.','.kawwwwwabk.','.kawwbwwabk.','.kawwwwwabk.','.kaaaaaaabk.','.kaaaaaaabk.','.kaaaaaaabk.','.kccccccccwk','..kkkkkkkkk.','............'],
};
const ICONC=new Map();
function shade(hex,f){const n=parseInt(hex.slice(1),16),r=n>>16,g=n>>8&255,b=n&255,m=v=>clamp(Math.round(f>1?v+(255-v)*(f-1):v*f),0,255);return '#'+[m(r),m(g),m(b)].map(v=>v.toString(16).padStart(2,'0')).join('');}
function paintIcon(key,pal){const ck=key+JSON.stringify(pal);let c=ICONC.get(ck);if(c)return c;const map=ICONMAP[key];c=mk(12,12);const g=c.getContext('2d');
  for(let y=0;y<12;y++)for(let x=0;x<12;x++){const ch=map[y][x];if(!ch||ch==='.')continue;g.fillStyle=ch==='k'?'#1a1220':pal[ch]||'#ff00ff';g.fillRect(x,y,1,1);}ICONC.set(ck,c);return c;}
/* 무기 아이콘: 스프라이트의 실제 그림 영역만 잘라 45° 돌려 꽉 차게 */
function weaponIcon(w){const ck='w:'+w;let c=ICONC.get(ck);if(c)return c;const s=mkWeapon(w),d=s.getContext('2d').getImageData(0,0,s.width,s.height).data;let x0=99,x1=-1,y0=99,y1=-1;
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++)if(d[(y*s.width+x)*4+3]>0){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
  const bw=x1-x0+1,bh=y1-y0+1,n=Math.ceil((bw+bh)/1.414)+1;c=mk(n,n);const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.translate(n/2,n/2);g.rotate(-Math.PI/4);g.drawImage(s,x0,y0,bw,bh,-bw/2,-bh/2,bw,bh);ICONC.set(ck,c);return c;}
function itemIcon(it){if(it.k==='weapon')return weaponIcon(it.bu&&BU[it.bu].g>=4?'obsword':TIERS[it.t].w);const P=it.bu?Object.assign({},TIERS[it.t].col,{g:GRADES[it.g].c,b:shade(GRADES[it.g].c,1.3)}):TIERS[it.t].col;return paintIcon(it.k,P);}
function stkIcon(k){const d=STK[k],a=d.col;return paintIcon(d.ic,{a,b:shade(a,1.45),c:shade(a,.62),w:'#d8c8a0',p:'#efe2c0',g:a});}

/* ===== 세이브 이전 (v4.7 → v4.8) ===== */
const CFG0={scan:'mid',tgt:'quest',order:'slot',counter:true,potAt:.4,autoDis:-1,autoEq:false,autoLock:-1,autoBuf:false,autoCure:false};
function migrate48(S,fresh){if(S.cfg&&S.cfg.dodge===undefined)S.cfg.dodge=true;/* v4.72 G1-h 예고 회피 설정 */if(typeof migrateQi==='function')migrateQi(S);if(S.grave===undefined)S.grave=null;if(!S.buf||typeof S.buf!=='object')S.buf={};/* v4.66 G12 버프 물약 남은 시간(초) *//* v4.65 G9 무덤(이전 세이브엔 없음) */S.cfg=Object.assign({},CFG0,S.cfg||{});if(S.cfg.potAt==null)S.cfg.potAt=.4;
  if(!S.items){S.items=[];S.eq={};S.bag={};S.nu=S.nu||0;
    /* 기존 세이브: 무기·갑옷 강화 단계를 그대로 옮기고, 몬스터 상향에 맞춰 현재 레벨 티어의 일반 장비 6부위를 지급 */
    const T=fresh?1:tierOfLv(S.lv||1),mkI=(k)=>({u:++S.nu,k,t:T,g:0,en:0,ff:0});
    /* v4.9: 새 게임은 장비 없이 시작 — 사냥·제작으로 얻는다 */
    if(!fresh){const w=mkI('weapon');w.en=Math.min(ENH.max,S.wlv||0);const a=mkI('armor');a.en=Math.min(ENH.max,S.alv||0);S.items.push(w,a);S.eq.weapon=w.u;S.eq.armor=a.u;for(const k of ['helm','cloak','gloves','boots']){const it=mkI(k);S.items.push(it);S.eq[k]=it.u;}S.migrated48=true;}
    S.bag.wsc=fresh?0:2;S.bag.asc=fresh?0:3;}
  S.coll=S.coll||{};
  /* v4.14: 주문서 → 강화석(장당 3) · 축복 주문서 통합 */
  if(S.bag){normRwStk(S.bag);if(S.bag.stone){S.stone=(S.stone||0)+S.bag.stone;delete S.bag.stone;}}S.crafted=S.crafted||[0,0,0,0,0];
  /* v4.10: 진행 중인 관문에 새로 생긴 성장 서브를 연다 */
  if(S.qs==='active'&&S.qi<QUESTS.length)for(const id of QUESTS[S.qi].subs||[])if(S.sq&&!S.sq[id])S.sq[id]={st:'avail',n:0};
  for(const s of SLOTS)if(!(s in S.eq))S.eq[s]=null;S.bag=S.bag||{};
  if(!S.slots){S.slots=Array(8).fill(null);let j=0;for(const s of SK)if((S.sk[s.id]||0)>0&&j<8)S.slots[j++]=s.id;}
  while(S.slots.length<8)S.slots.push(null);S.slots=S.slots.slice(0,8);
  if(S.autoPot==null)S.autoPot=true;
  /* v4.8.4 권능 퀘스트 획득: 이전 세이브는 쓰던 권능만 얻은 것으로, 나머지는 시련 퀘스트로 (메인 5를 넘겼으면 바로 열림) */
  if(!S.gods){S.gods={};if(S.god)S.gods[S.god]=true;if(S.qi>=5)for(const [id,k] of [['ga','athena'],['gr','artemis'],['gz','zeus']])if(!S.gods[k]&&!S.sq[id])S.sq[id]={st:'avail',n:0};}
  return S;}

/* =====================================================================
   v4.9 컬렉션 (리니지M 아이템 컬렉션): 지정 장비를 등록하면 아이템은 사라지고, 컬렉션을 완성하면 능력치가 영구히 오른다.
   장착 중 · 잠금 장비는 등록 불가. 요구 조건: 부위(k) · 단계(t, 없으면 아무 단계) · 등급 이상(g) · 강화 이상(en)
   ===================================================================== */
const COLL=[
  {id:'c1',cat:0,n:'원정대 견습생',req:[{k:'weapon',t:1},{k:'armor',t:1}],b:{hp:30,faith:1}},
  {id:'c2',cat:0,n:'가죽 수집가',req:[{k:'helm',t:1},{k:'gloves',t:1},{k:'boots',t:1}],b:{def:2,faith:1}},
  {id:'c3',cat:0,n:'첫 장신구',req:[{k:'neck',t:1},{k:'ring',t:1}],b:{mp:20,hp:20,faith:1}},
  {id:'c4',cat:0,n:'청동 전사',req:[{k:'weapon',t:2},{k:'helm',t:2},{k:'armor',t:2}],b:{atk:3,hp:30,faith:2}},
  {id:'c5',cat:0,n:'사냥꾼의 차림',req:[{k:'cloak',t:2},{k:'gloves',t:2},{k:'boots',t:2}],b:{def:2,hp:30,faith:2}},
  {id:'c6',cat:1,n:'단련의 시작',req:[{k:'weapon',en:4},{k:'armor',en:3}],b:{atk:4,faith:3}},
  {id:'c7',cat:1,n:'고급 장신구함',req:[{k:'neck',g:1},{k:'ring',g:1},{k:'ring',g:1}],b:{crit:.01,faith:2}},
  {id:'c8',cat:1,n:'강철 수호대',req:[{k:'helm',t:3,en:2},{k:'armor',t:3,en:2},{k:'boots',t:3,en:2}],b:{def:3,hp:60,faith:3}},
  {id:'c9',cat:1,n:'협곡의 검사',req:[{k:'weapon',t:3,g:1,en:3},{k:'gloves',t:3,g:1}],b:{atk:6,faith:3}},
  {id:'c10',cat:2,n:'희귀한 빛',req:[{k:'weapon',g:2},{k:'armor',g:2},{k:'cloak',g:2}],b:{hp:100,mp:30,faith:4}},
  {id:'c11',cat:2,n:'미스릴 기사단',req:[{k:'weapon',t:4,en:5},{k:'helm',t:4,en:4},{k:'armor',t:4,en:4},{k:'gloves',t:4,en:4}],b:{atk:8,def:4,faith:5}},
  {id:'c12',cat:2,n:'수정 현자',req:[{k:'neck',t:3,g:2},{k:'ring',t:3,g:2}],b:{skm:.04,faith:4}},
  {id:'c13',cat:3,n:'흑요석 정예',req:[{k:'weapon',t:5,g:2,en:6},{k:'armor',t:5,g:2,en:4},{k:'boots',t:5,g:1,en:4}],b:{atk:12,hp:120,faith:6}},
  {id:'c14',cat:3,n:'영웅의 증표',req:[{k:'weapon',g:3},{k:'armor',g:3},{k:'neck',g:3}],b:{crit:.02,skm:.05,faith:6}},
  {id:'c15',cat:3,n:'전설의 유산',req:[{k:'weapon',g:4,en:7},{k:'ring',g:4}],b:{atk:20,crit:.02,faith:8}},
];
/* v4.10 지역 보스 컬렉션: 보스 전용 장비(req.bu)로만 채운다 — 착용과 등록 사이의 선택 (리니지M 보스 아이템 컬렉션) */
COLL.push(
  {id:'bc6',cat:4,n:'숲의 주인 토벌',req:[{bu:'b6a'},{bu:'b6b'}],b:{faith:4,atk:3}},
  {id:'bc10',cat:4,n:'호수의 주인 토벌',req:[{bu:'b10a'},{bu:'b10b'}],b:{faith:5,hp:60}},
  {id:'bc12',cat:4,n:'마그마골렘 군주의 유산',req:[{bu:'b12a'},{bu:'b12b'}],b:{faith:6,def:3}},
  {id:'bc16',cat:4,n:'동굴 파수꾼 토벌',req:[{bu:'b16a'},{bu:'b16b'}],b:{faith:6,hp:80}},
  {id:'bc19',cat:4,n:'협곡 여왕 토벌',req:[{bu:'b19a'},{bu:'b19b'}],b:{faith:7,skm:.02}},
  {id:'bc21',cat:4,n:'광석골렘 왕의 유산',req:[{bu:'b21a'},{bu:'b21b'}],b:{faith:8,atk:6}},
  {id:'bc27',cat:4,n:'불티 숲 주인 토벌',req:[{bu:'b27a'},{bu:'b27b'}],b:{faith:9,hp:120}},
  {id:'bc30',cat:4,n:'용암 호수 군주 토벌',req:[{bu:'b30a'},{bu:'b30b'}],b:{faith:10,def:5}},
  {id:'bc32',cat:4,n:'불새 여왕 홍염의 유산',req:[{bu:'b32a'},{bu:'b32b'}],b:{faith:14,atk:12,crit:.01}},
  {id:'br1',cat:4,n:'로웬의 수호자',req:[{bu:'b6a',en:3},{bu:'b10a',en:3},{bu:'b12a',en:2}],b:{faith:8,atk:5,hp:80}},
  {id:'br2',cat:4,n:'카르도의 수호자',req:[{bu:'b16a',en:4},{bu:'b19a',en:4},{bu:'b21a',en:4}],b:{faith:10,atk:8,def:4}},
  {id:'br3',cat:4,n:'에르나의 수호자',req:[{bu:'b27a',en:5},{bu:'b30a',en:5},{bu:'b32a',en:5}],b:{faith:14,atk:12,hp:150}});
const COLL_CAT=['일반','고급','희귀','영웅 · 전설','지역 보스'];
const isBossColl=c=>c.cat===4;
const collReg=(c,i)=>!!(S.coll[c.id]&&S.coll[c.id][i]);
const collDone=c=>c.req.every((r,i)=>collReg(c,i));
function collSum(){const o={};if(!S||!S.coll)return o;for(const c of COLL)if(collDone(c))for(const k in c.b)o[k]=(o[k]||0)+c.b[k];return o;}
function reqLabel(r){if(r.bu)return (r.en?'+'+r.en+' ':'')+BU[r.bu].n+' · '+QUESTS.find(q=>q.id===BU[r.bu].q).elite.name.split(' · ').pop();const T=r.t&&TIERS[r.t];let n=T?(r.k==='weapon'?T.wn:r.k==='cloak'?T.ck:r.k==='neck'?T.nk:r.k==='ring'?T.rk:T.mat+' '+SLOTN[r.k]):'아무 '+SLOTN[r.k];
  return (r.en?'+'+r.en+' ':'')+n+(r.g?' · '+GRADES[r.g].n+' 이상':'');}
const reqMatch=(r,it,ignoreEn)=>(r.bu?it.bu===r.bu:!it.bu&&it.k===r.k&&(!r.t||it.t===r.t)&&it.g>=(r.g||0))&&(ignoreEn||it.en>=(r.en||0));
const reqIcon=r=>r.bu?{k:BU[r.bu].k,t:BU[r.bu].t,g:BU[r.bu].g,en:0,bu:r.bu}:{k:r.k,t:r.t||1,g:r.g||0,en:0};
/* 등록에 쓸 장비: 조건을 만족하는 미장착·미잠금 장비 중 가장 값이 낮은 것 */
function collCand(r,ignoreEn){return S.items.filter(it=>!isEq(it)&&!it.lock&&reqMatch(r,it,ignoreEn)).sort((a,b)=>a.g-b.g||a.en-b.en||a.t-b.t)[0]||null;}
function collNeeds(it){for(const c of COLL){if(collDone(c))continue;for(let i=0;i<c.req.length;i++)if(!collReg(c,i)&&reqMatch(c.req[i],it))return c;}return null;}
const collCanAny=()=>COLL.some(c=>!collDone(c)&&c.req.some((r,i)=>!collReg(c,i)&&collCand(r)));
function collRegister(cid,i,u){const c=COLL.find(x=>x.id===cid);if(!c||collReg(c,i))return false;const r=c.req[i],it=u?itemById(u):collCand(r);if(!it||isEq(it)||it.lock||!reqMatch(r,it))return false;
  S.items.splice(S.items.indexOf(it),1);S.coll[cid]=S.coll[cid]||{};S.coll[cid][i]=1;STAT.coll=(STAT.coll||0)+1;bumpGear();growthEvent('reg',it);
  if(collDone(c)){banner('컬렉션 완성',c.n+' · '+Object.entries(c.b).map(([k,v])=>STATN[k]+' '+statFmt(k,v)).join(' · '),true);burst(player.x,player.y,18,'#ffe08a',40,100,5);}
  else toast('컬렉션 등록 · '+c.n+' '+c.req.filter((r,j)=>collReg(c,j)).length+'/'+c.req.length,true);save();return true;}

/* ===== 제작 ===== */
function craftMats(k,t,g,n){return S.items.filter(it=>it.k===k&&it.t===t&&it.g===g&&!it.bu&&!isEq(it)&&!it.lock).sort((a,b)=>a.en-b.en).slice(0,n);}
function craftCheck(k,t,g){const R=CRAFT_EQ[g],ok=oreKey(t),dk=dsgKey(k,t),ore=R.ore(t),gold=R.gold(t),why=[];if(t>craftTierMax())why.push(TIERS[t].area+' 지역을 열어야 한다');
  if(cnt(ok)<ore)why.push(STK[ok].n+' '+cnt(ok)+'/'+ore);if(!cnt(dk))why.push(STK[dk].n+' 필요');if(S.gold<gold)why.push('골드 부족');if(R.rcp&&!cnt(R.rcp))why.push(STK[R.rcp].n+' 필요');
  if(R.need){const m=craftMats(k,t,R.need.g,R.need.n);if(m.length<R.need.n)why.push('재료 장비 '+GRADES[R.need.g].n+' '+m.length+'/'+R.need.n);}
  return{ok:!why.length,why,ore,ok_:ok,dk,gold,R};}
/* v4.33 여러 개 한 번에: 최대 = 모든 시도가 성공한다고 볼 때 재료가 되는 횟수(실패하면 재료 장비가 남아 더 할 수 있어도 보수적으로) · 최대 50 */
const CRAFT_N_MAX=50;
function craftMaxN(k,t,g){const c=craftCheck(k,t,g);if(!c.ok)return 0;const R=c.R;let n=Math.min(CRAFT_N_MAX,Math.floor(cnt(c.ok_)/c.ore),cnt(c.dk),c.gold>0?Math.floor(S.gold/c.gold):CRAFT_N_MAX);
  if(R.rcp)n=Math.min(n,cnt(R.rcp));if(R.need)n=Math.min(n,Math.floor(craftMats(k,t,R.need.g,99).length/R.need.n));return Math.max(0,n);}
/* n번 시도(재료가 떨어지면 그 자리에서 멈춤) → 요약 */
function craftBatch(k,t,g,n){const o={tries:0,ok:0,fail:0,great:0,items:[],stop:''};for(let i=0;i<n;i++){const r=craftItem(k,t,g);if(!r){o.stop=craftCheck(k,t,g).why[0]||'';break;}o.tries++;if(r.ok){o.ok++;o.items.push(r.it);if(r.great)o.great++;}else o.fail++;}
  o.best=o.items.slice().sort((a,b)=>cpScore(b)-cpScore(a))[0]||null;return o;}
function craftItem(k,t,g){const c=craftCheck(k,t,g);if(!c.ok)return null;const R=c.R;setCnt(c.ok_,cnt(c.ok_)-c.ore);setCnt(c.dk,cnt(c.dk)-1);S.gold-=c.gold;if(R.rcp)setCnt(R.rcp,cnt(R.rcp)-1);STAT.craft=(STAT.craft||0)+1;
  if(Math.random()>=R.rate){save();return{ok:false};}
  if(R.need)for(const it of craftMats(k,t,R.need.g,R.need.n))S.items.splice(S.items.indexOf(it),1);
  const it=newItem(k,t,g),great=Math.random()<CRAFT_GREAT;if(great)it.en=1+Math.floor(Math.random()*3);bumpGear();growthEvent('craft',it);
  if(!addItem(it)){S.items.push(it);}save();return{ok:true,it,great};}
