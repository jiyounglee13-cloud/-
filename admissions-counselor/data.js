/**
 * 대학 입시 기준 데이터 — 이과(자연계열) 전용
 * ---------------------------------------------------------------
 * 대상: 내신 상위 1~3등급 이과 고등학생 (고1 기준 설계)
 * 기준: 2026학년도 입시결과(2025년 11월 수능 시행분) 및 대학별 공개
 *       전년도 입시결과를 바탕으로 한 "참고용 추정치"입니다.
 * 출처: 대입정보포털 어디가(adiga.kr), 각 대학 입학처 공개 입시결과,
 *       진학사·종로학원 등 공개 분석자료 (README.md 참고)
 *
 * ⚠️ 실제 합격선은 연도·모집단위·경쟁률에 따라 달라집니다.
 *    최종 지원 전 반드시 '어디가'와 각 대학 입학처에서 확인하세요.
 *
 * ※ 남학생 전용 앱이므로 여자대학교는 데이터에서 제외했습니다.
 *
 * 데이터 갱신 방법: universities 배열과 DEPARTMENTS의 수치만 최신
 * 입결로 바꾸고 dataVersion을 올리면 됩니다. (로직 수정 불필요)
 * ---------------------------------------------------------------
 * 필드 설명 (모든 컷은 "70%컷" 기준 — 합격자 10명 중 7등의 성적)
 *  - jungsi : 정시 일반전형 국·수·탐 평균 백분위 70%컷 추정치
 *             (합격자 '평균'은 70%컷보다 백분위 약 +0.6 높게 표시됩니다)
 *  - gyogwa : 수시 학생부교과전형 내신 70%컷 추정치 (null = 전형 없음)
 *             (합격자 '평균'은 70%컷보다 약 0.15등급 좋게 표시됩니다)
 *  - jonghap: 수시 학생부종합전형 합격자 내신 평균 추정치 (편차 큼)
 *  - nonsul : 논술전형 운영 여부
 *  - special: 의약학 계열 보유 학과별 개별 합격선
 *             { j: 정시 백분위 70%컷, g: 교과 내신 70%컷(null=교과 미선발) }
 */

// ---------------------------------------------------------------
// 자연계열 학과 카탈로그
//  - off : 계열 평균 대비 정시 백분위 보정치 (내신은 off×-0.1 등급 환산)
//  - tips: 해당 학과 지원 시 "가중치(경쟁력)"를 얻는 방법
//          [과목 선택 / 학생부·세특 활동 / 수능 반영 특이사항]
// ---------------------------------------------------------------
const DEPARTMENTS = {
  자연: [
    { id: "ai",    name: "컴퓨터공학·AI", off: 1.0, tips: [
      "과목 선택: 미적분·기하 + <b>정보, 인공지능 기초, 프로그래밍</b> 과목을 반드시 이수 — 학종 평가에서 전공적합성 핵심 지표입니다.",
      "세특 활동: 파이썬으로 실데이터를 분석하거나 간단한 앱·알고리즘을 만든 탐구 기록이 강력합니다. 교과 수행평가와 연계하면 자연스럽습니다.",
      "수능 가중치: 대부분 대학이 <b>수학 반영비율 35~40%</b>로 최대 — 수학 백분위 1점이 국어보다 당락에 크게 작용합니다.",
    ] },
    { id: "semi",  name: "전자·반도체공학", off: 0.7, tips: [
      "과목 선택: <b>물리학Ⅰ·Ⅱ</b>는 사실상 필수입니다. 물리 미이수는 학종 면접에서 감점 요인이 됩니다.",
      "세특 활동: 회로·반도체 소자 원리 탐구, 아두이노 실습 기록이 좋습니다. 삼성·SK 계약학과(성균관대·연세대 등)는 취업 연계로 컷이 더 높습니다.",
      "수능 가중치: 수학+과탐 합산 60% 이상 반영 대학 다수. 물리학 응시 시 가산점을 주는 대학이 있습니다.",
    ] },
    { id: "chemE", name: "화학공학", off: 0.5, tips: [
      "과목 선택: <b>화학Ⅰ·Ⅱ</b> + 물리학Ⅰ 조합이 표준입니다.",
      "세특 활동: 실험 설계→데이터 해석→보고서로 이어지는 정량 탐구 기록이 평가에 유리합니다.",
      "수능 가중치: 수학 미적분/기하 지정 대학이 많고, 화학Ⅱ 응시 시 가산하는 대학이 있습니다.",
    ] },
    { id: "mech",  name: "기계공학", off: 0.3, tips: [
      "과목 선택: <b>물리학Ⅰ·Ⅱ</b>(역학 파트)가 핵심 — 기하 이수도 평가에 좋습니다.",
      "세특 활동: 3D 모델링/CAD, 구조물 설계 프로젝트, 물리 역학 심화 탐구가 전공적합성을 보여줍니다.",
      "수능 가중치: 수학·과탐 가중 반영. 물리학 선택 시 가산점 대학이 있습니다.",
    ] },
    { id: "indE",  name: "산업공학", off: 0.2, tips: [
      "과목 선택: <b>확률과 통계 + 정보</b> 조합이 유리 — 데이터 기반 의사결정이 전공 본질입니다.",
      "세특 활동: 최적화·통계 분석 탐구(급식 대기시간 분석 같은 생활 데이터도 좋음)가 차별화 포인트입니다.",
      "수능 가중치: 수학 가중 반영이 크고, 인문 융합(경영과 교차) 성격으로 면접 대비도 필요합니다.",
    ] },
    { id: "civil", name: "건축·토목공학", off: -0.2, tips: [
      "과목 선택: 물리학Ⅰ + <b>지구과학Ⅰ</b> 조합, 기하 이수가 유리합니다.",
      "세특 활동: 구조물·도시 인프라 탐구, 건축 모형 제작 프로젝트 기록이 좋습니다.",
      "수능 가중치: 수학·과탐 가중 반영은 동일하나 컷이 계열 평균보다 낮아 상향 지원 카드로 활용 가능합니다.",
    ] },
    { id: "math",  name: "수학과", off: -0.2, tips: [
      "과목 선택: <b>미적분·기하·확률과통계 3과목 모두</b> 이수 + 고급수학(개설 시)이 최상의 조합입니다.",
      "세특 활동: 수학 증명·문제 일반화 탐구, 수학 동아리에서의 심화 발표 기록이 강력합니다.",
      "수능 가중치: 수학 반영비율 최대 — 수학 1등급이면 계열 평균보다 낮은 컷 덕분에 상위 대학 진입이 수월합니다.",
    ] },
    { id: "bio",   name: "생명과학과", off: -0.2, tips: [
      "과목 선택: <b>생명과학Ⅰ·Ⅱ + 화학Ⅰ</b>이 표준 조합입니다.",
      "세특 활동: 실험(배양·관찰·PCR 원리 등) 탐구와 생명윤리 토론 기록이 좋습니다. 의약학 연계 진로로도 확장됩니다.",
      "수능 가중치: 과탐 2과목 평균이 중요 — 생명·화학 조합으로 응시하는 것이 일반적입니다.",
    ] },
    { id: "chem",  name: "화학과", off: -0.3, tips: [
      "과목 선택: <b>화학Ⅰ·Ⅱ</b> 필수 + 수학 미적분.",
      "세특 활동: 정량 실험(적정·합성) 보고서, 화학Ⅱ 심화 개념 탐구가 유리합니다.",
      "수능 가중치: 화학Ⅱ 응시 가산 대학 존재. 컷이 평균보다 낮아 학교 간판을 올리는 카드가 됩니다.",
    ] },
    { id: "phys",  name: "물리학과", off: -0.4, tips: [
      "과목 선택: <b>물리학Ⅰ·Ⅱ + 기하</b>(벡터) 조합이 핵심입니다.",
      "세특 활동: 역학·전자기 실험 탐구, 시뮬레이션(파이썬) 활용 기록이 차별화됩니다.",
      "수능 가중치: 물리학Ⅱ 응시 시 가산하는 대학(서울대 과탐Ⅱ 요구 등)이 있어 심화 응시가 무기가 됩니다.",
    ] },
    { id: "nurse", name: "간호학과", off: -0.5, tips: [
      "과목 선택: <b>생명과학Ⅰ·Ⅱ + 화학Ⅰ</b>, 보건 관련 선택과목(개설 시).",
      "세특 활동: 보건·의료 봉사와 돌봄 관련 활동의 '꾸준함'이 평가 핵심입니다. 남학생 간호사 수요가 늘어 남학생에게 실질 유리한 측면도 있습니다.",
      "주의: 대학별 컷 편차가 매우 큽니다(상위권 대학 간호는 공대 수준). 반드시 대학별 확인이 필요합니다.",
    ] },
    { id: "env",   name: "환경공학", off: -0.6, tips: [
      "과목 선택: 화학Ⅰ + <b>지구과학Ⅰ·Ⅱ</b> 조합이 유리합니다.",
      "세특 활동: 환경 데이터(미세먼지·수질) 측정·분석 탐구, 기후변화 정책 조사 기록이 좋습니다.",
      "전략: 컷이 낮은 편이라 같은 대학 내 상향 진입 카드로 유용합니다.",
    ] },
    { id: "food",  name: "식품영양학과", off: -0.7, tips: [
      "과목 선택: <b>화학Ⅰ + 생명과학Ⅰ</b> 조합.",
      "세특 활동: 식품 성분 실험, 영양 설계 프로젝트 기록이 유리합니다.",
      "전략: 계열 내 컷이 낮아 안정 카드로 활용하기 좋습니다.",
    ] },
  ],
};

// 의약학 계열 (대학별 special 필드에 보유 학과만 수록)
const SPECIAL_DEPTS = [
  { id: "의예",   name: "의예과",   track: "자연", tips: [
    "과목 선택: <b>미적분/기하 + 생명과학Ⅱ·화학Ⅱ</b>까지 이수하는 것이 표준입니다. 대부분 수능에서 미적분/기하·과탐 지정입니다.",
    "내신: 교과전형은 1.0~1.2등급이 실질 컷 — 전 과목 1등급 관리가 필수입니다.",
    "수능 최저: '3개 영역 합 4' 수준의 높은 최저기준이 일반적 — 국·수·과탐 모두 1등급대를 준비해야 합니다.",
    "학생부: 의학 관련 독서·생명 실험 탐구·꾸준한 봉사의 '일관성'이 면접(MMI 포함)까지 이어집니다.",
  ] },
  { id: "치의예", name: "치의예과", track: "자연", tips: [
    "과목 선택: 의예와 동일하게 미적분/기하 + 생명·화학 심화 조합입니다.",
    "수능 최저·내신 요건은 의예보다 아주 약간 낮은 수준 — 사실상 같은 로드맵으로 준비합니다.",
  ] },
  { id: "한의예", name: "한의예과", track: "자연", tips: [
    "과목 선택: 과탐 심화 + <b>한문 이수 시 가산</b>하는 대학이 있습니다.",
    "일부 대학은 인문 교차 선발도 있으나 자연 트랙이 정원의 대부분입니다.",
  ] },
  { id: "수의예", name: "수의예과", track: "자연", tips: [
    "과목 선택: 생명과학Ⅰ·Ⅱ 중심 + 화학.",
    "세특 활동: 동물·생태 관련 탐구와 봉사(유기동물 보호 등) 기록이 전공적합성을 강하게 보여줍니다.",
  ] },
  { id: "약학",   name: "약학과",   track: "자연", tips: [
    "과목 선택: <b>화학Ⅰ·Ⅱ + 생명과학</b> 조합이 핵심 — 약학은 화학 기반 학문입니다.",
    "내신 1.3~1.7등급 + 높은 수능 최저가 일반적입니다. 화학 세특(약물 작용 원리 탐구 등)이 차별화 포인트입니다.",
  ] },
];

// ---------------------------------------------------------------
// 학생부교과전형 내신 반영 기준 (대학별 상이 — 추정, 매년 요강 확인 필수)
//  - include: 반영 교과   - topN: 상위 N개 교과만 반영 (null = 전 과목)
// ---------------------------------------------------------------
const GYOGWA_BASIS = {
  default: { include: ["국어", "수학", "영어", "과학"], topN: null, text: "국·영·수·과 전 과목" },
  byUni: {
    // 국공립대: 전 교과 반영
    uos:      { include: ["국어", "수학", "영어", "사회", "과학"], topN: null, text: "전 교과(국·영·수·사·과)" },
    seoultech:{ include: ["국어", "수학", "영어", "사회", "과학"], topN: null, text: "전 교과(국·영·수·사·과)" },
    pnu:      { include: ["국어", "수학", "영어", "사회", "과학"], topN: null, text: "전 교과(국·영·수·사·과)" },
    knu:      { include: ["국어", "수학", "영어", "사회", "과학"], topN: null, text: "전 교과(국·영·수·사·과)" },
    cnu:      { include: ["국어", "수학", "영어", "사회", "과학"], topN: null, text: "전 교과(국·영·수·사·과)" },
    cbnu:     { include: ["국어", "수학", "영어", "사회", "과학"], topN: null, text: "전 교과(국·영·수·사·과)" },
    jnu:      { include: ["국어", "수학", "영어", "사회", "과학"], topN: null, text: "전 교과(국·영·수·사·과)" },
    jbnu:     { include: ["국어", "수학", "영어", "사회", "과학"], topN: null, text: "전 교과(국·영·수·사·과)" },
    kangwon:  { include: ["국어", "수학", "영어", "사회", "과학"], topN: null, text: "전 교과(국·영·수·사·과)" },
    jejunu:   { include: ["국어", "수학", "영어", "사회", "과학"], topN: null, text: "전 교과(국·영·수·사·과)" },
    // 일부 대학: 상위 교과만 반영
    gachon:   { include: ["국어", "수학", "영어", "사회", "과학"], topN: 4, text: "국·영·수·사·과 중 상위 4개 교과" },
    hansung:  { include: ["국어", "수학", "영어", "사회", "과학"], topN: 3, text: "국·영·수·사·과 중 상위 3개 교과" },
    sahmyook: { include: ["국어", "수학", "영어", "사회", "과학"], topN: 3, text: "국·영·수·사·과 중 상위 3개 교과" },
    kyonggi:  { include: ["국어", "수학", "영어", "사회", "과학"], topN: 3, text: "국·영·수·사·과 중 상위 3개 교과" },
    sangmyung:{ include: ["국어", "수학", "영어", "사회", "과학"], topN: 4, text: "국·영·수·사·과 중 상위 4개 교과" },
    myongji:  { include: ["국어", "수학", "영어", "사회", "과학"], topN: 4, text: "국·영·수·사·과 중 상위 4개 교과" },
  },
};

// ---------------------------------------------------------------
// 학생부교과전형 수능 최저학력기준 (대학별·학과별 상이 — 추정)
//  - count개 영역 등급 합 sum 이내 (탐구는 통합과학·통합사회 중 상위 1과목)
//  - null = 수능 최저 없음
// ---------------------------------------------------------------
const MIN_REQUIREMENTS = {
  byUni: {
    yonsei: { count: 2, sum: 4, text: "2개 영역 등급 합 4 이내" },
    korea:  { count: 3, sum: 7, text: "3개 영역 등급 합 7 이내" },
    skku:   { count: 3, sum: 7, text: "3개 영역 등급 합 7 이내" },
    sogang: { count: 3, sum: 7, text: "3개 영역 등급 합 7 이내" },
    hanyang: null,
    cau:    { count: 3, sum: 7, text: "3개 영역 등급 합 7 이내" },
    khu:    { count: 2, sum: 5, text: "2개 영역 등급 합 5 이내" },
    hufs:   { count: 2, sum: 4, text: "2개 영역 등급 합 4 이내" },
    uos:    { count: 3, sum: 7, text: "3개 영역 등급 합 7 이내" },
    konkuk: null,
    dongguk: { count: 2, sum: 5, text: "2개 영역 등급 합 5 이내" },
    hongik: { count: 3, sum: 8, text: "3개 영역 등급 합 8 이내" },
    seoultech: { count: 2, sum: 6, text: "2개 영역 등급 합 6 이내" },
    inha:   null,
    ajou:   null,
    soongsil: { count: 2, sum: 5, text: "2개 영역 등급 합 5 이내" },
    kookmin: null,
    sejong: { count: 2, sum: 6, text: "2개 영역 등급 합 6 이내" },
    dankook: null,
    kwangwoon: null,
    sangmyung: null,
    myongji: null,
    gachon: { count: 1, sum: 3, text: "1개 영역 3등급 이내" },
    kyonggi: null,
    hansung: null,
    sahmyook: null,
    pnu:    { count: 2, sum: 5, text: "2개 영역 등급 합 5 이내" },
    knu:    { count: 2, sum: 6, text: "2개 영역 등급 합 6 이내" },
    cnu:    { count: 2, sum: 6, text: "2개 영역 등급 합 6 이내" },
    cbnu:   { count: 2, sum: 7, text: "2개 영역 등급 합 7 이내" },
    jnu:    { count: 2, sum: 7, text: "2개 영역 등급 합 7 이내" },
    jbnu:   { count: 2, sum: 7, text: "2개 영역 등급 합 7 이내" },
    kangwon: null,
    jejunu: null,
  },
  // 의약학 계열은 대학 공통 수준의 높은 최저 적용 (추정)
  special: {
    의예:   { count: 3, sum: 4, text: "3개 영역 등급 합 4 이내" },
    치의예: { count: 3, sum: 5, text: "3개 영역 등급 합 5 이내" },
    한의예: { count: 3, sum: 5, text: "3개 영역 등급 합 5 이내" },
    수의예: { count: 3, sum: 6, text: "3개 영역 등급 합 6 이내" },
    약학:   { count: 3, sum: 6, text: "3개 영역 등급 합 6 이내" },
  },
};

const ADMISSIONS_DATA = {
  dataVersion: "2026학년도 입시결과 기준 · 이과 전용 · 내신 5등급제 대응 (2026-07 갱신)",
  admissionYear: "2028학년도 대입 대비 (현재 고1 — 내신 5등급제 첫 세대)",
  totalSemesters: 5, // 수시 반영 내신: 고1-1 ~ 고3-1 (5개 학기)
  // 70%컷 ↔ 합격자 평균 환산 참고치 (naesin5: 5등급제 스케일)
  avgDelta: { jungsi: 0.6, naesin: 0.15, naesin5: 0.08 },
  // ⚠️ 아래 내신 컷(gyogwa/jonghap/special.g)은 공개된 "9등급제" 입결입니다.
  //    2028대입(현 고1)은 내신 5등급제이므로 앱이 백분율 기준으로
  //    5등급제 환산 컷을 자동 계산해 표시합니다.
  sources: [
    { name: "대입정보포털 어디가", url: "https://www.adiga.kr" },
    { name: "한국대학교육협의회", url: "https://www.kcue.or.kr" },
    { name: "진학사 입시결과 자료실", url: "https://www.jinhak.com" },
  ],
  universities: [
    // ===== 최상위권 =====
    { id: "snu",     name: "서울대학교",       region: "서울", tracks: { 자연: { jungsi: 96.5, gyogwa: null, jonghap: 1.8 } }, nonsul: false, note: "수시는 전원 학생부종합. 정시에도 교과평가 반영. 과탐Ⅱ 1과목 응시 필요.",
      special: { 의예: { j: 99.7, g: null }, 약학: { j: 99.0, g: null }, 수의예: { j: 98.8, g: null } } },
    { id: "yonsei",  name: "연세대학교",       region: "서울", tracks: { 자연: { jungsi: 94.8, gyogwa: 1.7, jonghap: 2.2 } }, nonsul: true,  note: "교과(추천형)는 고교 추천 필요.",
      special: { 의예: { j: 99.6, g: 1.05 }, 치의예: { j: 99.3, g: 1.1 }, 약학: { j: 98.8, g: 1.2 } } },
    { id: "korea",   name: "고려대학교",       region: "서울", tracks: { 자연: { jungsi: 94.5, gyogwa: 1.75, jonghap: 2.2 } }, nonsul: true,  note: "학교추천전형은 내신+수능최저 충족 필수.",
      special: { 의예: { j: 99.5, g: 1.05 } } },
    { id: "kaist",   name: "KAIST",           region: "대전", tracks: { 자연: { jungsi: 96.0, gyogwa: null, jonghap: 1.8 } }, nonsul: false, note: "수시 학종 중심. 수학·과학 심화역량과 올림피아드급 탐구가 중요." },
    { id: "postech", name: "포스텍(POSTECH)", region: "경북", tracks: { 자연: { jungsi: null, gyogwa: null, jonghap: 1.8 } }, nonsul: false, note: "전원 수시 학생부종합 선발." },

    // ===== 상위권 =====
    { id: "skku",    name: "성균관대학교",     region: "서울", tracks: { 자연: { jungsi: 93.5, gyogwa: 1.9, jonghap: 2.4 } }, nonsul: true, note: "반도체시스템공학(삼성 계약학과)은 컷 최상위.",
      special: { 의예: { j: 99.5, g: 1.1 }, 약학: { j: 98.5, g: 1.25 } } },
    { id: "hanyang", name: "한양대학교",       region: "서울", tracks: { 자연: { jungsi: 93.3, gyogwa: 1.6, jonghap: 2.3 } }, nonsul: true, note: "공대 전통 강세. 반도체공학(SK 계약학과) 운영.",
      special: { 의예: { j: 99.4, g: 1.1 } } },
    { id: "sogang",  name: "서강대학교",       region: "서울", tracks: { 자연: { jungsi: 93.0, gyogwa: 1.8, jonghap: 2.4 } }, nonsul: true },
    { id: "cau",     name: "중앙대학교",       region: "서울", tracks: { 자연: { jungsi: 91.0, gyogwa: 1.95, jonghap: 2.6 } }, nonsul: true,
      special: { 의예: { j: 99.3, g: 1.15 }, 약학: { j: 98.3, g: 1.3 } } },
    { id: "khu",     name: "경희대학교",       region: "서울", tracks: { 자연: { jungsi: 90.5, gyogwa: 1.95, jonghap: 2.7 } }, nonsul: true,
      special: { 의예: { j: 99.3, g: 1.15 }, 치의예: { j: 99.0, g: 1.2 }, 한의예: { j: 98.6, g: 1.3 }, 약학: { j: 98.2, g: 1.35 } } },
    { id: "hufs",    name: "한국외국어대학교", region: "서울", tracks: { 자연: { jungsi: 88.5, gyogwa: 2.2, jonghap: 2.9 } }, nonsul: true, note: "자연계열은 글로벌캠퍼스 중심." },
    { id: "uos",     name: "서울시립대학교",   region: "서울", tracks: { 자연: { jungsi: 90.0, gyogwa: 2.0, jonghap: 2.6 } }, nonsul: true, note: "국공립. 등록금 저렴." },

    // ===== 중상위권 =====
    { id: "konkuk",  name: "건국대학교",       region: "서울", tracks: { 자연: { jungsi: 88.5, gyogwa: 2.1, jonghap: 2.9 } }, nonsul: true },
    { id: "dongguk", name: "동국대학교",       region: "서울", tracks: { 자연: { jungsi: 88.0, gyogwa: 2.2, jonghap: 3.0 } }, nonsul: true },
    { id: "hongik",  name: "홍익대학교",       region: "서울", tracks: { 자연: { jungsi: 87.0, gyogwa: 2.3, jonghap: 3.1 } }, nonsul: true },
    { id: "seoultech", name: "서울과학기술대학교", region: "서울", tracks: { 자연: { jungsi: 85.0, gyogwa: 2.4, jonghap: 3.2 } }, nonsul: true, note: "국공립. 공학계열 강세." },
    { id: "inha",    name: "인하대학교",       region: "인천", tracks: { 자연: { jungsi: 85.5, gyogwa: 2.3, jonghap: 3.1 } }, nonsul: true, note: "공대 전통 강세.",
      special: { 의예: { j: 99.1, g: 1.25 } } },
    { id: "ajou",    name: "아주대학교",       region: "경기", tracks: { 자연: { jungsi: 85.5, gyogwa: 2.3, jonghap: 3.1 } }, nonsul: true, note: "공학·의약계열 강세.",
      special: { 의예: { j: 99.2, g: 1.2 }, 약학: { j: 97.8, g: 1.4 } } },

    // ===== 중위권 =====
    { id: "soongsil", name: "숭실대학교",      region: "서울", tracks: { 자연: { jungsi: 85.0, gyogwa: 2.4, jonghap: 3.3 } }, nonsul: true, note: "IT·컴퓨터 계열 강세." },
    { id: "kookmin", name: "국민대학교",       region: "서울", tracks: { 자연: { jungsi: 84.0, gyogwa: 2.5, jonghap: 3.4 } }, nonsul: false },
    { id: "sejong",  name: "세종대학교",       region: "서울", tracks: { 자연: { jungsi: 84.5, gyogwa: 2.5, jonghap: 3.4 } }, nonsul: true },
    { id: "dankook", name: "단국대학교(죽전)", region: "경기", tracks: { 자연: { jungsi: 83.5, gyogwa: 2.6, jonghap: 3.5 } }, nonsul: true, note: "의·치·약학은 천안캠퍼스 소재로 본 데이터 미포함." },
    { id: "kwangwoon", name: "광운대학교",     region: "서울", tracks: { 자연: { jungsi: 83.0, gyogwa: 2.5, jonghap: 3.4 } }, nonsul: true, note: "전자·ICT 계열 강세." },
    { id: "sangmyung", name: "상명대학교",     region: "서울", tracks: { 자연: { jungsi: 80.0, gyogwa: 2.8, jonghap: 3.8 } }, nonsul: false },
    { id: "myongji", name: "명지대학교",       region: "서울", tracks: { 자연: { jungsi: 79.5, gyogwa: 2.9, jonghap: 3.9 } }, nonsul: false },
    { id: "gachon",  name: "가천대학교",       region: "경기", tracks: { 자연: { jungsi: 80.0, gyogwa: 2.9, jonghap: 3.8 } }, nonsul: true,
      special: { 의예: { j: 99.1, g: 1.3 }, 약학: { j: 97.5, g: 1.5 } } },
    { id: "kyonggi", name: "경기대학교",       region: "경기", tracks: { 자연: { jungsi: 77.5, gyogwa: 3.1, jonghap: 4.1 } }, nonsul: false },
    { id: "hansung", name: "한성대학교",       region: "서울", tracks: { 자연: { jungsi: 76.5, gyogwa: 3.2, jonghap: 4.2 } }, nonsul: false },
    { id: "sahmyook", name: "삼육대학교",      region: "서울", tracks: { 자연: { jungsi: 73.5, gyogwa: 3.3, jonghap: 4.3 } }, nonsul: false,
      special: { 약학: { j: 96.7, g: 1.7 } } },

    // ===== 지역거점 국립대 =====
    { id: "pnu",     name: "부산대학교",       region: "부산", tracks: { 자연: { jungsi: 79.0, gyogwa: 2.5, jonghap: 3.4 } }, nonsul: true,  note: "지역거점 국립대.",
      special: { 의예: { j: 99.0, g: 1.2 }, 치의예: { j: 98.6, g: 1.3 }, 한의예: { j: 98.4, g: 1.35 }, 약학: { j: 97.6, g: 1.45 } } },
    { id: "knu",     name: "경북대학교",       region: "대구", tracks: { 자연: { jungsi: 77.5, gyogwa: 2.7, jonghap: 3.6 } }, nonsul: true,  note: "지역거점 국립대. 전자공학 강세.",
      special: { 의예: { j: 99.0, g: 1.25 }, 치의예: { j: 98.5, g: 1.35 }, 수의예: { j: 97.8, g: 1.5 } } },
    { id: "cnu",     name: "충남대학교",       region: "대전", tracks: { 자연: { jungsi: 75.5, gyogwa: 3.0, jonghap: 3.9 } }, nonsul: false, note: "지역거점 국립대.",
      special: { 의예: { j: 98.9, g: 1.3 }, 약학: { j: 97.4, g: 1.5 }, 수의예: { j: 97.7, g: 1.55 } } },
    { id: "cbnu",    name: "충북대학교",       region: "청주", tracks: { 자연: { jungsi: 73.5, gyogwa: 3.1, jonghap: 4.0 } }, nonsul: false, note: "지역거점 국립대.",
      special: { 의예: { j: 98.8, g: 1.35 }, 약학: { j: 97.3, g: 1.5 }, 수의예: { j: 97.4, g: 1.6 } } },
    { id: "jnu",     name: "전남대학교",       region: "광주", tracks: { 자연: { jungsi: 72.0, gyogwa: 3.3, jonghap: 4.2 } }, nonsul: false, note: "지역거점 국립대.",
      special: { 의예: { j: 98.9, g: 1.3 }, 치의예: { j: 98.4, g: 1.4 }, 약학: { j: 97.3, g: 1.5 }, 수의예: { j: 97.6, g: 1.55 } } },
    { id: "jbnu",    name: "전북대학교",       region: "전주", tracks: { 자연: { jungsi: 72.5, gyogwa: 3.2, jonghap: 4.1 } }, nonsul: false, note: "지역거점 국립대.",
      special: { 의예: { j: 98.8, g: 1.35 }, 치의예: { j: 98.3, g: 1.45 }, 수의예: { j: 97.5, g: 1.6 } } },
    { id: "kangwon", name: "강원대학교(춘천)", region: "춘천", tracks: { 자연: { jungsi: 66.0, gyogwa: 4.0, jonghap: 4.9 } }, nonsul: false, note: "지역거점 국립대.",
      special: { 의예: { j: 98.7, g: 1.4 }, 약학: { j: 97.0, g: 1.6 }, 수의예: { j: 97.2, g: 1.65 } } },
    { id: "jejunu",  name: "제주대학교",       region: "제주", tracks: { 자연: { jungsi: 63.0, gyogwa: 4.4, jonghap: 5.3 } }, nonsul: false, note: "지역거점 국립대.",
      special: { 의예: { j: 98.6, g: 1.45 }, 약학: { j: 96.8, g: 1.65 }, 수의예: { j: 97.0, g: 1.7 } } },
  ],
};
