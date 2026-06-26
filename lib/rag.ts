import { KNOWLEDGE_BASE, EXCLUSION_RULES } from "./knowledgeBase";
import { getEmbeddingProvider } from "./embedding";
import { DenseVectorIndex, type VectorDoc } from "./vectorIndex";
import type { AppealInput, KnowledgeEntry, RetrievalResult } from "./types";

/**
 * 검색 증강 생성(RAG) 검색기.
 *
 * 판례 검색은 임베딩 provider(lib/embedding.ts) + dense 벡터 인덱스
 * (lib/vectorIndex.ts)로 수행한다. 기본은 로컬 해싱 TF-IDF이며, 환경변수로
 * 외부 임베딩 벡터 DB로 교체해도 retrieve() 인터페이스는 그대로 유지된다.
 *
 * 보상 배제(가드레일) 판정은 의미 검색이 아닌 결정론적 키워드 매칭으로 유지한다.
 * 법적 차단은 재현 가능하고 명시적이어야 하기 때문이다.
 */

function entryToText(e: KnowledgeEntry): string {
  return `${e.title} ${e.holding} ${e.keywords.join(" ")} ${e.category}`;
}

const docs: VectorDoc<KnowledgeEntry>[] = KNOWLEDGE_BASE.map((e) => ({
  id: e.id,
  text: entryToText(e),
  payload: e,
}));

// 인덱스는 1회만 비동기 구축하여 서버 프로세스 수명 동안 재사용한다.
let indexPromise: Promise<DenseVectorIndex<KnowledgeEntry>> | null = null;

function getIndex(): Promise<DenseVectorIndex<KnowledgeEntry>> {
  if (!indexPromise) {
    const index = new DenseVectorIndex<KnowledgeEntry>(getEmbeddingProvider());
    indexPromise = index.build(docs).then(() => index);
  }
  return indexPromise;
}

function buildQuery(input: AppealInput): string {
  return [
    input.diagnosis,
    input.rejectionReason,
    input.patientFacts,
    input.vitalSigns ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * 사용자 입력에 대해 관련 판례를 벡터 검색하고, 동시에 보상 배제(가드레일)
 * 규칙 발동 여부를 결정론적으로 판정한다.
 */
export async function retrieve(
  input: AppealInput,
  topK = 4,
): Promise<RetrievalResult> {
  const query = buildQuery(input);
  const haystack = query.toLowerCase();

  // 가드레일: 배제 대상 키워드 탐지 (결정론적)
  const triggeredExclusions = EXCLUSION_RULES.filter((rule) =>
    rule.triggers.some((t) => haystack.includes(t.toLowerCase())),
  );

  // 벡터 검색(코사인 유사도) + 카테고리/유리논거 가중 후 재정렬
  const index = await getIndex();
  const hits = await index.search(query, Math.max(topK * 2, 6));

  const reranked = hits
    .map((h) => {
      let score = h.score;
      if (h.payload.category === input.category) score += 0.3; // 동일 카테고리 가중
      if (h.payload.favorsConsumer) score += 0.05; // 반박 논거 약간 우선
      return { entry: h.payload, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((x) => x.entry);

  return { entries: reranked, triggeredExclusions };
}
