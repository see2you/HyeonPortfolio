/* ================= v4.47 몬스터 행동 원형 · 상태이상 데이터 (지시서 §G1) =================
   MOB_B: 종 → {b:행동 원형, fx:거는 상태이상}. 배정은 이 표 하나로만 한다(코드에 흩지 않는다).
   G1-a(v4.47)는 틀만: 원형은 모두 'melee'(지금 동작 그대로), 상태이상은 호수뱀의 독 하나만 시험 배정.
   지역 보스 · 관문 정예(boss · eliteOf)에는 아직 붙이지 않는다(보스 패턴은 G1-f~g). */
const MOB_B={
  lakesnake:{b:'melee',fx:'poison'},
  fairy:{b:'ranged'},/* v4.49 G1-b: 원거리 첫 종(로웬 도토리 숲 Lv5~6) — 통과 뒤 나머지 5종 */
};
/* 상태이상 정의: dur=기본 지속(초) · 갱신만 하고 중첩 없음. 지속은 반드시 fxDur()를 거친다(§G2 저항 · §G3 장비 · §G12 정화가 붙을 자리). */
const FXDEF={
  poison:{name:'독',ic:'☠',col:'#8ae04a',dur:5,dps:.004,potK:.7,desc:'초당 최대 HP의 0.4% · HP 물약 회복 −30%'},
};
/* 부여 확률: 일반 25% · 정예/보스 100% · 입문 · 물약 민감 구간(Lv1~6 · Lv9~11) 15% */
/* v4.49 원거리 원형(지시서 §G1 · G1-b): 거리 range 안이면 멈춰 aim초 조준(가는 예고선 · 플레이어를 따라감) → 조준 끝 시점의 플레이어 위치로 투사체.
   flee 안으로 오면 fleeK 속도로 물러남(집에서 leash까지만). 투사체 spd/초 · 반경 pr · 피해 ×mul · 주기 cd초 · 사거리 range×fly · 체력 ×hpK */
const RANGED={range:110,aim:1.2,flee:70,fleeK:.6,leash:150,spd:200,pr:8,mul:1.12,cd:2.6,fly:1.7,hpK:.8};
const FX_P={base:.25,early:.15,elite:1};
