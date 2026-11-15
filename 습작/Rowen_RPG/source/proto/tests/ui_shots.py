"""v4.8 화면 확인: 새 게임 → HUD · 가방 · 능력치 · 스킬 · 설정 스크린샷 + 콘솔 오류"""
import sys,os
from playwright.sync_api import sync_playwright
HTML=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else 'rowen_mmo_local.html');OUT=sys.argv[2] if len(sys.argv)>2 else 'shots'
os.makedirs(OUT,exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    pg=b.new_page(viewport={'width':1280,'height':720});errs=[]
    pg.on('pageerror',lambda e:errs.append('PAGE '+str(e)));pg.on('console',lambda m:m.type=='error' and errs.append('CON '+m.text))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(500);pg.evaluate("window.requestAnimationFrame=()=>0")
    setup=sys.argv[3] if len(sys.argv)>3 else ''
    if setup: pg.evaluate(setup)
    def shot(n): pg.evaluate("__g.step(2,0.05);__g.snap();__g.render()");pg.screenshot(path=f'{OUT}/{n}.png')
    shot('hud')
    for n,js in [('bag',"__g.openBag()"),('stats',"__g.openStats()"),('skills',"__g.openSkills()"),('settings',"__g.openSettings()")]:
        pg.evaluate(js);pg.wait_for_timeout(150);shot(n)
    print('ERRORS',errs[:8] or 'none');b.close()
