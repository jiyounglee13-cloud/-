import type { DenseVector } from "./embedding";

/**
 * 벡터 검색 백엔드 추상화.
 *
 * DenseVectorIndex가 위임하는 실제 최근접 탐색 엔진이다. 코퍼스 규모에 따라
 * 교체할 수 있다.
 *   - BruteForceBackend: 정확 전수 탐색(소규모)
 *   - LshBackend: 랜덤 초평면 LSH 기반 근사 최근접(ANN, 중대규모)
 *   - (확장) 외부 벡터 DB(pgvector·Qdrant 등) 어댑터: 동일 인터페이스로 구현
 *
 * 모든 벡터는 L2 정규화되어 있으므로 내적이 곧 코사인 유사도다.
 */

export interface QueryResult {
  index: number;
  score: number;
}

export interface VectorBackend {
  readonly id: string;
  // 외부 벡터 DB(HTTP) 백엔드를 위해 비동기 반환을 허용한다.
  build(vectors: DenseVector[]): void | Promise<void>;
  query(vec: DenseVector, topK: number): QueryResult[] | Promise<QueryResult[]>;
}

function dot(a: DenseVector, b: DenseVector): number {
  const n = Math.min(a.length, b.length);
  let s = 0;
  for (let i = 0; i < n; i++) s += a[i] * b[i];
  return s;
}

function topKByScore(
  scores: { index: number; score: number }[],
  topK: number,
): QueryResult[] {
  return scores.sort((a, b) => b.score - a.score).slice(0, topK);
}

// ── 전수(brute-force) 정확 탐색 ────────────────────────────────────

export class BruteForceBackend implements VectorBackend {
  readonly id = "bruteforce";
  private vectors: DenseVector[] = [];

  build(vectors: DenseVector[]): void {
    this.vectors = vectors;
  }

  query(vec: DenseVector, topK: number): QueryResult[] {
    return topKByScore(
      this.vectors.map((v, index) => ({ index, score: dot(vec, v) })),
      topK,
    );
  }
}

// ── LSH (랜덤 초평면) 기반 근사 최근접(ANN) ────────────────────────

/** 시드 기반 LCG + Box-Muller 정규분포 난수 */
function makeGaussian(seed: number) {
  let s = seed >>> 0;
  const rand = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return (s + 1) / 4294967297;
  };
  return () => {
    const u1 = rand();
    const u2 = rand();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  };
}

/**
 * 코사인 유사도용 SimHash LSH.
 * 각 테이블마다 numBits개의 랜덤 초평면으로 부호 서명(signature)을 만들어
 * 동일 버킷의 후보만 추린 뒤, 정확한 코사인으로 재정렬한다. 후보가 부족하면
 * 1비트 멀티프로브 → 최종적으로 전수 탐색으로 폴백하여 정확도를 보장한다.
 */
export class LshBackend implements VectorBackend {
  readonly id = "lsh";
  private numTables: number;
  private numBits: number;
  private seed: number;
  private dim = 0;
  private planes: Float64Array[][] = []; // [table][bit] = hyperplane(dim)
  private buckets: Map<string, number[]>[] = [];
  private vectors: DenseVector[] = [];

  constructor(opts?: { numTables?: number; numBits?: number; seed?: number }) {
    this.numTables = opts?.numTables ?? 4;
    this.numBits = opts?.numBits ?? 12;
    this.seed = opts?.seed ?? 1234;
  }

  build(vectors: DenseVector[]): void {
    this.vectors = vectors;
    this.dim = vectors[0]?.length ?? 0;
    const gauss = makeGaussian(this.seed);

    // 테이블별 랜덤 초평면 생성
    this.planes = [];
    for (let t = 0; t < this.numTables; t++) {
      const tablePlanes: Float64Array[] = [];
      for (let b = 0; b < this.numBits; b++) {
        const plane = new Float64Array(this.dim);
        for (let d = 0; d < this.dim; d++) plane[d] = gauss();
        tablePlanes.push(plane);
      }
      this.planes.push(tablePlanes);
    }

    // 벡터 색인 → 버킷
    this.buckets = this.planes.map(() => new Map<string, number[]>());
    vectors.forEach((v, idx) => {
      for (let t = 0; t < this.numTables; t++) {
        const sig = this.signature(v, t);
        const arr = this.buckets[t].get(sig);
        if (arr) arr.push(idx);
        else this.buckets[t].set(sig, [idx]);
      }
    });
  }

  private signature(vec: DenseVector, table: number): string {
    const planes = this.planes[table];
    let sig = "";
    for (let b = 0; b < planes.length; b++) {
      const plane = planes[b];
      let acc = 0;
      const n = Math.min(vec.length, plane.length);
      for (let d = 0; d < n; d++) acc += vec[d] * plane[d];
      sig += acc >= 0 ? "1" : "0";
    }
    return sig;
  }

  /** 1비트 변형(멀티프로브) 서명들 */
  private probes(sig: string): string[] {
    const out = [sig];
    for (let i = 0; i < sig.length; i++) {
      out.push(sig.slice(0, i) + (sig[i] === "1" ? "0" : "1") + sig.slice(i + 1));
    }
    return out;
  }

  query(vec: DenseVector, topK: number): QueryResult[] {
    // 정확 버킷 + 1비트 멀티프로브로 후보를 모은다(재현율 향상).
    const candidates = new Set<number>();
    for (let t = 0; t < this.numTables; t++) {
      for (const sig of this.probes(this.signature(vec, t))) {
        const arr = this.buckets[t].get(sig);
        if (arr) for (const i of arr) candidates.add(i);
      }
    }

    // 후보가 topK에 못 미치면 전수 탐색 폴백(정확도 보장)
    const indices =
      candidates.size < topK
        ? this.vectors.map((_, i) => i)
        : Array.from(candidates);

    return topKByScore(
      indices.map((index) => ({ index, score: dot(vec, this.vectors[index]) })),
      topK,
    );
  }
}

// ── 백엔드 선택 ────────────────────────────────────────────────────

/** 환경변수 VECTOR_BACKEND(=qdrant|lsh|bruteforce)에 따라 백엔드를 생성한다. */
export function getVectorBackend(): VectorBackend {
  const kind = (process.env.VECTOR_BACKEND || "bruteforce").toLowerCase();
  if (kind === "qdrant") {
    const url = process.env.QDRANT_URL;
    if (!url) {
      console.warn(
        "[vector] VECTOR_BACKEND=qdrant 이나 QDRANT_URL 미설정 — bruteforce로 폴백",
      );
      return new BruteForceBackend();
    }
    // 동적 import로 기본 번들에 외부 백엔드를 포함하지 않는다.
    const { QdrantVectorBackend } = require("./backends/qdrant") as typeof import("./backends/qdrant");
    return new QdrantVectorBackend({
      url,
      apiKey: process.env.QDRANT_API_KEY,
      collection: process.env.QDRANT_COLLECTION,
    });
  }
  if (kind === "lsh") {
    return new LshBackend({
      numTables: Number(process.env.LSH_TABLES || 4),
      numBits: Number(process.env.LSH_BITS || 12),
    });
  }
  return new BruteForceBackend();
}
