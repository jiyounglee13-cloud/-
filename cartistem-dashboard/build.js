/*
 * 단일 HTML 빌드 스크립트
 *   node build.js
 * index.html + styles.css + (data|sources|app).js 를 인라인화하고,
 * 공개 링크가 없는 논문의 PDF(P1)는 base64 data URI로 내장하여
 * 어디서나 열리는 자체 완결형 cartistem-dashboard.html 을 생성한다.
 */
const fs = require("fs");
const path = require("path");
const dir = __dirname;
const read = (f) => fs.readFileSync(path.join(dir, f), "utf8");

let html = read("index.html");
const css = read("styles.css");
const dataJs = read("data.js");
const sourcesJs = read("sources.js");
const appJs = read("app.js");

// 링크 없는 논문 PDF를 base64로 내장
const SOURCES = (() => { const w = {}; new Function("window", sourcesJs)(w); return w.SOURCES; })();
const pdfData = {};
Object.keys(SOURCES).forEach((id) => {
  const rel = SOURCES[id] && SOURCES[id].pdf;
  if (rel && fs.existsSync(path.join(dir, rel))) {
    const b64 = fs.readFileSync(path.join(dir, rel)).toString("base64");
    pdfData[id] = "data:application/pdf;base64," + b64;
  }
});
const pdfScript = "window.PDF_DATA = " + JSON.stringify(pdfData) + ";";

// 함수형 치환을 사용 — 치환 문자열의 $$, $1 등이 특수 패턴으로 해석되는 것을 방지
// <link rel=stylesheet> → <style>
html = html.replace(/<link rel="stylesheet" href="styles\.css"\s*\/>/,
  function () { return "<style>\n" + css + "\n</style>"; });
// 외부 스크립트 → 인라인 (PDF_DATA 먼저)
html = html.replace(/<script src="data\.js"><\/script>\s*<script src="sources\.js"><\/script>\s*<script src="app\.js"><\/script>/,
  function () { return "<script>\n" + pdfScript + "\n" + dataJs + "\n" + sourcesJs + "\n" + appJs + "\n</script>"; });

// 단일 파일 표식
html = html.replace("<title>", "<!-- 자체 완결형 단일 HTML (build.js 생성) -->\n  <title>");

const out = path.join(dir, "cartistem-dashboard.html");
fs.writeFileSync(out, html, "utf8");
const kb = (fs.statSync(out).size / 1024).toFixed(0);
console.log("생성: cartistem-dashboard.html (" + kb + " KB), 내장 PDF:", Object.keys(pdfData).join(", ") || "없음");
