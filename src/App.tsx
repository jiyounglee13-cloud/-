import { useState } from 'react';
import { EVENTS, EVENTS_BY_ID } from './lib/loadEvents';
import { Timeline } from './components/Timeline';
import { EventDetail } from './components/EventDetail';
import { ComparisonPanel } from './components/ComparisonPanel';
import { Legend } from './components/Legend';

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

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // 동시대 포커스 연도 (플래그십 클러스터인 15세기 중반으로 초기화)
  const [focusYear, setFocusYear] = useState<number>(1450);
  const [showAllLinks, setShowAllLinks] = useState(false);
  const [emphasize, setEmphasize] = useState(false);
  const selected = selectedId ? EVENTS_BY_ID.get(selectedId) ?? null : null;

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-6">
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-slate-100">세계사 동시대 비교 타임라인</h1>
        <p className="mt-1 text-sm text-slate-400">
          유럽 · 동아시아 · 남아시아/이슬람 · 한국을 하나의 시간축에 나란히. 같은 시점에 각 문화권이
          무엇을 하고 있었는지 비교합니다.
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Phase 3 · 시드 {EVENTS.length}건 · <span className="text-slate-300">사실</span>/
          <span className="text-indigo-300">해석</span> 분리 ·{' '}
          <span className="text-amber-300">동시대 비교</span> · 사건 간 연결선
        </p>
      </header>

      <div className="mb-3">
        <Legend />
      </div>

      {/* Phase 3 컨트롤: 연결선 · 해석 강조 토글 + 연결선 범례 */}
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
        <label className="flex cursor-pointer items-center gap-1.5 text-slate-300">
          <input
            type="checkbox"
            checked={showAllLinks}
            onChange={(e) => setShowAllLinks(e.target.checked)}
            className="accent-sky-500"
          />
          모든 연결선 표시
        </label>
        <label className="flex cursor-pointer items-center gap-1.5 text-slate-300">
          <input
            type="checkbox"
            checked={emphasize}
            onChange={(e) => setEmphasize(e.target.checked)}
            className="accent-indigo-500"
          />
          해석 강조
        </label>
        <span className="mx-1 hidden h-4 w-px bg-slate-700 sm:inline-block" />
        <span className="hidden flex-wrap items-center gap-3 text-slate-400 sm:flex">
          <LinkLegendItem color="#f43f5e" label="인과" />
          <LinkLegendItem color="#38bdf8" dash="6 4" label="영향" />
          <LinkLegendItem color="#94a3b8" dash="2 5" label="동시대·무관" />
        </span>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="min-w-0 flex-1">
          <Timeline
            events={EVENTS}
            selectedId={selectedId}
            onSelect={setSelectedId}
            focusYear={focusYear}
            onFocusYear={setFocusYear}
            showAllLinks={showAllLinks}
          />
        </div>
        <ComparisonPanel
          events={EVENTS}
          focusYear={focusYear}
          onSelect={setSelectedId}
          emphasize={emphasize}
        />
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
