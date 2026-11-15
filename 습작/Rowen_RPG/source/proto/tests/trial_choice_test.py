"""v4.17 시련 선택: 자동 진행 켠 상태로 메인 5 보상 → 팝업 없이 메인 계속(시련은 [시련] 탭) → 탭에서 선택 창 → 아테나 선택 → 자동으로 시련 사냥 → 보고 → 다음 시련도 팝업 없음"""
import sys,os,json
from playwright.sync_api import sync_playwright
HTML=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else 'rowen_mmo_local.html');OUT=sys.argv[2] if len(sys.argv)>2 else 'shots'
ST="JSON.stringify({modal:__g.modal&&__g.modal.name,autoQ:__g.S.autoQ,qi:__g.S.qi,qs:__g.S.qs,sq:Object.fromEntries(['ga','gr','gz'].map(k=>[k,__g.S.sq[k]&&__g.S.sq[k].st])),hunt:__g.hunt&&(__g.hunt.sub||__g.hunt.sp),nav:__g.nav&&__g.nav.label,god:__g.S.god})"
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    pg.evaluate("__g.S.qi=4;__g.S.qs='done';__g.S.lv=15;__g.S.autoQ=true;__g.autoNext()")
    for i in range(30):
        pg.evaluate("__g.step(20,.05)")
        if pg.evaluate("__g.S.qi>=5&&__g.S.qs!=='done'"):break
    pg.evaluate("__g.step(60,.05)");s1=json.loads(pg.evaluate(ST));print('1 보상 후(팝업 없이 메인 계속)',s1)
    assert s1['modal'] not in ('신의 시련이 열렸다','다음 신의 시련') and s1['qi']>=5 and all(v=='avail' for v in s1['sq'].values())
    pg.evaluate("__g.closeModal&&__g.closeModal();__g.S.autoQ=true");pg.evaluate("[...document.querySelectorAll('#qtabs .qtb')].find(b=>b.textContent==='시련').click()");pg.evaluate("__g.step(.3,.05)")
    pg.evaluate("document.querySelector('#qlist .qe').click()");pg.evaluate("__g.step(.3,.05)");pg.evaluate("__g.render()");pg.screenshot(path=f'{OUT}/trial_choice.png')
    assert pg.evaluate("!!__g.modal")
    pg.click('#dlgB .si:nth-child(1) .btn');pg.evaluate("__g.step(60,.05)");s3=json.loads(pg.evaluate(ST));print('3 아테나 선택 후',s3);assert s3['sq']['ga']=='active'
    pg.evaluate("__g.S.sq.ga.n=11");
    for i in range(200):
        pg.evaluate("__g.step(20,.05)")
        if pg.evaluate("__g.S.sq.ga.st==='clear'"):break
    pg.evaluate("__g.step(40,.05)");s4=json.loads(pg.evaluate(ST));print('4 시련 완료·보고 후',s4);assert s4['sq']['ga']=='clear' and s4['modal']!='다음 신의 시련'
    print('ERRORS',errs or 'none');b.close()
