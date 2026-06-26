/**
 * 생성 품질 평가 러너.
 *
 * 각 평가 케이스에 대해: 가드레일 차단 여부 확인 → (미차단 시) Claude로 생성 →
 * 결정론적 루브릭 채점 → (키 있으면) LLM-as-judge 채점 → 스코어카드 출력.
 *
 * ANTHROPIC_API_KEY가 없으면 생성/LLM 채점은 건너뛰고, 가드레일 케이스와
 * 검색 동작만 평가한다. 결과는 data/eval/report.json 에도 저장한다.
 *
 * 사용: npm run eval
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { EVAL_CASES } from "../lib/eval/cases";
import { scoreOutput } from "../lib/eval/rubric";
import { judgeOutput } from "../lib/eval/judge";
import { generateAppeal } from "../lib/generate";
import { retrieve } from "../lib/rag";

async function main() {
  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  console.log(
    hasKey
      ? "ANTHROPIC_API_KEY 감지 — 생성 + 루브릭 + LLM 채점 수행\n"
      : "ANTHROPIC_API_KEY 없음 — 가드레일·검색만 평가(생성/LLM 채점 생략)\n",
  );

  const report: unknown[] = [];
  let criticalFailures = 0;

  for (const c of EVAL_CASES) {
    console.log(`\n### ${c.id} — ${c.description}`);
    const { entries, triggeredExclusions } = await retrieve(c.input);
    const blocked = triggeredExclusions.length > 0;

    // 가드레일 케이스: 차단 여부만 검증(생성 불필요)
    if (c.expectBlocked) {
      const ok = blocked;
      console.log(`  가드레일 차단 기대=${c.expectBlocked} 실제=${blocked} → ${ok ? "✅" : "❌"}`);
      if (!ok) criticalFailures++;
      report.push({ id: c.id, type: "guardrail", expectBlocked: true, blocked, pass: ok });
      continue;
    }

    if (blocked) {
      console.log("  ❌ 예기치 않게 가드레일 차단됨");
      criticalFailures++;
      report.push({ id: c.id, type: "unexpected_block", pass: false });
      continue;
    }

    if (!hasKey) {
      console.log(`  검색된 판례 ${entries.length}건 — 생성은 키 필요(건너뜀)`);
      report.push({ id: c.id, type: "retrieval_only", retrieved: entries.length });
      continue;
    }

    // 생성 + 채점
    const gen = await generateAppeal(c.input);
    const rubric = scoreOutput(c.input, gen.retrievedCitations, gen.output);
    for (const ch of rubric.checks) {
      console.log(`  ${ch.pass ? "✅" : ch.critical ? "❌" : "⚠️ "} ${ch.name}: ${ch.detail}`);
    }
    criticalFailures += rubric.criticalFailures;

    const judge = await judgeOutput(c.input, gen.retrievedCitations, gen.output);
    if (judge) {
      console.log(
        `  🧑‍⚖️ 설득력 ${judge.설득력} · 근거 ${judge.근거_적합성} · 문체 ${judge.공문서_문체} · 안전 ${judge.규제_안전성} → 종합 ${judge.종합}`,
      );
    }
    report.push({ id: c.id, type: "generated", rubric, judge });
  }

  const outDir = join(process.cwd(), "data", "eval");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "report.json"), JSON.stringify(report, null, 2), "utf-8");

  console.log(`\n— 평가 종료. 치명적 실패 ${criticalFailures}건. report → data/eval/report.json`);
  if (criticalFailures > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
