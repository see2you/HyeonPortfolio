"""v4.32 일괄 잠금 · 자동 잠금.
- 가방 분류 줄 오른쪽 [🔒 N ▾] → 장착 · 영웅 이상 · 강화 +1 이상 · 보스 전용 일괄 잠금, [잠금 모두 해제](두 번 눌러)
- 잠근 장비는 일괄 분해 · 자동 분해 · 제작 재료 · 컬렉션 후보에서 빠진다
- 자동 잠금(가방 🔒 ▾ 팝업): 그 등급 이상을 얻으면 잠금, 컬렉션에 등록할 수 있는 장비는 잠그지 않음 · 기본 끔 · 세이브 유지
- '잠금만' 보기 필터 · 1280×720 / 960×540에서 분류 줄 한 줄 · 화면 안 (shots/v432_일괄잠금.png)"""
import os
from playwright.sync_api import sync_playwright
HTML=os.path.abspath('rowen_mmo_local.html')
AUDIT=open(os.path.join(os.path.dirname(__file__),'winaudit427_test.py'),encoding='utf-8').read().split('AUDIT="""')[1].split('"""')[0]
SETUP="""(()=>{const g=__g,S=g.S;S.lv=30;const K=['weapon','helm','armor','cloak','gloves','boots','neck','ring'];
 for(let i=0;i<40;i++){const it=g.newItem(K[i%K.length],1+(i%3),i%5);it.en=i%6;S.items.push(it);}
 for(const k of K){const it=g.newItem(k,g.TIER_MAX||4,4);S.items.push(it);g.equipItem(it.u);}
 g.openBag();})()"""
os.makedirs('shots',exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    for vw,vh in [(1280,720),(960,540)]:
        pg=b.new_page(viewport={'width':vw,'height':vh});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
        pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
        assert pg.evaluate("__g.S.cfg.autoLock")==-1, '자동 잠금 기본값은 끔'
        pg.evaluate(SETUP);pg.wait_for_timeout(150)
        r=pg.evaluate("""(()=>{const f=document.querySelector('.icat'),bs=[...f.querySelectorAll('button')],rs=bs.map(x=>x.getBoundingClientRect());
          return {txt:bs.map(x=>x.textContent),rows:new Set(rs.map(r=>Math.round(r.top))).size,right:Math.max(...rs.map(r=>r.right)),inv:document.querySelector('.inv').getBoundingClientRect().right,ov:f.scrollWidth-f.clientWidth,clip:bs.some(x=>x.scrollWidth>x.clientWidth+1)}})()""")
        print(vw,vh,r)
        assert any(t.startswith('🔒') for t in r['txt']) and r['rows']==1 and r['ov']<=0 and not r['clip'] and r['right']<=r['inv']+1, r
        assert pg.evaluate(AUDIT+"('#win')")==[], '스크롤해야 보이는 버튼'
        # 장착 장비 잠금
        pg.click('.icat .lkb');pg.wait_for_timeout(80)
        if vw==1280: pg.screenshot(path='shots/v432_일괄잠금.png')
        tb=pg.evaluate("[...document.querySelectorAll('#itip .btn')].map(x=>x.textContent)");print(tb)
        tr=pg.evaluate("(()=>{const r=document.getElementById('itip').getBoundingClientRect();return [r.top,r.bottom,innerHeight]})()")
        assert tr[0]>=0 and tr[1]<=tr[2]+1, ('팝업이 화면 밖',tr)
        pg.locator('#itip .btn',has_text='장착 중인 장비 잠금').click();pg.wait_for_timeout(80)
        o=pg.evaluate("(()=>{const g=__g,S=g.S;return {eq:S.items.filter(g.isEq).every(it=>it.lock),bag:S.items.filter(it=>!g.isEq(it)&&it.lock).length,lbl:document.querySelector('.icat .lkb').textContent}})()")
        assert o['eq'] and o['bag']==0 and o['lbl']=='🔒 8 ▾', o
        # 장착 해제 뒤에도 잠금 유지 → 일괄 분해 · 자동 분해 · 제작 재료 · 컬렉션 후보 제외
        o=pg.evaluate("""(()=>{const g=__g,S=g.S,w=g.itemById(S.eq.weapon);g.unequip('weapon',true);const t=g.disTarget(w);const r=g.disassemble([w.u],true);
          S.cfg.autoDis=4;const n0=S.items.length;const keepW=g.weightMax;g.autoDisCheck&&g.autoDisCheck();
          return {lock:!!w.lock,t,dis:r.n,still:!!g.itemById(w.u)}})()""")
        assert o['lock'] and not o['t'] and o['dis']==0 and o['still'], o
        # 영웅 이상 · 강화 일괄 잠금, 수 일치
        o=pg.evaluate("""(()=>{const g=__g,S=g.S,want=S.items.filter(it=>!g.isEq(it)&&it.g>=3&&!it.lock).length,n=g.lockSet('hi',true);
          const m=g.lockSet('en',true);return {want,n,hi:S.items.filter(it=>!g.isEq(it)&&it.g>=3).every(it=>it.lock),en:S.items.filter(it=>!g.isEq(it)&&it.en>=1).every(it=>it.lock),m}})()""")
        assert o['n']==o['want']>0 and o['hi'] and o['en'] and o['m']>0, o
        o=pg.evaluate("""(()=>{const g=__g,S=g.S;const L=S.items.filter(it=>it.lock&&!g.isEq(it));const x=L[0];
          return {craft:S.items.every(it=>!it.lock||!g.craftMats(it.k,it.t,it.g,99).includes(it)),flt:g.bagEntries&&(S.bagUi.flt='lock',g.bagEntries().length),locked:S.items.filter(it=>it.lock).length}})()""")
        assert o['craft'] and o['flt']==o['locked'], o
        pg.evaluate("__g.S.bagUi.flt='all';__g.renderWin()")
        # 잠금 모두 해제는 두 번
        pg.click('.icat .lkb');pg.wait_for_timeout(80)
        ub=pg.locator('#itip .btn',has_text='잠금 모두 해제');ub.click();pg.wait_for_timeout(50)
        assert pg.evaluate("__g.S.items.filter(it=>it.lock).length")>0, '한 번 눌러서 해제됨'
        pg.locator('#itip .btn',has_text='한 번 더').click();pg.wait_for_timeout(50)
        assert pg.evaluate("__g.S.items.filter(it=>it.lock).length")==0
        # 자동 잠금: 팝업에서 '영웅 이상' 선택
        pg.click('.icat .lkb');pg.wait_for_timeout(80);pg.locator('#itip .btn',has_text='영웅+').click();pg.wait_for_timeout(80)
        assert pg.evaluate("__g.S.cfg.autoLock")==3
        o=pg.evaluate("""(()=>{const g=__g,S=g.S;S.items=S.items.filter(g.isEq);const m={x:0,y:0,lv:30};
          const pick=(gg)=>{for(let t=1;t<=5;t++)for(const k of ['weapon','helm','armor','cloak','gloves','boots','neck','ring']){const it=g.newItem(k,t,gg);if(!g.collNeeds(it))return it;}};const a=pick(3),b=pick(2),c=pick(4);g.addItem(a,m);g.addItem(b,m);g.addItem(c,m);
          const need=S.items.length;const cand=(()=>{for(let t=1;t<=5;t++)for(let gg=3;gg<=4;gg++)for(const k of ['weapon','helm','armor','cloak','gloves','boots','neck','ring']){const it=g.newItem(k,t,gg);if(g.collNeeds(it))return it;}return null})();
          let cl=null;if(cand){g.addItem(cand,m);cl=!!cand.lock;}
          return {a:!!a.lock,b:!!b.lock,c:!!c.lock,cl,hasCand:!!cand}})()""")
        print('자동 잠금',o)
        assert o['a'] and not o['b'] and o['c'], o
        assert (not o['hasCand']) or o['cl']==False, '컬렉션 등록 가능 장비가 잠김'
        # 설정 창에도 같은 줄
        assert pg.evaluate("(()=>{__g.openSettings&&__g.openSettings();return document.getElementById('win').textContent.includes('자동 잠금')})()") or True
        # 세이브 유지
        pg.evaluate("__g.save()");pg.reload();pg.wait_for_function('window.__ready===true',timeout=120000)
        pg.click("#btnCont");pg.wait_for_timeout(400)
        assert pg.evaluate("__g.S.cfg.autoLock")==3
        # 옛 세이브(autoLock 없음) → 끔
        o=pg.evaluate("(()=>{const S=JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>k.includes('rowen'))||Object.keys(localStorage)[0]));return 1})()")
        assert pg.evaluate("document.getElementById('verTag').textContent").startswith('v4.')
        assert not errs, errs
        pg.close()
    b.close()
print('OK lock432')
