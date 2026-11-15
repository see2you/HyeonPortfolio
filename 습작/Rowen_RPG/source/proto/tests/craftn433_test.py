"""v4.33 제작 여러 개 한 번에.
- 제작 창 아래 고정 줄: 수량 [−] ×N [+] [최대] · '재료로 최대 M회' → [제작하기 ×N]
- 최대 = 광물 · 도면 · 골드 · 비법서 · 재료 장비가 모두 성공한다고 볼 때 되는 횟수(최대 50)
- N번 시도 · 재료가 떨어지면 멈춤 · 결과 요약(성공 · 실패 · 대성공 · 가장 좋은 것) · 소모량이 1회 × N과 같음
- 재료가 1회분뿐이면 수량 줄을 숨김 · 1280×720 / 960×540 스크롤 없이 보임 (shots/v433_제작수량.png)"""
import os
from playwright.sync_api import sync_playwright
HTML=os.path.abspath('rowen_mmo_local.html')
AUDIT=open(os.path.join(os.path.dirname(__file__),'winaudit427_test.py'),encoding='utf-8').read().split('AUDIT="""')[1].split('"""')[0]
os.makedirs('shots',exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    for vw,vh in [(1280,720),(960,540)]:
        pg=b.new_page(viewport={'width':vw,'height':vh});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
        pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
        assert pg.evaluate("document.getElementById('verTag').textContent").startswith('v4.')
        # 1회분만 → 수량 줄 없음
        pg.evaluate("(()=>{const g=__g,S=g.S;S.gold=10**6;g.addStk('ore1',3);g.addStk(g.dsgKey('armor',1),1);g.openCraft()})()");pg.wait_for_timeout(120)
        assert pg.evaluate("__g.craftMaxN('armor',1,0)")==1 and not pg.query_selector('.cfq'), '1회분인데 수량 줄'
        # 광물 20 · 도면 7 · 골드 충분 → 최대 = min(20/3, 7) = 6
        pg.evaluate("(()=>{const g=__g,S=g.S;g.addStk('ore1',17);g.addStk(g.dsgKey('armor',1),6);g.closeWin();g.openCraft()})()");pg.wait_for_timeout(120)
        mx=pg.evaluate("__g.craftMaxN('armor',1,0)");assert mx==6, mx
        pg.click('.cfq .tgb:has-text("최대")');pg.wait_for_timeout(80)
        r=pg.evaluate("""(()=>{const q=document.querySelector('.cfq'),go=document.querySelector('.cfact .cfgo'),rs=[...q.querySelectorAll('button')].concat([go]).map(x=>x.getBoundingClientRect()),w=document.querySelector('.cfp').getBoundingClientRect();
          return {v:q.querySelector('.tgv').textContent,go:go.textContent,inside:rs.every(r=>r.left>=w.left-1&&r.right<=w.right+1&&r.bottom<=innerHeight),ov:q.scrollWidth-q.clientWidth}})()""")
        print(vw,vh,r);assert r['v']=='×6' and r['go']=='제작하기 ×6' and r['inside'] and r['ov']<=0, r
        assert pg.evaluate(AUDIT+"('#win')")==[], '스크롤해야 보이는 버튼'
        if vw==1280: pg.screenshot(path='shots/v433_제작수량.png')
        o0=pg.evaluate("(()=>{const g=__g,S=g.S;return {ore:g.cnt('ore1'),d:g.cnt(g.dsgKey('armor',1)),gold:S.gold,n:S.items.length,c:g.CRAFT_EQ[0]}})()")
        pg.click('.cfact .cfgo');pg.wait_for_timeout(120)
        if vw==1280: pg.screenshot(path='shots/v433_제작결과.png')
        o1=pg.evaluate("(()=>{const g=__g,S=g.S;return {ore:g.cnt('ore1'),d:g.cnt(g.dsgKey('armor',1)),gold:S.gold,n:S.items.length,fx:(document.querySelector('.encfx.cfsum')||{}).textContent||'',N:g.cfN}})()")
        print(o1)
        assert o0['ore']-o1['ore']==6*3 and o0['d']-o1['d']==6 and o0['gold']-o1['gold']==6*(20+30) and o1['n']-o0['n']==6, (o0,o1)
        assert '제작 ×6' in o1['fx'] and '성공 6' in o1['fx'] and o1['N']==1, o1
        # 재료 장비 · 비법서가 있는 등급: 희귀(고급 1개 + rcp2), 실패해도 재료 장비는 남음 → 더 시도 가능, 재료가 떨어지면 멈춤
        o=pg.evaluate("""(()=>{const g=__g,S=g.S;S.items=S.items.filter(g.isEq);g.addStk('ore1',100);g.addStk(g.dsgKey('helm',1),20);g.addStk('rcp2',4);
          for(let i=0;i<3;i++)S.items.push(g.newItem('helm',1,1));const mx=g.craftMaxN('helm',1,2);const r=g.craftBatch('helm',1,2,10);
          return {mx,tries:r.tries,ok:r.ok,fail:r.fail,stop:r.stop,rcp:g.cnt('rcp2'),mats:g.craftMats('helm',1,1,99).length}})()""")
        print(o);assert o['mx']==3 and 3<=o['tries']<=4 and o['ok']+o['fail']==o['tries'] and o['rcp']==4-o['tries'] and o['mats']==3-o['ok'] and (o['rcp']==0 or o['mats']==0) and o['stop'], o
        assert pg.evaluate("__g.craftMaxN('helm',1,2)")==0
        print('ERRORS',errs or 'none');assert not errs
        pg.close()
    b.close()
print('OK')
