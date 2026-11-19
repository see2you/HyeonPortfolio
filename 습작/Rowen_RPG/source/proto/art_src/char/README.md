# 로웬 원정기 · 캐릭터 / NPC 리디자인 스프라이트

기존 22×34 도트 21종을 SD 2.2등신 · 쿼터뷰 · 볼륨 셰이딩 픽셀 아트로 다시 만든 에셋입니다.

## 구성
- `sprites/<id>.png` — 캐릭터별 시트 (21종)
- `sprites/hero_attack.png` — 주인공 공격 (검기 이펙트 포함)
- `sprites/hero_attack_nofx.png` — 주인공 공격 (이펙트 없음, 이펙트를 따로 그릴 때)
- `sprites/shadow.png` — 발밑 그림자 (28×10, 반투명). 시트에는 그림자가 들어 있지 않습니다.
- `sprites/sprites.json` — 셀 크기 · 앵커 · 행/열 · 애니메이션 정의
- `preview/` — 전체 미리보기 PNG, 걷기 GIF, 공격 GIF

## 기본 시트 규격 (`<id>.png`, 240×288)
- 셀 48×72, 5열 × 4행, 배경 투명(알파 0/255만 사용)
- 행(방향): 0 아래 · 1 왼쪽 · 2 오른쪽 · 3 위  ← 기존 시트와 같은 순서
- 열(프레임): 0 대기 · 1~4 걷기 (1 오른발 앞 → 2 교차 → 3 왼발 앞 → 4 교차), 8fps 반복 권장
- 앵커(발 중앙): 셀 기준 (24, 68)

## 공격 시트 규격 (`hero_attack*.png`, 320×320)
- 셀 80×80, 4열 × 4행, 행 순서는 위와 동일
- 열: 0 준비 · 1 베기(타격 판정) · 2 팔로스루 · 3 복귀
- 권장 프레임 시간: 110 / 60 / 90 / 140 ms
- 앵커(발 중앙): 셀 기준 (40, 72) — 기본 시트와 같은 발 위치에 맞춰 그리면 이어집니다.

## 크기 참고
기존 22×34를 4배로 그리던 자리(88×136)에는 새 시트를 2배(96×144)로 그리면 거의 같은 화면 크기가 됩니다.
확대는 반드시 최근접(nearest) 보간으로 하세요.

## Canvas 사용 예
```js
ctx.imageSmoothingEnabled = false;
const CW = 48, CH = 72, AX = 24, AY = 68, SCALE = 2;
const ROW = { down: 0, left: 1, right: 2, up: 3 };
function drawChar(img, dir, frame, x, y) {   // (x, y) = 발 위치
  ctx.drawImage(img, frame * CW, ROW[dir] * CH, CW, CH,
                Math.round(x - AX * SCALE), Math.round(y - AY * SCALE), CW * SCALE, CH * SCALE);
}
// 걷기: frame = 1 + Math.floor(t * 8) % 4,  대기: frame = 0
```
