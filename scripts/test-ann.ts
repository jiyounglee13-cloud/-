/**
 * ANN(LSH) 정확도 검증: 무작위 코퍼스에서 LSH의 recall@k를 전수 탐색 대비
 * 측정한다. 사용: npx tsx scripts/test-ann.ts (실패 시 종료 코드 1)
 */

import { BruteForceBackend, LshBackend } from "../lib/vectorBackend";
import type { DenseVector } from "../lib/embedding";

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function unit(v: number[]): DenseVector {
  const norm = Math.sqrt(v.reduce((a, x) => a + x * x, 0)) || 1;
  return v.map((x) => x / norm);
}
function randVec(dim: number, rand: () => number): number[] {
  return Array.from({ length: dim }, () => rand() * 2 - 1);
}

const rand = makeRng(7);
const DIM = 64;
const N = 500;
const Q = 50;
const K = 5;
const CLUSTERS = 25;

// 실제 임베딩은 군집 구조를 가지므로, 군집 중심 주변에 코퍼스/질의를 생성한다.
const centers = Array.from({ length: CLUSTERS }, () => unit(randVec(DIM, rand)));
const corpus = Array.from({ length: N }, () => {
  const c = centers[Math.floor(rand() * CLUSTERS)];
  return unit(c.map((x) => x + (rand() * 2 - 1) * 0.35)); // 중심 + 노이즈
});
const queries = Array.from({ length: Q }, () => {
  const c = centers[Math.floor(rand() * CLUSTERS)];
  return unit(c.map((x) => x + (rand() * 2 - 1) * 0.15));
});

const brute = new BruteForceBackend();
const lsh = new LshBackend({ numTables: 8, numBits: 6 });
brute.build(corpus);
lsh.build(corpus);

let recallSum = 0;
for (const q of queries) {
  const truth = new Set(brute.query(q, K).map((r) => r.index));
  const approx = lsh.query(q, K).map((r) => r.index);
  const hit = approx.filter((i) => truth.has(i)).length;
  recallSum += hit / K;
}
const recall = recallSum / Q;

console.log(`코퍼스 N=${N}, 차원=${DIM}, 질의 Q=${Q}, k=${K}`);
console.log(`LSH recall@${K} = ${(recall * 100).toFixed(1)}% (vs 전수 탐색)`);

// LSH는 근사이므로 100%는 아니지만, 멀티프로브+폴백으로 높은 재현율을 보장해야 한다.
const THRESHOLD = 0.8;
if (recall < THRESHOLD) {
  console.error(`❌ recall이 임계치(${THRESHOLD * 100}%) 미만`);
  process.exit(1);
}
console.log(`✅ ANN recall 검증 통과 (≥ ${THRESHOLD * 100}%)`);
