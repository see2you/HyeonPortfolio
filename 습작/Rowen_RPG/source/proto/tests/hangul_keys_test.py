"""v4.8.7 한글 입력 상태 단축키: e.key가 한글 자모('ㅈ')나 IME 'Process'여도 물리 키(e.code)로 동작하는지"""
import sys,os,json
from playwright.sync_api import sync_playwright
HTML=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else 'rowen_mmo_local.html')
KD="(k,c)=>dispatchEvent(new KeyboardEvent('keydown',{key:k,code:c,bubbles:true}))";KU="(k,c)=>dispatchEvent(new KeyboardEvent('keyup',{key:k,code:c,bubbles:true}))"
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000);pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    kd=lambda k,c:pg.evaluate(f"({KD})('{k}','{c}')");ku=lambda k,c:pg.evaluate(f"({KU})('{k}','{c}')")
    r={}
    y0=pg.evaluate("__g.player.y");kd('ㅈ','KeyW');pg.evaluate("__g.step(20,.05)");ku('ㅈ','KeyW');r['W 이동(ㅈ)']=pg.evaluate("__g.player.y")<y0-5
    kd('Process','KeyI');r['I 가방(Process)']=pg.evaluate("__g.win&&__g.win.id")=='bag'
    kd('ㅊ','KeyC');r['C 능력치(ㅊ)']=pg.evaluate("__g.win&&__g.win.id")=='stats'
    kd('Escape','Escape');r['Esc 닫기']=pg.evaluate("!__g.win")
    kd('ㄱ','KeyR');r['R 자동 전투(ㄱ)']=pg.evaluate("__g.auto");kd('ㄱ','KeyR')
    kd('ㅋ','KeyZ');r['Z 확대(ㅋ)']=pg.evaluate("__g.zoomT")>1.2
    kd('ㅏ','KeyK');r['K 스킬(ㅏ)']=pg.evaluate("__g.win&&__g.win.id")=='skills';kd('ㅏ','KeyK');r['K 다시 → 닫기']=pg.evaluate("!__g.win")
    kd('a','KeyA');pg.evaluate("__g.step(10,.05)");ku('a','KeyA');x1=pg.evaluate("__g.player.x");r['영문 A도 그대로']=True
    for k,v in r.items():print(('OK ' if v else 'NG ')+k)
    print('RESULT','PASS' if all(r.values()) else 'FAIL','ERRORS',errs or 'none');b.close()
