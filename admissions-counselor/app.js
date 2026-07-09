/* =====================================================================
 * 대입 전략 상담 프로그램 — 진단 · 코칭 로직
 * 데이터는 data.js(ADMISSIONS_DATA, DEPARTMENTS, SPECIAL_DEPTS)에서
 * 읽어오며, 이 파일은 수정 없이 데이터만 갱신해도 동작합니다.
 * ===================================================================== */

"use strict";

// ---------------------------------------------------------------------
// 판정 기준 (컷 대비 여유폭)
// ---------------------------------------------------------------------
const JUNGSI_BANDS = [
  // 국수탐 평균 백분위: (내 점수 - 컷) 기준
  { key: "safe",      label: "안정",  min: 1.5 },
  { key: "fit",       label: "적정",  min: -0.5 },
  { key: "reach",     label: "소신",  min: -2.0 },
  { key: "challenge", label: "도전",  min: -4.0 },
];

const NAESIN_BANDS = [
  // 내신 등급: (컷 - 내 등급) 기준 (등급은 낮을수록 좋음)
  { key: "safe",      label: "안정",  min: 0.3 },
  { key: "fit",       label: "적정",  min: -0.15 },
  { key: "reach",     label: "소신",  min: -0.5 },
  { key: "challenge", label: "도전",  min: -1.0 },
];

const BAND_ORDER = { safe: 0, fit: 1, reach: 2, challenge: 3 };

// 영어 절대평가 등급별 정시 체감 보정(백분위 환산 참고치)
function englishAdvice(grade) {
  if (grade <= 1) return null;
  if (grade === 2) return "영어 2등급: 상위권 대학은 1~2등급 차이가 감점 0.5~2점 수준입니다. 최상위권·의약학 지원 시 1등급 확보가 안전합니다.";
  if (grade === 3) return "영어 3등급: 대학별 감점이 본격적으로 커집니다(3~5점 수준). 영어를 2등급 이상으로 올리는 것이 시급합니다.";
  return `영어 ${grade}등급: 정시에서 큰 감점 요인입니다. 절대평가(원점수 90점=1등급)이므로 단어·구문 학습으로 단기간에 올릴 수 있는 영역입니다. 최우선으로 보완하세요.`;
}

// ---------------------------------------------------------------------
// 학과별 합격선 계산
// ---------------------------------------------------------------------
function isSpecialDept(deptId) {
  return SPECIAL_DEPTS.some((s) => s.id === deptId);
}

/**
 * 대학 × 계열 × 학과의 예상 합격선을 계산합니다.
 * @returns {jungsi, gyogwa, jonghap, label, special} 또는
 *          null(해당 대학에 그 학과 없음 / 계열 없음)
 */
function resolveCut(uni, track, deptId) {
  const t = uni.tracks[track];
  if (!t) return null;

  // (1) 학과 미선택 → 계열 평균
  if (!deptId) {
    return { jungsi: t.jungsi, gyogwa: t.gyogwa, jonghap: t.jonghap, label: `${track}계열 평균`, special: false };
  }

  // (2) 의약학 계열 → 대학별 개별 수치 (보유 대학만)
  if (isSpecialDept(deptId)) {
    const sp = uni.special && uni.special[deptId];
    if (!sp) return null;
    const name = SPECIAL_DEPTS.find((s) => s.id === deptId).name;
    return {
      jungsi: sp.j,
      gyogwa: sp.g,
      jonghap: sp.g != null
        ? +(sp.g + 0.25).toFixed(2)
        : (t.jonghap != null ? +Math.max(1.0, t.jonghap - 0.5).toFixed(2) : null),
      label: name,
      special: true,
    };
  }

  // (3) 일반 학과 → 계열 평균 + 선호도 보정치
  const d = (DEPARTMENTS[track] || []).find((x) => x.id === deptId);
  if (!d) return null;
  return {
    jungsi: t.jungsi == null ? null : +Math.min(99.5, t.jungsi + d.off).toFixed(1),
    gyogwa: t.gyogwa == null ? null : +Math.max(1.0, t.gyogwa - d.off * 0.1).toFixed(2),
    jonghap: t.jonghap == null ? null : +Math.max(1.0, t.jonghap - d.off * 0.1).toFixed(2),
    label: d.name,
    special: false,
  };
}

// ---------------------------------------------------------------------
// 성적 계산
// ---------------------------------------------------------------------
function calcJungsiAvg(scores) {
  // 국어 + 수학 + 탐구2과목 평균 → 국수탐 평균 백분위
  const tamguAvg = (scores.tamgu1 + scores.tamgu2) / 2;
  return (scores.korean + scores.math + tamguAvg) / 3;
}

function classifyJungsi(myAvg, cut) {
  if (cut == null) return null;
  const diff = myAvg - cut;
  for (const band of JUNGSI_BANDS) {
    if (diff >= band.min) return { ...band, diff };
  }
  return { key: "hard", label: "위험", min: -Infinity, diff };
}

function classifyNaesin(myGrade, cut) {
  if (cut == null || !myGrade) return null;
  const diff = cut - myGrade; // 양수 = 여유 있음
  for (const band of NAESIN_BANDS) {
    if (diff >= band.min) return { ...band, diff };
  }
  return { key: "hard", label: "위험", min: -Infinity, diff };
}

function overallBand(jungsiBand, gyogwaBand) {
  const candidates = [jungsiBand, gyogwaBand].filter(Boolean).filter((b) => b.key !== "hard");
  if (!candidates.length) return { key: "hard", label: "위험" };
  candidates.sort((a, b) => BAND_ORDER[a.key] - BAND_ORDER[b.key]);
  return candidates[0];
}

// ---------------------------------------------------------------------
// 기능 1: 지원 가능 대학 리스트 (희망 학과 반영)
// ---------------------------------------------------------------------
function buildUniversityList(input) {
  const rows = [];
  for (const uni of ADMISSIONS_DATA.universities) {
    const cut = resolveCut(uni, input.track, input.dept);
    if (!cut) continue; // 계열 또는 해당 학과 없음
    const jungsi = classifyJungsi(input.jungsiAvg, cut.jungsi);
    const gyogwa = classifyNaesin(input.naesin, cut.gyogwa);
    rows.push({ uni, cut, jungsi, gyogwa, overall: overallBand(jungsi, gyogwa) });
  }
  rows.sort((a, b) => {
    const o = BAND_ORDER[a.overall.key] ?? 9;
    const p = BAND_ORDER[b.overall.key] ?? 9;
    if (o !== p) return o - p;
    return (b.cut.jungsi ?? 0) - (a.cut.jungsi ?? 0);
  });
  return rows;
}

// ---------------------------------------------------------------------
// 기능 2: 목표 대학·학과 갭 분석 + 코칭
// ---------------------------------------------------------------------
function requiredRemainingNaesin(current, completed, targetCut) {
  // 목표 평균을 맞추기 위해 남은 학기 동안 받아야 하는 평균 등급
  const total = ADMISSIONS_DATA.totalSemesters;
  const remaining = total - completed;
  if (remaining <= 0) return { possible: false, remaining: 0, need: null };
  const need = (targetCut * total - current * completed) / remaining;
  return { possible: need >= 1.0, remaining, need };
}

function subjectCoaching(input, gap) {
  // 백분위가 낮은 과목부터 보완 우선순위 제시
  const subjects = [
    { name: "국어", val: input.korean },
    { name: "수학", val: input.math },
    { name: "탐구1", val: input.tamgu1 },
    { name: "탐구2", val: input.tamgu2 },
  ].sort((a, b) => a.val - b.val);

  const tips = [];
  const weakest = subjects[0];
  const second = subjects[1];
  // 평균을 gap만큼 올리려면: 한 과목만 올릴 경우 국·수는 3배, 탐구는 6배 상승 필요
  const needIfOne = weakest.name.startsWith("탐구") ? gap * 6 : gap * 3;
  tips.push(
    `최우선 보완 과목은 <b>${weakest.name}(백분위 ${weakest.val})</b>입니다. ` +
    `이 과목만으로 평균을 맞추려면 백분위 ${Math.min(100, Math.ceil(weakest.val + needIfOne))}까지 올려야 하므로, ` +
    `<b>${weakest.name}·${second.name}</b> 두 과목에 나누어 각각 백분위 ${Math.ceil(gap * 1.5)}~${Math.ceil(gap * 3)}점씩 끌어올리는 전략이 현실적입니다.`
  );
  const eng = englishAdvice(input.english);
  if (eng) tips.push(eng);
  return tips;
}

function buildCoaching(uni, input) {
  const cut = resolveCut(uni, input.track, input.dept);
  const result = { uni, track: input.track, deptLabel: "", routes: [], roadmap: [], verdict: "" };
  if (!cut) {
    result.verdict = input.dept && isSpecialDept(input.dept)
      ? `${uni.name}에는 해당 의약학 학과가 없습니다. 아래 학과별 표에서 다른 학과를 확인하세요.`
      : `${uni.name}에는 ${input.track}계열 데이터가 없습니다.`;
    result.roadmap = buildRoadmap(input);
    return result;
  }
  result.deptLabel = cut.label;

  // ---- 정시 경로 ----
  if (cut.jungsi != null) {
    const band = classifyJungsi(input.jungsiAvg, cut.jungsi);
    const gap = cut.jungsi - input.jungsiAvg;
    const route = {
      name: "정시 (수능 위주)",
      cutText: `국·수·탐 평균 백분위 약 ${cut.jungsi} 필요 (추정)`,
      myText: `내 평균 백분위 ${input.jungsiAvg.toFixed(1)}`,
      band,
      tips: [],
    };
    if (gap <= 0) {
      route.tips.push(`현재 성적으로 합격선(추정)을 ${Math.abs(gap).toFixed(1)}점 웃돌고 있습니다. 지금 수준을 유지·관리하는 것이 핵심입니다.`);
      const eng = englishAdvice(input.english);
      if (eng) route.tips.push(eng);
    } else {
      route.tips.push(`합격선까지 평균 백분위 <b>${gap.toFixed(1)}점</b>이 부족합니다.`);
      route.tips.push(...subjectCoaching(input, gap));
    }
    if (cut.special) {
      route.tips.push("의약학 계열은 수학(미적분/기하)·과탐 지정 및 <b>수능 최저학력기준</b>이 매우 높습니다. 전 과목 1등급대가 실질 요건입니다.");
    }
    result.routes.push(route);
  } else {
    result.routes.push({
      name: "정시 (수능 위주)",
      cutText: "이 대학·학과는 정시 일반전형 비중이 매우 낮거나 없습니다.",
      myText: "",
      band: null,
      tips: ["수시 전형 중심으로 준비하세요."],
    });
  }

  // ---- 수시 교과 경로 ----
  if (cut.gyogwa != null) {
    const band = classifyNaesin(input.naesin, cut.gyogwa);
    const route = {
      name: "수시 학생부교과",
      cutText: `내신 약 ${cut.gyogwa}등급 필요 (추정)`,
      myText: `내 내신 평균 ${input.naesin}등급`,
      band,
      tips: [],
    };
    const gap = input.naesin - cut.gyogwa;
    if (gap <= 0) {
      route.tips.push(`내신이 합격선(추정)보다 ${Math.abs(gap).toFixed(2)}등급 좋습니다. 남은 학기 내신을 유지하고, 수능 최저학력기준 충족 여부를 반드시 확인하세요.`);
    } else {
      const r = requiredRemainingNaesin(input.naesin, input.completedSemesters, cut.gyogwa);
      if (r.remaining === 0) {
        route.tips.push("내신 반영 학기(고3 1학기)가 모두 끝나 교과 성적을 더 올릴 수 없습니다. 학생부종합·논술·정시로 전략을 전환하세요.");
      } else if (!r.possible) {
        route.tips.push(
          `남은 ${r.remaining}개 학기에 전 과목 1.0등급을 받아도 목표 컷(${cut.gyogwa})에 도달하기 어렵습니다. ` +
          `교과전형 대신 <b>학생부종합·논술·정시</b>에 무게를 두는 것이 합리적입니다.`
        );
      } else {
        route.tips.push(
          `남은 <b>${r.remaining}개 학기</b> 동안 평균 <b>${r.need.toFixed(2)}등급 이내</b>로 받으면 목표 컷에 도달할 수 있습니다. ` +
          `주요 교과(국·영·수·사/과) 중심으로 내신을 끌어올리세요.`
        );
      }
    }
    result.routes.push(route);
  } else {
    result.routes.push({
      name: "수시 학생부교과",
      cutText: "이 대학·학과는 학생부교과전형으로 선발하지 않습니다.",
      myText: "",
      band: null,
      tips: [],
    });
  }

  // ---- 수시 종합 경로 ----
  if (cut.jonghap != null) {
    const looseBand = classifyNaesin(input.naesin, cut.jonghap + 0.3); // 종합은 정성평가라 폭 넓게
    result.routes.push({
      name: "수시 학생부종합",
      cutText: `합격자 내신 평균 약 ${cut.jonghap}등급대 (편차 큼)`,
      myText: `내 내신 평균 ${input.naesin}등급`,
      band: looseBand,
      tips: [
        "학생부종합은 내신 수치보다 <b>전공 연계 활동·세특(세부능력 및 특기사항)·탐구 경험</b>이 당락을 가릅니다.",
        `지망 학과(${cut.label})와 연결되는 과목 선택(진로선택·융합선택 과목)과 수행평가·발표·독서 기록을 학기마다 누적하세요.`,
        input.naesin > cut.jonghap + 0.7
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

  // ---- 종합 결론 ----
  const scored = result.routes.filter((r) => r.band && r.band.key !== "hard");
  const targetName = `${uni.name} ${cut.label}`;
  if (scored.length) {
    scored.sort((a, b) => BAND_ORDER[a.band.key] - BAND_ORDER[b.band.key]);
    const best = scored[0];
    result.verdict = `현재 성적 기준으로 <b>${targetName}</b>은(는) <b>${best.name}</b> 경로가 가장 유리합니다 (판정: ${best.band.label}).`;
  } else {
    result.verdict = `현재 성적으로 <b>${targetName}</b>은(는) 모든 전형에서 합격선과 격차가 큽니다. 아래 로드맵대로 단계적으로 격차를 줄이거나, '적정' 판정 대학·학과와 병행 지원 전략을 세우세요.`;
  }

  // ---- 학년별 로드맵 ----
  result.roadmap = buildRoadmap(input);
  return result;
}

// 목표 대학의 학과별 예상 합격선 표 데이터
function buildDeptTable(uni, input) {
  const rows = [];
  // 의약학 (자연 계열에서만 노출)
  if (input.track === "자연" && uni.special) {
    for (const s of SPECIAL_DEPTS) {
      if (!uni.special[s.id]) continue;
      const cut = resolveCut(uni, "자연", s.id);
      rows.push({ name: s.name, cut, special: true, band: overallBand(classifyJungsi(input.jungsiAvg, cut.jungsi), classifyNaesin(input.naesin, cut.gyogwa)) });
    }
  }
  for (const d of DEPARTMENTS[input.track] || []) {
    const cut = resolveCut(uni, input.track, d.id);
    if (!cut) continue;
    rows.push({ name: d.name, cut, special: false, band: overallBand(classifyJungsi(input.jungsiAvg, cut.jungsi), classifyNaesin(input.naesin, cut.gyogwa)) });
  }
  return rows;
}

function buildRoadmap(input) {
  const done = input.completedSemesters;
  const items = [];
  if (done === 0) {
    items.push("【예비 고1】 고교 첫 시험(1학년 1학기 중간고사)이 3년 내신의 방향을 정합니다. 국·영·수 선행보다 '학교 시험 대비 습관'을 먼저 만드세요.");
    items.push("고교학점제 과목 선택이 학생부종합의 핵심입니다. 희망 전공과 연결되는 선택과목 계획을 입학 전에 세워두세요.");
  } else if (done <= 2) {
    items.push("【고1~2】 내신과 모의고사를 모두 살릴 수 있는 시기입니다. 내신 시험 4주 전은 내신, 그 외 기간은 수능 기반 학습으로 이원화하세요.");
    items.push("생기부 활동(동아리·탐구·독서)을 전공 방향과 일치시키고, 학기마다 세특에 남을 결과물을 하나 이상 만드세요.");
  } else if (done <= 4) {
    items.push("【고2~3】 지금까지의 내신으로 수시 지원선이 대략 정해집니다. 교과·종합·논술·정시 중 2개 경로로 압축해 시간을 배분하세요.");
    items.push("6월·9월 평가원 모의고사 성적으로 정시 지원선을 냉정하게 재점검하고, 수능 최저기준 충족 전략(안정 과목 확보)을 세우세요.");
  } else {
    items.push("【고3 2학기~】 내신은 확정되었습니다. 수시 6장 카드 배분(안정 2 / 적정 2 / 도전 2)과 수능 마무리 학습에 모든 자원을 집중하세요.");
  }
  items.push("모든 지원 전에 대입정보포털 '어디가(adiga.kr)'에서 해당 대학·학과의 최신 입시결과와 모집요강을 반드시 확인하세요.");
  return items;
}

// ---------------------------------------------------------------------
// UI 바인딩
// ---------------------------------------------------------------------
function $(id) { return document.getElementById(id); }

function rebuildDeptOptions() {
  const track = $("track").value;
  const sel = $("dept");
  const prev = sel.value;
  let html = `<option value="">계열 전체 (평균 기준)</option>`;
  if (track === "자연") {
    html += `<optgroup label="의약학 계열 (보유 대학만 비교)">` +
      SPECIAL_DEPTS.map((s) => `<option value="${s.id}">${s.name}</option>`).join("") +
      `</optgroup>`;
  }
  html += `<optgroup label="일반 학과">` +
    (DEPARTMENTS[track] || []).map((d) => `<option value="${d.id}">${d.name}</option>`).join("") +
    `</optgroup>`;
  sel.innerHTML = html;
  if ([...sel.options].some((o) => o.value === prev)) sel.value = prev;
}

function readInput() {
  const num = (id) => parseFloat($(id).value);
  const input = {
    track: $("track").value,
    dept: $("dept").value || null,
    completedSemesters: parseInt($("semester").value, 10),
    naesin: num("naesin"),
    korean: num("korean"),
    math: num("math"),
    english: parseInt($("english").value, 10),
    tamgu1: num("tamgu1"),
    tamgu2: num("tamgu2"),
  };
  const errors = [];
  if (!(input.naesin >= 1 && input.naesin <= 9)) errors.push("내신 등급은 1.0~9.0 사이로 입력하세요.");
  for (const [k, label] of [["korean", "국어"], ["math", "수학"], ["tamgu1", "탐구1"], ["tamgu2", "탐구2"]]) {
    if (!(input[k] >= 0 && input[k] <= 100)) errors.push(`${label} 백분위는 0~100 사이로 입력하세요.`);
  }
  input.jungsiAvg = errors.length ? 0 : calcJungsiAvg(input);
  return { input, errors };
}

function bandChip(band) {
  if (!band) return '<span class="chip none">-</span>';
  return `<span class="chip ${band.key}">${band.label}</span>`;
}

function deptLabelOf(input) {
  if (!input.dept) return "계열 전체";
  const sp = SPECIAL_DEPTS.find((s) => s.id === input.dept);
  if (sp) return sp.name;
  const d = (DEPARTMENTS[input.track] || []).find((x) => x.id === input.dept);
  return d ? d.name : "계열 전체";
}

function renderList() {
  const { input, errors } = readInput();
  const box = $("listResult");
  if (errors.length) {
    box.innerHTML = `<div class="error">${errors.join("<br>")}</div>`;
    box.hidden = false;
    return;
  }

  const rows = buildUniversityList(input);
  const deptLabel = deptLabelOf(input);
  const summary = `
    <div class="summary">
      <div><span>국·수·탐 평균 백분위</span><b>${input.jungsiAvg.toFixed(1)}</b></div>
      <div><span>영어</span><b>${input.english}등급</b></div>
      <div><span>내신 평균</span><b>${input.naesin}등급</b></div>
      <div><span>기준 학과</span><b>${deptLabel}</b></div>
    </div>`;

  const tr = rows.map((r) => `
    <tr>
      <td>${bandChip(r.overall)}</td>
      <td class="uname">${r.uni.name} <small>${r.uni.region}</small></td>
      <td>${r.cut.jungsi != null ? r.cut.jungsi : "-"} ${bandChip(r.jungsi)}</td>
      <td>${r.cut.gyogwa != null ? r.cut.gyogwa + "등급" : "-"} ${bandChip(r.gyogwa)}</td>
    </tr>`).join("");

  const specialNote = input.dept && isSpecialDept(input.dept)
    ? `<p class="fine">💊 ${deptLabel} 보유 대학 ${rows.length}곳만 표시됩니다. 의약학은 수능 최저·과목 지정 요건이 별도로 있습니다.</p>` : "";

  box.innerHTML = `${summary}
    <table>
      <thead><tr><th>종합판정</th><th>대학</th><th>정시컷(백분위·추정)</th><th>교과컷(내신·추정)</th></tr></thead>
      <tbody>${tr}</tbody>
    </table>
    ${specialNote}
    <p class="fine">판정 기준 — 안정: 여유 충분 / 적정: 합격선 부근 / 소신: 약간 부족 / 도전: 격차 큼 / 위험: 현재로선 어려움. 종합판정은 정시·교과 중 더 유리한 쪽입니다. 컷은 선택한 학과(${deptLabel}) 기준 추정치입니다.</p>`;
  box.hidden = false;

  // 목표 대학 선택지 갱신
  const sel = $("targetUni");
  const prev = sel.value;
  sel.innerHTML = rows.map((r) => `<option value="${r.uni.id}">[${r.overall.label}] ${r.uni.name}</option>`).join("");
  if (prev && rows.some((r) => r.uni.id === prev)) sel.value = prev;
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
      <div class="routeHead">
        <b>${r.name}</b> ${bandChip(r.band)}
      </div>
      <div class="routeCuts">${r.cutText}${r.myText ? ` · ${r.myText}` : ""}</div>
      ${r.tips.length ? `<ul>${r.tips.map((t) => `<li>${t}</li>`).join("")}</ul>` : ""}
    </div>`).join("");

  // 학과별 예상 합격선 표
  const deptRows = buildDeptTable(uni, input);
  const deptTable = deptRows.length ? `
    <div class="deptTable">
      <b>🏫 ${uni.name} 학과별 예상 합격선 (${input.track}계열, 내 성적 기준 판정)</b>
      <table>
        <thead><tr><th>학과</th><th>정시컷(백분위)</th><th>교과컷(내신)</th><th>내 판정</th></tr></thead>
        <tbody>
          ${deptRows.map((r) => `
          <tr class="${r.special ? "spRow" : ""}">
            <td>${r.special ? "💊 " : ""}${r.name}</td>
            <td>${r.cut.jungsi != null ? r.cut.jungsi : "-"}</td>
            <td>${r.cut.gyogwa != null ? r.cut.gyogwa + "등급" : "-"}</td>
            <td>${bandChip(r.band)}</td>
          </tr>`).join("")}
        </tbody>
      </table>
      <p class="fine">일반 학과 컷은 계열 평균에 학과 선호도 보정치를 적용한 추정치입니다. 같은 학과라도 연도·경쟁률에 따라 변동 폭이 ±1~2(백분위) 이상일 수 있습니다.</p>
    </div>` : "";

  box.innerHTML = `
    <h3>🎯 ${uni.name}${c.deptLabel ? " " + c.deptLabel : ""} — 맞춤 전략 코칭</h3>
    <p class="verdict">${c.verdict}</p>
    ${uni.note ? `<p class="fine">ℹ️ ${uni.note}</p>` : ""}
    ${routesHtml}
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
    .map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a>`)
    .join(" · ");
  rebuildDeptOptions();
  $("track").addEventListener("change", rebuildDeptOptions);
  $("btnList").addEventListener("click", renderList);
  $("btnCoach").addEventListener("click", renderCoaching);
});
