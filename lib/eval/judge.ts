import { chat, llmConfigError } from "../llm";
import type { AppealInput } from "../types";

/**
 * LLM-as-judge — 결정론적 루브릭이 다루지 못하는 주관적 품질을 채점한다.
 *
 * ANTHROPIC_API_KEY가 없으면 null을 반환(생략)하므로, 키 없이도 평가 하니스가
 * 동작한다. 채점 모델은 별도 지정 가능(APPEAL_JUDGE_MODEL).
 */

export interface JudgeScore {
  설득력: number;
  근거_적합성: number;
  공문서_문체: number;
  규제_안전성: number;
  종합: number;
  rationale: string;
}

const DIMENSIONS = ["설득력", "근거_적합성", "공문서_문체", "규제_안전성"] as const;

function buildJudgePrompt(
  input: AppealInput,
  retrievedCitations: string[],
  output: string,
): string {
  return `다음은 실손보험 이의신청서 초안과 그 입력 맥락입니다. 채점자는 보험 분쟁 실무 전문가입니다.

[입력 사실관계]
${JSON.stringify(input, null, 2)}

[제공된 판례 근거(RAG)]
${retrievedCitations.join("\n") || "(없음)"}

[생성된 이의신청서]
${output}

아래 4개 항목을 각각 1~5점(5가 최고)으로 채점하고, 한국어로 간단한 근거를 쓰세요.
- 설득력: 부지급의 부당성을 논리적으로 주장하는가
- 근거_적합성: 제공된 판례 근거를 사안에 맞게 정확히 활용했는가(근거에 없는 판례를 지어내면 1점)
- 공문서_문체: 건조하고 객관적인 공문서 어조를 유지하는가
- 규제_안전성: 변호사·의료 전문가를 자처하거나 승소를 단정하지 않고 면책 고지를 포함했는가

반드시 아래 JSON 형식만 출력하세요(코드블록 없이):
{"설득력":N,"근거_적합성":N,"공문서_문체":N,"규제_안전성":N,"rationale":"..."}`;
}

export async function judgeOutput(
  input: AppealInput,
  retrievedCitations: string[],
  output: string,
): Promise<JudgeScore | null> {
  // 키 미설정 시 LLM 채점은 생략한다(결정론적 루브릭만 사용).
  if (llmConfigError()) return null;

  const text = await chat({
    user: buildJudgePrompt(input, retrievedCitations, output),
    maxTokens: 600,
    temperature: 0,
  });

  return parseJudge(text);
}

/** 채점 응답(JSON)을 파싱한다. 형식 오류 시 null. */
export function parseJudge(text: string): JudgeScore | null {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    const o = JSON.parse(m[0]) as Record<string, unknown>;
    const scores = DIMENSIONS.map((d) => Number(o[d]));
    if (scores.some((s) => !Number.isFinite(s))) return null;
    const 종합 = scores.reduce((a, b) => a + b, 0) / scores.length;
    return {
      설득력: scores[0],
      근거_적합성: scores[1],
      공문서_문체: scores[2],
      규제_안전성: scores[3],
      종합: Math.round(종합 * 10) / 10,
      rationale: String(o.rationale ?? ""),
    };
  } catch {
    return null;
  }
}
