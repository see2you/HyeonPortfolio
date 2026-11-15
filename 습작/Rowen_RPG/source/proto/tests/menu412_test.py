"""v4.12 메뉴(☰) · 레드닷 · 시련 하나만 · 일괄 제작 · 일괄 등록 검사 (shots/v412_*.png)"""
import os,sys
from playwright.sync_api import sync_playwright
HTML=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else 'rowen_mmo_local.html');os.makedirs('shots',exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    pg=b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    # 시련: 셋 열림 → 카드 하나
    pg.evaluate("""(()=>{const g=__g,S=g.S;S.qi=5;S.qs='avail';S.lv=8;S.sp=3;S.stone=60;S.gold=5000;for(const id of ['ga','gr','gz'])S.sq[id]={st:'avail',n:0};
      for(let i=0;i<4;i++)S.items.push(g.newItem('ring',1,0));for(let i=0;i<2;i++)S.items.push(g.newItem('weapon',1,0),g.newItem('armor',1,0));})()""")
    pg.evaluate("__g.step(30,0.05);__g.render()")
    t1=pg.evaluate("[...document.querySelectorAll('.qe .tt')].map(e=>e.textContent)");print('trials before',t1)
    assert sum('시련' in x for x in t1)==1
    pg.evaluate("__g.acceptSub('gz');__g.step(4,0.05)")
    t2=pg.evaluate("[...document.querySelectorAll('.qe .tt')].map(e=>e.textContent)");print('trials after',t2)
    assert sum('시련' in x for x in t2)==1 and any('제우스' in x for x in t2)
    # 메뉴 레드닷
    d=pg.evaluate("({menu:document.getElementById('bMenu').classList.contains('dot'),stat:document.getElementById('bStat').classList.contains('dot'),coll:document.getElementById('bColl').classList.contains('dot'),craft:document.getElementById('bCraft').classList.contains('dot'),hidden:document.getElementById('menuPop').hidden})")
    print('dots',d);assert d['menu'] and d['stat'] and d['hidden']
    pg.click('#bMenu');pg.wait_for_timeout(150);pg.screenshot(path='shots/v412_메뉴.png',clip={'x':700,'y':0,'width':580,'height':260})
    assert not pg.evaluate("document.getElementById('menuPop').hidden")
    pg.click('#bColl');pg.wait_for_timeout(200)
    n=pg.evaluate("__g.collBatchList().length");print('batch list',n)
    pg.screenshot(path='shots/v412_일괄등록.png')
    pg.evaluate("[...document.querySelectorAll('.clbatch .btn')][0].click()");pg.evaluate("[...document.querySelectorAll('.clbatch .btn')][0].click()")
    print('after reg',pg.evaluate("({done:__g.collDoneN(),items:__g.S.items.length})"))
    pg.evaluate("__g.closeWin()")
    pg.evaluate('__g.S.stone=40');pg.click('#bMenu');pg.click('#bCraft');pg.wait_for_timeout(200);pg.screenshot(path='shots/v412_일괄제작.png')
    print("ERRORS",errs or "none");b.close()
