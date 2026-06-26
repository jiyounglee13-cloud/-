import type { DenseVector, EmbeddingProvider } from "./embedding";
import {
  getVectorBackend,
  type VectorBackend,
} from "./vectorBackend";

/**
 * Dense 벡터 인덱스.
 *
 * 임베딩 provider로 문서를 벡터화하고, 실제 최근접 탐색은 교체 가능한
 * VectorBackend(lib/vectorBackend.ts)에 위임한다. 기본은 정확 전수 탐색이며,
 * VECTOR_BACKEND=lsh 설정 시 랜덤 초평면 LSH 기반 근사 최근접(ANN)으로
 * 전환된다. 외부 벡터 DB(pgvector·Qdrant 등)도 동일 인터페이스로 연결 가능하다.
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
  private backend: VectorBackend;
  private payloads: T[] = [];

  constructor(provider: EmbeddingProvider, backend?: VectorBackend) {
    this.provider = provider;
    this.backend = backend ?? getVectorBackend();
  }

  async build(docs: VectorDoc<T>[]): Promise<void> {
    const corpus = docs.map((d) => d.text);
    await this.provider.fit(corpus);
    const vectors: DenseVector[] = await this.provider.embedBatch(corpus);
    this.payloads = docs.map((d) => d.payload);
    this.backend.build(vectors);
  }

  async search(query: string, topK = 4, minScore = 0.01): Promise<SearchHit<T>[]> {
    if (!query.trim() || this.payloads.length === 0) return [];
    const qv = await this.provider.embedQuery(query);
    return this.backend
      .query(qv, topK)
      .filter((r) => r.score >= minScore)
      .map((r) => ({ payload: this.payloads[r.index], score: r.score }));
  }
}
