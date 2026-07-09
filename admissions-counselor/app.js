/* =====================================================================
 * 이과 대입 전략 상담 — 진단 · 코칭 로직 (내신 5등급제 대응)
 * 데이터는 data.js에서 읽어오며, 이 파일은 수정 없이 데이터만
 * 갱신해도 동작합니다.
 *
 * 핵심 개념
 *  - 내신: 2025년 고1부터 5등급 상대평가 (1등급 = 상위 10%)
 *          → 과목별(국·수·영·사·과) 등급을 입력받고, 대학별 반영
 *            기준(GYOGWA_BASIS)에 따라 "반영 내신"을 따로 계산
 *  - 공개 입결의 내신 컷은 9등급제 수치 → 백분율 기준으로 5등급제
 *    환산 컷을 자동 계산해 비교
 *  - 수능(모의고사): 9등급 상대평가 유지 → 백분위 입력, 등급 자동
 *    환산, 대학별 수능 최저학력기준(MIN_REQUIREMENTS) 충족 판정
 * ===================================================================== */

"use strict";

// 이 앱은 이과(자연계열) 전용입니다
const TRACK = "자연";
const NAESIN_SUBJECTS = ["국어", "수학", "영어", "사회", "과학"];

// ---------------------------------------------------------------------
// 등급제 변환 유틸
// ---------------------------------------------------------------------
// 9등급제: 등급별 누적 비율 상한 (1등급 4%, 2등급 11%, …)
const CUM9 = [4, 11, 23, 40, 60, 77, 89, 96, 100];
// 5등급제: 등급별 누적 비율 상한 (1등급 10%, 2등급 34%, …)
const CUM5 = [10, 34, 66, 90, 100];
// 등급값 ↔ 누적백분율 보간 앵커 (각 등급 구간의 중앙값)
const MID9 = [[1, 2], [2, 7.5], [3, 17], [4, 31.5], [5, 50], [6, 68.5], [7, 83], [8, 92.5], [9, 98]];
const MID5 = [[1, 5], [2, 22], [3, 50], [4, 78], [5, 95]];

function interp(x, pts, xi, yi) {
  // pts: [[a,b],...] 정렬됨. x를 xi축 값으로 보고 yi축 값을 선형보간
  if (x <= pts[0][xi]) return pts[0][yi];
  const last = pts[pts.length - 1];
  if (x >= last[xi]) return last[yi];
  for (let i = 1; i < pts.length; i++) {
    if (x <= pts[i][xi]) {
      const [a, b] = [pts[i - 1], pts[i]];
      return b[yi] === a[yi] ? a[yi] : a[yi] + (x - a[xi]) / (b[xi] - a[xi]) * (b[yi] - a[yi]);
    }
  }
  return last[yi];
}

// 9등급제 내신 컷 → 5등급제 환산 컷
function convert9to5(g9) {
  if (g9 == null) return null;
  const pct = interp(g9, MID9, 0, 1);   // 등급 → 누적%
  return +interp(pct, MID5, 1, 0).toFixed(2); // 누적% → 5등급제 등급
}

// 수능 백분위 → 9등급 (백분위 = 나보다 낮은 수험생 비율)
function pctToGrade9(percentile) {
  const topPct = 100 - percentile; // 상위 몇 %인지
  for (let g = 1; g <= 9; g++) if (topPct <= CUM9[g - 1]) return g;
  return 9;
}

// ---------------------------------------------------------------------
// 판정 기준 (컷 대비 여유폭)
// ---------------------------------------------------------------------
const JUNGSI_BANDS = [
  { key: "safe",      label: "안정",  min: 1.5 },
  { key: "fit",       label: "적정",  min: -0.5 },
  { key: "reach",     label: "소신",  min: -2.0 },
  { key: "challenge", label: "도전",  min: -4.0 },
];

// 5등급제 내신 스케일 (9등급제 대비 폭 약 55%로 압축)
const NAESIN_BANDS5 = [
  { key: "safe",      label: "안정",  min: 0.18 },
  { key: "fit",       label: "적정",  min: -0.08 },
  { key: "reach",     label: "소신",  min: -0.28 },
  { key: "challenge", label: "도전",  min: -0.55 },
];

const BAND_ORDER = { safe: 0, fit: 1, reach: 2, challenge: 3 };

function jungsiAvgOf(cut70) {
  return cut70 == null ? null : +Math.min(100, cut70 + ADMISSIONS_DATA.avgDelta.jungsi).toFixed(1);
}
function naesinAvgOf5(cut5) {
  return cut5 == null ? null : +Math.max(1.0, cut5 - ADMISSIONS_DATA.avgDelta.naesin5).toFixed(2);
}
function fmtJungsi(cut70) {
  if (cut70 == null) return "-";
  return `<b>${cut70}</b> <small class="avgTxt">(평균 ${jungsiAvgOf(cut70)})</small>`;
}
function fmtNaesin5(cut5) {
  if (cut5 == null) return "-";
  return `<b>${cut5}등급</b> <small class="avgTxt">(평균 ${naesinAvgOf5(cut5)})</small>`;
}

function englishAdvice(grade) {
  if (grade <= 1) return null;
  if (grade === 2) return "영어 2등급: 상위권 대학은 1~2등급 차이가 감점 0.5~2점 수준입니다. 최상위권·의약학 지원 시 1등급 확보가 안전합니다.";
  if (grade === 3) return "영어 3등급: 대학별 감점이 본격적으로 커집니다(3~5점 수준). 영어를 2등급 이상으로 올리는 것이 시급합니다.";
  return `영어 ${grade}등급: 정시에서 큰 감점 요인입니다. 절대평가(원점수 90점=1등급)이므로 단어·구문 학습으로 단기간에 올릴 수 있는 영역입니다. 최우선으로 보완하세요.`;
}

const GENERAL_SCIENCE_TIPS = [
  "자연계열 정시는 대부분 <b>수학 30~40% + 과학탐구 25~30%</b>로 반영합니다. 같은 1점이라도 수학·과탐이 국어보다 당락에 크게 작용합니다.",
  "2028학년도 수능(현 고1)은 통합형 — 선택과목 없이 <b>통합사회·통합과학을 모두 응시</b>합니다. 과학 개념의 빈틈이 그대로 점수로 드러나므로 고1 통합과학부터 탄탄히 다지세요.",
  "학생부종합에서는 <b>지망 학과와 맞는 과목의 심화(Ⅱ·진로선택) 이수</b> 여부가 전공적합성의 핵심 지표입니다.",
];

function deptTipsOf(deptId) {
  if (!deptId) return null;
  const sp = SPECIAL_DEPTS.find((s) => s.id === deptId);
  if (sp) return { name: sp.name, tips: sp.tips || [] };
  const d = (DEPARTMENTS[TRACK] || []).find((x) => x.id === deptId);
  if (d) return { name: d.name, tips: d.tips || [] };
  return null;
}

function isSpecialDept(deptId) {
  return SPECIAL_DEPTS.some((s) => s.id === deptId);
}

// ---------------------------------------------------------------------
// 대학별 반영 내신 · 수능 최저
// ---------------------------------------------------------------------
function gyogwaBasisOf(uni) {
  return GYOGWA_BASIS.byUni[uni.id] || GYOGWA_BASIS.default;
}

// 대학별 반영 기준에 따른 "반영 내신" (5등급제)
function reflectedNaesin(uni, naesin) {
  const basis = gyogwaBasisOf(uni);
  let vals = basis.include.map((s) => naesin[s]).filter((v) => v != null && !isNaN(v));
  if (!vals.length) return null;
  if (basis.topN) vals = vals.slice().sort((a, b) => a - b).slice(0, basis.topN);
  return +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
}

function minRequirementOf(uni, deptId) {
  if (deptId && isSpecialDept(deptId)) return MIN_REQUIREMENTS.special[deptId] || null;
  return MIN_REQUIREMENTS.byUni[uni.id] ?? null;
}

// 수능(모의고사) 영역별 등급
function suneungGrades(input) {
  return {
    국어: pctToGrade9(input.korean),
    수학: pctToGrade9(input.math),
    영어: input.english,
    탐구: pctToGrade9(Math.max(input.tamgu1, input.tamgu2)), // 통사·통과 중 상위 1과목
  };
}

// 최저기준 충족 판정: 유리한 count개 영역 등급 합 ≤ sum
function checkMinRequirement(req, grades) {
  if (!req) return { ok: true, none: true };
  const sorted = Object.values(grades).sort((a, b) => a - b);
  const best = sorted.slice(0, req.count).reduce((a, b) => a + b, 0);
  return { ok: best <= req.sum, none: false, best, req };
}

// ---------------------------------------------------------------------
// 성적 계산
// ---------------------------------------------------------------------
function calcJungsiAvg(scores) {
  const tamguAvg = (scores.tamgu1 + scores.tamgu2) / 2;
  return (scores.korean + scores.math + tamguAvg) / 3;
}

function classifyJungsi(myAvg, cut) {
  if (cut == null) return null;
  const diff = myAvg - cut;
  for (const band of JUNGSI_BANDS) if (diff >= band.min) return { ...band, diff };
  return { key: "hard", label: "위험", min: -Infinity, diff };
}

function classifyNaesin5(myGrade, cut5) {
  if (cut5 == null || myGrade == null) return null;
  const diff = cut5 - myGrade; // 양수 = 여유 있음
  for (const band of NAESIN_BANDS5) if (diff >= band.min) return { ...band, diff };
  return { key: "hard", label: "위험", min: -Infinity, diff };
}

function overallBand(...bands) {
  const candidates = bands.filter(Boolean).filter((b) => b.key !== "hard");
  if (!candidates.length) return { key: "hard", label: "위험" };
  candidates.sort((a, b) => BAND_ORDER[a.key] - BAND_ORDER[b.key]);
  return candidates[0];
}

// ---------------------------------------------------------------------
// 학과별 합격선 계산 (컷은 9등급제 원본 + 5등급제 환산 병행)
// ---------------------------------------------------------------------
function resolveCut(uni, deptId) {
  const t = uni.tracks[TRACK];
  if (!t) return null;

  let raw;
  if (!deptId) {
    raw = { jungsi: t.jungsi, gyogwa9: t.gyogwa, jonghap9: t.jonghap, label: "자연계열 평균", special: false };
  } else if (isSpecialDept(deptId)) {
    const sp = uni.special && uni.special[deptId];
    if (!sp) return null;
    const name = SPECIAL_DEPTS.find((s) => s.id === deptId).name;
    raw = {
      jungsi: sp.j,
      gyogwa9: sp.g,
      jonghap9: sp.g != null ? +(sp.g + 0.25).toFixed(2) : (t.jonghap != null ? +Math.max(1.0, t.jonghap - 0.5).toFixed(2) : null),
      label: name,
      special: true,
    };
  } else {
    const d = (DEPARTMENTS[TRACK] || []).find((x) => x.id === deptId);
    if (!d) return null;
    raw = {
      jungsi: t.jungsi == null ? null : +Math.min(99.5, t.jungsi + d.off).toFixed(1),
      gyogwa9: t.gyogwa == null ? null : +Math.max(1.0, t.gyogwa - d.off * 0.1).toFixed(2),
      jonghap9: t.jonghap == null ? null : +Math.max(1.0, t.jonghap - d.off * 0.1).toFixed(2),
      label: d.name,
      special: false,
    };
  }
  raw.gyogwa5 = convert9to5(raw.gyogwa9);
  raw.jonghap5 = convert9to5(raw.jonghap9);
  return raw;
}

// ---------------------------------------------------------------------
// 수시/정시 리스트 (대시보드용)
// ---------------------------------------------------------------------
function buildSusiList(input) {
  const rows = [];
  for (const uni of ADMISSIONS_DATA.universities) {
    const cut = resolveCut(uni, input.dept);
    if (!cut || (cut.gyogwa5 == null && cut.jonghap5 == null)) continue;
    const myNaesin = reflectedNaesin(uni, input.naesin);
    const gyogwaBand = classifyNaesin5(myNaesin, cut.gyogwa5);
    const jonghapBand = classifyNaesin5(myNaesin, cut.jonghap5 != null ? +(cut.jonghap5 + 0.2).toFixed(2) : null);
    const req = minRequirementOf(uni, input.dept);
    const minCheck = checkMinRequirement(req, input.grades);
    rows.push({ uni, cut, myNaesin, basis: gyogwaBasisOf(uni), gyogwaBand, jonghapBand, req, minCheck,
      overall: overallBand(gyogwaBand, jonghapBand) });
  }
  rows.sort((a, b) => {
    const o = BAND_ORDER[a.overall.key] ?? 9, p = BAND_ORDER[b.overall.key] ?? 9;
    if (o !== p) return o - p;
    return (a.cut.gyogwa5 ?? 9) - (b.cut.gyogwa5 ?? 9);
  });
  return rows;
}

function buildJungsiList(input) {
  const rows = [];
  for (const uni of ADMISSIONS_DATA.universities) {
    const cut = resolveCut(uni, input.dept);
    if (!cut || cut.jungsi == null) continue;
    const band = classifyJungsi(input.jungsiAvg, cut.jungsi);
    rows.push({ uni, cut, band });
  }
  rows.sort((a, b) => {
    const o = BAND_ORDER[a.band.key] ?? 9, p = BAND_ORDER[b.band.key] ?? 9;
    if (o !== p) return o - p;
    return (b.cut.jungsi ?? 0) - (a.cut.jungsi ?? 0);
  });
  return rows;
}

// 최적 학교 제안: 수시·정시 통합, 경로별 최고 판정 기준 안정2·적정2·소신/도전2
function buildRecommendations(susi, jungsi) {
  const byUni = new Map();
  for (const r of susi) {
    byUni.set(r.uni.id, { uni: r.uni, cut: r.cut, band: r.overall, route: r.gyogwaBand && BAND_ORDER[r.gyogwaBand.key] <= (BAND_ORDER[r.jonghapBand?.key] ?? 9) ? "수시 교과" : "수시 종합", minCheck: r.minCheck });
  }
  for (const r of jungsi) {
    const cur = byUni.get(r.uni.id);
    if (!cur || BAND_ORDER[r.band.key] < BAND_ORDER[cur.band.key]) {
      byUni.set(r.uni.id, { uni: r.uni, cut: r.cut, band: r.band, route: "정시", minCheck: cur ? cur.minCheck : { ok: true, none: true } });
    }
  }
  const all = [...byUni.values()];
  const pick = (key, n) => all.filter((x) => x.band.key === key)
    .sort((a, b) => (b.cut.jungsi ?? 0) - (a.cut.jungsi ?? 0)).slice(0, n);
  return [
    { title: "안정 (합격 가능성 높음)", items: pick("safe", 2) },
    { title: "적정 (실질 목표선)", items: pick("fit", 2) },
    { title: "도전 (상향 카드)", items: [...pick("reach", 2), ...pick("challenge", 1)].slice(0, 2) },
  ];
}

// ---------------------------------------------------------------------
// 목표 대학 코칭
// ---------------------------------------------------------------------
function requiredRemainingNaesin(current, completed, targetCut) {
  const total = ADMISSIONS_DATA.totalSemesters;
  const remaining = total - completed;
  if (remaining <= 0) return { possible: false, remaining: 0, need: null };
  const need = (targetCut * total - current * completed) / remaining;
  return { possible: need >= 1.0, remaining, need };
}

function subjectCoaching(input, gap) {
  const subjects = [
    { name: "국어", val: input.korean },
    { name: "수학", val: input.math },
    { name: "통합사회", val: input.tamgu1 },
    { name: "통합과학", val: input.tamgu2 },
  ].sort((a, b) => a.val - b.val);
  const tips = [];
  const weakest = subjects[0], second = subjects[1];
  const needIfOne = weakest.name.startsWith("통합") ? gap * 6 : gap * 3;
  tips.push(
    `최우선 보완 과목은 <b>${weakest.name}(백분위 ${weakest.val}·${pctToGrade9(weakest.val)}등급)</b>입니다. ` +
    `이 과목만으로 평균을 맞추려면 백분위 ${Math.min(100, Math.ceil(weakest.val + needIfOne))}까지 올려야 하므로, ` +
    `<b>${weakest.name}·${second.name}</b> 두 과목에 나누어 각각 백분위 ${Math.ceil(gap * 1.5)}~${Math.ceil(gap * 3)}점씩 끌어올리는 전략이 현실적입니다.`
  );
  const eng = englishAdvice(input.english);
  if (eng) tips.push(eng);
  return tips;
}

function buildCoaching(uni, input) {
  const cut = resolveCut(uni, input.dept);
  const result = { uni, deptLabel: "", routes: [], roadmap: [], verdict: "", weightTips: null };
  if (!cut) {
    result.verdict = input.dept && isSpecialDept(input.dept)
      ? `${uni.name}에는 해당 의약학 학과가 없습니다. 아래 학과별 표에서 다른 학과를 확인하세요.`
      : `${uni.name}에는 자연계열 데이터가 없습니다.`;
    result.roadmap = buildRoadmap(input);
    return result;
  }
  result.deptLabel = cut.label;
  const myNaesin = reflectedNaesin(uni, input.naesin);
  const basis = gyogwaBasisOf(uni);
  const req = minRequirementOf(uni, input.dept);
  const minCheck = checkMinRequirement(req, input.grades);

  // ---- 정시 ----
  if (cut.jungsi != null) {
    const band = classifyJungsi(input.jungsiAvg, cut.jungsi);
    const gap = cut.jungsi - input.jungsiAvg;
    const route = {
      name: "정시 (수능 위주)",
      cutText: `국·수·탐 평균 백분위 70%컷 약 ${cut.jungsi} · 합격자 평균 약 ${jungsiAvgOf(cut.jungsi)} (추정)`,
      myText: `내 평균 백분위 ${input.jungsiAvg.toFixed(1)}`,
      band, tips: [],
    };
    if (gap <= 0) {
      route.tips.push(`현재 성적으로 합격선(추정)을 ${Math.abs(gap).toFixed(1)}점 웃돌고 있습니다. 지금 수준을 유지·관리하는 것이 핵심입니다.`);
      const eng = englishAdvice(input.english);
      if (eng) route.tips.push(eng);
    } else {
      route.tips.push(`합격선까지 평균 백분위 <b>${gap.toFixed(1)}점</b>이 부족합니다.`);
      route.tips.push(...subjectCoaching(input, gap));
    }
    if (cut.special) route.tips.push("의약학 계열은 수학·과학 중심의 매우 높은 수능 성적이 실질 요건입니다. 전 과목 1등급대를 목표로 하세요.");
    result.routes.push(route);
  } else {
    result.routes.push({ name: "정시 (수능 위주)", cutText: "이 대학·학과는 정시 일반전형 비중이 매우 낮거나 없습니다.", myText: "", band: null, tips: ["수시 전형 중심으로 준비하세요."] });
  }

  // ---- 수시 교과 ----
  if (cut.gyogwa5 != null) {
    const band = classifyNaesin5(myNaesin, cut.gyogwa5);
    const route = {
      name: "수시 학생부교과",
      cutText: `내신 70%컷 약 ${cut.gyogwa5}등급(5등급제 환산 · 구 9등급제 ${cut.gyogwa9}) · 반영: ${basis.text}`,
      myText: `내 반영 내신 ${myNaesin}등급`,
      band, tips: [],
    };
    const gap = myNaesin - cut.gyogwa5;
    if (gap <= 0) {
      route.tips.push(`반영 내신이 환산 합격선보다 ${Math.abs(gap).toFixed(2)}등급 좋습니다. 남은 학기 내신을 유지하세요.`);
    } else {
      const r = requiredRemainingNaesin(myNaesin, input.completedSemesters, cut.gyogwa5);
      if (r.remaining === 0) {
        route.tips.push("내신 반영 학기(고3 1학기)가 모두 끝나 교과 성적을 더 올릴 수 없습니다. 학생부종합·논술·정시로 전략을 전환하세요.");
      } else if (!r.possible) {
        route.tips.push(`남은 ${r.remaining}개 학기에 전 과목 1등급을 받아도 환산 컷(${cut.gyogwa5})에 도달하기 어렵습니다. <b>학생부종합·논술·정시</b>에 무게를 두는 것이 합리적입니다.`);
      } else {
        route.tips.push(`남은 <b>${r.remaining}개 학기</b> 동안 반영 교과 평균 <b>${r.need.toFixed(2)}등급 이내</b>(5등급제)로 받으면 환산 컷에 도달할 수 있습니다.`);
      }
    }
    // 수능 최저
    if (req) {
      route.tips.push(
        (minCheck.ok
          ? `수능 최저기준(<b>${req.text}</b>·추정)을 현재 모의고사 기준 <b>충족</b>합니다 (내 상위 ${req.count}개 영역 합 ${minCheck.best}).`
          : `⚠️ 수능 최저기준(<b>${req.text}</b>·추정)을 현재 모의고사 기준 <b>미충족</b>입니다 (내 상위 ${req.count}개 영역 합 ${minCheck.best}). 내신이 좋아도 최저 미충족이면 불합격 — 수능 학습을 병행해야 합니다.`)
      );
    } else {
      route.tips.push("이 대학 교과전형은 수능 최저기준이 없는 것으로 추정됩니다 (요강 확인 필수).");
    }
    result.routes.push(route);
  } else {
    result.routes.push({ name: "수시 학생부교과", cutText: "이 대학·학과는 학생부교과전형으로 선발하지 않습니다.", myText: "", band: null, tips: [] });
  }

  // ---- 수시 종합 ----
  if (cut.jonghap5 != null) {
    const looseBand = classifyNaesin5(myNaesin, +(cut.jonghap5 + 0.2).toFixed(2));
    result.routes.push({
      name: "수시 학생부종합",
      cutText: `합격자 내신 평균 약 ${cut.jonghap5}등급대(5등급제 환산 · 편차 큼)`,
      myText: `내 반영 내신 ${myNaesin}등급`,
      band: looseBand,
      tips: [
        "학생부종합은 내신 수치보다 <b>전공 연계 활동·세특·탐구 경험</b>이 당락을 가릅니다.",
        `지망 학과(${cut.label})와 연결되는 과목 선택과 수행평가·발표·독서 기록을 학기마다 누적하세요.`,
        myNaesin > cut.jonghap5 + 0.4
          ? "현재 내신이 합격자 평균보다 낮은 편이므로, 활동의 '깊이'로 역전할 수 있는 특색 있는 탐구 주제를 만들어야 합니다."
          : "내신이 합격자 평균권이므로, 학교생활기록부의 일관된 스토리를 완성하는 데 집중하세요.",
      ],
    });
  }

  // ---- 논술 ----
  if (uni.nonsul) {
    result.routes.push({
      name: "수시 논술",
      cutText: "내신 영향 작음 · 논술 실력과 수능 최저 충족이 핵심",
      myText: "",
      band: null,
      tips: ["내신이 부족하지만 수능 모의고사 성적이 상승 중이라면 논술전형이 유효한 카드입니다. 기출 답안 작성 훈련을 병행하세요."],
    });
  }

  // ---- 결론 ----
  const scored = result.routes.filter((r) => r.band && r.band.key !== "hard");
  const targetName = `${uni.name} ${cut.label}`;
  if (scored.length) {
    scored.sort((a, b) => BAND_ORDER[a.band.key] - BAND_ORDER[b.band.key]);
    result.verdict = `현재 성적 기준으로 <b>${targetName}</b>은(는) <b>${scored[0].name}</b> 경로가 가장 유리합니다 (판정: ${scored[0].band.label}).`;
  } else {
    result.verdict = `현재 성적으로 <b>${targetName}</b>은(는) 모든 전형에서 합격선과 격차가 큽니다. 아래 로드맵대로 단계적으로 격차를 줄이거나, '적정' 판정 대학·학과와 병행 지원 전략을 세우세요.`;
  }

  result.roadmap = buildRoadmap(input);
  const dt = deptTipsOf(input.dept);
  result.weightTips = dt && dt.tips.length
    ? { title: `💪 ${dt.name} 지원 가중치 확보 팁`, items: dt.tips }
    : { title: "💪 이과생 공통 가중치 팁 (희망 학과를 선택하면 학과별 팁이 나옵니다)", items: GENERAL_SCIENCE_TIPS };
  return result;
}

function buildDeptTable(uni, input) {
  const rows = [];
  if (uni.special) {
    for (const s of SPECIAL_DEPTS) {
      if (!uni.special[s.id]) continue;
      const cut = resolveCut(uni, s.id);
      const myNaesin = reflectedNaesin(uni, input.naesin);
      rows.push({ name: s.name, cut, special: true, band: overallBand(classifyJungsi(input.jungsiAvg, cut.jungsi), classifyNaesin5(myNaesin, cut.gyogwa5)) });
    }
  }
  const myNaesin = reflectedNaesin(uni, input.naesin);
  for (const d of DEPARTMENTS[TRACK] || []) {
    const cut = resolveCut(uni, d.id);
    if (!cut) continue;
    rows.push({ name: d.name, cut, special: false, band: overallBand(classifyJungsi(input.jungsiAvg, cut.jungsi), classifyNaesin5(myNaesin, cut.gyogwa5)) });
  }
  return rows;
}

function buildRoadmap(input) {
  const done = input.completedSemesters;
  const items = [];
  if (done === 0) {
    items.push("【예비 고1】 고교 첫 시험(1학년 1학기 중간고사)이 3년 내신의 방향을 정합니다. 5등급제에서는 한 문제 차이로 등급이 갈리므로 '학교 시험 대비 습관'을 먼저 만드세요.");
    items.push("고교학점제 과목 선택이 학생부종합의 핵심입니다. 희망 전공과 연결되는 선택과목 계획을 입학 전에 세워두세요.");
  } else if (done <= 2) {
    items.push("【고1~2】 내신과 모의고사를 모두 살릴 수 있는 시기입니다. 내신 시험 4주 전은 내신, 그 외 기간은 수능 기반 학습으로 이원화하세요.");
    items.push("5등급제에서는 1등급(상위 10%)의 가치가 매우 큽니다. 반영 비중이 큰 국·수·과부터 1등급을 확보하세요.");
    items.push("생기부 활동(동아리·탐구·독서)을 전공 방향과 일치시키고, 학기마다 세특에 남을 결과물을 하나 이상 만드세요.");
  } else if (done <= 4) {
    items.push("【고2~3】 지금까지의 내신으로 수시 지원선이 대략 정해집니다. 교과·종합·논술·정시 중 2개 경로로 압축해 시간을 배분하세요.");
    items.push("6월·9월 평가원 모의고사 성적으로 정시 지원선을 냉정하게 재점검하고, 수능 최저기준 충족 전략(안정 과목 확보)을 세우세요.");
  } else {
    items.push("【고3 2학기~】 내신은 확정되었습니다. 수시 6장 카드 배분(안정 2 / 적정 2 / 도전 2)과 수능 마무리 학습에 모든 자원을 집중하세요.");
  }
  items.push("모든 지원 전에 대입정보포털 '어디가(adiga.kr)'에서 해당 대학·학과의 최신 입시결과와 모집요강(내신 반영법·수능 최저)을 반드시 확인하세요.");
  return items;
}

// ---------------------------------------------------------------------
// UI 바인딩
// ---------------------------------------------------------------------
function $(id) { return document.getElementById(id); }

const SEMESTER_LABELS = ["고1 1학기", "고1 2학기", "고2 1학기", "고2 2학기", "고3 1학기"];

// 학기 선택에 맞춰 학기별 내신 입력칸 생성 (기존 입력값 보존)
function renderNaesinInputs() {
  const count = parseInt($("semester").value, 10);
  const box = $("naesinSemesters");
  // 기존 값 보존
  const saved = {};
  box.querySelectorAll("input").forEach((el) => { saved[el.id] = el.value; });

  const blocks = [];
  if (count === 0) {
    blocks.push({ idx: 0, title: "예비 고1 — 목표(예상) 내신으로 시뮬레이션" });
  } else {
    for (let i = 0; i < count; i++) blocks.push({ idx: i, title: `${SEMESTER_LABELS[i]} 성적표` });
  }
  box.innerHTML = blocks.map((b) => `
    <div class="semBlock">
      <div class="semTitle">📄 ${b.title}</div>
      <div class="grid">
        ${NAESIN_SUBJECTS.map((s) => `
        <div>
          <label for="n_${b.idx}_${s}">${s}${s === "사회" ? "(통합사회)" : s === "과학" ? "(통합과학)" : ""}</label>
          <input type="number" id="n_${b.idx}_${s}" min="1" max="5" step="0.1"
                 value="${saved[`n_${b.idx}_${s}`] ?? "2.0"}">
        </div>`).join("")}
      </div>
    </div>`).join("");
  updateNaesinAvgLine();
}

// 학기별 입력 → 과목별 평균 (자동 계산)
function collectNaesin() {
  const rawCount = parseInt($("semester").value, 10);
  const count = Math.max(1, rawCount); // 예비 고1은 목표 1개 블록
  const naesin = {};
  const perSemErrors = [];
  for (const s of NAESIN_SUBJECTS) {
    let sum = 0, n = 0;
    for (let i = 0; i < count; i++) {
      const el = $(`n_${i}_${s}`);
      if (!el) continue;
      const v = parseFloat(el.value);
      if (!(v >= 1 && v <= 5)) {
        const semLabel = rawCount === 0 ? "목표 내신" : SEMESTER_LABELS[i];
        perSemErrors.push(`${semLabel} ${s} 등급은 1.0~5.0(5등급제) 사이로 입력하세요.`);
        continue;
      }
      sum += v; n++;
    }
    naesin[s] = n ? +(sum / n).toFixed(2) : NaN;
  }
  return { naesin, perSemErrors };
}

function updateNaesinAvgLine() {
  const { naesin } = collectNaesin();
  const line = $("naesinAvgLine");
  if (!line) return;
  const parts = NAESIN_SUBJECTS.map((s) => `${s} ${isNaN(naesin[s]) ? "-" : naesin[s]}`);
  const all = NAESIN_SUBJECTS.map((s) => naesin[s]).filter((v) => !isNaN(v));
  const avg = all.length ? (all.reduce((a, b) => a + b, 0) / all.length).toFixed(2) : "-";
  line.innerHTML = `🧮 자동 계산된 과목별 평균 — ${parts.join(" · ")} <span style="float:right">전과목 ${avg}등급</span>`;
}

function rebuildDeptOptions() {
  const sel = $("dept");
  const prev = sel.value;
  let html = `<option value="">자연계열 전체 (평균 기준)</option>`;
  html += `<optgroup label="의약학 계열 (보유 대학만 비교)">` +
    SPECIAL_DEPTS.map((s) => `<option value="${s.id}">${s.name}</option>`).join("") + `</optgroup>`;
  html += `<optgroup label="공학·자연 학과">` +
    (DEPARTMENTS[TRACK] || []).map((d) => `<option value="${d.id}">${d.name}</option>`).join("") + `</optgroup>`;
  sel.innerHTML = html;
  if ([...sel.options].some((o) => o.value === prev)) sel.value = prev;
}

function readInput() {
  const num = (id) => parseFloat($(id).value);
  const { naesin, perSemErrors } = collectNaesin();
  const input = {
    dept: $("dept").value || null,
    completedSemesters: parseInt($("semester").value, 10),
    naesin,
    korean: num("korean"),
    math: num("math"),
    english: parseInt($("english").value, 10),
    tamgu1: num("tamgu1"),
    tamgu2: num("tamgu2"),
  };
  const errors = [...perSemErrors];
  for (const s of NAESIN_SUBJECTS) {
    if (isNaN(naesin[s])) errors.push(`${s} 내신 등급을 입력하세요 (1.0~5.0, 5등급제).`);
  }
  for (const [k, label] of [["korean", "국어"], ["math", "수학"], ["tamgu1", "통합사회"], ["tamgu2", "통합과학"]]) {
    if (!(input[k] >= 0 && input[k] <= 100)) errors.push(`${label} 백분위는 0~100 사이로 입력하세요.`);
  }
  if (!errors.length) {
    input.jungsiAvg = calcJungsiAvg(input);
    input.grades = suneungGrades(input);
    input.naesinAll = +(NAESIN_SUBJECTS.reduce((a, s) => a + naesin[s], 0) / NAESIN_SUBJECTS.length).toFixed(2);
  } else {
    input.jungsiAvg = 0; input.grades = {}; input.naesinAll = 0;
  }
  return { input, errors };
}

function bandChip(band) {
  if (!band) return '<span class="chip none">-</span>';
  return `<span class="chip ${band.key}">${band.label}</span>`;
}

function deptLabelOf(input) {
  if (!input.dept) return "자연계열 전체";
  const sp = SPECIAL_DEPTS.find((s) => s.id === input.dept);
  if (sp) return sp.name;
  const d = (DEPARTMENTS[TRACK] || []).find((x) => x.id === input.dept);
  return d ? d.name : "자연계열 전체";
}

function minChipHtml(row) {
  if (row.req == null) return '<span class="chip none">최저 없음</span>';
  return row.minCheck.ok
    ? `<span class="chip safe" title="${row.req.text}">충족</span>`
    : `<span class="chip hard" title="${row.req.text}">미충족</span>`;
}

function renderDashboard() {
  const { input, errors } = readInput();
  const box = $("dashboard");
  if (errors.length) {
    box.innerHTML = `<div class="error">${errors.join("<br>")}</div>`;
    box.hidden = false;
    return;
  }
  const deptLabel = deptLabelOf(input);
  const susi = buildSusiList(input);
  const jungsi = buildJungsiList(input);
  const recos = buildRecommendations(susi, jungsi);
  const g = input.grades;

  const naesinWarn = input.naesinAll > 3.0
    ? `<div class="error" style="margin-bottom:12px">이 앱은 <b>내신 상위권(5등급제 1~2등급대)</b> 기준으로 설계되었습니다. 현재 입력값은 설계 범위 밖이므로 판정은 참고용으로만 보세요.</div>` : "";

  // ---- 요약 카드 ----
  const summary = `
    <div class="summary">
      <div><span>내신 전과목 평균 (5등급제)</span><b>${input.naesinAll}등급</b></div>
      <div><span>수능 국·수·탐 평균 백분위</span><b>${input.jungsiAvg.toFixed(1)}</b></div>
      <div><span>수능 영역별 등급 (9등급제)</span><b class="gradesLine">국${g.국어}·수${g.수학}·영${g.영어}·탐${g.탐구}</b></div>
      <div><span>기준 학과</span><b>${deptLabel}</b></div>
    </div>`;

  // ---- 최적 학교 제안 ----
  const recoHtml = `
    <div class="recoBox">
      <h3>🏆 내 성적 기반 최적 학교 제안 <small>(수시·정시 중 가장 유리한 경로 기준)</small></h3>
      <div class="recoGrid">
        ${recos.map((r) => `
          <div class="recoCol">
            <div class="recoTitle">${r.title}</div>
            ${r.items.length ? r.items.map((x) => `
              <div class="recoItem">
                <b>${x.uni.name}</b>
                <div class="recoRoute">${x.route} ${bandChip(x.band)}${x.route.startsWith("수시 교과") && !x.minCheck.none ? (x.minCheck.ok ? " · 최저 충족" : " · ⚠️최저 미충족") : ""}</div>
              </div>`).join("") : `<div class="recoItem none">해당 구간 없음</div>`}
          </div>`).join("")}
      </div>
    </div>`;

  // ---- 수시 대시보드 ----
  const susiRows = susi.map((r) => `
    <tr>
      <td>${bandChip(r.overall)}</td>
      <td class="uname">${r.uni.name} <small>${r.uni.region}</small></td>
      <td><b>${r.myNaesin ?? "-"}</b><br><small class="avgTxt">${r.basis.text}</small></td>
      <td>${fmtNaesin5(r.cut.gyogwa5)}${r.cut.gyogwa9 != null ? `<br><small class="avgTxt">구 9등급제 ${r.cut.gyogwa9}</small>` : ""}</td>
      <td>${minChipHtml(r)}</td>
    </tr>`).join("");

  const susiPanel = `
    <div class="panel susiPanel">
      <div class="panelHead">📗 수시 대시보드 <small>내신(학생부) 기반</small></div>
      <div class="explain">
        <b>수시란?</b> 고3 9월에 원서를 내는 전형으로 <b>내신·학교생활기록부가 핵심</b>입니다.
        최대 6장의 카드를 쓸 수 있고, 교과(내신 정량)·종합(내신+활동 정성)·논술로 나뉩니다.
        내신은 <b>5등급제</b>(1등급=상위 10%)로 평가되며, 대학마다 <b>반영 교과 조합·과목 수가 다르므로</b>
        아래 표의 '내 반영 내신'은 대학별 기준으로 각각 계산된 값입니다.
        많은 대학이 <b>수능 최저학력기준</b>을 요구하므로 내신이 좋아도 수능을 놓치면 불합격합니다.
      </div>
      <table>
        <thead><tr><th>판정</th><th>대학</th><th>내 반영 내신</th><th>교과 70%컷 (5등급제 환산)</th><th>수능 최저</th></tr></thead>
        <tbody>${susiRows}</tbody>
      </table>
      <p class="fine">판정은 교과·종합 중 유리한 쪽. 컷은 공개된 9등급제 입결을 비율 기준으로 5등급제 환산한 추정치이며, 최저기준·반영법은 대표 전형 기준 추정입니다 (매년 모집요강 확인 필수).</p>
    </div>`;

  // ---- 정시 대시보드 ----
  const jungsiRows = jungsi.map((r) => `
    <tr>
      <td>${bandChip(r.band)}</td>
      <td class="uname">${r.uni.name} <small>${r.uni.region}</small></td>
      <td>${fmtJungsi(r.cut.jungsi)}</td>
    </tr>`).join("");

  const cutTable = `
    <details class="cutRef">
      <summary>📐 수능 등급컷 참고표 (9등급 상대평가 · 등급별 백분위 하한)</summary>
      <table>
        <thead><tr><th>등급</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th></tr></thead>
        <tbody>
          <tr><td>비율(누적)</td><td>4%</td><td>11%</td><td>23%</td><td>40%</td><td>60%</td><td>77%</td><td>89%</td><td>96%</td><td>100%</td></tr>
          <tr><td>백분위 하한</td><td>96</td><td>89</td><td>77</td><td>60</td><td>40</td><td>23</td><td>11</td><td>4</td><td>0</td></tr>
        </tbody>
      </table>
      <p class="fine">등급컷의 '원점수'는 시험 난이도에 따라 매번 달라지지만 비율은 고정입니다. 그래서 시험 간 비교에는 원점수가 아닌 <b>백분위</b>를 쓰는 것이 정확합니다.</p>
    </details>`;

  const jungsiPanel = `
    <div class="panel jungsiPanel">
      <div class="panelHead">📘 정시 대시보드 <small>수능 기반</small></div>
      <div class="explain">
        <b>정시란?</b> 수능 성적으로 12월 말~1월에 지원하는 전형입니다. 가·나·다군 <b>3장의 카드</b>를 쓰며
        내신 영향은 작습니다(일부 대학 교과 반영). 수능은 <b>9등급 상대평가</b>이고, 대학은 주로
        표준점수·백분위를 사용합니다. 자연계열은 <b>수학 30~40% + 과탐 가중</b> 반영이 일반적이라
        수학·과학 점수가 당락을 좌우합니다. 내 영역별 등급: <b>국어 ${g.국어} · 수학 ${g.수학} · 영어 ${g.영어} · 탐구 ${g.탐구}등급</b>
      </div>
      ${cutTable}
      <table>
        <thead><tr><th>판정</th><th>대학</th><th>정시 70%컷 (평균)</th></tr></thead>
        <tbody>${jungsiRows}</tbody>
      </table>
      <p class="fine">국·수·탐 평균 백분위 기준 추정 판정입니다. 대학별 표준점수 산식·영어 감점·과탐 가산에 따라 실제와 차이가 날 수 있습니다.</p>
    </div>`;

  box.innerHTML = `${naesinWarn}${summary}${recoHtml}
    <div class="dashGrid">${susiPanel}${jungsiPanel}</div>`;
  box.hidden = false;

  // 목표 대학 선택지 갱신 (수시·정시 통합 최적 판정 순)
  const orderMap = new Map();
  for (const r of susi) orderMap.set(r.uni.id, { uni: r.uni, band: r.overall });
  for (const r of jungsi) {
    const cur = orderMap.get(r.uni.id);
    if (!cur || BAND_ORDER[r.band.key] < BAND_ORDER[cur.band.key]) orderMap.set(r.uni.id, { uni: r.uni, band: r.band });
  }
  const opts = [...orderMap.values()].sort((a, b) => (BAND_ORDER[a.band.key] ?? 9) - (BAND_ORDER[b.band.key] ?? 9));
  const sel = $("targetUni");
  const prev = sel.value;
  sel.innerHTML = opts.map((o) => `<option value="${o.uni.id}">[${o.band.label}] ${o.uni.name}</option>`).join("");
  if (prev && opts.some((o) => o.uni.id === prev)) sel.value = prev;
  $("coachSection").hidden = false;
  $("coachResult").hidden = true;
}

function renderCoaching() {
  const { input, errors } = readInput();
  const box = $("coachResult");
  if (errors.length) {
    box.innerHTML = `<div class="error">${errors.join("<br>")}</div>`;
    box.hidden = false;
    return;
  }
  const uni = ADMISSIONS_DATA.universities.find((u) => u.id === $("targetUni").value);
  if (!uni) return;
  const c = buildCoaching(uni, input);

  const routesHtml = c.routes.map((r) => `
    <div class="route">
      <div class="routeHead"><b>${r.name}</b> ${bandChip(r.band)}</div>
      <div class="routeCuts">${r.cutText}${r.myText ? ` · ${r.myText}` : ""}</div>
      ${r.tips.length ? `<ul>${r.tips.map((t) => `<li>${t}</li>`).join("")}</ul>` : ""}
    </div>`).join("");

  const deptRows = buildDeptTable(uni, input);
  const deptTable = deptRows.length ? `
    <div class="deptTable">
      <b>🏫 ${uni.name} 학과별 예상 합격선 (자연계열, 내 성적 기준 판정)</b>
      <table>
        <thead><tr><th>학과</th><th>정시 70%컷 (평균)</th><th>교과 70%컷 (5등급제)</th><th>내 판정</th></tr></thead>
        <tbody>
          ${deptRows.map((r) => `
          <tr class="${r.special ? "spRow" : ""}">
            <td>${r.special ? "💊 " : ""}${r.name}</td>
            <td>${fmtJungsi(r.cut.jungsi)}</td>
            <td>${fmtNaesin5(r.cut.gyogwa5)}</td>
            <td>${bandChip(r.band)}</td>
          </tr>`).join("")}
        </tbody>
      </table>
      <p class="fine">일반 학과 컷은 계열 평균에 학과 선호도 보정치를 적용한 추정치입니다. 내신 컷은 5등급제 환산 값입니다.</p>
    </div>` : "";

  box.innerHTML = `
    <h3>🎯 ${uni.name}${c.deptLabel ? " " + c.deptLabel : ""} — 맞춤 전략 코칭</h3>
    <p class="verdict">${c.verdict}</p>
    ${uni.note ? `<p class="fine">ℹ️ ${uni.note}</p>` : ""}
    ${routesHtml}
    ${c.weightTips ? `
    <div class="weightTips">
      <b>${c.weightTips.title}</b>
      <ul>${c.weightTips.items.map((t) => `<li>${t}</li>`).join("")}</ul>
    </div>` : ""}
    ${deptTable}
    <div class="roadmap">
      <b>📅 지금 해야 할 일 (로드맵)</b>
      <ul>${c.roadmap.map((t) => `<li>${t}</li>`).join("")}</ul>
    </div>`;
  box.hidden = false;
  box.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener("DOMContentLoaded", () => {
  $("dataVersion").textContent = ADMISSIONS_DATA.dataVersion;
  $("sources").innerHTML = ADMISSIONS_DATA.sources
    .map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a>`).join(" · ");
  rebuildDeptOptions();
  renderNaesinInputs();
  $("semester").addEventListener("change", renderNaesinInputs);
  $("naesinSemesters").addEventListener("input", updateNaesinAvgLine);
  $("btnList").addEventListener("click", renderDashboard);
  $("btnCoach").addEventListener("click", renderCoaching);
});
