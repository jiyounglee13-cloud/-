import { useState } from 'react';
import { EVENTS, EVENTS_BY_ID } from './lib/loadEvents';
import { Timeline } from './components/Timeline';
import { EventDetail } from './components/EventDetail';
import { ComparisonPanel } from './components/ComparisonPanel';
import { Legend } from './components/Legend';

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // 동시대 포커스 연도 (플래그십 클러스터인 15세기 중반으로 초기화)
  const [focusYear, setFocusYear] = useState<number>(1450);
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
          Phase 2 · 시드 {EVENTS.length}건 · <span className="text-slate-300">사실</span>과{' '}
          <span className="text-indigo-300">해석</span> 분리 · 포커스 라인으로{' '}
          <span className="text-amber-300">동시대 비교</span>
        </p>
      </header>

      <div className="mb-4">
        <Legend />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="min-w-0 flex-1">
          <Timeline
            events={EVENTS}
            selectedId={selectedId}
            onSelect={setSelectedId}
            focusYear={focusYear}
            onFocusYear={setFocusYear}
          />
        </div>
        <ComparisonPanel events={EVENTS} focusYear={focusYear} onSelect={setSelectedId} />
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
