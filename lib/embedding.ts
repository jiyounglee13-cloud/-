import { tokenize } from "./text";

/**
 * 임베딩 provider 추상화.
 *
 * RAG 검색을 외부 임베딩 벡터 DB로 손쉽게 교체하기 위한 경계(seam)다.
 * 기본값은 API 키 없이 동작하는 로컬 해싱 TF-IDF provider이며,
 * EMBEDDING_API_URL/EMBEDDING_API_KEY 환경변수가 설정되면 OpenAI 호환
 * 임베딩 엔드포인트(예: Voyage, Upstage, OpenAI 등)를 사용하는 원격
 * provider로 자동 전환된다.
 *
 * 모든 provider는 L2 정규화된 dense 벡터를 반환하므로, 인덱스에서 내적이
 * 곧 코사인 유사도가 된다.
 */

export type DenseVector = number[];

export interface EmbeddingProvider {
  /** provider 식별자 (인덱스 캐시 무효화 등에 사용) */
  readonly id: string;
  /** 임베딩 차원 */
  readonly dimension: number;
  /**
   * 통계 기반 provider(TF-IDF 등)는 코퍼스로 1회 적합(fit)이 필요하다.
   * 신경망 임베딩 provider는 no-op이다.
   */
  fit(corpus: string[]): Promise<void> | void;
  embedBatch(texts: string[]): Promise<DenseVector[]>;
  embedQuery(text: string): Promise<DenseVector>;
}

// ── 공통 유틸 ──────────────────────────────────────────────────────

function l2normalize(vec: DenseVector): DenseVector {
  let sumSq = 0;
  for (const v of vec) sumSq += v * v;
  const norm = Math.sqrt(sumSq) || 1;
  return vec.map((v) => v / norm);
}

/** FNV-1a 32-bit 해시 → [0, mod) 버킷 (feature hashing) */
function hashBucket(term: string, mod: number): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < term.length; i++) {
    h ^= term.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) % mod;
}

// ── 로컬 provider: 해싱 TF-IDF ─────────────────────────────────────

/**
 * 외부 의존성·API 키 없이 동작하는 통계 임베딩 provider.
 * 토큰을 고정 차원 버킷으로 해싱(hashing trick)하여 dense TF-IDF 벡터를
 * 생성한다. 소~중규모 판례 코퍼스에 적합하다.
 */
export class HashingTfidfProvider implements EmbeddingProvider {
  readonly id: string;
  readonly dimension: number;
  private idf: Float64Array;

  constructor(dimension = 2048) {
    this.dimension = dimension;
    this.id = `hashing-tfidf-${dimension}`;
    this.idf = new Float64Array(dimension).fill(1);
  }

  fit(corpus: string[]): void {
    const n = corpus.length || 1;
    const df = new Float64Array(this.dimension);
    for (const text of corpus) {
      const buckets = new Set<number>();
      for (const term of tokenize(text)) {
        buckets.add(hashBucket(term, this.dimension));
      }
      for (const b of buckets) df[b] += 1;
    }
    for (let i = 0; i < this.dimension; i++) {
      this.idf[i] = Math.log((n + 1) / (df[i] + 1)) + 1;
    }
  }

  private embedOne(text: string): DenseVector {
    const tf = new Float64Array(this.dimension);
    for (const term of tokenize(text)) {
      tf[hashBucket(term, this.dimension)] += 1;
    }
    const vec: DenseVector = new Array(this.dimension);
    for (let i = 0; i < this.dimension; i++) {
      // sublinear TF × IDF
      vec[i] = tf[i] > 0 ? (1 + Math.log(tf[i])) * this.idf[i] : 0;
    }
    return l2normalize(vec);
  }

  async embedBatch(texts: string[]): Promise<DenseVector[]> {
    return texts.map((t) => this.embedOne(t));
  }

  async embedQuery(text: string): Promise<DenseVector> {
    return this.embedOne(text);
  }
}

// ── 원격 provider: OpenAI 호환 임베딩 엔드포인트 ───────────────────

/**
 * OpenAI 호환 /embeddings 엔드포인트 어댑터.
 * 운영 시 대규모 판례 코퍼스를 신경망 임베딩으로 색인할 때 사용한다.
 */
export class RemoteEmbeddingProvider implements EmbeddingProvider {
  readonly id: string;
  readonly dimension: number;
  private url: string;
  private apiKey: string;
  private model: string;

  constructor(opts: {
    url: string;
    apiKey: string;
    model: string;
    dimension: number;
  }) {
    this.url = opts.url;
    this.apiKey = opts.apiKey;
    this.model = opts.model;
    this.dimension = opts.dimension;
    this.id = `remote-${opts.model}`;
  }

  fit(): void {
    /* 신경망 임베딩은 적합 단계가 필요 없다 */
  }

  async embedBatch(texts: string[]): Promise<DenseVector[]> {
    const res = await fetch(this.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ model: this.model, input: texts }),
    });
    if (!res.ok) {
      throw new Error(`임베딩 API 오류(${res.status}): ${await res.text()}`);
    }
    const json = (await res.json()) as { data: { embedding: number[] }[] };
    return json.data.map((d) => l2normalize(d.embedding));
  }

  async embedQuery(text: string): Promise<DenseVector> {
    const [v] = await this.embedBatch([text]);
    return v;
  }
}

// ── provider 선택 ──────────────────────────────────────────────────

let cached: EmbeddingProvider | null = null;

/** 환경에 따라 원격/로컬 provider를 반환한다(싱글턴). */
export function getEmbeddingProvider(): EmbeddingProvider {
  if (cached) return cached;

  const url = process.env.EMBEDDING_API_URL;
  const apiKey = process.env.EMBEDDING_API_KEY;
  if (url && apiKey) {
    cached = new RemoteEmbeddingProvider({
      url,
      apiKey,
      model: process.env.EMBEDDING_MODEL || "text-embedding-3-small",
      dimension: Number(process.env.EMBEDDING_DIM || 1536),
    });
  } else {
    cached = new HashingTfidfProvider(2048);
  }
  return cached;
}
