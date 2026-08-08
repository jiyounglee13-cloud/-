import type { HistEvent } from '../types/event';
import { eventEndSigned, eventStartSigned } from './time';

export interface Extent {
  min: number;
  max: number;
}

/** 데이터 전체의 연도 범위(부호 있는 연도) */
export function dataExtent(events: HistEvent[]): Extent {
  let min = Infinity;
  let max = -Infinity;
  for (const e of events) {
    min = Math.min(min, eventStartSigned(e));
    max = Math.max(max, eventEndSigned(e));
  }
  if (!isFinite(min) || !isFinite(max)) return { min: 0, max: 100 };
  return { min, max };
}

/**
 * 한 레인 안에서 마커가 가로로 겹치지 않도록 서브행(row)을 그리디 배정.
 * widths[i] = { x0: 시작 픽셀, wpx: 마커+라벨 추정 폭 }
 * 반환: 각 항목의 행 인덱스(0부터).
 */
export function packRows(widths: { x0: number; wpx: number }[], gap = 10): number[] {
  const rowsLastRight: number[] = [];
  const rowOf: number[] = new Array(widths.length).fill(0);
  const order = widths.map((_, i) => i).sort((a, b) => widths[a].x0 - widths[b].x0);
  for (const i of order) {
    const it = widths[i];
    let placed = -1;
    for (let r = 0; r < rowsLastRight.length; r++) {
      if (it.x0 >= rowsLastRight[r] + gap) {
        placed = r;
        break;
      }
    }
    if (placed === -1) {
      placed = rowsLastRight.length;
      rowsLastRight.push(0);
    }
    rowsLastRight[placed] = it.x0 + it.wpx;
    rowOf[i] = placed;
  }
  return rowOf;
}
