import { useEffect, useMemo, useState } from 'react';
import { EVENTS, EVENTS_BY_ID } from './lib/loadEvents';
import { eventEndSigned, eventStartSigned } from './lib/time';
import { TRACK_LABELS } from './lib/categories';
import type { HistEvent } from './types/event';
import { Timeline } from './components/Timeline';
import { EventDetail } from './components/EventDetail';
import { ComparisonPanel } from './components/ComparisonPanel';
import { Legend } from './components/Legend';
import { Filters, EMPTY_FILTER, type FilterState } from './components/Filters';

export type Theme = 'dark' | 'light';

/** 연결선 범례 아이템 */
function LinkLegendItem({ color, dash, label }: { color: string; dash?: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg width={24} height={8} aria-hidden>
        <line x1={0} y1={4} x2={24} y2={4} stroke={color} strokeWidth={2} strokeDasharray={dash} />
      </svg>
      {label}
    </span>
  );
}

function matchesFilter(e: HistEvent, f: FilterState): boolean {
  if (e.importance < f.minImp) return false;
  if (f.cats.length > 0 && !f.cats.includes(e.category)) return false;
  const q = f.q.trim().toLowerCase();
  if (q) {
    const hay =
      `${e.title} ${e.description} ${e.significance} ${e.region ?? ''} ${TRACK_LABELS[e.track]}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  const fromRaw = f.yearFrom.trim();
  const toRaw = f.yearTo.trim();
  if (fromRaw !== '' || toRaw !== '') {
    const from = fromRaw === '' ? -Infinity : Number(fromRaw);
    const to = toRaw === '' ? Infinity : Number(toRaw);
    if (!Number.isNaN(from) && !Number.isNaN(to)) {
      const lo = Math.min(from, to);
      const hi = Math.max(from, to);
      const s = eventStartSigned(e);
      const en = eventEndSigned(e);
      if (en < lo || s > hi) return false; // 범위와 겹치지 않음
    }
  }
  return true;
}

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusYear, setFocusYear] = useState<number>(1450);
  const [showAllLinks, setShowAllLinks] = useState(false);
  const [emphasize, setEmphasize] = useState(false);
  const [filter, setFilter] = useState<FilterState>(EMPTY_FILTER);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('theme') === 'light') return 'light';
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('theme-light', theme === 'light');
    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* localStorage 불가 환경 무시 */
    }
  }, [theme]);

  const filtered = useMemo(() => EVENTS.filter((e) => matchesFilter(e, filter)), [filter]);
  // 상세의 '연결 사건'은 필터로 숨겨졌어도 조회되도록 전체 맵 사용
  const selected = selectedId ? EVENTS_BY_ID.get(selectedId) ?? null : null;

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-6">
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--fg)]">세계사 동시대 비교 타임라인</h1>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            유럽 · 동아시아 · 남아시아/이슬람 · 한국을 하나의 시간축에 나란히. 같은 시점에 각 문화권이
            무엇을 하고 있었는지 비교합니다.
          </p>
          <p className="mt-1 text-xs text-[var(--fg-subtle)]">
            시드 {EVENTS.length}건 · <span className="text-[var(--fg-muted)]">사실</span>/
            <span className="text-indigo-400">해석</span> 분리 ·{' '}
            <span className="text-amber-500">동시대 비교</span> · 연결선 · 필터·검색 ·{' '}
            <span className="text-fuchsia-500">AI 보조(실험)</span>
          </p>
        </div>
        <button
          onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          className="shrink-0 rounded-lg border border-[var(--border-strong)] bg-[var(--panel)] px-3 py-1.5 text-xs text-[var(--fg-muted)] hover:bg-[var(--panel-soft)]"
          aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
        >
          {theme === 'dark' ? '☀️ 라이트' : '🌙 다크'}
        </button>
      </header>

      <div className="mb-3">
        <Legend />
      </div>

      <div className="mb-3">
        <Filters value={filter} onChange={setFilter} shown={filtered.length} total={EVENTS.length} />
      </div>

      {/* 연결선 · 해석 강조 토글 + 연결선 범례 */}
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
        <label className="flex cursor-pointer items-center gap-1.5 text-[var(--fg-muted)]">
          <input
            type="checkbox"
            checked={showAllLinks}
            onChange={(e) => setShowAllLinks(e.target.checked)}
            className="accent-sky-500"
          />
          모든 연결선 표시
        </label>
        <label className="flex cursor-pointer items-center gap-1.5 text-[var(--fg-muted)]">
          <input
            type="checkbox"
            checked={emphasize}
            onChange={(e) => setEmphasize(e.target.checked)}
            className="accent-indigo-500"
          />
          해석 강조
        </label>
        <span className="mx-1 hidden h-4 w-px bg-[var(--border-strong)] sm:inline-block" />
        <span className="hidden flex-wrap items-center gap-3 text-[var(--fg-muted)] sm:flex">
          <LinkLegendItem color="#f43f5e" label="인과" />
          <LinkLegendItem color="#38bdf8" dash="6 4" label="영향" />
          <LinkLegendItem color="#94a3b8" dash="2 5" label="동시대·무관" />
        </span>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="min-w-0 flex-1">
          <Timeline
            events={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
            focusYear={focusYear}
            onFocusYear={setFocusYear}
            showAllLinks={showAllLinks}
            theme={theme}
          />
        </div>
        <ComparisonPanel events={filtered} focusYear={focusYear} onSelect={setSelectedId} emphasize={emphasize} />
      </div>

      {selected && (
        <EventDetail
          event={selected}
          byId={EVENTS_BY_ID}
          onClose={() => setSelectedId(null)}
          onSelect={setSelectedId}
        />
      )}
    </div>
  );
}
