"""v4.14 강화 창 · 광물/도면 제작 · 스크롤 유지 · 상단 골드 · 창 크기 검사 (shots/v414_*.png)"""
import os,sys
from playwright.sync_api import sync_playwright
HTML=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else 'rowen_mmo_local.html');os.makedirs('shots',exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    pg=b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    r=pg.evaluate("""(()=>{const g=__g,S=g.S;S.lv=12;S.gold=5000;S.stone=30;g.addStk('ore1',30);g.addStk('dw1',2);g.addStk('da1',3);g.addStk('bls',1);
      const c1=g.craftItem('weapon',1,0),c2=g.craftItem('armor',1,0);g.equipItem(c1.it.u);g.equipItem(c2.it.u);
      const w=c1.it;const e1=g.enchant(w.u,false);const cost=g.enchCost(w);const e2=g.enchant(w.u,true);
      return {ore:g.cnt('ore1'),dw:g.cnt('dw1'),en:w.en,stone:S.stone,cost,top:document.getElementById('goldTop').textContent}})()""")
    print('econ',r)
    pg.evaluate("__g.step(4,.05);__g.render()")
    pg.evaluate("__g.openEnchant()");pg.wait_for_timeout(200);pg.screenshot(path='shots/v414_강화.png')
    pg.evaluate("__g.closeWin();__g.openCraft()");pg.wait_for_timeout(200);pg.screenshot(path='shots/v414_제작.png')
    pg.evaluate("__g.closeWin();__g.openBag()");pg.wait_for_timeout(200);pg.screenshot(path='shots/v414_가방.png')
    # 스킬 창 스크롤 유지
    pg.evaluate("__g.closeWin();__g.openSkills()");pg.wait_for_timeout(200)
    sc=pg.evaluate("""(()=>{const B=document.getElementById('wBody');const els=[...B.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+4&&getComputedStyle(e).overflowY!=='visible');const e=els[0];if(!e)return 'no scroller';e.scrollTop=120;const st0=e.scrollTop;
      const cards=[...e.querySelectorAll('button')];cards[3]&&cards[3].click();const e2=[...document.getElementById('wBody').querySelectorAll('*')].filter(x=>x.scrollHeight>x.clientHeight+4&&getComputedStyle(x).overflowY!=='visible')[0];return [st0,e2&&e2.scrollTop]})()""")
    print('skill scroll',sc)
    pg.evaluate("__g.closeWin()")
    for (w,h,n) in [(900,900,'정사각'),(700,1000,'세로'),(1600,600,'가로')]:
        pg.set_viewport_size({'width':w,'height':h});pg.wait_for_timeout(200);pg.evaluate("__g.openBag();__g.render()");pg.wait_for_timeout(200);pg.screenshot(path=f'shots/v414_창_{n}.png');pg.evaluate("__g.closeWin()")
    print("ERRORS",errs or "none");b.close()
