/**
 * 평가 하니스 자체 검증 (API 키 불필요).
 *
 * 결정론적 루브릭이 '준수 출력'은 통과시키고 '위반 출력'(면책 누락, 판례 환각,
 * 구조 누락, 동시감정 누락)은 정확히 적발하는지 확인한다. LLM-as-judge 파서도
 * 함께 검증한다. 사용: npm run test:eval (실패 시 종료 코드 1)
 */

import { scoreOutput, extractDocketTokens } from "../lib/eval/rubric";
import { parseJudge } from "../lib/eval/judge";
import { DISCLAIMER } from "../lib/prompt";
import type { AppealInput } from "../lib/types";

let failed = 0;
function assert(cond: boolean, msg: string) {
  console.log((cond ? "  ✅ " : "  ❌ ") + msg);
  if (!cond) failed++;
}
function check(r: ReturnType<typeof scoreOutput>, name: string) {
  return r.checks.find((c) => c.name === name);
}

const input: AppealInput = {
  category: "knee_stemcell",
  diagnosis: "무릎 골관절염 BMAC 시술",
  treatmentDate: "2026-03-12",
  claimAmount: "3,200,000",
  rejectionReason: "입원 필요성 불인정, 의료자문 결과 통원으로 충분",
  patientFacts: "고혈압 아스피린 복용",
  vitalSigns: "시술 직후 혈압 162/100mmHg 급상승",
};
const retrieved = ["서울중앙지방법원 2026.1. 선고 2024가단55065 (확정)"];

const GOOD = `# 실손의료보험금 부지급 결정에 대한 이의신청서

## 1. 청구 개요 및 경과
- 진단명: 무릎 골관절염 BMAC 시술

## 2. 청구 사실관계
시술 직후 혈압 162/100mmHg로 급상승하였습니다.

## 3. 부지급 처분의 부당성 및 관련 근거
서울중앙지방법원 2026.1. 선고 2024가단55065 판결에 비추어 부당합니다.

## 4. 향후 조치 및 요구사항
일방적 서면 의료자문을 거부하며 제3의 종합병원에서 동시감정을 요청합니다.

**${DISCLAIMER}**`;

console.log("=== 토큰 추출 ===");
assert(extractDocketTokens(GOOD).includes("2024가단55065"), "사건번호 토큰 추출");

console.log("\n=== 준수 출력(GOOD) ===");
const good = scoreOutput(input, retrieved, GOOD);
assert(good.criticalFailures === 0, "치명적 실패 0건");
assert(good.passed === good.total, `모든 체크 통과(${good.passed}/${good.total})`);

console.log("\n=== 위반: 면책 고지 누락 ===");
const noDisc = scoreOutput(input, retrieved, GOOD.replace(`**${DISCLAIMER}**`, ""));
assert(check(noDisc, "면책 고지 포함")?.pass === false, "면책 누락 적발");
assert(noDisc.criticalFailures >= 1, "치명적 실패로 분류");

console.log("\n=== 위반: 판례 환각(RAG 외 사건번호) ===");
const halluc = scoreOutput(input, retrieved, GOOD + "\n또한 대법원 2099다999999 판결도 참고됩니다.");
assert(check(halluc, "판례 환각 없음")?.pass === false, "환각 사건번호 적발");
assert(halluc.criticalFailures >= 1, "치명적 실패로 분류");

console.log("\n=== 위반: 구조 누락(근거 섹션 제거) ===");
const noGrounds = scoreOutput(
  input,
  retrieved,
  GOOD.replace(
    "## 3. 부지급 처분의 부당성 및 관련 근거\n서울중앙지방법원 2026.1. 선고 2024가단55065 판결에 비추어 부당합니다.",
    "## 3. 기타 사항\n서울중앙지방법원 2026.1. 선고 2024가단55065 판결을 참고합니다.",
  ),
);
assert(check(noGrounds, "4단 구조 준수")?.pass === false, "근거 섹션 누락 적발");

console.log("\n=== 위반: 동시감정 누락(의료자문 케이스) ===");
const noSim = scoreOutput(input, retrieved, GOOD.replace("동시감정을 ", "재심사를 "));
assert(check(noSim, "동시감정 요구 포함")?.pass === false, "동시감정 누락 적발");

console.log("\n=== LLM-judge 파서 ===");
const parsed = parseJudge('잡담 {"설득력":4,"근거_적합성":5,"공문서_문체":4,"규제_안전성":5,"rationale":"양호"} 끝');
assert(parsed !== null && parsed.종합 === 4.5, "정상 JSON 파싱 + 종합 계산");
assert(parseJudge("형식 아님") === null, "형식 오류 시 null");

if (failed) {
  console.error(`\n❌ 평가 하니스 테스트 실패: ${failed}건`);
  process.exit(1);
}
console.log("\n✅ 평가 하니스 테스트 통과");
