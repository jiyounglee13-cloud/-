/**
 * 판례 RAG 지식베이스 무결성 검증.
 *
 * CI에서 실행되어 지식베이스가 깨지면 빌드를 실패시킨다. 신규 판례가
 * 추가될 때마다(자동 갱신 파이프라인 포함) 스키마·중복·필수값을 점검하고,
 * 임베딩 인덱스가 정상 구축되는지까지 확인한다.
 *
 * 사용: npm run validate:kb   (실패 시 종료 코드 1)
 */

import { KNOWLEDGE_BASE, EXCLUSION_RULES } from "../lib/knowledgeBase";
import { retrieve } from "../lib/rag";
import type { AppealInput, DisputeCategory } from "../lib/types";

const VALID_CATEGORIES: DisputeCategory[] = [
  "cataract",
  "manual_therapy",
  "knee_stemcell",
  "medical_advisory",
  "general",
];

const errors: string[] = [];
const warnings: string[] = [];

function check(cond: boolean, msg: string) {
  if (!cond) errors.push(msg);
}

// ── 지식베이스 항목 검증 ───────────────────────────────────────────
const ids = new Set<string>();
for (const e of KNOWLEDGE_BASE) {
  const tag = e.id || "(id 없음)";
  check(!!e.id, `항목 id 누락: ${JSON.stringify(e).slice(0, 60)}`);
  check(!ids.has(e.id), `중복 id: ${tag}`);
  ids.add(e.id);
  check(!!e.title?.trim(), `[${tag}] title 누락`);
  check(!!e.citation?.trim(), `[${tag}] citation(출처) 누락`);
  check(!!e.holding?.trim(), `[${tag}] holding(판시사항) 누락`);
  check(
    VALID_CATEGORIES.includes(e.category),
    `[${tag}] 잘못된 category: ${e.category}`,
  );
  check(
    Array.isArray(e.keywords) && e.keywords.length > 0,
    `[${tag}] keywords 비어있음`,
  );
  check(typeof e.favorsConsumer === "boolean", `[${tag}] favorsConsumer 누락`);
  if (e.holding && e.holding.length < 20)
    warnings.push(`[${tag}] holding이 지나치게 짧습니다(${e.holding.length}자).`);
}

// ── 배제 규칙 검증 ─────────────────────────────────────────────────
const exIds = new Set<string>();
for (const r of EXCLUSION_RULES) {
  const tag = r.id || "(id 없음)";
  check(!!r.id, `배제규칙 id 누락`);
  check(!exIds.has(r.id), `배제규칙 중복 id: ${tag}`);
  exIds.add(r.id);
  check(!!r.name?.trim(), `[${tag}] 배제규칙 name 누락`);
  check(!!r.citation?.trim(), `[${tag}] 배제규칙 citation 누락`);
  check(!!r.reason?.trim(), `[${tag}] 배제규칙 reason 누락`);
  check(
    Array.isArray(r.triggers) && r.triggers.length > 0,
    `[${tag}] 배제규칙 triggers 비어있음`,
  );
}

// ── 임베딩 인덱스 구축 + 검색 스모크 테스트 ────────────────────────
async function smoke() {
  const probe: AppealInput = {
    category: "knee_stemcell",
    diagnosis: "무릎 골관절염 BMAC 시술",
    treatmentDate: "",
    claimAmount: "",
    rejectionReason: "입원 필요성 불인정",
    patientFacts: "고혈압 아스피린 복용",
    vitalSigns: "혈압 162/100",
  };
  const r = await retrieve(probe);
  check(r.entries.length > 0, "검색 스모크 테스트: 결과가 비어있음");

  // 가드레일 발동 확인
  const guard = await retrieve({
    ...probe,
    rejectionReason: "본인부담상한제 사후환급금 해당",
  });
  check(
    guard.triggeredExclusions.length > 0,
    "가드레일 스모크 테스트: 본인부담상한제 미탐지",
  );
}

async function main() {
  await smoke();

  console.log(
    `지식베이스: 판례 ${KNOWLEDGE_BASE.length}건, 배제규칙 ${EXCLUSION_RULES.length}건`,
  );
  if (warnings.length) {
    console.log("\n⚠️  경고:");
    warnings.forEach((w) => console.log("  - " + w));
  }
  if (errors.length) {
    console.error("\n❌ 검증 실패:");
    errors.forEach((e) => console.error("  - " + e));
    process.exit(1);
  }
  console.log("\n✅ 지식베이스 무결성 검증 통과");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
