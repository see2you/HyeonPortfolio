"""v4.63 G1-e2 (지시서 §G1) 상태이상 나머지 배정
1) 배정: 독 모래도마뱀 · 유황딱정벌레(근접) / 화상 불꽃정령(투사체) · 불씨슬라임(폭발 · 두 사냥터) / 둔화 이끼돌정령(투사체) · 물방울슬라임(폭발)
2) fxBy 거름 · 확률: 근접 25% · 물방울슬라임(Lv9~10 물약 민감) 15% · 다른 공격으로는 안 걸림 · 보스 · 관문 정예 없음
3) 피해 예산(서 있기 60초 · 씨앗 8): 모래도마뱀 Lv17 · 유황딱정벌레 Lv30 독 ÷ 근접 0.90~1.15 · 불꽃정령 Lv31 화상 투사체 ÷ 근접 0.90~1.15
4) 불티 숲 불씨슬라임 lj 0.015 · 폭발 화상 · 둔화가 실제로 걸림(폭발 명중 경로) · 화면(shots/v463_*.png) · 이전 세이브 이어하기 · 버전"""
import os,sys,json
sys.path.insert(0,os.path.dirname(__file__))
from fx_util import SETUP_JS,DUEL_JS
from rng_probe452 import page,ARGS,HTML,IDLE
from playwright.sync_api import sync_playwright
ok=0
def chk(c,msg):
    global ok
    assert c,msg;ok+=1;print('  ok',msg)
FIX="(s)=>{let a=s>>>0;Math.random=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}"
with sync_playwright() as p:
    b=p.chromium.launch(args=ARGS);errs=[];pg=page(b,errs)
    r=pg.evaluate("""()=>{const B=__g.MOB_B,K=['sandlizard','sulfurbeetle','flamewisp','emberslime','mosswisp','waterslime'];const o={};for(const k of K)o[k]=[B[k].fx,B[k].fxBy||null,__g.mobBeh({sp:k})];
      o.e2=[__g.MOB_BZ['emberslime@e2'].fx,__g.MOB_BZ['emberslime@e2'].fxBy];o.boss=K.map(k=>__g.mobB({sp:k,boss:true})).concat(K.map(k=>__g.mobB({sp:k,eliteOf:{}})));
      o.prev=[B.lakesnake.fx,B.lavalizard.fx,B.mist.fx,B.bull.fx];o.none=['puffer','fairy','cavemush','embertree','obsidiancrab','goat','acornboar'].map(k=>B[k].fx||null);return o;}""")
    print(' assign',r)
    chk(r['sandlizard'][:2]==['poison',None] and r['sulfurbeetle'][:2]==['poison',None],'독: 모래도마뱀 · 유황딱정벌레(근접)')
    chk(r['flamewisp']==['burn','shot','ranged'] and r['emberslime']==['burn','burst','burst'] and r['e2']==['burn','burst'],'화상: 불꽃정령 투사체 · 불씨슬라임 폭발(잿빛 고원 · 불티 숲 둘 다)')
    chk(r['mosswisp']==['slow','shot','ranged'] and r['waterslime']==['slow','burst','burst'],'둔화: 이끼돌정령 투사체 · 물방울슬라임 폭발')
    chk(all(x is None for x in r['boss']),'보스 · 관문 정예에는 없음(G1-f~g)')
    chk(r['prev']==['poison','burn','slow','stun'] and all(x is None for x in r['none']),'앞 배정 그대로 · 그 밖의 종 상태이상 없음')
    chk(pg.evaluate("(()=>{const z=__g.MOB_BZ['emberslime@e2'];return z.lock===.9&&z.lj===.015&&__g.MOB_B.emberslime.lj===.015&&__g.MOB_B.emberslime.lock===undefined&&__g.MOB_B.emberslime.mul===.8;})()"),'불티 숲 불씨슬라임 고정 0.9~0.915초 무작위· 잿빛 고원 0.77~0.785초(lj 0.015 둘 다) · 잿빛 고원 폭발 ×0.8')
    pg.evaluate(FIX,7)
    r=pg.evaluate("""()=>{const g=__g,N=800;const cnt=(sp,lv,by,zone)=>{const m={sp,lv,name:sp,atk:30,zone};let n=0;for(let i=0;i<N;i++){g.clearStatus();if(g.mobFx(m,by))n++;}g.clearStatus();return n;};
      return {sl:cnt('sandlizard',17,'melee'),sb:cnt('sulfurbeetle',30,'melee'),fwS:cnt('flamewisp',31,'shot'),fwM:cnt('flamewisp',31,'melee'),esB:cnt('emberslime',12,'burst','z5'),esM:cnt('emberslime',12,'melee','z5'),e2B:cnt('emberslime',33,'burst','e2'),
        mwS:cnt('mosswisp',19,'shot'),mwM:cnt('mosswisp',19,'melee'),wsB:cnt('waterslime',9,'burst'),wsM:cnt('waterslime',9,'melee'),N};}""")
    print(' rates',r)
    inr=lambda n,p:abs(n/r['N']-p)<.06
    chk(inr(r['sl'],.25) and inr(r['sb'],.25),'독 근접 타격 25%% (%d · %d / 800)'%(r['sl'],r['sb']))
    chk(inr(r['fwS'],.25) and r['fwM']==0 and inr(r['mwS'],.25) and r['mwM']==0,'투사체만: 불꽃정령 화상 %d · 이끼돌정령 둔화 %d / 800 · 근접 0'%(r['fwS'],r['mwS']))
    chk(inr(r['esB'],.25) and inr(r['e2B'],.25) and r['esM']==0,'폭발만: 불씨슬라임 화상 z5 %d · e2 %d / 800 · 근접 0'%(r['esB'],r['e2B']))
    chk(inr(r['wsB'],.15) and r['wsM']==0,'물방울슬라임 Lv9 폭발 둔화 15%%(물약 민감 구간 · %d/800)'%r['wsB'])
    # 4) 폭발 경로로 실제로 걸리는지 — 물방울슬라임 부풀기 → 폭발 명중
    r=pg.evaluate("""()=>{const g=__g,P=g.player;Math.random=()=>0;g.clearStatus();const m=g.mobs.find(e=>e.sp==='waterslime'&&!e.boss&&!e.eliteOf);if(!m)return null;for(const e of g.mobs)if(e!==m){e.aggro=false;e.dead=true;e.respawn=1e9;}
      m.dead=false;m.aggro=true;m.ret=false;m.lv=9;const ms=g.mobStats(9,false);m.atk=ms.atk;m.def=ms.def;m.max=1000;m.hp=200;m.x=m.home.x;m.y=m.home.y;P.x=m.x+14;P.y=m.y;P.hp=1e6;P.dead=false;g.setAuto(false);let got=false;
      for(let i=0;i<80&&!got;i++){P.lastHit=1e12;g.step(1,1/32);P.x=m.x+14;P.y=m.y;if(g.fxOn('slow'))got=true;}const boom=m.dead;g.clearStatus();P.hp=g.pStats().hp;for(const e of g.mobs)e.respawn=0;return {got,boom};}""")
    print(' burst path',r);chk(r and r['got'],'물방울슬라임 폭발 명중 → 둔화(실제 폭발 경로)')
    # 화면: 독 + 화상 + 둔화
    pg.evaluate("__g.clearStatus();__g.addFx('poison',{name:'모래도마뱀'});__g.addFx('burn',{name:'불꽃정령',atk:1});__g.addFx('slow',{name:'이끼돌정령'});__g.step(4,.05);__g.snap();__g.render()")
    tx=pg.evaluate("document.getElementById('fxRow').textContent");print(' hud',tx);chk('☠' in tx and '♨' in tx and '≈' in tx,'HP 바 위 아이콘 3종')
    pg.screenshot(path='shots/v463_상태이상.png');pg.evaluate("__g.clearStatus()")
    ver=pg.evaluate("document.getElementById('verTag').textContent");print(' ver',ver);chk(ver.startswith('v4.'),'버전 표시')
    pg.evaluate("__g.save&&__g.save()");sv=pg.evaluate("localStorage.getItem('rowen-mmo-v4')");pg.close()
    # 3) 피해 예산
    for sp,mid,lv in (('sandlizard','kardo',17),('sulfurbeetle','erna',30)):
        q=page(b,errs,mid);q.evaluate(SETUP_JS,lv);A=B=0;pr=0
        for s in range(1,9):
            a=q.evaluate(DUEL_JS,[sp,lv,60,s,True]);A+=a['taken'];B+=a['melee'];pr+=a['procs']
        print(' budget',sp,lv,'%.3f procs %d'%(A/B,pr));chk(.90<=A/B<=1.15 and pr>0,'피해 예산 %s Lv%d 독 ÷ 근접 = %.3f (0.90~1.15)'%(sp,lv,A/B));q.close()
    q=page(b,errs,'erna');q.evaluate(SETUP_JS,31);M=[q.evaluate(IDLE,['flamewisp',31,s,'melee']) for s in range(1,9)];R=[q.evaluate(IDLE,['flamewisp',31,s,'ranged']) for s in range(1,9)]
    v=sum(x[0] for x in R)/sum(x[0] for x in M);print(' budget flamewisp 31 %.3f'%v);chk(.90<=v<=1.15,'피해 예산 불꽃정령 Lv31 투사체 + 화상 ÷ 근접 = %.3f (0.90~1.15)'%v);q.close()
    # 이전 세이브
    pg2=b.new_page(viewport={'width':1280,'height':720});e2=[];pg2.on('pageerror',lambda e:e2.append(str(e)))
    pg2.goto('file://'+HTML);pg2.evaluate("s=>localStorage.setItem('rowen-mmo-v4',s)",sv);pg2.reload();pg2.wait_for_function('window.__ready===true',timeout=120000);pg2.click('#btnCont',timeout=60000);pg2.wait_for_timeout(600);pg2.evaluate("window.requestAnimationFrame=()=>0;__g.step(40,.05)")
    chk(not e2,'이전 세이브 이어하기 → 오류 없음(새 저장 필드 없음)');pg2.close()
    print('ERRORS',errs or 'none');assert not errs;b.close()
print('PASS',ok)
