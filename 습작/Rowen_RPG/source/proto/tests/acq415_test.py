"""v4.15 제작 재료 (i) · 얻는 곳 팝업 검사 (shots/v415_*.png)"""
import os,sys
from playwright.sync_api import sync_playwright
HTML=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else 'rowen_mmo_local.html');os.makedirs('shots',exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    pg=b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    pg.evaluate("__g.S.qi=8;__g.openCraft()");pg.wait_for_timeout(200)
    n=pg.evaluate("document.querySelectorAll('.cfn .infob').length");print('info buttons',n)
    for i,name in enumerate(['광물','도면','골드']):
        pg.evaluate(f"document.querySelectorAll('.cfn .infob')[{i}].click()");pg.wait_for_timeout(150)
        print(name,pg.evaluate("document.getElementById('itip').innerText.replace(/\\n/g,' | ').slice(0,260)"))
        if i<2:pg.screenshot(path=f'shots/v415_얻는곳_{name}.png')
    pg.evaluate("document.querySelectorAll('.cfn .cfml')[1].click()");pg.wait_for_timeout(100);print('label click',pg.evaluate("!document.getElementById('itip').hidden"))
    print("ERRORS",errs or "none");b.close()
