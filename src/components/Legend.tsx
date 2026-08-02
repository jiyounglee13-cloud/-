import { CATEGORIES } from '../types/event';
import { CATEGORY_COLORS } from '../lib/categories';

/** 카테고리 색 + '사실 vs 해석' 색 규칙 안내 */
export function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-300">
      <span className="font-semibold text-slate-200">카테고리</span>
      {CATEGORIES.map((c) => (
        <span key={c} className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: CATEGORY_COLORS[c] }}
          />
          {c}
        </span>
      ))}
      <span className="mx-1 h-4 w-px bg-slate-700" />
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-sm bg-slate-600" /> 사실
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-sm bg-indigo-500" /> 해석(의미)
      </span>
    </div>
  );
}
