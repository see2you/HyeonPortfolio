"""v4.18 퀘스트 트래커 70% 축소 · 메인 외 한 줄 카드 · 구분선 (shots/v418_*.png)"""
import os
from playwright.sync_api import sync_playwright
HTML=os.path.abspath('rowen_mmo_local.html')
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']);errs=[]
    for vw,vh,nm in [(1288,563,'v418_트래커'),(844,390,'v418_트래커_모바일'),(1600,900,'v418_트래커_FHD')]:
        pg=b.new_page(viewport={'width':vw,'height':vh},device_scale_factor=2);pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
        pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
        pg.evaluate("""(()=>{const g=__g,S=g.S;S.qi=5;S.qs='avail';S.lv=11;S.gold=602;g.acceptQuest&&g.acceptQuest();S.sq.sb1={st:'active',n:4};S.sq.gz={st:'active',n:0};S.sq.ga={st:'avail',n:0};S.sq.gr={st:'avail',n:0};})()""")
        pg.evaluate("__g.step(6,0.05);__g.render()");pg.screenshot(path=f'shots/{nm}.png')
        r=pg.evaluate("""(()=>{const q=document.querySelector('.qt').getBoundingClientRect(),hd=document.querySelector('.hud .pf, .prof, #hpT').getBoundingClientRect();
          const one=[...document.querySelectorAll('.qe.one')].map(e=>({h:Math.round(e.getBoundingClientRect().height),qn:(e.querySelector('.qn')||{}).textContent||'',cut:(t=>t.scrollWidth>t.clientWidth)(e.querySelector('.tt'))}));
          return {w:Math.round(q.width),top:Math.round(q.top),hpBottom:Math.round(hd.bottom),secs:document.querySelectorAll('#qlist .qsec').length,secText:[...document.querySelectorAll('#qlist .qsec')].map(e=>e.textContent).join(''),one};})()""")
        print(nm,r);assert r['secText']=='' and r['top']>r['hpBottom'] and any(o['qn']=='0/10' for o in r['one'])
        pg.close()
    print('ERRORS',errs or 'none');b.close()
