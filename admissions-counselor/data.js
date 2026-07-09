/**
 * 대학 입시 기준 데이터
 * ---------------------------------------------------------------
 * 기준: 2026학년도 입시결과(2025년 11월 수능 시행분) 및 대학별 공개
 *       전년도 입시결과를 바탕으로 한 "참고용 추정치"입니다.
 * 출처: 대입정보포털 어디가(adiga.kr), 각 대학 입학처 공개 입시결과,
 *       진학사·종로학원 등 공개 분석자료 (README.md 참고)
 *
 * ⚠️ 실제 합격선은 연도·모집단위·경쟁률에 따라 달라집니다.
 *    최종 지원 전 반드시 '어디가'와 각 대학 입학처에서 확인하세요.
 *
 * 데이터 갱신 방법: 아래 universities 배열의 수치만 최신 입결로
 * 바꾸고 dataVersion을 올리면 됩니다. (로직 수정 불필요)
 * ---------------------------------------------------------------
 * 필드 설명
 *  - jungsi : 정시 일반전형 국·수·탐 평균 백분위 70%컷 추정치
 *  - gyogwa : 수시 학생부교과전형 내신 70%컷 추정치 (null = 전형 없음)
 *  - jonghap: 수시 학생부종합전형 내신 평균 추정치 (범위가 넓어 참고만)
 *  - nonsul : 논술전형 운영 여부
 */
const ADMISSIONS_DATA = {
  dataVersion: "2026학년도 입시결과 기준 (2026-07 갱신)",
  admissionYear: "2027학년도 대입 대비",
  totalSemesters: 5, // 수시 반영 내신: 고1-1 ~ 고3-1 (5개 학기)
  sources: [
    { name: "대입정보포털 어디가", url: "https://www.adiga.kr" },
    { name: "한국대학교육협의회", url: "https://www.kcue.or.kr" },
    { name: "진학사 입시결과 자료실", url: "https://www.jinhak.com" },
  ],
  universities: [
    // ===== 최상위권 =====
    { id: "snu",     name: "서울대학교",       region: "서울", tracks: { 인문: { jungsi: 96.8, gyogwa: null, jonghap: 1.5 }, 자연: { jungsi: 96.5, gyogwa: null, jonghap: 1.8 } }, nonsul: false, note: "수시는 전원 학생부종합. 정시에도 교과평가 반영." },
    { id: "yonsei",  name: "연세대학교",       region: "서울", tracks: { 인문: { jungsi: 95.2, gyogwa: 1.55, jonghap: 2.0 }, 자연: { jungsi: 94.8, gyogwa: 1.7, jonghap: 2.2 } }, nonsul: true,  note: "교과(추천형)는 고교 추천 필요." },
    { id: "korea",   name: "고려대학교",       region: "서울", tracks: { 인문: { jungsi: 95.0, gyogwa: 1.65, jonghap: 2.0 }, 자연: { jungsi: 94.5, gyogwa: 1.75, jonghap: 2.2 } }, nonsul: true,  note: "학교추천전형은 내신+수능최저 충족 필수." },
    { id: "kaist",   name: "KAIST",           region: "대전", tracks: { 자연: { jungsi: 96.0, gyogwa: null, jonghap: 1.8 } }, nonsul: false, note: "수시 학종 중심. 수학·과학 심화역량 중요." },
    { id: "postech", name: "포스텍(POSTECH)", region: "경북", tracks: { 자연: { jungsi: null, gyogwa: null, jonghap: 1.8 } }, nonsul: false, note: "전원 수시 학생부종합 선발." },

    // ===== 상위권 =====
    { id: "skku",    name: "성균관대학교",     region: "서울", tracks: { 인문: { jungsi: 93.8, gyogwa: 1.85, jonghap: 2.3 }, 자연: { jungsi: 93.5, gyogwa: 1.9, jonghap: 2.4 } }, nonsul: true },
    { id: "hanyang", name: "한양대학교",       region: "서울", tracks: { 인문: { jungsi: 93.2, gyogwa: 1.55, jonghap: 2.2 }, 자연: { jungsi: 93.3, gyogwa: 1.6, jonghap: 2.3 } }, nonsul: true },
    { id: "sogang",  name: "서강대학교",       region: "서울", tracks: { 인문: { jungsi: 93.5, gyogwa: 1.75, jonghap: 2.3 }, 자연: { jungsi: 93.0, gyogwa: 1.8, jonghap: 2.4 } }, nonsul: true },
    { id: "cau",     name: "중앙대학교",       region: "서울", tracks: { 인문: { jungsi: 91.5, gyogwa: 1.9, jonghap: 2.5 }, 자연: { jungsi: 91.0, gyogwa: 1.95, jonghap: 2.6 } }, nonsul: true },
    { id: "khu",     name: "경희대학교",       region: "서울", tracks: { 인문: { jungsi: 90.8, gyogwa: 1.9, jonghap: 2.6 }, 자연: { jungsi: 90.5, gyogwa: 1.95, jonghap: 2.7 } }, nonsul: true },
    { id: "hufs",    name: "한국외국어대학교", region: "서울", tracks: { 인문: { jungsi: 90.5, gyogwa: 2.0, jonghap: 2.7 }, 자연: { jungsi: 88.5, gyogwa: 2.2, jonghap: 2.9 } }, nonsul: true },
    { id: "uos",     name: "서울시립대학교",   region: "서울", tracks: { 인문: { jungsi: 90.8, gyogwa: 1.9, jonghap: 2.5 }, 자연: { jungsi: 90.0, gyogwa: 2.0, jonghap: 2.6 } }, nonsul: true, note: "국공립. 등록금 저렴." },
    { id: "ewha",    name: "이화여자대학교",   region: "서울", tracks: { 인문: { jungsi: 91.0, gyogwa: 1.8, jonghap: 2.4 }, 자연: { jungsi: 90.0, gyogwa: 1.9, jonghap: 2.5 } }, nonsul: true, note: "여자대학교." },

    // ===== 중상위권 =====
    { id: "konkuk",  name: "건국대학교",       region: "서울", tracks: { 인문: { jungsi: 89.0, gyogwa: 2.0, jonghap: 2.8 }, 자연: { jungsi: 88.5, gyogwa: 2.1, jonghap: 2.9 } }, nonsul: true },
    { id: "dongguk", name: "동국대학교",       region: "서울", tracks: { 인문: { jungsi: 88.5, gyogwa: 2.1, jonghap: 2.9 }, 자연: { jungsi: 88.0, gyogwa: 2.2, jonghap: 3.0 } }, nonsul: true },
    { id: "hongik",  name: "홍익대학교",       region: "서울", tracks: { 인문: { jungsi: 87.5, gyogwa: 2.2, jonghap: 3.0 }, 자연: { jungsi: 87.0, gyogwa: 2.3, jonghap: 3.1 } }, nonsul: true, note: "미술계열은 별도 실기/비교과 기준." },
    { id: "sookmyung", name: "숙명여자대학교", region: "서울", tracks: { 인문: { jungsi: 88.0, gyogwa: 2.1, jonghap: 2.9 }, 자연: { jungsi: 86.5, gyogwa: 2.3, jonghap: 3.1 } }, nonsul: true, note: "여자대학교." },
    { id: "seoultech", name: "서울과학기술대학교", region: "서울", tracks: { 인문: { jungsi: 84.0, gyogwa: 2.3, jonghap: 3.1 }, 자연: { jungsi: 85.0, gyogwa: 2.4, jonghap: 3.2 } }, nonsul: true, note: "국공립. 공학계열 강세." },
    { id: "inha",    name: "인하대학교",       region: "인천", tracks: { 인문: { jungsi: 85.0, gyogwa: 2.3, jonghap: 3.2 }, 자연: { jungsi: 85.5, gyogwa: 2.3, jonghap: 3.1 } }, nonsul: true },
    { id: "ajou",    name: "아주대학교",       region: "경기", tracks: { 인문: { jungsi: 84.5, gyogwa: 2.4, jonghap: 3.2 }, 자연: { jungsi: 85.5, gyogwa: 2.3, jonghap: 3.1 } }, nonsul: true, note: "공학·의약계열 강세." },

    // ===== 중위권 =====
    { id: "soongsil", name: "숭실대학교",      region: "서울", tracks: { 인문: { jungsi: 85.5, gyogwa: 2.3, jonghap: 3.2 }, 자연: { jungsi: 85.0, gyogwa: 2.4, jonghap: 3.3 } }, nonsul: true },
    { id: "kookmin", name: "국민대학교",       region: "서울", tracks: { 인문: { jungsi: 84.5, gyogwa: 2.4, jonghap: 3.3 }, 자연: { jungsi: 84.0, gyogwa: 2.5, jonghap: 3.4 } }, nonsul: false },
    { id: "sejong",  name: "세종대학교",       region: "서울", tracks: { 인문: { jungsi: 84.5, gyogwa: 2.5, jonghap: 3.4 }, 자연: { jungsi: 84.5, gyogwa: 2.5, jonghap: 3.4 } }, nonsul: true },
    { id: "dankook", name: "단국대학교(죽전)", region: "경기", tracks: { 인문: { jungsi: 84.0, gyogwa: 2.5, jonghap: 3.4 }, 자연: { jungsi: 83.5, gyogwa: 2.6, jonghap: 3.5 } }, nonsul: true },
    { id: "kwangwoon", name: "광운대학교",     region: "서울", tracks: { 인문: { jungsi: 82.5, gyogwa: 2.5, jonghap: 3.5 }, 자연: { jungsi: 83.0, gyogwa: 2.5, jonghap: 3.4 } }, nonsul: true, note: "전자·ICT 계열 강세." },
    { id: "sangmyung", name: "상명대학교",     region: "서울", tracks: { 인문: { jungsi: 80.5, gyogwa: 2.7, jonghap: 3.7 }, 자연: { jungsi: 80.0, gyogwa: 2.8, jonghap: 3.8 } }, nonsul: false },
    { id: "myongji", name: "명지대학교",       region: "서울", tracks: { 인문: { jungsi: 80.0, gyogwa: 2.8, jonghap: 3.8 }, 자연: { jungsi: 79.5, gyogwa: 2.9, jonghap: 3.9 } }, nonsul: false },
    { id: "gachon",  name: "가천대학교",       region: "경기", tracks: { 인문: { jungsi: 79.5, gyogwa: 2.9, jonghap: 3.9 }, 자연: { jungsi: 80.0, gyogwa: 2.9, jonghap: 3.8 } }, nonsul: true },
    { id: "kyonggi", name: "경기대학교",       region: "경기", tracks: { 인문: { jungsi: 78.5, gyogwa: 3.0, jonghap: 4.0 }, 자연: { jungsi: 77.5, gyogwa: 3.1, jonghap: 4.1 } }, nonsul: false },
    { id: "sungshin", name: "성신여자대학교",  region: "서울", tracks: { 인문: { jungsi: 79.0, gyogwa: 2.9, jonghap: 3.9 }, 자연: { jungsi: 78.0, gyogwa: 3.0, jonghap: 4.0 } }, nonsul: false, note: "여자대학교." },
    { id: "hansung", name: "한성대학교",       region: "서울", tracks: { 인문: { jungsi: 77.0, gyogwa: 3.1, jonghap: 4.1 }, 자연: { jungsi: 76.5, gyogwa: 3.2, jonghap: 4.2 } }, nonsul: false },
    { id: "swu",     name: "서울여자대학교",   region: "서울", tracks: { 인문: { jungsi: 76.0, gyogwa: 3.2, jonghap: 4.2 }, 자연: { jungsi: 75.0, gyogwa: 3.3, jonghap: 4.3 } }, nonsul: false, note: "여자대학교." },
    { id: "duksung", name: "덕성여자대학교",   region: "서울", tracks: { 인문: { jungsi: 75.0, gyogwa: 3.3, jonghap: 4.3 }, 자연: { jungsi: 75.5, gyogwa: 3.3, jonghap: 4.3 } }, nonsul: false, note: "여자대학교." },
    { id: "dongduk", name: "동덕여자대학교",   region: "서울", tracks: { 인문: { jungsi: 75.5, gyogwa: 3.3, jonghap: 4.3 }, 자연: { jungsi: 74.5, gyogwa: 3.4, jonghap: 4.4 } }, nonsul: false, note: "여자대학교." },
    { id: "sahmyook", name: "삼육대학교",      region: "서울", tracks: { 인문: { jungsi: 73.0, gyogwa: 3.3, jonghap: 4.4 }, 자연: { jungsi: 73.5, gyogwa: 3.3, jonghap: 4.3 } }, nonsul: false },

    // ===== 지역거점 국립대 =====
    { id: "pnu",     name: "부산대학교",       region: "부산", tracks: { 인문: { jungsi: 80.0, gyogwa: 2.4, jonghap: 3.3 }, 자연: { jungsi: 79.0, gyogwa: 2.5, jonghap: 3.4 } }, nonsul: true,  note: "지역거점 국립대." },
    { id: "knu",     name: "경북대학교",       region: "대구", tracks: { 인문: { jungsi: 78.5, gyogwa: 2.6, jonghap: 3.5 }, 자연: { jungsi: 77.5, gyogwa: 2.7, jonghap: 3.6 } }, nonsul: true,  note: "지역거점 국립대." },
    { id: "cnu",     name: "충남대학교",       region: "대전", tracks: { 인문: { jungsi: 76.5, gyogwa: 2.9, jonghap: 3.8 }, 자연: { jungsi: 75.5, gyogwa: 3.0, jonghap: 3.9 } }, nonsul: false, note: "지역거점 국립대." },
    { id: "cbnu",    name: "충북대학교",       region: "청주", tracks: { 인문: { jungsi: 74.5, gyogwa: 3.0, jonghap: 3.9 }, 자연: { jungsi: 73.5, gyogwa: 3.1, jonghap: 4.0 } }, nonsul: false, note: "지역거점 국립대." },
    { id: "jnu",     name: "전남대학교",       region: "광주", tracks: { 인문: { jungsi: 73.0, gyogwa: 3.2, jonghap: 4.1 }, 자연: { jungsi: 72.0, gyogwa: 3.3, jonghap: 4.2 } }, nonsul: false, note: "지역거점 국립대." },
    { id: "jbnu",    name: "전북대학교",       region: "전주", tracks: { 인문: { jungsi: 73.5, gyogwa: 3.1, jonghap: 4.0 }, 자연: { jungsi: 72.5, gyogwa: 3.2, jonghap: 4.1 } }, nonsul: false, note: "지역거점 국립대." },
    { id: "kangwon", name: "강원대학교(춘천)", region: "춘천", tracks: { 인문: { jungsi: 68.0, gyogwa: 3.8, jonghap: 4.7 }, 자연: { jungsi: 66.0, gyogwa: 4.0, jonghap: 4.9 } }, nonsul: false, note: "지역거점 국립대." },
    { id: "jejunu",  name: "제주대학교",       region: "제주", tracks: { 인문: { jungsi: 65.0, gyogwa: 4.2, jonghap: 5.1 }, 자연: { jungsi: 63.0, gyogwa: 4.4, jonghap: 5.3 } }, nonsul: false, note: "지역거점 국립대." },
  ],
};
