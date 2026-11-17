"""v4.61 G1-d3b (지시서 §G1) 자폭 나머지 — 물방울슬라임(로웬 안개 호숫가 Lv9~10) · 거품복어(카르도 수정 호숫가 Lv25~26) · 에르나 불티 숲(e2) 불씨슬라임(Lv33~34)
1) 배정: 셋 다 burst · 보스 · 관문 정예 원형 없음 · 상태이상 없음(G1-e) · 다른 종 그대로
2) 사냥터별 덮어쓰기(MOB_B.zo → MOB_BZ): e2 불씨슬라임 고정 0.9초 · 폭발 ×0.6, 잿빛 고원(z5) 개체는 v4.59 그대로(0.77 · ×1)
3) 거품복어 고정 시간 0.77~0.81초 무작위(lj) — Math.random 0 → 0.77 · 0.99 → 0.81
4) 물방울슬라임 부풀기 중 받는 피해 ×0.4 · 폭발 ×0.8 · e2 폭발 배율이 실제 피해에 듣는다(×0.6 ÷ ×1)
5) 측정(같은 씨앗 48 무리 · 근접형 대비): 대응 없음 피해비 0.90~1.15 · 자동 전투 폭발 피격률 0.20~0.40 · 잘 대응 < 자동 · 처치
6) 화면 shots/v461_puffer.png(거품복어 부풀기) · 이전 세이브(v4.60) 이어하기 · 페이지 오류 없음"""
import os,sys
sys.path.insert(0,os.path.dirname(__file__))
from rng_probe452 import page,ARGS,HTML
from fx_util import SETUP_JS
from charge454_test import ONE as ONE0
from bst_probe459 import run,SP
os.makedirs('shots',exist_ok=True)
ok=0
def chk(c,msg):
    global ok
    assert c,msg;ok+=1;print('  ok',msg,flush=True)
NEW=['waterslime','puffer','emberslime3']
NS=int(os.environ.get('NS','48'))
ONE=lambda sp:ONE0.replace("'acornboar'","'%s'"%sp)
# 한 마리 · 체력 24% · 플레이어 앞 20에 고정 · Math.random=rv → 고정 시각 · 폭발 피해
LK="""([one,rv])=>{const g=__g,P=g.player;(new Function('return '+one))()([20,0,g.S.lv]);const m=window.__m;m.max=1000;m.hp=240;m.atkT=9;m.bst=null;const R0=Math.random;Math.random=()=>rv;
  const px=P.x,py=P.y,t0=g.t;let lockAt=null,hp=P.hp,boom=null;const b0=g.STAT.bstBoom||0;
  for(let i=0;i<200;i++){g.step(1,.01);P.x=px;P.y=py;if(m.bst&&m.bst.lk&&lockAt===null)lockAt=+(g.t-t0).toFixed(3);if((g.STAT.bstBoom||0)>b0&&boom===null)boom=+(g.t-t0).toFixed(2);if(m.dead)break;}
  Math.random=R0;return {lockAt,boom,taken:hp-P.hp,zone:m.zone,dead:m.dead};}"""
DK="""([one])=>{const g=__g;(new Function('return '+one))()([20,0,g.S.lv]);const m=window.__m;m.max=1e9;m.hp=1e9;const R0=Math.random;Math.random=()=>.5;g.hurtMob(m,1000,false);const a=1e9-m.hp;m.hp=1e9;m.bst={t:0,e:g.teleAdd({kind:'circle',x:m.x,y:m.y,r:46,dur:1.5,aim:true,keep:true,ownB:m})};g.hurtMob(m,1000,false);const b=1e9-m.hp;m.bst=null;g.tele.length=0;Math.random=R0;return [a,b];}"""
if __name__=='__main__':
    from playwright.sync_api import sync_playwright
    errs=[];tab=[]
    with sync_playwright() as p:
        b=p.chromium.launch(args=ARGS)
        pg=page(b,errs,'erna');chk(pg.evaluate("document.getElementById('verTag').textContent").startswith('v4.'),'버전 표시')
        r=pg.evaluate("()=>{const g=__g;const L=['waterslime','puffer','emberslime'];const e2=g.mobs.filter(e=>e.sp==='emberslime'&&!e.boss&&!e.eliteOf);return {b:L.map(k=>g.mobBeh({sp:k})),fx:L.map(k=>g.MOB_B[k].fx||null),boss:L.map(k=>g.mobB({sp:k,boss:true})),el:L.map(k=>g.mobB({sp:k,eliteOf:{}})),z5:g.mobB({sp:'emberslime',zone:'z5'}),e2:g.mobB({sp:'emberslime',zone:'e2'}),e2live:e2.length&&e2.every(e=>e.zone==='e2'&&g.mobB(e)===g.MOB_BZ['emberslime@e2']),ws:g.MOB_B.waterslime,pf:g.MOB_B.puffer,others:['acornboar','fairy','obsidiancrab','lakesnake','stonebeetle','otter','squirrel'].map(k=>g.mobBeh({sp:k}))};}")
        print('  INFO',{k:r[k] for k in ('b','z5','e2','ws','pf','others')})
        chk(r['b']==['burst']*3 and r['fx']==[None]*3,'3종 = 자폭 · 상태이상 없음(화상 · 둔화는 G1-e)')
        chk(r['boss']==[None]*3 and r['el']==[None]*3,'보스 · 관문 정예 원형 없음')
        chk(r['others']==['charge','ranged','guard','melee','guard','melee','melee'],'다른 종 배정 그대로')
        z5,e2=r['z5'],r['e2']
        chk(not z5.get('lock') and not z5.get('mul') and e2['lock']==.9 and e2['mul']==.6 and e2['b']=='burst' and r['e2live'],'사냥터별 덮어쓰기: e2 불씨슬라임 고정 0.9 · ×0.6 (살아 있는 e2 개체 전부) · z5는 공통 값')
        chk(r['ws'].get('dk')==.4 and r['ws'].get('mul')==.8 and r['pf'].get('lj')==.04,'물방울슬라임 껍질 ×0.4 · 폭발 ×0.8 · 거품복어 고정 무작위 폭 0.04')
        pg.evaluate(SETUP_JS,33)
        a=pg.evaluate(LK,[ONE('emberslime'),.5]);print('  INFO e2',a)
        chk(a['zone']=='e2' and abs(a['lockAt']-(1.5-.9))<.04 and abs(a['boom']-1.5)<.04 and a['taken']>0,'e2 불씨슬라임: %.2f초에 고정(1.5−0.9) · 1.5초 폭발'%a['lockAt'])
        m1=pg.evaluate("()=>{__g.MOB_BZ['emberslime@e2'].mul=1;}");pg.evaluate(SETUP_JS,33)
        a1=pg.evaluate(LK,[ONE('emberslime'),.5]);pg.evaluate("()=>{__g.MOB_BZ['emberslime@e2'].mul=.6;}")
        print('  INFO e2 ×1',a1)
        chk(abs(a['taken']/a1['taken']-.6)<.02,'e2 폭발 배율이 피해에 듣는다 (%.0f ÷ %.0f = %.2f)'%(a['taken'],a1['taken'],a['taken']/a1['taken']))
        pg.close()
        pg=page(b,errs,'kardo');pg.evaluate(SETUP_JS,25)
        lo=pg.evaluate(LK,[ONE('puffer'),0]);pg.evaluate(SETUP_JS,25);hi=pg.evaluate(LK,[ONE('puffer'),.99]);print('  INFO puffer',lo,hi)
        chk(abs(lo['lockAt']-(1.5-.77))<.04 and abs(hi['lockAt']-(1.5-.81))<.04 and lo['lockAt']>hi['lockAt'],'거품복어 고정 시간 0.77(난수 0) ~ 0.81(난수 0.99): 고정 시각 %.2f · %.2f'%(lo['lockAt'],hi['lockAt']))
        pg.close()
        pg=page(b,errs,'rowen');pg.evaluate(SETUP_JS,9)
        dk=pg.evaluate(DK,[ONE('waterslime')]);print('  INFO dk',dk)
        chk(abs(dk[1]/dk[0]-.4)<.01,'물방울슬라임 부풀기 중 받는 피해 ×0.4 (%.0f → %.0f)'%tuple(dk))
        pg.close()
        for k in NEW:
            mid,lvs=SP[k]
            for lv in lvs:
                R={}
                for mode in ('stand','auto','smart'):
                    pg=page(b,errs,mid);R[mode]=run(pg,k,lv,range(1,NS+1),mode);pg.close()
                rs,ra,rm=(R[x]['taken']/max(1,R[x]['takenM']) for x in ('stand','auto','smart'));hr=R['auto']['bstHit']/max(1,R['auto']['bstN']);hs=R['smart']['bstHit']/max(1,R['smart']['bstN'])
                print('  INFO %s Lv%d 대응 없음 %.2f · 자동 %.2f(피격률 %.2f · 부풀기 %d · 폭발 %d · 막음 %d) · 잘 대응 %.2f(피격률 %.2f) · 처치 %.1f/%.1f초'%(k,lv,rs,ra,hr,R['auto']['bstN'],R['auto']['bstBoom'],R['auto']['bstKill'],rm,hs,R['auto']['sec'],R['auto']['secM']),flush=True)
                tab.append((k,lv,round(rs,2),round(ra,2),round(hr,2),round(rm,2),round(hs,2),R['auto']['bstKill']))
                chk(.90<=rs<=1.15,'%s Lv%d 대응 없음 피해비 %.2f (0.90~1.15)'%(k,lv,rs))
                chk(.20<=hr<=.40,'%s Lv%d 자동 전투 폭발 피격률 %.2f (0.20~0.40)'%(k,lv,hr))
                chk(hs<hr and rm<1,'%s Lv%d 잘 대응(피격률 %.2f · 피해비 %.2f) < 자동 전투'%(k,lv,hs,rm))
                chk(R['stand']['killed'] and R['auto']['killed'] and R['smart']['nk']>=NS-1,'%s Lv%d 처치(대응 없음 · 자동 전부 · 잘 대응 %d/%d)'%(k,lv,R['smart']['nk'],NS))
        pg=page(b,errs,'kardo');pg.evaluate(SETUP_JS,25)
        pg.evaluate("""([one])=>{const g=__g;(new Function('return '+one))()([22,8,25]);const m=window.__m;m.max=1000;m.hp=240;m.atkT=9;for(let i=0;i<100;i++)g.step(1,.01);g.player.x=m.x+24;g.player.y=m.y+6;g.setTarget(m);g.snap();g.render();}""",[ONE('puffer')])
        pg.evaluate("()=>{const e=document.getElementById('toasts');if(e)e.innerHTML='';document.querySelectorAll('.tip,.bubble,#tipBox').forEach(x=>x.remove());__g.render();}");pg.wait_for_timeout(200);pg.screenshot(path='shots/v461_puffer.png')
        vis=pg.evaluate("()=>({on:!!(window.__m.bst),lk:!!(window.__m.bst&&window.__m.bst.lk),ver:document.getElementById('verTag').textContent})");print('  screen',vis)
        chk(vis['on'] and vis['lk'] and vis['ver'].startswith('v4.'),'화면: 거품복어 부풀기(고정된 예고) · 버전 '+vis['ver'])
        pg.evaluate("""()=>{__g.save();const k=Object.keys(localStorage).find(k=>localStorage.getItem(k).includes('"lv"'));if(k){const o=JSON.parse(localStorage.getItem(k));o.ver='v4.60';localStorage.setItem(k,JSON.stringify(o));}}""")
        pg.close()
        pg=b.new_page(viewport={'width':1280,'height':720});errs2=[];pg.on('pageerror',lambda e:errs2.append(str(e)))
        pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
        has=pg.evaluate("!!document.getElementById('btnCont')&&!document.getElementById('btnCont').hidden")
        pg.click('#btnCont' if has else '#btnStart',timeout=60000);pg.wait_for_timeout(600);pg.evaluate("window.requestAnimationFrame=()=>0;__g.step(100,.05)")
        chk(not errs2,'이어하기 → 오류 없음 '+str(errs2[:2]))
        b.close()
    chk(not errs,'페이지 오류 없음 '+str(errs[:2]))
    print('TABLE',tab)
    print('burst461',ok,'ok')
