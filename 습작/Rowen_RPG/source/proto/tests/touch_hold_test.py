"""v4.8.1 회귀 테스트: 능력치 +를 한 번 탭하면 1만 오르고, 길게 누르면 연속 입력 후 떼면 멈추며, 그 뒤 설정 창 버튼이 터치로 동작하는지"""
import sys,os
from playwright.sync_api import sync_playwright
HTML=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else 'rowen_mmo_local.html')
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    ctx=b.new_context(viewport={'width':1280,'height':720},has_touch=True);pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")  # 소프트웨어 WebGL 렌더가 타이머를 밀지 않게
    pg.evaluate("__g.S.sp=30;__g.openStats()");pg.wait_for_timeout(100)
    used=lambda: pg.evaluate("30-(+document.querySelector('.wpt b').textContent)")
    pg.tap('.srow:nth-child(1) .sbt:last-child');pg.wait_for_timeout(1500);r1=used()
    box=pg.query_selector('.srow:nth-child(2) .sbt:last-child').bounding_box();x,y=box['x']+box['width']/2,box['y']+box['height']/2
    pg.mouse.move(x,y);pg.mouse.down();pg.wait_for_timeout(1500);pg.mouse.up();pg.wait_for_timeout(100);r2=used();pg.wait_for_timeout(1200);r3=used()
    pg.evaluate("__g.closeWin();__g.openSettings()");pg.wait_for_timeout(200)
    before=pg.evaluate("__g.S.cfg.scan");pg.tap('.srw:nth-child(2) .opt:nth-child(3)');pg.wait_for_timeout(200);after=pg.evaluate("__g.S.cfg.scan")
    print(f'탭 1회 후 사용 포인트 {r1} (기대 1) · 길게 누름 떼자마자 {r2} → 1.2초 뒤 {r3} (같아야 함) · 설정 타겟 범위 {before}→{after} (far 기대)')
    ok=r1==1 and r2==r3 and r2>2 and after=='far';print('RESULT','PASS' if ok else 'FAIL');print('ERRORS',errs or 'none');b.close()
