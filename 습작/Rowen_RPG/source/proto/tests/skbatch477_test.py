"""v4.77 스킬 [일괄 강화] — 자동 성장 버튼 오른쪽, 스킬서 먼저 쓰고 포인트가 남는 동안 슬롯 스킬 · 낮은 레벨부터 강화 (shots/v477_스킬일괄강화.png)"""
import os
from playwright.sync_api import sync_playwright
HTML=os.path.abspath('rowen_mmo_local.html');os.makedirs('shots',exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    pg.evaluate("(()=>{const S=__g.S;S.autoGrow=false;S.lv=12;S.kp=6;S.qi=8;__g.S.bag.book_dash=1;__g.openSkills();})()");pg.wait_for_timeout(200)
    BT="[...document.querySelectorAll('.btns .btn')].map(x=>[x.textContent,x.disabled])"
    b0=pg.evaluate(BT);n0=pg.evaluate("__g.skBatchN()");print('buttons',b0,'n',n0)
    assert b0[0][0].startswith('자동 성장') and b0[1][0].startswith('일괄 강화') and not b0[1][1] and n0>0
    pg.screenshot(path='shots/v477_스킬일괄강화.png')
    sk0=pg.evaluate("JSON.stringify(__g.S.sk)")
    pg.evaluate("[...document.querySelectorAll('.btns .btn')].find(x=>x.textContent.startsWith('일괄 강화')).click()");pg.wait_for_timeout(150)
    r=pg.evaluate("({kp:__g.S.kp,sk:__g.S.sk,books:__g.S.books,n:__g.skBatchN(),bt:"+BT+"})");print('before',sk0,'after',r)
    assert r['n']==0 and r['bt'][1][1] and (r['kp']==0 or r['n']==0) and r['books'].get('dash')
    print('ERRORS',errs or 'none');b.close()
