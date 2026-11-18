"""v4.78 자동 진행이 창 조작 뒤 멈추지 않는지: 자동 대화 중 창 열기 · 사냥 중 강화/제작/컬렉션 창"""
import os,sys,json
from playwright.sync_api import sync_playwright
HTML=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','rowen_mmo_local.html'))
ST="JSON.stringify({aq:__g.S.autoQ,qi:__g.S.qi,qs:__g.S.qs,modal:!!__g.modal,nav:!!__g.nav,hunt:!!__g.hunt})"
ok=True
def chk(c,m):
    global ok;print(('PASS ' if c else 'FAIL ')+m);ok=ok and c
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':1280,'height':720})
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(500);pg.evaluate("window.requestAnimationFrame=()=>0")
    pg.evaluate("__g.S.autoQ=true;__g.autoNext()")
    for i in range(60):
        pg.evaluate("__g.step(10,.05)")
        if json.loads(pg.evaluate(ST))['modal']:break
    s0=json.loads(pg.evaluate(ST));chk(s0['modal'],'자동 대화가 떴다 '+str(s0))
    pg.evaluate("__g.openBag()");pg.evaluate("__g.step(20,.05)");pg.evaluate("__g.closeWin()")
    for i in range(10):pg.evaluate("__g.step(20,.05)")
    s1=json.loads(pg.evaluate(ST))
    chk(s1['aq'] and (s1['qs']!=s0['qs'] or s1['qi']!=s0['qi'] or s1['nav'] or s1['hunt'] or s1['modal']),'대화 중 가방 연 뒤에도 진행 '+str(s1))
    # 사냥 시작까지 진행
    for i in range(200):
        pg.evaluate("__g.step(10,.05)")
        if json.loads(pg.evaluate(ST))['hunt']:break
    q0=pg.evaluate("__g.S.qi*100+__g.S.qn")
    for f in ['openEnchant','openCraft','openColl','openBag']:
        pg.evaluate(f"__g.{f}()");pg.evaluate("__g.step(20,.05)");pg.evaluate("__g.closeWin()")
    s2=json.loads(pg.evaluate(ST));chk(s2['aq'],'창 4개 열고 닫아도 자동 켜짐 '+str(s2))
    # 강제로 멈춘 상태를 만들어 감시가 다시 잡는지
    pg.evaluate("__g.cancelNav&&__g.cancelNav()") if pg.evaluate("typeof __g.cancelNav")=='function' else None
    for i in range(400):pg.evaluate("__g.step(10,.05)")
    q1=pg.evaluate("__g.S.qi*100+__g.S.qn");chk(q1>q0,f'사냥 중 창 조작 뒤 퀘스트 진척 {q0}→{q1}')
    b.close()
sys.exit(0 if ok else 1)
