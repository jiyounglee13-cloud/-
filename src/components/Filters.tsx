import { CATEGORIES, type Category } from '../types/event';
import { CATEGORY_COLORS } from '../lib/categories';

export interface FilterState {
  q: string;
  cats: Category[];
  minImp: number;
  yearFrom: string;
  yearTo: string;
}

export const EMPTY_FILTER: FilterState = { q: '', cats: [], minImp: 1, yearFrom: '', yearTo: '' };

interface Props {
  value: FilterState;
  onChange: (next: FilterState) => void;
  shown: number;
  total: number;
}

/** 시대(연도)·카테고리·중요도 필터 + 검색 */
export function Filters({ value, onChange, shown, total }: Props) {
  const toggleCat = (c: Category) => {
    const has = value.cats.includes(c);
    onChange({ ...value, cats: has ? value.cats.filter((x) => x !== c) : [...value.cats, c] });
  };
  const isFiltered =
    value.q !== '' ||
    value.cats.length > 0 ||
    value.minImp > 1 ||
    value.yearFrom !== '' ||
    value.yearTo !== '';

  const inputCls =
    'rounded border border-[var(--border-strong)] bg-[var(--panel)] px-2 py-1 text-[var(--fg)] placeholder:text-[var(--fg-subtle)] focus:border-[var(--fg-subtle)] focus:outline-none';

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <input
          type="search"
          value={value.q}
          onChange={(e) => onChange({ ...value, q: e.target.value })}
          placeholder="검색 (제목·설명·의미·지역)"
          aria-label="사건 검색"
          className={`w-56 ${inputCls}`}
        />

        <span className="mx-1 h-4 w-px bg-[var(--border-strong)]" />

        {CATEGORIES.map((c) => {
          const active = value.cats.includes(c);
          return (
            <button
              key={c}
              onClick={() => toggleCat(c)}
              aria-pressed={active}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${
                active
                  ? 'border-transparent text-white'
                  : 'border-[var(--border-strong)] text-[var(--fg-muted)] hover:bg-[var(--panel)]'
              }`}
              style={active ? { backgroundColor: CATEGORY_COLORS[c] } : undefined}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: active ? '#ffffff' : CATEGORY_COLORS[c] }}
              />
              {c}
            </button>
          );
        })}

        <span className="mx-1 h-4 w-px bg-[var(--border-strong)]" />

        <label className="flex items-center gap-1 text-[var(--fg-muted)]">
          중요도 ≥
          <select
            value={value.minImp}
            onChange={(e) => onChange({ ...value, minImp: Number(e.target.value) })}
            className="rounded border border-[var(--border-strong)] bg-[var(--panel)] px-1.5 py-1 text-[var(--fg)] focus:outline-none"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-1 text-[var(--fg-muted)]">
          시대(연도)
          <input
            value={value.yearFrom}
            onChange={(e) => onChange({ ...value, yearFrom: e.target.value })}
            inputMode="numeric"
            placeholder="from"
            aria-label="시대 시작 연도 (BCE는 음수)"
            className={`w-16 ${inputCls}`}
          />
          <span className="text-[var(--fg-subtle)]">–</span>
          <input
            value={value.yearTo}
            onChange={(e) => onChange({ ...value, yearTo: e.target.value })}
            inputMode="numeric"
            placeholder="to"
            aria-label="시대 종료 연도 (BCE는 음수)"
            className={`w-16 ${inputCls}`}
          />
        </label>

        <span className="mx-1 h-4 w-px bg-[var(--border-strong)]" />

        <span className="text-[var(--fg-muted)]">
          표시 {shown} / {total}
        </span>
        {isFiltered && (
          <button
            onClick={() => onChange(EMPTY_FILTER)}
            className="rounded border border-[var(--border-strong)] px-2 py-1 text-[var(--fg-muted)] hover:bg-[var(--panel)]"
          >
            필터 초기화
          </button>
        )}
      </div>
    </div>
  );
}
