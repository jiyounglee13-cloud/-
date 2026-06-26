// 한국형 FHI — 도메인 타입 정의

/** 분쟁이 자주 발생하는 치료 영역 카테고리 */
export type DisputeCategory =
  | "cataract" // 백내장(다초점렌즈) 입원 인정 분쟁
  | "manual_therapy" // 도수치료 과잉진료 분쟁
  | "knee_stemcell" // 무릎 줄기세포(BMAC 등) 입원 분쟁
  | "medical_advisory" // 보험사 의료자문 강요 대응
  | "general"; // 기타 일반 부지급

/** RAG 지식베이스 항목 — 판례/분쟁조정례 1건 */
export interface KnowledgeEntry {
  id: string;
  category: DisputeCategory;
  title: string;
  /** 사건번호/출처 (예: 대법원 2024다305643) */
  citation: string;
  /** 핵심 판시사항 요약 */
  holding: string;
  /** 소비자(피보험자)에게 유리한 논거인지 여부 */
  favorsConsumer: boolean;
  /** 검색 매칭에 사용되는 키워드 */
  keywords: string[];
}

/** 가드레일(보상 배제) 규칙 */
export interface ExclusionRule {
  id: string;
  /** 배제 대상 명칭 */
  name: string;
  citation: string;
  /** 배제 사유 설명 */
  reason: string;
  /** 사용자 입력에서 탐지할 키워드 */
  triggers: string[];
}

/** 사용자가 제출하는 사건 입력 데이터 */
export interface AppealInput {
  category: DisputeCategory;
  /** 병명 / 진단명 */
  diagnosis: string;
  /** 진료(시술)일 */
  treatmentDate: string;
  /** 청구 의료비(원) */
  claimAmount: string;
  /** 보험사 거절 사유 원문 (거절 통지서에서 발췌/OCR) */
  rejectionReason: string;
  /** 기저질환 등 추가 사실관계 */
  patientFacts: string;
  /** 의무기록상 생체 징후 변화 등 객관 증빙 */
  vitalSigns?: string;
}

/** RAG 검색 결과 + 가드레일 판정 */
export interface RetrievalResult {
  entries: KnowledgeEntry[];
  triggeredExclusions: ExclusionRule[];
}
