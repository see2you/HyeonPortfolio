"""v4.19 제작 레드닷: 부위 · 단계 · 등급 버튼에 '만들 수 있고 착용보다 좋은' 조합 표시, 창을 열면 그 조합 선택 (shots/v419_*.png)"""
import os
from playwright.sync_api import sync_playwright
HTML=os.path.abspath('rowen_mmo_local.html')
DOTS="({k:[...document.querySelectorAll('.cfs')][0].querySelectorAll('.cfb.dot').length,kn:[...[...document.querySelectorAll('.cfs')][0].querySelectorAll('.cfb.dot')].map(b=>b.textContent),t:[...[...document.querySelectorAll('.cfs')][1].querySelectorAll('.cfb.dot')].map(b=>b.textContent),g:[...[...document.querySelectorAll('.cfs')][2].querySelectorAll('.cfb.dot')].map(b=>b.textContent),sel:[...document.querySelectorAll('.cfb.on')].map(b=>b.textContent),ok:!!document.querySelector('.cfok'),hint:__g.craftHint()})"
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':1288,'height':700});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    # 재료 없음 → 점 없음
    pg.evaluate("__g.S.gold=0;__g.openCraft()");pg.wait_for_timeout(150);d0=pg.evaluate(DOTS);print('none',d0);assert d0['k']==0 and not d0['hint']
    # 로웬 광물·방어구 도면·골드만 → 방어구 부위만, 일반/고급만
    pg.evaluate("__g.closeWin();const S=__g.S;S.gold=2000;__g.addStk('ore1',20);__g.addStk(__g.dsgKey('armor',1)||'da1',3);__g.openCraft()");pg.wait_for_timeout(150)
    d1=pg.evaluate(DOTS);print('armor',d1);assert d1['hint'] and d1['k']>0 and d1['ok'] and d1['g'] and all('비법서' not in x for x in d1['g'])
    pg.screenshot(path='shots/v419_제작레드닷.png')
    # 무기 부위 누르면 점 없는 상태 · 등급 점 없음
    pg.evaluate("[...[...document.querySelectorAll('.cfs')][0].querySelectorAll('.cfb')][0].click()");pg.wait_for_timeout(100);d2=pg.evaluate(DOTS);print('weapon',d2);assert not d2['g'] and not d2['ok']
    print('ERRORS',errs or 'none');b.close()
