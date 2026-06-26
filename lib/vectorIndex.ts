import type { DenseVector, EmbeddingProvider } from "./embedding";

/**
 * Dense 벡터 인덱스.
 *
 * provider가 반환하는 L2 정규화 벡터를 보관하고 코사인 유사도(=내적)로
 * 검색한다. 현재는 전수(brute-force) 탐색이며, 판례 코퍼스가 수만 건 이상으로
 * 커지면 이 클래스 내부를 HNSW 등 근사 최근접(ANN) 인덱스나 외부 벡터 DB
 * (pgvector, Qdrant 등) 클라이언트로 교체하면 된다. 외부 인터페이스
 * (build/search)는 동일하게 유지한다.
 */

export interface VectorDoc<T> {
  id: string;
  text: string;
  payload: T;
}

export interface SearchHit<T> {
  payload: T;
  score: number;
}

export class DenseVectorIndex<T> {
  private provider: EmbeddingProvider;
  private entries: { payload: T; vec: DenseVector }[] = [];

  constructor(provider: EmbeddingProvider) {
    this.provider = provider;
  }

  async build(docs: VectorDoc<T>[]): Promise<void> {
    const corpus = docs.map((d) => d.text);
    await this.provider.fit(corpus);
    const vectors = await this.provider.embedBatch(corpus);
    this.entries = docs.map((d, i) => ({ payload: d.payload, vec: vectors[i] }));
  }

  async search(query: string, topK = 4, minScore = 0.01): Promise<SearchHit<T>[]> {
    if (!query.trim() || this.entries.length === 0) return [];
    const qv = await this.provider.embedQuery(query);

    return this.entries
      .map((e) => ({ payload: e.payload, score: dot(qv, e.vec) }))
      .filter((h) => h.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}

/** 두 L2 정규화 벡터의 내적 = 코사인 유사도 */
function dot(a: DenseVector, b: DenseVector): number {
  const n = Math.min(a.length, b.length);
  let s = 0;
  for (let i = 0; i < n; i++) s += a[i] * b[i];
  return s;
}
