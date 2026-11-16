"""v4.40 가방 레드닷: 장착하면 더 좋은 장비가 있으면 창 [가방] 탭 · 메뉴 [가방] 버튼에 빨간 점, 일괄 장착 후 사라짐"""
import os
from playwright.sync_api import sync_playwright
HTML=os.path.abspath('rowen_mmo_local.html')
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    D="({tab:[...document.querySelectorAll('#wTabs .wtab')].some(x=>x.textContent.startsWith('가방')&&x.classList.contains('dot')),menu:document.getElementById('bBag').classList.contains('dot'),n:__g.equipBetterN()})"
    pg.evaluate("__g.S.cfg.autoEq=false;__g.S.items.forEach(i=>i.nw=false);__g.step(10,.05);__g.openStats()");pg.wait_for_timeout(150);d0=pg.evaluate(D);print('none',d0);assert not d0['tab'] and not d0['menu']
    pg.evaluate("__g.closeWin();const it=__g.newItem('helm',1,1);it.nw=false;__g.S.items.push(it);__g.step(10,.05);__g.openStats()");pg.wait_for_timeout(150);d1=pg.evaluate(D);print('helm',d1);assert d1['tab'] and d1['menu'] and d1['n']==1
    pg.evaluate("__g.batchEquip();__g.step(10,.05);__g.openStats()");pg.wait_for_timeout(150);d2=pg.evaluate(D);print('after',d2,pg.evaluate('__g.S.items.filter(i=>i.nw).map(i=>i.k)'));assert not d2['tab'] and not d2['menu']
    print('ERRORS',errs or 'none');b.close()
