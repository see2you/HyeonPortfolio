"""v4.26 강화 창 버튼 한 줄 · 아래 고정 — [강화] · [안전 강화까지]가 같은 줄, 스크롤 영역 밖(항상 보이는 동작 줄)에 있고 창 안에 보인다.
1280×720 · 960×540 두 크기로 확인하고, 다른 창들의 '스크롤해야 보이는 버튼'을 점검 목록으로 출력한다 (shots/v426_강화버튼.png)"""
import os
from playwright.sync_api import sync_playwright
HTML=os.path.abspath('rowen_mmo_local.html')
AUDIT="""(()=>{const out=[];const W=document.getElementById('win');for(const b of W.querySelectorAll('button')){if(b.offsetParent===null)continue;const r=b.getBoundingClientRect();
 let p=b.parentElement,hid=false;while(p&&p!==W){const cs=getComputedStyle(p);if(/(auto|scroll)/.test(cs.overflowY)&&p.scrollHeight>p.clientHeight+2){const q=p.getBoundingClientRect();if(r.top<q.top-1||r.bottom>q.bottom+1)hid=true;}p=p.parentElement;}
 if(hid||r.bottom>innerHeight)out.push((b.textContent||'').trim().slice(0,24));}return out;})()"""
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    for vw,vh in [(1280,720),(960,540)]:
        pg=b.new_page(viewport={'width':vw,'height':vh});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
        pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
        pg.evaluate("""(()=>{const g=__g,S=g.S;S.stone=50;S.gold=50000;for(const [k,t,gr] of [['weapon',2,2],['armor',1,1],['ring',1,0],['helm',1,0],['neck',1,0],['boots',1,0]]){const it=g.newItem(k,t,gr);if(!it)continue;S.items.push(it);g.equipItem(it.u);}g.addStk('bls',2);g.openEnchant();})()""");pg.wait_for_timeout(200)
        r=pg.evaluate("""(()=>{const q=s=>[...document.querySelectorAll(s)];const bs=q('.enact .btn');const A=document.querySelector('.enact'),I=document.querySelector('.enpi');
          return {n:bs.length,t:bs.map(x=>x.textContent),tops:bs.map(x=>Math.round(x.getBoundingClientRect().top)),bot:Math.max(...bs.map(x=>x.getBoundingClientRect().bottom)),inScroll:bs.some(x=>I.contains(x)),ver:document.getElementById('verTag').textContent}})()""")
        print(vw,vh,r)
        assert r['n']>=2 and r['t'][0]=='강화' and r['t'][1].startswith('안전 강화까지')
        assert abs(r['tops'][0]-r['tops'][1])<=1, '한 줄이 아님'
        assert r['bot']<=vh and not r['inScroll']
        assert r['ver'].startswith('v4.')
        assert pg.evaluate(AUDIT)==[], '강화 창에 스크롤해야 보이는 버튼'
        if vw==1280: pg.screenshot(path='shots/v426_강화버튼.png')
        # 실제로 누르면 강화된다 (한 줄 버튼 동작)
        en0=pg.evaluate("__g.S.items.find(x=>x.u===__g.S.eq.weapon).en")
        pg.click('.enact .btn.pri');pg.wait_for_timeout(100)
        en1=pg.evaluate("__g.S.items.find(x=>x.u===__g.S.eq.weapon).en");assert en1==en0+1,(en0,en1)
        pg.locator('.enact .btn',has_text='안전 강화까지').click();pg.wait_for_timeout(100)
        assert pg.evaluate("__g.S.items.find(x=>x.u===__g.S.eq.weapon).en")==5
        # 다른 창 점검(실패 아님 — 다음 조각 목록)
        pg.evaluate("__g.closeWin()")
        for nm in ['openBag','openCraft','openColl','openStats','openSkills','openSettings']:
            try:
                pg.evaluate(f"__g.{nm}()");pg.wait_for_timeout(150);hid=pg.evaluate(AUDIT)
                print('  점검',vw,nm,'스크롤해야 보이는 버튼',len(hid),hid[:6])
                pg.evaluate("__g.closeWin&&__g.closeWin()")
            except Exception as e: print('  점검',nm,'열기 실패',str(e)[:80])
        print('ERRORS',errs or 'none');assert not errs
        pg.close()
    b.close()
print('OK')
