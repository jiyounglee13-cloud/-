/**
 * 원격 크롤러 HTTP 실연동 안전 스파이크 검증.
 *
 * 실제 외부 사이트(법적·robots 검토 필요)를 대상으로 하지 않고, robots.txt와
 * 가짜 판례 HTML 페이지를 제공하는 in-process HTTP 서버를 띄워 다음을 검증한다.
 *   - robots.txt 준수(Disallow 경로 건너뜀)
 *   - HTTP fetch → HTML 평문화 → PII 익명화 → KnowledgeEntry 구조화
 *
 * 동일 코드는 CRAWL_URL 등으로 실제 공개 출처에도 적용 가능하다.
 * 사용: npx tsx scripts/test-crawler-http.ts (실패 시 종료 코드 1)
 */

import http from "node:http";
import { HttpCaseSource, extractEntry } from "../lib/crawler";
import { containsPii } from "../lib/scrub";

const CASE_HTML = `<!doctype html><html><head><title>판례</title><style>.x{}</style></head>
<body>
<h1>무릎 줄기세포 시술 입원 인정 여부</h1>
<p>서울중앙지방법원 2026. 1. 선고 2024가단55065 판결</p>
<p>신청인: 홍길동 (주민등록번호 850101-1234567), 연락처 010-1234-5678</p>
<p>법원은 입원의 실질적 필요성은 단순 체류 시간이 아니라 의료적 필요성으로 판단하여야 한다고 보았다.
신청인은 고혈압으로 아스피린을 복용 중이었고 시술 직후 혈압이 162/100mmHg로 급상승하여 의료진의
지속적 관찰이 필요하였던 점이 의무기록상 객관적으로 인정되어 입원 필요성을 인정하였다.</p>
<script>console.log('should be stripped')</script>
</body></html>`;

function startServer(): Promise<{ base: string; close: () => void }> {
  const server = http.createServer((req, res) => {
    if (req.url === "/robots.txt") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      return res.end("User-agent: *\nDisallow: /private\n");
    }
    if (req.url === "/case" || req.url?.startsWith("/private")) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(CASE_HTML);
    }
    res.writeHead(404);
    res.end("nf");
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const a = server.address();
      const port = typeof a === "object" && a ? a.port : 0;
      resolve({ base: `http://127.0.0.1:${port}`, close: () => server.close() });
    });
  });
}

let failed = 0;
function assert(c: boolean, m: string) {
  console.log((c ? "  ✅ " : "  ❌ ") + m);
  if (!c) failed++;
}

async function main() {
  const { base, close } = await startServer();
  console.log(`목 크롤 대상: ${base}`);

  // 1) 허용 경로 수집 → 구조화
  const allowed = new HttpCaseSource([`${base}/case`]);
  const docs = await allowed.fetchRaw();
  assert(docs.length === 1, "허용 경로 1건 수집");
  assert(!/console\.log/.test(docs[0].text), "<script> 내용 제거");

  const entry = extractEntry(docs[0]);
  assert(entry.category === "knee_stemcell", `카테고리 추론(knee_stemcell) — got ${entry.category}`);
  assert(/2024가단55065/.test(entry.citation), `사건번호 추출 — got ${entry.citation}`);
  assert(!containsPii(entry.holding), "판시사항에 PII 미포함(익명화 적용)");
  assert(/판단|인정/.test(entry.holding), "판시사항 문장 추출");

  // 2) robots Disallow 경로 → 건너뜀
  const blocked = new HttpCaseSource([`${base}/private/case`]);
  const blockedDocs = await blocked.fetchRaw();
  assert(blockedDocs.length === 0, "robots Disallow 경로 수집 차단");

  close();

  if (failed) {
    console.error(`\n❌ 크롤러 스파이크 실패: ${failed}건`);
    process.exit(1);
  }
  console.log("\n✅ 원격 크롤러 HTTP 실연동 검증 통과");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
