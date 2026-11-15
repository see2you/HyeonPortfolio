/* =====================================================================
   v4.8 창 — 가방(I) · 능력치(C) · 스킬 수련(K) · 설정 · 상점 · 대장장이
   - 큰 창(win)을 연 동안 전투·타이머 정지 (update에서 win이면 진행하지 않음)
   - 가방 · 능력치 · 스킬은 같은 창의 탭으로 오간다
   ===================================================================== */
let win=null;
const WTABS=[['bag','가방','I'],['enc','강화','J'],['craft','제작','U'],['coll','컬렉션','O'],['log','기록','L'],['stats','능력치','C'],['skills','스킬','K']];
/* v4.36 창 위치 · 크기 기억 (MMORPG 라이크 UI 편집 · HUD 프리셋): 머리줄을 끌어 옮기고 [100%]로 크기(100 → 90 → 80%)를 고른다
   - 탭으로 오가는 창(가방 · 강화 · 제작 · 컬렉션 · 기록 · 능력치 · 스킬)은 한 묶음('main'), 나머지(상점 · 설정 · 대장장이 …)는 창마다 따로
   - S.winUi={창:{x,y,s}} — x,y는 화면 폭 · 높이 대비 비율(화면 크기가 바뀌어도 같은 자리), 머리줄은 늘 화면 안 · 키 설정처럼 새 게임에도 유지
   - [↺] 또는 머리줄 두 번 누르기 = 그 창만 처음대로 */
const WSIZES=[1,.9,.8];
const winGrp=o=>WTABS.some(t=>t[0]===o.id)?'main':o.id;
function winPos(){return win?((S.winUi||{})[winGrp(win)]||null):null;}
function winClamp(x,y){/* 창 전체가 화면 안 — 옮겨도 동작 버튼이 화면 밖으로 나가지 않게(원칙 8) */const bx=document.querySelector('#win .wbox');if(!bx)return [x,y];bx.style.setProperty('--wx','0px');bx.style.setProperty('--wy','0px');const r=bx.getBoundingClientRect(),W=innerWidth,H=innerHeight;
  x=Math.max(Math.min(0,-r.left),Math.min(Math.max(0,W-r.right),x));y=Math.max(Math.min(0,-r.top),Math.min(Math.max(0,H-r.bottom),y));return [Math.round(x),Math.round(y)];}
function winApply(){const bx=document.querySelector('#win .wbox');if(!bx)return;const p=winPos()||{};const s=WSIZES.includes(p.s)?p.s:1;bx.style.setProperty('--ws',s);
  const [x,y]=winClamp((p.x||0)*innerWidth,(p.y||0)*innerHeight);bx.style.setProperty('--wx',x+'px');bx.style.setProperty('--wy',y+'px');
  $('wSz').textContent=Math.round(s*100)+'%';$('wRs').hidden=!(p.x||p.y||s!==1);}
function winSet(ch){if(!win)return;const U=S.winUi=S.winUi||{},g=winGrp(win),p=Object.assign({x:0,y:0,s:1},U[g]||{},ch);if(!p.x&&!p.y&&p.s===1)delete U[g];else U[g]=p;winApply();save();}
function winReset(){if(!win)return;if(S.winUi)delete S.winUi[winGrp(win)];winApply();save();toast('창을 처음 자리 · 크기로 되돌렸다');}
$('wSz').onclick=()=>{const p=winPos()||{},i=WSIZES.indexOf(p.s||1);winSet({s:WSIZES[(i+1)%WSIZES.length]});};
$('wRs').onclick=winReset;
{let dr=null;const wh=document.querySelector('#win .wh');
  wh.addEventListener('pointerdown',e=>{if(e.button>0||e.target.closest('button'))return;const bx=wh.parentNode,cs=getComputedStyle(bx);dr={sx:e.clientX,sy:e.clientY,ox:parseFloat(cs.getPropertyValue('--wx'))||0,oy:parseFloat(cs.getPropertyValue('--wy'))||0,mv:false,id:e.pointerId};});
  document.addEventListener('pointermove',e=>{if(!dr||e.pointerId!==dr.id)return;const dx=e.clientX-dr.sx,dy=e.clientY-dr.sy;if(!dr.mv&&Math.hypot(dx,dy)<4)return;if(!dr.mv){dr.mv=true;hideTip();wh.parentNode.classList.add('drag');}
    const bx=wh.parentNode,[x,y]=winClamp(dr.ox+dx,dr.oy+dy);bx.style.setProperty('--wx',x+'px');bx.style.setProperty('--wy',y+'px');});
  document.addEventListener('pointerup',e=>{if(!dr||e.pointerId!==dr.id)return;const d=dr;dr=null;const bx=wh.parentNode;bx.classList.remove('drag');if(!d.mv||!win)return;const cs=getComputedStyle(bx);winSet({x:(parseFloat(cs.getPropertyValue('--wx'))||0)/innerWidth,y:(parseFloat(cs.getPropertyValue('--wy'))||0)/innerHeight});});
  document.addEventListener('pointercancel',()=>{if(dr){dr=null;wh.parentNode.classList.remove('drag');}});
  wh.addEventListener('dblclick',e=>{if(e.target.closest('button'))return;winReset();});
  addEventListener('resize',()=>{if(win)winApply();});}
function openWin(o){stopHold();if(win&&win.id==='bag'&&o.id!=='bag')for(const it of S.items)delete it.nw;if(modal&&!player.dead)closeModal();hideTip();document.querySelectorAll('.encfx').forEach(e=>e.remove());kbCap=null;const g0=win&&winGrp(win);win=o;$('win').hidden=false;$('win').dataset.id=o.id;renderWin();if(g0!==winGrp(o))winApply();}
function closeWin(){stopHold();kbCap=null;if(!win)return;if(win.id==='bag')for(const it of S.items)delete it.nw;win=null;$('win').hidden=true;hideTip();stage.focus({preventScroll:true});lastQKey='';}
function renderWin(){const o=win;if(!o)return;$('wKick').textContent=o.kick||'';$('wTitle').textContent=o.title;const inf=$('wInfo');inf.replaceChildren(...(o.info?o.info():[]));
  const tb=$('wTabs');tb.replaceChildren();if(o.tabs!==false)for(const [id,n,k] of WTABS){const b=el('button','wtab'+(o.id===id?' on':''),n);b.type='button';if(k&&!document.body.classList.contains('touch'))b.appendChild(el('kbd',null,kbU(k.toLowerCase())));
    const dot=id==='stats'?S.sp>0:id==='skills'?SK.some((s,i)=>skCan(i)):id==='coll'?collCanAny():id==='enc'?enchHint():id==='craft'?craftHint():id==='log'?acqMissNew():false;if(dot)b.classList.add('dot');b.onclick=()=>({bag:openBag,enc:()=>openEnchant(),craft:openCraft,coll:openColl,log:openLog,stats:openStats,skills:openSkills})[id]();tb.appendChild(b);}
  tb.hidden=o.tabs===false;const B=$('wBody'),F=$('wFoot');
  /* v4.14: 다시 그려도 스크롤 위치 유지 (같은 창일 때) — 스킬 목록을 누르면 맨 위로 튀던 버그 */
  const keep=B.dataset.id===o.id?[...B.querySelectorAll('*')].filter(e=>e.scrollTop>0||e.scrollLeft>0).map(e=>[pathOf(e,B),e.scrollTop,e.scrollLeft]):[];const bs=B.dataset.id===o.id?B.scrollTop:0;
  B.replaceChildren();F.replaceChildren();B.className='wb wb-'+o.id;B.dataset.id=o.id;o.render(B,F);B.scrollTop=bs;
  for(const [pth,st,sl] of keep){const e=fromPath(pth,B);if(e){e.scrollTop=st;e.scrollLeft=sl;}}}
function pathOf(e,root){const p=[];while(e&&e!==root){p.unshift([...e.parentNode.children].indexOf(e));e=e.parentNode;}return p;}
function fromPath(p,root){let e=root;for(const i of p){e=e&&e.children[i];}return e||null;}
$('wX').onclick=closeWin;
/* v4.16: 팝업(아이템 · 재료 얻는 곳) 바깥을 누르면 닫힌다 — 팝업을 여는 버튼을 누른 경우는 그 버튼이 새로 연다 */
document.addEventListener('pointerdown',e=>{const tp=$('itip');if(!tp||tp.hidden)return;if(tp.contains(e.target))return;hideTip();},true);$('win').addEventListener('pointerdown',e=>{if(e.target.id==='win')closeWin();});
/* 공통 */
const btn=(t,cls,f,dis)=>{const b=el('button','btn'+(cls?' '+cls:''),t);b.type='button';if(dis)b.disabled=true;b.onclick=f;return b;};
const icv=(c,cls)=>{const x=mk(c.width,c.height);x.getContext('2d').drawImage(c,0,0);x.className=cls||'icv';return x;};
function hideTip(){const t=$('itip');if(t){t.hidden=true;t.replaceChildren();}}
function showTip(anchor,build){const tp=$('itip');tp.replaceChildren();const tx=el('button','tipx','×');tx.type='button';tx.title='닫기';tx.setAttribute('aria-label','닫기');tx.onclick=e=>{e.stopPropagation();hideTip();};tp.appendChild(tx);build(tp);tp.hidden=false;const box=$('win').querySelector('.wbox').getBoundingClientRect(),r=anchor.getBoundingClientRect();
  const w=tp.offsetWidth,h=tp.offsetHeight;let x=r.right-box.left+8,y=r.top-box.top;if(x+w>box.width-8)x=r.left-box.left-w-8;if(x<8)x=8;if(y+h>box.height-8)y=box.height-h-8;if(y<8)y=8;tp.style.left=x+'px';tp.style.top=y+'px';}
const pct=v=>(v*100).toFixed(1)+'%';

/* ================= 가방 + 장비 (I) ================= */
const BAG_CAT=[['all','전체'],['eq','장비'],['use','소모품'],['mat','재료 · 기타']];
let bagCat='all',bagSel=null;/* bagCat은 S.bagUi.cat과 같이 움직인다 (v4.30) */
const encLbl=it=>Math.round(enchRate(it)*100)+'%';
function openBag(mode){if(!started||player.dead)return;if(win&&win.id==='bag'){renderWin();return;}
  openWin({id:'bag',key:'i',kick:'INVENTORY / EQUIPMENT',title:'가방',enc:null,info:()=>[],render:renderBag});}
/* v4.30 가방 정렬 · 필터 (MMORPG 라이크 가방 정렬 버튼 · 보기 필터) — 선택은 세이브(S.bagUi)에 저장
   정렬: 장비 칸에만 적용 · 장착 중은 항상 맨 앞 · 같은 값이면 기본 순서(부위 → 단계 → 등급 → 강화)
   필터: NEW(지금보다 좋음 또는 새로 얻음) · 컬렉션 가능(등록할 수 있는 사본) · 분해 대상(일괄 분해 기준과 같음, 등급 무관) — 필터가 켜지면 장비만 보인다 */
const BAG_SORT=[['def','기본'],['grade','등급'],['slot','부위'],['tier','단계'],['en','강화']];
const BAG_FLT=[['all','전체 보기'],['new','NEW만'],['coll','컬렉션 가능만'],['dis','분해 대상만'],['lock','잠금만']];
function bagUi(){if(!S.bagUi||typeof S.bagUi!=='object')S.bagUi={};const u=S.bagUi;if(!BAG_SORT.some(x=>x[0]===u.sort))u.sort='def';if(!BAG_FLT.some(x=>x[0]===u.flt))u.flt='all';if(!BAG_CAT.some(x=>x[0]===u.cat))u.cat='all';return u;}
function disTarget(it){return !isEq(it)&&!it.lock&&!betterThanEq(it)&&!collNeeds(it);}
function bagFltOk(it,f){if(f==='new')return !isEq(it)&&(betterThanEq(it)||!!it.nw);if(f==='coll')return !isEq(it)&&!it.lock&&!!collNeeds(it);if(f==='dis')return disTarget(it);if(f==='lock')return !!it.lock;return true;}
function bagSortItems(arr,sort){const ord=k=>['weapon','helm','armor','cloak','gloves','boots','neck','ring'].indexOf(k);
  const base=(a,b)=>ord(a.k)-ord(b.k)||b.t-a.t||b.g-a.g||b.en-a.en||a.u-b.u;
  const key={grade:(a,b)=>b.g-a.g,slot:(a,b)=>ord(a.k)-ord(b.k),tier:(a,b)=>b.t-a.t,en:(a,b)=>b.en-a.en}[sort]||(()=>0);
  return [...arr].sort((a,b)=>(isEq(b)-isEq(a))||key(a,b)||base(a,b));}
function bagEntries(){const L=[],u=bagUi(),f=u.flt;if(f==='all')for(const k of STK_ORDER)if(cnt(k)>0)L.push({stk:k,cat:STK[k].cat});
  for(const it of bagSortItems(S.items.filter(it=>bagFltOk(it,f)),u.sort))L.push({it,cat:'eq'});
  if(f!=='all')return L;
  /* 퀘스트 수집품(무게 없음) */
  const q=curQ();if(S.qs==='active'&&q.type==='collect')L.push({quest:{n:q.item,c:S.qn,of:q.n},cat:'mat'});
  for(const id in S.sq){const s=S.sq[id],sq=SUBQ[id];if(s.st==='active'&&sq.type==='collect')L.push({quest:{n:sq.item,c:s.n,of:sq.n},cat:'mat'});}
  return L;}
function renderBag(B,F){const o=win,enc=o.enc;
  const wrap=el('div','bag');B.appendChild(wrap);
  /* 왼쪽: 장비 인형 */
  const doll=el('div','doll'),dg=el('div','dgrid');doll.appendChild(dg);
  const L=['helm','armor','cloak','boots'],R=['weapon','gloves','neck','ring1','ring2'];
  const colL=el('div','dcol'),colR=el('div','dcol'),mid=el('div','dmid');
  const slotCell=s=>{const it=S.eq[s]&&itemById(S.eq[s]),b=el('button','eqs'+(it?' has':''));b.type='button';b.style.setProperty('--gc',it?GRADES[it.g].c:'rgba(232,184,100,.25)');
    if(it){b.appendChild(icv(itemIcon(it)));if(it.en)b.appendChild(el('span','en','+'+it.en));}else b.appendChild(el('span','eqn',SLOTN[s]));
    b.title=it?itemName(it):SLOTN[s]+' (비어 있음)';
    if(enc){const ok=it&&canEnch(it.k)&&scrollFor(it.k)===scrollBase(enc)&&it.en<ENH.max;b.classList.toggle('encok',!!ok);b.classList.toggle('encno',!ok);if(ok)b.appendChild(el('span','rt',encLbl(it,enc)));}
    b.onclick=()=>{if(!it)return;if(enc)return doEnchant(it,b);bagSel=it.u;showTip(b,tp=>itemTip(tp,it));};return b;};
  for(const s of L)colL.appendChild(slotCell(s));for(const s of R)colR.appendChild(slotCell(s));
  const hc=mk(22,34);hc.getContext('2d').drawImage(getSprite('hero','down',false,0),0,0);hc.className='hero';mid.appendChild(hc);
  const st=pStats(null,true);mid.appendChild(el('div','dcp',null)).append(el('small',null,'전투력'),el('b',null,fmt(cpOf())));
  dg.append(colL,mid,colR);
  const ds=el('div','dstats');for(const [n,v] of [['공격력',st.atk],['방어',st.def],['최대 HP',st.hp],['최대 MP',st.mp],['치명',pct(st.crit)],['공격 속도','+'+((st.aspd-1)*100).toFixed(1)+'%'],['스킬 피해','+'+((st.skm-1)*100).toFixed(1)+'%'],['신앙',st.faith],['무게 한도',fmt(weightMax())]])ds.append(el('span',null,n),el('b',null,String(v)));
  doll.appendChild(ds);wrap.appendChild(doll);
  /* 오른쪽: 가방 칸 */
  const inv=el('div','inv');wrap.appendChild(inv);
  if(enc){const bar=el('div','encbar');bar.append(icv(stkIcon(enc)),el('b',null,STK[enc].n+' '+cnt(enc)+'장'),el('span',null,cnt(enc)?' · 강화할 장비를 고르세요 (장착 중인 장비도 가능)':' · 주문서를 모두 썼다'),btn('그만하기','alt',()=>{o.enc=null;renderWin();}));inv.appendChild(bar);}
  else{const u=bagUi();bagCat=u.cat;const ct=el('div','icat');for(const [id,n] of BAG_CAT){const b=el('button','ict'+(bagCat===id?' on':''),n);b.type='button';b.onclick=()=>{bagCat=u.cat=id;if(id==='use'||id==='mat')u.flt='all';hideTip();renderWin();};ct.appendChild(b);}
    /* v4.30 정렬 · 보기 (오른쪽 끝, 누르면 고르는 팝업) */
    const sp=el('span','isp');ct.appendChild(sp);
    const sb=el('button','ict isort'+(u.sort!=='def'?' set':''),'정렬 · '+BAG_SORT.find(x=>x[0]===u.sort)[1]+' ▾');sb.type='button';sb.title='장비 정렬 기준 (장착 중은 항상 앞)';
    sb.onclick=()=>showTip(sb,tp=>{tp.append(el('b','tn','장비 정렬'),el('p',null,'장착 중인 장비는 항상 앞 · 같은 값이면 부위 → 단계 → 등급 순'));const a=el('div','tbtn col');for(const [id,n] of BAG_SORT)a.appendChild(btn((u.sort===id?'✓ ':'')+n+(id==='grade'?' (높은 순)':id==='tier'?' (높은 순)':id==='en'?' (높은 순)':id==='slot'?' (무기 → 반지)':' (부위 · 단계)'),u.sort===id?'pri':'',()=>{u.sort=id;hideTip();renderWin();}));tp.appendChild(a);});
    const fc=S.items.filter(it=>u.flt!=='all'&&bagFltOk(it,u.flt)).length;
    const fb=el('button','ict iflt'+(u.flt!=='all'?' set':''),(u.flt==='all'?'보기 · 전체':BAG_FLT.find(x=>x[0]===u.flt)[1]+' '+fc)+' ▾');fb.type='button';fb.title='장비만 골라 보기';
    fb.onclick=()=>showTip(fb,tp=>{tp.append(el('b','tn','보기 필터'),el('p',null,'필터를 켜면 장비만 보인다 · 분해 대상 = 일괄 분해 기준(장착 · 잠금 · 지금보다 좋음 · 컬렉션 가능 제외)'));const a=el('div','tbtn col');for(const [id,n] of BAG_FLT){const c=id==='all'?'':' · '+S.items.filter(it=>bagFltOk(it,id)).length;a.appendChild(btn((u.flt===id?'✓ ':'')+n+c,u.flt===id?'pri':'',()=>{u.flt=id;if(id!=='all')bagCat=u.cat='all';hideTip();renderWin();}));}tp.appendChild(a);});
    /* v4.32 일괄 잠금 · 자동 잠금 (🔒 N ▾) */
    const ln=S.items.filter(it=>it.lock).length,lb=el('button','ict lkb'+((S.cfg.autoLock??-1)>=0?' set':''),'🔒 '+ln+' ▾');lb.type='button';lb.title='일괄 잠금 · 자동 잠금 — 잠근 장비는 분해 · 자동 분해 · 제작 재료 · 컬렉션 등록에서 빠진다';lb.onclick=()=>bulkLockTip(lb);
    ct.append(sb,fb,lb);inv.appendChild(ct);}
  const grid=el('div','grid'),ents=bagEntries().filter(e=>enc?e.it:bagCat==='all'||e.cat===bagCat);let n=0;
  if(!enc&&!ents.length&&bagUi().flt!=='all')grid.appendChild(el('div','iempty','조건에 맞는 장비가 없다 · 보기 → 전체 보기'));
  for(const e of ents){const b=el('button','cell');b.type='button';n++;
    if(e.it){const it=e.it;b.style.setProperty('--gc',GRADES[it.g].c);if(it.g>=3)b.classList.add('glow');b.appendChild(icv(itemIcon(it)));if(it.en)b.appendChild(el('span','en','+'+it.en));if(isEq(it))b.appendChild(el('span','eqm','E'));else if(betterThanEq(it))b.appendChild(el('span','newm','NEW'));if(it.nw)b.appendChild(el('span','nwd'));if(it.lock)b.appendChild(el('span','lk','🔒'));if(it.bu)b.appendChild(el('span','bum','★'));
      if(enc){const ok=canEnch(it.k)&&scrollFor(it.k)===scrollBase(enc)&&it.en<ENH.max;b.classList.toggle('encok',ok);b.classList.toggle('encno',!ok);if(ok)b.appendChild(el('span','rt',encLbl(it,enc)));}
      if(bagSel===it.u)b.classList.add('sel');b.title=GRADES[it.g].n+' '+itemName(it);
      b.onclick=()=>{if(enc)return doEnchant(it,b);bagSel=it.u;grid.querySelectorAll('.sel').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');showTip(b,tp=>itemTip(tp,it));};}
    else if(e.stk){const k=e.stk;b.style.setProperty('--gc','rgba(232,184,100,.3)');b.appendChild(icv(stkIcon(k)));b.appendChild(el('span','ct',fmt(cnt(k))));b.title=STK[k].n;if(bagSel===k)b.classList.add('sel');
      b.onclick=()=>{bagSel=k;grid.querySelectorAll('.sel').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');showTip(b,tp=>stkTip(tp,k));};}
    else{const q=e.quest;b.classList.add('qitem');b.appendChild(el('span','qn',q.n));b.appendChild(el('span','ct',q.c+'/'+q.of));b.title='퀘스트 물품 · '+q.n;b.onclick=()=>showTip(b,tp=>{tp.append(el('b','tn',q.n),el('div','tt','퀘스트 물품 · 무게 없음'),el('p',null,'퀘스트를 완료하면 사라진다 · '+q.c+'/'+q.of));});}
    grid.appendChild(b);}
  for(let i=n;i<(enc?Math.max(n,24):Math.max(BAG_SLOTS,n));i++)grid.appendChild(el('div','cell empty'));
  inv.appendChild(grid);
  /* 바닥: 무게 · 칸 · 일괄 분해 */
  const p=wPct(),wb=el('div','wbar'+(p>=.82?' bad':p>=.5?' warn':''));wb.append(el('i',null)),wb.firstChild.style.width=Math.min(100,p*100)+'%';wb.appendChild(el('b',null,Math.round(p*100)+'% · '+fmt(weightNow())+'/'+fmt(weightMax())));wb.title='무게 '+fmt(weightNow())+' / '+fmt(weightMax())+' · 50% 자연 회복 멈춤 · 82% 공격 불가';
  const fl=el('div','ifoot');fl.append(wb,el('span','slots','칸 '+bagUsed()+' / '+BAG_SLOTS));
  if(!enc){{const n=equipBetterN(),eb=btn(n?'일괄 장착 · '+n:'일괄 장착',n?'pri':'',()=>{batchEquip();renderWin();},!n);eb.title=n?'부위마다 지금보다 전투력이 높은 장비를 모두 장착한다':'지금보다 좋은 장비가 없다';if(n)eb.classList.add('dot');fl.appendChild(eb);}fl.appendChild(btn('제작','pri',()=>openCraft()));fl.appendChild(btn('컬렉션','',()=>openColl()));const db=btn('일괄 분해','',()=>bulkDisTip(db));fl.appendChild(db);}inv.appendChild(fl);
  F.append(el('p','note2','무게 50% 이상이면 자연 회복이 멈추고 · 82% 이상이면 공격·스킬을 쓸 수 없다 · 장비를 누르면 장착·강화·분해 · 장비 강화는 메뉴 → 강화(J)'));}
function statLines(it,cmp){const s=itemStats(it),c=cmp?itemStats(cmp):{},box=el('div','tst');const ks=new Set([...Object.keys(s),...Object.keys(c)]);
  for(const k of ks){const v=s[k]||0,d=v-(c[k]||0),row=el('div',null);row.append(el('span',null,STATN[k]),el('b',null,statFmt(k,v)));if(cmp&&Math.abs(d)>1e-6)row.appendChild(el('em',d>0?'up':'dn',(d>0?'▲ ':'▼ ')+statFmt(k,Math.abs(d)).slice(1)));box.appendChild(row);}return box;}
function itemTip(tp,it){const G=GRADES[it.g],eq=isEq(it),T=TIERS[it.t];
  const nm=el('b','tn',itemName(it));nm.style.color=G.c;tp.append(nm,el('div','tt',G.n+' · '+SLOTN[it.k]+' · '+T.area+' '+it.t+'단계 (Lv '+T.iL+'~) · 무게 '+itemW(it)+(eq?' · 장착 중':'')));if(it.bu){const B=BU[it.bu];tp.appendChild(el('div','tcmp up','★ 지역 보스 전용 · '+QUESTS.find(q=>q.id===B.q).elite.name+' · 제작 불가 · 보스 컬렉션 재료'));}
  const s=targetSlot(it),cur=!eq&&S.eq[s]&&itemById(S.eq[s]);tp.appendChild(statLines(it,cur||null));
  if(cur){const d=cpWith(s,it.u)-cpOf();tp.appendChild(el('div','tcmp'+(d>0?' up':d<0?' dn':''),'장착 중 '+itemName(cur)+'과(와) 비교 · 전투력 '+(d>=0?'▲ ':'▼ ')+fmt(Math.abs(d))));}
  else if(!eq){const d=cpWith(s,it.u)-cpOf();tp.appendChild(el('div','tcmp up','빈 부위 · 장착하면 전투력 ▲ '+fmt(d)));}
  if(canEnch(it.k)){const r=it.en>=ENH.max?'최대 강화':'다음 강화 성공 '+Math.round(enchRate(it)*100)+'%'+(it.en<enchSafe(it.k)?' (안전)':'')+(it.ff?' · 연속 실패 '+it.ff+'회':'');tp.appendChild(el('div','tt','강화 +'+it.en+' / 최대 +'+ENH.max+' · 안전 +'+enchSafe(it.k)+' · '+r));}
  const a=el('div','tbtn');
  if(eq)a.appendChild(btn('해제','',()=>{unequip(slotOf(it));hideTip();renderWin();}));else a.appendChild(btn('장착','pri',()=>{equipItem(it.u);hideTip();renderWin();}));
  if(canEnch(it.k)&&it.en<ENH.max)a.appendChild(btn('강화','',()=>{hideTip();openEnchant(it.u);}));
  if(!eq&&!it.lock){const c=collNeeds(it);if(c){const i=c.req.findIndex((r,j)=>!collReg(c,j)&&reqMatch(r,it));tp.appendChild(el('div','tcmp up','📖 컬렉션 「'+c.n+'」에 등록할 수 있다 (등록하면 사라짐)'));let armed=false;const rb=btn('컬렉션 등록','',()=>{if(!armed){armed=true;rb.textContent='한 번 더 눌러 등록';return;}collRegister(c.id,i,it.u);hideTip();renderWin();});a.appendChild(rb);}}
  if(!eq)a.appendChild(btn('분해 · 강화석 +'+disYield(it),'alt',()=>{disassemble([it.u]);hideTip();renderWin();},!!it.lock));
  if(!eq&&betterThanEq(it))tp.insertBefore(el('div','tcmp up','NEW · 지금 착용한 장비보다 좋다'),tp.children[2]);
  a.appendChild(btn(it.lock?'잠금 해제':'잠금','alt',()=>{it.lock=!it.lock;save();hideTip();renderWin();}));tp.appendChild(a);}
function stkTip(tp,k){const d=STK[k];tp.append(el('b','tn',d.n),el('div','tt',(d.cat==='use'?'소모품':'재료')+' · '+fmt(cnt(k))+'개 · 개당 무게 '+d.w));
  tp.appendChild(el('p',null,d.book?'사용하면 「'+SK[skIdx(d.book)].name+'」을(를) 스킬 창(K)에서 배울 수 있다. 서브 퀘스트에서만 나온다.':d.desc()));
  const a=el('div','tbtn');
  if(k==='hp'||k==='mp')a.appendChild(btn('사용','pri',()=>{usePot(k);hideTip();renderWin();}));
  else if(k==='ret')a.appendChild(btn('사용 · 마을로 귀환','pri',()=>{closeWin();goTown();}));
  else if(k==='bls'||k==='stone')a.appendChild(btn('강화 창으로','pri',()=>{hideTip();openEnchant();}));
  else if(k.startsWith('rcp')||k.startsWith('ore')||/^d[wac][123]$/.test(k))a.appendChild(btn('제작 창으로','pri',()=>{hideTip();openCraft();}));
  else if(d.book)a.appendChild(btn(S.books[d.book]?'이미 익힘':'사용','pri',()=>{useBook(k);hideTip();renderWin();},!!S.books[d.book]));
  if(a.children.length)tp.appendChild(a);}
/* v4.32 일괄 잠금 — 장착 · 등급 · 강화 · 보스 전용을 한 번에 잠그거나 풀고, 자동 잠금 등급을 고른다 */
function bulkLockTip(anchor){showTip(anchor,tp=>{const ln=S.items.filter(it=>it.lock).length;tp.append(el('b','tn','일괄 잠금 · 지금 '+ln+'개 잠김'),el('p',null,'잠근 장비는 분해 · 일괄 분해 · 자동 분해 · 제작 재료 · 컬렉션 등록에 쓰이지 않는다. 장착 장비를 잠가 두면 새 장비로 바꾼 뒤에도 지켜진다.'));
  const a=el('div','tbtn col');
  for(const [id,n,f] of LOCK_SETS){const k=S.items.filter(it=>f(it)&&!it.lock).length,all=S.items.filter(f).length;a.appendChild(btn(n+' 잠금 · '+(k?k+'개':all?'모두 잠김':'없음'),id==='eq'?'pri':'',()=>{const c=lockSet(id,true);toast('잠금 🔒 '+c+'개 · '+n,true);hideTip();renderWin();},!k));}
  let armed=false;const ub=btn('잠금 모두 해제 · '+ln+'개','alt',()=>{if(!armed){armed=true;ub.textContent='한 번 더 눌러 '+ln+'개 해제';return;}const c=unlockAll();toast('잠금 해제 '+c+'개');hideTip();renderWin();},!ln);a.appendChild(ub);
  tp.appendChild(a);
  const g=S.cfg.autoLock??-1,r=el('div','tbtn');r.appendChild(el('span','tlk','자동 잠금'));for(const [v,n] of AUTOLOCK_OPT){r.appendChild(btn((g===v?'✓ ':'')+n.replace(' 이상','+'),g===v?'pri':'',()=>{S.cfg.autoLock=v;save();hideTip();bulkLockTip(anchor);}));}tp.appendChild(r);
  tp.appendChild(el('p','tlkn','자동 잠금(+ = 그 등급 이상): 얻으면 바로 잠근다 · 아직 컬렉션에 등록할 수 있는 장비는 잠그지 않는다'));});}
const AUTOLOCK_OPT=[[-1,'끔'],[2,'희귀 이상'],[3,'영웅 이상'],[4,'전설']];
function bulkDisTip(anchor){showTip(anchor,tp=>{tp.append(el('b','tn','일괄 분해'),el('p',null,'장착 중 · 잠금 · 지금 장비보다 좋은 것 · 컬렉션에 등록할 수 있는 장비는 분해하지 않는다.'));const a=el('div','tbtn col');
  for(let g=0;g<=2;g++){const us=S.items.filter(it=>it.g<=g&&disTarget(it)).map(it=>it.u),y=us.reduce((n,u)=>n+disYield(itemById(u)),0);
    a.appendChild(btn(GRADES[g].n+(g?'까지':'')+' · '+us.length+'개 → 강화석 +'+y,g?'':'pri',()=>{disassemble(us);hideTip();renderWin();},!us.length));}
  tp.appendChild(a);});}
/* ================= 강화 (J) — 제우스: 오만의 신 방식 =================
   왼쪽: 장착 중 → 가방 장비 목록 · 오른쪽: 선택 장비의 +N → +N+1 능력치 변화 · 성공 확률(안전 강화 표시) · 재료(강화석 · 골드) · 축복 주문서 사용
   [강화] 한 번 · [안전 강화까지] 안전 단계까지 연속 · v4.29 [목표 +N까지 연속 강화](평균 비용 미리 보기). 싱글 완화: 실패해도 파괴·하락 없음 */
let encSel=null,encBless=false;
function openEnchant(u){if(!started||player.dead)return;if(u)encSel=u;if(!encSel||!itemById(encSel))encSel=S.eq.weapon||S.items.filter(canEnchIt)[0]?.u||null;
  openWin({id:'enc',key:'j',kick:'ENHANCE',title:'강화',info:()=>[],render:renderEnc});}
const canEnchIt=it=>canEnch(it.k);
function encRow(it){const b=el('button','enr'+(encSel===it.u?' on':''));b.type='button';b.style.setProperty('--gc',GRADES[it.g].c);const ic=el('div','eni');ic.appendChild(icv(itemIcon(it)));if(it.en)ic.appendChild(el('span','en','+'+it.en));
  const safe=it.en<enchSafe(it.k);b.append(ic,el('span','enn',itemName(it)),el('small',safe?'ens safe':'ens',it.en>=ENH.max?'최대':safe?'안전 +'+enchSafe(it.k):Math.round(enchRate(it)*100)+'%'));if(isEq(it))b.appendChild(el('span','eqm','E'));
  b.onclick=()=>{encSel=it.u;renderWin();};return b;}
function renderEnc(B,F){const g=el('div','enw');B.appendChild(g);const L=el('div','enl');g.appendChild(L);
  L.appendChild(el('h4',null,'장착 중'));for(const s of SLOTS){const it=S.eq[s]&&itemById(S.eq[s]);if(it)L.appendChild(encRow(it));}
  const rest=S.items.filter(it=>!isEq(it)&&canEnchIt(it)).sort((a,b)=>b.g-a.g||b.t-a.t||b.en-a.en);if(rest.length){L.appendChild(el('h4',null,'가방'));for(const it of rest)L.appendChild(encRow(it));}
  /* v4.26 오른쪽 = 위 정보(스크롤) + 아래 동작 줄(고정) — 버튼은 스크롤 없이 한 줄로 (원칙 8) */
  const PW=el('div','enp');g.appendChild(PW);const P=el('div','enpi');const A=el('div','enact');PW.append(P,A);const it=encSel&&itemById(encSel);
  if(!it){P.appendChild(el('p','note2','강화할 장비가 없다 · 장비는 사냥 · 제작으로'));A.remove();return;}
  const G=GRADES[it.g],hd=el('div','enh'),ic=el('div','enbig');ic.style.setProperty('--gc',G.c);ic.appendChild(icv(itemIcon(it)));const nm=el('div');const t1=el('b',null,itemName(it));t1.style.color=G.c;
  const nx=Object.assign({},it,{en:Math.min(ENH.max,it.en+1)});nm.append(t1,el('small',null,G.n+' · '+SLOTN[it.k]+' · '+(isEq(it)?'장착 중':'가방')),el('div','enlv',it.en>=ENH.max?'최대 강화 +'+ENH.max:'+'+it.en+'  →  +'+nx.en));hd.append(ic,nm);P.appendChild(hd);
  if(it.en<ENH.max)P.appendChild(statLines(nx,it));
  const safe=it.en<enchSafe(it.k),rate=enchRate(it),bl=encBless&&cnt('bls')>0;
  const rb=el('div','enrate'+(safe||bl?' safe':''));rb.append(el('span',null,'성공 확률'),el('b',null,bl&&safe?'100% · +1~'+(it.en<=2?3:2):Math.round(rate*100)+'%'),el('small',null,safe?'안전 강화 (+'+enchSafe(it.k)+'까지 실패 없음)':'실패해도 파괴·하락 없음'+(it.ff?' · 연속 실패 '+it.ff+'회 (3회마다 +5%p)':'')));P.appendChild(rb);
  const c=enchCost(it),need=el('div','cfn');const row=(ico,label,have,req)=>{const d=el('div','cfm'+(have>=req?'':' no'));const l=el('span');if(ico)l.appendChild(icv(stkIcon(ico),'sic'));l.append(label);d.append(l,el('b',null,fmt(have)+' / '+fmt(req)));need.appendChild(d);};
  if(bl)row('bls',STK.bls.n,cnt('bls'),1);else row('stone','강화석',S.stone,c.stone);row(null,'골드',S.gold,c.gold);P.appendChild(need);
  if(cnt('bls')){const tg=el('label','enbl');const cb=document.createElement('input');cb.type='checkbox';cb.checked=encBless;cb.onchange=()=>{encBless=cb.checked;renderWin();};tg.append(cb,' 축복받은 강화 주문서 사용 ('+cnt('bls')+'장) — 안전 구간에서 +1~3');A.appendChild(tg);}
  const ck=enchCheck(it,bl);const row2=el('div','enbtns');A.appendChild(row2);
  const go=btn(it.en>=ENH.max?'최대 강화':'강화','pri',()=>doEnc(it,bl),!ck.ok);go.classList.add('cfgo');row2.appendChild(go);
  if(it.en<enchSafe(it.k)&&!bl){const go2=btn('안전 강화까지 (+'+enchSafe(it.k)+')','',()=>{let n=0;const nm0=itemName(it);while(it.en<enchSafe(it.k)&&enchCheck(it).ok&&n<20){enchant(it.u,false);n++;}renderWin();encFx(true,n+'회 강화',nm0+' → '+itemName(it));},!ck.ok);go2.classList.add('cfgo','alt2');row2.appendChild(go2);}
  /* v4.29 목표 단계까지 연속 강화 — 목표 +N을 고르고 평균 비용을 미리 본 뒤 한 번에 (실패해도 파괴·하락 없음이라 '실패 시 멈춤'은 두지 않는다) */
  if(it.en<ENH.max&&!bl){const t=encTgtOf(it),ex=encExpect(it,t),tr=el('div','entg');
    const st=(d,lab)=>{const b=el('button','tgb',lab);b.type='button';b.disabled=d<0?t<=it.en+1:t>=ENH.max;b.onclick=()=>{encTgt[it.u]=t+d;renderWin();};return b;};
    tr.append(el('span','tgl','목표'),st(-1,'−'),el('b','tgv','+'+t),st(1,'+'));
    const go3=btn('+'+t+'까지 연속 강화','',()=>encToTarget(it,t),!ck.ok);go3.classList.add('cfgo','alt2');tr.appendChild(go3);A.appendChild(tr);
    const ok=S.stone>=ex.stone&&S.gold>=ex.gold,xs=el('small','enexp'+(ok?'':' short'),'평균 '+ex.tries.toFixed(1)+'회 · 강화석 ~'+fmt(Math.ceil(ex.stone))+' (보유 '+fmt(S.stone)+') · 골드 ~'+fmt(Math.ceil(ex.gold))+(ok?'':' · 모자라면 거기서 멈춤'));A.appendChild(xs);}
  if(!ck.ok&&it.en<ENH.max)A.appendChild(el('small','why',ck.why+(ck.why.startsWith('강화석')?' · 분해 · 몬스터 · 대장장이 상점':'')));
  F.append(el('p','note2','무기·방어구 +'+ENH.safe.weapon+' · 장신구 +'+ENH.safe.acc+'까지 안전 강화 · 그 위는 확률(실패해도 파괴·하락 없음) · 강화석은 장비 분해 · 몬스터 · 퀘스트 · 대장장이 상점 · 강화 1단계마다 신앙 +1'));}
/* v4.29 목표 강화: 기본 목표 = 안전 단계 아래면 안전 단계, 위면 +1 · 평균 시도 수는 연속 실패 보정(3회마다 +5%p)까지 정확히 계산 */
const encTgt={};
function encTgtOf(it){const lo=it.en+1,d=it.en<enchSafe(it.k)?enchSafe(it.k):lo;let t=encTgt[it.u]??d;t=Math.max(lo,Math.min(ENH.max,t));encTgt[it.u]=t;return t;}
function encExpect(it,tgt){let tries=0,stone=0,gold=0;for(let n=it.en;n<Math.min(tgt,ENH.max);n++){let surv=1,ff=n===it.en?(it.ff||0):0,e=0;
    for(let k=0;k<400&&surv>1e-7;k++){e+=surv;surv*=1-enchRate({k:it.k,en:n,ff});ff++;}
    const c=enchCost({k:it.k,en:n,t:it.t,bu:it.bu});tries+=e;stone+=e*c.stone;gold+=e*c.gold;}return{tries,stone,gold};}
function encToTarget(it,tgt){const nm0=itemName(it),e0=it.en,s0=S.stone,g0=S.gold;let n=0,f=0;while(it.en<tgt&&enchCheck(it).ok&&n<300){const r=enchant(it.u,false);if(!r)break;n++;if(!r.ok)f++;}
  STAT.encTgt=(STAT.encTgt||0)+1;renderWin();const hit=it.en>=tgt,why=hit?'':' · '+(enchCheck(it).why||'멈춤');
  encFx(hit,hit?'+'+tgt+' 달성':'+'+it.en+'에서 멈춤',n+'회 시도 (실패 '+f+') · 강화석 -'+fmt(s0-S.stone)+' · 골드 -'+fmt(g0-S.gold)+why);if(it.en>e0)burst(player.x,player.y,14,'#ffb050',24,90,4);return{n,f,from:e0,to:it.en,hit};}
function encFx(ok,a,b2){const fx=el('div','encfx '+(ok?'ok':'no'));fx.append(el('b',null,a),el('span',null,b2));$('win').querySelector('.wbox').appendChild(fx);setTimeout(()=>fx.remove(),1400);}
function doEnc(it,bl){const nm0=itemName(it),r=enchant(it.u,bl);if(!r||r.max)return;if(!cnt('bls'))encBless=false;renderWin();
  encFx(r.ok,r.ok?(r.up>1?'+'+r.up+' 강화 성공':'강화 성공'):'강화 실패',r.ok?nm0+' → '+itemName(it):itemName(it)+' · 단계 유지'+(it.ff%3===0?' · 다음 확률 +5%p':' · 연속 실패 '+it.ff+'회'));if(r.ok)burst(player.x,player.y,14,'#ffb050',24,90,4);}

/* ================= 능력치 (C) ================= */
let draft=null;
/* 길게 누르면 연속 입력 (v4.8.1 수정): 누를 때마다 창을 다시 그려 버튼이 바뀌므로, 떼기는 버튼이 아니라 문서 전체에서 받는다.
   (v4.8은 버튼에 떼기 이벤트를 달아서, 다시 그린 뒤엔 떼기를 못 받고 반복이 멈추지 않았음 → 포인트 연속 입력 + 다른 창 버튼이 계속 바뀌어 터치가 먹지 않음) */
let holdTo=null,holdIv=null;
function stopHold(){clearTimeout(holdTo);clearInterval(holdIv);holdTo=holdIv=null;}
for(const ev of ['pointerup','pointercancel','blur'])addEventListener(ev,stopHold);
function hold(b,f){b.onpointerdown=e=>{if(e.button>0)return;e.preventDefault();stopHold();if(!f())return;const w0=win;
    holdTo=setTimeout(()=>{holdIv=setInterval(()=>{if(win!==w0||!f())stopHold();},70);},400);};
  b.onclick=e=>{e.preventDefault();if(e.detail===0)f();};/* 키보드(Enter·Space)로 누른 경우 */}
function openStats(){if(!started)return;draft={str:0,vit:0,dex:0,int:0};openWin({id:'stats',key:'c',kick:'CHARACTER / GROWTH',title:'능력치',info:statsInfo,render:renderStats});}
const draftUsed=()=>draft.str+draft.vit+draft.dex+draft.int;
function statsInfo(){const xb=el('div','xpm');xb.append(el('i',null));xb.firstChild.style.width=(S.lv>=LV_MAX?100:S.xp/need(S.lv)*100)+'%';
  const left=S.sp-draftUsed(),pt=el('span','wpt'+(left>0?' on':''));pt.append(el('small',null,'남은 포인트'),el('b',null,String(left)));
  return [el('span','wchip','Lv '+S.lv+' · 원정대원'),el('span','wchip',S.lv>=LV_MAX?'경험치 MAX':'경험치 '+fmt(S.xp)+' / '+fmt(need(S.lv))),xb,pt];}
function renderStats(B,F){const cur=S.st,nxt={str:cur.str+draft.str,vit:cur.vit+draft.vit,dex:cur.dex+draft.dex,int:cur.int+draft.int},left=S.sp-draftUsed();
  const g=el('div','stw');B.appendChild(g);const L=el('div','stl');g.appendChild(L);
  const EN={str:'STR',vit:'VIT',dex:'DEX',int:'INT'};
  for(const k in STATS){const r=el('div','srow'),nm=el('div','snm');nm.append(el('b',null,STATS[k][0]),el('small',null,EN[k]),el('span',null,'포인트당 '+STATS[k][1]));r.appendChild(nm);
    const sp=el('div','step'),mi=el('button','sbt','−'),pl=el('button','sbt','+'),v=el('b','sv',String(nxt[k]));mi.type=pl.type='button';mi.disabled=!draft[k];pl.disabled=left<=0;
    if(draft[k])v.appendChild(el('em',null,' +'+draft[k]));
    hold(mi,()=>{if(draft[k]<=0)return false;draft[k]--;renderWin();return draft[k]>0;});hold(pl,()=>{if(S.sp-draftUsed()<=0)return false;draft[k]++;renderWin();return S.sp-draftUsed()>0;});
    sp.append(mi,v,pl);r.appendChild(sp);L.appendChild(r);}
  const a=pStats(cur,true),b=pStats(nxt,true),T=el('div','cmp');g.appendChild(T);T.appendChild(el('div','ch','전투 능력 · 적용 전 → 적용 후'));
  const row=(n,x,y,f)=>{const d=el('div','cr'+(y!==x?' chg':''));d.append(el('span',null,n),el('b',null,f(x)),el('i',null,'→'),el('b','af',f(y)+(y>x?' ▲':'')));T.appendChild(d);};
  const pc=v=>(v*100).toFixed(1)+'%';
  row('공격력',a.atk,b.atk,String);row('방어',a.def,b.def,String);row('최대 HP',a.hp,b.hp,String);row('최대 MP',a.mp,b.mp,String);row('치명 확률',a.crit,b.crit,pc);row('공격 속도',a.aspd-1,b.aspd-1,v=>'+'+pc(v));row('스킬 피해',a.skm-1,b.skm-1,v=>'+'+pc(v));row('신앙',a.faith,b.faith,String);
  const sl=S.slots.map(id=>id&&skIdx(id)).filter(i=>i!=null&&i>=0&&SK[i].mul);for(const i of sl.slice(0,3))row(SK[i].name+' 1타',Math.round(a.atk*skMul(i)*a.skm*(SK[i].hits||1)),Math.round(b.atk*skMul(i)*b.skm*(SK[i].hits||1)),fmt);
  row('전투력',cpOf(cur),cpOf(nxt),fmt);T.lastChild.classList.add('cpr');
  F.append(el('p','note2','레벨업마다 3포인트 · 서브 퀘스트 보상 추가 포인트 · 공격 속도는 민첩으로 최대 +40% · 피해는 치명·방어·변동 적용 전 기준 · 창을 닫으면 적용하지 않은 배분은 취소된다'));
  const bt=el('div','btns');
  bt.append(btn('자동 성장 '+(S.autoGrow?'켬':'끔'),S.autoGrow?'tg on':'tg',()=>{S.autoGrow=!S.autoGrow;if(S.autoGrow){draft={str:0,vit:0,dex:0,int:0};autoGrowNow();}save();renderWin();}),
    btn('추천 분배','',()=>{let n=S.sp-draftUsed();const tmp={...nxt};while(n-->0){const k=REC[(tmp.str+tmp.vit+tmp.dex+tmp.int)%REC.length];tmp[k]++;draft[k]++;}renderWin();},left<=0),
    btn('되돌리기','alt',()=>{draft={str:0,vit:0,dex:0,int:0};renderWin();},!draftUsed()),
    btn('배분 적용','pri',()=>{for(const k in draft){S.st[k]+=draft[k];}S.sp-=draftUsed();const n=draftUsed();draft={str:0,vit:0,dex:0,int:0};lastQKey='';save();toast('능력치 '+n+'포인트 적용 · 전투력 '+fmt(cpOf()),true);renderWin();},!draftUsed()));
  F.appendChild(bt);}

/* ================= 스킬 수련 (K) ================= */
let skTier=1,skSel=null;
function openSkills(sel,slotHint){if(!started)return;if(typeof sel==='string')skSel=sel;if(skSel==null){const c=SK.find((s,i)=>skCan(i));skSel=(c||SK[0]).id;}skTier=SK[skIdx(skSel)].tier;
  openWin({id:'skills',key:'k',kick:'PATH OF THE EXPEDITION',title:'스킬 수련',slotHint:slotHint??null,info:()=>{const pt=el('span','wpt'+(S.kp>0?' on':''));pt.append(el('small',null,'스킬 포인트'),el('b',null,String(S.kp)));return [el('span','wchip','Lv '+S.lv+' · '+(S.lv>=28?'원정대 용사':S.lv>=16?'원정대 검사':'견습 원정대원')),pt];},render:renderSkills});}
function skState(i){const s=SK[i],lv=skLv(i),k=lv+1;if(!tierOpen(s.tier))return['잠김 · '+SK_TIER[s.tier].n,'lock'];if(lv>=SK_MAX)return['최대','max'];
  if(s.book&&!S.books[s.id])return[cnt('book_'+s.id)?'스킬서 사용 필요':'스킬서 필요','book'];if(S.lv<skNeedLv(i,k))return[(lv?'Lv'+lv+'/'+SK_MAX+' · ':'')+'캐릭터 Lv '+skNeedLv(i,k),'lock'];
  if(!S.kp)return[lv?'Lv'+lv+'/'+SK_MAX:'포인트 부족',lv?'on':'lock'];return[lv?'강화 가능 Lv'+lv:'배우기 가능','can'];}
function skDmg(i,lvAt){const s=SK[i],st=pStats(null,true),L=lvAt||Math.max(1,skLv(i)),m=s.mul?s.mul*(1+.12*(L-1)):0;return Math.round(st.atk*m*st.skm);}
function skEffect(i,L){const s=SK[i];L=Math.max(1,L);if(s.id==='roar')return'공격력 +'+Math.round((.15+.04*(L-1))*100)+'% · '+s.buff+'초';if(s.id==='guard')return'받는 피해 -'+Math.round((.15+.03*(L-1))*100)+'% · '+s.buff+'초';if(s.id==='ferv')return'치명 +'+Math.round((.10+.02*(L-1))*100)+'%p · 공속 +'+Math.round((.10+.02*(L-1))*100)+'% · '+s.buff+'초';
  return'피해 ×'+(s.mul*(1+.12*(L-1))).toFixed(2)+(s.hits?' × '+s.hits+'회':'')+(s.drain?' · 피해의 '+Math.round(s.drain*100)+'% 회복':'');}
function renderSkills(B,F){const o=win;
  const tt=el('div','stier');for(let n=1;n<=3;n++){const T=SK_TIER[n],op=tierOpen(n),b=el('button','stb'+(skTier===n?' on':'')+(op?'':' lock'));b.type='button';b.append(el('b',null,T.n+' · '+T.area),el('small',null,op?'Lv '+T.lv+'~ · 개방':'미개방 · Lv '+T.lv));
    if(op&&SK.some((s,i)=>s.tier===n&&skCan(i)))b.classList.add('dot');b.onclick=()=>{skTier=n;const f=SK.find(s=>s.tier===n);skSel=f.id;hideTip();renderWin();};tt.appendChild(b);}
  B.appendChild(tt);const T=SK_TIER[skTier],op=tierOpen(skTier),list=SK.map((s,i)=>i).filter(i=>SK[i].tier===skTier);
  const hd=el('div','sthd');hd.append(el('b',null,T.n+' 스킬 · 총 '+list.length+'개'),el('span',null,op?T.area+' 지역의 기술 · 레벨과 스킬 포인트로 배운다':'개방 조건 · '+T.how));
  if(!op){const q=curQ();hd.appendChild(btn('메인 퀘스트 진행','',()=>{closeWin();questGo();}));}B.appendChild(hd);
  const g=el('div','skw');B.appendChild(g);const L=el('div','skl');g.appendChild(L);
  for(const i of list){const s=SK[i],[stt,cls]=skState(i),G=S.god&&GODS[S.god],mod=G&&G.sk===i,c=el('button','skc'+(skSel===s.id?' sel':'')+' '+cls+(skCan(i)?' dot':''));if(skCan(i))c.title=s.book&&!S.books[s.id]?'스킬서를 쓸 수 있다':'배우기 · 강화 가능';c.type='button';
    const ic=el('span','ski',mod?G.ski:s.icon);if(mod)ic.style.color=G.col;c.append(ic);const tx=el('span','skt');tx.append(el('b',null,(mod?G.skn:s.name)+(s.book?' 📕':'')),el('small',null,s.cls),el('em',null,stt));c.appendChild(tx);
    if(S.slots.includes(s.id))c.appendChild(el('span','slotm',String(S.slots.indexOf(s.id)+1)));
    c.onclick=()=>{skSel=s.id;renderWin();};L.appendChild(c);}
  /* 상세 */
  const i=skIdx(skSel),s=SK[i],lv=skLv(i),D=el('div','skd');g.appendChild(D);const G=S.god&&GODS[S.god],mod=G&&G.sk===i;
  const top=el('div','skdt'),bi=el('span','ski big',mod?G.ski:s.icon);if(mod)bi.style.color=G.col;const tn=el('div',null);tn.append(el('small',null,s.cls+' · '+SK_TIER[s.tier].n),el('b',null,(mod?G.skn+' ('+s.name+')':s.name)),el('span',null,lv?'Lv '+lv+' / '+SK_MAX:'미습득 · 아래 수치는 Lv 1 기준'));top.append(bi,tn);
  const act=el('div','skact'),[stt]=skState(i);
  if(s.book&&!S.books[s.id]&&cnt('book_'+s.id))act.appendChild(btn('스킬서 사용','pri',()=>{useBook('book_'+s.id);renderWin();}));
  else{const b=btn((lv?'강화':'배우기')+' · 1P','pri',()=>{learnSkill(i);save();renderWin();},!canLearn(i));act.appendChild(b);if(!canLearn(i)&&lv<SK_MAX)act.appendChild(el('small','why',skWhy(i)));}
  top.appendChild(act);D.appendChild(top);D.appendChild(el('p','skdesc',s.desc+(mod?' · 권능 변형: '+G.title+'의 힘이 깃든다':'')));
  const cards=el('div','skcards'),cd=(k,v)=>{const x=el('div','kc');x.append(el('small',null,k),el('b',null,v));cards.appendChild(x);};
  if(s.mul)cd('1타 피해 (현재 능력치)',fmt(skDmg(i))+(s.hits?' × '+s.hits:''));else cd('효과',skEffect(i,lv||1));
  cd(s.kind==='aoe'?'범위':s.kind==='buff'?'대상':'사거리',s.kind==='aoe'?'주변 '+s.r:s.kind==='buff'?'자신':String(s.range));cd('MP 소모',String(s.mp));cd('재사용 대기',s.cd+'초');D.appendChild(cards);
  const nx=el('div','sknx');if(lv<SK_MAX){const k=lv+1;nx.append(el('b',null,lv?'다음 단계 Lv '+lv+' → '+k:'습득 Lv 1'),el('span',null,skEffect(i,k)+' · 필요 캐릭터 Lv '+skNeedLv(i,k)+' · 스킬 포인트 1'));}else nx.append(el('b',null,'최대 단계'),el('span',null,skEffect(i,SK_MAX)));D.appendChild(nx);
  const lvs=el('div','sklvs');for(let k=1;k<=SK_MAX;k++)lvs.appendChild(el('span',k<=lv?'on':'',String(skNeedLv(i,k))));D.appendChild(el('small','lvh','단계별 필요 캐릭터 레벨'));D.appendChild(lvs);
  if(lv)D.appendChild(el('p','note2',S.slots.includes(s.id)?'슬롯 '+(S.slots.indexOf(s.id)+1)+'에 장착됨 · 다른 슬롯을 누르면 자리를 옮긴다':'아래 슬롯을 누르면 장착된다 · 이미 장착된 스킬과는 자리를 바꾼다'));
  /* 슬롯 바 8칸 */
  const bar=el('div','slotbar');for(let j=0;j<SLOT_N;j++){const id=S.slots[j],k=id&&skIdx(id),c=el('button','slc'+(id?' has':'')+(id===skSel?' sel':'')+(o.slotHint===j?' hint':''));c.type='button';
    c.appendChild(el('span','sn',String(j+1)));if(id){const G2=S.god&&GODS[S.god],md=G2&&G2.sk===k;c.append(el('span','ski',md?G2.ski:SK[k].icon),el('span','sln',md?G2.skn:SK[k].name));const x=el('span','slx','×');x.onclick=e=>{e.stopPropagation();S.slots[j]=null;save();renderWin();};c.appendChild(x);}
    else c.append(el('span','ski','+'),el('span','sln','빈 슬롯'));
    c.onclick=()=>{if(skLv(i)>0){const from=S.slots.indexOf(s.id);if(from===j){skSel=s.id;renderWin();return;}const prev=S.slots[j];S.slots[j]=s.id;if(from>=0)S.slots[from]=prev;o.slotHint=null;save();toast(s.name+' · 슬롯 '+(j+1),true);renderWin();}
      else if(id){skSel=id;skTier=SK[k].tier;renderWin();}else toast('먼저 스킬을 배운 뒤 슬롯을 누르자');};bar.appendChild(c);}
  B.appendChild(bar);
  F.append(el('p','note2','레벨업마다 스킬 포인트 1 · 배우기/강화 1P · 최대 Lv '+SK_MAX+' · 자동 전투는 슬롯에 넣은 스킬만 슬롯 순서대로 사용 (설정에서 변경) · 빨간 점 = 지금 배우기 · 강화 · 스킬서 사용 가능'));
  const bt=el('div','btns');bt.append(btn('자동 성장 '+(S.autoGrow?'켬':'끔'),S.autoGrow?'tg on':'tg',()=>{S.autoGrow=!S.autoGrow;if(S.autoGrow)autoGrowNow();save();renderWin();}));F.appendChild(bt);}
function skWhy(i){const s=SK[i],k=skLv(i)+1;if(!tierOpen(s.tier))return SK_TIER[s.tier].n+' 미개방 · '+SK_TIER[s.tier].how;if(s.book&&!S.books[s.id]){const sb=Object.values(SUBQ).find(q=>q.rw.book===s.id);return '스킬서 필요 — 서브 「'+(sb?sb.title:'?')+'」';}
  if(S.lv<skNeedLv(i,k))return '캐릭터 Lv '+skNeedLv(i,k)+' 필요';if(!S.kp)return '스킬 포인트 부족';return '';}

/* ================= 설정 ================= */
function openSettings(){if(!started)return;openWin({id:'settings',key:null,kick:'OPTIONS',title:'설정',tabs:false,info:()=>{const c=[el('span','wchip','자동 전투 · 물약 · 진행 · 화면')];if(!document.body.classList.contains('touch')){const b=el('button','btn alt wkset','⌨ 단축키 바꾸기');b.type='button';b.onclick=openKeyset;c.push(b);}return c;},render:renderSettings});}
/* v4.35 단축키 바꾸기 창 — 묶음별 [키] 버튼 → 누른 키로 바꿈(겹치면 맞바꿈) · 고정 키는 회색 · 아래 고정 줄 [기본값으로](두 번) */
function openKeyset(){if(!started)return;openWin({id:'keyset',key:null,kick:'KEY BINDINGS',title:'단축키 바꾸기',tabs:false,
  info:()=>{const n=Object.keys(S.keymap||{}).length;return [el('span','wchip',n?'바꾼 키 '+n+'개':'모두 기본값'),el('span','wchip','한글 입력 상태에서도 같은 자리 키')];},render:renderKeyset});}
function renderKeyset(B,F){const g=el('div','kbw');B.appendChild(g);
  for(const [gn,L] of KEYGUIDE){const sec=el('div','kbsec');sec.appendChild(el('h4',null,gn));
    for(const [n,...ks] of L){const r=el('div','kbr');r.appendChild(el('span','kbn',n));const one=ks.find(k=>/^[A-Z]$/.test(k));
      if(one){const d=one.toLowerCase(),cap=kbCap===d,b=el('button','kbk'+(cap?' cap':'')+(kb(d)!==d?' chg':''),cap?'키를 누르세요…':kbU(d));b.type='button';b.dataset.act=d;
        b.onclick=()=>{kbCap=cap?null:d;renderWin();};r.appendChild(b);r.appendChild(el('small','kbd0',kb(d)!==d?'기본 '+one:''));}
      else{r.appendChild(el('span','kbk fix',ks.join(' / ')));r.appendChild(el('small','kbd0','고정'));}
      sec.appendChild(r);}
    g.appendChild(sec);}
  let armed=false;const rb=btn('기본값으로','alt',()=>{if(!Object.keys(S.keymap||{}).length){toast('이미 기본값이다');return;}if(armed){kbReset();return;}armed=true;rb.textContent='한 번 더 누르면 되돌림';});
  F.append(el('p','note2',kbCap?'바꿀 키를 누르세요 · Esc = 취소 · 다른 동작이 쓰던 키면 서로 맞바꿈':'[키]를 누른 뒤 새 키를 누른다 · 겹치면 맞바꿈 · 이동 WASD · 1~8 · Space · Esc는 고정'),rb);}
function renderSettings(B,F){const C=S.cfg,g=el('div','setw');B.appendChild(g);
  const sec=n=>{const d=el('div','sec');d.appendChild(el('h4',null,n));g.appendChild(d);return d;};
  const row=(p,title,desc,opts,get,set)=>{const r=el('div','srw'),n=el('div','nm');n.append(el('b',null,title),el('small',null,desc));r.appendChild(n);const os=el('div','opts');
    for(const [v,lab] of opts){const b=el('button','opt'+(get()===v?' on':''),lab);b.type='button';b.onclick=()=>{set(v);save();renderWin();};os.appendChild(b);}r.appendChild(os);p.appendChild(r);};
  const onoff=[[true,'켬'],[false,'끔']];
  let s1=sec('자동 전투');
  row(s1,'타겟 범위','퀘스트 사냥이 아닐 때 자동 전투가 찾는 거리',[['near','가까이'],['mid','보통'],['far','넓게']],()=>C.scan,v=>C.scan=v);
  row(s1,'타겟 우선','퀘스트 사냥 중 노릴 몬스터',[['quest','퀘스트 대상 우선'],['near','가까운 몬스터']],()=>C.tgt,v=>C.tgt=v);
  row(s1,'스킬 사용 순서','슬롯에 넣은 스킬만 쓴다',[['slot','슬롯 1→8'],['strong','버프 → 강한 순']],()=>C.order,v=>C.order=v);
  row(s1,'몬스터 자동 반격','나를 공격한 몬스터를 먼저 상대',onoff,()=>C.counter!==false,v=>C.counter=v);
  let s2=sec('물약 · 귀환');
  row(s2,'HP 물약 자동 사용','HP가 이 비율 아래로 떨어지면 마신다',[[.3,'30%'],[.4,'40%'],[.5,'50%'],[.6,'60%'],[0,'끔']],()=>S.autoPot?C.potAt:0,v=>{S.autoPot=v>0;if(v>0)C.potAt=v;});
  row(s2,'자동 진행 물약 보충','자동 진행 중 HP 물약이 '+POT_LOW.hp+'개 아래면 상점에 들러 한도까지 구입',onoff,()=>!!S.autoBuy,v=>S.autoBuy=v);
  row(s2,'긴급 귀환','자동 사냥 중 물약이 없고 HP 40% 미만이면 귀환 주문서로 귀환 (퀘스트 자동 진행 중엔 항상 켜짐)',onoff,()=>!!S.autoRet,v=>S.autoRet=v);
  let s3=sec('진행 · 성장 · 장비');
  row(s3,'퀘스트 자동 진행',kTxt('수락 → 이동 → 사냥 → 보상을 자동으로 (T)'),onoff,()=>!!S.autoQ,v=>{S.autoQ=v;});
  row(s3,'자동 성장','능력치·스킬 포인트·스킬서·슬롯을 자동으로 쓴다',onoff,()=>!!S.autoGrow,v=>{S.autoGrow=v;if(v)autoGrowNow();});
  row(s3,'더 좋은 장비 자동 장착','얻은 장비가 지금보다 전투력이 높으면 바로 장착',onoff,()=>!!C.autoEq,v=>{C.autoEq=v;if(v)autoEquipAll();});
  row(s3,'자동 분해','무게 45% 또는 가방 90%가 넘으면 이 등급 이하를 분해 (장착·잠금·더 좋은 장비 제외 · 자동 잠금은 가방 🔒 ▾)',[[-1,'끔'],[0,'일반'],[1,'고급까지'],[2,'희귀까지']],()=>C.autoDis??-1,v=>C.autoDis=v);
  let s4=sec('화면 · 데이터');
  row(s4,'도트 양감','캐릭터·몬스터 도트에 형태 명암·반사광·선택적 외곽선',onoff,()=>VOL_ON,v=>{setVolume(v);C.vol=v;portrait('hero',$('face'),true);});
  row(s4,'양감 세기','약하게 하면 원래 도트에 가까워진다',Object.entries(VOL_LV).map(([n,k])=>[k,n]),()=>VOL_K,v=>{setVolume(true,v);C.volK=v;C.vol=true;portrait('hero',$('face'),true);});
  row(s4,'화면 확대','마우스 휠 80~180% · Z키 100%↔140%',[[1,'100%'],[1.2,'120%'],[1.4,'140%']],()=>Math.round(zoomT*10)/10,v=>{setZoom(v);});
  const r=el('div','srw'),n=el('div','nm');n.append(el('b',null,'데이터 초기화'),el('small',null,'저장을 지우고 처음부터 시작한다 (되돌릴 수 없음)'));let armed=false;const rb=btn('초기화','alt',()=>{if(armed){try{localStorage.removeItem(SAVE_KEY);}catch(e){}location.reload();return;}armed=true;rb.textContent='한 번 더 누르면 삭제';});r.append(n,rb);s4.appendChild(r);
  F.append(el('p','note2','설정은 저장된다 · 창을 열어도 게임은 계속 진행된다'));}

/* ================= 상점 (물약 · 주문서) ================= */
function buyStone(n){const pr=stonePrice();n=Math.max(0,Math.min(n,Math.floor(S.gold/pr),Math.floor(weightMax()-weightNow())));if(!n)return 0;S.stone+=n;S.gold-=n*pr;STAT.buyG+=n*pr;STAT.stoneBuy=(STAT.stoneBuy||0)+n;return n;}
function openShop(id){const body=el('div','shop');
  const key=k=>k==='hp'?'hpPot':k==='mp'?'mpPot':'scroll';
  const row=(k,label,desc,ic)=>{const d=el('div','si'),pr=potPrice(k),nm=el('div','nm'),have=S[key(k)],cap=POT_CAP[k];d.appendChild(icv(stkIcon(ic),'sic'));nm.append(el('b',null,label+'  '+have+'/'+cap),el('small',null,desc));d.append(nm,el('span','pr',fmt(pr)+' G'));
    for(const n of [1,5,'가득']){const want=n==='가득'?cap-have:Math.min(n,cap-have),b=el('button','btn',n==='가득'?'가득':n+'개');b.type='button';b.disabled=want<=0||S.gold<pr*(n==='가득'?1:want);b.onclick=()=>{const got=buyItem(k,want);if(got)toast(label+' '+got+'개 구입 (-'+fmt(got*pr)+' G)');save();openShop(id);};d.appendChild(b);}return d;};
  body.append(row('hp','HP 물약','최대 체력의 35% 회복 · 소지 한도 '+POT_CAP.hp,'hp'),row('mp','MP 물약','최대 기력의 40% 회복 · 소지 한도 '+POT_CAP.mp,'mp'),row('scroll','귀환 주문서','즉시 마을로 귀환 (B) · 소지 한도 '+POT_CAP.scroll,'ret'));
  body.appendChild(el('p','note2','자동 진행 물약 보충 · 긴급 귀환 · 물약 자동 사용은 설정(⚙)에서 바꾼다 · 강화석은 대장장이 상점에서'));
  openModal({who:id,npc:id,name:npcName(id),sub:'상점 · 보유 골드 '+fmt(S.gold)+' · 무게 '+Math.round(wPct()*100)+'%',text:'',body,btns:[{t:'가방 (I)',f:()=>{closeModal();openBag();}},{t:'닫기',alt:true,f:closeModal}]});}
/* ================= 대장장이: 강화 상점 (마법 주문서 판매) · 제작 · 강화 ================= */
function openForge(id){const body=el('div','shop');
  {const d=el('div','si'),pr=stonePrice(),nm=el('div','nm');d.appendChild(icv(stkIcon('stone'),'sic'));nm.append(el('b',null,'강화석  '+fmt(S.stone)+'개'),el('small',null,STK.stone.desc()));d.append(nm,el('span','pr',fmt(pr)+' G'));
    for(const n of [1,10]){const b=el('button','btn'+(n===1?' pri':''),n+'개');b.type='button';b.disabled=S.gold<pr*n;b.onclick=()=>{const got=buyStone(n);if(got)toast('강화석 '+got+'개 구입 (-'+fmt(got*pr)+' G)');else toast('골드나 무게가 부족하다');save();openForge(id);};d.appendChild(b);}body.appendChild(d);}
  body.appendChild(el('p','note2','강화 = 강화석 + 골드 · 무기·방어구 +'+ENH.safe.weapon+' · 장신구 +'+ENH.safe.acc+'까지 안전 · 제작 = 지역 광물 + 지역 장비 도면 + 골드(희귀 이상은 제작 비법서) · 광물·도면은 상점에서 팔지 않는다 — 사냥 · 퀘스트 · 지역 보스'));
  openModal({who:id,npc:id,name:npcName(id),sub:'대장장이 · 골드 '+fmt(S.gold),text:'',body,btns:[{t:'장비 강화',pri:true,f:()=>{closeModal();openEnchant();}},{t:'장비 제작',pri:true,f:()=>{closeModal();openCraft();}},{t:'닫기',alt:true,f:closeModal}]});}

/* ================= 제작 (리니지M: 일반·고급 확정 · 희귀 이상 제작 비법서 + 확률) ================= */
let cfK='weapon',cfT=1,cfG=0,cfN=1;
const targetSlotKind=k=>k==='ring'?'ring1':k;
function openCraft(){if(!started)return;cfT=Math.min(cfT,craftTierMax());if(!craftCan(cfK,cfT,cfG)){/* v4.19 레드닷이 있으면 그 조합(가장 좋은 등급·높은 단계)을 먼저 보여 준다 */let pick=null;for(const k of [cfK,...CRAFT_KINDS])if(!pick&&craftCanK(k))for(let t=craftTierMax();t>=1&&!pick;t--)for(let g=4;g>=0;g--)if(craftCan(k,t,g)){pick=[k,t,g];break;}if(pick)[cfK,cfT,cfG]=pick;}openWin({id:'craft',key:'u',kick:'CRAFTING',title:'제작',info:()=>[],render:renderCraft});}
function renderCraft(B,F){const g=el('div','cfw');B.appendChild(g);const L=el('div','cfl');g.appendChild(L);
  const sec=(t,items)=>{const d=el('div','cfs');d.appendChild(el('h4',null,t));const r=el('div','cfr');items.forEach(x=>r.appendChild(x));d.appendChild(r);L.appendChild(d);};
  sec('부위',CRAFT_KINDS.map(k=>{const b=el('button','cfb'+(cfK===k?' on':'')+(craftCanK(k)?' dot':''));b.type='button';b.append(icv(itemIcon({k,t:cfT,g:0,en:0})),el('span',null,SLOTN[k]));b.onclick=()=>{cfK=k;renderWin();};return b;}));
  sec('단계 (지역)',[1,2,3,4,5].map(t=>{const lock=t>craftTierMax(),b=el('button','cfb'+(cfT===t?' on':'')+(lock?' lock':'')+(!lock&&craftCanKT(cfK,t)?' dot':''));b.type='button';b.append(el('b',null,t+'단계'),el('span',null,TIERS[t].mat+' · '+TIERS[t].area));b.disabled=lock;b.title=lock?TIERS[t].area+' 지역을 열면 제작 가능':'';b.onclick=()=>{cfT=t;renderWin();};return b;}));
  sec('등급',[0,1,2,3,4].map(gr=>{const b=el('button','cfb grade'+(cfG===gr?' on':'')+(craftCan(cfK,cfT,gr)?' dot':''));b.type='button';b.style.setProperty('--gc',GRADES[gr].c);b.append(el('b',null,GRADES[gr].n),el('span',null,Math.round(CRAFT_EQ[gr].rate*100)+'%'+(CRAFT_EQ[gr].rcp?' · 비법서':'')));b.onclick=()=>{cfG=gr;renderWin();};return b;}));
  /* 결과 미리보기 */
  const P=el('div','cfp');g.appendChild(P);/* v4.27: 정보는 스크롤(.cfpi) · [제작하기]는 아래 고정 줄(.cfact) */const PI=el('div','cfpi'),ACT=el('div','cfact');P.append(PI,ACT);const pv={k:cfK,t:cfT,g:cfG,en:0},G=GRADES[cfG],c=craftCheck(cfK,cfT,cfG),R=c.R;
  const hd=el('div','cfh'),ic=el('div','cfi');ic.style.setProperty('--gc',G.c);ic.appendChild(icv(itemIcon(pv)));const nm=el('div',null);const t1=el('b',null,itemName(pv));t1.style.color=G.c;nm.append(t1,el('small',null,G.n+' · '+SLOTN[cfK]+' · '+TIERS[cfT].area+' '+cfT+'단계 · 착용 레벨 없음'));hd.append(ic,nm);PI.appendChild(hd);
  const cur=S.eq[targetSlotKind(cfK)]&&itemById(S.eq[targetSlotKind(cfK)]);PI.appendChild(statLines(pv,cur||null));if(cur)PI.appendChild(el('div','tt','착용 중 '+itemName(cur)+'과(와) 비교'));if(craftCan(cfK,cfT,cfG))PI.appendChild(el('div','cfok','● 지금 만들 수 있다 · 착용 중인 장비보다 좋다'));
  const need=el('div','cfn');need.appendChild(el('h4',null,'재료'));
  /* v4.15: 재료 이름 · (i)를 누르면 얻는 곳 팝업 */
  const row=(label,have,req,ok,ico,info)=>{const d=el('div','cfm'+(ok?'':' no'));const l=el('button','cfml');l.type='button';if(ico)l.appendChild(icv(stkIcon(ico),'sic'));l.append(label);
    const ib=el('button','infob','i');ib.type='button';ib.title='얻는 곳';const open=e=>{e.stopPropagation();showTip(ib,tp=>acqTip(tp,info||ico));};l.onclick=open;ib.onclick=open;d.append(l,ib,el('b',null,have+' / '+req));need.appendChild(d);};
  row(STK[c.ok_].n,cnt(c.ok_),c.ore,cnt(c.ok_)>=c.ore,c.ok_);row(STK[c.dk].n,cnt(c.dk),1,cnt(c.dk)>=1,c.dk);if(R.rcp)row(STK[R.rcp].n,cnt(R.rcp),1,cnt(R.rcp)>=1,R.rcp);row('골드',fmt(S.gold),fmt(c.gold),S.gold>=c.gold,null,'gold');
  if(R.need){const m=craftMats(cfK,cfT,R.need.g,R.need.n);row('재료 장비 · '+GRADES[R.need.g].n+' '+itemName({k:cfK,t:cfT,g:R.need.g,en:0}),m.length,R.need.n,m.length>=R.need.n,null,{eq:true,k:cfK,t:cfT,g:R.need.g});}
  PI.appendChild(need);
  PI.appendChild(el('p','note2','성공 '+Math.round(R.rate*100)+'%'+(R.rate<1?' · 실패하면 광물·도면·비법서·골드를 잃고 재료 장비는 남는다':'')+' · 대성공 '+Math.round(CRAFT_GREAT*100)+'%: +1~3 강화된 채로'+(R.need?' · 재료 장비는 강화 수치가 낮은 것부터 · 장착·잠금 장비는 쓰지 않는다':'')));
  /* v4.33 수량: [−] ×N [+] [최대] · 재료가 되는 만큼 · 결과 요약 */
  const mx=craftMaxN(cfK,cfT,cfG);cfN=Math.max(1,Math.min(cfN,Math.max(1,mx)));
  const showFx=(cls,b,sp)=>{const fx=el('div','encfx '+cls);fx.append(el('b',null,b),el('span',null,sp));$('win').querySelector('.wbox').appendChild(fx);setTimeout(()=>fx.remove(),cls.includes('cfsum')?2400:1400);};
  if(mx>1){const q=el('div','cfq');const tb=(t,f,dis)=>{const b=el('button','tgb',t);b.type='button';b.disabled=dis;b.onclick=f;return b;};
    q.append(el('span','tgl','수량'),tb('−',()=>{cfN=Math.max(1,cfN-1);renderWin();},cfN<=1),el('b','tgv','×'+cfN),tb('+',()=>{cfN=Math.min(mx,cfN+1);renderWin();},cfN>=mx),tb('최대',()=>{cfN=mx;renderWin();},cfN>=mx),el('span','cfmax','재료로 최대 '+mx+'회'));ACT.appendChild(q);}
  const go=btn(cfN>1?'제작하기 ×'+cfN:'제작하기','pri',()=>{
    if(cfN<=1){const r=craftItem(cfK,cfT,cfG);if(!r)return;renderWin();showFx(r.ok?'ok':'no',r.ok?(r.great?'대성공':'제작 성공'):'제작 실패',r.ok?GRADES[r.it.g].n+' '+itemName(r.it):'재료 장비는 남았다');return;}
    const o=craftBatch(cfK,cfT,cfG,cfN);if(!o.tries)return;cfN=1;renderWin();
    const sp=o.tries+'회 · 성공 '+o.ok+(o.fail?' · 실패 '+o.fail:'')+(o.great?' · 대성공 '+o.great:'')+(o.best?' · 가장 좋은 것 '+GRADES[o.best.g].n+' '+itemName(o.best):'')+(o.stop?' · 재료가 떨어져 멈춤':'');
    showFx('cfsum '+(o.ok?'ok':'no'),'제작 ×'+o.tries,sp);toast('제작 ×'+o.tries+' — 성공 '+o.ok+(o.fail?' · 실패 '+o.fail:'')+(o.great?' · 대성공 '+o.great:''),o.ok>0);},!c.ok);
  go.classList.add('cfgo');ACT.appendChild(go);
  if(!c.ok)ACT.appendChild(el('small','why',c.why.join(' · ')));
  F.append(el('p','note2','빨간 점 = 지금 재료로 만들 수 있고 착용 중인 장비보다 좋은 부위 · 단계 · 등급 · 제작 = 그 지역 광물 + 그 지역 장비 도면(무기·방어구·장신구) + 골드 · 희귀 이상은 제작 비법서(지역 보스)가 더 필요한 확률 제작 · 광물·도면은 그 지역 사냥 · 퀘스트 · 토벌 의뢰 · 지역 보스로 · 착용 레벨 없음'));}

/* ===== 재료 얻는 곳 (제작 창 (i)) ===== */
const pctS=p=>(Math.round(p*1000)/10)+'%';
function regionHunts(r){return HUNTALL.filter(z=>MAP_REG[ZALL[z].map]===r).map(z=>ZALL[z]);}
function regionBosses(r){return QUESTS.filter(q=>q.elite&&MAP_REG[qMap(q)]===r);}
function acqTip(tp,key){const sec=(t,lines)=>{if(!lines.length)return;tp.appendChild(el('b','acqh',t));const u=el('ul','acql');for(const x of lines){const li=el('li');if(typeof x==='string')li.textContent=x;else li.append(...x);u.appendChild(li);}tp.appendChild(u);};
  const go=(z)=>{const b=btn('이동','',()=>{hideTip();closeWin();const Z=ZALL[z.id];if(!S.maps.includes(Z.map)){toast(MAPS[Z.map].name+'은(는) 아직 갈 수 없다');return;}goHunt(z.id,null,null,Z.name+'(으)로 · 재료 사냥');});b.classList.add('mini');return b;};
  const zoneLine=z=>{const open=S.maps.includes(z.map);return [z.name+' Lv '+z.lv+' — '+z.mobs.map(m=>SPECIES[m[0]].name).join(' · ')+(open?'':' (미개방)'),' ',open?go(z):''];};
  const bossLine=q=>{const i=QUESTS.indexOf(q),f=i<S.qi;return q.elite.name+' · '+ZALL[q.zone].name+(f?' (지역 보스 · '+Math.round(FIELD_RESP/60*10)/10+'분마다)':' (관문 '+(i+1)+' 「'+q.title+'」)');};
  if(key==='gold'){tp.append(el('b','tn','골드'));sec('얻는 곳',['모든 몬스터 처치','메인 · 서브 퀘스트 보상','토벌 의뢰 보상 (Lv '+REP.lv+'+)','지역 보스 · 침공 보스']);return;}
  if(key&&key.eq){const G=GRADES[key.g];tp.append(el('b','tn','재료 장비 · '+G.n+' '+itemName({k:key.k,t:key.t,g:key.g,en:0})));
    sec('얻는 곳',[key.g===0?'제작 · 일반 등급 (같은 부위 · 같은 단계)':'제작 · '+G.n+' 등급','몬스터 드롭 '+pctS(DROP.eq)+(key.g===1?' 중 고급 '+pctS(DROP.hi):key.g===0?'':' (희귀 이상은 지역 보스만)'),TIERS[key.t].area+' 사냥터 (장비 '+key.t+'단계 = Lv '+TIERS[key.t].iL+'~)']);
    tp.appendChild(el('p','note2','장착 · 잠금 장비는 재료로 쓰지 않는다'));return;}
  const d=STK[key];if(!d)return;tp.append(el('b','tn',d.n),el('div','tt','보유 '+fmt(cnt(key))));
  let m;if((m=/^ore(\d)$/.exec(key))){const r=+m[1];sec('드롭하는 몬스터 · '+pctS(DROP.ore)+' (1개)',regionHunts(r).map(zoneLine));sec('지역 보스 · 확정 '+(3+2*r)+'개',regionBosses(r).map(bossLine));sec('그 밖에',[REGN[r]+' 메인 퀘스트 보상','토벌 의뢰 보상 ('+REGN[r]+' 경비대장 · Lv '+REP.lv+'+)','제작 튜토리얼 서브 수락 시']);}
  else if((m=/^d([wac])(\d)$/.exec(key))){const r=+m[2],p=PARTN[m[1]];sec('드롭하는 몬스터 · '+pctS(DROP.dsg)+' (무기·방어구·장신구 중 하나)',regionHunts(r).map(zoneLine));sec('지역 보스 · 확정 1장',regionBosses(r).map(bossLine));sec('그 밖에',[REGN[r]+' 관문 퀘스트 보상 2장 · 일반 메인 일부 1장','토벌 의뢰 보상 60%']);tp.appendChild(el('p','note2',p+' 계열 제작에 1장씩 쓴다'));}
  else if(/^rcp\d$/.test(key)){const pr=DROP.boss[key];sec('지역 보스 · '+pctS(pr),[...QUESTS.filter(q=>q.elite).map(bossLine),'침공 보스 (Lv '+INV.unlockLv+'+)']);sec('그 밖에',['성장 서브 보상 (희귀 · 영웅 장비 제작 등)']);}
  else{tp.appendChild(el('p',null,d.desc?d.desc():''));}}
/* ================= 컬렉션 (리니지M 아이템 컬렉션) ================= */
let colCat=-1;
function openColl(){if(!started)return;openWin({id:'coll',key:'o',kick:'ITEM COLLECTION',title:'컬렉션',info:()=>{const n=COLL.filter(collDone).length,cb=collSum();return [el('span','wchip','완성 '+n+' / '+COLL.length),el('span','wchip',Object.keys(cb).length?Object.entries(cb).map(([k,v])=>STATN[k]+' '+statFmt(k,v)).join(' · '):'효과 없음')];},render:renderColl});}
/* v4.12 일괄 등록: 미완성 컬렉션의 빈 칸마다 조건에 맞는 장비(장착·잠금·지금 장비보다 좋은 것 제외)를 낮은 값부터 */
function collBatchList(){const used=new Set(),L=[];/* v4.17: 등록 가능한 칸은 모두 채운다 (장착 · 잠금 장비만 제외) */
  for(const c of COLL){if(collDone(c))continue;c.req.forEach((r,i)=>{if(collReg(c,i))return;
    const it=S.items.filter(x=>!used.has(x.u)&&!isEq(x)&&!x.lock&&reqMatch(r,x)).sort((a,b)=>a.g-b.g||a.en-b.en||a.t-b.t)[0];if(it){used.add(it.u);L.push([c.id,i,it.u]);}});}return L;}
function collBatch(){const L=collBatchList();let n=0;const before=COLL.filter(collDone).length;for(const [cid,i,u] of L)if(collRegister(cid,i,u))n++;const done=COLL.filter(collDone).length-before;STAT.batchReg=(STAT.batchReg||0)+n;return{n,done};}
function renderColl(B,F){const ct=el('div','icat');for(const [i,n] of [[-1,'전체'],...COLL_CAT.map((n,i)=>[i,n])]){const b=el('button','ict'+(colCat===i?' on':''),n);b.type='button';if(i>=0&&COLL.some(c=>c.cat===i&&!collDone(c)&&c.req.some((r,j)=>!collReg(c,j)&&collCand(r))))b.classList.add('dot');b.onclick=()=>{colCat=i;renderWin();};ct.appendChild(b);}B.appendChild(ct);
  const list=el('div','cll');B.appendChild(list);
  for(const c of COLL.filter(c=>colCat<0||c.cat===colCat)){const done=collDone(c),nReg=c.req.filter((r,i)=>collReg(c,i)).length,card=el('div','clc'+(done?' done':''));
    const hd=el('div','clh');hd.append(el('span','clg',COLL_CAT[c.cat]),el('b',null,c.n),el('span','clp',nReg+'/'+c.req.length),el('span','clb',Object.entries(c.b).map(([k,v])=>STATN[k]+' '+statFmt(k,v)).join(' · ')));card.appendChild(hd);
    const sl=el('div','cls');c.req.forEach((r,i)=>{const reg=collReg(c,i),cand=!reg&&collCand(r),near=!reg&&!cand&&r.en&&collCand(r,true),d=el('div','clr'+(reg?' reg':cand?' can':near?' near':''));
      const ic=el('div','clic');ic.style.setProperty('--gc',r.g?GRADES[r.g].c:'rgba(232,184,100,.35)');ic.appendChild(icv(itemIcon(reqIcon(r))));if(reg)ic.appendChild(el('span','ok','✓'));else if(cand)ic.appendChild(el('span','ex','!'));else if(near)ic.appendChild(el('span','pl','+'));
      d.append(ic,el('span','cln',reqLabel(r)));
      if(cand){let armed=false;const b=btn('등록','pri',()=>{if(!armed){armed=true;b.textContent='한 번 더 (사라짐)';return;}collRegister(c.id,i,cand.u);renderWin();});b.title=itemName(cand)+'을(를) 등록 — 등록한 아이템은 사라진다';d.appendChild(b);}
      else if(near)d.appendChild(el('small','clhint','강화 후 등록'));
      else if(!reg&&r.bu){const q=QUESTS.find(x=>x.id===BU[r.bu].q),i=QUESTS.indexOf(q);d.appendChild(el('small','clhint',i<S.qi?ZALL[q.zone].name+' 지역 보스':'관문 「'+q.title+'」에서'));}
      sl.appendChild(d);});card.appendChild(sl);list.appendChild(card);}
  {const L=collBatchList();const bb=btn(L.length?'일괄 등록 · '+L.length+'칸':'일괄 등록할 장비 없음','pri',()=>{const r=collBatch();toast('일괄 등록 '+r.n+'개'+(r.done?' · 컬렉션 '+r.done+'개 완성':''),true);renderWin();},!L.length);
    bb.title='등록 가능한 모든 칸을 한 번에 채운다 · 장착 · 잠금 장비는 빠진다';const bar=el('div','clbatch');bar.append(bb,el('small',null,'등록 가능한 칸을 모두 채운다 · 지키고 싶은 장비는 🔒 잠금'));F.appendChild(bar);}
  F.append(el('p','note2','지역 보스 컬렉션은 보스 전용 장비(★)로만 채운다 · 관문을 넘긴 보스는 '+Math.round(FIELD_RESP/60*10)/10+'분마다 다시 나타난다 · 등록한 장비는 사라지고 되돌릴 수 없다 · 컬렉션을 완성하면 능력치·신앙이 영구히 오른다 · 장착 중 · 잠금 장비는 등록되지 않는다 · 빨간 ! 바로 등록 가능 · 파란 + 강화하면 등록 가능 · 컬렉션에 쓸 수 있는 장비는 일괄·자동 분해에서 빠진다'));}

/* ================= v4.31 획득 기록 (L) — 자동 사냥 중 무엇을 어디서 얻었는지 ================= */
const LOGF=[['all','전체'],['eq','장비'],['mat','도면 · 주문서'],['book','비법서 · 스킬서'],['miss','놓친 것']];
const logOk=(e,f)=>f==='all'||(f==='miss'?!!e.miss:!e.miss&&e.cat===f);
function agoTxt(at){const s=Math.max(0,(Date.now()-at)/1000);return s<60?'방금':s<3600?Math.floor(s/60)+'분 전':s<86400?Math.floor(s/3600)+'시간 전':Math.floor(s/86400)+'일 전';}
const LOG_T0=Date.now();
function logSum(){const L=(S.acq||[]).filter(e=>e.at>=LOG_T0),o={eq:0,mat:0,book:0,miss:0};for(const e of L){if(e.miss)o.miss+=e.q||1;else o[e.cat]+=e.q||1;}return o;}
function logState(e){if(e.miss)return['놓침','miss'];if(!e.u)return['',''];const it=itemById(e.u);if(!it)return['사용함','gone'];if(isEq(it))return['장착 중','on'];return[it.lock?'가방 · 🔒':'가방','bag'];}
function openLog(){if(!started)return;openWin({id:'log',key:'l',kick:'LOOT LOG',title:'획득 기록',info:()=>{const L=S.acq||[],m=logSum(),c=[el('span','wchip','최근 '+L.length+' / '+ACQ_MAX),el('span','wchip','이번 접속 · 장비 '+m.eq+' · 도면 · 주문서 '+m.mat+' · 비법서 '+m.book)];if(m.miss)c.push(el('span','wchip warn','놓친 장비 '+m.miss));return c;},render:renderLog});}
function renderLog(B,F){const L=S.acq||[],f=LOGF.some(x=>x[0]===S.logF)?S.logF:'all';
  const ct=el('div','icat');for(const [id,n] of LOGF){const k=L.filter(e=>logOk(e,id)).length,b=el('button','ict'+(f===id?' on':''),n+(id==='all'?'':' '+k));b.type='button';if(id==='miss'&&L.some(e=>e.miss&&e.at>(S.acqSeen||0)))b.classList.add('dot');b.onclick=()=>{S.logF=id;save();renderWin();};ct.appendChild(b);}B.appendChild(ct);
  const list=el('div','lgl');B.appendChild(list);const V=L.filter(e=>logOk(e,f));
  if(!V.length)list.appendChild(el('p','lgem',L.length?'이 분류의 기록이 없다':'아직 기록이 없다 — 고급 이상 장비 · 보스 전용 장비(★) · 도면 · 제작 비법서 · 스킬서 · 축복 주문서를 얻으면 여기에 남는다'));
  for(const e of V){const r=el('div','lgr'+(e.miss?' miss':'')),col=e.cat==='eq'?GRADES[e.g||0].c:(STK[e.k]&&STK[e.k].col)||'#e8b864',[st,sc]=logState(e);
    const nm=el('b','lgn',(e.bu?'★ ':'')+e.n+((e.q||1)>1?' ×'+e.q:''));nm.style.color=col;const dt=el('i','lgd');dt.style.background=col;
    r.append(dt,nm,el('span','lgs',e.src||''),el('span','lgz',e.z||''),el('span','lgt '+sc,st),el('span','lga',agoTxt(e.at)));list.appendChild(r);}
  {let armed=false;const b=btn('기록 비우기','',()=>{if(!armed){armed=true;b.textContent='한 번 더 (비우기)';return;}S.acq=[];save();renderWin();},!L.length);
    F.append(b,el('p','note2','자동 사냥 · 퀘스트로 얻은 것을 최근 '+ACQ_MAX+'건까지 · 고급 이상 장비 · 보스 전용 장비 · 도면 · 비법서 · 스킬서 · 축복 주문서만 (일반 장비 · 광물 · 강화석 · 물약 · 상점 구입 · 제작 결과는 남기지 않는다) · 놓친 것 = 가방 가득 · 무게 초과로 줍지 못한 장비 — 가방(I)을 정리하자'));}
  S.acqSeen=Date.now();}
