import type { DenseVector } from "../embedding";
import type { QueryResult, VectorBackend } from "../vectorBackend";

/**
 * Qdrant 벡터 DB 백엔드 (REST API 실연동).
 *
 * 외부 매니지드/셀프호스팅 Qdrant 인스턴스에 연결하여 색인·검색한다.
 * 코사인 거리 컬렉션을 사용하며, 포인트 id는 코퍼스 배열 인덱스를 그대로 쓴다.
 *
 * 실제 Qdrant v1 REST 계약:
 *   PUT  /collections/{c}                  컬렉션 생성
 *   PUT  /collections/{c}/points?wait=true 포인트 업서트
 *   POST /collections/{c}/points/search    유사도 검색
 *
 * 주의: Node 전역 fetch(undici)는 HTTPS_PROXY 환경변수를 자동 사용하지 않는다.
 * 프록시 경유가 필요한 환경에서는 ProxyAgent 설정이 별도로 필요하다.
 */
export class QdrantVectorBackend implements VectorBackend {
  readonly id = "qdrant";
  private url: string;
  private apiKey?: string;
  private collection: string;

  constructor(opts: { url: string; collection?: string; apiKey?: string }) {
    this.url = opts.url.replace(/\/$/, "");
    this.apiKey = opts.apiKey;
    this.collection = opts.collection ?? "silson_kb";
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (this.apiKey) h["api-key"] = this.apiKey;
    return h;
  }

  private async req(method: string, path: string, body?: unknown) {
    const res = await fetch(`${this.url}${path}`, {
      method,
      headers: this.headers(),
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`Qdrant ${method} ${path} → ${res.status}: ${await res.text()}`);
    }
    return res.json();
  }

  async build(vectors: DenseVector[]): Promise<void> {
    const dim = vectors[0]?.length ?? 0;
    // 컬렉션 (재)생성 — 코사인 거리
    await this.req("PUT", `/collections/${this.collection}`, {
      vectors: { size: dim, distance: "Cosine" },
    });
    // 포인트 업서트 (id = 배열 인덱스)
    const points = vectors.map((v, i) => ({ id: i, vector: Array.from(v) }));
    await this.req("PUT", `/collections/${this.collection}/points?wait=true`, {
      points,
    });
  }

  async query(vec: DenseVector, topK: number): Promise<QueryResult[]> {
    const json = (await this.req(
      "POST",
      `/collections/${this.collection}/points/search`,
      { vector: Array.from(vec), limit: topK },
    )) as { result: { id: number; score: number }[] };
    return json.result.map((r) => ({ index: r.id, score: r.score }));
  }
}
