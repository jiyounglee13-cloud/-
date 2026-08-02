import raw from '../data/events.json';
import { EventsSchema, type HistEvent } from '../types/event';

/**
 * 앱 시작 시 시드 데이터를 Zod로 파싱(검증).
 * 데이터가 스키마를 어기면 개발 중 즉시 실패해 오류를 조기에 드러낸다.
 * (CI 게이트는 별도로 `npm run validate` 가 담당한다.)
 */
export const EVENTS: HistEvent[] = EventsSchema.parse(raw);

export const EVENTS_BY_ID: Map<string, HistEvent> = new Map(
  EVENTS.map((e) => [e.id, e]),
);
