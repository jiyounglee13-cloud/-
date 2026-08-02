import type { Era, HistEvent } from '../types/event';

/**
 * 부호 있는 연도(signedYear): CE는 양수, BCE는 음수.
 * 역사 관례상 0년은 없지만, 매크로 타임라인 스케일에서는 1년 오차를 무시한다.
 * (데이터에는 사람이 읽는 era + year를 유지하고, 스케일 계산 시에만 이 값을 쓴다.)
 */
export function toSignedYear(era: Era, year: number): number {
  return era === 'BCE' ? -year : year;
}

export function eventStartSigned(e: HistEvent): number {
  return toSignedYear(e.era, e.yearStart);
}

export function eventEndSigned(e: HistEvent): number {
  return toSignedYear(e.era, e.yearEnd ?? e.yearStart);
}

/** 축 눈금 라벨용 한국어 연도 표기 */
export function formatSignedYear(signed: number): string {
  const y = Math.round(signed);
  if (y < 0) return `기원전 ${-y}`;
  if (y === 0) return '기원 원년';
  return `${y}`;
}

/** 이벤트의 사람이 읽는 연대 문자열 (예: "1443–1446", "기원전 480") */
export function formatEventYears(e: HistEvent): string {
  const prefix = e.era === 'BCE' ? '기원전 ' : '';
  if (e.yearEnd != null && e.yearEnd !== e.yearStart) {
    return `${prefix}${e.yearStart}–${e.yearEnd}`;
  }
  return `${prefix}${e.yearStart}`;
}
