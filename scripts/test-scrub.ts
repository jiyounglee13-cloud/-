/**
 * PII 스크러빙 단위 테스트 (의존성 없는 assert 기반).
 * 사용: npx tsx scripts/test-scrub.ts  (실패 시 종료 코드 1)
 */

import { scrub, containsPii } from "../lib/scrub";

let failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) {
    console.log("  ✅ " + msg);
  } else {
    console.error("  ❌ " + msg);
    failed++;
  }
}

const sample = `신청인: 홍길동 (주민등록번호 850101-1234567)
연락처: 010-1234-5678, 이메일 patient@example.com
환자번호: A2024-0099, 계좌 110-234-567890`;

const { text, redactions } = scrub(sample);

console.log("=== 스크러빙 결과 ===");
console.log(text);
console.log("redactions:", JSON.stringify(redactions));
console.log("\n=== 검증 ===");

assert(!/850101-1234567/.test(text), "주민등록번호 제거");
assert(!/010-1234-5678/.test(text), "전화번호 제거");
assert(!/patient@example\.com/.test(text), "이메일 제거");
assert(!/110-234-567890/.test(text), "계좌번호 제거");
assert(/\[이름\]/.test(text), "인명 토큰화(홍길동 → [이름])");
assert(!containsPii(text), "잔존 PII 미탐지");
assert(containsPii(sample), "원문에서는 PII 탐지(대조군)");
assert(
  redactions.some((r) => r.type === "주민등록번호"),
  "치환 내역에 주민등록번호 기록",
);

if (failed) {
  console.error(`\n❌ 스크러빙 테스트 실패: ${failed}건`);
  process.exit(1);
}
console.log("\n✅ 스크러빙 테스트 통과");
