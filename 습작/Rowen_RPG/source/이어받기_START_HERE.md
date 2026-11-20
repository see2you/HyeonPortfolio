# 〈로웬 원정기〉 이어받기 — 여기부터 읽는다

> 2026-11-20 · v4.83에서 프로젝트를 닫았다(현 결정). 이 문서는 **나중에 다른 프로젝트 · 다른 대화에서 다시 열 때** 처음 읽는 한 장이다.
> 이 폴더(`MMORPG/`) 하나만 있으면 이어서 작업할 수 있다 — 대화 기록이나 claude.ai 프로젝트 문서에 기대지 않는다.

## 1. 지금 상태 한 줄
HD-2D MMORPG 라이크 싱글 RPG HTML 프로토타입. 세 지역(로웬 → 카르도 → 에르나) · 메인 44 + 서브 85 · Lv40 · 성실한 플레이 약 110분. **콘텐츠 추가는 끝났고 밸런스 확인까지 마쳤다.** 자동 예약 작업은 모두 꺼져 있다.

## 2. 파일이 있는 곳 (세 군데 — 내용은 같다)
| 곳 | 경로 | 비고 |
|---|---|---|
| **PC(이 폴더)** | `/Users/hyeon/Documents/2DHD_RPG/MMORPG` | 이 묶음을 푼 것 = v4.83 |
| GitHub(원본) | `see2you/HyeonPortfolio` · `습작/Rowen_RPG/source/` | 마지막 게임 커밋 `dc5be41` — 가장 최신은 늘 여기 |
| 플레이 | `습작/Rowen_RPG/Rowen_RPG.html`(포트폴리오) · https://claude.ai/artifact/RTM8kzfJr5p99StxTfX1jz | v4.83 |

PC 폴더와 GitHub가 다르면 **GitHub가 맞다**. PC에서 받으려면: `git clone https://github.com/see2you/HyeonPortfolio` 뒤 `습작/Rowen_RPG/source/`를 본다.

## 3. 폴더 안
```
MMORPG/
├─ 이어받기_START_HERE.md      ← 이 문서
├─ HANDOFF.md                  ← 인수인계 본문(0절 '마무리 상태' → 5절 빌드 · 테스트 → 7절 교훈)
├─ README.md                   ← 버전 로그(한 줄씩)
├─ 기획문서/
│   ├─ 로드맵_ROADMAP.md        ← 원칙 11개 · 백로그(완료 / 보류) · 작업 기록
│   ├─ 작업지시서_WORKORDERS.md  ← 항목별 설계(보류한 것 포함 — 다시 열 때 그대로 쓴다)
│   └─ 인수인계_HANDOFF.md      ← HANDOFF.md와 같은 내용
├─ proto/
│   ├─ mmo.js(게임 본체) · art.js · items.js · mobs.js · windows.js · monart.js · charart.js · shell.html
│   ├─ build.sh → rowen_mmo.html(배포) · game_full.js
│   ├─ README.md               ← 버전별 설계 · 수치 표 · 측정 결과(v4.83 절이 마지막)
│   ├─ tests/                  ← 헤드리스 테스트 80개 · growth_sim.py(성장 봇) · growth_bot.js
│   └─ art_src/ · tools/       ← 그림 원본과 굽는 도구
├─ reference/                  ← 레퍼런스 분석
└─ Rowen_RPG.html              ← 바로 열어서 플레이(v4.83 · 인터넷 연결 필요 — three.js를 CDN에서 받는다)
```

## 4. 읽는 순서
1. 이 문서
2. `HANDOFF.md` **0절 마무리 상태**(만든 것 · 밸런스 기준 · 알려진 한계 · 보류 목록)
3. `HANDOFF.md` 7절 '작업하며 얻은 교훈' — 같은 실수를 되풀이하지 않게
4. `기획문서/로드맵_ROADMAP.md` 원칙 1~11과 백로그 상태
5. 고칠 항목이 정해지면 `기획문서/작업지시서_WORKORDERS.md`의 0절 + 그 항목의 절
6. 수치가 필요하면 `proto/README.md`의 해당 버전 절

## 5. 빌드 · 테스트 (PC 또는 클라우드 작업 공간)
```bash
cd proto
npm i three@0.128.0                      # 헤드리스 테스트용(커밋하지 않는다)
pip install playwright && playwright install chromium
THREE_JS=node_modules/three/build/three.min.js bash build.sh   # → rowen_mmo.html + rowen_mmo_local.html(테스트용)
python3 tests/qroute483_test.py          # 테스트 하나
ITERS=4000 python3 tests/growth_sim.py   # 성실한 봇 한 판(끝에 SUMMARY 한 줄)
```
- 게임 버전은 `mmo.js` 맨 위 `GAME_VER`와 `shell.html` 제목 — 고칠 때마다 0.01 올린다(화면 왼쪽 아래에 보인다).
- **밸런스 기준**: 성실한 봇 사망 0 · 완주 **110분 ±15%**(94 ~ 127분). v4.83 최종 4판 106.4 ~ 115.7분.
- 테스트 80개 전체는 2코어에서 약 70분. 측정 테스트(`rng_probe452.page`를 쓰는 22개)는 다른 테스트와 같이 돌리면 기준 근처 값이 흔들리니 실패하면 혼자 다시 돌려 확인한다.
- `tests/items49_test.py`는 원래 실패하는 옛 테스트다(제외).

## 6. 지켜 온 결정 (바꾸려면 현에게 묻는다)
- 접속 유도 · 과금 장치(일일 임무 · 패스 · 유료 상점 · 뽑기)는 만들지 않는다.
- 자동 진행은 플레이어가 고르는 것(제작 · 강화 · 컬렉션 등록 · 반복 의뢰 · 시련 선택 · 보상 택1)을 대신하지 않는다.
- 창을 열어도 게임은 멈추지 않는다 · 주요 버튼은 스크롤 없이 보인다 · 강화에 파괴는 없다.
- 지역은 로웬 → 카르도 → 에르나로 한 번씩만 넘어간다(되돌아가야 채워지는 퀘스트를 만들지 않는다).
- 퀘스트 · 데이터 순서를 바꾸면 세이브 이전 코드를 넣는다(`migrateQi` · 지금 `qv` 4).
- 외부에 보이는 문서에는 특정 게임 이름 대신 'MMORPG 라이크'라고 쓴다.

## 7. 알려진 한계 — 다시 연다면 여기서
1. **능력치**: 힘에만 몰아도 완주 시간 손해가 없다(값은 HP 물약 +40개). 출발점은 지시서 §G2 변경 기록의 'G2-c에 넘기는 것 ①~④'.
2. **구간 보너스를 켠 §G1 측정**: 16개 중 6개가 기준 밖(`proto/README.md` v4.83 표). 측정 표준은 '구간 없는 기준 캐릭터'.
3. **측정 하네스**: 같이 돌 때 흔들리는 원인과 고치는 법은 `HANDOFF.md` 7절 v4.83 교훈 · `proto/tests/rng_probe452.py`의 메모.
4. **로웬 방어 서브**: 최종 빌드의 사망 0은 4판 기준이다(옮기기 전에는 6판 중 1판에서 죽었다) — 더 재 볼 가치가 있다.

## 8. 보류한 것 (설계는 작업지시서에 그대로 있다)
세트 효과(§G3-c) · 도감/업적/칭호(§G8) · 시련의 탑(§G4) · 사운드(§G16) · 원정대원/채팅(§G5) · 돌발 이벤트(§G11) · 창고(§G13) · AI 모드 보강(§G14) · 전체 지도/세이브 내보내기(§G15) · 무기 계열(§G7) · 변신/동행(§G6) · 능력치 초기화(§G2-d) · 균열 분위기/입장 동기(§G17-e) · 주간 보스 · 인스턴스 던전 · 전직 · 경매장 · 원정대.

## 9. 새 대화에서 이어 갈 때 붙여 넣을 말
> 〈로웬 원정기〉(HD-2D MMORPG 라이크 싱글 RPG HTML 프로토타입)를 이어서 작업한다. `MMORPG/이어받기_START_HERE.md` → `HANDOFF.md` 0절 · 7절 → `기획문서/로드맵_ROADMAP.md` 순서로 읽고 시작해 줘. 원본은 GitHub `see2you/HyeonPortfolio`의 `습작/Rowen_RPG/source/`이고, 고쳐도 되는 곳은 그 폴더와 `습작/Rowen_RPG/Rowen_RPG.html`뿐이야. 이번에 할 일은: (여기에 적는다)

자동 예약을 다시 쓰려면 꺼 둔 예약 작업 '로웬 원정기 3시간마다 자동 개발 (GitHub · Fable)'을 켜되, 먼저 로드맵 원칙 11(콘텐츠 추가 종료)을 고쳐야 새 항목을 고른다 — 그대로 켜면 아무것도 하지 않는다.
