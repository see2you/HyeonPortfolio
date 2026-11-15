"""v4.10 신앙 · 보스 전용 장비 · 성장 서브 UI 검사 (스크린샷 shots/v410_*.png)"""
import os,sys
from playwright.sync_api import sync_playwright
HTML=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else 'rowen_mmo_local.html');os.makedirs('shots',exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    pg=b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    # 1) 관문 q6 수락 상태로 → 성장 서브 수락 · 지급 · 판정
    r=pg.evaluate("""(()=>{const g=__g,S=g.S;S.qi=5;S.qs='active';S.lv=8;for(const id of ['gc1','gc2'])S.sq[id]={st:'avail',n:0};
      g.acceptSub('gc1');const a=g.cnt('wsc');g.acceptSub('gc2');const b=g.cnt('wsc');S.gold+=2000;
      g.addStk('ore1',20);g.addStk('dw1',1);g.addStk('da1',1);g.craftItem('weapon',1,0);g.craftItem('armor',1,0);const w=S.items[0];g.equipItem(w.u);for(let i=0;i<3;i++)g.enchant(w.u,false);g.growthTick();
      return {wsc:[a,b],gc1:S.sq.gc1.st,gc2:S.sq.gc2.st,faith:g.pStats().faith,crafted:S.crafted}})()""")
    print('growth',r);assert r['gc1']=='done' and r['gc2']=='done' and r['faith']>=3
    # 2) 신앙 보정: 요구 40인 몬스터에 대한 피해·받는 피해
    r=pg.evaluate("""(()=>{const g=__g;const m={fa:40};return {out:g.faithOut(m),in:g.faithIn(m),r:g.faithR(m),full:g.faithOut({fa:0})}})()""")
    print('faith mul',r);assert r['out']<1 and r['in']>1 and r['full']==1
    # 3) 보스 전용 장비 · 보스 컬렉션 등록
    r=pg.evaluate("""(()=>{const g=__g,S=g.S;const a=g.newBU('b6a'),c=g.newBU('b6b');S.items.push(a,c);const f0=g.pStats().faith;
      g.collRegister('bc6',0,a.u);g.collRegister('bc6',1,c.u);return {done:g.collDone(g.COLL.find(x=>x.id==='bc6')),f0,f1:g.pStats().faith,name:g.itemName(a)}})()""")
    print('bu',r);assert r['done'] and r['f1']>=r['f0']+4
    # 4) 지역 보스 재출현: q6 클리어 처리 → 필드 보스 생성
    r=pg.evaluate("""(()=>{const g=__g,S=g.S;S.qi=6;S.qs='avail';g.ensureFieldBosses();const fb=g.fieldBossInfo();return {n:fb.length,field:fb[0]&&fb[0].field,fa:fb[0]&&fb[0].fa}})()""")
    print('field',r);assert r['n']==1 and r['field']
    pg.evaluate("__g.step(10,0.05);__g.snap();__g.render()");pg.screenshot(path='shots/v410_트래커.png')
    pg.evaluate("__g.openColl()");pg.evaluate("document.querySelectorAll('.ict')[5].click()");pg.wait_for_timeout(200);pg.screenshot(path='shots/v410_보스컬렉션.png')
    pg.evaluate("__g.closeWin();__g.S.items.push(__g.newBU('b10a'));__g.openBag()");pg.wait_for_timeout(200);pg.screenshot(path='shots/v410_가방_신앙.png')
    # 5) 타깃 프레임 신앙
    pg.evaluate("""(()=>{const g=__g;g.closeWin();const m=g.fieldBossInfo()[0];m.fa=60;g.player.x=m.x-30;g.player.y=m.y;window.__t=m;})()""")
    pg.evaluate("__g.setTarget?__g.setTarget(__t):0")
    pg.evaluate("__g.step(4,0.05);__g.snap();__g.render()");pg.screenshot(path="shots/v410_타깃신앙.png")
    print("ERRORS",errs or "none");b.close()
