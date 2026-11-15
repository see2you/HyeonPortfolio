"""v4.34 조작법 안내: KEYGUIDE에서 묶음 4줄로 만들어짐 · keydown 처리 키(mmo.js)가 모두 안내에 있음 · H로 열고 닫기 · 1280×720/960×540 화면 안 · 터치 문구"""
import sys,os,re
from playwright.sync_api import sync_playwright
HTML=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else 'rowen_mmo_local.html');OUT=sys.argv[2] if len(sys.argv)>2 else 'shots'
src=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','mmo.js'),encoding='utf-8').read()
kd=src[src.index("addEventListener('keydown'"):src.index("addEventListener('keyup'")]
handled=set(re.findall(r"k===\'([a-z])\'",kd))|set(re.findall(r"\b([a-z]):open",kd))
ok=True
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    for vw,vh in ((1280,720),(960,540)):
        ctx=b.new_context(viewport={'width':vw,'height':vh});pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000);pg.evaluate("localStorage.clear()")
        pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
        ver=pg.evaluate("document.getElementById('verTag').textContent")
        rows=pg.evaluate("[...document.querySelectorAll('#keys .kg .kgh')].map(e=>e.textContent)")
        shown=set(k.lower() for k in pg.evaluate("[...document.querySelectorAll('#keys .kpc kbd')].map(e=>e.textContent)") if len(k)==1)
        miss=sorted(handled-shown)
        vis=lambda:pg.evaluate("!document.getElementById('keys').hidden")
        r=[vis()];pg.keyboard.press('h');pg.wait_for_timeout(80);r.append(vis())
        box=pg.evaluate("(()=>{const r=document.getElementById('keys').getBoundingClientRect();return [r.left,r.top,r.right,r.bottom]})()")
        inside=box[0]>=0 and box[1]>=0 and box[2]<=vw and box[3]<=vh
        pg.evaluate("__g.step(1,.05);__g.render()");pg.screenshot(path=f"{OUT}/keys434_{vw}.png")
        pg.keyboard.press('Escape');pg.wait_for_timeout(80);r.append(vis())
        pg.keyboard.press('h');pg.keyboard.press('h');pg.wait_for_timeout(80);r.append(vis())
        good=ver.startswith('v4.') and rows==['이동 · 전투','자동','창','화면'] and not miss and r==[False,True,False,False] and inside and not errs
        ok&=good
        print(vw,'버전',ver,'묶음',rows,'빠진 키',miss or '없음','H/Esc',r,'상자',[round(x) for x in box],'PASS' if good else 'FAIL','ERRORS',errs or 'none');ctx.close()
    ctx=b.new_context(viewport={'width':1280,'height':720},has_touch=True);pg=ctx.new_page()
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000);pg.evaluate("localStorage.clear()")
    pg.tap('#btnStart');pg.evaluate("document.body.classList.add('touch');dispatchEvent(new Event('touchstart'))");pg.wait_for_timeout(300)
    pg.tap('#bKeys');pg.wait_for_timeout(80)
    t=pg.evaluate("[getComputedStyle(document.querySelector('#keys .kpc')).display,document.querySelector('#keys .ktouch').textContent]")
    g=t[0]=='none' and '아직 없음' not in t[1];ok&=g;print('touch',t[0],'PASS' if g else 'FAIL');ctx.close()
    b.close()
print('ALL PASS' if ok else 'SOME FAIL');sys.exit(0 if ok else 1)
