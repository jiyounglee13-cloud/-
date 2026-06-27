/* ===== CARTISTEM 논문 대시보드 — 렌더링/상호작용 ===== */
(function () {
  "use strict";

  var PAPERS = window.PAPERS || [];
  var META = window.CARTISTEM_META || {};

  var CATEGORY = {
    rct:        { label: "무작위 대조시험(RCT)", order: 1 },
    review:     { label: "체계적 문헌고찰·메타분석", order: 2 },
    cohort:     { label: "코호트·비교 연구", order: 3 },
    caseseries: { label: "증례 시리즈", order: 4 },
    casereport: { label: "증례 보고", order: 5 },
    technique:  { label: "수술 술기", order: 6 },
    economics:  { label: "비용효과 분석", order: 7 },
    related:    { label: "관련 연구", order: 8 },
    reference:  { label: "방법론 참고", order: 9 }
  };

  var EVIDENCE = {
    top:     { label: "최상위", cls: "evid-top",     order: 1 },
    high:    { label: "상위",   cls: "evid-high",    order: 2 },
    mid:     { label: "중간",   cls: "evid-mid",     order: 3 },
    low:     { label: "하위",   cls: "evid-low",     order: 4 },
    context: { label: "맥락 의존", cls: "evid-context", order: 5 }
  };

  var state = { search: "", category: "all", evidence: "all", sort: "num" };

  var $ = function (sel, root) { return (root || document).querySelector(sel); };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  // 셀 텍스트에서 "원문 미보고"를 강조
  function cell(s) {
    var t = esc(s);
    return t.replace(/(원문 미보고)/g, '<span class="unreported">$1</span>');
  }
  function numKey(p) {
    var n = parseInt(p.num, 10);
    return isNaN(n) ? 999 : n;
  }

  /* ---------- 개요 패널 ---------- */
  function renderIntro() {
    var el = $("#introPanel");
    el.innerHTML =
      '<h3>치료제 개요</h3>' +
      '<p class="product-line">' + esc(META.product || "") + '</p>' +
      '<h3 style="margin-top:1rem">코퍼스 범위</h3>' +
      '<p>' + esc(META.scope || "") + '</p>';
  }

  function renderSynthesis() {
    var ol = $("#synthesisList");
    ol.innerHTML = (META.synthesis || []).map(function (s) {
      return "<li>" + esc(s) + "</li>";
    }).join("");
  }

  /* ---------- 통계 ---------- */
  function renderStats() {
    var grid = $("#statsGrid");
    var years = PAPERS.map(function (p) { return p.year; }).filter(Boolean);
    var minY = Math.min.apply(null, years), maxY = Math.max.apply(null, years);

    var byEvid = {};
    PAPERS.forEach(function (p) { byEvid[p.evidence] = (byEvid[p.evidence] || 0) + 1; });
    var evidDetail = Object.keys(EVIDENCE).filter(function (k) { return byEvid[k]; })
      .map(function (k) { return EVIDENCE[k].label + " " + byEvid[k]; }).join(" · ");

    var byCat = {};
    PAPERS.forEach(function (p) { byCat[p.category] = (byCat[p.category] || 0) + 1; });
    var rctN = (byCat.rct || 0), reviewN = (byCat.review || 0);

    var clinical = PAPERS.filter(function (p) {
      return ["rct", "review", "cohort", "caseseries", "casereport"].indexOf(p.category) >= 0;
    }).length;

    var cards = [
      { num: PAPERS.length, label: "수록 논문(표 A~E)", detail: esc(minY) + "–" + esc(maxY) + " · " + clinical + "편 임상·중개" },
      { num: rctN + reviewN, label: "RCT + 메타분석", detail: "RCT " + rctN + " · 체계적 고찰/메타 " + reviewN },
      { num: clinical, label: "임상·중개 연구", detail: "코호트·증례·RCT 포함" },
      { num: evidDetail ? Object.keys(byEvid).length : 0, label: "근거 수준 분포", detail: evidDetail }
    ];
    grid.innerHTML = cards.map(function (c) {
      return '<div class="stat-card"><div class="stat-num">' + c.num + '</div>' +
        '<div class="stat-label">' + c.label + '</div>' +
        '<div class="stat-detail">' + c.detail + '</div></div>';
    }).join("");
  }

  /* ---------- 필터 칩 ---------- */
  function renderFilters() {
    var catCounts = { all: PAPERS.length };
    PAPERS.forEach(function (p) { catCounts[p.category] = (catCounts[p.category] || 0) + 1; });
    var catEl = $("#categoryFilters");
    var catKeys = ["all"].concat(Object.keys(CATEGORY).filter(function (k) { return catCounts[k]; })
      .sort(function (a, b) { return CATEGORY[a].order - CATEGORY[b].order; }));
    catEl.innerHTML = catKeys.map(function (k) {
      var label = k === "all" ? "전체" : CATEGORY[k].label;
      return chip("category", k, label, catCounts[k] || 0);
    }).join("");

    var evCounts = { all: PAPERS.length };
    PAPERS.forEach(function (p) { evCounts[p.evidence] = (evCounts[p.evidence] || 0) + 1; });
    var evEl = $("#evidenceFilters");
    var evKeys = ["all"].concat(Object.keys(EVIDENCE).filter(function (k) { return evCounts[k]; })
      .sort(function (a, b) { return EVIDENCE[a].order - EVIDENCE[b].order; }));
    evEl.innerHTML = evKeys.map(function (k) {
      var label = k === "all" ? "근거수준 전체" : "근거 " + EVIDENCE[k].label;
      return chip("evidence", k, label, evCounts[k] || 0);
    }).join("");
  }
  function chip(group, key, label, count) {
    var active = state[group] === key ? " active" : "";
    return '<button class="chip' + active + '" data-group="' + group + '" data-key="' + key + '">' +
      esc(label) + '<span class="chip-count">' + count + '</span></button>';
  }

  /* ---------- 카드 ---------- */
  function tableC(rows) {
    if (!rows || !rows.length) return "";
    var body = rows.map(function (r) {
      return "<tr><td class='col-var'>" + cell(r.v) + "</td><td>" + cell(r.r) + "</td>" +
        "<td>" + cell(r.c) + "</td><td>" + cell(r.e) + "</td>" +
        "<td class='sig-cell'>" + cell(r.s) + "</td></tr>";
    }).join("");
    return '<div class="table-block"><div class="table-caption"><span class="tcode">C</span>핵심 정량 결과</div>' +
      "<table class='t'><thead><tr><th>평가변수</th><th>결과군</th><th>대조군</th><th>효과크기</th><th>유의성(p·CI)</th></tr></thead>" +
      "<tbody>" + body + "</tbody></table></div>";
  }

  function tableB(b) {
    if (!b) return "";
    var rows = [
      ["연구 질문", b.question], ["대상·표본 수", b.population],
      ["중재·비교", b.intervention], ["주요 평가변수", b.outcomes],
      ["추적 기간", b.followup]
    ];
    return '<div class="table-block"><div class="table-caption"><span class="tcode">B</span>연구 개요</div>' +
      '<dl class="kv">' + rows.map(function (r) {
        return "<dt>" + esc(r[0]) + "</dt><dd>" + cell(r[1]) + "</dd>";
      }).join("") + "</dl></div>";
  }

  function tableA(p) {
    var rows = [
      ["제목", p.title], ["저자", p.authors],
      ["저널·연도", p.journal + " (" + p.year + ")"],
      ["연구 설계", p.design],
      ["근거 수준", p.evidenceLabel || (EVIDENCE[p.evidence] && EVIDENCE[p.evidence].label) || "—"],
      ["식별자", "PMID " + (p.pmid || "—") + (p.reg && p.reg !== "—" ? " · " + p.reg : "") + (p.impact && p.impact !== "—" ? " · " + p.impact : "")]
    ];
    return '<div class="table-block"><div class="table-caption"><span class="tcode">A</span>논문 식별</div>' +
      '<dl class="kv">' + rows.map(function (r) {
        return "<dt>" + esc(r[0]) + "</dt><dd>" + cell(r[1]) + "</dd>";
      }).join("") + "</dl></div>";
  }

  function tableE(rows) {
    if (!rows || !rows.length) return "";
    var items = rows.map(function (r) {
      return '<div class="limit-item"><div class="li-row">' +
        '<div class="li-cell li-limit"><span class="li-k">한계</span>' + cell(r.l) + "</div>" +
        '<div class="li-cell"><span class="li-k">해석 영향</span>' + cell(r.i) + "</div>" +
        '<div class="li-cell"><span class="li-k">후속 연구 제언</span>' + cell(r.f) + "</div>" +
        "</div></div>";
    }).join("");
    return '<div class="table-block"><div class="table-caption"><span class="tcode">E</span>한계·후속 연구</div>' +
      '<div class="limit-list">' + items + "</div></div>";
  }

  function takehome(rows) {
    if (!rows || !rows.length) return "";
    var lis = rows.map(function (r) {
      return "<li>" + esc(r.m) + '<span class="basis">근거 · ' + esc(r.b) + "</span></li>";
    }).join("");
    return '<div class="takehome"><div class="takehome-label">핵심 메시지 (Take-home)</div><ol>' + lis + "</ol></div>";
  }

  function cardHTML(p) {
    var ev = EVIDENCE[p.evidence] || EVIDENCE.context;
    var cat = CATEGORY[p.category] || { label: p.category };
    var tags = '<span class="tag tag-design">' + esc(cat.label) + "</span>" +
      '<span class="tag tag-evid ' + ev.cls + '">근거 ' + esc(ev.label) + "</span>" +
      (p.featured ? '<span class="tag tag-featured">핵심 논문</span>' : "");

    return '<article class="paper-card' + (p.featured ? " featured" : "") + '" id="card-' + esc(p.id) + '">' +
      '<div class="card-head" role="button" tabindex="0" aria-expanded="false">' +
        '<div class="paper-num">' + esc(p.num) + "</div>" +
        '<div class="card-head-main">' +
          '<div class="tag-row">' + tags + "</div>" +
          '<h3 class="card-title">' + esc(p.title) + "</h3>" +
          '<p class="card-meta"><b>' + esc(p.authors) + "</b> · " + esc(p.journal) + " " + esc(p.year) + " · " + esc(p.design) + "</p>" +
        "</div>" +
        '<span class="toggle-ico">▾</span>' +
      "</div>" +
      takehome(p.tableD) +
      '<div class="card-body">' +
        tableA(p) + tableB(p.tableB) + tableC(p.tableC) + tableE(p.tableE) +
      "</div>" +
    "</article>";
  }

  /* ---------- 필터/정렬/렌더 ---------- */
  function applyFilters() {
    var q = state.search.trim().toLowerCase();
    var list = PAPERS.filter(function (p) {
      if (state.category !== "all" && p.category !== state.category) return false;
      if (state.evidence !== "all" && p.evidence !== state.evidence) return false;
      if (q) {
        var hay = [p.title, p.authors, p.journal, p.design, p.pmid,
          JSON.stringify(p.tableC || []), JSON.stringify(p.tableD || []),
          JSON.stringify(p.tableB || {})].join(" ").toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });

    list.sort(function (a, b) {
      switch (state.sort) {
        case "yearDesc": return b.year - a.year || numKey(a) - numKey(b);
        case "yearAsc": return a.year - b.year || numKey(a) - numKey(b);
        case "evidence":
          return (EVIDENCE[a.evidence].order - EVIDENCE[b.evidence].order) || numKey(a) - numKey(b);
        default: return numKey(a) - numKey(b);
      }
    });
    return list;
  }

  function render() {
    var list = applyFilters();
    var host = $("#cardList");
    host.innerHTML = list.map(cardHTML).join("");
    $("#emptyState").hidden = list.length > 0;
    $("#resultCount").textContent = list.length + " / " + PAPERS.length + "편 표시";
    bindCards();
  }

  function bindCards() {
    Array.prototype.forEach.call(document.querySelectorAll(".card-head"), function (head) {
      function toggle() {
        var card = head.closest(".paper-card");
        var open = card.classList.toggle("open");
        head.setAttribute("aria-expanded", open ? "true" : "false");
      }
      head.addEventListener("click", toggle);
      head.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
      });
    });
  }

  /* ---------- 이벤트 ---------- */
  function bindControls() {
    $("#searchInput").addEventListener("input", function (e) {
      state.search = e.target.value; render();
    });
    document.addEventListener("click", function (e) {
      var chip = e.target.closest(".chip");
      if (!chip) return;
      state[chip.getAttribute("data-group")] = chip.getAttribute("data-key");
      renderFilters(); render();
    });
    $("#sortSelect").addEventListener("change", function (e) {
      state.sort = e.target.value; render();
    });
    $("#printBtn").addEventListener("click", function () { window.print(); });

    var allOpen = false;
    $("#expandAllBtn").addEventListener("click", function () {
      allOpen = !allOpen;
      Array.prototype.forEach.call(document.querySelectorAll(".paper-card"), function (c) {
        c.classList.toggle("open", allOpen);
        var h = c.querySelector(".card-head");
        if (h) h.setAttribute("aria-expanded", allOpen ? "true" : "false");
      });
      this.textContent = allOpen ? "▴ 모두 접기" : "▾ 모두 펼치기";
    });
  }

  /* ---------- init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    if (!PAPERS.length) { $("#cardList").innerHTML = "<p class='empty-state'>데이터를 불러오지 못했습니다.</p>"; return; }
    renderIntro();
    renderSynthesis();
    renderStats();
    renderFilters();
    bindControls();
    render();
  });
})();
