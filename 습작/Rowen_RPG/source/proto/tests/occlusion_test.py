"""가림 페이드 확인: 도토리 숲 큰 나무 바로 뒤에 캐릭터·몬스터를 두고 페이드 끔/켬 스크린샷"""
import sys,os
from playwright.sync_api import sync_playwright
HTML=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else 'rowen_mmo_local.html');OUT=sys.argv[2] if len(sys.argv)>2 else 'shots'
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(500);pg.evaluate("window.requestAnimationFrame=()=>0")
    info=pg.evaluate("""(()=>{const g=__g,ts=g.statics.filter(s=>!s.flat&&s.img.height>=60&&s.x>250&&s.x<650&&s.y>1350&&s.y<1700).sort((a,b)=>b.img.height-a.img.height);const T=ts[0];
      g.player.x=T.x+4;g.player.y=T.y-14;const m=g.mobs.find(m=>m.zone==='z2'&&!m.dead);if(m){m.x=T.x+30;m.y=T.y-10;m.home={x:m.x,y:m.y};}document.getElementById('hud').hidden=true;g.S.zoom=1.4;return [T.x,T.y,T.img.height,!!m]})()""")
    print('tree',info)
    for n,k in [('off',0),('on',0.62)]:
        pg.evaluate(f"__g.FADE.uFadeK.value={k};__g.step(3,.02);__g.snap();__g.render();__g.render()")
        pg.screenshot(path=f'{OUT}/occ_{n}.png',clip={'x':390,'y':170,'width':500,'height':380})
    print('ERRORS',errs or 'none');b.close()
