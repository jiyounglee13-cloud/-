import { useMemo } from 'react';
import type { HistEvent, Track } from '../types/event';
import { CATEGORY_COLORS, TRACK_LABELS, TRACK_ORDER } from '../lib/categories';
import { eventEndSigned, eventStartSigned, formatEventYears, formatSignedYear } from '../lib/time';

const WINDOW_YEARS = 80;

interface Props {
  events: HistEvent[];
  focusYear: number;
  onSelect: (id: string) => void;
  emphasize: boolean;
}

interface Picked {
  e: HistEvent;
  dist: number;
  rel: 'ongoing' | 'before' | 'after';
}

function pickForTrack(
  events: HistEvent[],
  track: Track,
  focusYear: number,
): { within: Picked[]; nearest: Picked | null } {
  const arr: Picked[] = events
    .filter((e) => e.track === track)
    .map((e) => {
      const s = eventStartSigned(e);
      const en = eventEndSigned(e);
      if (focusYear >= s && focusYear <= en) return { e, dist: 0, rel: 'ongoing' as const };
      if (focusYear < s) return { e, dist: s - focusYear, rel: 'after' as const };
      return { e, dist: focusYear - en, rel: 'before' as const };
    })
    .sort((a, b) => a.dist - b.dist);
  return { within: arr.filter((p) => p.dist <= WINDOW_YEARS).slice(0, 3), nearest: arr[0] ?? null };
}

function relLabel(p: Picked): string {
  if (p.rel === 'ongoing') return '이 시기 진행 중';
  if (p.rel === 'after') return `${Math.round(p.dist)}년 후`;
  return `${Math.round(p.dist)}년 전`;
}

/** 포커스 연도 기준으로 4문화권의 동시대 사건을 나란히 비교 */
export function ComparisonPanel({ events, focusYear, onSelect, emphasize }: Props) {
  const picks = useMemo(
    () => TRACK_ORDER.map((t) => ({ track: t, ...pickForTrack(events, t, focusYear) })),
    [events, focusYear],
  );

  return (
    <aside className="shrink-0 lg:w-80">
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="mb-0.5 text-xs text-slate-400">동시대 비교 (±{WINDOW_YEARS}년)</div>
        <div className="mb-2 text-lg font-bold text-amber-300">{formatSignedYear(focusYear)}년 즈음</div>
        <p className="mb-3 text-[11px] leading-relaxed text-slate-500">
          타임라인 위에 마우스를 올리면 그 시점 기준으로 각 문화권을 실시간 비교합니다.
        </p>

        <div className="space-y-3">
          {picks.map(({ track, within, nearest }) => (
            <div key={track} className="rounded-lg border border-slate-800 bg-slate-800/30 p-3">
              <div className="mb-2 text-xs font-semibold text-slate-300">{TRACK_LABELS[track]}</div>
              {within.length > 0 ? (
                <ul className="space-y-1.5">
                  {within.map((p) => (
                    <li key={p.e.id}>
                      <button onClick={() => onSelect(p.e.id)} className="group w-full text-left">
                        <div className="flex items-start gap-2">
                          <span
                            className="mt-1 h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: CATEGORY_COLORS[p.e.category] }}
                          />
                          <div className="min-w-0">
                            <div className="truncate text-sm text-slate-200 group-hover:text-white">
                              {p.e.title}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {formatEventYears(p.e)} ·{' '}
                              <span className={p.rel === 'ongoing' ? 'text-amber-400' : ''}>
                                {relLabel(p)}
                              </span>
                            </div>
                            {emphasize && (
                              <p className="mt-1 line-clamp-3 whitespace-normal text-[11px] leading-relaxed text-indigo-300/90">
                                {p.e.significance}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : nearest ? (
                <button
                  onClick={() => onSelect(nearest.e.id)}
                  className="text-left text-[11px] text-slate-600 hover:text-slate-400"
                >
                  이 시기 시드 없음 · 가장 가까운: {nearest.e.title} ({relLabel(nearest)})
                </button>
              ) : (
                <div className="text-[11px] text-slate-600">시드 데이터 없음</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
