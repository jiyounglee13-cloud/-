import { useState } from 'react';
import { EVENTS, EVENTS_BY_ID } from './lib/loadEvents';
import { Timeline } from './components/Timeline';
import { EventDetail } from './components/EventDetail';
import { Legend } from './components/Legend';

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? EVENTS_BY_ID.get(selectedId) ?? null : null;

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-6">
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-slate-100">세계사 동시대 비교 타임라인</h1>
        <p className="mt-1 text-sm text-slate-400">
          유럽 · 동아시아 · 남아시아/이슬람 · 한국을 하나의 시간축에 나란히. 같은 시점에 각 문화권이
          무엇을 하고 있었는지 비교합니다.
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Phase 1 · 시드 {EVENTS.length}건 · <span className="text-slate-300">사실</span>과{' '}
          <span className="text-indigo-300">해석</span>을 분리해 표시합니다.
        </p>
      </header>

      <div className="mb-4">
        <Legend />
      </div>

      <Timeline events={EVENTS} selectedId={selectedId} onSelect={setSelectedId} />

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
