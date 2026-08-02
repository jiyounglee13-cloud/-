import type { HistEvent } from '../types/event';
import { TRACK_LABELS } from './categories';

export type ExplainResponse =
  | { ok: true; text: string; model: string }
  | { ok: false; code: string; message: string };

/** 사건 상세의 'AI 보조 설명'을 서버리스 함수(/api/explain)에 요청 */
export async function requestExplanation(e: HistEvent): Promise<ExplainResponse> {
  try {
    const res = await fetch('/api/explain', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title: e.title,
        description: e.description,
        significance: e.significance,
        track: TRACK_LABELS[e.track],
        category: e.category,
      }),
    });
    // 응답이 JSON이 아닐 수 있음(예: 배포 안 된 환경의 SPA fallback HTML)
    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return {
        ok: false,
        code: 'unavailable',
        message: 'AI 보조 설명 엔드포인트를 사용할 수 없습니다(로컬은 npm run dev, 배포는 서버리스 함수 필요).',
      };
    }
    return (await res.json()) as ExplainResponse;
  } catch (err) {
    return { ok: false, code: 'network', message: err instanceof Error ? err.message : String(err) };
  }
}
