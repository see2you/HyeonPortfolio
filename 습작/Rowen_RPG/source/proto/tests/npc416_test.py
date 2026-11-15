"""v4.16 NPC 목록(미니맵 NPC 버튼) · 팝업 닫기(× · 바깥 터치) 검사 (shots/v416_*.png)"""
import os,sys
from playwright.sync_api import sync_playwright
HTML=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else 'rowen_mmo_local.html');os.makedirs('shots',exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    pg=b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    pg.click('#bNpc');pg.wait_for_timeout(150)
    print('npc list',pg.evaluate("[...document.querySelectorAll('#npcPop .npr')].map(r=>r.querySelector('span').innerText)"))
    pg.evaluate("__g.step(2,.05);__g.render()");pg.screenshot(path='shots/v416_NPC목록.png')
    pg.evaluate("[...document.querySelectorAll('#npcPop .npr')].find(r=>r.innerText.includes('상점')).querySelector('.btn').click()")
    print('nav',pg.evaluate("__g.nav&&__g.nav.label"),'closed',pg.evaluate("document.getElementById('npcPop').hidden"))
    pg.evaluate("__g.step(400,.05)");print('modal',pg.evaluate("__g.modal&&__g.modal.name"))
    pg.evaluate("__g.modal&&__g.modal.btns&&document.querySelector('#dlgA .btn.alt')&&document.querySelector('#dlgA .btn.alt').click()")
    # 팝업 닫기
    pg.evaluate("__g.closeWin&&0;__g.S.qi=8;__g.openCraft()");pg.wait_for_timeout(150)
    pg.evaluate("document.querySelectorAll('.cfn .infob')[0].click()");pg.wait_for_timeout(100)
    a=pg.evaluate("!document.getElementById('itip').hidden");pg.click('.tipx');b2=pg.evaluate("document.getElementById('itip').hidden")
    pg.evaluate("document.querySelectorAll('.cfn .infob')[0].click()");pg.wait_for_timeout(100);pg.mouse.click(200,200);c=pg.evaluate("document.getElementById('itip').hidden")
    print('tip open',a,'x closes',b2,'outside closes',c)
    print("ERRORS",errs or "none");b.close()
