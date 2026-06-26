# 도메인 특화 미세조정 (LoRA) 파이프라인

연구서의 방법론을 구현한 보험 도메인 특화 LoRA 파인튜닝 절차입니다. 미국 FHI가
공개 항소 결정문을 역설계해 합성 데이터를 만들고 오픈소스 LLM을 LoRA로
미세조정한 것과 동일한 접근을, 한국 실손보험 분쟁 도메인에 적용합니다.

## 왜 미세조정인가

범용 대화형 모델은 한국 보험 실무 용어(면부책 결정, 본인부담상한제, 동시감정,
신의료기술 고시 등)와 약관 특유의 건조·엄격한 공문서 문체를 충분히 체득하지
못합니다. 합성 데이터로 "질병명 → 거절 사유 → 판례 인용 → 반박 논리 → 4단
서식" 구조를 선험적으로 학습시켜 환각을 줄이고 출력 일관성을 높입니다.

## 단계

### 1) 합성 데이터 생성

```bash
npm run gen:data            # 기본 400건 상한
# 또는
npx tsx scripts/generate-synthetic-data.ts --max 2000
```

- 출력: `data/synthetic/train.jsonl`, `val.jsonl`, `manifest.json`
- 포맷: chat-messages(system/user/assistant) — 추론 파이프라인과 동일한
  프롬프트 구조(SYSTEM_PROMPT + RAG 컨텍스트 + CoT 지시)를 재사용하여
  학습/추론 정합성을 보장합니다.
- **익명화**: 모든 인적사항은 익명 플레이스홀더로 생성되어 PII가 없습니다.
  실데이터(금감원 분쟁조정 결정문·소비자원 사례·판결문) 사용 시에는 반드시
  민감정보 스크러빙(Scrubbing)을 선행해야 합니다.

### 2) QLoRA 미세조정 (단일 GPU)

```bash
pip install axolotl
accelerate launch -m axolotl.cli.train training/qlora_axolotl.yaml
```

- 4-bit 양자화 + LoRA로 3090급 24GB 단일 GPU에서 학습 가능
- 베이스 모델은 한국어/의료 오픈 모델(MedGemma, Falcon, Llama-Ko 등)로 교체

### 3) vLLM 서빙

```bash
# LoRA 어댑터를 vLLM으로 서빙 (OpenAI 호환 엔드포인트)
vllm serve beomi/Llama-3-Open-Ko-8B \
  --enable-lora --lora-modules silson=./outputs/silson-qlora \
  --quantization awq --max-model-len 4096
```

서빙된 OpenAI 호환 엔드포인트는 앱의 추론 백엔드로 연결할 수 있습니다(현재
앱 기본값은 Claude API이며, 자체 호스팅 모델로 교체 가능한 구조입니다).

## 주의

- 합성 데이터의 인용 판례는 연구서 기재 내용을 구조화한 것으로, 실서비스 전
  반드시 원문 대조·검증이 필요합니다.
- 미세조정 모델도 환각을 완전히 제거하지 못하므로, RAG 주입 판례만 인용하도록
  하는 시스템 프롬프트 가드레일과 면책 고지를 추론 단계에서 함께 유지해야 합니다.
