"""v4.36 창 위치 · 크기 기억: 머리줄 끌기 → 이동 · 저장(화면 비율) · 탭 전환해도 같은 자리 · 다른 창(설정)은 따로 · 머리줄은 화면 밖으로 못 감
   [100%] → 90 → 80 → 100 · 작게 해도 버튼 화면 안 · [↺] · 머리줄 두 번 = 처음대로 · 이어하기/새 게임 유지 · 화면 크기 바뀌어도 비율 유지
   작은 창: NPC 목록 화면 아래로 안 넘침 · 조작법과 겹치면 먼저 연 쪽 닫힘 · 1280×720 · 960×540"""
import sys,os
from playwright.sync_api import sync_playwright
HTML=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else 'rowen_mmo_local.html');OUT=sys.argv[2] if len(sys.argv)>2 else 'shots'
os.makedirs(OUT,exist_ok=True)
res=[];chk=lambda n,c,v='':(res.append(bool(c)),print(('PASS ' if c else 'FAIL ')+n,v))
J=lambda pg,s:pg.evaluate(s)
BOX="(()=>{const r=document.querySelector('#win .wbox').getBoundingClientRect();return [Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)]})()"
HEAD="(()=>{const r=document.querySelector('#win .wh').getBoundingClientRect(),y=r.top+r.height/2;for(let x=Math.max(r.left,0)+12;x<Math.min(r.right,innerWidth)-4;x+=8){const e=document.elementFromPoint(x,y);if(e&&e.closest('.wh')&&!e.closest('button'))return [x,y];}return null})()"
def drag(pg,dx,dy):
    x,y=J(pg,HEAD);pg.mouse.move(x,y);pg.mouse.down();pg.mouse.move(x+dx/2,y+dy/2,steps=3);pg.mouse.move(x+dx,y+dy,steps=3);pg.mouse.up();pg.wait_for_timeout(60)
def start(b,w,h,clear=True):
    ctx=b.new_context(viewport={'width':w,'height':h});pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    if clear:pg.evaluate("localStorage.clear()")
    return ctx,pg,errs
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    ctx,pg,errs=start(b,1280,720)
    pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    chk('버전 v4.36',J(pg,"document.getElementById('verTag').textContent")=='v4.36')
    pg.keyboard.press('i');pg.wait_for_timeout(80);b0=J(pg,BOX)
    chk('처음: 가운데 · ↺ 숨김 · 100%',J(pg,"document.getElementById('wRs').hidden") and J(pg,"document.getElementById('wSz').textContent")=='100%',b0)
    # 크기 90 → 80
    pg.click('#wSz');pg.wait_for_timeout(60);b9=J(pg,BOX);pg.click('#wSz');pg.wait_for_timeout(60);b8=J(pg,BOX)
    chk('크기 90% · 80%',abs(b9[2]/b0[2]-.9)<.02 and abs(b8[2]/b0[2]-.8)<.02 and J(pg,"document.getElementById('wSz').textContent")=='80%',[b0[2],b9[2],b8[2]])
    # 끌어 옮기기
    drag(pg,-150,-40);b1=J(pg,BOX)
    chk('끌면 옮겨짐',abs((b1[0]-b8[0])+150)<=3 and abs((b1[1]-b8[1])+40)<=3,[b8,b1])
    u=J(pg,"JSON.stringify(__g.S.winUi)")
    chk('저장(main 묶음 · 비율)',J(pg,"__g.S.winUi.main.s")==0.8 and abs(J(pg,"__g.S.winUi.main.x")*1280+150)<=3,u)
    pg.keyboard.press('k');pg.wait_for_timeout(80);bk=J(pg,BOX)
    chk('탭 전환(스킬)해도 같은 자리',bk==b1 and J(pg,"__g.win.id")=='skills',bk)
    # 80%에서도 버튼 화면 안
    for wid in ['bag','enc','craft','coll','skills']:
        J(pg,"({bag:()=>__g.openBag?__g.openBag():0})");pg.keyboard.press({'bag':'i','enc':'j','craft':'u','coll':'o','skills':'k'}[wid]) if J(pg,"__g.win&&__g.win.id")!=wid else None;pg.wait_for_timeout(60)
    out=J(pg,"[...document.querySelectorAll('#win button')].filter(e=>e.offsetParent).map(e=>e.getBoundingClientRect()).filter(r=>r.right>innerWidth+1||r.bottom>innerHeight+1||r.left<-1||r.top<-1).length")
    chk('옮긴 80% 창 버튼 화면 안',out==0,out)
    pg.screenshot(path=f"{OUT}/winpos436_moved.png")
    # 화면 밖으로 못 감
    drag(pg,-2000,-900);bx=J(pg,BOX);hd=J(pg,"(()=>{const r=document.querySelector('#win .wh').getBoundingClientRect();return [r.top,r.bottom,r.right]})()")
    chk('왼쪽 위 끝: 창 전체 화면 안',bx[0]>=0 and bx[1]>=0 and bx[0]<=1 and bx[1]<=1 and J(pg,HEAD) is not None,[bx,hd])
    drag(pg,3000,2000);bx=J(pg,BOX)
    chk('오른쪽 아래 끝: 창 전체 화면 안 · 다시 잡힘',abs(bx[0]+bx[2]-1280)<=1 and abs(bx[1]+bx[3]-720)<=1 and J(pg,HEAD) is not None,bx)
    # 다른 창(설정)은 따로
    pg.keyboard.press('Escape');J(pg,"__g.openSettings()");pg.wait_for_timeout(60);bs=J(pg,BOX)
    chk('설정 창은 따로(가운데 · 100%)',bs==b0 or (bs[2]==b0[2] and abs(bs[0]-b0[0])<=2),[bs,b0])
    drag(pg,120,30);chk('설정 창 위치 저장',J(pg,"!!(__g.S.winUi.settings&&__g.S.winUi.main)"),J(pg,"JSON.stringify(__g.S.winUi)"))
    # 머리줄 두 번 = 처음대로
    x,y=J(pg,HEAD);pg.mouse.dblclick(x,y);pg.wait_for_timeout(60)
    chk('두 번 누르면 처음대로',J(pg,BOX)==bs and not J(pg,"!!__g.S.winUi.settings") and J(pg,"document.getElementById('wRs').hidden"))
    # 버튼 클릭은 끌기 아님
    pg.click('#wX');pg.wait_for_timeout(60);chk('× 는 닫기',J(pg,"__g.win")==None)
    # 이어하기 유지
    pg.keyboard.press('i');pg.wait_for_timeout(60);bm=J(pg,BOX);J(pg,"__g.save()")
    pg.reload();pg.wait_for_function('window.__ready===true',timeout=120000);pg.click('#btnCont');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    pg.keyboard.press('i');pg.wait_for_timeout(60)
    chk('이어하기 후 같은 자리 · 크기',J(pg,BOX)==bm and J(pg,"document.getElementById('wSz').textContent")=='80%' and not J(pg,"document.getElementById('wRs').hidden"),[J(pg,BOX),bm])
    # ↺
    pg.click('#wRs');pg.wait_for_timeout(60);chk('[↺] 처음대로',J(pg,BOX)==b0 and J(pg,"JSON.stringify(__g.S.winUi)")=='{}')
    pg.click('#wSz');drag(pg,-100,0);J(pg,"__g.save()");pg.keyboard.press('Escape')
    # 새 게임도 유지
    pg.reload();pg.wait_for_function('window.__ready===true',timeout=120000);pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    chk('새 게임도 창 설정 유지',J(pg,"__g.S.lv")==1 and J(pg,"__g.S.winUi&&__g.S.winUi.main&&__g.S.winUi.main.s")==0.9)
    # 화면 크기 변경 → 비율 유지
    pg.keyboard.press('i');pg.wait_for_timeout(60);l1=J(pg,BOX)[0]-J(pg,"(innerWidth-document.querySelector('#win .wbox').offsetWidth)/2")
    pg.set_viewport_size({'width':960,'height':540});pg.wait_for_timeout(150)
    l2=J(pg,BOX)[0]-J(pg,"(innerWidth-document.querySelector('#win .wbox').offsetWidth)/2")
    chk('화면 크기 바뀌어도 같은 비율 자리',abs(l2/960-l1/1280)<.01,[l1,l2])
    pg.keyboard.press('Escape');pg.set_viewport_size({'width':1280,'height':720});pg.wait_for_timeout(100)
    # 작은 창
    pg.keyboard.press('n');pg.wait_for_timeout(80)
    nb=J(pg,"document.getElementById('npcPop').getBoundingClientRect().bottom")
    chk('NPC 목록 화면 아래로 안 넘침',nb<=716,nb)
    pg.keyboard.press('h');pg.wait_for_timeout(80)
    pg.screenshot(path=f"{OUT}/winpos436_pops.png")
    ov=J(pg,"(()=>{const a=document.getElementById('keys').getBoundingClientRect(),b=document.getElementById('npcPop').getBoundingClientRect();return a.left<b.right&&b.left<a.right&&a.top<b.bottom&&b.top<a.bottom})()")
    chk('1280: 조작법 · NPC 목록 둘 다 열림(안 겹침)',not ov and not J(pg,"document.getElementById('keys').hidden") and not J(pg,"document.getElementById('npcPop').hidden"))
    chk('오류 없음',not errs,errs)
    ctx.close()
    # 좁은 화면: 겹치면 먼저 연 쪽 닫힘
    ctx,pg,errs=start(b,700,540)
    pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    pg.keyboard.press('h');pg.wait_for_timeout(60);pg.keyboard.press('n');pg.wait_for_timeout(80)
    k=J(pg,"document.getElementById('keys').hidden");n=J(pg,"document.getElementById('npcPop').hidden")
    ov=J(pg,"(()=>{const a=document.getElementById('keys'),b=document.getElementById('npcPop');if(a.hidden||b.hidden)return false;const p=a.getBoundingClientRect(),q=b.getBoundingClientRect();return p.left<q.right&&q.left<p.right&&p.top<q.bottom&&q.top<p.bottom})()")
    chk('좁은 화면: 겹치는 작은 창 없음 · NPC 목록 열림',not ov and not n,[k,n])
    pg.keyboard.press('i');pg.wait_for_timeout(60);pg.click('#wSz');pg.click('#wSz');pg.wait_for_timeout(60)
    out=J(pg,"[...document.querySelectorAll('#win button')].filter(e=>e.offsetParent).map(e=>e.getBoundingClientRect()).filter(r=>r.right>innerWidth+1||r.bottom>innerHeight+1).length")
    chk('좁은 화면 80% 버튼 화면 안',out==0,out)
    chk('오류 없음(좁은 화면)',not errs,errs)
    ctx.close();b.close()
print(f'{sum(res)}/{len(res)}');sys.exit(0 if all(res) else 1)
