"""v4.11 트래커 탭 · 반복 토벌 의뢰 · 서브 다양화 검사 (shots/v411_*.png)"""
import os,sys
from playwright.sync_api import sync_playwright
HTML=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else 'rowen_mmo_local.html');os.makedirs('shots',exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    pg=b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    r=pg.evaluate("""(()=>{const g=__g,S=g.S;S.qi=g.QUESTS.findIndex(q=>q.id==='q10');S.qs='avail';S.lv=13;S.hpPot=0;g.acceptQuest();const subs=Object.keys(S.sq);
      g.acceptRep('rowen');const z=S.rq.zone;for(let i=0;i<20;i++){const m=g.mobs.find(m=>m.zone===z&&!m.dead&&!m.eliteOf);if(m)g.killMob?g.killMob(m):0;}
      return {subs,rq:S.rq,potCard:[...document.querySelectorAll('.qe .tg')].some(e=>e.textContent==='물약')}})()""")
    print('accept',r)
    pg.evaluate("__g.step(5,0.05);__g.snap();__g.render()");pg.screenshot(path='shots/v411_트래커_전체.png')
    pg.evaluate("__g.setQTab('rep');__g.step(2,0.05);__g.render()");pg.screenshot(path='shots/v411_트래커_의뢰.png')
    pg.evaluate("__g.setQTab('sub');__g.step(2,0.05);__g.render()");pg.screenshot(path='shots/v411_트래커_서브.png')
    print('pot card',pg.evaluate("[...document.querySelectorAll('.qe .tg')].map(e=>e.textContent)"))
    print("ERRORS",errs or "none");b.close()
