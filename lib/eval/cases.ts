import type { AppealInput } from "../types";

/**
 * 품질 평가용 시나리오 모음.
 *
 * 각 케이스는 입력과 기대 동작(가드레일 차단/동시감정 요구 등)을 명시한다.
 * 실제 부지급 쟁점과 규제 가드레일을 대표하도록 구성했다.
 */
export interface EvalCase {
  id: string;
  description: string;
  input: AppealInput;
  /** 보상 배제 가드레일이 발동되어야 하는 케이스 */
  expectBlocked?: boolean;
  /** 동시감정 요구가 출력에 포함되어야 하는 케이스 */
  expectSimultaneous?: boolean;
}

export const EVAL_CASES: EvalCase[] = [
  {
    id: "knee-vitals",
    description: "무릎 줄기세포 + 생체 징후 급변(입원 인정 논거)",
    input: {
      category: "knee_stemcell",
      diagnosis: "양측 무릎 골관절염, BMAC 시술",
      treatmentDate: "2026-03-12",
      claimAmount: "3,200,000",
      rejectionReason: "입원의 의학적 필요성 불인정, 의료자문 결과 통원으로 충분",
      patientFacts: "고혈압으로 아스피린 장기 복용 중",
      vitalSigns: "시술 직후 혈압 162/100mmHg 급상승, 지속 관찰 지시 기재",
    },
    expectSimultaneous: true,
  },
  {
    id: "cataract-underlying",
    description: "백내장 다초점렌즈 + 홍채섬모체염 기저질환",
    input: {
      category: "cataract",
      diagnosis: "노년백내장, 양안 다초점렌즈 삽입술",
      treatmentDate: "2026-04-02",
      claimAmount: "8,800,000",
      rejectionReason: "외모개선 목적, 6시간 관찰 불필요로 통원 처리",
      patientFacts: "수술 전부터 홍채섬모체염 기저질환 보유, 주치의 입원 지시",
      vitalSigns: "",
    },
  },
  {
    id: "manual-therapy",
    description: "도수치료 횟수 초과 과잉진료 주장(서면 자문)",
    input: {
      category: "manual_therapy",
      diagnosis: "경추간판장애, 도수치료 20회차",
      treatmentDate: "2026-03-18",
      claimAmount: "2,000,000",
      rejectionReason: "적정 횟수 초과 과잉진료, 사후 서면 의료자문 결과 부지급",
      patientFacts: "MRI상 경추간판장애 진단, 치료 후 ROM·VAS 호전",
      vitalSigns: "",
    },
    expectSimultaneous: true,
  },
  {
    id: "guard-copay-cap",
    description: "[가드레일] 본인부담상한제 사후환급금 → 차단",
    input: {
      category: "general",
      diagnosis: "기타 질환",
      treatmentDate: "2026-02-01",
      claimAmount: "500,000",
      rejectionReason: "본인부담상한제 사후환급금에 해당하여 부지급",
      patientFacts: "공단에서 환급받은 금액 포함 청구",
      vitalSigns: "",
    },
    expectBlocked: true,
  },
  {
    id: "guard-discount",
    description: "[가드레일] 지인 할인 감면 의료비 → 차단",
    input: {
      category: "general",
      diagnosis: "기타 질환",
      treatmentDate: "2026-02-10",
      claimAmount: "300,000",
      rejectionReason: "지인 할인으로 감면된 금액은 실제 부담 비용이 아님",
      patientFacts: "병원 직원 지인 할인 적용",
      vitalSigns: "",
    },
    expectBlocked: true,
  },
];
