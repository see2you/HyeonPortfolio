"""v4.30 가방 정렬 · 보기 필터.
- 분류 줄 오른쪽에 [정렬 · 기본 ▾] [보기 · 전체 ▾] — 1280×720 · 960×540에서 한 줄 · 화면 안 · 스크롤 없이
- 정렬(등급 · 부위 · 단계 · 강화): 장착 중은 항상 앞, 나머지는 기준대로
- 필터(NEW · 컬렉션 가능 · 분해 대상): 장비만, 조건에 맞는 것만 · 분해 대상 수 = 일괄 분해(전설까지) 기준과 같음
- 선택은 세이브에 저장되어 새로고침 · 이어하기 뒤에도 유지 (shots/v430_가방정렬.png)"""
import os
from playwright.sync_api import sync_playwright
HTML=os.path.abspath('rowen_mmo_local.html')
AUDIT=open(os.path.join(os.path.dirname(__file__),'winaudit427_test.py'),encoding='utf-8').read().split('AUDIT="""')[1].split('"""')[0]
SETUP="""(()=>{const g=__g,S=g.S;S.lv=30;const K=['weapon','helm','armor','cloak','gloves','boots','neck','ring'];
 for(let i=0;i<40;i++){const it=g.newItem(K[i%K.length],1+(i%3),i%5);it.en=i%6;S.items.push(it);}
 for(let i=0;i<8;i++){const it=g.newItem(K[i],g.TIER_MAX||4,0);it.en=i%3;S.items.push(it);}
 for(const k of K){const it=g.newItem(k,g.TIER_MAX||4,4);S.items.push(it);g.equipItem(it.u);}
 S.items[3].lock=1;g.addStk('hpPot'in g.STK?'hpPot':Object.keys(g.STK)[0],5);g.openBag();})()"""
os.makedirs('shots',exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    for vw,vh in [(1280,720),(960,540)]:
        pg=b.new_page(viewport={'width':vw,'height':vh});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
        pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
        pg.evaluate(SETUP);pg.wait_for_timeout(150)
        r=pg.evaluate("""(()=>{const ct=document.querySelector('.icat'),bs=[...ct.querySelectorAll('button')],rs=bs.map(x=>x.getBoundingClientRect());
          return {n:bs.length,txt:bs.map(x=>x.textContent),rows:new Set(rs.map(r=>Math.round(r.top))).size,right:Math.max(...rs.map(r=>r.right)),inv:document.querySelector('.inv').getBoundingClientRect().right,ov:ct.scrollWidth-ct.clientWidth,clip:bs.some(x=>x.scrollWidth>x.clientWidth+1)}})()""")
        print(vw,vh,r)
        assert r['n']==6 and r['txt'][4].startswith('정렬 · 기본') and r['txt'][5].startswith('보기 · 전체'), r
        assert r['rows']==1 and r['ov']<=0 and not r['clip'] and r['right']<=r['inv']+1, '정렬 · 보기 버튼이 한 줄에 들어가지 않음'
        assert pg.evaluate(AUDIT+"('#win')")==[], '스크롤해야 보이는 버튼'
        # 정렬: 등급
        pg.click('.ict.isort');pg.wait_for_timeout(80);pg.locator('#itip .btn',has_text='등급').click();pg.wait_for_timeout(80)
        o=pg.evaluate("""(()=>{const g=__g,L=g.bagEntries().filter(e=>e.it).map(e=>e.it);const eq=L.findIndex(it=>!g.isEq(it));
          return {eqFirst:L.slice(0,eq).every(g.isEq)&&L.slice(eq).every(it=>!g.isEq(it)),g:L.slice(eq).map(it=>it.g),sort:g.S.bagUi.sort,lbl:document.querySelector('.ict.isort').textContent}})()""")
        assert o['eqFirst'] and o['g']==sorted(o['g'],reverse=True) and o['sort']=='grade' and o['lbl'].startswith('정렬 · 등급'), o
        for s,f in [('tier','t'),('en','en')]:
            o=pg.evaluate(f"(()=>{{const g=__g;return g.bagSortItems(g.S.items.filter(it=>!g.isEq(it)),'{s}').map(it=>it.{f})}})()")
            assert o==sorted(o,reverse=True), (s,o)
        o=pg.evaluate("(()=>{const g=__g,K=['weapon','helm','armor','cloak','gloves','boots','neck','ring'];return g.bagSortItems(g.S.items.filter(it=>!g.isEq(it)),'slot').map(it=>K.indexOf(it.k))})()")
        assert o==sorted(o), o
        # 필터: 분해 대상 = 일괄 분해 기준
        pg.click('.ict.iflt');pg.wait_for_timeout(80);pg.locator('#itip .btn',has_text='분해 대상만').click();pg.wait_for_timeout(80)
        o=pg.evaluate("""(()=>{const g=__g,S=g.S,cells=document.querySelectorAll('.grid .cell:not(.empty)').length;
          const want=S.items.filter(it=>!g.isEq(it)&&!it.lock&&!g.betterThanEq(it)&&!g.collNeeds(it)).length;
          return {cells,want,lbl:document.querySelector('.ict.iflt').textContent,cat:S.bagUi.cat,stk:g.bagEntries().some(e=>!e.it)}})()""")
        print('분해 대상',o)
        assert o['want']>0 and o['cells']==o['want'] and o['lbl'].startswith('분해 대상만 '+str(o['want'])) and not o['stk'], o
        if vw==1280: pg.screenshot(path='shots/v430_가방정렬.png')
        if vw==1280: pg.click('.ict.isort');pg.wait_for_timeout(80);pg.screenshot(path='shots/v430_정렬팝업.png');pg.evaluate("__g.hideTip&&__g.hideTip()");pg.keyboard.press('Escape') if False else None
        # 소모품 분류를 누르면 필터가 풀린다
        o=pg.evaluate("(()=>{const g=__g;const keep=g.S.bagUi.flt;[...document.querySelectorAll('.ict')].find(b=>b.textContent==='소모품').click();const r=g.S.bagUi.flt;g.S.bagUi.flt=keep;g.S.bagUi.cat='all';g.renderWin();return r})()")
        assert o=='all', o
        for f,expr in [('new',"!g.isEq(it)&&(g.betterThanEq(it)||!!it.nw)"),('coll',"!g.isEq(it)&&!it.lock&&!!g.collNeeds(it)")]:
            o=pg.evaluate(f"(()=>{{const g=__g;g.S.bagUi.flt='{f}';const L=g.bagEntries();return {{n:L.length,want:g.S.items.filter(it=>{expr}).length,all:L.every(e=>e.it)}}}})()")
            assert o['n']==o['want'] and o['all'], (f,o)
        # 빈 결과 안내
        o=pg.evaluate("(()=>{const g=__g;g.S.bagUi.flt='coll';const keep=g.S.items;g.S.items=keep.filter(g.isEq);g.renderWin();const t=(document.querySelector('.iempty')||{}).textContent;g.S.items=keep;g.S.bagUi.flt='dis';g.renderWin();return t})()")
        assert o and '조건에 맞는 장비가 없다' in o, o
        # 저장 → 새로고침 → 이어하기 뒤에도 유지
        pg.evaluate("__g.save()");pg.reload();pg.wait_for_function('window.__ready===true',timeout=120000)
        pg.click("#btnCont");pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0;__g.openBag()");pg.wait_for_timeout(100)
        o=pg.evaluate("({u:__g.S.bagUi,s:document.querySelector('.ict.isort').textContent,f:document.querySelector('.ict.iflt').textContent})")
        print('유지',o)
        assert o['u']['sort']=='grade' and o['u']['flt']=='dis' and o['s'].startswith('정렬 · 등급') and o['f'].startswith('분해 대상만'), o
        # 옛 세이브(bagUi 없음 · 이상한 값)도 기본값으로
        o=pg.evaluate("(()=>{const g=__g;g.S.bagUi={sort:'zzz'};return g.bagUi()})()")
        assert o=={'sort':'def','flt':'all','cat':'all'}, o
        assert pg.evaluate("document.getElementById('verTag').textContent").startswith('v4.')
        assert not errs, errs
        pg.close()
    b.close()
print('OK bagsort430')
