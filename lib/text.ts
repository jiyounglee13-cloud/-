/**
 * 한국어 친화 텍스트 토크나이저.
 *
 * 형태소 분석기 없이도 '다초점렌즈' ↔ '다초점 렌즈'처럼 띄어쓰기·어미가
 * 다른 표현을 매칭할 수 있도록, 단어 토큰과 문자 n-gram을 함께 생성한다.
 * 로컬 임베딩 provider(lib/embedding.ts)와 검색기가 공유한다.
 */

const NGRAM_SIZE = 2;

/** 텍스트 정규화: 소문자화 + 한글/영숫자 외 문자는 공백으로 */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^0-9a-z가-힣\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** 토큰화: 단어 토큰 + 한글/영숫자 연속 구간의 문자 n-gram */
export function tokenize(text: string): string[] {
  const norm = normalize(text);
  if (!norm) return [];

  const words = norm.split(" ").filter(Boolean);
  const terms: string[] = [];

  for (const w of words) {
    if (w.length >= 2) terms.push(`w:${w}`); // 단어 토큰
    if (w.length >= NGRAM_SIZE) {
      for (let i = 0; i <= w.length - NGRAM_SIZE; i++) {
        terms.push(`g:${w.slice(i, i + NGRAM_SIZE)}`); // 문자 n-gram
      }
    } else {
      terms.push(`g:${w}`);
    }
  }
  return terms;
}
