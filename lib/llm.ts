import Anthropic from "@anthropic-ai/sdk";

/**
 * 제공사 비종속 LLM 어댑터.
 *
 * 환경변수 LLM_PROVIDER 로 백엔드를 선택한다.
 *   - "anthropic"(기본): Claude. ANTHROPIC_API_KEY / APPEAL_MODEL
 *   - 그 외(openai 호환): OpenAI·Gemini(호환 엔드포인트)·OpenRouter·Groq·로컬 등.
 *     LLM_BASE_URL / LLM_API_KEY / LLM_MODEL 로 설정.
 *
 * 대부분의 제공사가 OpenAI Chat Completions 호환 API를 제공하므로, 하나의
 * 어댑터로 여러 제공사를 커버한다. 스트리밍/논스트리밍 모두 지원한다.
 *
 * 보안: API 키는 서버 환경변수로만 주입하며 클라이언트로 노출하지 않는다.
 */

export interface LlmParams {
  system?: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}

function provider(): string {
  return (process.env.LLM_PROVIDER || "anthropic").toLowerCase();
}

function oaiBase(): string {
  return (process.env.LLM_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
}
function oaiKey(): string {
  return process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || "";
}
function oaiModel(): string {
  return process.env.LLM_MODEL || "gpt-4o-mini";
}
function anthropicModel(): string {
  return process.env.APPEAL_MODEL || process.env.LLM_MODEL || "claude-opus-4-8";
}

/** 설정 누락 시 사용자에게 보여줄 메시지(없으면 null) */
export function llmConfigError(): string | null {
  if (provider() === "anthropic") {
    return process.env.ANTHROPIC_API_KEY
      ? null
      : "서버에 ANTHROPIC_API_KEY가 설정되지 않았습니다. (또는 LLM_PROVIDER로 다른 제공사를 지정하세요)";
  }
  return oaiKey()
    ? null
    : "서버에 LLM_API_KEY가 설정되지 않았습니다. 선택한 제공사의 키를 환경변수에 입력하세요.";
}

/** 현재 사용 중인 제공사·모델 라벨(로깅·디버깅용) */
export function activeModel(): string {
  return provider() === "anthropic"
    ? `anthropic:${anthropicModel()}`
    : `${provider()}:${oaiModel()}`;
}

// ── 스트리밍 ───────────────────────────────────────────────────────

export async function* streamChat(p: LlmParams): AsyncGenerator<string> {
  if (provider() === "anthropic") {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
    const stream = client.messages.stream({
      model: anthropicModel(),
      max_tokens: p.maxTokens ?? 2500,
      temperature: p.temperature ?? 0.2,
      system: p.system,
      messages: [{ role: "user", content: p.user }],
    });
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        yield event.delta.text;
      }
    }
    return;
  }

  // OpenAI 호환 스트리밍(SSE)
  const res = await fetch(`${oaiBase()}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${oaiKey()}` },
    body: JSON.stringify({
      model: oaiModel(),
      stream: true,
      temperature: p.temperature ?? 0.2,
      max_tokens: p.maxTokens ?? 2500,
      messages: toMessages(p),
    }),
  });
  if (!res.ok || !res.body) {
    throw new Error(`LLM API ${res.status}: ${await res.text().catch(() => "")}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith("data:")) continue;
      const data = t.slice(5).trim();
      if (data === "[DONE]") return;
      try {
        const j = JSON.parse(data);
        const c = j.choices?.[0]?.delta?.content;
        if (c) yield c as string;
      } catch {
        /* 부분 청크 무시 */
      }
    }
  }
}

// ── 논스트리밍 ─────────────────────────────────────────────────────

export async function chat(p: LlmParams): Promise<string> {
  if (provider() === "anthropic") {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
    const msg = await client.messages.create({
      model: anthropicModel(),
      max_tokens: p.maxTokens ?? 2500,
      temperature: p.temperature ?? 0.2,
      system: p.system,
      messages: [{ role: "user", content: p.user }],
    });
    return msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
  }

  const res = await fetch(`${oaiBase()}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${oaiKey()}` },
    body: JSON.stringify({
      model: oaiModel(),
      temperature: p.temperature ?? 0.2,
      max_tokens: p.maxTokens ?? 2500,
      messages: toMessages(p),
    }),
  });
  if (!res.ok) {
    throw new Error(`LLM API ${res.status}: ${await res.text().catch(() => "")}`);
  }
  const j = await res.json();
  return (j.choices?.[0]?.message?.content as string) ?? "";
}

function toMessages(p: LlmParams) {
  const msgs: { role: string; content: string }[] = [];
  if (p.system) msgs.push({ role: "system", content: p.system });
  msgs.push({ role: "user", content: p.user });
  return msgs;
}
