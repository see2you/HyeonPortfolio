"""v4.29 목표 단계까지 연속 강화 · 창 사이 단축키 전환.
- 강화 창 동작 줄(아래 고정)에 [목표 − +N +] [+N까지 연속 강화] · 평균 비용 줄이 있고, 1280×720 · 960×540에서 스크롤 없이 보인다
- 평균 시도 수 계산(연속 실패 보정 포함)이 몬테카를로와 맞는다
- 누르면 목표에 도달하거나 재료가 떨어진 곳에서 멈춘다 · 실패해도 단계는 내려가지 않는다
- 창이 열린 상태에서 J/U/O/I 키로 다른 창으로 바로 바뀐다 (shots/v429_목표강화.png)"""
import os,random
from playwright.sync_api import sync_playwright
HTML=os.path.abspath('rowen_mmo_local.html')
AUDIT=open(os.path.join(os.path.dirname(__file__),'encbtn426_test.py'),encoding='utf-8').read().split('AUDIT="""')[1].split('"""')[0]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    for vw,vh in [(1280,720),(960,540)]:
        pg=b.new_page(viewport={'width':vw,'height':vh});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
        pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
        pg.evaluate("""(()=>{const g=__g,S=g.S;S.stone=400;S.gold=900000;for(const [k,t,gr] of [['weapon',2,2],['armor',1,1],['ring',1,0]]){const it=g.newItem(k,t,gr);S.items.push(it);g.equipItem(it.u);}g.addStk('bls',2);g.openEnchant();})()""");pg.wait_for_timeout(200)
        r=pg.evaluate("""(()=>{const A=document.querySelector('.enact'),I=document.querySelector('.enpi'),tg=A.querySelector('.entg'),bs=[...A.querySelectorAll('button')];
          return {tg:!!tg,tv:tg&&tg.querySelector('.tgv').textContent,go:tg&&tg.querySelector('.btn').textContent,exp:(A.querySelector('.enexp')||{}).textContent,bot:Math.max(...bs.map(x=>x.getBoundingClientRect().bottom)),inScroll:bs.some(x=>I.contains(x)),ver:document.getElementById('verTag').textContent}})()""")
        print(vw,vh,r)
        assert r['tg'] and r['tv']=='+5' and r['go']=='+5까지 연속 강화', r   # 안전 단계 아래 → 기본 목표 = 안전 단계
        assert r['exp'].startswith('평균 5.0회'), r['exp']
        assert r['bot']<=vh and not r['inScroll']
        assert r['ver']=='v4.29'
        assert pg.evaluate(AUDIT)==[], '강화 창에 스크롤해야 보이는 버튼'
        # 목표 +8로 올림
        for _ in range(3): pg.click('.entg .tgb:nth-of-type(2)');pg.wait_for_timeout(50)
        assert pg.locator('.entg .tgv').text_content()=='+8'
        if vw==1280: pg.screenshot(path='shots/v429_목표강화.png')
        assert pg.evaluate(AUDIT)==[]
        # 평균 시도 수 = 몬테카를로 (무기 +5→+8: 70/60/50%, 3회 실패마다 +5%p)
        ex=pg.evaluate("(()=>{const g=__g,it=g.itemById(g.S.eq.weapon);const c=Object.assign({},it,{en:5,ff:0});return g.encExpect(c,8)})()")
        def mc():
            tot=0
            for _ in range(40000):
                for base in (.7,.6,.5):
                    ff=0
                    while True:
                        tot+=1
                        if random.random()<min(1,base+(ff//3)*.05): break
                        ff+=1
            return tot/40000
        m=mc();print('평균 시도',round(ex['tries'],3),'MC',round(m,3));assert abs(ex['tries']-m)<0.05
        # 누르면 +8 도달 (재료 충분)
        s0=pg.evaluate("__g.S.stone");pg.click('.entg .btn');pg.wait_for_timeout(100)
        en=pg.evaluate("__g.itemById(__g.S.eq.weapon).en");assert en==8,en
        assert pg.evaluate("__g.S.stone")<s0
        # 재료가 모자라면 거기서 멈춘다 (단계는 내려가지 않음)
        pg.evaluate("__g.S.stone=3;__g.openEnchant()");pg.wait_for_timeout(50)
        rr=pg.evaluate("(()=>{const g=__g,it=g.itemById(g.S.eq.weapon);return g.encToTarget(it,10)})()")
        print('모자람',rr);assert not rr['hit'] and rr['to']>=8 and pg.evaluate("__g.S.stone")<pg.evaluate("__g.enchCost(__g.itemById(__g.S.eq.weapon)).stone")
        # 창 사이 단축키 전환: 강화 창에서 U → 제작, O → 컬렉션, O → 닫힘, I → 가방, J → 강화
        pg.keyboard.press('KeyU');pg.wait_for_timeout(80);assert pg.evaluate("__g.win&&__g.win.id")=='craft'
        pg.keyboard.press('KeyO');pg.wait_for_timeout(80);assert pg.evaluate("__g.win&&__g.win.id")=='coll'
        pg.keyboard.press('KeyO');pg.wait_for_timeout(80);assert pg.evaluate("__g.win")is None
        pg.keyboard.press('KeyI');pg.wait_for_timeout(80);pg.keyboard.press('KeyJ');pg.wait_for_timeout(80);assert pg.evaluate("__g.win&&__g.win.id")=='enc'
        print('ERRORS',errs or 'none');assert not errs
        pg.close()
    b.close()
print('OK')
