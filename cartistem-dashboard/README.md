# CARTISTEM 논문 핵심 메시지 대시보드

동종 제대혈 유래 중간엽 줄기세포(hUCB-MSC)와 4% 히알루론산 하이드로젤 복합체
**CARTISTEM®** 의 무릎 연골 재생 관련 학술 논문 31편을, 독자가 5분 이내에 핵심을 파악할 수
있도록 **표 중심·사실 기반(표 A~E)** 으로 요약한 **PC 최적화 프리미엄 대시보드**입니다.

> 모든 수치·통계량은 원문(초록·결과·고찰)에 기재된 값을 그대로 전사했으며, 추측·과장·외삽을
> 배제했습니다. 정보가 없는 항목은 `원문 미보고`로 표기합니다.

## 빠른 사용

- **바로 열기**: `cartistem-dashboard.html`(자체 완결형 단일 파일)을 더블클릭 → 어디서나 동작.
  다운로드해서 USB·오프라인에서도 그대로 사용할 수 있습니다(공개 링크가 없는 논문 PDF까지 내장).
- **개발용(분리 파일)**: `index.html`을 브라우저로 열거나 `python3 -m http.server`로 서빙.

```bash
# 단일 HTML(권장 — 배포/다운로드용)
open cartistem-dashboard.html

# 분리 파일 버전
cd cartistem-dashboard && python3 -m http.server 8080   # http://localhost:8080
```

## 주요 기능

| # | 기능 | 설명 |
|---|---|---|
| 1 | **좌측 분류 네비게이션** | 연구 유형별 그룹(RCT·메타분석·코호트·증례·술기·경제성·관련·참고)을 접고 펼치며, 논문 버튼 클릭 시 해당 카드로 부드럽게 이동·강조. 스크롤 위치에 따라 현재 논문 자동 하이라이트(스크롤스파이) |
| 2 | **논문 모음(원문 링크·PDF)** | 별도 뷰에서 전 논문을 표로 정리. 링크 가능 논문은 **PubMed/출판사 원문(DOI)** 으로 접속, 공개 링크가 없는 논문은 **PDF** 첨부 |
| 3 | **다운로드용 단일 HTML** | `build.js`가 CSS·JS·데이터·PDF를 인라인화한 `cartistem-dashboard.html` 생성(자체 완결형) |
| 4 | **프리미엄 디자인** | 클리니컬 그린 테마, 세리프 디스플레이 타이포, 좌측 다크 사이드바, 카드형 표 5종 |
| 5 | **글자 크기 조절** | 툴바의 `A− / A / A＋` 5단계, 선택값 `localStorage` 저장 |
| 6 | **원활한 앱 UX** | 해시 라우팅 기반 **브라우저 뒤로/앞으로** 지원, 툴바 `← 뒤로`, 우측 하단 `↑ 맨 위로`, 모바일 햄버거 메뉴 |
| 7 | **논문별 요약 PDF 출력** | 각 카드의 `🖨 요약 PDF 출력`으로 해당 논문 카드만 인쇄/PDF 저장(전체 인쇄와 별도) |

## 구성 파일

| 파일 | 역할 |
| --- | --- |
| `index.html` | 페이지 골격(툴바·좌측 네비·홈/논문모음 뷰) |
| `styles.css` | 프리미엄 테마(반응형 + 단일/전체 인쇄 최적화) |
| `app.js` | 렌더링·검색·필터·정렬·해시 라우팅·글자크기·요약 PDF |
| `data.js` | 논문 31편 데이터(표 A~E, 원문 수치 그대로 전사) |
| `sources.js` | 논문별 원문 연결(PMID·DOI·PDF) — 원문에서 추출한 값 |
| `build.js` | 단일 HTML 빌드 스크립트 (`node build.js`) |
| `cartistem-dashboard.html` | **빌드 산출물** — 다운로드용 자체 완결형 단일 HTML |
| `pdfs/` | 공개 링크가 없는 논문의 첨부 PDF(현재 P1) |

## 출력 포맷 — 표 5종 (위계 규칙)

각 논문 카드는 프롬프트 명세의 5개 표로 구성됩니다. **표 D(핵심 메시지)** 를 카드 상단에
항상 노출·강조하고, 표 C의 수치를 D의 근거로 상호 참조합니다.

| 표 | 구성 |
| --- | --- |
| **A. 논문 식별** | 제목 / 저자 / 저널·연도 / 연구 설계 / 연구 유형 / 식별자(PMID·등록번호·IF) |
| **B. 연구 개요** | 연구 질문 / 대상·표본 수 / 중재·비교 / 주요 평가변수 / 추적 기간 |
| **C. 핵심 정량 결과** | 평가변수 / 결과군 / 대조군 / 효과크기 / 유의성(p·CI) |
| **D. 핵심 메시지** | 핵심 함의 + 근거 데이터(표 C·B·E 참조) |
| **E. 한계·후속 연구** | 한계 / 결과 해석에 미치는 영향 / 후속 연구 제언 |

## 원문 링크 정책

- **PMID** 보유 논문 → `https://pubmed.ncbi.nlm.nih.gov/<PMID>/`
- **DOI**(원문에서 추출) → `https://doi.org/<DOI>` (출판사 전문)
- 공개 링크가 없는 논문 → `pdfs/`에 PDF 첨부(단일 HTML에는 base64로 내장)

> 모든 PMID·DOI는 각 논문 원문에서 추출한 값이며, 추측으로 생성하지 않았습니다.

## 데이터 추가/수정

`data.js`의 `window.PAPERS`에 동일 스키마로 객체를 추가하고, 필요 시 `sources.js`에 원문 링크를
추가한 뒤 `node build.js`로 단일 HTML을 다시 생성합니다.

```js
// data.js — 한 논문 스키마
{
  id: "p31", num: 31,
  category: "cohort",   // rct|review|cohort|caseseries|casereport|technique|economics|related|reference
  evidence: "mid",      // top|high|mid|low|context
  featured: false,
  title, authors, journal, year, design, evidenceLabel, pmid, reg, impact,
  tableB: { question, population, intervention, outcomes, followup },
  tableC: [ { v, r, c, e, s } ],   // 평가변수/결과군/대조군/효과크기/유의성
  tableD: [ { m, b } ],            // 핵심 메시지 / 근거
  tableE: [ { l, i, f } ]          // 한계 / 해석 영향 / 후속 제언
}
// sources.js — 원문 링크
SOURCES["p31"] = { pmid: "...", doi: "..." };   // 또는 { pdf: "pdfs/....pdf" }
```

---

본 대시보드는 **학술적·중립적 요약 도구**이며, 홍보·과장·권유성 표현을 포함하지 않습니다.
통계적 유의성과 임상적 의미를 혼동하지 않고, 연구 표본·설계 범위를 넘어선 일반화를 하지 않습니다.
