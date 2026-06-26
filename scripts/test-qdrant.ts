/**
 * Qdrant 백엔드 실연동 스파이크 검증.
 *
 * 외부 Qdrant 서버 없이도 클라이언트가 실제 REST 계약(컬렉션 생성/업서트/검색)을
 * 올바르게 사용하는지 검증하기 위해, Qdrant REST의 사용 부분만 모사하는 in-process
 * HTTP 목 서버를 띄우고 QdrantVectorBackend를 그에 연결한다. 결과를 정확
 * 전수(brute-force) 탐색과 대조한다.
 *
 * QDRANT_URL 환경변수가 설정되면 실제 Qdrant 인스턴스를 대상으로 검증한다.
 * 사용: npx tsx scripts/test-qdrant.ts  (실패 시 종료 코드 1)
 */

import http from "node:http";
import { QdrantVectorBackend } from "../lib/backends/qdrant";
import { BruteForceBackend } from "../lib/vectorBackend";
import type { DenseVector } from "../lib/embedding";

// ── 유틸 ───────────────────────────────────────────────────────────
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 0xffffffff);
}
function unit(v: number[]): DenseVector {
  const n = Math.sqrt(v.reduce((a, x) => a + x * x, 0)) || 1;
  return v.map((x) => x / n);
}
function dot(a: number[], b: number[]) {
  let s = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) s += a[i] * b[i];
  return s;
}

// ── 최소 Qdrant REST 목 서버 ───────────────────────────────────────
function startMockQdrant(): Promise<{ url: string; close: () => void }> {
  const store = new Map<string, number[][]>(); // collection → vectors(by id)

  const server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      const url = req.url || "";
      const json = (o: unknown) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(o));
      };
      const m = url.match(/^\/collections\/([^/?]+)(\/points(\/search)?)?/);
      const coll = m?.[1] ?? "";

      if (req.method === "PUT" && m && !m[2]) {
        store.set(coll, []); // 컬렉션 생성/초기화
        return json({ result: true, status: "ok" });
      }
      if (req.method === "PUT" && m && m[2] === "/points") {
        const { points } = JSON.parse(body) as { points: { id: number; vector: number[] }[] };
        const arr = store.get(coll) ?? [];
        for (const p of points) arr[p.id] = p.vector;
        store.set(coll, arr);
        return json({ result: { status: "completed" }, status: "ok" });
      }
      if (req.method === "POST" && m && m[3] === "/search") {
        const { vector, limit } = JSON.parse(body) as { vector: number[]; limit: number };
        const arr = store.get(coll) ?? [];
        const ranked = arr
          .map((v, id) => ({ id, score: dot(vector, v) })) // 정규화 벡터 → 코사인=내적
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);
        return json({ result: ranked, status: "ok" });
      }
      res.writeHead(404);
      res.end("not found");
    });
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      const port = typeof addr === "object" && addr ? addr.port : 0;
      resolve({ url: `http://127.0.0.1:${port}`, close: () => server.close() });
    });
  });
}

// ── 검증 ───────────────────────────────────────────────────────────
async function main() {
  const rand = makeRng(11);
  const DIM = 48;
  const N = 200;
  const K = 5;
  const Q = 20;

  const corpus = Array.from({ length: N }, () =>
    unit(Array.from({ length: DIM }, () => rand() * 2 - 1)),
  );

  const useReal = !!process.env.QDRANT_URL;
  const mock = useReal ? null : await startMockQdrant();
  const url = process.env.QDRANT_URL || mock!.url;
  console.log(useReal ? `실 Qdrant 대상: ${url}` : `목 Qdrant 대상: ${url}`);

  const qdrant = new QdrantVectorBackend({ url, collection: "spike_test" });
  const brute = new BruteForceBackend();
  await qdrant.build(corpus);
  brute.build(corpus);

  let exactSum = 0;
  for (let i = 0; i < Q; i++) {
    const q = unit(Array.from({ length: DIM }, () => rand() * 2 - 1));
    const truth = brute.query(q, K).map((r) => r.index);
    const got = (await qdrant.query(q, K)).map((r) => r.index);
    const overlap = got.filter((x) => truth.includes(x)).length;
    exactSum += overlap / K;
  }
  const agreement = exactSum / Q;

  mock?.close();

  console.log(`Qdrant↔brute-force top-${K} 일치율 = ${(agreement * 100).toFixed(1)}% (질의 ${Q}건)`);
  if (agreement < 0.99) {
    console.error("❌ 일치율 99% 미만 — REST 연동 결과 불일치");
    process.exit(1);
  }
  console.log("✅ Qdrant 실연동(REST) 검증 통과");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
