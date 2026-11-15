"""v4.22 가방 [일괄 장착] — 부위마다 전투력 점수가 높은 장비를 모두 장착(반지 두 칸), 좋은 장비가 없으면 비활성 (shots/v422_일괄장착.png)"""
import os
from playwright.sync_api import sync_playwright
HTML=os.path.abspath('rowen_mmo_local.html')
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    pg.evaluate("""(()=>{const g=__g,S=g.S;S.cfg.autoEq=false;for(const [k,t,gr] of [['weapon',1,0],['weapon',2,1],['armor',1,0],['armor',2,2],['helm',1,1],['ring',1,0],['ring',1,2],['ring',2,1],['neck',1,0]])S.items.push(g.newItem(k,t,gr));})()""")
    pg.evaluate("__g.openBag()");pg.wait_for_timeout(200)
    b0=pg.evaluate("(()=>{const e=[...document.querySelectorAll('.btn')].find(x=>x.textContent.startsWith('일괄 장착'));return {t:e.textContent,dis:e.disabled,n:__g.equipBetterN(),cp:__g.cpOf()}})()");print('before',b0)
    assert not b0['dis'] and b0['n']>=6
    pg.screenshot(path='shots/v422_일괄장착.png')
    pg.evaluate("[...document.querySelectorAll('.btn')].find(x=>x.textContent.startsWith('일괄 장착')).click()");pg.wait_for_timeout(150)
    a=pg.evaluate("""(()=>{const S=__g.S,e=[...document.querySelectorAll('.btn')].find(x=>x.textContent.startsWith('일괄 장착'));const eq={};for(const s in S.eq){const it=S.eq[s]&&S.items.find(x=>x.u===S.eq[s]);eq[s]=it?[it.t,it.g]:null;}return {eq,dis:e.disabled,n:__g.equipBetterN(),cp:__g.cpOf()}})()""");print('after',a)
    assert a['dis'] and a['n']==0 and a['cp']>b0['cp']
    assert a['eq']['weapon']==[2,1] and a['eq']['armor']==[2,2] and sorted([a['eq']['ring1'],a['eq']['ring2']])==[[1,2],[2,1]]
    print('ERRORS',errs or 'none');b.close()
