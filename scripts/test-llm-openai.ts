/**
 * OpenAI 호환 LLM 어댑터 검증 (Gemini·OpenAI·OpenRouter 등 공통 경로).
 *
 * 실제 API 키 없이도 어댑터가 올바른 엔드포인트·헤더·바디로 요청하고 응답(논스트림/
 * SSE 스트림)을 정확히 파싱하는지, OpenAI 호환 /chat/completions 를 모사하는
 * in-process 서버로 검증한다. Gemini 무료 티어가 사용하는 바로 그 코드 경로다.
 *
 * 사용: npx tsx scripts/test-llm-openai.ts (실패 시 종료 코드 1)
 */

import http from "node:http";

let failed = 0;
function assert(c: boolean, m: string) {
  console.log((c ? "  ✅ " : "  ❌ ") + m);
  if (!c) failed++;
}

interface Captured {
  path?: string;
  auth?: string;
  model?: string;
  hasSystem?: boolean;
  stream?: boolean;
}
const captured: Captured = {};

function startMock(): Promise<{ base: string; close: () => void }> {
  const server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      const j = JSON.parse(body || "{}");
      captured.path = req.url;
      captured.auth = req.headers["authorization"] as string;
      captured.model = j.model;
      captured.hasSystem = Array.isArray(j.messages) && j.messages[0]?.role === "system";
      captured.stream = !!j.stream;

      if (j.stream) {
        res.writeHead(200, { "Content-Type": "text/event-stream" });
        for (const part of ["이의", "신청서 ", "초안입니다."]) {
          res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: part } }] })}\n\n`);
        }
        res.write("data: [DONE]\n\n");
        res.end();
      } else {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ choices: [{ message: { content: "논스트림 응답입니다." } }] }),
        );
      }
    });
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const a = server.address();
      const port = typeof a === "object" && a ? a.port : 0;
      resolve({ base: `http://127.0.0.1:${port}/v1beta/openai`, close: () => server.close() });
    });
  });
}

async function main() {
  const { base, close } = await startMock();

  // Gemini 무료 티어와 동일한 설정 형태로 어댑터 구성
  process.env.LLM_PROVIDER = "openai";
  process.env.LLM_BASE_URL = base;
  process.env.LLM_API_KEY = "test-key";
  process.env.LLM_MODEL = "gemini-2.0-flash";

  // 설정 후 모듈 로드(함수는 호출 시 env를 읽음)
  const { chat, streamChat, llmConfigError, activeModel } = await import("../lib/llm");

  assert(llmConfigError() === null, "설정 검증 통과(키 인식)");
  assert(activeModel() === "openai:gemini-2.0-flash", `모델 라벨: ${activeModel()}`);

  // 논스트리밍
  const text = await chat({ system: "시스템 지시", user: "사용자 입력" });
  assert(text === "논스트림 응답입니다.", "논스트림 응답 파싱");
  assert(captured.path === "/v1beta/openai/chat/completions", `엔드포인트 경로: ${captured.path}`);
  assert(captured.auth === "Bearer test-key", "Authorization 헤더(Bearer 키)");
  assert(captured.model === "gemini-2.0-flash", "모델명 전달");
  assert(captured.hasSystem === true, "system 메시지 전달");

  // 스트리밍(SSE)
  let acc = "";
  for await (const chunk of streamChat({ system: "S", user: "U" })) acc += chunk;
  assert(acc === "이의신청서 초안입니다.", `SSE 스트림 조립: "${acc}"`);
  assert(captured.stream === true, "stream=true 요청");

  close();

  if (failed) {
    console.error(`\n❌ OpenAI 호환 어댑터 테스트 실패: ${failed}건`);
    process.exit(1);
  }
  console.log("\n✅ OpenAI 호환 어댑터(Gemini 경로) 검증 통과");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
