import { KNOWLEDGE_BASE, EXCLUSION_RULES } from "./knowledgeBase";
import type { AppealInput, KnowledgeEntry, RetrievalResult } from "./types";

/**
 * 경량 검색 증강 생성(RAG) 검색기.
 *
 * 운영 환경에서는 임베딩 기반 코사인 유사도(Cosine Similarity) 벡터 검색을
 * 사용해야 하나, 본 MVP에서는 의존성 없이 동작하도록 카테고리 매칭 +
 * 키워드 가중치 스코어링으로 근사한다. 인터페이스는 벡터 검색으로
 * 교체하기 쉽도록 동일하게 유지하였다.
 */

function buildHaystack(input: AppealInput): string {
  return [
    input.diagnosis,
    input.rejectionReason,
    input.patientFacts,
    input.vitalSigns ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

function scoreEntry(entry: KnowledgeEntry, input: AppealInput, haystack: string): number {
  let score = 0;

  // 동일 카테고리는 강한 신호
  if (entry.category === input.category) score += 5;

  // 키워드 매칭 가중치
  for (const kw of entry.keywords) {
    if (haystack.includes(kw.toLowerCase())) score += 2;
  }

  // 소비자에게 유리한 논거를 약간 우선 (반박 논리 구성용)
  if (entry.favorsConsumer) score += 0.5;

  return score;
}

/**
 * 사용자 입력에 대해 관련 판례를 검색하고, 동시에 보상 배제(가드레일)
 * 규칙 발동 여부를 판정한다.
 */
export function retrieve(input: AppealInput, topK = 4): RetrievalResult {
  const haystack = buildHaystack(input);

  // 가드레일: 배제 대상 키워드 탐지
  const triggeredExclusions = EXCLUSION_RULES.filter((rule) =>
    rule.triggers.some((t) => haystack.includes(t.toLowerCase())),
  );

  const entries = KNOWLEDGE_BASE.map((entry) => ({
    entry,
    score: scoreEntry(entry, input, haystack),
  }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((x) => x.entry);

  return { entries, triggeredExclusions };
}
