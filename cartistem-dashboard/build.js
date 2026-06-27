/*
 * 단일 HTML 빌드 스크립트
 *   node build.js
 * index.html + styles.css + (data|sources|app).js 를 하나의 cartistem-dashboard.html 로 인라인화한다.
 * PDF 원문(총 ~60MB)은 용량이 커서 HTML에 내장하지 않고 pdfs/ 폴더를 상대경로로 참조한다.
 * 따라서 배포는 'cartistem-dashboard.html + pdfs/' 를 함께(예: ZIP) 전달한다.
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

// PDF는 내장하지 않고 pdfs/ 상대경로 참조(파일이 커서 단일 HTML 비대화 방지)
const pdfScript = "window.PDF_DATA = {};";

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
console.log("생성: cartistem-dashboard.html (" + kb + " KB) — PDF는 pdfs/ 상대경로 참조");
