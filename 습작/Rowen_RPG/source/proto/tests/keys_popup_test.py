"""v4.8.6 조작법 팝업: 기본 숨김 → [조작법 보기] 누르면 버튼 위 팝업 → 다시 누르면 닫힘 (데스크톱 클릭 · 터치 탭, 터치는 조이스틱 영역 위에서도 눌려야 함)"""
import sys,os
from playwright.sync_api import sync_playwright
HTML=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else 'rowen_mmo_local.html');OUT=sys.argv[2] if len(sys.argv)>2 else 'shots'
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    for touch in (False,True):
        ctx=b.new_context(viewport={'width':1280,'height':720},has_touch=touch);pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000);pg.evaluate("localStorage.clear()")
        if touch:pg.tap('#btnStart');pg.evaluate("document.body.classList.add('touch');dispatchEvent(new Event('touchstart'))")
        else:pg.click('#btnStart')
        pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
        vis=lambda:pg.evaluate("!document.getElementById('keys').hidden")
        r=[vis()];(pg.tap if touch else pg.click)('#bKeys');pg.wait_for_timeout(100);r.append(vis())
        pg.evaluate("__g.step(1,.05);__g.render()");pg.screenshot(path=f"{OUT}/keys_{'touch' if touch else 'pc'}.png",clip={'x':0,'y':380,'width':560,'height':340})
        (pg.tap if touch else pg.click)('#bKeys');pg.wait_for_timeout(100);r.append(vis())
        print('touch' if touch else 'pc','숨김→열림→닫힘',r,'PASS' if r==[False,True,False] else 'FAIL','ERRORS',errs or 'none');ctx.close()
    b.close()
