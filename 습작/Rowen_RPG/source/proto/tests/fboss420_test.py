"""v4.20 메인 '지역 보스 토벌' — 관문 앞에서 필드 보스판(Lv+3 · HP×1.4)을 쓰러뜨려야 진행 · 이전 세이브 qi 이전 · 보스 전용 장비 확정 (shots/v420_*.png)"""
import os,json
from playwright.sync_api import sync_playwright
HTML=os.path.abspath('rowen_mmo_local.html')
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':1288,'height':563},device_scale_factor=2);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    # 이전 세이브: qi 9 (= q10 호수의 주인) → 새 순서에서도 q10
    m=pg.evaluate("(()=>{const S={qi:9};__g.migrateQi(S);const S2={qi:33};__g.migrateQi(S2);return {a:__g.QUESTS[S.qi].id,b:S2.qi,n:__g.QUESTS.length,fb:__g.QUESTS.filter(q=>q.type==='fboss').map(q=>q.id+'>'+q.boss+':'+q.title)}})()");print('migrate',m)
    assert m['a']=='q10' and m['b']==m['n']
    pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    pg.evaluate("""(()=>{const g=__g,S=g.S,i=g.QUESTS.findIndex(q=>q.id==='fb1');S.qi=i;S.qs='avail';S.lv=16;S.autoQ=true;for(const k of ['str','dex','int','vit'])if(S.st&&S.st[k]!=null)S.st[k]+=6;
      S.sk={whirl:3,dash:2,star:2,roar:1};S.slots=['whirl','dash','star','roar',null,null,null,null];g.ensureFieldBosses();g.autoNext();})()""")
    info=pg.evaluate("(()=>{const m=__g.fieldBossInfo()[0];return m&&{lv:m.lv,max:m.max,name:m.name,field:m.field}})()");print('field boss',info);assert info and info['lv']==11
    for i in range(120):
        pg.evaluate("__g.step(10,0.05)")
        st=pg.evaluate("({qi:__g.S.qi,id:__g.curQ().id,qs:__g.S.qs,dead:__g.player.dead,bu:__g.S.items.filter(x=>x.bu).map(x=>x.bu)})")
        if i==3:pg.evaluate("__g.render()");pg.screenshot(path='shots/v420_지역보스퀘스트.png')
        if st['id']!='fb1' or st['qs']=='done':break
    print('after',i,st);assert st['qs'] in ('done',) or st['id']=='q10'
    assert st['bu'],'보스 전용 장비 확정'
    print('ERRORS',errs or 'none');b.close()
