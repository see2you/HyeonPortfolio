"""v4.82 G2-b 능력치 빌드 측정 훅 (지시서 §G2) — growth_sim.py의 STAT_POLICY가 쓰는 window.__statPolicy
1) 훅이 없으면 자동 성장은 그대로(REC 순환 힘2 : 체1 : 민1 : 지1)
2) 훅이 있으면 그 능력치에 · 잘못된 값이면 REC로
3) 5빌드 정책: allstr · vit · dex · int = 한 능력치 / balanced = 구간 순서표(125포인트 → 힘 45 · 체 30 · 민 25 · 지 25 · 구간 11개 · 가는 길에 구간 순서가 표와 같다)
4) 훅은 저장되지 않는다(새 저장 필드 없음) · 이전 세이브 이어하기 · 버전 · 화면(shots/v482_*.png)"""
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)));from stat_policy import POL_JS
from playwright.sync_api import sync_playwright
HTML=os.path.abspath('rowen_mmo_local.html');os.makedirs('shots',exist_ok=True);N=[0,0]
def chk(c,msg):
    N[0]+=1;N[1]+=0 if c else 1;print(('ok  ' if c else 'FAIL'),msg)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    pg.evaluate("localStorage.clear()");pg.click('#btnStart',timeout=60000);pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    ver=pg.evaluate("document.body.innerText.match(/v4\\.\\d+/)[0]");chk(ver.startswith('v4.'),'버전 표시 '+ver)
    E=lambda s:pg.evaluate(s)
    SET=lambda js:pg.evaluate('(()=>{window.__statPolicy='+js+';})()')  # 식의 값이 함수면 playwright가 그 함수를 불러 버린다 → 감싼다
    GROW="(n)=>{const S=__g.S;S.st={str:0,vit:0,dex:0,int:0};S.sp=n;__g.autoGrowNow();return [S.st.str,S.st.vit,S.st.dex,S.st.int,S.sp];}"
    keys0=E("Object.keys(__g.S).sort().join()")
    # 1) 훅 없음
    chk(E("window.__statPolicy===undefined"),'게임에는 훅이 없다(window.__statPolicy 없음)')
    r=pg.evaluate(GROW,25);chk(r==[10,5,5,5,0],'훅 없음: 25포인트 → 힘 10 · 체 5 · 민 5 · 지 5 (REC 순환 그대로) '+str(r))
    # 2) 훅 있음 · 잘못된 값
    for bad in ("()=>'luck'","()=>null","()=>0","()=>'toString'"):
        SET(bad);r=pg.evaluate(GROW,25);chk(r==[10,5,5,5,0],'잘못된 값 %s → REC 순환 %s'%(bad,r))
    # 3) 정책
    want={'allstr':[125,0,0,0,0],'vit':[0,125,0,0,0],'dex':[0,0,125,0,0],'int':[0,0,0,125,0],'balanced':[45,30,25,25,0]}
    for k,w in want.items():
        SET(POL_JS[k]);r=pg.evaluate(GROW,125);chk(r==w,'%s: 125포인트 → 힘 %d · 체 %d · 민 %d · 지 %d'%(k,*r[:4]))
    tb=E("__g.tbCount()");chk(tb==11,'balanced 125포인트 = 구간 11개(힘 4 · 체 3 · 민 2 · 지 2) → %d'%tb)
    # balanced가 구간을 여는 순서 = 지시서 순서표
    seq=pg.evaluate("""()=>{const S=__g.S,out=[];S.st={str:0,vit:0,dex:0,int:0};for(let i=0;i<105;i++){const b={...S.st};S.sp=1;__g.autoGrowNow();for(const k in b)if(__g.tbN(k,S.st)>__g.tbN(k,b))out.push(k+S.st[k]);}return out;}""")
    chk(seq==['str10','vit10','str20','dex10','vit20','int10','str30','dex20','vit30','str45'],'balanced 구간 순서 = 순서표 '+' → '.join(seq))
    r=pg.evaluate(GROW,39);chk(r==[20,10,9,0,0],'balanced 39포인트(Lv12쯤) → 힘 20 · 체 10 · 민 9 '+str(r))
    SET('undefined');r=pg.evaluate(GROW,5);chk(r==[2,1,1,1,0],'훅을 지우면 다시 REC 순환 '+str(r))
    # 4) 저장 · 이어하기 · 화면
    SET(POL_JS['balanced']);pg.evaluate(GROW,60);E("__g.save&&__g.save()");sv=E("localStorage.getItem('rowen-mmo-v4')")
    chk(E("Object.keys(__g.S).sort().join()")==keys0 and 'statPolicy' not in sv and 'policy' not in sv.lower(),'새 저장 필드 없음(세이브에 정책이 남지 않는다)')
    old=json.loads(sv);old['st']={'str':12,'vit':3,'dex':2,'int':1};old['sp']=7;old['autoGrow']=False
    pg2=b.new_page(viewport={'width':1280,'height':720});e2=[];pg2.on('pageerror',lambda e:e2.append(str(e)))
    pg2.goto('file://'+HTML);pg2.evaluate("s=>localStorage.setItem('rowen-mmo-v4',s)",json.dumps(old));pg2.reload();pg2.wait_for_function('window.__ready===true',timeout=120000);pg2.click('#btnCont',timeout=60000);pg2.wait_for_timeout(600);pg2.evaluate("window.requestAnimationFrame=()=>0;__g.step(20,.05)")
    r2=pg2.evaluate("[window.__statPolicy===undefined,__g.S.st.str,__g.S.sp]");chk(not e2 and r2==[True,12,7],'이전 세이브 이어하기 → 오류 없음 · 훅 없음 · 자동 성장 꺼진 포인트는 그대로 %s %s'%(r2,e2))
    g2=pg2.evaluate("(()=>{const S=__g.S;S.sp=5;__g.autoGrowNow();return [S.st.str,S.st.vit,S.st.dex,S.st.int];})()");chk(sum(g2)==23 and g2[0]>=13,'이어한 판의 자동 성장 = REC 순환(18포인트째부터) '+str(g2))
    pg2.evaluate("__g.openStats()");pg2.wait_for_timeout(300);pg2.evaluate("__g.snap&&__g.snap();__g.render()");pg2.screenshot(path='shots/v482_능력치창.png')
    vt=pg2.evaluate("(()=>{const e=document.getElementById('verTag'),r=e.getBoundingClientRect();return [e.textContent,r.left,r.bottom,innerHeight]})()")
    chk(vt[0].startswith('v4.') and vt[1]<200 and vt[2]<=vt[3],'왼쪽 아래 버전 %s 화면 안'%vt[0])
    chk(not errs,'페이지 오류 없음 '+str(errs[:2]))
    b.close()
print('%d/%d ok'%(N[0]-N[1],N[0]));sys.exit(1 if N[1] else 0)
