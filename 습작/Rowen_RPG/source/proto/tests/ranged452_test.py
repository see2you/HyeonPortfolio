"""v4.52 G1-b2c1 (지시서 §G1) 원거리 원형 — 안개정령 · 불티나무 (동굴버섯 · 이끼돌정령 · 불꽃정령은 G1-b2c2)
1) 배정: MOB_B 원거리 = 들꽃요정 + 안개정령 · 불티나무 · 솜꼬리 들판(z1) 전부 근접 · 관문 정예/보스(동굴버섯 · 불티나무)는 원형 없음 · 원거리 체력 ×0.8(카르도 · 에르나)
2) 투사체: 피해 = 근접 1타(방어 뒤) × RANGED.mul · 종별 속도(MOB_B.spd, 없으면 RANGED.spd)
3) 레벨대마다(종의 사냥터 레벨 둘씩 · 불꽃정령은 불새 둥지까지 넷) 서 있기 60초 원거리 ÷ 근접 = 0.90~1.15 · 회피 0
4) 무리 측정(rng_util.PACK_JS · 4마리 · 처치까지 · Lv16 이상은 무리 체력 ×0.4): 종마다 묶음 A/B(레벨 합침) 피격률 0.20~0.40 · A/B 차 ≤ 0.15 · 모두 처치 · 자동 전투 피해 < 근접형
5) 이전 세이브(v4.51 형식) 이어하기 · 화면 shots/v452_ranged.png(카르도 수정 호숫가) · 버전 · 페이지 오류 없음
환경변수 SP=종,종 으로 일부만 · 병렬 3"""
import os,sys,json
sys.path.insert(0,os.path.dirname(__file__))
from rng_probe452 import SP,measure,page,ARGS,HTML,SETUP_JS
from multiprocessing import Pool
os.makedirs('shots',exist_ok=True)
RANGED_SP={'fairy','mist','embertree'}
def job(sp):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b=p.chromium.launch(args=ARGS);lines=[];o=measure(b,sp,log=lines.append);b.close()
    o['lines']=lines;return o
ok=0
def chk(c,msg):
    global ok
    assert c,msg;ok+=1;print('  ok',msg,flush=True)
if __name__=='__main__':
    from playwright.sync_api import sync_playwright
    errs=[]
    with sync_playwright() as p:
        b=p.chromium.launch(args=ARGS)
        pg=page(b,errs);chk(pg.evaluate("document.getElementById('verTag').textContent").startswith('v4.'),'버전 표시')
        r=pg.evaluate("""()=>{const g=__g;return {rng:Object.keys(g.MOB_B).filter(k=>g.MOB_B[k].b==='ranged'),z1:g.MAPS.rowen.zones.z1.mobs.map(x=>g.mobBeh({sp:x[0]})),
          boss:['cavemush','embertree'].map(sp=>[g.mobB({sp,boss:true}),g.mobB({sp,eliteOf:'q16'})]),mul:g.RANGED.mul,spd:g.RANGED.spd,sp:Object.fromEntries(Object.keys(g.MOB_B).map(k=>[k,g.MOB_B[k].spd||0]))};}""")
        print('  INFO',r)
        chk(set(r['rng'])==RANGED_SP,'원거리 3종 %s'%sorted(r['rng']))
        chk(all(x=='melee' for x in r['z1']),'솜꼬리 들판은 전부 근접')
        chk(all(a is None and c is None for a,c in r['boss']),'관문 정예 · 보스(동굴버섯 · 불티나무)는 원형 없음')
        pg.close()
        for mid,sps in (('kardo',('mist',)),('erna',('embertree',))):
            pg=page(b,errs,mid)
            k=pg.evaluate("(L)=>{const g=__g;return L.map(sp=>g.mobs.filter(m=>m.sp===sp&&!m.boss&&!m.eliteOf&&!m.rift).map(m=>m.max/g.mobStats(m.lv,false).hp));}",list(sps))
            chk(all(v and all(abs(x-.8)<.03 for x in v) for v in k),'%s 원거리 체력 ×0.8 %s'%(mid,[round(v[0],3) if v else None for v in k]))
            if mid=='kardo':
                pg.evaluate(SETUP_JS,26)
                d=pg.evaluate("""()=>{const g=__g,P=g.player;const R0=Math.random;Math.random=()=>.5;/* calcDmg 무작위 폭 고정 */const m=g.mobs.find(e=>e.sp==='mist'&&!e.boss&&!e.eliteOf);for(const e of g.mobs)if(e!==m){e.dead=true;e.respawn=1e9;e.deadT=-1e9;e.aggro=false;}
                  m.lv=26;const ms=g.mobStats(26,false);m.atk=ms.atk;m.dead=false;m.aggro=false;m.atkT=99;m.x=m.home.x;m.y=m.home.y;P.x=m.x+60;P.y=m.y;P.hp=1e7;P.shield=0;g.shots.length=0;
                  g.mobShoot(m,P.x,P.y);const v=g.shots[0].v;g.shotTick(.5);const a=1e7-P.hp;
                  delete g.MOB_B.mist;P.hp=1e7;m.wind=.001;m.aggro=true;m.atkT=99;P.x=m.x+10;for(let i=0;i<12;i++){g.step(1,.05);P.x=m.x+10;P.y=m.y;}const b=1e7-P.hp;g.MOB_B.mist={b:'ranged',spd:v};m.aggro=false;Math.random=R0;return {v,a,b};}""")
                print('  INFO 한 발',d);chk(d['v']==r['sp']['mist'] and d['v']!=r['spd'],'종별 투사체 속도 (안개정령 %d)'%d['v'])
                chk(d['b']>0 and abs(d['a']/d['b']-r['mul'])<.08,'투사체 피해 = 근접 1타 × %.2f (%.0f / %.0f)'%(r['mul'],d['a'],d['b']))
            pg.close()
        want=os.environ.get('SP','').split(',') if os.environ.get('SP') else ['mist','embertree','fairy']
        with Pool(3) as pool:res=pool.map(job,want)
        table=[]
        for o in res:
            sp=o['sp'];[print(l) for l in o['lines']]
            for lv,(rt,ev) in o['idle'].items():
                chk(.90<=rt<=1.15 and ev==0,'%s Lv%d 서 있기 예산 %.3f (0.90~1.15) · 회피 0'%(sp,lv,rt))
            A,B=o['A'],o['B'];ra,rb=A[0]/max(1,A[1]),B[0]/max(1,B[1]);al=(A[0]+B[0])/max(1,A[1]+B[1]);am=o['taken']/max(1,o['takenM'])
            table.append((sp,{k:round(v[0],3) for k,v in o['idle'].items()},round(ra,3),round(rb,3),round(al,3),o['mx'],round(am,2)))
            chk(o['killed'],'%s 무리 모두 처치'%sp)
            chk(.20<=al<=.40,'%s 묶음 피격률 %.3f (A %.3f · B %.3f · 0.20~0.40)'%(sp,al,ra,rb))
            chk(abs(ra-rb)<=.15,'%s A/B 차 %.3f ≤ 0.15'%(sp,abs(ra-rb)))
            chk(am<1,'%s 자동 전투 피해 < 근접형 (%.2f)'%(sp,am))
            errs+=o['errs']
        # 화면 · 이어하기
        pg=page(b,errs,'kardo');pg.evaluate(SETUP_JS,26)
        pg.evaluate("""()=>{const g=__g,P=g.player;const L=g.mobs.filter(e=>e.sp==='mist'&&!e.boss&&!e.eliteOf).slice(0,2);const m=L[0];P.x=m.home.x+95;P.y=m.home.y;P.hp=1e6;
          L.forEach((e,i)=>{e.x=m.home.x;e.y=m.home.y-i*45;e.aggro=true;e.atkT=i?0:2;e.aim=null;e.dead=false;});for(let i=0;i<14;i++){g.step(1,.05);P.x=m.home.x+95;P.y=m.home.y;}g.mobShoot(m,P.x,P.y);g.shotTick(.12);g.snap();g.render();}""")
        pg.screenshot(path='shots/v452_ranged.png')
        vis=pg.evaluate("()=>({tele:__g.tele.filter(x=>x.aim).length,shots:__g.shots.length,ver:document.getElementById('verTag').textContent,map:__g.map})");print('  screen',vis)
        chk(vis['shots']>=1 and vis['map']=='kardo','화면: 카르도 원거리 투사체')
        pg.evaluate("""()=>{__g.save();const k=Object.keys(localStorage).find(k=>localStorage.getItem(k).includes('"lv"'));if(k){const o=JSON.parse(localStorage.getItem(k));o.ver='v4.51';localStorage.setItem(k,JSON.stringify(o));}}""")
        pg.close()
        pg=b.new_page(viewport={'width':1280,'height':720});errs2=[];pg.on('pageerror',lambda e:errs2.append(str(e)))
        pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
        has=pg.evaluate("!!document.getElementById('btnCont')&&!document.getElementById('btnCont').hidden")
        pg.click('#btnCont' if has else '#btnStart',timeout=60000);pg.wait_for_timeout(600);pg.evaluate("window.requestAnimationFrame=()=>0;__g.step(100,.05)")
        chk(not errs2,'이어하기 → 오류 없음 '+str(errs2[:2]))
        b.close()
    chk(not errs,'페이지 오류 없음 '+str(errs[:2]))
    print('TABLE',json.dumps(table,ensure_ascii=False))
    print('ranged452',ok,'ok')
