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
    'rounded border border-slate-700 bg-slate-950 px-2 py-1 text-slate-200 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none';

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <input
          type="search"
          value={value.q}
          onChange={(e) => onChange({ ...value, q: e.target.value })}
          placeholder="검색 (제목·설명·의미·지역)"
          aria-label="사건 검색"
          className={`w-56 ${inputCls}`}
        />

        <span className="mx-1 h-4 w-px bg-slate-700" />

        {CATEGORIES.map((c) => {
          const active = value.cats.includes(c);
          return (
            <button
              key={c}
              onClick={() => toggleCat(c)}
              aria-pressed={active}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${
                active ? 'border-transparent text-white' : 'border-slate-700 text-slate-300 hover:bg-slate-800'
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

        <span className="mx-1 h-4 w-px bg-slate-700" />

        <label className="flex items-center gap-1 text-slate-300">
          중요도 ≥
          <select
            value={value.minImp}
            onChange={(e) => onChange({ ...value, minImp: Number(e.target.value) })}
            className="rounded border border-slate-700 bg-slate-950 px-1.5 py-1 text-slate-200 focus:outline-none"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-1 text-slate-300">
          시대(연도)
          <input
            value={value.yearFrom}
            onChange={(e) => onChange({ ...value, yearFrom: e.target.value })}
            inputMode="numeric"
            placeholder="from"
            aria-label="시대 시작 연도 (BCE는 음수)"
            className={`w-16 ${inputCls}`}
          />
          <span className="text-slate-500">–</span>
          <input
            value={value.yearTo}
            onChange={(e) => onChange({ ...value, yearTo: e.target.value })}
            inputMode="numeric"
            placeholder="to"
            aria-label="시대 종료 연도 (BCE는 음수)"
            className={`w-16 ${inputCls}`}
          />
        </label>

        <span className="mx-1 h-4 w-px bg-slate-700" />

        <span className="text-slate-400">
          표시 {shown} / {total}
        </span>
        {isFiltered && (
          <button
            onClick={() => onChange(EMPTY_FILTER)}
            className="rounded border border-slate-700 px-2 py-1 text-slate-300 hover:bg-slate-800"
          >
            필터 초기화
          </button>
        )}
      </div>
    </div>
  );
}
