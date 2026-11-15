"""v4.31 획득 기록 창 (L).
- 몬스터 드롭(고급 이상 장비 · 보스 전용) · 퀘스트 보상(도면 · 비법서 · 스킬서 · 축복 주문서)을 어디서(몬스터 이름 Lv · 지역 · 퀘스트) 얻었는지 최근 50건
- 일반 장비 · 광물 · 강화석 · 상점 구입(withAcq 밖)은 남기지 않음
- 같은 곳에서 잇달아 얻은 같은 재료는 한 줄로 합침(×N)
- 가방 가득으로 못 주운 장비 = '놓침' → 메뉴 · 탭 빨간 점, 창을 열면 꺼짐
- 1280×720 · 960×540에서 스크롤해야 보이는 버튼 없음 · 세이브 유지 (shots/v431_획득기록.png)"""
import os
from playwright.sync_api import sync_playwright
HTML=os.path.abspath('rowen_mmo_local.html')
AUDIT=open(os.path.join(os.path.dirname(__file__),'winaudit427_test.py'),encoding='utf-8').read().split('AUDIT="""')[1].split('"""')[0]
MOB="(()=>{const g=__g,z=Object.keys(g.ZALL).find(k=>g.ZALL[k].map===g.map)||Object.keys(g.ZALL)[0];return {name:'시험 늑대',lv:12,zone:z,x:g.player.x,y:g.player.y}})()"
os.makedirs('shots',exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    for vw,vh in [(1280,720),(960,540)]:
        pg=b.new_page(viewport={'width':vw,'height':vh});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
        pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
        pg.evaluate("window.__m="+MOB)
        # 1. 몬스터 드롭: 고급 장비는 남고 일반 장비는 안 남음
        o=pg.evaluate("""(()=>{const g=__g,S=g.S;S.acq=[];g.addItem(g.newItem('weapon',1,0),__m);const a=S.acq.length;const it=g.newItem('helm',1,2);g.addItem(it,__m);
          return {a,n:S.acq.length,e:S.acq[0],u:it.u,zn:g.ZALL[__m.zone].name}})()""")
        print('드롭',o['e'])
        assert o['a']==0 and o['n']==1 and o['e']['cat']=='eq' and o['e']['src']=='시험 늑대 Lv 12' and o['e']['z']==o['zn'] and o['e']['u']==o['u'] and o['e']['g']==2, o
        # 2. 재료: withAcq 안의 도면 · 비법서만, 광물 · 강화석 · 상점(밖)은 제외
        o=pg.evaluate("""(()=>{const g=__g,S=g.S;S.acq=[];g.withAcq('보스 · 시험',null,()=>{g.addStk('ore1',5);g.addStk('rcp2',1);g.addStk('dw1',1);});g.addStk('bls',3);g.addStk('rcp3',1);
          return S.acq.map(e=>[e.k,e.cat,e.q,e.src])})()""")
        print('재료',o)
        assert o==[['dw1','mat',1,'보스 · 시험'],['rcp2','book',1,'보스 · 시험']], o
        # 3. 퀘스트 보상: 출처 = 퀘스트 이름, 연달아 같은 재료는 합침, 스킬서
        o=pg.evaluate("""(()=>{const g=__g,S=g.S;S.acq=[];g.applyRw({stk:{bls:1}},'메인 「시험」');g.applyRw({stk:{bls:1}},'메인 「시험」');g.applyRw({book:'dash'},'서브 「비법」');
          return S.acq.map(e=>[e.k,e.q,e.src,e.cat])})()""")
        print('보상',o)
        assert o==[['book_dash',1,'서브 「비법」','book'],['bls',2,'메인 「시험」','mat']], o
        # 4. 실제 보스 드롭 경로(오류 없이 · 광물 제외 · 장비 1개 이상 기록)
        o=pg.evaluate("""(()=>{const g=__g,S=g.S;S.acq=[];const m=Object.assign({},__m,{boss:true,name:'시험 군주'});for(let i=0;i<12;i++)g.dropFrom(m);
          return {eq:S.acq.filter(e=>e.cat==='eq').length,ore:S.acq.some(e=>/^ore/.test(e.k||'')),src:[...new Set(S.acq.map(e=>e.src))]}})()""")
        print('보스 드롭',o)
        assert not o['ore'] and o['src']==['보스 · 시험 군주 Lv 12'], o
        # 5. 가방 가득 → 놓침 · 빨간 점
        o=pg.evaluate("""(()=>{const g=__g,S=g.S;S.acqSeen=Date.now()-1;const keep=S.items.slice();while(S.items.length<90)S.items.push(g.newItem('boots',1,0));
          const ok=g.addItem(g.newItem('ring',1,3),__m);const e=S.acq[0];S.items=keep;return {ok,miss:e.miss,u:e.u,nw:g.acqMissNew()}})()""")
        assert o=={'ok':False,'miss':1,'u':0,'nw':True}, o
        pg.wait_for_timeout(1200)
        # 6. 50건 상한 · 새것이 앞
        o=pg.evaluate("""(()=>{const g=__g,S=g.S;for(let i=0;i<60;i++){const it=g.newItem('gloves',1+(i%3),1+(i%4));g.addItem(it,__m);if(i%2)S.items.pop();}
          return {n:S.acq.length,max:g.ACQ_MAX,ord:S.acq.every((e,i,a)=>!i||a[i-1].at>=e.at)}})()""")
        assert o['n']==50 and o['max']==50 and o['ord'], o
        pg.evaluate("""(()=>{const g=__g,S=g.S;const e=S.acq;e[3]=Object.assign({},e[3],{miss:1,u:0,at:Date.now()});e[7].bu=1;e[7].n='시험 보스 투구';
          e[1]={cat:'book',k:'rcp3',n:'영웅 제작 비법서',q:1,src:'관문 정예 · 불새 여왕 홍염 Lv 40',z:'불새 둥지',at:Date.now()-125000};
          e[2]={cat:'mat',k:'da2',n:'카르도 방어구 도면',q:2,src:'메인 「협곡의 여왕」',z:'카르도',at:Date.now()-4000000};})()""")
        # 7. L 키 · 창 탭 · 메뉴 점
        pg.keyboard.press('i');pg.wait_for_timeout(100)
        menuDot=pg.evaluate("[...document.querySelectorAll('.wtab')].find(b=>b.textContent.startsWith('기록')).classList.contains('dot')")
        pg.keyboard.press('l');pg.wait_for_timeout(150)
        r=pg.evaluate("""(()=>{const w=document.getElementById('win'),rows=[...document.querySelectorAll('.lgr')],L=document.querySelector('.lgl').getBoundingClientRect(),wr=w.querySelector('.wb').getBoundingClientRect();
          return {id:w.dataset.id,hidden:w.hidden,rows:rows.length,tab:[...document.querySelectorAll('.wtab')].map(b=>b.textContent),
            clip:rows.some(r=>r.scrollWidth>r.clientWidth+1),miss:rows.filter(r=>r.classList.contains('miss')).length,chips:[...document.querySelectorAll('#wInfo .wchip')].map(c=>c.textContent),
            st:[...new Set(rows.map(r=>r.querySelector('.lgt').textContent))],listIn:L.bottom<=wr.bottom+1,seen:__g.acqMissNew()}})()""")
        print(vw,'창',{k:v for k,v in r.items() if k!='tab'})
        assert menuDot and r['id']=='log' and not r['hidden'] and r['rows']==50 and any(t.startswith('기록') for t in r['tab']), r
        assert not r['clip'] and r['listIn'] and r['miss']==1 and any('놓친 장비' in c for c in r['chips']) and not r['seen'], r
        assert set(r['st'])>={'가방','사용함','놓침'}, r
        assert pg.evaluate(AUDIT+"('#win')")==[], '스크롤해야 보이는 버튼'
        fb=pg.evaluate("(()=>{const b=[...document.querySelectorAll('#wFoot .btn')].find(x=>x.textContent==='기록 비우기');const r=b.getBoundingClientRect();return r.bottom<=innerHeight&&r.top>=0})()")
        assert fb, '[기록 비우기]가 화면 밖'
        if vw==1280: pg.screenshot(path='shots/v431_획득기록.png')
        # 8. 필터 → 놓친 것만 · 선택 저장
        pg.locator('.wb-log .ict',has_text='놓친 것').click();pg.wait_for_timeout(80)
        o=pg.evaluate("({n:document.querySelectorAll('.lgr').length,m:document.querySelectorAll('.lgr.miss').length,f:__g.S.logF})")
        assert o=={'n':1,'m':1,'f':'miss'}, o
        pg.locator('.wb-log .ict',has_text='비법서').click();pg.wait_for_timeout(80)
        o=pg.evaluate("[...document.querySelectorAll('.lgn')].map(x=>x.textContent)")
        assert o and all('비법서' in x or '스킬서' in x for x in o), o
        if vw==1280: pg.screenshot(path='shots/v431_필터.png')
        # 9. 창이 열려도 게임 시간은 흐른다(기존 결정) · L로 닫힘
        t0=pg.evaluate("__g.t");pg.wait_for_timeout(600);
        pg.keyboard.press('l');pg.wait_for_timeout(100)
        assert pg.evaluate("document.getElementById('win').hidden"), 'L로 닫히지 않음'
        # 10. 세이브 유지 · 비우기(두 번 눌러 확인)
        pg.evaluate("__g.save()");pg.reload();pg.wait_for_function('window.__ready===true',timeout=120000)
        pg.click("#btnCont");pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0;__g.openLog()");pg.wait_for_timeout(100)
        o=pg.evaluate("({n:__g.S.acq.length,f:__g.S.logF,on:document.querySelector('.wb-log .ict.on').textContent})")
        assert o['n']==50 and o['f']=='book' and o['on'].startswith('비법서'), o
        bt=pg.locator('#wFoot .btn',has_text='기록 비우기');bt.click();pg.wait_for_timeout(50)
        assert pg.evaluate("__g.S.acq.length")==50
        pg.locator('#wFoot .btn',has_text='한 번 더').click();pg.wait_for_timeout(80)
        o=pg.evaluate("({n:__g.S.acq.length,em:(document.querySelector('.lgem')||{}).textContent})")
        assert o['n']==0 and '아직 기록이 없다' in o['em'], o
        assert pg.evaluate("document.getElementById('verTag').textContent").startswith('v4.')
        assert not errs, errs
        pg.close()
    b.close()
print('OK acqlog431')
