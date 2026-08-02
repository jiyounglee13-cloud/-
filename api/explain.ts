import { generateExplanation, statusForResult, type ExplainInput } from './_lib/explain';

/**
 * Vercel 서버리스 함수 (Node 런타임). POST /api/explain
 * 웹 표준 Request/Response 시그니처 — Vercel Node 런타임에서 동작하며,
 * 별도 어댑터 패키지가 필요 없다.
 */
export const config = { runtime: 'nodejs' };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return json({ ok: false, code: 'bad_input', message: 'POST만 허용됩니다.' }, 405);
  }
  let input: ExplainInput;
  try {
    input = (await req.json()) as ExplainInput;
  } catch {
    return json({ ok: false, code: 'bad_input', message: '요청 본문이 JSON이 아닙니다.' }, 400);
  }
  const result = await generateExplanation(input);
  return json(result, statusForResult(result));
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
