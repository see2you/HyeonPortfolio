"""v4.45 보조 강화석 (#3-4e 강화석 잉여 → 소비처).
- 안전 구간 위 장비에만 '보조 강화석 [없음 · +5%p · +10%p · +15%p]' 줄이 보이고(안전 구간 · 축복 주문서 사용 중엔 없음), 1280×720 · 960×540에서 동작 버튼이 스크롤 없이 보인다
- 단계 k: 강화석 ×(1+k) · 확률 +5%p×k(최대 95%) · 골드 그대로 · 선택은 저장(S.encAid)
- 강화 1회가 실제로 보조분까지 강화석을 쓰고 STAT.aidSt에 쌓인다 · 축복 주문서 강화는 보조를 쓰지 않는다
- 평균 미리 보기(encExpect)가 보조를 반영한다(시도 수 ↓ · 강화석 ↑ · 골드 ↓), 몬테카를로와 맞는다
- 안전 구간 아래(+0~+4)는 보조와 무관하게 비용 · 확률이 그대로 (shots/v445_보조강화석.png)"""
import os,random
from playwright.sync_api import sync_playwright
HTML=os.path.abspath('rowen_mmo_local.html')
AUDIT=open(os.path.join(os.path.dirname(__file__),'encbtn426_test.py'),encoding='utf-8').read().split('AUDIT="""')[1].split('"""')[0]
ok=0
def chk(c,msg):
    global ok
    assert c,msg
    ok+=1;print('  ✓',msg)
os.makedirs('shots',exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    for vw,vh in [(1280,720),(960,540)]:
        pg=b.new_page(viewport={'width':vw,'height':vh});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
        pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
        pg.evaluate("""(()=>{const g=__g,S=g.S;S.stone=2000;S.gold=2000000;for(const [k,t,gr] of [['weapon',3,2],['armor',3,1],['ring',2,0]]){const it=g.newItem(k,t,gr);S.items.push(it);g.equipItem(it.u);}
          g.itemById(S.eq.weapon).en=6;g.itemById(S.eq.armor).en=2;g.addStk('bls',3);g.openEnchant(S.eq.weapon);})()""");pg.wait_for_timeout(200)
        r=pg.evaluate("""(()=>{const a=document.querySelector('.enaid');return {has:!!a,bs:a?[...a.querySelectorAll('.aidb')].map(x=>x.textContent):[],on:a&&a.querySelector('.aidb.on').textContent,ver:document.getElementById('verTag').textContent}})()""")
        print(vw,vh,r)
        chk(r['has'] and r['bs']==['없음','+5%p','+10%p','+15%p'] and r['on']=='없음','+6 무기: 보조 줄 4칸 · 기본 없음')
        chk(r['ver'].startswith('v4.'),'버전 표시')
        g=lambda e:pg.evaluate(e)
        base=g("(()=>{const it=__g.itemById(__g.S.eq.weapon);return {c:__g.enchCost(it,0),r:__g.enchRate(it,0)}})()")
        for k in range(4):
            v=g(f"(()=>{{const it=__g.itemById(__g.S.eq.weapon);return {{c:__g.enchCost(it,{k}),r:__g.enchRate(it,{k})}}}})()")
            chk(v['c']['stone']==base['c']['stone']*(1+k) and v['c']['gold']==base['c']['gold'] and abs(v['r']-(base['r']+.05*k))<1e-9,f'단계 {k}: 강화석 ×{1+k} · 골드 같음 · 확률 +{5*k}%p')
        chk(abs(g("__g.enchRate({k:'weapon',en:9,ff:30},3)")-1)<1e-9 or g("__g.enchRate({k:'weapon',en:9,ff:30},3)")<=1,'확률 상한 100% 넘지 않음')
        chk(abs(g("__g.enchRate({k:'weapon',en:9,ff:0},3)")-.5)<1e-9,'+9 무기 35% + 보조 3 = 50%')
        chk(g("__g.enchRate({k:'weapon',en:9,ff:30},3)")<=1 and abs(g("__g.enchRate({k:'weapon',en:9,ff:30},3)")-.95)<1e-9,'연속 실패로 85%일 때 보조 3 → 95% 상한')
        # 클릭으로 +15%p 선택 → 저장 · 표시
        pg.click('.enaid .aidb:nth-of-type(4)');pg.wait_for_timeout(60)
        chk(g("__g.S.encAid")==3 and pg.locator('.enaid .aidb.on').text_content()=='+15%p','클릭 → S.encAid=3 · 켜짐 표시')
        chk('보조 +15%p' in pg.locator('.enrate small').text_content() and pg.locator('.enrate b').text_content()==str(round((base['r']+.15)*100))+'%','확률 칸 = 합친 확률 · 보조 표기')
        need=pg.locator('.cfn .cfm').first.text_content();chk(need.endswith('/ '+str(base['c']['stone']*4)),'재료 줄 강화석 = ×4 ('+need+')')
        chk(pg.evaluate(AUDIT)==[],'스크롤해야 보이는 버튼 없음')
        bot=g("Math.max(...[...document.querySelectorAll('.enact button')].map(x=>x.getBoundingClientRect().bottom))");chk(bot<=vh,'동작 버튼 화면 안')
        if vw==1280: pg.screenshot(path='shots/v445_보조강화석.png')
        # 강화 1회 → 보조분 소모 · STAT
        s0=g("__g.S.stone");g("__g.enchant(__g.S.eq.weapon,false)")
        chk(s0-g("__g.S.stone")==base['c']['stone']*4 and g("__g.STAT.aidSt")==base['c']['stone']*3,'강화 1회: 강화석 ×4 소모 · STAT.aidSt +보조분')
        # 축복 주문서: 안전 위에서도 보조 안 씀
        g("(()=>{const it=__g.itemById(__g.S.eq.weapon);it.en=7;it.ff=0})()");s1=g("__g.S.stone");a1=g("__g.STAT.aidSt")
        ck=g("__g.enchCheck(__g.itemById(__g.S.eq.weapon),true)");g("__g.enchant(__g.S.eq.weapon,true)")
        chk(ck['c']['aid']==0 and g("__g.S.stone")==s1 and g("__g.STAT.aidSt")==a1,'축복 주문서 강화는 보조 없음')
        # 평균 미리 보기: 보조 3 vs 0
        g("(()=>{const it=__g.itemById(__g.S.eq.weapon);it.en=5;it.ff=0})()")
        e3=g("(()=>{__g.S.encAid=3;return __g.encExpect(__g.itemById(__g.S.eq.weapon),10)})()");e0=g("(()=>{__g.S.encAid=0;return __g.encExpect(__g.itemById(__g.S.eq.weapon),10)})()")
        print('  +5→+10 보조0',{k:round(v,1) for k,v in e0.items()},'보조3',{k:round(v,1) for k,v in e3.items()})
        chk(e3['tries']<e0['tries'] and e3['stone']>e0['stone'] and e3['gold']<e0['gold'],'보조 3: 시도 ↓ · 강화석 ↑ · 골드 ↓')
        def mc():
            tot=0
            for _ in range(30000):
                for base_ in (.7,.6,.5,.4,.35):
                    ff=0
                    while True:
                        tot+=1
                        b0=min(1,base_+(ff//3)*.05)
                        if random.random()<min(max(b0,.95),b0+.15): break
                        ff+=1
            return tot/30000
        m=mc();print('  평균 시도',round(e3['tries'],3),'MC',round(m,3));chk(abs(e3['tries']-m)<0.05,'보조 3 평균 시도 = 몬테카를로')
        # 안전 구간 아래: 그대로 · 보조 줄 없음
        g("__g.S.encAid=3;__g.openEnchant(__g.S.eq.armor)");pg.wait_for_timeout(60)
        a=g("(()=>{const it=__g.itemById(__g.S.eq.armor);return {c:__g.enchCost(it),c0:__g.enchCost(it,0),r:__g.enchRate(it)}})()")
        chk(a['c']['stone']==a['c0']['stone'] and a['r']==1 and g("!document.querySelector('.enaid')"),'+2 갑옷(안전 구간): 비용 · 확률 그대로 · 보조 줄 없음')
        # 축복 체크 중엔 보조 줄 없음
        g("__g.openEnchant(__g.S.eq.weapon)");pg.wait_for_timeout(60);pg.click('.enbl input');pg.wait_for_timeout(60)
        chk(g("!document.querySelector('.enaid')"),'축복 주문서 사용 중엔 보조 줄 없음')
        # 세이브 → 다시 읽기
        g("__g.save()");chk(g("JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>localStorage.getItem(k).includes('encAid')))||'{}').encAid")==3,'S.encAid 저장')
        print('ERRORS',errs or 'none');chk(not errs,'페이지 오류 없음')
        pg.close()
    b.close()
print('OK',ok)
