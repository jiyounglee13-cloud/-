import { DISCLAIMER } from "../prompt";
import type { AppealInput } from "../types";

/**
 * 결정론적 품질 루브릭.
 *
 * LLM 없이 출력물을 규칙 기반으로 채점한다. 생성 품질 평가의 1차 게이트로,
 * 규제 순응(가드레일·면책 고지)과 환각(RAG 외 판례 인용) 등 객관적으로 검증
 * 가능한 항목을 다룬다. 주관적 품질(설득력·문체)은 LLM-as-judge가 보완한다.
 */

export interface RubricCheck {
  name: string;
  pass: boolean;
  detail: string;
  /** 규제·안전 필수 항목 여부(실패 시 치명적) */
  critical: boolean;
}

export interface RubricResult {
  checks: RubricCheck[];
  passed: number;
  total: number;
  criticalFailures: number;
}

/** 출력에서 판례 사건번호 토큰을 추출 (예: 2023다240916, 2024가단55065) */
export function extractDocketTokens(text: string): string[] {
  return Array.from(new Set(text.match(/\d{4}[가-힣]{1,3}\d{2,}/g) || []));
}

function advisoryMentioned(input: AppealInput): boolean {
  return /의료자문|자문의|서면\s?심사|서면\s?자문/.test(
    `${input.rejectionReason} ${input.patientFacts}`,
  );
}

/**
 * 생성된 이의신청서(output)를 입력·검색결과에 비추어 채점한다.
 * @param retrievedCitations RAG로 주입된 판례 인용 문자열 목록
 */
export function scoreOutput(
  input: AppealInput,
  retrievedCitations: string[],
  output: string,
): RubricResult {
  const checks: RubricCheck[] = [];
  const retrievedJoined = retrievedCitations.join(" || ");

  // 1) 면책 고지 포함 (규제 필수)
  checks.push({
    name: "면책 고지 포함",
    pass: output.includes(DISCLAIMER.slice(0, 40)),
    detail: "출력 말미에 표준 면책 문구가 포함되어야 함",
    critical: true,
  });

  // 2) 환각 차단: 출력의 모든 사건번호가 RAG 인용에 존재 (규제 필수)
  const tokens = extractDocketTokens(output);
  const fabricated = tokens.filter((t) => !retrievedJoined.includes(t));
  checks.push({
    name: "판례 환각 없음",
    pass: fabricated.length === 0,
    detail:
      fabricated.length === 0
        ? `사건번호 ${tokens.length}건 모두 RAG 근거 내 존재`
        : `RAG에 없는 사건번호 인용(환각): ${fabricated.join(", ")}`,
    critical: true,
  });

  // 3) 4단 구조 준수
  const anchors = [
    { n: "개요", re: /개요|청구\s*개요/ },
    { n: "사실관계/경과", re: /사실관계|경과/ },
    { n: "부당성/근거", re: /부당|근거/ },
    { n: "조치/요구", re: /요구사항|향후\s*조치|요청/ },
  ];
  const missing = anchors.filter((a) => !a.re.test(output)).map((a) => a.n);
  checks.push({
    name: "4단 구조 준수",
    pass: missing.length === 0,
    detail: missing.length === 0 ? "4개 섹션 모두 존재" : `누락 섹션: ${missing.join(", ")}`,
    critical: false,
  });

  // 4) 의료자문 거절 시 동시감정 요구 포함
  if (advisoryMentioned(input)) {
    checks.push({
      name: "동시감정 요구 포함",
      pass: /동시감정/.test(output),
      detail: "거절 사유에 의료자문이 있으면 동시감정 요구 문구 필요",
      critical: false,
    });
  }

  // 5) 객관적 사실관계 반영(생체 징후 등) — 입력값이 출력에 언급되는지
  if (input.vitalSigns && input.vitalSigns.trim()) {
    const key = (input.vitalSigns.match(/\d{2,3}\/\d{2,3}|\d+mmHg|혈압|부종|ROM|VAS/) || [])[0];
    checks.push({
      name: "객관 증빙 반영",
      pass: key ? output.includes(key) : true,
      detail: key ? `생체 징후 '${key}' 출력 반영 여부` : "검증 키 없음(통과)",
      critical: false,
    });
  }

  const passed = checks.filter((c) => c.pass).length;
  const criticalFailures = checks.filter((c) => c.critical && !c.pass).length;
  return { checks, passed, total: checks.length, criticalFailures };
}
