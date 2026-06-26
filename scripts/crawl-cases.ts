/**
 * 판례 수집 파이프라인 오케스트레이터.
 *
 * 소스(CaseSource)에서 원문을 가져와 → PII 익명화 → KnowledgeEntry 후보로
 * 구조화 → data/incoming/crawled.json 에 적재한다. 이후 scripts/ingest-cases.ts
 * 가 후보를 검증하고, 사람이 검토하여 lib/knowledgeBase.ts 에 반영한다.
 *
 * 기본은 오프라인 로컬 fixture(data/fixtures/*.txt) 소스만 동작한다.
 * 원격 소스는 법적·기술 검토 후 RemoteCaseSource 어댑터로 추가한다.
 *
 * 사용: npx tsx scripts/crawl-cases.ts
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  LocalFixtureSource,
  HttpCaseSource,
  RemoteCaseSource,
  extractEntry,
  type CaseSource,
} from "../lib/crawler";
import { scrub } from "../lib/scrub";

async function main() {
  const sources: CaseSource[] = [
    new LocalFixtureSource(join(process.cwd(), "data", "fixtures")),
    // 원격 소스는 endpoint 미설정 시 no-op (법적·기술 검토 후 연동)
    new RemoteCaseSource("fss-dispute", process.env.FSS_ENDPOINT),
    new RemoteCaseSource("court-scourt", process.env.COURT_ENDPOINT),
  ];

  // CRAWL_URL(쉼표 구분)이 설정되면 robots 준수 HTTP 수집을 추가한다.
  // (이용약관·저작권·robots 검토를 통과한 공개 출처에만 사용할 것)
  if (process.env.CRAWL_URL) {
    sources.push(
      new HttpCaseSource(process.env.CRAWL_URL.split(",").map((s) => s.trim()), {
        delayMs: 1000,
      }),
    );
  }

  const candidates = [];
  let totalRedactions = 0;

  for (const source of sources) {
    const docs = await source.fetchRaw();
    for (const doc of docs) {
      const { redactions } = scrub(doc.text);
      totalRedactions += redactions.reduce((a, r) => a + r.count, 0);
      if (redactions.length) {
        console.log(
          `  [${doc.docId}] 익명화: ` +
            redactions.map((r) => `${r.type}×${r.count}`).join(", "),
        );
      }
      candidates.push(extractEntry(doc));
    }
  }

  const outDir = join(process.cwd(), "data", "incoming");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(
    join(outDir, "crawled.json"),
    JSON.stringify(candidates, null, 2),
    "utf-8",
  );

  console.log(
    `\n수집 완료: 후보 ${candidates.length}건, PII 치환 ${totalRedactions}건 → data/incoming/crawled.json`,
  );
  console.log("다음 단계: npm run ingest:cases 로 검증 후 사람이 지식베이스에 반영하세요.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
