/*
 * 단일 HTML 빌드 스크립트
 *   node build.js
 * index.html + styles.css + (data|sources|app).js 를 하나로 인라인화하고,
 * 압축된 PDF 원문(총 ~14MB)을 base64 data URI로 내장하여
 * 파일 하나(cartistem-dashboard.html, 약 19MB)로 31편 PDF까지 모두 열리게 만든다.
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

// 압축 PDF를 base64로 내장 → 단일 HTML만으로 다운로드 가능
const SOURCES = (() => { const w = {}; new Function("window", sourcesJs)(w); return w.SOURCES; })();
const pdfData = {};
let embedded = 0, bytes = 0;
Object.keys(SOURCES).forEach((id) => {
  const rel = SOURCES[id] && SOURCES[id].pdf;
  if (rel && fs.existsSync(path.join(dir, rel))) {
    const buf = fs.readFileSync(path.join(dir, rel));
    pdfData[id] = "data:application/pdf;base64," + buf.toString("base64");
    embedded++; bytes += buf.length;
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
const mb = (fs.statSync(out).size / 1048576).toFixed(1);
console.log("생성: cartistem-dashboard.html (" + mb + " MB) — 내장 PDF " + embedded + "편(" + (bytes / 1048576).toFixed(1) + "MB) base64 포함");
