# 실손보험 이의신청 도우미 (한국형 Fight Health Insurance)

미국의 비영리 오픈소스 프로젝트 **Fight Health Insurance(FHI)** 를 한국 실손의료보험
환경에 맞게 재구성한 **비영리 이의신청서 초안 작성 보조 도구**입니다. 거대 언어 모델
(LLM)과 판례 기반 검색 증강 생성(RAG)을 결합하되, 한국의 **변호사법 제109조** 및
**대법원 2025두35483('로폼') 판결** 기조에 맞춰 AI를 **'문서 구조화·서식 완성 보조
도구'** 로 엄격히 제한하는 규제 순응형 프롬프트 아키텍처를 구현했습니다.

> ⚠️ 본 도구는 변호사·손해사정사·의료인이 아니며, 법률·의학 자문을 제공하지 않습니다.
> 생성물은 공인된 판례 데이터를 기계적으로 매핑한 **초안**일 뿐입니다.

## 핵심 설계

### 3단계 프롬프트 아키텍처 (`lib/prompt.ts`)

| 단계 | 역할 | 구현 |
| --- | --- | --- |
| **1단계 — 시스템 경계 설정** | 변호사법·의료법 준수, 자아·정보생성 한계, 가드레일 선언 | `SYSTEM_PROMPT` |
| **2단계 — 맥락 주입(RAG)** | 검색된 판례 + 사용자 입력 데이터(JSON)를 `<retrieved_knowledge>` / `<user_medical_data>` 태그로 주입 | `buildContextBlock()` |
| **3단계 — CoT 작업 지시** | 논리 매핑 → 초안 병합 → 면책 고지 삽입의 연쇄적 사고 지시 | `buildTaskInstruction()` |

### 규제 순응 전략 (Regulatory-Compliant Prompting)

- **자아 제한**: AI가 스스로를 변호사·손해사정사로 인식하지 않도록 비영리·비전문성 명시
- **네거티브 프롬프팅**: 승소 확률 예측·독자적 법리 창작·환각(Hallucination) 금지,
  RAG로 제공된 사건번호만 인용하도록 강제
- **면책 고지 강제**: 모든 출력 말미에 "기계적으로 매핑된 서식 초안" 면책 문구 자동 삽입

### 판례 RAG 지식베이스 (`lib/knowledgeBase.ts`, `lib/rag.ts`)

연구서에 정리된 주요 부지급 쟁점을 구조화했습니다.

- **백내장(다초점렌즈)** — 입원 실질 필요성 심사(대법원 2024다305643), 기저질환 인정 사례
- **도수치료** — 약관상 횟수 제한 부존재, 대면 진단 우선·서면 의료자문 배척
- **무릎 줄기세포(BMAC)** — 생체 징후 급변·기저질환 입증 시 입원 인정(2024가단55065)
- **의료자문 대응** — 일방적 서면 자문 거부 및 **동시감정(Simultaneous Appraisal)** 요구권

### 가드레일 (보상 배제 자동 차단)

대법원 판례상 보상 대상이 아닌 항목이 입력에서 탐지되면 **LLM 호출 없이 즉시 차단**하고
법적 사유를 고지합니다.

- 지인·직원 할인 등 감면 의료비 (대법원 2023다240916)
- 본인부담상한제 사후환급금 (대법원 2023다283913)

## 기술 스택

- **Next.js 14 (App Router)** + TypeScript + Tailwind CSS
- **Anthropic Claude API** (`@anthropic-ai/sdk`) — 기본 모델 `claude-opus-4-8`, 스트리밍 출력
- RAG: TF-IDF 코사인 유사도 벡터 검색(`lib/vectorStore.ts`) — API 키 없이 동작,
  외부 임베딩 벡터 DB로 교체 가능한 인터페이스
- 마이데이터(실손24) 연동 stub(`lib/mydata.ts`) — 면책 청구건 자동 불러오기

## 실행 방법

```bash
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 에 ANTHROPIC_API_KEY 입력

npm run dev
# http://localhost:3000
```

### 환경변수

| 변수 | 설명 | 기본값 |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | Anthropic Claude API 키 (필수) | — |
| `APPEAL_MODEL` | 사용할 모델 | `claude-opus-4-8` |

## 프로젝트 구조

```
app/
  page.tsx              # 입력 폼 + 마이데이터 패널 + 스트리밍 출력 UI
  layout.tsx
  api/appeal/route.ts   # 가드레일 → RAG → Claude 스트리밍 API
  api/mydata/route.ts   # 실손24/마이데이터 면책 청구건 조회(stub)
  (page.tsx 내) 인쇄/PDF 저장 · 금융분쟁조정 신청서 양식 생성
lib/
  types.ts              # 도메인 타입
  knowledgeBase.ts      # 판례 RAG 지식베이스 + 배제 규칙
  rag.ts                # 벡터 검색 + 가드레일 판정
  prompt.ts             # 3단계 프롬프트 아키텍처
  mydata.ts             # 실손24/마이데이터 연동(stub) + 입력 매핑
  disputeForm.ts        # 금융분쟁조정 신청서 양식 생성
  embedding.ts          # 임베딩 provider(로컬 해싱 TF-IDF / 원격 어댑터)
  vectorIndex.ts        # dense 벡터 인덱스(provider + 백엔드 위임)
  vectorBackend.ts      # 검색 백엔드(BruteForce / LSH-ANN / Qdrant)
  backends/qdrant.ts    # Qdrant 벡터 DB REST 실연동 어댑터
  text.ts               # 한국어 친화 토크나이저
  scrub.ts              # PII 익명화(스크러빙) 모듈
  crawler.ts            # 판례 수집 소스 추상화 + 구조화 추출
scripts/
  test-rag.ts           # RAG 검색 순위·가드레일 회귀 테스트
  test-scrub.ts         # PII 스크러빙 단위 테스트
  validate-kb.ts        # 지식베이스 무결성 검증(CI 게이트)
  crawl-cases.ts        # 수집→익명화→구조화→data/incoming 적재
  ingest-cases.ts       # 신규 판례 수집 후보 검증(PII·스키마)
  generate-synthetic-data.ts  # LoRA 합성 학습 데이터 생성
training/
  qlora_axolotl.yaml    # QLoRA 미세조정 설정
  README.md             # 데이터→학습→vLLM 서빙 절차
.github/workflows/
  ci.yml                      # 빌드/검증/테스트
  update-knowledge-base.yml   # 스케줄 자동 갱신 + PR
```

## 개발 스크립트 / CI

```bash
npm run validate:kb    # 판례 지식베이스 무결성 검증(CI 게이트)
npm run test:rag       # RAG 검색 순위·가드레일 회귀 테스트
npm run test:scrub     # PII 스크러빙 단위 테스트
npm run test:ann       # ANN(LSH) recall@k 검증
npm run test:qdrant    # Qdrant 백엔드 REST 연동 검증(목 서버)
npm run crawl:cases    # 수집→익명화→구조화→data/incoming 적재
npm run ingest:cases   # 신규 수집 후보(data/incoming) 스키마·PII 검증
npm run gen:data       # LoRA 합성 학습 데이터 생성(data/synthetic)
```

- **`.github/workflows/ci.yml`** — push/PR 시 validate:kb → test:rag →
  typecheck → build
- **`.github/workflows/update-knowledge-base.yml`** — 매주 스케줄 실행:
  신규 판례 수집 검증 → 무결성 검증 → 합성 데이터 재생성 → 회귀 테스트 →
  변경 시 PR 자동 생성(사람 검토 후 머지)
- **`training/`** — QLoRA 미세조정 설정 및 데이터→학습→vLLM 서빙 절차

## 진행 현황 / 로드맵 (연구서 기준)

- ✅ **실손24 / 마이데이터 API 연계** — 면책 청구건 정형 데이터 자동 주입(stub)
- ✅ **벡터 RAG** — TF-IDF 코사인 유사도 검색
- ✅ **외부 임베딩 벡터 DB 교체 경계** — `EmbeddingProvider` 추상화로 원격
  임베딩 엔드포인트 전환 가능(`EMBEDDING_*` 환경변수)
- ✅ **도메인 특화 미세조정 파이프라인** — 익명 합성 데이터 생성 + QLoRA 설정
- ✅ **자동 갱신 CI 파이프라인** — 무결성·회귀 테스트 및 스케줄 갱신 워크플로
- ✅ **PII 익명화·수집 파이프라인** — 스크러버 + 소스 추상화 + 구조화 추출
  (로컬 fixture 동작, 원격 소스는 어댑터 골격)
- ✅ **ANN 인덱스** — 랜덤 초평면 LSH 기반 근사 최근접(`VECTOR_BACKEND=lsh`),
  recall@5 ≈ 98% 검증
- ✅ **외부 벡터 DB 실연동(Qdrant)** — REST 어댑터(`VECTOR_BACKEND=qdrant`),
  목 서버로 프로토콜 100% 일치 검증. `QDRANT_URL` 설정 시 실 인스턴스 연결
- ⏳ **원격 크롤러 실연동** — 금감원/소비자원/판결문 실 수집(이용약관·저작권·법적 검토 필요)

---

본 프로젝트는 거대 보험사와 개별 소비자 간 정보 비대칭성 해소를 목표로 하는 비영리
리걸테크 실험입니다.
