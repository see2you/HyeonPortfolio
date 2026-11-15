"""v4.25 (현 요청) 선공 몬스터라도 플레이어 레벨보다 낮으면 먼저 공격하지 않는다 — 같은 레벨 이상은 선공, 때리면 반격 (shots/v425_선공레벨.png)"""
import os
from playwright.sync_api import sync_playwright
HTML=os.path.abspath('rowen_mmo_local.html')
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    # 선공 몬스터 하나 골라 그 옆에 선다
    def trial(plv):
        return pg.evaluate("""(plv)=>{const g=__g,S=g.S;S.autoQ=false;S.lv=plv;const m=g.mobs.find(m=>m.hp>0&&!m.dead&&g.AGGRO[m.sp]&&!m.eliteOf&&!m.boss);if(!m)return null;
          for(const e of g.mobs){e.aggro=false;}m.x=m.home.x;m.y=m.home.y;g.player.x=m.x+40;g.player.y=m.y;g.player.hp=g.pStats().hp;g.step(30,0.05);return {mlv:m.lv,plv:S.lv,aggro:m.aggro,sp:m.sp}}""",plv)
    lo=trial(1);print('player lv1',lo)
    assert lo and lo['aggro'], '같은/높은 레벨 선공 몬스터는 먼저 공격해야 함'
    mlv=lo['mlv']
    hi=trial(mlv+1);print('player above',hi);assert not hi['aggro'], '내 레벨보다 낮은 선공 몬스터는 먼저 공격하지 않아야 함'
    eq=trial(mlv);print('player equal',eq);assert eq['aggro'], '같은 레벨은 선공'
    # 낮은 몬스터도 때리면 반격
    r=pg.evaluate("""(plv)=>{const g=__g,S=g.S;S.lv=plv;const m=g.mobs.find(m=>m.hp>0&&!m.dead&&g.AGGRO[m.sp]&&!m.eliteOf&&!m.boss);for(const e of g.mobs)e.aggro=false;g.player.x=m.x+20;g.player.y=m.y;g.hurtMob(m,1,false);g.step(5,0.05);return m.aggro;}""",mlv+3);print('retaliate',r);assert r
    pg.evaluate("__g.S.lv=1");pg.evaluate("__g.snap();__g.render()");pg.screenshot(path='shots/v425_선공레벨.png')
    ver=pg.evaluate("document.getElementById('verTag').textContent");print('ver',ver);assert ver.startswith('v4.')
    print('ERRORS',errs or 'none');assert not errs;b.close()
