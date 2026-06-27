/* ===================================================================
   CARTISTEM 논문 대시보드 — 렌더링 / 탐색 / 상호작용 v2
   좌측 분류 네비 · 해시 라우팅(뒤로가기) · 글자크기 · 원문 링크/PDF · 요약 PDF
   =================================================================== */
(function () {
  "use strict";

  var PAPERS = window.PAPERS || [];
  var META = window.CARTISTEM_META || {};
  var SOURCES = window.SOURCES || {};
  var PDF_DATA = window.PDF_DATA || {}; // 단일 HTML 빌드 시 base64 PDF 내장

  var CATEGORY = {
    rct:        { label: "무작위 대조시험(RCT)", ic: "🧪", order: 1 },
    review:     { label: "체계적 문헌고찰·메타분석", ic: "📚", order: 2 },
    cohort:     { label: "코호트·비교 연구", ic: "📊", order: 3 },
    caseseries: { label: "증례 시리즈", ic: "📈", order: 4 },
    casereport: { label: "증례 보고", ic: "📄", order: 5 },
    technique:  { label: "수술 술기", ic: "🔧", order: 6 },
    economics:  { label: "비용효과 분석", ic: "💰", order: 7 },
    related:    { label: "관련 연구", ic: "🔗", order: 8 },
    reference:  { label: "방법론 참고", ic: "📐", order: 9 }
  };
  var EVIDENCE = {
    top:     { label: "최상위", cls: "evid-top",     order: 1 },
    high:    { label: "상위",   cls: "evid-high",    order: 2 },
    mid:     { label: "중간",   cls: "evid-mid",     order: 3 },
    low:     { label: "하위",   cls: "evid-low",     order: 4 },
    context: { label: "맥락 의존", cls: "evid-context", order: 5 }
  };

  var state = { search: "", category: "all", evidence: "all", sort: "num", view: "home" };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function cell(s) { return esc(s).replace(/(원문 미보고)/g, '<span class="unreported">$1</span>'); }
  function numKey(p) { var n = parseInt(p.num, 10); return isNaN(n) ? 999 : n; }
  function pdfHref(p) { return PDF_DATA[p.id] || (SOURCES[p.id] && SOURCES[p.id].pdf) || null; }

  /* ---------- 개요 / 종합 / 통계 ---------- */
  function renderIntro() {
    $("#introPanel").innerHTML =
      '<h3>치료제 개요</h3><p class="product-line">' + esc(META.product || "") + "</p>" +
      '<h3>코퍼스 범위</h3><p>' + esc(META.scope || "") + "</p>";
  }
  function renderSynthesis() {
    $("#synthesisList").innerHTML = (META.synthesis || []).map(function (s) {
      return "<li>" + esc(s) + "</li>";
    }).join("");
  }
  function renderStats() {
    var years = PAPERS.map(function (p) { return p.year; }).filter(Boolean);
    var byCat = {}; PAPERS.forEach(function (p) { byCat[p.category] = (byCat[p.category] || 0) + 1; });
    var clinical = PAPERS.filter(function (p) {
      return ["rct", "review", "cohort", "caseseries", "casereport"].indexOf(p.category) >= 0;
    }).length;
    var catDetail = Object.keys(CATEGORY).filter(function (k) { return byCat[k]; })
      .sort(function (a, b) { return byCat[b] - byCat[a]; })
      .slice(0, 4).map(function (k) { return CATEGORY[k].label.replace(/\(.+?\)/, "") + " " + byCat[k]; }).join(" · ");
    var cards = [
      { num: PAPERS.length, label: "수록 논문(표 A~E)", detail: Math.min.apply(null, years) + "–" + Math.max.apply(null, years) + " · 임상·중개 " + clinical + "편" },
      { num: (byCat.rct || 0) + (byCat.review || 0), label: "무작위 대조시험 + 메타분석", detail: "무작위 대조시험 " + (byCat.rct || 0) + " · 체계적 고찰/메타 " + (byCat.review || 0) },
      { num: clinical, label: "임상·중개 연구", detail: "코호트·증례·무작위 대조시험 포함" },
      { num: Object.keys(byCat).length, label: "연구 유형 분포", detail: catDetail }
    ];
    $("#statsGrid").innerHTML = cards.map(function (c) {
      return '<div class="stat-card"><div class="stat-num">' + c.num + "</div>" +
        '<div class="stat-label">' + c.label + "</div><div class=\"stat-detail\">" + c.detail + "</div></div>";
    }).join("");
  }

  /* ---------- 필터 칩 ---------- */
  function renderFilters() {
    var cc = { all: PAPERS.length }; PAPERS.forEach(function (p) { cc[p.category] = (cc[p.category] || 0) + 1; });
    $("#categoryFilters").innerHTML = ["all"].concat(Object.keys(CATEGORY).filter(function (k) { return cc[k]; })
      .sort(function (a, b) { return CATEGORY[a].order - CATEGORY[b].order; })).map(function (k) {
        return chip("category", k, k === "all" ? "전체" : CATEGORY[k].label, cc[k] || 0);
      }).join("");
  }
  function chip(group, key, label, count) {
    return '<button class="chip' + (state[group] === key ? " active" : "") + '" data-group="' + group +
      '" data-key="' + key + '">' + esc(label) + '<span class="chip-count">' + count + "</span></button>";
  }

  /* ---------- 좌측 사이드바 ---------- */
  function renderSidebar() {
    var html = "";
    html += '<button class="sb-link" data-route="#/home"><span class="ic">🏠</span> 대시보드 홈</button>';
    html += '<button class="sb-link" data-route="#/sources"><span class="ic">🗂️</span> 논문 모음 (원문 링크·PDF)</button>';
    html += '<div class="sb-divider"></div>';

    var groups = {};
    PAPERS.forEach(function (p) { (groups[p.category] = groups[p.category] || []).push(p); });
    Object.keys(CATEGORY).filter(function (k) { return groups[k]; })
      .sort(function (a, b) { return CATEGORY[a].order - CATEGORY[b].order; })
      .forEach(function (k) {
        var items = groups[k].sort(function (a, b) { return numKey(a) - numKey(b); });
        html += '<div class="sb-group" data-cat="' + k + '">' +
          '<button class="sb-group-head"><span>' + CATEGORY[k].ic + " " + esc(CATEGORY[k].label) +
          '</span><span><span class="cnt">' + items.length + '</span><span class="arr">▾</span></span></button>' +
          '<div class="sb-items">' +
          items.map(function (p) {
            return '<button class="sb-item" data-paper="' + p.id + '">' +
              '<span class="n">' + esc(p.num) + '</span>' +
              '<span class="t">' + esc(p.journal) + " " + esc(p.year) + "</span></button>";
          }).join("") + "</div></div>";
      });
    $("#sbNav").innerHTML = html;
  }

  /* ---------- 표 렌더 ---------- */
  function sourceButtons(p) {
    var s = SOURCES[p.id] || {};
    var btns = [];
    if (s.pmid) btns.push('<a class="act-btn act-pubmed" target="_blank" rel="noopener" href="https://pubmed.ncbi.nlm.nih.gov/' + esc(s.pmid) + '/">🔗 PubMed</a>');
    if (s.doi) btns.push('<a class="act-btn act-doi" target="_blank" rel="noopener" href="https://doi.org/' + esc(s.doi) + '">🌐 출판사 원문</a>');
    var ph = pdfHref(p);
    if (ph) btns.push('<a class="act-btn act-pdf" target="_blank" rel="noopener" href="' + ph + '">📄 PDF 원문</a>');
    btns.push('<button class="act-btn act-summary" data-print="' + p.id + '">🖨 요약 PDF 출력</button>');
    return '<div class="card-actions">' + btns.join("") + "</div>";
  }
  function tableA(p) {
    var rows = [["제목", p.title], ["저자", p.authors], ["저널·연도", p.journal + " (" + p.year + ")"],
      ["연구 설계", p.design], ["연구 유형", p.evidenceLabel || (EVIDENCE[p.evidence] && EVIDENCE[p.evidence].label) || "—"],
      ["식별자", "PMID " + (p.pmid || "—") + (p.reg && p.reg !== "—" ? " · " + p.reg : "") + (p.impact && p.impact !== "—" ? " · " + p.impact : "")]];
    return block("A", "논문 식별", '<dl class="kv">' + rows.map(function (r) {
      return "<dt>" + esc(r[0]) + "</dt><dd>" + cell(r[1]) + "</dd>"; }).join("") + "</dl>");
  }
  function tableB(b) {
    if (!b) return "";
    var rows = [["연구 질문", b.question], ["대상·표본 수", b.population], ["중재·비교", b.intervention],
      ["주요 평가변수", b.outcomes], ["추적 기간", b.followup]];
    return block("B", "연구 개요", '<dl class="kv">' + rows.map(function (r) {
      return "<dt>" + esc(r[0]) + "</dt><dd>" + cell(r[1]) + "</dd>"; }).join("") + "</dl>");
  }
  function tableC(rows) {
    if (!rows || !rows.length) return "";
    var body = rows.map(function (r) {
      return "<tr><td class='col-var'>" + cell(r.v) + "</td><td>" + cell(r.r) + "</td><td>" + cell(r.c) +
        "</td><td>" + cell(r.e) + "</td><td class='sig-cell'>" + cell(r.s) + "</td></tr>"; }).join("");
    return block("C", "핵심 정량 결과",
      "<table class='t'><thead><tr><th>평가변수</th><th>결과군</th><th>대조군</th><th>효과크기</th><th>유의성(p·CI)</th></tr></thead><tbody>" + body + "</tbody></table>");
  }
  function tableE(rows) {
    if (!rows || !rows.length) return "";
    var items = rows.map(function (r) {
      return '<div class="limit-item"><div class="li-row">' +
        '<div class="li-cell li-limit"><span class="li-k">한계</span>' + cell(r.l) + "</div>" +
        '<div class="li-cell"><span class="li-k">해석 영향</span>' + cell(r.i) + "</div>" +
        '<div class="li-cell"><span class="li-k">후속 연구 제언</span>' + cell(r.f) + "</div></div></div>"; }).join("");
    return block("E", "한계·후속 연구", '<div class="limit-list">' + items + "</div>");
  }
  function block(code, title, inner) {
    return '<div class="table-block"><div class="table-caption"><span class="tcode">' + code + "</span>" + title + "</div>" + inner + "</div>";
  }
  function takehome(rows) {
    if (!rows || !rows.length) return "";
    return '<div class="takehome"><div class="takehome-label">핵심 메시지 (Take-home)</div><ol>' +
      rows.map(function (r) { return "<li>" + esc(r.m) + '<span class="basis">근거 · ' + esc(r.b) + "</span></li>"; }).join("") + "</ol></div>";
  }
  function cardHTML(p) {
    var cat = CATEGORY[p.category] || { label: p.category };
    var tags = '<span class="tag tag-design">' + esc(cat.label) + "</span>" +
      '<span class="tag tag-year">' + esc(p.year) + "</span>" +
      (p.featured ? '<span class="tag tag-featured">핵심 논문</span>' : "");
    return '<article class="paper-card' + (p.featured ? " featured" : "") + '" id="card-' + esc(p.id) + '" data-id="' + esc(p.id) + '">' +
      '<div class="card-head" role="button" tabindex="0" aria-expanded="false">' +
        '<div class="paper-num">' + esc(p.num) + "</div>" +
        '<div class="card-head-main"><div class="tag-row">' + tags + "</div>" +
          '<h3 class="card-title">' + esc(p.title) + "</h3>" +
          '<p class="card-meta"><b>' + esc(p.authors) + "</b> · " + esc(p.journal) + " " + esc(p.year) + " · " + esc(p.design) + "</p></div>" +
        '<span class="toggle-ico">▾</span></div>' +
      takehome(p.tableD) + sourceButtons(p) +
      '<div class="card-body">' + tableA(p) + tableB(p.tableB) + tableC(p.tableC) + tableE(p.tableE) + "</div></article>";
  }

  /* ---------- 논문 모음 ---------- */
  function renderSourcesView() {
    var rows = PAPERS.slice().sort(function (a, b) { return numKey(a) - numKey(b); }).map(function (p) {
      var s = SOURCES[p.id] || {}, links = [];
      if (s.pmid) links.push('<a class="act-btn act-pubmed" target="_blank" rel="noopener" href="https://pubmed.ncbi.nlm.nih.gov/' + esc(s.pmid) + '/">PubMed</a>');
      if (s.doi) links.push('<a class="act-btn act-doi" target="_blank" rel="noopener" href="https://doi.org/' + esc(s.doi) + '">DOI 원문</a>');
      var ph = pdfHref(p);
      if (ph) links.push('<a class="act-btn act-pdf" target="_blank" rel="noopener" href="' + ph + '">PDF</a>');
      if (!links.length) links.push('<span class="unreported">링크 미확인</span>');
      return "<tr><td class='s-num'>" + esc(p.num) + "</td>" +
        "<td><div class='s-title'>" + esc(p.title) + "</div><div class='s-jour'>" + esc(p.authors) + "</div></td>" +
        "<td class='s-jour'>" + esc(p.journal) + " " + esc(p.year) + "</td>" +
        "<td><div class='src-links'>" + links.join("") + "</div></td>" +
        "<td><button class='act-btn' data-goto='" + esc(p.id) + "'>요약 보기 →</button></td></tr>";
    }).join("");
    $("#sourcesTable").innerHTML =
      "<thead><tr><th>№</th><th>제목 · 저자</th><th>저널·연도</th><th>원문 연결</th><th>요약</th></tr></thead><tbody>" + rows + "</tbody>";
  }

  /* ---------- 필터/정렬/렌더 ---------- */
  function applyFilters() {
    var q = state.search.trim().toLowerCase();
    var list = PAPERS.filter(function (p) {
      if (state.category !== "all" && p.category !== state.category) return false;
      if (state.evidence !== "all" && p.evidence !== state.evidence) return false;
      if (q) {
        var hay = [p.title, p.authors, p.journal, p.design, p.pmid, JSON.stringify(p.tableC || []),
          JSON.stringify(p.tableD || []), JSON.stringify(p.tableB || {})].join(" ").toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
    list.sort(function (a, b) {
      switch (state.sort) {
        case "yearDesc": return b.year - a.year || numKey(a) - numKey(b);
        case "yearAsc": return a.year - b.year || numKey(a) - numKey(b);
        case "type": return ((CATEGORY[a.category] || {}).order - (CATEGORY[b.category] || {}).order) || numKey(a) - numKey(b);
        default: return numKey(a) - numKey(b);
      }
    });
    return list;
  }
  function renderCards() {
    var list = applyFilters();
    $("#cardList").innerHTML = list.map(cardHTML).join("");
    $("#emptyState").hidden = list.length > 0;
    $("#resultCount").textContent = list.length + " / " + PAPERS.length + "편 표시";
    bindCards();
    observeCards();
  }
  function bindCards() {
    $$(".card-head").forEach(function (head) {
      function toggle() {
        var card = head.closest(".paper-card");
        var open = card.classList.toggle("open");
        head.setAttribute("aria-expanded", open ? "true" : "false");
      }
      head.addEventListener("click", toggle);
      head.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
    });
  }

  /* ---------- 뷰 전환 ---------- */
  function showView(view) {
    state.view = view;
    $("#view-home").hidden = view !== "home";
    $("#view-sources").hidden = view !== "sources";
    $$(".sb-link").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-route") === "#/" + view);
    });
  }

  /* ---------- 카드로 이동 ---------- */
  function gotoPaper(id, fromHash) {
    showView("home");
    var card = $("#card-" + id);
    if (!card) { // 필터로 숨겨졌으면 초기화 후 재시도
      state.search = ""; state.category = "all"; state.evidence = "all";
      $("#searchInput").value = ""; renderFilters(); renderCards();
      card = $("#card-" + id);
    }
    if (!card) return;
    if (!card.classList.contains("open")) {
      card.classList.add("open");
      var h = card.querySelector(".card-head"); if (h) h.setAttribute("aria-expanded", "true");
    }
    card.scrollIntoView({ behavior: "smooth", block: "start" });
    card.classList.remove("flash"); void card.offsetWidth; card.classList.add("flash");
    setActiveSidebarItem(id);
    closeMobileSidebar();
    if (!fromHash) location.hash = "#/paper/" + id;
  }
  function setActiveSidebarItem(id) {
    $$(".sb-item").forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-paper") === id); });
  }

  /* ---------- 스크롤 스파이 ---------- */
  var io = null;
  function observeCards() {
    if (io) io.disconnect();
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) setActiveSidebarItem(e.target.getAttribute("data-id"));
      });
    }, { rootMargin: "-30% 0px -60% 0px", threshold: 0 });
    $$(".paper-card").forEach(function (c) { io.observe(c); });
  }

  /* ---------- 라우팅(해시) → 뒤로가기 지원 ---------- */
  function handleHash() {
    var h = location.hash || "#/home";
    var m = h.match(/^#\/paper\/(.+)$/);
    if (m) { gotoPaper(m[1], true); return; }
    if (h.indexOf("#/sources") === 0) { showView("sources"); window.scrollTo({ top: 0 }); closeMobileSidebar(); return; }
    showView("home");
  }

  /* ---------- 글자 크기 ---------- */
  function setFont(scale) {
    scale = Math.max(1, Math.min(5, scale));
    document.body.setAttribute("data-fontscale", scale);
    try { localStorage.setItem("cartistem-fontscale", scale); } catch (e) {}
  }
  function curFont() { return parseInt(document.body.getAttribute("data-fontscale"), 10) || 2; }

  /* ---------- 단일 카드 요약 PDF 출력 ---------- */
  function printCard(id) {
    var card = $("#card-" + id);
    if (!card) return;
    if (!card.classList.contains("open")) card.classList.add("open");
    $$(".paper-card").forEach(function (c) { c.classList.remove("print-target"); });
    card.classList.add("print-target");
    document.body.classList.add("print-one");
    var cleanup = function () { document.body.classList.remove("print-one"); card.classList.remove("print-target"); window.removeEventListener("afterprint", cleanup); };
    window.addEventListener("afterprint", cleanup);
    setTimeout(function () { window.print(); }, 60);
  }

  /* ---------- 모바일 사이드바 ---------- */
  function closeMobileSidebar() { document.body.classList.remove("sb-open"); }

  /* ---------- 이벤트 ---------- */
  var allOpen = false;
  function toggleExpandAll(btn) {
    showView("home");
    allOpen = !allOpen;
    $$(".paper-card").forEach(function (c) {
      c.classList.toggle("open", allOpen);
      var h = c.querySelector(".card-head"); if (h) h.setAttribute("aria-expanded", allOpen ? "true" : "false");
    });
    if (btn) btn.textContent = allOpen ? "▴ 모두 접기" : "▾ 모두 펼치기";
  }
  function smartBack() {
    // 앱 내부 상태(논문/논문모음)면 홈으로, 아니면 브라우저 뒤로
    var h = location.hash || "";
    if (h.indexOf("#/paper/") === 0 || h.indexOf("#/sources") === 0) { location.hash = "#/home"; }
    else if (history.length > 1) { history.back(); }
    else { window.scrollTo({ top: 0, behavior: "smooth" }); }
  }

  function bindGlobal() {
    $("#searchInput").addEventListener("input", function (e) { state.search = e.target.value; renderCards(); });
    $("#sortSelect").addEventListener("change", function (e) { state.sort = e.target.value; renderCards(); });

    // 단일 위임 클릭 핸들러 — 툴바·사이드바·카드 모든 버튼 처리(바인딩 누락 방지)
    document.addEventListener("click", function (e) {
      var act = e.target.closest("[data-action]");
      if (act) {
        e.preventDefault();
        switch (act.getAttribute("data-action")) {
          case "font-down": setFont(curFont() - 1); return;
          case "font-up": setFont(curFont() + 1); return;
          case "font-reset": setFont(2); return;
          case "back": smartBack(); return;
          case "print": window.print(); return;
          case "expand": toggleExpandAll(act); return;
          case "menu": document.body.classList.toggle("sb-open"); return;
          case "top": window.scrollTo({ top: 0, behavior: "smooth" }); return;
        }
      }
      var chipEl = e.target.closest(".chip");
      if (chipEl) { state[chipEl.getAttribute("data-group")] = chipEl.getAttribute("data-key"); renderFilters(); renderCards(); return; }
      var route = e.target.closest("[data-route]");
      if (route) { e.preventDefault(); location.hash = route.getAttribute("data-route"); closeMobileSidebar(); return; }
      var paperBtn = e.target.closest("[data-paper]");
      if (paperBtn) { gotoPaper(paperBtn.getAttribute("data-paper")); return; }
      var gotoBtn = e.target.closest("[data-goto]");
      if (gotoBtn) { gotoPaper(gotoBtn.getAttribute("data-goto")); return; }
      var printBtn = e.target.closest("[data-print]");
      if (printBtn) { e.preventDefault(); printCard(printBtn.getAttribute("data-print")); return; }
      var gh = e.target.closest(".sb-group-head");
      if (gh) { gh.closest(".sb-group").classList.toggle("collapsed"); return; }
      if (e.target.closest("#sbBackdrop")) { closeMobileSidebar(); return; }
    });

    var toTop = $("#toTop");
    window.addEventListener("scroll", function () { toTop.hidden = window.scrollY < 400; }, { passive: true });
    window.addEventListener("hashchange", handleHash);
  }

  /* ---------- init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    if (!PAPERS.length) { $("#cardList").innerHTML = "<p class='empty-state'>데이터를 불러오지 못했습니다.</p>"; return; }
    try { var fs = localStorage.getItem("cartistem-fontscale"); if (fs) setFont(parseInt(fs, 10)); } catch (e) {}
    renderIntro(); renderSynthesis(); renderStats(); renderFilters(); renderSidebar();
    renderSourcesView(); bindGlobal(); renderCards();
    handleHash();
  });
})();
