import type { AppealInput, DisputeCategory } from "./types";

/**
 * 실손24 / 마이데이터(MyData) 연동 — STUB 구현
 *
 * 실제 운영에서는 사용자가 마이데이터 정보 제공에 동의하면 보험개발원 '실손24'
 * API(또는 네이버·토스 등 민간 마이데이터 인프라)를 호출하여 과거 보험사로
 * 전송되었으나 '면책(지급 거절)' 처리된 청구 건의 정형 데이터를 파싱해 온다.
 * 본 stub은 키·인증 없이 동작하도록 대표 사례를 모사한다. 인터페이스는 실제
 * API 응답 스키마에 가깝게 설계하여, 추후 실 연동 시 교체가 쉽도록 했다.
 *
 * 이렇게 주입된 정형 데이터는 OCR 인식 오류나 수기 입력 실수를 원천 차단하고,
 * 프롬프트의 <user_medical_data> 블록에 그대로 매핑된다.
 */

export interface MyDataItemizedDetail {
  /** 진료 항목명 */
  name: string;
  /** 급여/비급여 구분 */
  coverage: "급여" | "비급여";
  amount: number;
}

export interface MyDataClaim {
  claimId: string;
  hospitalName: string;
  /** 진료(시술)일 (YYYY-MM-DD) */
  treatmentDate: string;
  /** 질병분류기호 (KCD) */
  kcdCode: string;
  diagnosisName: string;
  /** 분쟁 카테고리 추론값 */
  category: DisputeCategory;
  /** 청구 총액(원) */
  claimAmount: number;
  /** 처리 상태 */
  status: "면책" | "지급" | "일부지급";
  /** 보험사 부지급 사유 (면책/일부지급 시) */
  rejectionReason?: string;
  itemizedDetails: MyDataItemizedDetail[];
}

/** KCD 코드 → 분쟁 카테고리 추론 */
function inferCategory(kcd: string): DisputeCategory {
  const code = kcd.toUpperCase();
  if (code.startsWith("H25") || code.startsWith("H26")) return "cataract";
  if (code.startsWith("M17")) return "knee_stemcell";
  if (code.startsWith("M50") || code.startsWith("M51") || code.startsWith("M54"))
    return "manual_therapy";
  return "general";
}

/**
 * 면책 처리된 청구 건 목록을 가져온다 (실손24 API 호출 모사).
 * 실제 구현에서는 userToken으로 인증된 마이데이터 세션을 사용한다.
 */
export async function fetchRejectedClaims(
  _userToken?: string,
): Promise<MyDataClaim[]> {
  // 네트워크 지연 모사
  await new Promise((r) => setTimeout(r, 350));

  const raw: Omit<MyDataClaim, "category">[] = [
    {
      claimId: "S24-2026-0413-0001",
      hospitalName: "서울밝은안과의원",
      treatmentDate: "2026-04-02",
      kcdCode: "H25.9",
      diagnosisName: "노년백내장, 양안 다초점 인공수정체 삽입술",
      claimAmount: 8_800_000,
      status: "면책",
      rejectionReason:
        "다초점렌즈 삽입술은 시력교정 목적의 외모개선 성격이 강하고, 6시간 이상 관찰을 요하는 실질적 입원 치료로 보기 어려워 입원 의료비는 부지급함.",
      itemizedDetails: [
        { name: "다초점 인공수정체(좌)", coverage: "비급여", amount: 4_000_000 },
        { name: "다초점 인공수정체(우)", coverage: "비급여", amount: 4_000_000 },
        { name: "처치 및 검사료", coverage: "급여", amount: 800_000 },
      ],
    },
    {
      claimId: "S24-2026-0318-0002",
      hospitalName: "튼튼재활의학과의원",
      treatmentDate: "2026-03-18",
      kcdCode: "M51.1",
      diagnosisName: "경추간판장애, 도수치료 20회차",
      claimAmount: 2_000_000,
      status: "면책",
      rejectionReason:
        "적정 치료 횟수를 초과한 반복 시술로 치료 효과가 명확히 검증되지 않아 과잉진료에 해당하므로 부지급함. 의료자문 결과 통원 물리치료로 충분.",
      itemizedDetails: [
        { name: "도수치료(회당 10만원 × 20회)", coverage: "비급여", amount: 2_000_000 },
      ],
    },
    {
      claimId: "S24-2026-0312-0003",
      hospitalName: "연세무릎관절병원",
      treatmentDate: "2026-03-12",
      kcdCode: "M17.0",
      diagnosisName: "양측 무릎 골관절염, BMAC(자가골수 줄기세포) 주사 시술",
      claimAmount: 3_200_000,
      status: "면책",
      rejectionReason:
        "시술 후 단순 경과관찰에 불과하여 입원의 의학적 필요성이 인정되지 않으므로 입원 의료비는 부지급함.",
      itemizedDetails: [
        { name: "BMAC 시술료", coverage: "비급여", amount: 2_800_000 },
        { name: "입원료(1일)", coverage: "급여", amount: 400_000 },
      ],
    },
  ];

  return raw.map((c) => ({ ...c, category: inferCategory(c.kcdCode) }));
}

/** 마이데이터 청구 건을 이의신청서 입력(AppealInput) 형태로 매핑 */
export function claimToAppealInput(claim: MyDataClaim): AppealInput {
  return {
    category: claim.category,
    diagnosis: claim.diagnosisName,
    treatmentDate: claim.treatmentDate,
    claimAmount: claim.claimAmount.toLocaleString("ko-KR"),
    rejectionReason: claim.rejectionReason ?? "",
    patientFacts: `[마이데이터 자동 연동] 의료기관: ${claim.hospitalName} · KCD: ${claim.kcdCode}`,
    vitalSigns: "",
  };
}
