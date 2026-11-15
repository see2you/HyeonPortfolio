"""v4.35 단축키 바꾸기: 설정 머리줄 · 조작법 [키 바꾸기] → 키 설정 창 · 키 바꾸기(R→X) · 맞바꿈(가방 I→K면 스킬은 I) · 고정 키 거절 · Esc 취소
   바뀐 키로 동작/옛 키는 무동작 · 창 탭 · 조작법 · 토스트 글자 반영 · 세이브 저장 후 이어하기 유지 · 기본값으로(두 번) · 한글 입력(e.code) · 1280×720 버튼 화면 안"""
import sys,os
from playwright.sync_api import sync_playwright
HTML=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else 'rowen_mmo_local.html');OUT=sys.argv[2] if len(sys.argv)>2 else 'shots'
res=[];chk=lambda n,c,v='':(res.append(bool(c)),print(('PASS ' if c else 'FAIL ')+n,v))
J=lambda pg,s:pg.evaluate(s)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    ctx=b.new_context(viewport={'width':1280,'height':720});pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000);pg.evaluate("localStorage.clear()")
    pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    chk('버전',J(pg,"document.getElementById('verTag').textContent").startswith('v4.'))
    chk('바꿀 수 있는 동작 19개',len(J(pg,"__g.KB_ACTS"))==19,J(pg,"__g.KB_ACTS.join('')"))
    # 조작법 팝업 → 키 바꾸기
    pg.keyboard.press('h');pg.wait_for_timeout(80);pg.click('#kSet');pg.wait_for_timeout(80)
    chk('조작법 [키 바꾸기] → 창',J(pg,"__g.win&&__g.win.id")=='keyset' and J(pg,"document.getElementById('keys').hidden"))
    # R → X
    pg.click('.kbk[data-act="r"]');chk('누르세요 표시',J(pg,"__g.kbCap")=='r' and '누르세요' in J(pg,"document.querySelector('.kbk.cap').textContent"))
    pg.keyboard.press('x');pg.wait_for_timeout(60)
    chk('R → X',J(pg,"__g.kb('r')")=='x' and J(pg,"__g.kbCap")==None)
    # 맞바꿈: 가방(i) → K (스킬 k)
    pg.click('.kbk[data-act="i"]');pg.keyboard.press('k');pg.wait_for_timeout(60)
    chk('맞바꿈 가방 K · 스킬 I',J(pg,"__g.kb('i')")=='k' and J(pg,"__g.kb('k')")=='i',J(pg,"JSON.stringify(__g.S.keymap)"))
    # 고정 키 거절
    pg.click('.kbk[data-act="q"]');pg.keyboard.press('w');pg.keyboard.press('3');pg.wait_for_timeout(60)
    chk('고정 키(W · 3) 거절 · 계속 대기',J(pg,"__g.kb('q')")=='q' and J(pg,"__g.kbCap")=='q')
    pg.keyboard.press('Escape');pg.wait_for_timeout(60)
    chk('Esc 취소 · 창 유지',J(pg,"__g.kbCap")==None and J(pg,"__g.win&&__g.win.id")=='keyset' and J(pg,"__g.kb('q')")=='q')
    # 1280×720 버튼 화면 안
    J(pg,"__g.step(1,.05);__g.render()")
    box=J(pg,"(()=>{const a=[...document.querySelectorAll('#win .kbk,#wFoot button')].map(e=>e.getBoundingClientRect());const B=document.getElementById('wBody'),bb=B.getBoundingClientRect();return {n:a.length,out:a.filter(r=>r.bottom>Math.min(innerHeight,bb.bottom+200)||r.right>innerWidth||r.top<0).length,scroll:B.scrollHeight>B.clientHeight+2}})()")
    chk('버튼 모두 화면 안 · 스크롤 없음',box['out']==0 and not box['scroll'] and box['n']>=25,box)
    pg.screenshot(path=f"{OUT}/keybind435_1280.png")
    # 창 닫고 동작 확인
    pg.keyboard.press('Escape');pg.wait_for_timeout(60)
    a0=J(pg,"__g.auto");pg.keyboard.press('r');pg.wait_for_timeout(40);a1=J(pg,"__g.auto");pg.keyboard.press('x');pg.wait_for_timeout(40);a2=J(pg,"__g.auto")
    chk('옛 R 무동작 · X = 자동 전투',a0==a1 and a2!=a1,[a0,a1,a2])
    pg.keyboard.press('x')
    pg.keyboard.press('k');pg.wait_for_timeout(60);w1=J(pg,"__g.win&&__g.win.id")
    pg.keyboard.press('i');pg.wait_for_timeout(60);w2=J(pg,"__g.win&&__g.win.id")
    pg.keyboard.press('i');pg.wait_for_timeout(60);w3=J(pg,"__g.win&&__g.win.id")
    chk('K = 가방 · I = 스킬(전환) · 같은 키 닫기',w1=='bag' and w2=='skills' and w3==None,[w1,w2,w3])
    pg.keyboard.press('k');pg.wait_for_timeout(60)
    tabs=J(pg,"Object.fromEntries([...document.querySelectorAll('#wTabs .wtab')].map(b=>[b.firstChild.textContent,b.querySelector('kbd')?.textContent]))")
    chk('창 탭 글자',tabs.get('가방')=='K' and tabs.get('스킬')=='I' and tabs.get('강화')=='J',tabs)
    pg.keyboard.press('Escape')
    kb=J(pg,"Object.fromEntries([...document.querySelectorAll('#keys .ki')].map(e=>[e.firstChild.textContent.trim(),e.querySelector('kbd').textContent]))")
    chk('조작법 안내 반영',kb.get('자동 전투')=='X' and kb.get('가방')=='K' and kb.get('스킬')=='I',[kb.get('자동 전투'),kb.get('가방')])
    J(pg,"document.getElementById('toasts').replaceChildren();__g.goTown()")
    tt=J(pg,"[...document.querySelectorAll('#toasts .toast')].map(e=>e.textContent).join('|')")
    J(pg,"__g.S.qi=0;__g.setQTab('all')")
    st=J(pg,"(()=>{__g.openSettings();const t=document.getElementById('wBody').textContent;__g.closeWin();return t.includes('보상을 자동으로 (T)')})()")
    chk('설정 문구 (T) 그대로 · 토스트 경로 오류 없음',st and not errs,tt)
    # 한글 입력: e.key='ㅌ' 이지만 code=KeyX
    J(pg,"dispatchEvent(new KeyboardEvent('keydown',{key:'ㅌ',code:'KeyX'}))");h1=J(pg,"__g.auto")
    J(pg,"dispatchEvent(new KeyboardEvent('keydown',{key:'ㅌ',code:'KeyX'}))");h2=J(pg,"__g.auto")
    chk('한글 입력도 바뀐 키',h1!=h2)
    # 이어하기 유지
    J(pg,"__g.save()");km=J(pg,"localStorage.getItem(Object.keys(localStorage).find(k=>localStorage.getItem(k).includes('keymap')))") or ''
    chk('세이브에 keymap',('"keymap"' in km))
    pg.reload();pg.wait_for_function('window.__ready===true',timeout=120000);pg.click('#btnCont');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    chk('이어하기 후 유지',J(pg,"__g.kb('r')")=='x' and J(pg,"__g.kb('i')")=='k' and J(pg,"document.getElementById('bKeys').title")=='조작법 (H)')
    # 설정 머리줄 버튼 · 기본값으로
    J(pg,"__g.openSettings()");pg.wait_for_timeout(60)
    chk('설정 머리줄 [단축키 바꾸기]',J(pg,"!!document.querySelector('#wInfo .wkset')"))
    pg.click('#wInfo .wkset');pg.wait_for_timeout(60)
    pg.click('#wFoot button');pg.wait_for_timeout(40);s1=J(pg,"__g.kb('r')");lab=J(pg,"document.querySelector('#wFoot button').textContent")
    pg.click('#wFoot button');pg.wait_for_timeout(40)
    chk('기본값으로(두 번)',s1=='x' and '한 번 더' in lab and J(pg,"__g.kb('r')")=='r' and J(pg,"JSON.stringify(__g.S.keymap)")=='{}')
    J(pg,"__g.setKey('r','x');__g.save()")
    pg.reload();pg.wait_for_function('window.__ready===true',timeout=120000);pg.click('#btnStart');pg.wait_for_timeout(400)
    chk('새 게임도 바꾼 키 유지',J(pg,"__g.kb('r')")=='x' and J(pg,"__g.S.lv")==1)
    chk('오류 없음',not errs,errs)
    ctx.close()
    # 960×540
    ctx=b.new_context(viewport={'width':960,'height':540});pg=ctx.new_page()
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000);pg.evaluate("localStorage.clear()")
    pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0;__g.openKeyset()");pg.wait_for_timeout(60)
    sc=J(pg,"(()=>{const B=document.getElementById('wBody'),f=document.querySelector('#wFoot button').getBoundingClientRect();return [B.scrollHeight>B.clientHeight+2,f.bottom<=innerHeight]})()")
    chk('960×540 스크롤 없음 · 아래 버튼 보임',sc==[False,True],sc);pg.screenshot(path=f"{OUT}/keybind435_960.png");ctx.close()
    b.close()
print('ALL PASS' if all(res) else 'SOME FAIL');sys.exit(0 if all(res) else 1)
