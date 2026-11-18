"""v4.79 보스 타깃 창에 패턴 정보(칩 · 대응법 · 툴팁)를 띄우지 않는다. 일반 몬스터의 원거리·상태이상 안내는 그대로."""
import os,sys,json
from playwright.sync_api import sync_playwright
HTML=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','rowen_mmo_local.html'))
ok=True
def chk(c,m):
    global ok;print(('PASS ' if c else 'FAIL ')+m);ok=ok and c
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':1280,'height':720})
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(500);pg.evaluate("window.requestAnimationFrame=()=>0")
    pg.evaluate("__g.ensureFieldBosses();for(const id of ['q6','q10','q12'])__g.spawnElite(__g.QUESTS.find(q=>q.id===id))")
    r=json.loads(pg.evaluate("""(()=>{const g=__g,e=document.getElementById('tgtI'),out={boss:[],mob:null};
      for(const m of g.mobs){if(m.dead)continue;if(g.bossPat(m)){g.setTarget(m);g.tgtInfo(m);out.boss.push({n:m.name||m.sp,hid:e.hidden,txt:e.textContent,tip:e.title});}
        else if(!out.mob&&g.mobInfo(m)){g.setTarget(m);g.tgtInfo(m);out.mob={n:m.name||m.sp,hid:e.hidden,txt:e.textContent};}}
      return JSON.stringify(out);})()"""))
    print(r)
    chk(len(r['boss'])>0,'보스 개체를 찾음 '+str(len(r['boss'])))
    chk(all(x['hid'] and not x['txt'] and not x['tip'] for x in r['boss']),'보스 타깃 창: 패턴 칩·대응법 숨김')
    chk(r['mob'] is None or (not r['mob']['hid'] and r['mob']['txt']),'일반 몬스터 안내는 유지 '+str(r['mob']))
    b.close()
sys.exit(0 if ok else 1)
