import { useEffect, useRef, useState } from 'react';
import type { HistEvent } from '../types/event';
import { CATEGORY_COLORS, TRACK_LABELS } from '../lib/categories';
import { formatEventYears } from '../lib/time';
import { requestExplanation } from '../lib/aiExplain';

interface Props {
  event: HistEvent;
  byId: Map<string, HistEvent>;
  onClose: () => void;
  onSelect: (id: string) => void;
}

/** 사건 상세: 사실 / 해석 / 연결 사건 / 출처 (+ 선택적 AI 보조 설명) */
export function EventDetail({ event, byId, onClose, onSelect }: Props) {
  const [aiText, setAiText] = useState<string | null>(null);
  const [aiModel, setAiModel] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // 다른 사건으로 이동하면 AI 상태 초기화 + 모달에 포커스(접근성)
  useEffect(() => {
    setAiText(null);
    setAiModel(null);
    setAiError(null);
    setAiLoading(false);
    cardRef.current?.focus();
  }, [event.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const onGenerate = async () => {
    setAiLoading(true);
    setAiError(null);
    const r = await requestExplanation(event);
    setAiLoading(false);
    if (r.ok) {
      setAiText(r.text);
      setAiModel(r.model);
    } else {
      setAiError(r.message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-detail-title"
        tabIndex={-1}
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--border-strong)] bg-[var(--panel)] p-6 shadow-2xl focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[var(--chip-bg)] px-2.5 py-0.5 text-xs text-[var(--chip-fg)]">
                {TRACK_LABELS[event.track]}
                {event.region ? ` · ${event.region}` : ''}
              </span>
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                style={{ backgroundColor: CATEGORY_COLORS[event.category] }}
              >
                {event.category}
              </span>
              {event.contested && (
                <span className="rounded-full border px-2.5 py-0.5 text-xs" style={{ borderColor: 'var(--contested-border)', backgroundColor: 'var(--contested-bg)', color: 'var(--contested-fg)' }}>
                  연대·해석 논쟁
                </span>
              )}
            </div>
            <h2 id="event-detail-title" className="text-xl font-bold text-[var(--fg)]">
              {event.title}
            </h2>
            <p className="mt-1 text-sm text-[var(--fg-muted)]">{formatEventYears(event)}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--fg-muted)] hover:bg-[var(--panel-soft)] hover:text-[var(--fg)]"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* contested note */}
        {event.contested && event.contestedNote && (
          <p
            className="mb-4 rounded-lg border p-3 text-sm"
            style={{ borderColor: 'var(--contested-border)', backgroundColor: 'var(--contested-bg)', color: 'var(--contested-fg)' }}
          >
            ⚠ {event.contestedNote}
          </p>
        )}

        {/* 사실 */}
        <section
          className="mb-3 rounded-xl border p-4"
          style={{ borderColor: 'var(--fact-border)', backgroundColor: 'var(--fact-bg)' }}
        >
          <h3 className="mb-1.5 text-xs font-semibold tracking-wide text-[var(--fg-muted)]">
            사실 (객관적 기록)
          </h3>
          <p className="text-sm leading-relaxed text-[var(--fg)]">{event.description}</p>
        </section>

        {/* 해석 */}
        <section
          className="mb-4 rounded-xl border p-4"
          style={{ borderColor: 'var(--interp-border)', backgroundColor: 'var(--interp-bg)' }}
        >
          <h3 className="mb-1.5 text-xs font-semibold tracking-wide" style={{ color: 'var(--interp-fg)' }}>
            세계사적 의미 (해석)
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--interp-fg)' }}>
            {event.significance}
          </p>
        </section>

        {/* 연결 사건 */}
        {event.related && event.related.length > 0 && (
          <section className="mb-4">
            <h3 className="mb-2 text-xs font-semibold tracking-wide text-[var(--fg-muted)]">
              연결된 사건
            </h3>
            <ul className="space-y-2">
              {event.related.map((r) => {
                const other = byId.get(r.id);
                return (
                  <li key={r.id}>
                    <button
                      onClick={() => other && onSelect(r.id)}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] p-2.5 text-left transition-colors hover:border-[var(--border-strong)]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-[var(--chip-bg)] px-1.5 py-0.5 text-[10px] text-[var(--chip-fg)]">
                          {r.type}
                        </span>
                        <span className="text-sm font-medium text-[var(--fg)]">
                          {other ? other.title : r.id}
                        </span>
                      </div>
                      {r.note && <p className="mt-1 text-xs text-[var(--fg-muted)]">{r.note}</p>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* 출처 */}
        <section>
          <h3 className="mb-2 text-xs font-semibold tracking-wide text-[var(--fg-muted)]">출처</h3>
          <ul className="space-y-1 text-sm text-[var(--fg-muted)]">
            {event.sources.map((s, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="text-[var(--fg-subtle)]">·</span>
                {s.url ? (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-500 underline decoration-dotted hover:text-sky-400"
                  >
                    {s.label}
                  </a>
                ) : (
                  <span>{s.label}</span>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* AI 보조 설명 (실험적, 출처 없음) — 사실/출처와 시각적으로 분리 */}
        <section
          className="mt-4 rounded-xl border border-dashed p-4"
          style={{ borderColor: 'var(--ai-border)', backgroundColor: 'var(--ai-bg)' }}
        >
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold tracking-wide" style={{ color: 'var(--ai-fg)' }}>
              AI 보조 설명 · 실험적
            </h3>
            <span
              className="rounded-full border px-2 py-0.5 text-[10px]"
              style={{ borderColor: 'var(--ai-border)', color: 'var(--ai-fg)' }}
            >
              출처 없음
            </span>
          </div>
          <p className="mb-2 text-[11px] leading-relaxed text-[var(--fg-muted)]">
            위 ‘사실’과 ‘의미’를 쉽게 풀어주는 보조 설명입니다. AI가 생성하며 <b>출처가 없고</b> 오류가
            있을 수 있으니, 반드시 위의 사실·출처를 우선하세요.
          </p>
          {aiText ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: 'var(--ai-fg)' }}>
              {aiText}
            </p>
          ) : (
            <button
              onClick={onGenerate}
              disabled={aiLoading}
              className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-50"
              style={{ borderColor: 'var(--ai-border)', backgroundColor: 'var(--ai-bg)', color: 'var(--ai-fg)' }}
            >
              {aiLoading ? '생성 중…' : 'AI 보조 설명 생성'}
            </button>
          )}
          {aiError && <p className="mt-2 text-[11px] text-amber-500">⚠ {aiError}</p>}
          {aiText && aiModel && (
            <p className="mt-2 text-[10px] text-[var(--fg-subtle)]">모델: {aiModel} · AI 생성(출처 없음)</p>
          )}
        </section>
      </div>
    </div>
  );
}
