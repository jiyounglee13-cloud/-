/**
 * 경량 벡터 검색 스토어 (TF-IDF + 코사인 유사도)
 *
 * 외부 임베딩 API 키 없이도 동작하도록, 한국어에 효과적인 '문자 n-gram +
 * 단어 토큰' 기반 TF-IDF 벡터를 구성하고 코사인 유사도로 검색한다.
 * 형태소 분석기 없이도 '다초점렌즈' ↔ '다초점 렌즈'처럼 띄어쓰기·어미가
 * 다른 표현을 문자 n-gram으로 매칭할 수 있다.
 *
 * 인터페이스(build/search)는 외부 임베딩(예: 코사인 유사도 기반 벡터 DB)으로
 * 손쉽게 교체할 수 있도록 설계되었다. 임베딩 제공자를 붙일 경우 toVector를
 * 비동기 임베딩 호출로 바꾸면 된다.
 */

export interface VectorDoc<T> {
  id: string;
  /** 임베딩 대상 텍스트 */
  text: string;
  /** 원본 페이로드 */
  payload: T;
}

export interface SearchHit<T> {
  payload: T;
  /** 코사인 유사도 점수 (0~1) */
  score: number;
}

type SparseVector = Map<string, number>;

const NGRAM_SIZE = 2;

/** 텍스트 정규화: 소문자화 + 한글/영숫자 외 문자는 공백으로 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^0-9a-z가-힣\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** 토큰화: 단어 토큰 + 한글/영숫자 연속 구간의 문자 n-gram */
export function tokenize(text: string): string[] {
  const norm = normalize(text);
  if (!norm) return [];

  const words = norm.split(" ").filter(Boolean);
  const terms: string[] = [];

  for (const w of words) {
    // 단어 토큰 (2자 이상)
    if (w.length >= 2) terms.push(`w:${w}`);
    // 문자 n-gram (한글 의미 매칭에 효과적)
    if (w.length >= NGRAM_SIZE) {
      for (let i = 0; i <= w.length - NGRAM_SIZE; i++) {
        terms.push(`g:${w.slice(i, i + NGRAM_SIZE)}`);
      }
    } else {
      terms.push(`g:${w}`);
    }
  }
  return terms;
}

function termFrequency(terms: string[]): SparseVector {
  const tf: SparseVector = new Map();
  for (const t of terms) tf.set(t, (tf.get(t) ?? 0) + 1);
  return tf;
}

function l2normalize(vec: SparseVector): SparseVector {
  let sumSq = 0;
  for (const v of vec.values()) sumSq += v * v;
  const norm = Math.sqrt(sumSq) || 1;
  const out: SparseVector = new Map();
  for (const [k, v] of vec) out.set(k, v / norm);
  return out;
}

function cosine(a: SparseVector, b: SparseVector): number {
  // 두 벡터 모두 L2 정규화되어 있으므로 내적 = 코사인 유사도
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  let dot = 0;
  for (const [k, v] of small) {
    const w = large.get(k);
    if (w) dot += v * w;
  }
  return dot;
}

export class VectorStore<T> {
  private idf: Map<string, number> = new Map();
  private vectors: { payload: T; vec: SparseVector }[] = [];

  /** 문서 집합으로부터 IDF를 산출하고 각 문서의 TF-IDF 벡터를 사전 계산한다. */
  build(docs: VectorDoc<T>[]): void {
    const n = docs.length;
    const tfs = docs.map((d) => termFrequency(tokenize(d.text)));

    // 문서 빈도(df) 집계
    const df: Map<string, number> = new Map();
    for (const tf of tfs) {
      for (const term of tf.keys()) df.set(term, (df.get(term) ?? 0) + 1);
    }

    // IDF (smoothed)
    this.idf = new Map();
    for (const [term, d] of df) {
      this.idf.set(term, Math.log((n + 1) / (d + 1)) + 1);
    }

    // 문서별 TF-IDF 벡터 (L2 정규화)
    this.vectors = docs.map((doc, i) => {
      const tf = tfs[i];
      const vec: SparseVector = new Map();
      for (const [term, count] of tf) {
        vec.set(term, count * (this.idf.get(term) ?? 0));
      }
      return { payload: doc.payload, vec: l2normalize(vec) };
    });
  }

  /** 질의 텍스트를 동일한 방식으로 벡터화한다. */
  private toVector(text: string): SparseVector {
    const tf = termFrequency(tokenize(text));
    const vec: SparseVector = new Map();
    for (const [term, count] of tf) {
      const idf = this.idf.get(term);
      if (idf) vec.set(term, count * idf);
    }
    return l2normalize(vec);
  }

  /** 코사인 유사도 상위 topK 문서를 반환한다. */
  search(query: string, topK = 4, minScore = 0.01): SearchHit<T>[] {
    const qv = this.toVector(query);
    if (qv.size === 0) return [];

    return this.vectors
      .map((d) => ({ payload: d.payload, score: cosine(qv, d.vec) }))
      .filter((h) => h.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}
