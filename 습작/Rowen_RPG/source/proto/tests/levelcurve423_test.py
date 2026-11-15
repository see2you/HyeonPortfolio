"""v4.23 레벨 곡선 재조정 — 구간 배수 XP_K로 필요 경험치 증가 · 3레벨 이상 낮은 몬스터 경험치 감소(−15%/레벨, 최저 20%) · 레벨 기준 서브(lv1 28 · lv2 37) · 왼쪽 아래 v4.23 (shots/v423_레벨곡선.png)"""
import os
from playwright.sync_api import sync_playwright
HTML=os.path.abspath('rowen_mmo_local.html')
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(400)
    r=pg.evaluate("""(()=>{const g=__g;const n=[];for(let L=1;L<40;L++)n.push(g.need(L));return {n,k:[g.xpK(1),g.xpK(8),g.xpK(20),g.xpK(31),g.xpK(40)],ver:document.getElementById('verTag').textContent,lv1:g.SUBQ.lv1.n,lv2:g.SUBQ.lv2.n}})()""")
    print('k',r['k'],'need1',r['n'][0],'need39',r['n'][-1],'ver',r['ver'])
    assert all(r['n'][i]<r['n'][i+1] for i in range(len(r['n'])-1)), '필요 경험치가 레벨마다 늘어야 함'
    assert abs(r['k'][0]-1)<1e-9 and abs(r['k'][2]-2.7)<1e-9 and abs(r['k'][4]-2.1)<1e-9
    assert r['ver'].startswith('v4.') and r['lv1']==28 and r['lv2']==37
    S="__g.S"
    f=pg.evaluate("(()=>{const g=__g;g.S.lv=20;return [g.xpGapF(22),g.xpGapF(20),g.xpGapF(18),g.xpGapF(15),g.xpGapF(10),g.xpGapF(1)]})()");print('gap',f)
    assert f[0]==1 and f[1]==1 and f[2]==1 and abs(f[3]-.55)<1e-9 and f[4]==.2 and f[5]==.2
    # 실제 처치: Lv20 플레이어가 Lv1~3 몬스터를 잡으면 경험치 20%
    k=pg.evaluate("""(()=>{const g=__g,S=g.S;S.lv=20;S.xp=0;const m=g.mobs.find(m=>!m.dead&&!m.boss&&m.lv<=3);const x0=g.STAT.killXp||0;g.killMob(m);return {got:(g.STAT.killXp||0)-x0,full:m.xp,xp:S.xp}})()""");print('kill',k)
    assert k['got']==round(k['full']*.2) and k['xp']==k['got']
    pg.evaluate("__g.S.lv=1;__g.S.xp=0");pg.wait_for_timeout(300)
    pg.screenshot(path='shots/v423_레벨곡선.png')
    print('ERRORS',errs or 'none');assert not errs;b.close()
