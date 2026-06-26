import Anthropic from "@anthropic-ai/sdk";
import { retrieve } from "./rag";
import { SYSTEM_PROMPT, buildUserMessage } from "./prompt";
import { EXCLUSION_RULES } from "./knowledgeBase";
import type { AppealInput } from "./types";

/**
 * 비스트리밍 이의신청서 생성 (평가 하니스·배치용).
 *
 * 앱의 /api/appeal 라우트는 스트리밍을 사용하지만, 평가·테스트에서는 전체
 * 텍스트를 한 번에 받는 편이 다루기 쉽다. 가드레일 차단 로직과 프롬프트
 * 구성은 라우트와 동일한 lib 함수를 공유한다.
 */

export interface GenerateResult {
  blocked: boolean;
  retrievedCitations: string[];
  output: string;
  /** 차단 시 발동된 배제 규칙 식별자 */
  exclusionIds: string[];
}

const MODEL = process.env.APPEAL_MODEL || "claude-opus-4-8";

export async function generateAppeal(
  input: AppealInput,
  opts?: { model?: string; maxTokens?: number },
): Promise<GenerateResult> {
  const { entries, triggeredExclusions } = await retrieve(input);
  const retrievedCitations = entries.map((e) => e.citation);

  if (triggeredExclusions.length > 0) {
    return {
      blocked: true,
      retrievedCitations,
      exclusionIds: triggeredExclusions.map((e) => e.id),
      output: triggeredExclusions
        .map((r) => `${r.name} — ${r.citation}: ${r.reason}`)
        .join("\n"),
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY 미설정 — 생성을 수행할 수 없습니다.");
  }

  const client = new Anthropic({ apiKey });
  const msg = await client.messages.create({
    model: opts?.model || MODEL,
    max_tokens: opts?.maxTokens ?? 2500,
    temperature: 0.2,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserMessage(input, entries) }],
  });

  const output = msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  return { blocked: false, retrievedCitations, exclusionIds: [], output };
}

/** 전체 배제 규칙 수(테스트 참조용) */
export const EXCLUSION_COUNT = EXCLUSION_RULES.length;
