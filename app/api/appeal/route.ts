import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { retrieve } from "@/lib/rag";
import { SYSTEM_PROMPT, buildUserMessage } from "@/lib/prompt";
import type { AppealInput } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.APPEAL_MODEL || "claude-opus-4-8";

function validate(body: any): body is AppealInput {
  return (
    body &&
    typeof body.diagnosis === "string" &&
    typeof body.rejectionReason === "string" &&
    typeof body.category === "string"
  );
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  if (!validate(body)) {
    return Response.json(
      { error: "필수 항목(병명, 거절 사유, 분쟁 유형)을 입력해 주세요." },
      { status: 400 },
    );
  }

  const input = body as AppealInput;
  const { entries, triggeredExclusions } = await retrieve(input);

  // ── 가드레일: 보상 배제 사안이면 LLM 호출 없이 즉시 차단 안내 ──
  if (triggeredExclusions.length > 0) {
    const blocked = triggeredExclusions
      .map(
        (r) =>
          `### ${r.name}\n- 근거: ${r.citation}\n- 사유: ${r.reason}`,
      )
      .join("\n\n");

    return Response.json({
      blocked: true,
      retrieved: entries.map((e) => ({ citation: e.citation, title: e.title })),
      message:
        `입력하신 내용에는 대법원 판례상 실손보험 보상 대상에서 제외되는 항목이 포함되어 있어, 해당 부분에 대한 이의신청서 초안 작성을 중단합니다.\n\n${blocked}\n\n위 항목을 제외한 다른 청구 건이 있다면 별도로 입력해 주세요.`,
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        error:
          "서버에 ANTHROPIC_API_KEY가 설정되지 않았습니다. .env.local 파일을 확인해 주세요.",
      },
      { status: 500 },
    );
  }

  const client = new Anthropic({ apiKey });
  const userMessage = buildUserMessage(input, entries);

  // 검색된 판례 메타데이터를 응답 헤더로 전달(UI 출처 표기용)
  const retrievedHeader = encodeURIComponent(
    JSON.stringify(
      entries.map((e) => ({ citation: e.citation, title: e.title })),
    ),
  );

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const llmStream = await client.messages.stream({
          model: MODEL,
          max_tokens: 2500,
          temperature: 0.2,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userMessage }],
        });

        for await (const event of llmStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err: any) {
        const msg =
          err?.error?.error?.message || err?.message || "생성 중 오류가 발생했습니다.";
        controller.enqueue(encoder.encode(`\n\n[오류] ${msg}`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Retrieved-Cases": retrievedHeader,
    },
  });
}
