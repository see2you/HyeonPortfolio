"""설정 창의 모든 선택지를 터치(tap)로 눌러 값이 실제로 바뀌는지 확인"""
import sys,os,json
from playwright.sync_api import sync_playwright
HTML=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else 'rowen_mmo_local.html')
STATE="JSON.stringify({cfg:__g.S.cfg,autoPot:__g.S.autoPot,autoBuy:__g.S.autoBuy,autoRet:__g.S.autoRet,autoQ:__g.S.autoQ,autoGrow:__g.S.autoGrow,vol:__g.VOL_ON,zoom:__g.zoomT})"
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    ctx=b.new_context(viewport={'width':1280,'height':720},has_touch=True);pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    pg.tap('#bMenu');pg.wait_for_timeout(150);pg.tap('#bSet');pg.wait_for_timeout(200);print('설정 창 열림(메뉴 → 설정 탭):',pg.evaluate("__g.win&&__g.win.id"))
    rows=pg.evaluate("[...document.querySelectorAll('.srw')].map(r=>[r.querySelector('b').textContent,[...r.querySelectorAll('.opt')].map(o=>o.textContent)])")
    bad=[]
    for ri,(name,opts) in enumerate(rows):
        for oi,o in enumerate(opts):
            before=pg.evaluate(STATE)
            sel=f'.srw >> nth={ri}';btn=pg.locator(sel).locator('.opt').nth(oi)
            was_on='on' in (btn.get_attribute('class') or '')
            btn.scroll_into_view_if_needed();btn.tap();pg.wait_for_timeout(120)
            on=pg.locator(sel).locator('.opt').nth(oi).get_attribute('class')
            after=pg.evaluate(STATE)
            changed=before!=after
            if 'on' not in on or (not was_on and not changed): bad.append((name,o,was_on,changed,on))
    print('행',len(rows),'선택지',sum(len(o) for _,o in rows));print('문제',bad or '없음');print('ERRORS',errs or 'none');b.close()
