"""v4.64 G1-e3 (지시서 §G1) 타깃 창 아이콘 · 몬스터 설명
1) 데이터: BDEF 4원형(이름 · 아이콘 · 동작 · 대응법) · FXBY · 문구의 수치가 원형 표(CHARGE · GUARD · BURST)와 같음
2) mobInfo: MOB_B의 모든 종 — 원형 칩 · 상태이상 칩(공격 종류 · 확률 · 지속) / 근접 · 상태이상 없음 · 보스 · 관문 정예 → 없음 · 사냥터 덮어쓰기(zn)
3) 타깃 창: 실제 개체를 대상으로 → 칩 · 대응법 한 줄 / 근접형 → 줄 숨김 / 상태(웅크림 · 부풀기 · 휘청 · 조준) 칩 강조 / 대상 없음 → 숨김
4) 모든 배정 종의 칩 줄 · 설명 줄이 타깃 창(1280×720) 안에 들어감(넘침 없음) · 타깃 창이 트래커 · 미니맵을 덮지 않음
5) 화면(shots/v464_*.png · 후반 에르나 포함) · 이전 세이브 이어하기 · 버전"""
import os,sys
sys.path.insert(0,os.path.dirname(__file__))
from rng_probe452 import page,ARGS,HTML
from playwright.sync_api import sync_playwright
os.makedirs('shots',exist_ok=True)
ok=0
def chk(c,msg):
    global ok
    assert c,msg;ok+=1;print('  ok',msg)
REAL="""(sp)=>{const g=__g;const m=g.mobs.find(e=>e.sp===sp&&!e.boss&&!e.eliteOf&&g.mobB(e));if(!m)return false;for(const e of g.mobs){e.aggro=false;}m.dead=false;m.hp=m.max;m.gdU=0;m.bst=null;m.stag=0;m.chg=null;m.aim=null;g.player.x=m.x+60;g.player.y=m.y;g.setTarget(m);g.step(4,.05);g.render();return true;}"""
INFO="""()=>{const e=document.getElementById('tgtI');const ch=[...e.querySelectorAll('.tch')].map(c=>({t:c.textContent,on:c.classList.contains('on'),b:c.dataset.b||null,fx:c.dataset.fx||null}));const d=e.querySelector('.tdsc');
  return {hidden:e.hidden,tgt:document.getElementById('tgt').hidden,ch,d:d?d.textContent:'',over:d?d.scrollWidth>d.clientWidth+1:false,rowOver:e.querySelector('.tic')?e.querySelector('.tic').scrollWidth>e.clientWidth+1:false,tip:e.title};}"""
with sync_playwright() as p:
    b=p.chromium.launch(args=ARGS);errs=[];pg=page(b,errs)
    # 1) 데이터
    r=pg.evaluate("""()=>{const g=__g,B=g.BDEF;return {keys:Object.keys(B).sort(),full:Object.values(B).every(x=>x.name&&x.ic&&x.col&&x.desc&&x.how),
      ch:B.charge.how,gd:B.guard.desc,bs:B.burst.desc,C:[g.CHARGE.stag,g.CHARGE.stagK],G:[g.GUARD.cd,g.GUARD.dur,g.GUARD.baK,g.GUARD.skK],BA:g.BURST.at,by:g.FXBY};}""")
    print(' data',r)
    chk(r['keys']==['burst','charge','guard','ranged'] and r['full'],'BDEF 4원형 · 이름 · 아이콘 · 색 · 동작 · 대응법')
    chk(str(r['C'][0]) in r['ch'] and '+%d%%'%round((r['C'][1]-1)*100) in r['ch'],'돌진 문구 = CHARGE 경직 %s초 · +%d%%'%(r['C'][0],round((r['C'][1]-1)*100)))
    G=r['G'];chk(('%g초마다'%G[0]) in r['gd'] and ('%g초'%G[1]) in r['gd'] and '−%d%%'%round((1-G[2])*100) in r['gd'] and '−%d%%'%round((1-G[3])*100) in r['gd'],'방어 태세 문구 = GUARD 수치')
    chk('%d%%'%round(r['BA']*100) in r['bs'],'자폭 문구 = BURST.at')
    chk(set(r['by'])=={'melee','charge','shot','burst'},'FXBY 공격 종류 4')
    # 2) mobInfo — MOB_B 모든 종
    r=pg.evaluate("""()=>{const g=__g,o={};for(const sp in g.MOB_B){const b=g.MOB_B[sp];const zone=b.zn?b.zn[0]:null;const I=g.mobInfo({sp,lv:20,zone});o[sp]=I?{b:I.b,fx:I.fx||null,fxTxt:I.fxTxt,line:I.line,tip:I.tip}:null;}
      o.__plain=g.mobInfo({sp:'__none__',lv:5});o.__boss=g.mobInfo({sp:'obsidiancrab',lv:30,boss:true});o.__elite=g.mobInfo({sp:'snail',lv:23,eliteOf:{}});o.__zn=g.mobInfo({sp:'waterslime',lv:9,zone:'z3'});
      o.__lake=g.mobInfo({sp:'lakesnake',lv:11});o.__ws9=g.mobInfo({sp:'waterslime',lv:9});o.__bull=g.mobInfo({sp:'bull',lv:9});o.__fw=g.mobInfo({sp:'flamewisp',lv:31});return o;}""")
    sp=[k for k in r if not k.startswith('__')]
    chk(all(r[k] for k in sp),'MOB_B %d종 모두 설명 있음'%len(sp))
    chk(all((r[k]['b']=='melee') or r[k]['line'] for k in sp) and all(r[k]['tip'] for k in sp),'원형 종은 대응법 한 줄 · 모두 자세한 풀이(title)')
    chk(r['__plain'] is None and r['__boss'] is None and r['__elite'] is None,'배정 없는 근접형 · 보스 · 관문 정예 → 표시 없음(보스 패턴은 G1-f~g)')
    L=r['__lake'];print(' lake',L);chk(L['b']=='melee' and L['fx']=='poison' and '근접 15%' in L['fxTxt'] and '독 5초' in L['fxTxt'] and L['line'].startswith('독'),'호수뱀 Lv11: 근접 15% → 독 5초 · 설명 = 독 풀이(근접형이라 원형 칩 없음)')
    W=r['__ws9'];print(' ws9',W);chk(W['b']=='burst' and '폭발 명중 15%' in W['fxTxt'] and '둔화 3초' in W['fxTxt'],'물방울슬라임 Lv9: 자폭 · 폭발 명중 15% → 둔화 3초')
    U=r['__bull'];print(' bull',U);chk(U['b']=='charge' and '돌진 명중 100%' in U['fxTxt'] and '기절 0.8초' in U['fxTxt'],'초원황소: 돌진 · 돌진 명중 100% → 기절 0.8초')
    F=r['__fw'];print(' fw',F);chk(F['b']=='ranged' and '투사체 명중 25%' in F['fxTxt'] and '화상 4초' in F['fxTxt'],'불꽃정령 Lv31: 원거리 · 투사체 명중 25% → 화상 4초')
    # 3) 타깃 창 — 실제 개체
    chk(pg.evaluate(REAL,'fairy'),'들꽃요정 개체 있음(로웬)');i=pg.evaluate(INFO);print(' fairy',i)
    chk(not i['tgt'] and not i['hidden'] and len(i['ch'])==1 and i['ch'][0]['b']=='ranged' and '원거리' in i['ch'][0]['t'] and i['d'],'들꽃요정 대상: 원거리 칩 · 대응법 줄')
    pg.evaluate("(()=>{const m=__g.target;m.aim={t:0};__g.tgtInfo(m);})()");i=pg.evaluate(INFO);chk(i['ch'][0]['on'] and '조준' in i['ch'][0]['t'],'조준 중 → 칩 강조 "조준"')
    pg.evaluate("(()=>{const m=__g.target;m.aim=null;__g.tgtInfo(m);})()");i=pg.evaluate(INFO);chk(not i['ch'][0]['on'],'조준 끝 → 강조 꺼짐')
    pg.screenshot(path='shots/v464_타깃_원거리.png')
    plain=pg.evaluate("""()=>{const g=__g;const m=g.mobs.find(e=>!e.boss&&!e.eliteOf&&!g.mobB(e));if(!m)return null;m.dead=false;g.setTarget(m);g.step(4,.05);g.render();return m.sp;}""")
    i=pg.evaluate(INFO);print(' plain',plain,i['hidden']);chk(plain and not i['tgt'] and i['hidden'],'근접형(%s) 대상 → 타깃 창은 있고 설명 줄은 숨김'%plain)
    pg.evaluate("(()=>{__g.setTarget(null);__g.step(4,.05);__g.render();})()");i=pg.evaluate(INFO);chk(i['tgt'] and i['hidden'],'대상 없음 → 타깃 창 · 설명 숨김')
    # 상태 강조: 웅크림 · 부풀기 · 휘청 (로웬 잿빛 고원 개체)
    for sp,set_,word in (('obsidiancrab',"m.gdU=__g.t+2",'웅크림'),('emberslime',"m.bst={t:0}",'부풀기'),('bull',"m.stag=__g.t+1",'휘청')):
        chk(pg.evaluate(REAL,sp),'%s 개체 있음'%sp)
        pg.evaluate("(()=>{const m=__g.target;"+set_+";__g.tgtInfo(m);})()");i=pg.evaluate(INFO);print(' state',sp,i['ch'])
        chk(i['ch'][0]['on'] and word in i['ch'][0]['t'],'%s → 칩 "%s" 강조'%(sp,word))
        if sp=='obsidiancrab':pg.screenshot(path='shots/v464_타깃_방어태세.png')
        if sp=='emberslime':
            chk(len(i['ch'])==2 and i['ch'][1]['fx']=='burn','불씨슬라임: 자폭 칩 + 화상 칩 두 개');pg.screenshot(path='shots/v464_타깃_자폭화상.png')
        pg.evaluate("(()=>{const m=__g.target;m.gdU=0;m.bst=null;m.stag=0;})()")
    # 4) 넘침 — 모든 배정 종을 실제 개체에 씌워 그려 봄
    over=pg.evaluate("""()=>{const g=__g,m=g.mobs.find(e=>!e.boss&&!e.eliteOf);const keep=[m.sp,m.zone,m.lv,m.name],bad=[];m.dead=false;
      for(const sp in g.MOB_B){const b=g.MOB_B[sp];m.sp=sp;m.zone=b.zn?b.zn[0]:keep[1];m.lv=24;m.name=g.SPECIES?g.SPECIES[sp].name:sp;for(const st of [0,1]){m.gdU=st?g.t+2:0;g.setTarget(m);g.tgtInfo(m);
        const e=document.getElementById('tgtI'),d=e.querySelector('.tdsc'),row=e.querySelector('.tic');if(e.hidden||d.scrollWidth>d.clientWidth+1||row.scrollWidth>e.clientWidth+1)bad.push(sp+(st?'@웅크림':''));}}
      m.gdU=0;[m.sp,m.zone,m.lv,m.name]=keep;g.setTarget(null);g.tgtInfo(null);return bad;}""")
    print(' overflow',over);chk(not over,'MOB_B 모든 종: 칩 줄 · 설명 줄 넘침 없음(1280×720)')
    chk(pg.evaluate(REAL,'bull'),'초원황소 대상');pg.evaluate("(()=>{const m=__g.target;m.stag=__g.t+1;__g.tgtInfo(m);})()")
    box=pg.evaluate("""()=>{const r=id=>{const e=document.getElementById(id)||document.querySelector(id);if(!e)return null;const b=e.getBoundingClientRect();return [b.left,b.top,b.right,b.bottom];};return {tgt:r('tgt'),qt:r('.qt'),mm:r('.mini')||r('mini')||r('#mmap'),W:innerWidth,H:innerHeight};}""")
    print(' box',box);T=box['tgt'];chk(T[0]>=0 and T[2]<=box['W'] and T[3]<box['H']*.3,'타깃 창이 화면 위쪽 가운데 안')
    ovl=lambda a,c:a and c and not(a[2]<=c[0] or c[2]<=a[0] or a[3]<=c[1] or c[3]<=a[1])
    chk(not ovl(T,box['qt']) and not ovl(T,box['mm']),'트래커 · 미니맵과 겹치지 않음')
    pg.screenshot(path='shots/v464_타깃_돌진기절.png')
    ver=pg.evaluate("document.getElementById('verTag').textContent");print(' ver',ver);chk(ver.startswith('v4.'),'버전 표시')
    pg.evaluate("__g.save&&__g.save()");sv=pg.evaluate("localStorage.getItem('rowen-mmo-v4')");pg.close()
    # 5) 후반(에르나) 화면
    q=page(b,errs,'erna');chk(q.evaluate(REAL,'flamewisp'),'에르나 불꽃정령 대상');i=q.evaluate(INFO);print(' erna',i)
    chk(len(i['ch'])==2 and not i['over'],'불꽃정령: 원거리 + 화상 칩 · 넘침 없음');q.screenshot(path='shots/v464_타깃_에르나.png');q.close()
    pg2=b.new_page(viewport={'width':1280,'height':720});e2=[];pg2.on('pageerror',lambda e:e2.append(str(e)))
    pg2.goto('file://'+HTML);pg2.evaluate("s=>localStorage.setItem('rowen-mmo-v4',s)",sv);pg2.reload();pg2.wait_for_function('window.__ready===true',timeout=120000);pg2.click('#btnCont',timeout=60000);pg2.wait_for_timeout(600);pg2.evaluate("window.requestAnimationFrame=()=>0;__g.step(20,.05)")
    chk(not e2,'이전 세이브 이어하기 → 오류 없음(새 저장 필드 없음)');pg2.close()
    chk(not errs,'페이지 오류 없음 %s'%errs[:2])
    b.close()
print('PASS',ok)
