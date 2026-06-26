/**
 * LoRA 파인튜닝용 합성 학습 데이터 생성기.
 *
 * 연구서의 방법론("질병명 - 거절 사유 - 판례 인용 - 반박 논리" 구조의 합성
 * 데이터를 수만 건 생성하여 한국어 LLM을 LoRA로 경제적으로 미세조정")을
 * 구현한다. 추론 파이프라인과 동일한 프롬프트 포맷(SYSTEM_PROMPT +
 * RAG 컨텍스트 + CoT 지시)을 재사용하여 학습/추론 정합성을 보장한다.
 *
 * 모든 인적사항은 익명 플레이스홀더([연령]대 [성별] 등)로 생성되어 PII가
 * 포함되지 않는다. API 키 없이 결정론적으로 동작한다.
 *
 * 출력: data/synthetic/train.jsonl, val.jsonl (chat messages 포맷)
 *   { "messages": [ {role:"system"}, {role:"user"}, {role:"assistant"} ] }
 *   → axolotl / LLaMA-Factory 등 일반 SFT·LoRA 트레이너 호환
 *
 * 사용: npx tsx scripts/generate-synthetic-data.ts [--max 400]
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { KNOWLEDGE_BASE } from "../lib/knowledgeBase";
import {
  SYSTEM_PROMPT,
  DISCLAIMER,
  buildContextBlock,
  buildTaskInstruction,
} from "../lib/prompt";
import type { AppealInput, DisputeCategory, KnowledgeEntry } from "../lib/types";

// ── 결정론적 RNG (LCG) — 재현 가능한 셔플/샘플 ─────────────────────
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

// ── 카테고리별 시나리오 슬롯 (익명·합성) ───────────────────────────
interface Scenario {
  diagnoses: string[];
  rejectionReasons: string[];
  facts: string[];
  vitals: string[];
}

const SCENARIOS: Record<Exclude<DisputeCategory, "general">, Scenario> = {
  cataract: {
    diagnoses: [
      "노년백내장, 양안 다초점 인공수정체 삽입술",
      "백내장, 단안 다초점렌즈 삽입술",
      "성숙백내장, 양안 수정체유화술 및 인공수정체 삽입",
    ],
    rejectionReasons: [
      "다초점렌즈 삽입술은 시력교정 목적의 외모개선 성격이 강하고 6시간 이상 관찰을 요하는 실질적 입원으로 보기 어려워 입원 의료비는 부지급함.",
      "통원으로 시행 가능한 수술로 판단되어 입원 의료비 한도 내 보상이 불가함. 의료자문 결과 입원 불필요.",
    ],
    facts: [
      "수술 전부터 홍채섬모체염 기저질환을 앓고 있어 주치의의 개별적 판단에 따라 입원이 이루어짐",
      "고령으로 단독 거동이 어려워 세극등현미경 검사상 합병증 위험이 확인되어 입원 관찰함",
      "당뇨 합병증 동반으로 술후 감염 위험이 높아 주치의가 입원을 지시함",
    ],
    vitals: [
      "세극등현미경 검사상 전방 염증 소견이 의무기록에 기재됨",
      "술후 안압 상승(28mmHg)이 관찰되어 경과관찰이 필요하였음",
      "",
    ],
  },
  manual_therapy: {
    diagnoses: [
      "경추간판장애, 도수치료 20회차",
      "요추부 염좌 및 긴장, 도수치료 15회차",
      "경추통, 방사선상 추간판 변성 동반 도수치료 25회차",
    ],
    rejectionReasons: [
      "적정 치료 횟수를 초과한 반복 시술로 치료 효과가 명확히 검증되지 않아 과잉진료에 해당하므로 부지급함.",
      "의료자문 결과 통원 물리치료로 충분하여 도수치료 비용은 부지급함.",
    ],
    facts: [
      "담당 의사가 MRI상 경추간판장애를 진단하고 치료 후 운동각도(ROM)와 통증척도(VAS)가 호전됨",
      "방사선학적 객관적 진단에 근거하여 시행되었고 매 회차 통증 경감이 의무기록에 기재됨",
      "1세대 실손 약관 가입자로 약관상 도수치료 횟수 제한 규정이 존재하지 않음",
    ],
    vitals: ["치료 전후 VAS 8점 → 4점으로 감소", "경추 ROM 제한이 치료 후 개선됨", ""],
  },
  knee_stemcell: {
    diagnoses: [
      "양측 무릎 골관절염, BMAC(자가골수 줄기세포) 주사 시술",
      "무릎 연골 결손, 자가골수 흡인 농축물 주사 시술",
    ],
    rejectionReasons: [
      "시술 후 단순 경과관찰에 불과하여 입원의 의학적 필요성이 인정되지 않으므로 입원 의료비는 부지급함.",
      "증세 악화 우려라는 일반적 기재만으로는 입원이 인정되지 않아 부지급함. 의료자문 결과 통원 가능.",
    ],
    facts: [
      "고혈압으로 아스피린을 장기 복용 중이며 시술 직후 심한 부종이 발생함",
      "당뇨·고혈압 기저질환으로 출혈 위험이 높아 의료진의 지속 관찰이 필요하였음",
      "항응고제 복용력으로 시술 후 지혈 및 활력징후 관찰이 요구됨",
    ],
    vitals: [
      "시술 직후 혈압 162/100mmHg로 급상승하여 의료진의 지속 관찰 지시가 의무기록에 기재됨",
      "시술 후 무릎 부종 및 통증으로 활력징후 모니터링이 이루어짐",
    ],
  },
  medical_advisory: {
    diagnoses: [
      "어깨 회전근개 파열, 관절경하 봉합술",
      "추간판 탈출증, 신경성형술",
    ],
    rejectionReasons: [
      "보험사 의료자문 결과 주치의 진단과 달리 치료의 필요성이 인정되지 않아 부지급함.",
      "제3 의료기관 서면 의료자문 결과에 따라 면책 처리함.",
    ],
    facts: [
      "환자를 직접 대면 진료한 주치의가 수술의 필요성을 명확히 진단함",
      "보험사가 환자를 대면하지 않은 서면 자문만으로 면책을 통지함",
      "MRI 등 객관적 검사 소견이 주치의 진단을 뒷받침함",
    ],
    vitals: ["", "객관적 영상검사 소견이 의무기록에 첨부됨"],
  },
};

// ── 합성 이의신청서(정답) 생성 ─────────────────────────────────────
function buildDraft(input: AppealInput, entries: KnowledgeEntry[]): string {
  const advisory = /의료자문|자문의|서면심사|서면 자문/.test(
    `${input.rejectionReason} ${input.patientFacts}`,
  );

  const groundsParas = entries
    .map(
      (e) =>
        `본 건과 같은 쟁점에 관하여 ${e.citation}은(는) "${e.holding}"라고 판단한 바 있습니다.`,
    )
    .join(" ");

  const vitalsLine = input.vitalSigns
    ? ` 특히 의무기록상 ${input.vitalSigns}이(가) 객관적으로 확인됩니다.`
    : "";

  const advisoryLine = advisory
    ? "\n- 환자를 직접 대면하지 않은 일방적 서면 의료자문을 거부하며, 보험사와 상호 합의한 제3의 종합병원에서 동시감정(Simultaneous Appraisal)을 진행할 것을 공식 요청합니다."
    : "";

  return `# 실손의료보험금 부지급 결정에 대한 이의신청서

## 1. 청구 개요 및 경과
- 피보험자: (익명 처리)
- 진료(시술)일: ${input.treatmentDate || "(기재 생략)"}
- 진단명: ${input.diagnosis}
- 청구 의료비: ${input.claimAmount || "(기재 생략)"}원
- 보험사 부지급 통지 사유: "${input.rejectionReason}"

## 2. 청구 사실관계
${input.patientFacts}.${vitalsLine}

## 3. 부지급 처분의 부당성 및 관련 근거
${groundsParas} 위 기준에 비추어 볼 때, 본 건은 환자를 직접 대면하여 진료한 주치의의 임상적 판단과 의무기록상 객관적 증빙에 근거한 것으로, 보험사의 사후적 서면 심사만으로 그 필요성을 부정할 수 없습니다.

## 4. 향후 조치 및 요구사항
- 위 근거에 따라 부지급 결정의 재심사 및 정당한 보험금의 지급을 요청합니다.${advisoryLine}
- 원만히 해결되지 아니할 경우 금융감독원 분쟁조정을 신청할 예정입니다.

**${DISCLAIMER}**`;
}

// ── 메인 ───────────────────────────────────────────────────────────
function main() {
  const maxArg = process.argv.indexOf("--max");
  const MAX = maxArg > -1 ? Number(process.argv[maxArg + 1]) : 400;
  const rng = makeRng(42);

  const examples: { messages: { role: string; content: string }[] }[] = [];

  for (const [category, sc] of Object.entries(SCENARIOS) as [
    Exclude<DisputeCategory, "general">,
    Scenario,
  ][]) {
    const favorable = KNOWLEDGE_BASE.filter(
      (e) => e.category === category && e.favorsConsumer,
    );
    const general = KNOWLEDGE_BASE.filter(
      (e) => e.category === "general" && e.favorsConsumer,
    );
    const entries = [...favorable, ...general.slice(0, 1)];

    for (const diagnosis of sc.diagnoses) {
      for (const rejectionReason of sc.rejectionReasons) {
        for (const patientFacts of sc.facts) {
          for (const vitalSigns of sc.vitals) {
            const input: AppealInput = {
              category,
              diagnosis,
              treatmentDate: "2026-0X-XX",
              claimAmount: `${(1 + Math.floor(rng() * 80)) * 100_000}`,
              rejectionReason,
              patientFacts,
              vitalSigns,
            };

            const userMsg = `${buildContextBlock(input, entries)}\n\n${buildTaskInstruction(input)}`;
            const assistant = buildDraft(input, entries);

            examples.push({
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userMsg },
                { role: "assistant", content: assistant },
              ],
            });
          }
        }
      }
    }
  }

  // 셔플 후 cap, train/val 분할
  for (let i = examples.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [examples[i], examples[j]] = [examples[j], examples[i]];
  }
  const capped = examples.slice(0, MAX);
  const valCount = Math.max(1, Math.floor(capped.length * 0.1));
  const val = capped.slice(0, valCount);
  const train = capped.slice(valCount);

  const outDir = join(process.cwd(), "data", "synthetic");
  mkdirSync(outDir, { recursive: true });
  const toJsonl = (arr: typeof capped) =>
    arr.map((e) => JSON.stringify(e)).join("\n") + "\n";
  writeFileSync(join(outDir, "train.jsonl"), toJsonl(train), "utf-8");
  writeFileSync(join(outDir, "val.jsonl"), toJsonl(val), "utf-8");
  writeFileSync(
    join(outDir, "manifest.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString().slice(0, 10),
        seed: 42,
        total: capped.length,
        train: train.length,
        val: val.length,
        format: "chat-messages (system/user/assistant) JSONL",
        note: "익명 합성 데이터. 실제 PII 미포함. 인용 판례는 검증 필요.",
      },
      null,
      2,
    ),
    "utf-8",
  );

  // 디렉터리 보장용 .gitkeep 부모
  void dirname;

  console.log(
    `생성 완료: train ${train.length}건, val ${val.length}건 → ${outDir}`,
  );
}

main();
