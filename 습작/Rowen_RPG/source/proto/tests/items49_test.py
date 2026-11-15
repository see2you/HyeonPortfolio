"""v4.9: 시작 장비 없음 · 드롭 시 가방 레드닷/NEW · 제작(확정/비법서 확률) · 컬렉션 등록(소멸·완성 능력치) · 축복 주문서 · 일반 몬스터 드롭 등급 제한"""
import sys,os,json
from playwright.sync_api import sync_playwright
HTML=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else 'rowen_mmo_local.html');OUT=sys.argv[2] if len(sys.argv)>2 else 'shots'
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000);pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    R={}
    R['start_items']=pg.evaluate("[__g.S.items.length,Object.values(__g.S.eq).filter(Boolean).length]")
    # 일반 몬스터 드롭 등급 분포
    R['normal_grades']=pg.evaluate("(()=>{const c=[0,0,0,0,0];const m={lv:5,boss:false,x:0,y:0};for(let i=0;i<4000;i++){const n=__g.S.items.length;__g.dropFrom(m);if(__g.S.items.length>n){c[__g.S.items.at(-1).g]++;__g.S.items.pop();}}return c})()")
    R['boss_grades']=pg.evaluate("(()=>{const c=[0,0,0,0,0];const m={lv:20,boss:true,x:0,y:0};for(let i=0;i<2000;i++){const n=__g.S.items.length;__g.dropFrom(m);if(__g.S.items.length>n){c[__g.S.items.at(-1).g]++;__g.S.items.pop();}}return [c,__g.cnt('rcp2'),__g.cnt('rcp3'),__g.cnt('rcp4'),__g.cnt('wscB')]})()")
    pg.evaluate("for(const k of ['rcp2','rcp3','rcp4','wscB','ascB'])__g.S.bag[k]=0;__g.S.items.length=0")
    pg.evaluate("__g.addItem(__g.newItem('weapon',1,0));__g.step(4,.05)")
    R['bag_dot_after_drop']=pg.evaluate("document.getElementById('bBag').classList.contains('dot')")
    pg.evaluate("__g.openBag()");pg.wait_for_timeout(100)
    R['NEW_badge']=pg.evaluate("!!document.querySelector('.cell .newm')");R['new_dot_cell']=pg.evaluate("!!document.querySelector('.cell .nwd')")
    pg.evaluate("__g.step(1,.05);__g.render()");pg.screenshot(path=f'{OUT}/v49_bag.png')
    pg.evaluate("__g.closeWin();__g.step(4,.05)");R['bag_dot_after_view']=pg.evaluate("document.getElementById('bBag').classList.contains('dot')")
    # 제작
    pg.evaluate("__g.S.stone=200;__g.S.gold=50000")
    R['craft_common']=pg.evaluate("(()=>{const r=__g.craftItem('helm',1,0);return r&&r.ok})()")
    R['craft_rare_no_recipe']=pg.evaluate("__g.craftCheck('weapon',1,2).why")
    pg.evaluate("__g.S.bag.rcp2=3;for(let i=0;i<2;i++)__g.craftItem('weapon',1,0);__g.craftItem('weapon',1,1)")
    R['craft_rare']=pg.evaluate("(()=>{let r;for(let i=0;i<3;i++){r=__g.craftItem('weapon',1,2);if(r&&r.ok)break;}return r&&{ok:r.ok,g:r.it&&r.it.g,rcp2:__g.cnt('rcp2')}})()")
    pg.evaluate("__g.openCraft()");pg.wait_for_timeout(100);pg.evaluate("__g.step(1,.05);__g.render()");pg.screenshot(path=f'{OUT}/v49_craft.png')
    # 컬렉션: c2 가죽 수집가 = 투구·장갑·장화 T1
    pg.evaluate("__g.closeWin();__g.craftItem('gloves',1,0);__g.craftItem('boots',1,0)")
    cp0=pg.evaluate("__g.pStats().def");n0=pg.evaluate("__g.S.items.length")
    R['coll_reg']=pg.evaluate("[0,1,2].map(i=>__g.collRegister('c2',i))")
    R['coll_def_gain']=pg.evaluate("__g.pStats().def")-cp0;R['items_consumed']=n0-pg.evaluate("__g.S.items.length")
    pg.evaluate("__g.openColl()");pg.wait_for_timeout(100);pg.evaluate("__g.step(1,.05);__g.render()");pg.screenshot(path=f'{OUT}/v49_coll.png')
    # 축복 주문서: +0 무기에 → +1~3
    R['blessed']=pg.evaluate("(()=>{__g.closeWin();const it=__g.newItem('weapon',2,0);__g.S.items.push(it);__g.S.bag.wscB=1;const r=__g.enchant(it.u,'wscB');return [r.ok,r.up,it.en]})()")
    for k,v in R.items():print(k,json.dumps(v,ensure_ascii=False))
    print('ERRORS',errs or 'none');b.close()
