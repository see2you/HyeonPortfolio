"""v4.8 중반 상태 화면 확인 — Lv24 · 카르도 개방 · 여러 등급 장비 · 툴팁 · 강화 모드 · 2차 스킬 탭"""
import sys,os
from playwright.sync_api import sync_playwright
HTML=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else 'rowen_mmo_local.html');OUT=sys.argv[2] if len(sys.argv)>2 else 'shots'
os.makedirs(OUT,exist_ok=True)
SETUP="""(()=>{const g=__g,S=g.S;S.lv=24;S.maps=['rowen','kardo'];S.kp=3;S.sp=6;S.gold=12345;S.books={dash:true,roar:true,quake:true};
 S.sk={whirl:5,dash:4,star:5,roar:4,quake:3,guard:1};g.autoSlots();
 const mk=(k,t,gr,en)=>{const it=g.newItem(k,t,gr);it.en=en||0;S.items.push(it);return it;};
 for(const [k,t,gr,en] of [['weapon',3,2,7],['helm',3,1,4],['armor',3,3,5],['cloak',2,1,0],['gloves',3,0,2],['boots',3,2,3],['neck',3,4,0],['ring',3,1,0],['ring',2,2,0]]){g.equipItem(mk(k,t,gr,en).u,true);}
 for(const [k,t,gr] of [['weapon',4,3],['armor',4,0],['helm',2,0],['boots',4,1],['ring',4,2],['gloves',3,1],['cloak',3,2],['neck',2,0],['weapon',2,0],['armor',3,4]])mk(k,t,gr,0);
 g.addStk('wsc',4);g.addStk('asc',6);S.stone=37;S.shard=55;S.hpPot=17;S.mpPot=8;g.addStk('book_quake',0);S.qs='active';
})()"""
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    pg=b.new_page(viewport={'width':1280,'height':720});errs=[]
    pg.on('pageerror',lambda e:errs.append('PAGE '+str(e)));pg.on('console',lambda m:m.type=='error' and errs.append('CON '+m.text))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(500);pg.evaluate("window.requestAnimationFrame=()=>0")
    pg.evaluate(SETUP)
    def shot(n): pg.evaluate("__g.step(1,0.05);__g.snap();__g.render()");pg.screenshot(path=f'{OUT}/{n}.png')
    shot('mid_hud')
    pg.evaluate("__g.openBag()");pg.wait_for_timeout(100)
    cells=pg.query_selector_all('.grid .cell:not(.empty)');print('cells',len(cells))
    cells[10].click();pg.wait_for_timeout(100);shot('mid_bag_tip')
    pg.evaluate("__g.closeWin();__g.openBag('wsc')");pg.wait_for_timeout(100);shot('mid_bag_enc')
    pg.click('.dcol .eqs.encok');pg.wait_for_timeout(250);pg.screenshot(path=f'{OUT}/mid_bag_encfx.png')
    pg.evaluate("__g.closeWin();__g.openSkills('guard')");pg.wait_for_timeout(100);shot('mid_skills')
    pg.evaluate("__g.closeWin();__g.openStats()");pg.click('.srow:nth-child(1) .sbt:last-child');pg.click('.srow:nth-child(3) .sbt:last-child');pg.wait_for_timeout(100);shot('mid_stats')
    print('wpct',pg.evaluate("Math.round(__g.wPct()*100)"),'cp',pg.evaluate("__g.cpOf()"))
    print('ERRORS',errs[:8] or 'none');b.close()
