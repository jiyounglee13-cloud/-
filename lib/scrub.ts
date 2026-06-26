/**
 * 개인정보(PII) 익명화 — 스크러빙(Scrubbing) 모듈.
 *
 * 금융감독원 분쟁조정 결정문, 한국소비자원 피해구제 사례, 판결문 등 외부에서
 * 수집한 원문에는 환자·신청인의 민감정보가 포함될 수 있다. 지식베이스나
 * 학습 데이터로 활용하기 전에 반드시 본 모듈로 민감정보를 제거해야 한다.
 *
 * 완전 오프라인·결정론적으로 동작한다. 운영 시에는 가명처리 가이드라인에 맞춰
 * 패턴을 지속 보강해야 한다(완전한 비식별화를 보장하지 않음).
 */

export interface Redaction {
  type: string;
  count: number;
}

export interface ScrubResult {
  text: string;
  redactions: Redaction[];
}

interface Rule {
  type: string;
  pattern: RegExp;
  /** 치환 토큰. 캡처그룹을 보존해야 하면 함수 사용 */
  replace: string | ((m: string, ...g: string[]) => string);
}

// 순서 중요: 더 구체적인 패턴을 먼저 적용한다.
const RULES: Rule[] = [
  // 주민등록번호 (외국인등록번호 포함)
  {
    type: "주민등록번호",
    pattern: /\b\d{6}\s?-\s?[1-8]\d{6}\b/g,
    replace: "[주민등록번호]",
  },
  // 이메일
  {
    type: "이메일",
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    replace: "[이메일]",
  },
  // 휴대전화/전화번호
  {
    type: "전화번호",
    pattern: /\b0(1[0-9]|2|[3-6][1-5])\s?-?\s?\d{3,4}\s?-?\s?\d{4}\b/g,
    replace: "[전화번호]",
  },
  // 계좌/카드번호 형태 (구분자로 묶인 숫자 그룹 3개 이상)
  {
    type: "계좌·카드번호",
    pattern: /\b\d{2,6}-\d{2,6}-\d{2,8}(?:-\d{1,8})?\b/g,
    replace: "[계좌번호]",
  },
  // 환자카드/등록번호 등 컨텍스트 앵커형
  {
    type: "등록번호",
    pattern: /(환자(?:등록)?번호|병록번호|차트번호)\s*[:：]?\s*[A-Za-z0-9-]{4,}/g,
    replace: (_m, label: string) => `${label}: [등록번호]`,
  },
  // 컨텍스트 앵커형 인명 (성명/환자/신청인/피보험자 + 한글 이름 2~4자)
  // 한글은 \w가 아니므로 \b 대신 부정형 전방탐색으로 경계를 잡는다.
  {
    type: "인명",
    pattern:
      /(성명|환자명|환자|신청인|피신청인|피보험자|대리인|원고|피고)\s*[:：]?\s*[가-힣]{2,4}(?![가-힣])/g,
    replace: (_m, label: string) => `${label}: [이름]`,
  },
  // 인명 마스킹형(홍○○, 김◯◯)도 토큰화
  {
    type: "인명",
    pattern: /[가-힣][○◯ㅇ*]{1,3}(?![가-힣])/g,
    replace: "[이름]",
  },
];

/** 텍스트에서 PII를 토큰으로 치환하고 치환 내역을 반환한다. */
export function scrub(input: string): ScrubResult {
  let text = input;
  const redactions: Redaction[] = [];

  for (const rule of RULES) {
    let count = 0;
    text = text.replace(rule.pattern, (...args) => {
      count++;
      const m = args[0] as string;
      const groups = args.slice(1, -2) as string[];
      return typeof rule.replace === "function"
        ? rule.replace(m, ...groups)
        : rule.replace;
    });
    if (count > 0) {
      const existing = redactions.find((r) => r.type === rule.type);
      if (existing) existing.count += count;
      else redactions.push({ type: rule.type, count });
    }
  }

  return { text, redactions };
}

/** 잔존 PII 의심 패턴이 있으면 true (스크러빙 검증용) */
export function containsPii(text: string): boolean {
  const probes = [
    /\b\d{6}\s?-\s?[1-8]\d{6}\b/, // 주민번호
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, // 이메일
    /\b0(1[0-9]|2|[3-6][1-5])\s?-?\s?\d{3,4}\s?-?\s?\d{4}\b/, // 전화
  ];
  return probes.some((p) => p.test(text));
}
