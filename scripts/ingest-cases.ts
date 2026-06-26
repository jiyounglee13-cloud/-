/**
 * 판례 자동 갱신 — 신규 판례 수집(ingest) 검증 단계.
 *
 * 자동 갱신 파이프라인에서, 외부 크롤러(금융감독원 분쟁조정 결정문, 한국소비자원
 * 피해구제 사례, 대법원/하급심 판결문)가 PII를 스크러빙(Scrubbing)한 뒤 산출한
 * 신규 판례 후보를 data/incoming/*.json 에 적재한다고 가정한다. 본 스크립트는
 * 그 후보들이 KnowledgeEntry 스키마에 부합하는지 검증하고 요약을 출력한다.
 *
 * 실제 크롤링·익명화는 외부(법적·기술적 검토 필요) 단계이므로 여기서는 다루지
 * 않는다. data/incoming 이 없으면 안전하게 no-op 으로 통과한다.
 *
 * 사용: npx tsx scripts/ingest-cases.ts
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { KNOWLEDGE_BASE } from "../lib/knowledgeBase";
import type { DisputeCategory } from "../lib/types";

const VALID: DisputeCategory[] = [
  "cataract",
  "manual_therapy",
  "knee_stemcell",
  "medical_advisory",
  "general",
];

const REQUIRED = ["id", "category", "title", "citation", "holding", "keywords"];
// 익명화 누락 탐지용 패턴(주민번호 등). 운영 시 확장 필요.
const PII_PATTERNS = [/\d{6}-\d{7}/, /\d{6}\s?-\s?[1-4]\d{6}/];

const dir = join(process.cwd(), "data", "incoming");

if (!existsSync(dir)) {
  console.log("data/incoming 없음 — 신규 수집 후보 없음(no-op). ✅");
  process.exit(0);
}

const existingIds = new Set(KNOWLEDGE_BASE.map((e) => e.id));
const errors: string[] = [];
let candidateCount = 0;
let newCount = 0;

for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(join(dir, file), "utf-8"));
  } catch {
    errors.push(`${file}: JSON 파싱 실패`);
    continue;
  }
  const arr = Array.isArray(parsed) ? parsed : [parsed];
  for (const c of arr as Record<string, unknown>[]) {
    candidateCount++;
    const tag = `${file}#${c.id ?? "?"}`;
    for (const k of REQUIRED) {
      if (!c[k]) errors.push(`${tag}: 필수 필드 누락 '${k}'`);
    }
    if (c.category && !VALID.includes(c.category as DisputeCategory))
      errors.push(`${tag}: 잘못된 category '${c.category}'`);
    const blob = JSON.stringify(c);
    if (PII_PATTERNS.some((p) => p.test(blob)))
      errors.push(`${tag}: PII(주민번호 등) 패턴 탐지 — 익명화 누락 의심`);
    if (c.id && !existingIds.has(c.id as string)) newCount++;
  }
}

console.log(
  `수집 후보 ${candidateCount}건 검토 (신규 ${newCount}건 / 기존 ${candidateCount - newCount}건)`,
);
if (errors.length) {
  console.error("\n❌ 수집 검증 실패:");
  errors.forEach((e) => console.error("  - " + e));
  process.exit(1);
}
console.log("✅ 수집 후보 검증 통과");
