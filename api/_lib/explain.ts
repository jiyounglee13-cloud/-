import Anthropic from '@anthropic-ai/sdk';

/**
 * 'AI 보조 설명' 생성 로직 (서버 전용).
 * - ANTHROPIC_API_KEY 는 서버(서버리스 함수)에서만 읽으며 브라우저에 노출되지 않는다.
 * - 이미 데이터에 있는 사실/의미를 '쉽게 풀어 설명'만 하며, 새로운 사실·연대·인물을
 *   지어내지 않도록 시스템 프롬프트로 강하게 제약한다(출처 없는 단정 금지).
 * - 이 파일은 클라이언트 번들(src/)에서 절대 import 하지 않는다.
 */

export interface ExplainInput {
  title?: string;
  description?: string;
  significance?: string;
  track?: string;
  category?: string;
}

export type ExplainResult =
  | { ok: true; text: string; model: string }
  | { ok: false; code: 'no_api_key' | 'bad_input' | 'refusal' | 'upstream_error'; message: string };

const SYSTEM_PROMPT = `당신은 세계사 타임라인 앱의 '보조 설명' 도우미입니다.
사용자가 준 '사실'과 '의미'를 바탕으로, 배경지식이 적은 사람도 이해하도록 2~4문장으로 쉽게 풀어 설명하세요.

엄격한 규칙:
- 입력에 없는 새로운 사실·연대·인물·수치·사건을 절대 추가하지 마세요. 주어진 내용만 재구성·부연합니다.
- 확실하지 않으면 단정하지 말고 "주어진 정보만으로는 알기 어렵다"고 쓰세요.
- 출처를 지어내지 마세요. 이 설명에는 출처가 없습니다.
- 한국어로, 군더더기 없이 간결하게. 내부 사고 과정이나 XML 태그를 출력하지 마세요.
- 마지막에 별도의 면책 문구를 붙이지 마세요(UI가 따로 표시합니다).`;

export async function generateExplanation(input: ExplainInput): Promise<ExplainResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      code: 'no_api_key',
      message: 'AI 보조 해설은 배포 환경에 ANTHROPIC_API_KEY를 설정하면 활성화됩니다.',
    };
  }

  const title = (input.title ?? '').trim();
  const description = (input.description ?? '').trim();
  const significance = (input.significance ?? '').trim();
  if (!title || !description) {
    return { ok: false, code: 'bad_input', message: '설명을 생성할 사건 정보가 부족합니다.' };
  }

  const model = process.env.ANTHROPIC_MODEL || 'claude-opus-5';
  const userText = [
    `사건: ${title}`,
    input.track ? `문화권: ${input.track}` : '',
    input.category ? `분류: ${input.category}` : '',
    '',
    `[사실]`,
    description,
    '',
    `[의미]`,
    significance || '(제공되지 않음)',
    '',
    '위 내용을 바탕으로 쉽게 풀어 쓴 보조 설명을 작성하세요.',
  ]
    .filter((line) => line !== null)
    .join('\n');

  try {
    const client = new Anthropic({ apiKey });
    // effort: 'low' — 짧은 재구성 작업이라 최소 사고로 비용/지연 절감(claude-api 스킬 권장).
    // output_config 등 최신 파라미터는 설치된 SDK 타입에 없을 수 있어 느슨하게 전달.
    const params = {
      model,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userText }],
      output_config: { effort: 'low' },
    };
    const message = await client.messages.create(params as never);

    if (message.stop_reason === 'refusal') {
      return { ok: false, code: 'refusal', message: 'AI가 이 요청에 대한 설명 생성을 거절했습니다.' };
    }

    const text = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('')
      .trim();

    if (!text) {
      return { ok: false, code: 'upstream_error', message: '생성된 설명이 비어 있습니다.' };
    }
    return { ok: true, text, model };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, code: 'upstream_error', message: `AI 요청 중 오류: ${msg}` };
  }
}

/** HTTP 상태코드 매핑 (핸들러 공용) */
export function statusForResult(result: ExplainResult): number {
  if (result.ok) return 200;
  switch (result.code) {
    case 'no_api_key':
      return 501; // 미구성(서버에 키 없음)
    case 'bad_input':
      return 400;
    case 'refusal':
      return 200; // 정상 응답이지만 거절됨
    default:
      return 502;
  }
}
