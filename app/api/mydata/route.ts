import { fetchRejectedClaims } from "@/lib/mydata";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 마이데이터(실손24) 연동 — 면책 처리된 청구 건 목록 조회 (STUB).
 * 실제 구현에서는 마이데이터 동의 토큰을 검증하고 실손24 API를 호출한다.
 */
export async function GET() {
  try {
    const claims = await fetchRejectedClaims();
    return Response.json({ claims, source: "실손24(stub)", count: claims.length });
  } catch (err: any) {
    return Response.json(
      { error: err?.message || "마이데이터 조회 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
