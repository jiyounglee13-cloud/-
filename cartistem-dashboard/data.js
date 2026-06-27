/*
 * CARTISTEM 논문 대시보드 — 데이터
 * 모든 수치·통계량은 원문(초록/결과/고찰)에 기재된 값을 그대로 전사하였다.
 * 원문에 기재되지 않은 항목은 "원문 미보고"로 표기한다.
 * 추측·과장·외삽은 배제한다.
 *
 * category: rct | review | cohort | caseseries | casereport | technique | economics | reference | related
 * evidence: 'top'(최상위) | 'high'(상위) | 'mid'(중간) | 'low'(하위) | 'context'(맥락 의존)
 */
window.CARTISTEM_META = {
  product:
    "CARTISTEM® — 동종 제대혈 유래 중간엽 줄기세포(hUCB-MSC)와 히알루론산(4% HA) 하이드로젤 복합체. " +
    "2012년 1월 한국 식약처(KFDA) 승인. 1바이알(1.5 mL)당 hUCB-MSC 7.5×10⁶ 세포(Medipost, 성남).",
  scope:
    "무릎 관절 연골 결손·골관절염에 대한 hUCB-MSC(CARTISTEM) 적용 임상·중개·방법론·경제성 연구 코퍼스. " +
    "본 대시보드는 각 논문을 표 A~E(식별·개요·정량결과·핵심메시지·한계) 형식으로 사실 기반 요약한다.",
  synthesis: [
    "다기관 무작위 대조 3상 시험(Lim 2021, n=114)에서 hUCB-MSC-HA는 48주 2차 관절경상 ICRS 등급 1단계 이상 개선 비율이 97.7% 대 미세골절 71.7%(P=.001)로 우월했고, 통증·기능 개선은 3~5년 추적에서 대조군보다 유의하게 양호했다(P<.05).",
    "7년 추적의 최초 인체적용 연구(Park 2017, n=7)와 5.5년 추적 증례(2017)는 장기 안전성(골형성·종양화 0건)과 유리연골 유사 조직 재생을 보고했다.",
    "고위경골절골술(HTO) 병용 연구들(Seon·Song·Park·Kim 등)에서 IKDC·WOMAC·VAS 등 임상지표가 일관되게 유의 개선되었으며, 2차 관절경상 연골 재생이 확인되었다.",
    "골수흡인농축물(BMAC)과 직접 비교한 연구들(Cell Transplantation 2020, Arthroscopy 2021, KSSTA 2022, 메타분석 2023)에서 임상결과는 유사했으나, 2차 관절경상 연골 재생은 hUCB-MSC가 더 우수한 경향이 반복 관찰되었다.",
    "미세천공(microdrilling)과 비교한 전향 연구(Scientific Reports 2024, KSSTA 2024)에서 hUCB-MSC는 유리연골형(2형 콜라겐) 재생 비율이 더 높았다.",
    "비용효과 분석(2023)은 미세골절 대비 ICER US$16,812/QALY(보건의료 관점)로 비용효과적이라고 보고했다.",
    "다수 연구가 후향적 설계, 적은 표본 수, 대조군 부재라는 공통된 한계를 지니며, 저자들은 대규모 무작위 대조시험과 장기 추적의 필요성을 일관되게 제언한다."
  ]
};

window.PAPERS = [
  /* ===================== 1. CARTISTEM Phase 3 RCT ===================== */
  {
    id: "p1", num: 1, category: "rct", evidence: "high", featured: true,
    title: "Allogeneic Umbilical Cord Blood–Derived Mesenchymal Stem Cell Implantation Versus Microfracture for Large, Full-Thickness Cartilage Defects in Older Patients: A Multicenter Randomized Clinical Trial and Extended 5-Year Clinical Follow-up",
    authors: "Lim HC, Park YB, Ha CW, Cole BJ, et al. (Cartistem Research Group)",
    journal: "The American Journal of Sports Medicine", year: 2021,
    design: "다기관 무작위 대조 3상 시험 + 5년 관찰 연장 추적", evidenceLabel: "무작위 대조시험 (Level I)",
    pmid: "—", reg: "NCT01041001 · NCT01626677", impact: "—",
    tableB: {
      question: "큰 전층 연골 결손이 있는 고령 환자에서 hUCB-MSC-4%HA 이식이 신뢰성 있는 연골 회복을 유도하고 임상 개선이 5년까지 유지되는가",
      population: "단일 구획 무릎 ICRS grade 4 큰 전층 연골 결손(관절경 확인). 무작위 배정 114명(평균 55.9세, 여성 67%, BMI 26.2 kg/m²); 3상 완료 89명, 5년 추적 73명. 10개 3차 병원",
      intervention: "UCB-MSC-HA 이식(미니 관절절개) vs 미세골절(microfracture)",
      outcomes: "1차: 48주 관절경상 ICRS 육안적 연골 회복 평가(맹검) 1등급 이상 개선 비율. 2차: 조직학적 평가, VAS·WOMAC·IKDC 변화, 이상반응",
      followup: "48주 RCT 후 5년 관찰 연장"
    },
    tableC: [
      { v: "평균 결손 크기", r: "4.9 cm²", c: "4.0 cm²", e: "—", s: "P=.051" },
      { v: "48주 ICRS 1등급 이상 개선 비율(1차)", r: "97.7%", c: "71.7%", e: "군간 차이", s: "P=.001" },
      { v: "전체 조직학적 평가 점수", r: "우월", c: "기준", e: "—", s: "P=.036" },
      { v: "VAS·WOMAC·IKDC (48주)", r: "개선", c: "개선", e: "군간 유의차 없음", s: "P>.05" },
      { v: "VAS·WOMAC·IKDC (3~5년)", r: "유의하게 양호", c: "기준", e: "군간 차이", s: "P<.05" },
      { v: "이상반응", r: "군간 차이 없음", c: "군간 차이 없음", e: "—", s: "원문 미보고(차이 없음)" }
    ],
    tableD: [
      { m: "큰 전층 연골 결손 고령 환자에서 hUCB-MSC-HA는 미세골절보다 48주 관절경·조직학적 연골 회복이 우월하다", b: "표 C: 48주 1등급 개선 97.7% vs 71.7%(P=.001), 조직학 P=.036" },
      { m: "임상적 통증·기능 개선은 단기(48주)엔 군간 동등하나 3~5년 장기에서 줄기세포군이 유의하게 양호하다", b: "표 C: 3~5년 임상지표 P<.05" },
      { m: "다기관 무작위 대조시험(Level I)으로 비교적 높은 신뢰도를 제공한다", b: "표 B: RCT, 10개 병원, 114명 무작위 배정" }
    ],
    tableE: [
      { l: "개방표지(open-label) 설계 — UCB-MSC군은 관절절개, 미세골절군은 관절경으로 이중맹검 불가", i: "수행·평가 편향 가능(단, 1차 평가는 맹검)", f: "위약/개방 미세골절 대조 등 더 엄격한 대조 설계 논의(규제·연구진 합의로 비채택)" },
      { l: "고령·큰 결손 집단 대상", i: "젊은 환자·작은 결손으로 일반화 제약", f: "다양한 환자군에서 추가 검증" }
    ]
  },

  /* ===================== 2. Stem Cells Transl Med (first-in-human, 7yr) ===================== */
  {
    id: "p2", num: 2, category: "caseseries", evidence: "low", featured: true,
    title: "Cartilage Regeneration in Osteoarthritic Patients by a Composite of Allogeneic Umbilical Cord Blood-Derived Mesenchymal Stem Cells and Hyaluronate Hydrogel: Results From a Clinical Trial for Safety and Proof-of-Concept With 7 Years of Extended Follow-Up",
    authors: "Park YB, Ha CW, Lee CH, Yoon YC, Park YG",
    journal: "Stem Cells Translational Medicine", year: 2016,
    design: "최초 인체적용 1·2상 임상시험(안전성·개념증명), 단일군, 7년 연장 추적", evidenceLabel: "1·2상 임상시험 (단일군)",
    pmid: "28191757", reg: "원문 미보고", impact: "IF 5.962",
    tableB: {
      question: "동종 hUCB-MSC + HA 하이드로젤(CARTISTEM)의 골관절염 연골 결손 재생에 대한 안전성과 효능",
      population: "Kellgren-Lawrence grade 3 골관절염 + ICRS grade 4 연골 결손 환자 7명. 대조군 없음",
      intervention: "CARTISTEM(배양확장 동종 hUCB-MSC + HA 하이드로젤) 병변부 도포. 대조군 없음",
      outcomes: "안전성(WHO 공통독성기준), 1차 효능: 12주 관절경상 ICRS 연골회복, 2차: 보행 시 VAS. 연장 추적: VAS·IKDC·MRI·조직",
      followup: "7년 연장 추적"
    },
    tableC: [
      { v: "12주 관절경 소견(1차)", r: "성숙 중인 재생 조직 관찰", c: "—(단일군)", e: "—", s: "정성 평가" },
      { v: "VAS·IKDC", r: "24주에 개선, 7년간 안정 유지", c: "—", e: "—", s: "원문 미보고(p값)" },
      { v: "1년 조직학", r: "유리연골 유사(hyaline-like) 연골", c: "—", e: "—", s: "정성 평가" },
      { v: "3년 MRI", r: "재생 연골 지속", c: "—", e: "—", s: "정성 평가" },
      { v: "치료관련 이상반응", r: "경도~중등도 5건; 골형성·종양화 0건(7년)", c: "—", e: "—", s: "안전성" }
    ],
    tableD: [
      { m: "동종 hUCB-MSC-HA의 최초 인체적용에서 7년간 골형성·종양화 없이 안전성이 확인되었다", b: "표 C: 경도~중등도 이상반응 5건, 골형성/종양화 0건(7년)" },
      { m: "12주에 재생조직, 1년 조직학에서 유리연골 유사 연골, 3년 MRI에서 지속이 관찰되어 내구성 있는 재생을 시사한다", b: "표 C: 12주 관절경·1년 조직·3년 MRI 소견" },
      { m: "표본 수 7명의 단일군 초기 임상시험으로 효능은 개념증명 수준이다", b: "표 E: 적은 표본 수와 대조군 부재" }
    ],
    tableE: [
      { l: "소수 환자(n=7) 참여 — 1·2상 최초 인체적용의 본질적 한계", i: "효능 추론 제한, 통계적 검정력 낮음", f: "더 많은 환자 수로 추가 연구 필요(저자 명시)" },
      { l: "단일군·대조군 부재", i: "비교 효능 평가 불가", f: "대조군 포함 시험 필요" }
    ]
  },

  /* ===================== 3. BMC Musculoskeletal Disorders — case report 5yr ===================== */
  {
    id: "p3", num: 3, category: "casereport", evidence: "low",
    title: "Restoration of a large osteochondral defect of the knee using a composite of umbilical cord blood-derived mesenchymal stem cells and hyaluronic acid hydrogel: a case report with a 5-year follow-up",
    authors: "Park YB, Ha CW, Lee CH, Park YG",
    journal: "BMC Musculoskeletal Disorders", year: 2017,
    design: "증례 보고(1례), 5년 추적", evidenceLabel: "증례 보고",
    pmid: "28148266", reg: "—", impact: "IF 2.002",
    tableB: {
      question: "큰 골연골 결손(연골+연골하골)에 동종 UCB-MSC + 4% HA 하이드로젤이 안전·효과적 치료 옵션이 될 수 있는가",
      population: "증상성 큰 골연골 결손 무릎 1례",
      intervention: "UCB-MSC 0.5×10⁷/mL + 4% HA 하이드로젤 복합체 이식",
      outcomes: "통증·기능, MRI, 2차 관절경, 조직학적 평가",
      followup: "5.5년"
    },
    tableC: [
      { v: "12개월 통증·기능", r: "유의 개선", c: "—(단일 증례)", e: "—", s: "정성 평가" },
      { v: "결손 충전(MRI·2차 관절경·조직)", r: "유리연골 유사 연골이 완전 충전, 주변 정상 연골과 일치", c: "—", e: "—", s: "정성 평가" },
      { v: "장기 유지", r: "임상 개선 5.5년까지 유지, 골·연골 조직 유지(MRI)", c: "—", e: "—", s: "정성 평가" }
    ],
    tableD: [
      { m: "동종 UCB-MSC-HA 복합체가 큰 골연골 결손에서 연골과 연골하골을 함께 회복시킬 수 있음을 시사한다", b: "표 C: 유리연골 유사 조직 완전 충전, 골·연골 유지" },
      { m: "임상·영상 개선이 5.5년까지 유지되어 내구성을 시사한다", b: "표 C: 5.5년 유지" },
      { m: "단일 증례로 일반화는 불가하다", b: "표 B: n=1 증례 보고" }
    ],
    tableE: [
      { l: "단일 증례 보고", i: "일반화 불가, 효능 추론 제한", f: "더 많은 사례·비교 연구 필요" }
    ]
  },

  /* ===================== 4. The Knee 2019 — DFO + hUCB-MSC (2 cases) ===================== */
  {
    id: "p4", num: 4, category: "casereport", evidence: "low",
    title: "Cartilage regeneration in osteoarthritic knees treated with distal femoral osteotomy and intra-lesional implantation of allogenic human umbilical cord blood-derived mesenchymal stem cells: A report of two cases",
    authors: "Song JS, Hong KT, Kim NM, Jung JY, Park HS, Chun YS, Kim SJ",
    journal: "The Knee", year: 2019,
    design: "증례 보고(2례)", evidenceLabel: "증례 보고",
    pmid: "31443940", reg: "—", impact: "IF 1.762",
    tableB: {
      question: "외반변형에 의한 외측 구획 골관절염에서 원위대퇴골절골술(DFO) + hUCB-MSC 이식의 결과",
      population: "외반변형 + 외측 구획 골관절염 중년 환자 2명",
      intervention: "DFO + hUCB-MSC 병변내 이식",
      outcomes: "IKDC·VAS·WOMAC, 2차 관절경 ICRS, 수정 2D MOCART",
      followup: "1년 이상(수술 1년 후 중등도 운동 가능)"
    },
    tableC: [
      { v: "IKDC·VAS·WOMAC", r: "수술 후 지속 개선", c: "—(2례)", e: "—", s: "정성 평가" },
      { v: "2차 관절경 ICRS", r: "두 환자 모두 grade 1(정상에 가까움)", c: "—", e: "—", s: "정성 평가" },
      { v: "수정 2D MOCART", r: "두 사례 모두 시간에 따라 증가", c: "—", e: "—", s: "정성 평가" }
    ],
    tableD: [
      { m: "외측 구획 골관절염을 hUCB-MSC + DFO로 치료한 첫 증례 보고로, 새로운 치료 옵션 가능성을 제시한다", b: "표 B/C: 첫 보고, ICRS grade 1 재생" },
      { m: "관절보존술과 병용 시 임상·영상 지표가 모두 개선되었다", b: "표 C: IKDC·VAS·WOMAC·MOCART 개선" },
      { m: "2례에 불과해 근거는 예비적이다", b: "표 B: n=2 증례 보고" }
    ],
    tableE: [
      { l: "증례 2례", i: "일반화·비교 효능 추론 제한", f: "더 큰 표본·대조 연구 필요" }
    ]
  },

  /* ===================== 5. World J Stem Cells 2020 — HTO + hUCB-MSC n=125 ===================== */
  {
    id: "p5", num: 5, category: "caseseries", evidence: "low",
    title: "High tibial osteotomy with human umbilical cord blood-derived mesenchymal stem cells implantation for knee cartilage regeneration",
    authors: "Song JS, Hong KT, Kong CG, Kim NM, Jung JY, Park HS, Kim YJ, Chang KB, Kim SJ",
    journal: "World Journal of Stem Cells", year: 2020,
    design: "후향적 연구(증례 시리즈), 대조군 없음", evidenceLabel: "후향적 증례 시리즈 (Level IV)",
    pmid: "32742568", reg: "—", impact: "IF 3.534",
    tableB: {
      question: "내측 구획 골관절염 + 내반변형 환자에서 HTO + hUCB-MSC 이식이 연골 재생에 효과적인가",
      population: "환자 125명, 평균 58.3±6.8세(43~74세), 여성 76%/남성 24%, 평균 HKA각 7.6°±2.4°(5.0~14.2°)",
      intervention: "HTO + hUCB-MSC 이식(대조군 없음)",
      outcomes: "2차 관절경상 MFC 연골 ICRS 등급, 임상 점수",
      followup: "원문(2차 관절경 기준)"
    },
    tableC: [
      { v: "2차 관절경 MFC ICRS grade I", r: "73명 (58.4%)", c: "—(단일군)", e: "—", s: "—" },
      { v: "ICRS grade II / III", r: "37명(29.6%) / 15명(12%)", c: "—", e: "grade IV 0명", s: "—" },
      { v: "임상 점수(ICRS I군 vs II·III군)", r: "ICRS grade I군이 더 유의하게 개선(1년 IKDC 제외)", c: "—", e: "—", s: "원문 미보고(개별 p)" }
    ],
    tableD: [
      { m: "HTO + hUCB-MSC는 내반변형 동반 내측 구획 골관절염의 효과적 치료로, 연골 재생이 임상 개선과 연결된다", b: "표 C: 2차 관절경 87.6%가 ICRS I·II, grade IV 0명" },
      { m: "연골 재생이 양호할수록(ICRS I) 임상 결과가 더 좋다", b: "표 C: ICRS I군의 우월한 개선" },
      { m: "후향적 연구이며 대조군이 없어 비교 효능은 입증되지 않는다", b: "표 E: 후향, 대조군 없음" }
    ],
    tableE: [
      { l: "후향적이며 대조군 미포함", i: "비교 효능 입증 제한", f: "단, 125명 전원 2차 관절경으로 재생 확인. 향후 연골재생술 필요성 시사" }
    ]
  },

  /* ===================== 6. Regenerative Therapy 2020 — n=128 2yr ===================== */
  {
    id: "p6", num: 6, category: "caseseries", evidence: "low",
    title: "Implantation of allogenic umbilical cord blood-derived mesenchymal stem cells improves knee osteoarthritis outcomes: Two-year follow-up",
    authors: "Song JS, Hong KT, Kim NM, Jung JY, Park HS, Lee SH, Cho YJ, Kim SJ",
    journal: "Regenerative Therapy", year: 2020,
    design: "증례 시리즈(후향), 대조군 없음", evidenceLabel: "후향적 증례 시리즈 (Level IV)",
    pmid: "31988992", reg: "—", impact: "IF 1.420",
    tableB: {
      question: "골관절염 환자에서 hUCB-MSC 이식 후 임상결과는 어떠하며 병변 특성에 따라 차이가 있는가",
      population: "전층 연골 병변(ICRS grade 4, KL grade 3) 환자 128명(2014.1~2015.12)",
      intervention: "관절경 버 제거 후 4mm 천공(2mm 간격) + HA·hUCB-MSC 혼합 이식(대조군 없음)",
      outcomes: "VAS·WOMAC·IKDC(수술 전, 1년, 2년), 병변 크기·위치·개수·BMI·연령별 분석",
      followup: "최소 2년"
    },
    tableC: [
      { v: "VAS·WOMAC·IKDC (1·2년)", r: "수술 전 대비 유의 개선", c: "—(단일군)", e: "—", s: "P<0.001" },
      { v: "병변 위치 영향", r: "MFC 병변이 LFC·활차 병변보다 결과 불량", c: "—", e: "위치 간 차이", s: "P<0.05" },
      { v: "이상반응/합병증", r: "관찰되지 않음", c: "—", e: "—", s: "안전성" }
    ],
    tableD: [
      { m: "hUCB-MSC 이식은 골관절염 무릎에서 2년간 통증·기능을 유의하게 개선한다", b: "표 C: VAS·WOMAC·IKDC P<0.001" },
      { m: "병변 위치가 결과에 영향을 미쳐, 내측 대퇴과(MFC) 병변의 예후가 상대적으로 불량하다", b: "표 C: 위치 효과 P<0.05" },
      { m: "후향·대조군 부재로 비교 효능은 제한적이다", b: "표 E: 후향 증례 시리즈" }
    ],
    tableE: [
      { l: "후향적 증례 시리즈, 대조군 없음", i: "비교 효능 추론 제한", f: "미세골절·ACI와의 적응증 차이를 고려한 비교 연구 필요" }
    ]
  },

  /* ===================== 7. Arch Orthop Trauma Surg 2020 — >60yr n=25 ===================== */
  {
    id: "p7", num: 7, category: "caseseries", evidence: "low",
    title: "Human umbilical cord blood-derived mesenchymal stem cell implantation for osteoarthritis of the knee",
    authors: "Song JS, Hong KT, Kim NM, Park HS, Choi NH",
    journal: "Archives of Orthopaedic and Trauma Surgery", year: 2020,
    design: "증례 시리즈(후향)", evidenceLabel: "후향적 증례 시리즈 (Level IV)",
    pmid: "31980879", reg: "—", impact: "IF 1.97",
    tableB: {
      question: "60세 이상 내측 구획(MC) 골관절염에서 hUCB-MSC 이식 후 임상결과",
      population: "60세 초과, MC 맞닿은(kissing) 병변, MFC 전층 결손 ≥4 cm², 내반변형 ≥3°. 25명(평균 64.9±4.4세, 평균 MFC 결손 7.2±1.9 cm²)",
      intervention: "Na-hyaluronate + hUCB-MSC 혼합 이식 + 모든 증례 HTO",
      outcomes: "IKDC·VAS·WOMAC(수술 전·1년·2년), 2차 관절경 ICRS-CRA(14명, 56%)",
      followup: "2년"
    },
    tableC: [
      { v: "IKDC·VAS·WOMAC (1·2년)", r: "수술 전 대비 유의 개선", c: "—(단일군)", e: "—", s: "유의(원문)" },
      { v: "연령 효과(<65 vs ≥65세)", r: "<65세군이 IKDC(1·2년)·VAS(2년) 우월", c: "—", e: "연령 간 차이", s: "유의(원문)" },
      { v: "2차 관절경 ICRS-CRA(14명)", r: "grade I 6명(42.9%), grade II 8명(57.1%)", c: "—", e: "—", s: "—" }
    ],
    tableD: [
      { m: "60세 초과 내측 구획 골관절염에서 hUCB-MSC 이식 + HTO가 만족스러운 연골 재생·임상 결과를 보인다", b: "표 C: 임상지표 유의 개선, ICRS-CRA I·II 100%" },
      { m: "젊은 연령·큰 결손이 더 큰 개선과 연관된다", b: "표 C: <65세군 우월, 큰 결손 연관" },
      { m: "대조군 부재로 우월성 입증은 제한된다", b: "표 E: 대조군 없음" }
    ],
    tableE: [
      { l: "대조군 없음", i: "미세골절 대비 우월성 입증 제한", f: "미세골절+HTO 대조군과의 비교 연구 필요" }
    ]
  },

  /* ===================== 8. J Clin Orthop Trauma 2019 — juvenile OCD (2 cases) ===================== */
  {
    id: "p8", num: 8, category: "casereport", evidence: "low",
    title: "Allogenic umbilical cord blood-derived mesenchymal stem cells implantation for the treatment of juvenile osteochondritis dissecans of the knee",
    authors: "Song JS, Hong KT, Kim NM, Jung JY, Park HS, Kim YC, Shetty AA, Kim SJ",
    journal: "Journal of Clinical Orthopaedics and Trauma", year: 2019,
    design: "증례 시리즈(2례)", evidenceLabel: "증례 시리즈",
    pmid: "31700204", reg: "—", impact: "IF 0.81",
    tableB: {
      question: "소아 박리성 골연골염(juvenile OCD)의 골연골 결손에 hUCB-MSC 이식 결과",
      population: "무릎 골연골 결손 소아 OCD 환자 2명",
      intervention: "동종 hUCB-MSC 이식",
      outcomes: "IKDC·VAS·Tegner, 2차 관절경 ICRS, 수정 2D MOCART",
      followup: "1년 이상(이식 1년 후 주요 운동 가능)"
    },
    tableC: [
      { v: "IKDC·VAS·Tegner", r: "두 환자 모두 우수한 개선", c: "—(2례)", e: "—", s: "정성 평가" },
      { v: "2차 관절경 ICRS", r: "정상에 유사한 grade 1 연골 재생", c: "—", e: "—", s: "정성 평가" },
      { v: "수정 2D MOCART", r: "두 사례 모두 시간에 따라 증가", c: "—", e: "—", s: "정성 평가" }
    ],
    tableD: [
      { m: "소아 OCD를 hUCB-MSC로 치료한 첫 증례 시리즈로 새로운 치료 옵션 가능성을 제시한다", b: "표 B/C: 첫 보고, ICRS grade 1 재생" },
      { m: "임상(IKDC·VAS·Tegner)과 영상(MOCART) 지표가 모두 호전되었다", b: "표 C: 임상·MOCART 개선" },
      { m: "2례로 근거는 예비적이다", b: "표 B: n=2" }
    ],
    tableE: [
      { l: "증례 2례", i: "일반화 제한", f: "소아 OCD에서 추가 사례·비교 연구 필요" }
    ]
  },

  /* ===================== 9 & 12. Int Orthop 2021 — HTO + hUCB-MSC n=93 ===================== */
  {
    id: "p9", num: "9·12", category: "cohort", evidence: "mid",
    title: "Allogeneic umbilical cord blood-derived mesenchymal stem cells combined with high tibial osteotomy: a retrospective study on safety and early results",
    authors: "Chung YW, Yang HY, Kang SJ, Song EK, Seon JK",
    journal: "International Orthopaedics (SICOT)", year: 2021,
    design: "후향적 연구(전향적 추적), 대조군 없음", evidenceLabel: "후향적 코호트 연구",
    pmid: "33068146", reg: "—", impact: "IF 2.854 · (#9=#12 동일 논문)",
    tableB: {
      question: "내측 무릎 골관절염으로 HTO를 받은 환자에서 hUCB-MSC 이식 후 단기 결과와 연골 재생",
      population: "HTO + 전층 연골손상 환자 93명, 평균 1.7년(1.0~3.5) 추적. 중앙 병변 크기 6.5 cm²(2.0~12.8)",
      intervention: "HTO + hUCB-MSC 이식(단일 단계, 대조군 없음)",
      outcomes: "IKDC·WOMAC·KSS·HSS, 2차 관절경 ICRS-CRA·Koshino(49명)",
      followup: "최소 1년(평균 1.7년)"
    },
    tableC: [
      { v: "IKDC subjective(중앙값)", r: "39.0 → 71.3", c: "—(단일군)", e: "—", s: "p<0.05" },
      { v: "WOMAC(중앙값)", r: "44.5 → 11.0", c: "—", e: "—", s: "p<0.05" },
      { v: "KSS 통증 / 기능", r: "29.8→43.2 / 61.0→81.2", c: "—", e: "—", s: "p<0.05" },
      { v: "HSS", r: "61.6 → 82.7", c: "—", e: "—", s: "p<0.05" },
      { v: "2차 관절경 ICRS-CRA(49명)", r: "grade I 8.2%, II 69.3%, III 22.5%", c: "수술 전 모든 증례에서 grade IV", e: "—", s: "p<0.05" },
      { v: "Koshino 단계", r: "B 24.5%, C 75.5%", c: "—", e: "—", s: "p<0.05" }
    ],
    tableD: [
      { m: "HTO + hUCB-MSC 이식은 내측 무릎 골관절염에서 안전하며 연골 상태 개선의 신호를 보인다", b: "표 C: IKDC·WOMAC·KSS·HSS 유의 개선(p<0.05)" },
      { m: "2차 관절경에서, 수술 전 모든 증례에서 ICRS IV였던 연골이 등급 호전을 보였다", b: "표 C: ICRS-CRA I~III로 호전" },
      { m: "대조군 부재로 실제 효과·적응증은 RCT로 규명 필요하다", b: "표 E: 대조군 없음, 추적 짧음" }
    ],
    tableE: [
      { l: "후향적 연구로, HTO 단독군과 비교한 대조가 없음", i: "연골 재생 우월성 입증 제한", f: "대조군 포함 무작위 대조시험 필요(저자 명시)" },
      { l: "추적 기간이 비교적 짧고 데이터 포인트 부족", i: "장기 결론 도출 제한", f: "장기 추적 연구 필요" }
    ]
  },

  /* ===================== 10. Cell Transplantation 2020 — BMAC vs hUCB-MSC ===================== */
  {
    id: "p10", num: 10, category: "cohort", evidence: "mid",
    title: "Comparison of Bone Marrow Aspirate Concentrate and Allogenic Human Umbilical Cord Blood Derived Mesenchymal Stem Cell Implantation on Chondral Defect of Knee: Assessment of Clinical and MRI Outcomes at 2-Year Follow-Up",
    authors: "Ryu DJ, Jeon YS, Park JS, Bae GC, Kim JS, Kim MK",
    journal: "Cell Transplantation", year: 2020,
    design: "후향적 비교 연구", evidenceLabel: "후향적 비교 연구",
    pmid: "32713192", reg: "—", impact: "IF 3.341",
    tableB: {
      question: "무릎 골관절염 연골 결손에서 BMAC와 hUCB-MSC 이식의 임상·MRI 결과 비교",
      population: "연골 회복 수술 환자 52명(52 무릎): BMAC 25 무릎, hUCB-MSC 27 무릎",
      intervention: "BMAC 이식 vs hUCB-MSC 이식",
      outcomes: "VAS·IKDC·KOOS, M-MOCART, ICRS 연골회복 점수",
      followup: "2년"
    },
    tableC: [
      { v: "VAS·IKDC·KOOS (2년)", r: "유의 개선(hUCB-MSC)", c: "유의 개선(BMAC)", e: "군간 차이 없음", s: "P<0.05(군내)" },
      { v: "M-MOCART (1년 / 2년)", r: "—", c: "—", e: "군간 차이 없음", s: "P=0.261 / P=0.351" },
      { v: "ICRS 연골회복 점수", r: "—", c: "—", e: "군간 차이 없음", s: "P=0.655" }
    ],
    tableD: [
      { m: "BMAC와 hUCB-MSC 모두 2년 시점 임상·MRI 결과가 만족스러웠다", b: "표 C: 양군 VAS·IKDC·KOOS 유의 개선(P<0.05)" },
      { m: "두 세포원 간 임상·영상 결과에 유의한 차이는 없었다", b: "표 C: M-MOCART P=0.261/0.351, ICRS P=0.655" },
      { m: "적은 표본 수와 후향적 설계로 장기·대규모 검증이 필요하다", b: "표 E: 적은 표본 수, 후향" }
    ],
    tableE: [
      { l: "적은 표본 수, 후향적 설계, 장기 추적 부재", i: "결과의 일반화·장기 효과 입증 제한", f: "대규모·잘 통제된 전향 설계·장기 추적 필요" }
    ]
  },

  /* ===================== 11. Arthroscopy 2021 — BMAC vs hUCB-MSC HTO+MFX ===================== */
  {
    id: "p11", num: 11, category: "cohort", evidence: "mid",
    title: "Allogenic Human Umbilical Cord Blood-Derived Mesenchymal Stem Cells Is More Effective Than Bone Marrow Aspiration Concentrate for Cartilage Regeneration After High Tibial Osteotomy in Medial Unicompartmental Osteoarthritis of Knee",
    authors: "Lee NH, Na SM, Ahn HW, Kang JK, Seon JK, Song EK",
    journal: "Arthroscopy", year: 2021,
    design: "후향적 비교 연구", evidenceLabel: "후향적 비교 연구",
    pmid: "33621649", reg: "—", impact: "IF 4.325",
    tableB: {
      question: "내측 단일구획 골관절염 HTO+MFX에서 BMAC 보강과 hUCB-MSC 이식의 연골 재생 결과 비교",
      population: "HTO+MFX + BMAC/hUCB-MSC 150예 중 맞닿은(kissing) 병변·2차 관절경 충족: BMAC 42예, hUCB-MSC 32예. 평균 추적 18.7±4.6개월",
      intervention: "HTO + 미세골절 + BMAC 보강 vs hUCB-MSC 이식",
      outcomes: "HSS·KSS 통증/기능·WOMAC, 2차 관절경 ICRS 등급, 방사선(HKA·후방경사·교정각)",
      followup: "최소 1년(평균 18.7개월)"
    },
    tableC: [
      { v: "IKDC·WOMAC·KSS 통증/기능", r: "개선(hUCB-MSC)", c: "개선(BMAC)", e: "군간 차이 없음", s: "P>.05" },
      { v: "2차 관절경 ICRS 등급(MFC·MTC)", r: "BMAC보다 유의하게 양호", c: "기준(BMAC)", e: "—", s: "P=.001(양 부위)" },
      { v: "평균 ICRS 등급 변화", r: "3.9 → 2.0 (hUCB-MSC)", c: "3.9 → 2.8 (BMAC)", e: "—", s: "—" },
      { v: "방사선(HKA·후방경사·교정각)", r: "—", c: "—", e: "군간 차이 없음", s: "P>.05" }
    ],
    tableD: [
      { m: "임상결과는 BMAC와 hUCB-MSC가 동등하나, 연골 재생은 hUCB-MSC가 더 우수하다", b: "표 C: 2차 관절경 ICRS P=.001, 임상 P>.05" },
      { m: "교정량(방사선 지표)은 연골 재생 결과에 영향을 주지 않았다", b: "표 C: 방사선 지표 군간 P>.05" },
      { m: "적은 표본 수와 후향적 설계가 근거의 강도를 제한한다", b: "표 E: 적은 표본 수, 후향" }
    ],
    tableE: [
      { l: "비교적 적은 환자 수", i: "유의 효과 탐지 검정력 제한", f: "더 큰 표본의 전향 비교 연구 필요" }
    ]
  },

  /* ===================== 13. KSSTA 2022 — BMAC vs hUCB-MSC PS-matched ===================== */
  {
    id: "p13", num: 13, category: "cohort", evidence: "mid",
    title: "Allogenic umbilical cord blood-derived mesenchymal stromal cell implantation was superior to bone marrow aspirate concentrate augmentation for cartilage regeneration despite similar clinical outcomes",
    authors: "Yang HY, Song EK, Kang SJ, Kwak WK, Kang JK, Seon JK",
    journal: "Knee Surgery, Sports Traumatology, Arthroscopy", year: 2022,
    design: "후향적 코호트(성향점수 매칭)", evidenceLabel: "후향적 코호트 연구 (성향점수 매칭)",
    pmid: "33492407", reg: "—", impact: "IF 3.210",
    tableB: {
      question: "HTO에서 BMAC 보강과 hUCB-MSC 이식의 임상·2차 관절경 결과 비교 및 연골 재생-HTO 결과 관계",
      population: "HTO + BMAC/hUCB-MSC 176명(KL grade 3) → 성별·연령·BMI·병변크기 PS 매칭 후 각 군 55명. 평균 추적 33개월",
      intervention: "HTO + MFC 천공 후 BMAC vs hUCB-MSC(+스캐폴드) 이식",
      outcomes: "IKDC·KOOS·SF-36·Tegner, 2차 관절경 ICRS-CRA·Koshino",
      followup: "최소 2년(평균 33개월)"
    },
    tableC: [
      { v: "IKDC·KOOS·SF-36·Tegner", r: "유의 개선(hUCB-MSC)", c: "유의 개선(BMAC)", e: "군간 차이 없음", s: "p<0.001(군내)" },
      { v: "2차 관절경 ICRS-CRA", r: "I 9.1% / II 68.2% / III 22.7%", c: "I 2.7% / II 54.1% / III 29.7% / IV 13.5%", e: "hUCB-MSC 우월", s: "p=0.040" },
      { v: "Koshino 단계", r: "—", c: "—", e: "군간 차이 없음", s: "p=0.057" },
      { v: "ICRS-CRA와 임상결과 상관", r: "음의 상관(연골 좋을수록 임상 양호)", c: "—", e: "r=−0.337", s: "p=0.002" }
    ],
    tableD: [
      { m: "임상결과는 두 세포원이 동등하나, 연골 재생은 hUCB-MSC가 BMAC보다 우월하다", b: "표 C: ICRS-CRA p=0.040, 임상 군간 차이 없음" },
      { m: "재생 연골 등급이 좋을수록 임상결과가 양호하여 연골 재생의 임상적 의의를 시사한다", b: "표 C: ICRS-CRA–임상 r=−0.337, p=0.002" },
      { m: "단일기관 후향·PS 매칭의 잔여 교란이 존재한다", b: "표 E: 단일기관 후향, 미매칭 변수" }
    ],
    tableE: [
      { l: "비교적 적은 표본", i: "검정력 제한", f: "더 큰 표본 필요" },
      { l: "단일기관 후향 코호트(PS 매칭에도 미통제 교란 가능)", i: "선택·잔여 교란 편향", f: "다기관 전향 무작위 연구 필요" }
    ]
  },

  /* ===================== 14. Arthroscopy Techniques 2021 — dry arthroscopy technique ===================== */
  {
    id: "p14", num: 14, category: "technique", evidence: "context", featured: true,
    title: "Dry arthroscopy with a simple retraction technique for knee joint cartilage repair using allogenic human umbilical cord blood-derived mesenchymal stem cells",
    authors: "Oh SM, Kwon HN",
    journal: "Arthroscopy Techniques", year: 2021,
    design: "기술 노트(수술 술기)", evidenceLabel: "수술 술기 보고",
    pmid: "35004157", reg: "—", impact: "IF 1.2",
    tableB: {
      question: "특수 장비 없이 관절경하 hUCB-MSC(CARTISTEM) 이식을 가능케 하는 건식 관절경 견인 술기",
      population: "무릎 연골 결손 환자(술기 시연), 정량 효능 표본 아님",
      intervention: "단순 봉합/탐침 연부조직 견인을 이용한 건식 관절경하 hUCB-MSC(+HA) 이식",
      outcomes: "술기 가능성·재생률(개방 관절절개와 유사 시사). 정량 효능 결과 아님",
      followup: "원문 미보고(술기 노트)"
    },
    tableC: [
      { v: "정량 효능 결과", r: "원문 미보고(술기 노트)", c: "—", e: "—", s: "—" },
      { v: "초기 경험", r: "본 술기의 연골 회복률이 개방 관절절개 결과와 유사함을 시사", c: "개방 관절절개(문헌)", e: "정성 비교", s: "—" }
    ],
    tableD: [
      { m: "특수 장비 없이 통상 관절경 기구로 건식 관절경하 hUCB-MSC 이식이 가능하다", b: "표 B: 단순 견인 술기" },
      { m: "관절경 접근은 개방 관절절개 대비 조기 관절 가동과 반흔 감소 이점이 있다", b: "본문: 관절경의 회복·반흔 이점" },
      { m: "추가 내측 작업 포털이 필요하며 정량적 효능은 보고되지 않았다", b: "표 E: 포털 추가, 술기 노트" }
    ],
    tableE: [
      { l: "추가 far-medial 작업 포털 필요", i: "술기 복잡성 증가", f: "(개방 관절절개 절개선보다는 양호) 본 술기 사용 증례 시리즈 부재 — 추가 보고 필요" }
    ]
  },

  /* ===================== 15. J Cartilage Joint Preservation 2022 — US phase 1/2a ===================== */
  {
    id: "p15", num: 15, category: "caseseries", evidence: "low",
    title: "Safety of an allogeneic, human, umbilical cord blood-derived mesenchymal stem cells-4% hyaluronate composite for cartilage repair in the knee",
    authors: "Cole BJ, Kaiser JT, Wagner KR, Gomoll AH",
    journal: "Journal of Cartilage & Joint Preservation", year: 2022,
    design: "개방표지 비무작위 1·2a상 임상시험(미국)", evidenceLabel: "1·2a상 임상시험 (단일군)",
    pmid: "원문 미보고", reg: "원문 미보고", impact: "IF 2.961",
    tableB: {
      question: "미국 환자에서 hUCB-MSC + 4% HA 복합체의 무릎 연골 결손에 대한 안전성(주)·효능(부)",
      population: "ICRS grade 3~4 단일 전층 결손 성인 ≥18세 12명(평균 38세, 남성 83%, BMI 27.6). Dose A 2–5 cm²(n=6), Dose B >5 cm²(n=6)",
      intervention: "hUCB-MSC 복합체(0.25×10⁷ 세포/cm²) 수술적 이식. 24개월 개방표지 비무작위",
      outcomes: "1차: 안전성(이상반응·용량제한독성). 2차: IKDC 등 효능, MRI",
      followup: "24개월"
    },
    tableC: [
      { v: "치료발현 이상반응(TEAE)", r: "전원 ≥1건(Dose A 42건/n=6, Dose B 27건/n=6); 가동범위 감소 100%, 관절통 92%", c: "—(단일군)", e: "—", s: "안전성" },
      { v: "치료관련 TEAE", r: "7명(58%)에서 10건; 중단·중대한 이상반응·사망 0건", c: "—", e: "—", s: "안전성" },
      { v: "용량제한독성 / 최대내약용량", r: "DLT 0건; MTD 2.0×10⁷ 세포", c: "—", e: "—", s: "안전성" },
      { v: "IKDC 등 기능·통증", r: "기저 대비 12·24개월 유의 개선", c: "—", e: "—", s: "유의(원문)" },
      { v: "임상적 유의 MRI 이상", r: "기저 91.7%(n=11) → 24개월 16.7%(n=2)", c: "—", e: "—", s: "—" }
    ],
    tableD: [
      { m: "미국 ICRS 3~4 환자에서 hUCB-MSC-4%HA 복합체 이식은 24개월간 안전하다", b: "표 C: 중대한 이상반응·사망·DLT 0건, MTD 2.0×10⁷" },
      { m: "기능·통증이 개선되고 MRI 이상 소견이 감소하여 연골 회복 근거를 보인다", b: "표 C: IKDC 12·24개월 유의 개선, MRI 이상 91.7→16.7%" },
      { m: "적은 표본 수, 개방표지 설계, 대조군 부재로 효능은 예비적이다", b: "표 E: 1·2상의 본질적 한계" }
    ],
    tableE: [
      { l: "적은 표본 수, 개방표지 설계, 대조군 부재(1·2상 시험의 특성)", i: "효능 결과는 예비적", f: "한국 3상 데이터가 유사 이익을 시사 — 추가 검증의 기반 형성" }
    ]
  },

  /* ===================== 16. The Knee 2021 — hUCB-MSC+HTO vs MFx+HTO ===================== */
  {
    id: "p16", num: 16, category: "cohort", evidence: "mid",
    title: "Human umbilical cord-blood-derived mesenchymal stem cell can improve the clinical outcome and joint space width after high tibial osteotomy",
    authors: "Suh DW, Han SB, Yeo WJ, Cheong K, So SY, Kyung BS",
    journal: "The Knee", year: 2021,
    design: "비무작위 비교 연구", evidenceLabel: "비무작위 비교 연구",
    pmid: "34536766", reg: "—", impact: "IF 2.423",
    tableB: {
      question: "HTO에서 hUCB-MSC 연골재생술과 미세골절의 임상·방사선 결과 비교",
      population: "MFC ICRS grade IV 결손 >200 mm² HTO 환자 100 무릎: MSC군 43, 대조(미세골절)군 57 (2017.8~2018.12)",
      intervention: "HTO + hUCB-MSC 연골재생술 vs HTO + 미세골절 단독",
      outcomes: "HSS·IKDC·Lysholm(18개월), 역학축(MA)·관절간격(JSW)",
      followup: "18개월"
    },
    tableC: [
      { v: "IKDC (18개월)", r: "69", c: "62", e: "MSC군 우월", s: "P<0.05" },
      { v: "관절간격(JSW) 증가량", r: "0.6 mm", c: "0.1 mm", e: "MSC군 우월", s: "P<0.05" },
      { v: "불유합·교정소실·관절치환 전환", r: "0건", c: "0건", e: "—", s: "안전성" }
    ],
    tableD: [
      { m: "HTO에서 hUCB-MSC 연골재생술은 미세골절 단독보다 임상결과(IKDC)와 관절간격(JSW)을 더 개선한다", b: "표 C: IKDC 69 vs 62, JSW 0.6 vs 0.1 mm(P<0.05)" },
      { m: "대조군을 둔 비교 설계로 미세골절 대비 이점을 직접 제시한다", b: "표 B: MSC 43 vs 대조 57" },
      { m: "적은 표본 수, 비무작위 설계, 수술 전 임상 자료 부재가 근거를 제한한다", b: "표 E: 비무작위, 수술 전 데이터 없음" }
    ],
    tableE: [
      { l: "적은 표본 수와 비무작위 설계", i: "선택 편향 가능", f: "무작위 전향 연구 필요" },
      { l: "추적 기간이 짧고, 수술 전 임상 자료와 연골 재생 상세 자료(MRI·2차 관절경)가 없음", i: "연골 재생 직접 평가 제한", f: "영상·2차 관절경 포함 연구 필요" }
    ]
  },

  /* ===================== 17. Medicina 2022 — Systematic Review & Meta-analysis ===================== */
  {
    id: "p17", num: 17, category: "review", evidence: "top", featured: true,
    title: "Cartilage Regeneration Using Human Umbilical Cord Blood Derived Mesenchymal Stem Cells: A Systematic Review and Meta-Analysis",
    authors: "Lee DH, Kim SA, Song JS, Shetty AA, Kim BH, Kim SJ",
    journal: "Medicina (Kaunas)", year: 2022,
    design: "체계적 문헌고찰 및 메타분석(PRISMA)", evidenceLabel: "체계적 문헌고찰·메타분석",
    pmid: "36557003", reg: "—", impact: "IF 2.43",
    tableB: {
      question: "무릎 연골 결손·골관절염에서 hUCB-MSC 치료의 효능과 안전성(통합 분석)",
      population: "PubMed·Embase·Web of Science·Scopus·Cochrane(2022.6까지) 7개 연구, 환자 570명. Newcastle–Ottawa 척도 평가",
      intervention: "hUCB-MSC 연골 회복 수술(일부 BMAC 비교 포함)",
      outcomes: "최종 추적 IKDC·WOMAC·VAS 통합(평균차 MD), M-MOCART, ICRS",
      followup: "각 연구 최종 추적"
    },
    tableC: [
      { v: "IKDC(최종 vs 수술 전)", r: "MD −32.82", c: "—", e: "95% CI −38.32~−27.32 (I²=93%)", s: "p<0.00001" },
      { v: "WOMAC(최종 vs 수술 전)", r: "MD 30.73", c: "—", e: "95% CI 24.10~37.36 (I²=95%)", s: "p<0.00001" },
      { v: "VAS(최종 vs 수술 전)", r: "MD 4.81", c: "—", e: "95% CI 3.17~6.46 (I²=98%)", s: "p<0.00001" },
      { v: "BMAC 비교군", r: "임상·M-MOCART 유의차 없음, 치료 후 ICRS 등급 증가", c: "BMAC", e: "—", s: "유의차 없음(임상)" }
    ],
    tableD: [
      { m: "통합 분석에서 hUCB-MSC 치료는 IKDC·WOMAC·VAS를 유의하게 개선하며 안전성과 재생 연골의 질을 보인다", b: "표 C: IKDC MD −32.82, WOMAC 30.73, VAS 4.81 (모두 p<0.00001)" },
      { m: "BMAC 대비 임상·M-MOCART 결과에 명확한 차이는 확인되지 않았다", b: "표 C: BMAC 비교 유의차 없음" },
      { m: "포함 연구의 이질성이 매우 높고(I²≥93%) RCT 부족이 근거를 제한한다", b: "표 E: I² 93~98%, RCT 부족" }
    ],
    tableE: [
      { l: "포함 7개 연구 중 6개가 후향, 1개는 RCT 후 연장 추적 — RCT 기반 메타분석 불가", i: "근거 강도·인과 추론 제한", f: "다수 RCT 분석으로 과학적 근거 강화 필요" },
      { l: "통계적 이질성 매우 높음(I²=93~98%)", i: "통합 추정치 해석 주의", f: "표준화된 결과 보고 필요" }
    ]
  },

  /* ===================== 18. World J Clin Cases 2022 — patella case ===================== */
  {
    id: "p18", num: 18, category: "casereport", evidence: "low",
    title: "Cartilage regeneration using human umbilical cord blood-derived mesenchymal stem cells for a patellar cartilage defect with patellar dislocation: A case report",
    authors: "Kim SJ, et al.",
    journal: "World Journal of Clinical Cases", year: 2022,
    design: "증례 보고(1례)", evidenceLabel: "증례 보고",
    pmid: "36579106", reg: "—", impact: "IF 1.15",
    tableB: {
      question: "슬개골 탈구에 동반된 슬개골 연골 결손에 hUCB-MSC를 이용한 연골 재생",
      population: "슬개골 탈구 + 슬개골 연골 결손 환자 1례",
      intervention: "hUCB-MSC 이식(슬개골 연골 결손부)",
      outcomes: "MRI 소견, 임상 경과",
      followup: "원문(증례)"
    },
    tableC: [
      { v: "MRI 진단", r: "관절혈증, 내측 슬개대퇴인대 파열, 4.92 cm²(2.04×2.41 cm) 슬개골 연골 결손", c: "—(단일 증례)", e: "—", s: "정성 평가" },
      { v: "이학적 소견", r: "부종 및 무릎 운동 제한", c: "—", e: "—", s: "정성 평가" }
    ],
    tableD: [
      { m: "슬개골 탈구에 동반된 슬개골 연골 결손에 hUCB-MSC를 적용한 증례로, 슬개대퇴 구획 적용 가능성을 보여준다", b: "표 C: 슬개골 4.92 cm² 결손 치료" },
      { m: "본 보고는 단일 사례의 임상·영상 경과 기술이다", b: "표 B: n=1 증례" },
      { m: "효능 일반화는 불가하다", b: "표 E: 단일 증례" }
    ],
    tableE: [
      { l: "단일 증례 보고", i: "일반화·비교 효능 추론 불가", f: "슬개대퇴 구획 적용 추가 사례·연구 필요" }
    ]
  },

  /* ===================== 19. Medicina 2023 — UCB-MSC-HA + HTO n=12 ===================== */
  {
    id: "p19", num: 19, category: "caseseries", evidence: "low",
    title: "Allogeneic Umbilical Cord-Blood-Derived Mesenchymal Stem Cells and Hyaluronate Composite Combined with High Tibial Osteotomy for Medial Knee Osteoarthritis with Full-Thickness Cartilage Defects",
    authors: "Park YB, Lee HJ, Nam HC, Park JG",
    journal: "Medicina (Kaunas)", year: 2023,
    design: "후향적 증례 시리즈, 대조군 없음", evidenceLabel: "후향적 증례 시리즈",
    pmid: "36676772", reg: "—", impact: "IF 2.43",
    tableB: {
      question: "전층 연골 결손 동반 내측 무릎 골관절염에서 HTO + UCB-MSC-HA 복합체 이식의 임상결과·연골 회복",
      population: "내측 무릎 OA, MFC ICRS grade IV 결손 ≥3 cm², 내반변형 ≥5°. 12명(평균 56.1세, 평균 결손 4.5 cm²); 10명 2차 관절경",
      intervention: "내측 개방쐐기 HTO + 동종 UCB-MSC-HA 복합체 이식(대조군 없음)",
      outcomes: "VAS·WOMAC, 2차 관절경 ICRS-CRA",
      followup: "평균 2.9년(1~6년)"
    },
    tableC: [
      { v: "VAS·WOMAC 등 임상", r: "최종 추적 모두 개선", c: "—(단일군)", e: "—", s: "원문(개선)" },
      { v: "2차 관절경 ICRS-CRA(10명)", r: "grade I 10% / II 70% / III 20% (정상·거의 정상 80%)", c: "—", e: "모든 증례에서 재생 조직 관찰", s: "—" }
    ],
    tableD: [
      { m: "HTO + UCB-MSC-HA 복합체는 전층 연골 결손 동반 내측 무릎 OA에서 양호한 임상결과와 모든 증례에서의 연골 회복을 보인다", b: "표 C: 임상 개선, 2차 관절경 80% 정상·거의 정상" },
      { m: "전층 연골 결손 환자의 좋은 치료 옵션이 될 수 있다", b: "표 C: 모든 증례에서 ICRS-CRA I~III" },
      { m: "후향적 설계, 적은 표본 수, 대조군 부재가 근거를 제한한다", b: "표 E: 후향적 설계, 적은 표본 수" }
    ],
    tableE: [
      { l: "후향적 연구이며 대조군 부재", i: "비교 효능 추론 제한", f: "(해당 병용 보고 드묾) 대조 연구 필요" },
      { l: "적은 표본 수(n=12)", i: "검정력 제한", f: "더 큰 표본 연구 필요" }
    ]
  },

  /* ===================== 20. Appl Health Econ Health Policy 2023 — cost-effectiveness ===================== */
  {
    id: "p20", num: 20, category: "economics", evidence: "context", featured: true,
    title: "Cost Effectiveness of Allogeneic Umbilical Cord Blood-Derived Mesenchymal Stem Cells in Patients with Knee Osteoarthritis",
    authors: "Suh K, Cole BJ, Gomoll A, Lee SM, Choi H, Ha CW, Lim HC, Kim MK, Ha GY, Suh DC",
    journal: "Applied Health Economics and Health Policy", year: 2023,
    design: "비용효과 분석(분할생존 모형)", evidenceLabel: "비용효과 분석 (경제성 모형)",
    pmid: "36136263", reg: "—", impact: "IF 3.686",
    tableB: {
      question: "한국에서 골관절염 연골 결손 환자 대상 hUCB-MSC(+Na-hyaluronate)는 미세골절 대비 비용효과적인가",
      population: "한국 무릎 골관절염 환자(모형). 효용값은 무작위 임상시험, 비용은 건강보험심사평가원 DB 및 전문가 패널",
      intervention: "hUCB-MSC 치료 vs 미세골절. 5개 건강상태(excellent·good·fair·poor·death) 분할생존 모형, 20년 지평",
      outcomes: "QALY당 점증비용효과비(ICER), 민감도 분석",
      followup: "20년(모형 지평)"
    },
    tableC: [
      { v: "ICER — 보건의료 지불자 관점", r: "US$16,812/QALY (₩18,790,773)", c: "미세골절(기준)", e: "점증비용 US$14,410, QALY +0.857", s: "95% CI 13,408~20,828" },
      { v: "ICER — 사회적 관점", r: "US$268/QALY (₩299,255)", c: "미세골절(기준)", e: "—", s: "95% CI −2,915~3,784" },
      { v: "비용효과 확률(WTP US$22,367/QALY)", r: "지불자 99% / 사회적 100%", c: "—", e: "—", s: "확률적 민감도 분석" }
    ],
    tableD: [
      { m: "hUCB-MSC 치료는 미세골절 대비 비용효과적이다", b: "표 C: ICER US$16,812/QALY(지불자), US$268/QALY(사회적)" },
      { m: "지불의사한계(US$22,367/QALY)에서 비용효과적일 확률이 지불자 99%·사회적 100%로 높다", b: "표 C: 확률적 민감도 분석" },
      { m: "한국 임상시험·비용 자료 기반으로 타국 일반화는 주의가 필요하다", b: "표 E: 한국 자료 기반" }
    ],
    tableE: [
      { l: "비용·효과 자료가 한국 임상시험에서 도출됨", i: "타국 의료·보험 체계로의 일반화 제약", f: "각국 의료전달·보험 체계에 맞춘 비용 조정 필요" },
      { l: "분할생존 모형의 생존 종점 독립성 가정", i: "결정 불확실성 정량화의 구조적 한계", f: "Markov 등 대안 모형과의 비교 필요" }
    ]
  },

  /* ===================== 21. Arthrosc Orthop Sports Med 2023 — arthroscopic Cartistem + owHTO ===================== */
  {
    id: "p21", num: 21, category: "caseseries", evidence: "low", featured: true,
    title: "Safety and effectiveness of arthroscopic-assisted implantation of allogenic umbilical cord blood-derived mesenchymal stem cells (Cartistem®)",
    authors: "Cha DH, Kim DH, Kook JM",
    journal: "Arthroscopy and Orthopedic Sports Medicine", year: 2023,
    design: "후향적 연구(증례 시리즈)", evidenceLabel: "후향적 증례 시리즈",
    pmid: "—", reg: "—", impact: "—",
    tableB: {
      question: "KL II·III 내측 구획 골관절염에서 내측 개방쐐기 HTO 중 관절경 보조 Cartistem® 이식의 안전성·효능(방사선·임상)",
      population: "KL grade II·III + 내반슬 + ICRS grade IV 내측 구획 관절염. 총 22예 중 1년 이상 추적·2차 관절경 8명(2017.10~2019.7)",
      intervention: "관절경하 연골성형술 + Cartistem® + 내측 개방쐐기 HTO",
      outcomes: "MRI 연골결손·KL 등급·관절간격(JSD), KSS·Lysholm, 2차 관절경 ICRS",
      followup: "1년 이상"
    },
    tableC: [
      { v: "KL 등급(수술 전·후)", r: "2명에서 III→II 개선", c: "—(단일군)", e: "—", s: "—" },
      { v: "관절간격(JSD)", r: "3.75 mm → 4.63 mm", c: "—", e: "—", s: "유의(원문)" },
      { v: "해부학적 대퇴경골각(FTA)", r: "내반 2.46° → 외반 9.28°", c: "—", e: "—", s: "교정" },
      { v: "KSS / Lysholm", r: "46.63→70.50 / 43.5→75.5", c: "—", e: "—", s: "유의한 차이(원문)" },
      { v: "2차 관절경 ICRS", r: "모든 증례 유의 개선", c: "—", e: "—", s: "—" }
    ],
    tableD: [
      { m: "KL II·III, ICRS IV 내측 구획 OA에서 내측 owHTO 중 관절경하 Cartistem® 연골성형술은 방사선·임상 결과를 유의하게 개선한다", b: "표 C: JSD 3.75→4.63 mm, KSS 46.63→70.50, Lysholm 43.5→75.5" },
      { m: "정렬 교정과 함께 2차 관절경상 모든 증례의 연골 등급이 개선되었다", b: "표 C: FTA 내반2.46°→외반9.28°, 모든 증례에서 ICRS 개선" },
      { m: "적은 표본 수(8명), 후향적 설계, 대조군 부재로 근거는 예비적이다", b: "표 B/E: 8명, 생검 미시행" }
    ],
    tableE: [
      { l: "재생 연골 생검 미시행(관절강 협소로 탐침 시 손상 우려)", i: "조직학적 재생 직접 확인 제한", f: "정밀한 재생 상태 평가 방법 필요" }
    ]
  },

  /* ===================== 22. Arthrosc Tech 2023 — Kelly clamp technique ===================== */
  {
    id: "p22", num: 22, category: "technique", evidence: "context",
    title: "Dry Arthroscopic Cartilage Repair of the Knee Joint Using Umbilical Cord Mesenchymal Stem Cells: Kelly Clamp Technique",
    authors: "Lee TJ, Jeong CD, Lee TH",
    journal: "Arthroscopy Techniques", year: 2023,
    design: "기술 노트(수술 술기)", evidenceLabel: "수술 술기 보고",
    pmid: "37654868", reg: "—", impact: "IF 1.9",
    tableB: {
      question: "건식 관절경하 hUCB-MSC(CARTISTEM) 이식을 위한 Kelly clamp 작업공간 확보 술기",
      population: "무릎 연골 손상 환자(술기 시연), 정량 효능 표본 아님",
      intervention: "Curette 변연절제 + 4mm/2mm 천공 후 Kelly clamp 견인 건식 관절경하 UCB-MSC 이식",
      outcomes: "술기 가능성·세척 방지. 정량 효능 결과 아님",
      followup: "원문 미보고(술기 노트)"
    },
    tableC: [
      { v: "정량 효능 결과", r: "원문 미보고(술기 노트)", c: "—", e: "—", s: "—" },
      { v: "술기 목적", r: "건식 관절경 작업공간 확보 및 세포 세척(washout) 방지", c: "개방 관절절개(비교)", e: "정성 비교", s: "—" }
    ],
    tableD: [
      { m: "Kelly clamp를 이용해 더 쉽고 효과적인 건식 관절경하 UCB-MSC 이식이 가능하다", b: "표 B: Kelly clamp 견인 술기" },
      { m: "관절경 접근은 개방 관절절개보다 조기 회복과 반흔 감소 이점이 있다", b: "본문: 관절경의 이점" },
      { m: "정량적 임상 효능은 보고되지 않은 술기 노트이다", b: "표 C: 효능 미보고" }
    ],
    tableE: [
      { l: "정량 효능 데이터 없음(술기 노트)", i: "임상 효능 추론 불가", f: "본 술기 적용 임상결과 연구 필요" }
    ]
  },

  /* ===================== 23. Medicina 2023 — BMAC vs hUCB-MSC SR/meta ===================== */
  {
    id: "p23", num: 23, category: "review", evidence: "top",
    title: "Bone Marrow Aspirate Concentrate versus Human Umbilical Cord Blood-Derived Mesenchymal Stem Cells for Combined Cartilage Regeneration Procedure in Patients Undergoing High Tibial Osteotomy: A Systematic Review and Meta-Analysis",
    authors: "Park D, Choi YH, Kang SH, Koh HS, In Y",
    journal: "Medicina (Kaunas)", year: 2023,
    design: "체계적 문헌고찰 및 메타분석(PRISMA)", evidenceLabel: "체계적 문헌고찰·메타분석",
    pmid: "36984635", reg: "—", impact: "IF 2.6",
    tableB: {
      question: "HTO를 받는 내반 무릎 OA 환자에서 BMAC와 hUCB-MSC 연골 재생술의 임상 효능 비교",
      population: "PubMed·EMBASE·Cochrane 검색 7개 연구, 환자 499명: BMAC 169명, hUCB-MSC 330명",
      intervention: "HTO + BMAC vs HTO + hUCB-MSC",
      outcomes: "임상 결과(IKDC·WOMAC·KSS) 및 2차 관절경 ICRS-CRA, 표준화 평균차(SMD)",
      followup: "각 연구 보고"
    },
    tableC: [
      { v: "IKDC", r: "양군 개선", c: "양군 개선", e: "군간 유의차 없음", s: "p=0.91" },
      { v: "WOMAC / KSS 통증 / KSS 기능", r: "—", c: "—", e: "군간 유의차 없음", s: "p=0.05 / 0.85 / 0.37" },
      { v: "2차 관절경 ICRS-CRA 등급", r: "hUCB-MSC 우월", c: "BMAC", e: "—", s: "p<0.001" }
    ],
    tableD: [
      { m: "BMAC와 hUCB-MSC 모두 내반 무릎 OA에서 임상결과를 개선하며 둘 사이 임상적 차이는 없다", b: "표 C: IKDC p=0.91, KSS 통증 p=0.85 등" },
      { m: "2차 관절경상 연골 재생은 hUCB-MSC가 BMAC보다 더 효과적이다", b: "표 C: ICRS-CRA p<0.001" },
      { m: "포함 연구가 모두 근거수준 3~4의 후향적 연구로 무작위 대조시험이 없다", b: "표 E: RCT 부재, 후향 연구" }
    ],
    tableE: [
      { l: "포함 연구가 모두 근거수준 3~4의 후향적 연구이며, 무작위 대조시험·전향적 비교 연구가 없음", i: "교란 통제·근거 강도 제한", f: "더 높은 검정력의 RCT 필요" }
    ]
  },

  /* ===================== 24. Orthop J Sports Med 2023 — UCB-MSC chondral defect n=85 ===================== */
  {
    id: "p24", num: 24, category: "caseseries", evidence: "low",
    title: "Clinical and Magnetic Resonance Imaging Outcomes After Human Cord Blood-Derived Mesenchymal Stem Cell Implantation for Chondral Defects of the Knee",
    authors: "Song JS, Hong KT, Kim NM, Hwangbo BH, Yang BS, Victoroff BN, Choi NH",
    journal: "Orthopaedic Journal of Sports Medicine", year: 2023,
    design: "증례 시리즈", evidenceLabel: "후향적 증례 시리즈 (Level IV)",
    pmid: "37123990", reg: "—", impact: "IF 2.6",
    tableB: {
      question: "무릎 연골 결손에 대한 UCB-MSC 이식 후 임상·MRI 결과 및 재생 연골 비대(hypertrophy)와 임상의 관계",
      population: "40~70세, MFC grade 3·4 국소 연골 병변, 결손 >4 cm², 인대 정상. 85명(평균 56.8±6.1세, 평균 결손 6.7±2.0 cm²)",
      intervention: "hUCB-MSC + Na-hyaluronate 혼합 미니 관절절개 이식",
      outcomes: "IKDC·VAS·WOMAC(수술 전·1·2·3년), 1년 MRI 재생 연골 비대(grade 1<125%, 2<150%, 3<200%)",
      followup: "1~3년"
    },
    tableC: [
      { v: "모든 PRO(IKDC·VAS·WOMAC)", r: "수술 전 대비 유의 개선", c: "—(단일군)", e: "—", s: "P<.001" },
      { v: "1년 MRI 재생 연골 비대", r: "grade 1 28명 / grade 2 41명 / grade 3 16명", c: "—", e: "1·2년 시점 간 차이 없음(11명)", s: "—" },
      { v: "비대 등급-PRO 상관", r: "상관 없음", c: "—", e: "—", s: "유의하지 않음" }
    ],
    tableD: [
      { m: "UCB-MSC 이식 후 단기 임상결과가 유의하게 개선된다", b: "표 C: 모든 PRO P<.001" },
      { m: "재생 연골의 비대(hypertrophy)가 관찰되나 그 정도는 임상결과와 상관이 없다", b: "표 C: 비대 등급-PRO 상관 없음" },
      { m: "증례 시리즈(Level IV)이고 대조군이 없어 비교 효능 추론은 제한된다", b: "표 E: LoE 4" }
    ],
    tableE: [
      { l: "재생 연골 두께를 수술 1년 후 측정", i: "1년 이후 추가 비대 가능성 미반영", f: "장기 비대 변화 추적 필요" }
    ]
  },

  /* ===================== 25. Knee Surg Relat Res 2024 — SR concurrent procedures ===================== */
  {
    id: "p25", num: 25, category: "review", evidence: "top",
    title: "Effects of concurrent cartilage procedures on cartilage regeneration in high tibial osteotomy: a systematic review",
    authors: "Han JH, Jung M, Chung K, Jung SH, Choi CH, Kim SH",
    journal: "Knee Surgery & Related Research", year: 2024,
    design: "체계적 문헌고찰(PRISMA)", evidenceLabel: "체계적 문헌고찰",
    pmid: "38549124", reg: "—", impact: "IF 4.1",
    tableB: {
      question: "HTO 시 병용 연골 재생술이 연골 재생에 미치는 효과(술식별 비교)",
      population: "PubMed·Embase·Cochrane·Google Scholar(2023.8.31까지) 16개 연구, 환자 1,277명",
      intervention: "HTO ± 병용 술식: 무처치 / 미세골절 / BMAC / hUCB-MSC",
      outcomes: "2차 관절경 ICRS 등급 변화(평균차), 임상결과, 합병증",
      followup: "각 연구 보고"
    },
    tableC: [
      { v: "ICRS 등급 개선 — 병용 무처치", r: "평균차 −0.80 ~ −0.49", c: "기준", e: "—", s: "—" },
      { v: "ICRS 등급 개선 — 미세골절", r: "평균차 −0.75 ~ −0.22", c: "기준", e: "—", s: "—" },
      { v: "ICRS 등급 개선 — BMAC", r: "평균차 −1.37 ~ −0.67", c: "기준", e: "—", s: "—" },
      { v: "ICRS 등급 개선 — hUCB-MSC", r: "평균차 −2.46 ~ −1.81", c: "기준", e: "가장 큰 개선 범위", s: "—" }
    ],
    tableD: [
      { m: "HTO는 병용 술식 유무와 무관하게 2차 관절경상 연골 재생과 임상 개선을 보인다", b: "표 C: 전 술식군 ICRS 등급 개선" },
      { m: "병용 술식 중 hUCB-MSC군의 ICRS 등급 개선 범위(−2.46~−1.81)가 가장 컸다", b: "표 C: 술식별 평균차 비교" },
      { m: "RCT·후속 메타분석 부재로 확정적 결론은 유보된다", b: "표 E: RCT·정량 메타분석 필요" }
    ],
    tableE: [
      { l: "RCT 부족으로 정량적 통합(메타분석) 한계, 장기 생존분석 부재", i: "확정적 결론 도출 제한", f: "동일 주제 RCT 및 이를 포함한 메타분석 필요" }
    ]
  },

  /* ===================== 26. Scientific Reports 2024 — hUCB-MSC vs microdrilling HTO ===================== */
  {
    id: "p26", num: 26, category: "cohort", evidence: "mid", featured: true,
    title: "Allogeneic umbilical cord blood-derived mesenchymal stem cell implantation versus microdrilling combined with high tibial osteotomy for cartilage regeneration",
    authors: "Jung SH, Nam BJ, Choi CH, Kim S, Jung M, Chung K, Park J, Jung Y, Kim SH",
    journal: "Scientific Reports", year: 2024,
    design: "후향적 비교 연구", evidenceLabel: "후향적 비교 연구",
    pmid: "38336978", reg: "—", impact: "IF 4.6",
    tableB: {
      question: "무릎 OA에서 HTO 병용 hUCB-MSC 이식과 미세천공(microdrilling)의 연골 재생 결과 비교",
      population: "54명(60 무릎): hUCB-MSC 24명(27 무릎), 미세천공 30명(33 무릎). 평균 연령 56.88 vs 59.91세, BMI 26.55 vs 26.60",
      intervention: "HTO + hUCB-MSC 이식 vs HTO + 미세천공",
      outcomes: "VAS·Lysholm·IKDC(6·12·24개월), 12개월 관절경 연골 치유, 결손 부위별 하위분석",
      followup: "24개월"
    },
    tableC: [
      { v: "VAS·Lysholm·IKDC (6·12·24개월)", r: "유의 개선(hUCB-MSC)", c: "유의 개선(미세천공)", e: "양군 개선", s: "P<0.001(군내)" },
      { v: "24개월 임상 점수", r: "유의하게 더 개선", c: "기준", e: "hUCB-MSC 우월", s: "유의(원문)" },
      { v: "12개월 관절경 연골 치유", r: "더 양호", c: "기준", e: "hUCB-MSC 우월", s: "유의(원문)" },
      { v: "하위분석(결손 부위)", r: "전방(anterior) 병변에서 우월한 치유", c: "—", e: "—", s: "—" }
    ],
    tableD: [
      { m: "내측 OA에서 hUCB-MSC와 미세천공 모두 효과적이나, hUCB-MSC가 환자보고결과·연골 재생에서 더 우수하다", b: "표 C: 24개월 임상 우월, 12개월 관절경 치유 우월" },
      { m: "특히 전방 병변에서 hUCB-MSC의 연골 치유가 더 우월하다", b: "표 C: 부위별 하위분석" },
      { m: "적은 표본 수, 후향적 설계, 조직학적 평가 부재가 근거를 제한한다", b: "표 E: 후향적 설계, 적은 표본 수, 조직학 평가 없음" }
    ],
    tableE: [
      { l: "후향적 설계와 적은 표본 수", i: "통계적 검정력 제한", f: "대규모 잘 설계된 전향 무작위 시험 필요" },
      { l: "조직학적 평가 부재", i: "재생 연골 질 정보 제한", f: "조직학 포함 연구 필요" }
    ]
  },

  /* ===================== 27. KSSTA 2024 — hyaline-type cartilage prospective ===================== */
  {
    id: "p27", num: 27, category: "cohort", evidence: "mid",
    title: "Implantation of hUCB-MSCs generates greater hyaline-type cartilage than microdrilling combined with high tibial osteotomy",
    authors: "Jung SH, Park H, Jung M, Chung K, Kim S, Moon HS, Park J, Lee JH, Choi CH, Kim SH",
    journal: "Knee Surgery, Sports Traumatology, Arthroscopy", year: 2024,
    design: "전향적 비교 코호트 연구", evidenceLabel: "전향적 비교 코호트 연구 (Level II)",
    pmid: "38426617", reg: "—", impact: "IF 3.3",
    tableB: {
      question: "큰 연골 결손에서 hUCB-MSC 이식과 관절경 미세천공(병용 HTO)의 재생 연골 질(유리연골형) 비교",
      population: "MFC ICRS grade ≥IIIB 큰 거의 전층 결손 + 내반정렬 25명: hUCB-MSC 15명, 미세천공 10명",
      intervention: "HTO + hUCB-MSC 이식 vs HTO + 관절경 미세천공",
      outcomes: "1차: VAS·IKDC(12·24·48주). 2차: 1년 관절경·조직학·MRI, 2형 콜라겐 면역염색",
      followup: "1년"
    },
    tableC: [
      { v: "연골 결손 크기 / 회복 면적", r: "7.2±1.9 / 4.5±1.4 cm²", c: "5.2±2.1 / 3.0±1.6 cm²", e: "hUCB-MSC군이 더 큼", s: "p=0.023 / p=0.035" },
      { v: "2형 콜라겐 중등~강 양성 비율", r: "93.3%", c: "60%", e: "hUCB-MSC 우월", s: "유의(원문)" },
      { v: "탐침 시 정상 연골 유사 경도", r: "86.7%", c: "50.0%", e: "—", s: "p=0.075" },
      { v: "유리연골 비율(조직학)", r: "더 높음(hUCB-MSC)", c: "기준", e: "—", s: "p=0.041" },
      { v: "임상결과(VAS·IKDC)", r: "개선", c: "개선", e: "군간 유의차 없음", s: "유의차 없음" }
    ],
    tableD: [
      { m: "더 큰 결손에도 불구하고 hUCB-MSC 이식은 미세천공과 임상결과가 동등하다", b: "표 C: 결손 7.2 vs 5.2 cm²(p=0.023), 임상 군간 차이 없음" },
      { m: "hUCB-MSC는 미세천공보다 유리연골형(2형 콜라겐) 재생을 더 많이 생성한다", b: "표 C: 2형 콜라겐 93.3% vs 60%, 유리연골 p=0.041" },
      { m: "적은 표본 수와 대조군 추적 소실(5명)이 제2종 오류 위험을 높인다", b: "표 E: 적은 표본 수, 대조군 5명 추적 소실" }
    ],
    tableE: [
      { l: "표본 크기가 작음(생검 동의 확보·연구기간 우려로 최소화)", i: "주요 한계, 검정력 제한", f: "더 큰 표본 연구 필요" },
      { l: "대조군 5명 추적 소실", i: "제2종 오류(Type II) 위험 증가", f: "추적 유지 강화 필요" }
    ]
  },

  /* ===================== 29. Orthop Traumatol Surg Res 2025 — meniscus status ===================== */
  {
    id: "p29", num: 29, category: "cohort", evidence: "mid",
    title: "Effect of preoperative medial meniscus status on the outcomes of high tibial osteotomy with human umbilical cord-derived mesenchymal stem cells cartilage regeneration",
    authors: "Lee DW, Hong SW, Cho SI, Moon SG, Kang JH",
    journal: "Orthopaedics & Traumatology: Surgery & Research", year: 2025,
    design: "후향적 비교 연구", evidenceLabel: "후향적 비교 연구 (Level III)",
    pmid: "39900334", reg: "—", impact: "IF 2.3",
    tableB: {
      question: "HTO + hUCB-MSC 연골재생에서 수술 전 내측 반월상연골(MM) 상태가 결과에 미치는 영향",
      population: "HTO + hUCB-MSC 이식 47명. 그룹 P(MM 보존 또는 내측 반월상연골근 봉합) vs 그룹 L(MM 소실, 변연폭 <3mm)",
      intervention: "HTO + hUCB-MSC 이식(MM 상태로 군 분류)",
      outcomes: "IKDC·WOMAC, MOCART 2.0, 2차 관절경 ICRS-CRA, MM 탈출-연골회복 상관",
      followup: "최소 2년"
    },
    tableC: [
      { v: "IKDC·WOMAC(군내 개선)", r: "유의 개선(그룹 P)", c: "유의 개선(그룹 L)", e: "양군 개선", s: "p<0.01" },
      { v: "IKDC / WOMAC(군간)", r: "—", c: "—", e: "군간 차이 없음", s: "p=0.21 / p=0.42" },
      { v: "MOCART 2.0 / ICRS-CRA(군간)", r: "—", c: "—", e: "군간 차이 없음", s: "p=0.35 / p=0.08" },
      { v: "양호 결과 비율(연골하골 변화·ICRS I/II)", r: "그룹 P 56% / 84%", c: "그룹 L 31.8% / 72.7%", e: "유의하진 않음", s: "p=0.09 / p=0.48" },
      { v: "수술 전 MM 탈출 상관", r: "MOCART 2.0 r=−0.24 / 연골하골 변화 r=−0.29", c: "—", e: "음의 상관", s: "p=0.03 / p=0.02" }
    ],
    tableD: [
      { m: "HTO + hUCB-MSC는 수술 전 MM 상태와 무관하게 유의한 임상 개선과 연골 재생을 제공한다", b: "표 C: 양군 IKDC·WOMAC p<0.01, 군간 차이 없음" },
      { m: "수술 전 MM 탈출은 연골하골 변화에 영향을 미쳐 장기 결과에서 MM 상태 고려가 필요하다", b: "표 C: MM 탈출 상관 r=−0.24·−0.29(p=0.03·0.02)" },
      { m: "후향적 비교 연구(Level III)와 적은 표본 수에 따른 선택 편향이 존재한다", b: "표 E: 후향, 선택 편향" }
    ],
    tableE: [
      { l: "후향적 비교 연구로 선택 편향 내재", i: "결과 해석에 편향 영향 가능", f: "전향적 설계 연구 필요" }
    ]
  },

  /* ===================== 30. Stem Cell Res Ther 2025 — HTO + hUCB-MSC-HA n=10 ===================== */
  {
    id: "p30", num: 30, category: "caseseries", evidence: "low",
    title: "Treatment of osteoarthritic knee with high tibial osteotomy and allogeneic human umbilical cord blood-derived mesenchymal stem cells combined with hyaluronate hydrogel composite",
    authors: "Bae BS, Jung JW, Jo GO, Kim SA, Go EJ, Cho ML, Shetty AA, Kim SJ",
    journal: "Stem Cell Research & Therapy", year: 2025,
    design: "증례 시리즈", evidenceLabel: "증례 시리즈",
    pmid: "40296133", reg: "—", impact: "IF 7.1",
    tableB: {
      question: "중증 골관절염 중년 환자에서 HTO + hUCB-MSC-HA 복합체 이식 후 연골 재생·임상결과",
      population: "환자 10명(중앙 연령 58.5세[57.0~60.0], 평균 BMI 27.81[24.42~32.24])",
      intervention: "HTO + 동종 hUCB-MSC-HA 하이드로젤 복합체 이식",
      outcomes: "WOMAC·VAS·SF-36(PCS·MCS)(6개월·1·2년), 하드웨어 제거 시 MFC 연골(크기·ICRS), KL 등급·HKA각",
      followup: "최소 2년"
    },
    tableC: [
      { v: "WOMAC(수술 전→2년)", r: "57.00 → 27.50", c: "—(단일군)", e: "—", s: "p=0.002" },
      { v: "VAS(수술 전→2년)", r: "66.25 → 26.25", c: "—", e: "—", s: "p=0.002" },
      { v: "SF-36 PCS / MCS", r: "27.97→55.31 / 41.04→63.18", c: "—", e: "—", s: "p=0.002 / p=0.020" },
      { v: "MFC 연골 병변(크기·ICRS)", r: "유의한 개선", c: "—", e: "—", s: "유의(원문)" }
    ],
    tableD: [
      { m: "HTO + hUCB-MSC-HA 복합체는 중년 중증 OA 환자에서 2년간 통증·기능·삶의 질을 유의하게 개선한다", b: "표 C: WOMAC·VAS·SF-36 p=0.002~0.020" },
      { m: "하드웨어 제거 시 평가에서 MFC 연골 병변(크기·ICRS)이 유의하게 호전되었다", b: "표 C: MFC 연골 개선" },
      { m: "표본 수가 적은 증례 시리즈와 짧은 추적 기간이 근거를 제한한다", b: "표 E: 적은 표본 수, 짧은 추적 기간" }
    ],
    tableE: [
      { l: "비교적 짧은 추적·표본 수가 적은 증례 시리즈(n=10)", i: "장기 효과·일반화 제한", f: "장기 추적·대조 연구 필요" }
    ]
  },

  /* ===================== Related: Lateral OA return to sports ===================== */
  {
    id: "x_lat", num: "관련", category: "related", evidence: "mid",
    title: "Patients with advanced lateral osteoarthritis can return to sports and work after distraction arthroplasty plus lateral meniscal allograft transplantation combined with cartilage repair",
    authors: "Lee DW, Lee DR, Kim MA, Cho SI, Lee JK, Kim JG",
    journal: "Knee Surgery, Sports Traumatology, Arthroscopy", year: 2022,
    design: "후향적 비교 연구", evidenceLabel: "후향적 비교 연구",
    pmid: "—", reg: "—", impact: "—",
    tableB: {
      question: "진행성 외측 골관절염 활동적 환자에서 신연 관절성형술(DA) + 외측 반월상연골 동종이식(MAT) + 연골 회복술 후 스포츠·직장 복귀(RTS·RTW)",
      population: "진행성 외측 OA 환자 21명(외측 가장자리 중등도~중증 관절간격 협소 + 외측 대퇴과 큰 연골 결손)",
      intervention: "신연 관절성형술 + 외측 MAT + 연골 회복술 병용(연골 회복술에 줄기세포 등 포함 가능)",
      outcomes: "RTS·RTW, Lysholm·IKDC 등 주관적 무릎 점수, 방사선",
      followup: "원문(후향 검토)"
    },
    tableC: [
      { v: "스포츠·직장 복귀(RTS·RTW)", r: "대부분 환자 복귀(원문)", c: "—", e: "—", s: "원문 미보고(세부 수치)" },
      { v: "임상·방사선 결과", r: "개선(원문)", c: "—", e: "—", s: "원문 미보고(세부 수치)" }
    ],
    tableD: [
      { m: "진행성 외측 OA 활동 환자에서 DA + 외측 MAT + 연골 회복 병용이 임상·방사선 개선과 스포츠/직장 복귀를 가능케 한다", b: "표 B/C: 21명 대부분 RTS·RTW" },
      { m: "CARTISTEM 직접 평가가 아닌 외측 구획 연골 보존 전략의 관련 근거이다", b: "표 A: 관련 연구(연골 회복술 병용)" },
      { m: "후향적 설계와 적은 표본 수로 일반화는 제한된다", b: "표 E: 후향, n=21" }
    ],
    tableE: [
      { l: "후향적 설계와 적은 표본 수(n=21), 연골 회복술 세부(세포원) 혼재", i: "CARTISTEM 단독 효과 분리 불가", f: "구획·술식별 비교 연구 필요" }
    ]
  },

  /* ===================== Reference: MRI underestimates grade ===================== */
  {
    id: "x_mri", num: "참고", category: "reference", evidence: "context",
    title: "Knee MRI Underestimates the Grade of Cartilage Lesions",
    authors: "Krakowski P, Karpiński R, Jojczuk M, Nogalska A, Jonak J",
    journal: "Applied Sciences", year: 2021,
    design: "진단정확도 비교 연구(MRI vs 관절경)", evidenceLabel: "방법론 참고 연구",
    pmid: "—", reg: "—", impact: "—",
    tableB: {
      question: "무릎 MRI가 관절경(기준) 대비 연골 병변 등급을 정확히 평가하는가",
      population: "연골 병변 평가 대상(관절경 기준 비교). 세부 표본 원문 참조",
      intervention: "MRI 연골 등급 평가 vs 관절경 직접 평가(기준)",
      outcomes: "MRI의 연골 병변 등급 일치도·민감도",
      followup: "해당 없음(진단 비교)"
    },
    tableC: [
      { v: "MRI 연골 등급 평가", r: "관절경 대비 등급을 과소평가", c: "관절경(기준)", e: "과소추정 경향", s: "원문 참조(세부 수치)" }
    ],
    tableD: [
      { m: "무릎 MRI는 관절경 대비 연골 병변 등급을 과소평가하는 경향이 있다", b: "제목·표 C: MRI 과소추정" },
      { m: "본 논문은 CARTISTEM 연구의 영상 평가 한계(MRI 한계)의 방법론적 근거로 인용된다", b: "표 A: 방법론 참고문헌" },
      { m: "치료 효능 연구가 아니므로 효능 추론에는 사용하지 않는다", b: "표 A: 진단정확도 연구" }
    ],
    tableE: [
      { l: "진단정확도 연구로 CARTISTEM 효능과 직접 관련 없음", i: "영상 평가 해석 시 MRI의 등급 과소추정 유의", f: "관절경·조직학 병행 평가 권장" }
    ]
  },

  /* ===================== Reference: Arthroscopic measurement of cartilage lesions ===================== */
  {
    id: "x_meas", num: "참고", category: "reference", evidence: "context",
    title: "Arthroscopic Measurement of Cartilage Lesions of the Knee Condyle (after debridement)",
    authors: "Robert H, et al.",
    journal: "Cartilage", year: 2011,
    design: "방법론(측정) 연구", evidenceLabel: "방법론 참고 연구",
    pmid: "—", reg: "—", impact: "—",
    tableB: {
      question: "무릎 대퇴과 연골 병변의 깊이·크기를 관절경으로 어떻게 정확히 측정·기준화할 것인가(변연절제 후 기준)",
      population: "무릎 연골 병변(관절경 빈도 63%, 주로 대퇴과). 세부 표본 원문 참조",
      intervention: "관절경하 연골 병변 측정(변연절제 후 크기 기준화), MRI와 비교",
      outcomes: "병변 깊이·크기 측정의 정확도·기준",
      followup: "해당 없음(측정 방법)"
    },
    tableC: [
      { v: "MRI 민감도(깊이·크기)", r: "33%~95%(시퀀스 의존), 특이도 높음", c: "관절경(기준)", e: "—", s: "원문 참조" },
      { v: "관절경 측정", r: "변연절제 후 병변 크기 기준화 제시", c: "—", e: "—", s: "방법론" }
    ],
    tableD: [
      { m: "연골 병변의 깊이·크기 측정은 치료 결정·예후에 필수이며, 변연절제 후 관절경 측정이 크기 기준으로 활용된다", b: "표 C: 변연절제 후 크기 기준화" },
      { m: "본 논문은 CARTISTEM 연구의 병변 크기 측정(Debridement 후 기준)의 방법론적 근거로 인용된다", b: "표 A: 방법론 참고문헌" },
      { m: "치료 효능 연구가 아니므로 효능 추론에는 사용하지 않는다", b: "표 A: 측정 방법론" }
    ],
    tableE: [
      { l: "측정 방법론 연구로 CARTISTEM 효능과 직접 관련 없음", i: "병변 크기 비교 시 측정 기준(변연절제 후) 일치 필요", f: "표준화된 측정 프로토콜 적용 권장" }
    ]
  }
];
