"""v4.24 사냥 중 물약 보충 — 자동 진행 사냥 중 HP 물약이 기준(6) 아래면 사냥을 멈추고 상점에서 보충한 뒤 돌아간다.
자동 진행 중엔 긴급 귀환 설정이 꺼져 있어도 물약 0 · HP 40% 미만이면 귀환한다. (shots/v424_사냥중보충.png)"""
import os
from playwright.sync_api import sync_playwright
HTML=os.path.abspath('rowen_mmo_local.html')
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    # 1) 수련 사냥처럼 긴 사냥: 자동 진행 켜고 들판 사냥 시작, 물약 7개 → 사냥하다 6 아래로 떨어지면 보충하러 간다
    pg.evaluate("""(()=>{const g=__g,S=g.S;S.autoQ=true;S.gold=3000;S.hpPot=7;const z=Object.keys(g.ZALL).find(k=>g.ZALL[k].map==='rowen'&&g.ZALL[k].lv);g.goHunt(z,null,null,'시험 사냥');})()""")
    for _ in range(60):
        pg.evaluate("__g.step(20,0.05)")
        if pg.evaluate("!!__g.hunt"):break
    h=pg.evaluate("({hunt:!!__g.hunt,auto:__g.auto,pot:__g.S.hpPot})");print('hunting',h);assert h['hunt']
    pg.evaluate("__g.S.hpPot=4");pg.evaluate("__g.step(90,0.05)")  # 4초 점검 주기 안
    s=pg.evaluate("({nav:__g.nav&&__g.nav.label,hunt:!!__g.hunt,resup:__g.STAT.resup||0})");print('after low',s)
    assert s['resup']>=1 and s['nav'] and '물약 보충' in s['nav'], s
    pg.evaluate("__g.snap();__g.render()");pg.screenshot(path='shots/v424_사냥중보충.png')
    for _ in range(60):
        pg.evaluate("__g.step(60,0.05)")
        if pg.evaluate("__g.S.hpPot")>=20:break
    e=pg.evaluate("({pot:__g.S.hpPot,gold:__g.S.gold,shop:__g.STAT.shop})");print('bought',e);assert e['pot']>=20 and e['shop']>=1
    pg.evaluate("__g.step(200,0.05)")
    r=pg.evaluate("({nav:__g.nav&&__g.nav.label,hunt:!!__g.hunt})");print('resume',r);assert r['nav'] or r['hunt']
    # 3) 긴급 귀환: 설정 꺼져 있어도 자동 진행 중엔 물약 0 · HP 30%면 주문서로 귀환
    pg.evaluate("""(()=>{const g=__g,S=g.S;S.autoRet=false;S.gold=0;S.hpPot=0;S.scroll=1;const z=Object.keys(g.ZALL).find(k=>g.ZALL[k].map==='rowen'&&g.ZALL[k].lv);g.goHunt(z,null,null,'시험 사냥');})()""")
    for _ in range(40):
        pg.evaluate("__g.step(20,0.05)")
        if pg.evaluate("!!__g.hunt"):break
    pg.evaluate("__g.player.hp=__g.pStats().hp*.3");pg.evaluate("__g.step(30,0.05)")
    q=pg.evaluate("({ret:__g.STAT.ret,scroll:__g.S.scroll})");print('emergency',q);assert q['ret']>=1 and q['scroll']==0
    # 4) 자동 진행 꺼짐 + 설정 꺼짐이면 귀환하지 않는다(기존 동작)
    pg.evaluate("""(()=>{const g=__g,S=g.S;S.autoQ=false;S.scroll=1;S.hpPot=0;const z=Object.keys(g.ZALL).find(k=>g.ZALL[k].map==='rowen'&&g.ZALL[k].lv);g.goHunt(z,null,null,'시험 사냥');})()""")
    for _ in range(40):
        pg.evaluate("__g.step(20,0.05)")
        if pg.evaluate("!!__g.hunt"):break
    r0=pg.evaluate("__g.STAT.ret");pg.evaluate("__g.player.hp=__g.pStats().hp*.3");pg.evaluate("__g.step(30,0.05)")
    q2=pg.evaluate("({ret:__g.STAT.ret,scroll:__g.S.scroll})");print('manual',q2);assert q2['ret']==r0 and q2['scroll']==1
    # 5) 필드 보스 전용 장비: 연속 2번 못 얻으면 3번째 확정 · 장착 중인 사본은 '갖고 있음'으로 치지 않는다
    d=pg.evaluate("""(()=>{const g=__g,S=g.S;S.cfg.autoEq=false;S.items=S.items.filter(x=>!x.bu);S.coll.bc6={1:1};const a=g.newBU('b6a');S.items.push(a);g.equipItem(a.u,true);
      const R=Math.random;Math.random=()=>0.99;const m={field:true,eliteOf:'q6',lv:8,x:g.player.x,y:g.player.y,boss:false};const out=[];
      for(let i=0;i<3;i++){g.dropFrom(m);out.push(S.items.filter(x=>x.bu).map(x=>x.bu+(g.isEq(x)?'*':'')).join(','));}Math.random=R;return {out,miss:S.buMiss.q6};})()""")
    print('pity',d);assert d['out'][0]=='b6a*' and d['out'][1]=='b6a*' and d['out'][2]=='b6a*,b6a' and d['miss']==0
    ver=pg.evaluate("document.body.innerText.includes('v4.24')");print('ver',ver);assert ver
    print('ERRORS',errs or 'none');assert not errs;b.close()
