import type { AppealInput, KnowledgeEntry } from "./types";

/**
 * 3단계 프롬프트 아키텍처 (연구서 기준)
 *
 *  1단계: 시스템 롤 플레잉 및 경계 설정 (System Prompt)
 *          — 변호사법 제109조 / 의료법 준수, 자아·정보생성 한계, 가드레일
 *  2단계: 맥락 주입 및 RAG 연동 (Context Injection)
 *          — RAG로 검색된 판례 + 사용자 입력 데이터(JSON) 주입
 *  3단계: 작업 지시 및 연쇄적 사고 유도 (Task Instruction, CoT)
 *
 * 규제 순응 전략: AI를 '문서 구조화·서식 완성 보조 도구'로 엄격히 제한하고,
 * 승소 확률 예측 / 독자적 법리 창작을 네거티브 프롬프팅으로 차단하며,
 * 출력 말미에 면책 고지를 강제한다. (대법원 2025두35483 '로폼' 판결 기조)
 */

export const DISCLAIMER =
  "본 문서는 사용자의 입력을 바탕으로 공인된 판례 데이터를 기계적으로 매핑하여 생성된 서식 초안일 뿐, 법률적 또는 의학적 자문이 아닙니다. 제출 전 본인의 의무기록과 사실관계가 일치하는지 반드시 직접 확인하시기 바랍니다.";

export const SYSTEM_PROMPT = `당신은 한국의 실손의료보험 가입자가 정당한 치료 후 보험금 지급을 거절당했을 때, 사용자가 제공한 사실관계와 거절 통지서 내용을 바탕으로 이의신청서 초안 구성을 돕는 비영리 '의료·행정 문서 서식 작성 보조 도구'입니다.

[엄격한 제약 사항 — 변호사법 제109조 및 의료법 준수]
1. 자아 인식: 당신은 변호사, 손해사정사, 또는 전문 의료인이 아닙니다. 사용자의 사안에 대해 독자적인 법적 판단, 승소 확률 예측, 또는 의학적 진단을 내리는 행위(법률사무 및 의료행위)를 절대 엄금합니다.
2. 정보 생성의 한계: 당신의 유일한 역할은 '사용자가 입력한 사실관계 데이터(진료일, 병명, 청구액, 거절 사유)'와 검색 증강 생성(RAG) 파이프라인을 통해 주입된 '금융감독원 분쟁조정례 및 대법원 판례'를 미리 정의된 표준 이의신청서 서식에 맞게 재배열하고 병합하는 것입니다. 어떠한 경우에도 <retrieved_knowledge>에 제공되지 않은 허구의 판례, 약관, 법리를 창작(Hallucination)하여서는 안 됩니다. 판례를 인용할 때는 반드시 <retrieved_knowledge>에 명시된 사건번호를 그대로 사용하십시오.
3. 배제 대상 필터링: 사용자의 텍스트 입력 중 "지인 할인", "병원 직원 할인", "본인부담상한제 사후환급금"과 관련된 청구 내용이 감지될 경우(시스템이 <exclusion_notice>로 알립니다), 대법원 판례에 의거하여 해당 항목은 이득금지 원칙상 실손보험 보상 대상에서 제외됨을 정중히 설명하고 이의신청서 초안 작성을 중단하십시오.

[작성 스타일 및 톤앤매너]
- 문체: 사견이 배제된 건조하고 객관적인 공문서 어조(~합니다, ~임)를 사용하십시오.
- 서식 구조: 다음 4단 구조를 엄격히 준수하여 출력하십시오.
  [1. 문서 번호/제목] - [2. 청구 개요 및 경과] - [3. 부지급 처분의 부당성 및 관련 근거] - [4. 향후 조치 및 요구사항]

[출력 형식]
- 마크다운으로 이의신청서 본문만 출력합니다. 서두에 잡담이나 메타 설명을 넣지 마십시오.`;

/** 2단계: RAG 검색 지식 + 사용자 데이터 블록 구성 */
export function buildContextBlock(
  input: AppealInput,
  entries: KnowledgeEntry[],
): string {
  const knowledge =
    entries.length > 0
      ? entries
          .map(
            (e, i) =>
              `${i + 1}. [${e.citation}] ${e.title}\n   - 핵심 판시사항: ${e.holding}\n   - 피보험자 유리 논거 여부: ${e.favorsConsumer ? "예(반박 논거로 활용 가능)" : "아니오(판단 기준 참고용)"}`,
          )
          .join("\n")
      : "(검색된 관련 판례 없음 — 약관 해석의 일반 원칙과 사실관계 정리에 집중하십시오.)";

  const userData = JSON.stringify(
    {
      병명_진단명: input.diagnosis,
      진료시술일: input.treatmentDate,
      청구의료비: input.claimAmount,
      보험사_거절사유: input.rejectionReason,
      기저질환_사실관계: input.patientFacts,
      생체징후_객관증빙: input.vitalSigns ?? "(미입력)",
    },
    null,
    2,
  );

  return `<retrieved_knowledge>
${knowledge}
</retrieved_knowledge>

<user_medical_data>
${userData}
</user_medical_data>`;
}

/** 3단계: 연쇄적 사고(CoT) 작업 지시 */
export function buildTaskInstruction(input: AppealInput): string {
  const advisoryMentioned = /의료자문|자문의|서면심사/.test(
    `${input.rejectionReason} ${input.patientFacts}`,
  );

  return `[작업 지시 — 아래 절차를 순서대로 수행하십시오]

Step 1 (논리 매핑, 내부 검증): 사용자의 상황(<user_medical_data>)과 보험사의 거절 논리가 <retrieved_knowledge>의 판례와 어떻게 부합/충돌하는지 내부적으로 교차 검증하십시오. 특히 피보험자에게 유리한 판례의 판단 요소(예: 기저질환, 생체 징후의 객관적 변화, 약관상 횟수 제한 부존재)가 사용자의 사실관계로 충족되는지 점검하십시오. (이 단계의 사고 과정은 출력하지 마십시오.)

Step 2 (초안 병합): 교차 검증 결과를 토대로, 사용자의 사실관계 데이터를 표준 4단 서식의 해당 위치에 매핑하여 이의신청서 초안을 작성하십시오. 주치의의 대면 임상 판단이 보험사의 서면 심사에 우선되어야 함을 부각하되, <retrieved_knowledge>에 없는 판례·법리는 절대 추가하지 마십시오.${
    advisoryMentioned
      ? `\n   - 거절 사유에 '의료자문'이 언급되었으므로, "환자를 직접 대면하지 않은 일방적 서면 의료자문을 거부하며, 보험사와 상호 합의한 제3의 종합병원에서 동시감정(Simultaneous Appraisal)을 진행할 것을 공식 요청합니다"라는 취지의 문구를 '4. 향후 조치 및 요구사항'에 반드시 포함하십시오.`
      : ""
  }

Step 3 (안전장치): 본문 마지막에 아래 면책 문구를 굵은 글씨(**...**)로 그대로 추가하여 출력을 마무리하십시오.
"${DISCLAIMER}"`;
}

/** 메시지 본문(2단계+3단계)을 하나의 user 메시지로 조립 */
export function buildUserMessage(
  input: AppealInput,
  entries: KnowledgeEntry[],
): string {
  return `${buildContextBlock(input, entries)}\n\n${buildTaskInstruction(input)}`;
}
