import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { scaleLinear } from 'd3-scale';
import type { ScaleLinear } from 'd3-scale';
import type { HistEvent, RelationType } from '../types/event';
import { CATEGORY_COLORS, TRACK_LABELS, TRACK_ORDER } from '../lib/categories';
import { eventEndSigned, eventStartSigned, formatEventYears, formatSignedYear } from '../lib/time';
import { dataExtent, packRows } from '../lib/layout';
import { useElementSize } from '../hooks/useElementSize';

interface Props {
  events: HistEvent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  focusYear: number;
  onFocusYear: (year: number) => void;
  showAllLinks: boolean;
}

const MARGIN = { left: 132, right: 28, top: 52, bottom: 24 };
const LANE_HEIGHT = 132;
const ROW_HEIGHT = 30;
const LANE_TOP_GAP = 30;
const MIN_SPAN = 8;
const MAX_SPAN = 4000;

interface View {
  min: number;
  max: number;
}

/** 연결 관계 타입별 선 스타일 */
export function linkStyle(type: RelationType): { stroke: string; dash?: string; width: number } {
  switch (type) {
    case '인과':
      return { stroke: '#f43f5e', width: 2 };
    case '영향':
      return { stroke: '#38bdf8', dash: '6 4', width: 1.75 };
    case '동시대(무관)':
      return { stroke: '#94a3b8', dash: '2 5', width: 1.5 };
  }
}

/**
 * 4레인 가로 타임라인 (D3는 스케일 계산만, SVG는 React가 렌더).
 * 휠: 확대/축소 · 드래그: 좌우 이동 · hover: 포커스 라인/연결선 · 클릭: 상세.
 */
export function Timeline({
  events,
  selectedId,
  onSelect,
  focusYear,
  onFocusYear,
  showAllLinks,
}: Props) {
  const { ref, width } = useElementSize<HTMLDivElement>();
  const w = Math.max(width, 320);
  const narrow = w < 560;
  const ML = narrow ? 84 : 132; // 좁은 화면: 좌측 레인 이름 여백 축소
  const plotHeight = LANE_HEIGHT * TRACK_ORDER.length;
  const height = MARGIN.top + plotHeight + MARGIN.bottom;
  const plotWidth = Math.max(0, w - ML - MARGIN.right);

  const extent = useMemo(() => dataExtent(events), [events]);
  const initialView = useMemo<View>(() => {
    const pad = Math.max(20, (extent.max - extent.min) * 0.06);
    return { min: extent.min - pad, max: extent.max + pad };
  }, [extent]);

  // 초기 뷰는 마운트 시 1회만 적용(필터로 events가 바뀌어도 뷰를 리셋하지 않음).
  // 필터 후 전체 프레임을 다시 보려면 '전체 보기' 버튼 사용.
  const [view, setView] = useState<View>(initialView);

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [panning, setPanning] = useState(false);

  const viewRef = useRef(view);
  viewRef.current = view;
  const geomRef = useRef({ w, left: ML, right: MARGIN.right });
  geomRef.current = { w, left: ML, right: MARGIN.right };

  const x: ScaleLinear<number, number> = useMemo(
    () => scaleLinear().domain([view.min, view.max]).range([ML, w - MARGIN.right]),
    [view, w],
  );

  const clampView = useCallback((min: number, max: number): View => {
    let span = max - min;
    const center = (min + max) / 2;
    if (span < MIN_SPAN) span = MIN_SPAN;
    else if (span > MAX_SPAN) span = MAX_SPAN;
    return { min: center - span / 2, max: center + span / 2 };
  }, []);

  // 휠 확대/축소 (passive:false)
  const svgRef = useRef<SVGSVGElement | null>(null);
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      const g = geomRef.current;
      const v = viewRef.current;
      const rect = svg.getBoundingClientRect();
      const px = ev.clientX - rect.left;
      const r0 = g.left;
      const r1 = g.w - g.right;
      const t = Math.min(1, Math.max(0, (px - r0) / Math.max(1, r1 - r0)));
      const cursorYear = v.min + t * (v.max - v.min);
      const factor = ev.deltaY > 0 ? 1.15 : 1 / 1.15;
      const newSpan = (v.max - v.min) * factor;
      setView(clampView(cursorYear - t * newSpan, cursorYear + (1 - t) * newSpan));
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, [clampView]);

  const drag = useRef<{
    startX: number;
    startMin: number;
    startMax: number;
    pointerId: number;
    captured: boolean;
  } | null>(null);
  const movedRef = useRef(false);

  const clientXToYear = (clientX: number): number | null => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const px = clientX - rect.left;
    if (px < ML || px > w - MARGIN.right) return null;
    return x.invert(px);
  };

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    movedRef.current = false;
    drag.current = {
      startX: e.clientX,
      startMin: view.min,
      startMax: view.max,
      pointerId: e.pointerId,
      captured: false,
    };
    const fy = clientXToYear(e.clientX);
    if (fy != null) onFocusYear(fy);
  };
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d) {
      const fy = clientXToYear(e.clientX);
      if (fy != null) onFocusYear(fy);
      return;
    }
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 3) {
      movedRef.current = true;
      if (!d.captured) {
        try {
          e.currentTarget.setPointerCapture(d.pointerId);
        } catch {
          /* noop */
        }
        d.captured = true;
        setPanning(true);
      }
    }
    const span = d.startMax - d.startMin;
    const dyear = (dx / Math.max(1, plotWidth)) * span;
    setView(clampView(d.startMin - dyear, d.startMax - dyear));
  };
  const endDrag = () => {
    drag.current = null;
    setPanning(false);
  };

  const resetView = () => setView(initialView);
  const zoomBy = (factor: number) => {
    const c = (view.min + view.max) / 2;
    const span = (view.max - view.min) * factor;
    setView(clampView(c - span / 2, c + span / 2));
  };

  const guardedSelect = (id: string) => {
    if (!movedRef.current) onSelect(id);
  };

  const ticks = useMemo(() => {
    const raw = x.ticks(Math.max(4, Math.floor(w / 120)));
    const seen = new Set<number>();
    const out: number[] = [];
    for (const t of raw) {
      const r = Math.round(t);
      if (!seen.has(r)) {
        seen.add(r);
        out.push(r);
      }
    }
    return out;
  }, [x, w]);

  // 마커 배치(서브행 패킹) + 위치 맵(연결선용)
  const layout = useMemo(() => {
    const positions = new Map<string, { cx: number; cy: number }>();
    // 라벨 밀도 조절: 픽셀/연이 작을수록(줌아웃·모바일) 높은 중요도의 라벨만 표시
    const pxPerYear = x(1) - x(0);
    const labelThreshold = pxPerYear > 3 ? 1 : pxPerYear > 1.2 ? 3 : pxPerYear > 0.6 ? 4 : 5;
    const lanes = TRACK_ORDER.map((track, i) => {
      const laneTop = MARGIN.top + i * LANE_HEIGHT;
      const items = events
        .filter((e) => e.track === track)
        .map((e) => {
          const startSigned = eventStartSigned(e);
          const endSigned = eventEndSigned(e);
          const x0 = x(startSigned);
          const hasRange = e.yearEnd != null && endSigned > startSigned;
          const x1 = hasRange ? x(endSigned) : x0;
          const r = 3 + e.importance;
          const markerRight = hasRange ? Math.max(x1, x0 + 6) : x0 + r;
          const label = e.title.length > 16 ? e.title.slice(0, 15) + '…' : e.title;
          const labelW = label.length * 8 + 8;
          const labelAuto = e.importance >= labelThreshold;
          const wpx = markerRight - x0 + (labelAuto ? 6 + labelW : 4);
          return { e, x0, x1, hasRange, r, markerRight, label, labelAuto, wpx };
        });
      const rows = packRows(items.map((it) => ({ x0: it.x0, wpx: it.wpx })));
      const rowCount = rows.length ? Math.max(...rows) + 1 : 1;
      const usable = LANE_HEIGHT - LANE_TOP_GAP - 8;
      const effRow = Math.min(ROW_HEIGHT, usable / rowCount);
      const placed = items.map((it, idx) => {
        const cy = laneTop + LANE_TOP_GAP + rows[idx] * effRow + effRow / 2;
        positions.set(it.e.id, { cx: it.x0, cy });
        return { ...it, cy };
      });
      return { track, items: placed };
    });
    return { positions, lanes };
  }, [events, x]);

  // 그릴 연결선 계산 (활성 사건 = hover 우선, 없으면 선택)
  const activeId = hoveredId ?? selectedId;
  const links = useMemo(() => {
    const out: {
      a: string;
      b: string;
      type: RelationType;
      note?: string;
      active: boolean;
    }[] = [];
    const seen = new Set<string>();
    for (const e of events) {
      for (const r of e.related ?? []) {
        const isActive = activeId != null && (e.id === activeId || r.id === activeId);
        if (!showAllLinks && !isActive) continue;
        if (!layout.positions.has(e.id) || !layout.positions.has(r.id)) continue;
        const key = [e.id, r.id].sort().join('|') + '|' + r.type;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ a: e.id, b: r.id, type: r.type, note: r.note, active: isActive });
      }
    }
    return out;
  }, [events, showAllLinks, activeId, layout]);

  return (
    <div className="w-full">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <button
          onClick={() => zoomBy(1 / 1.4)}
          className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800"
        >
          ＋ 확대
        </button>
        <button
          onClick={() => zoomBy(1.4)}
          className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800"
        >
          － 축소
        </button>
        <button
          onClick={resetView}
          className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800"
        >
          전체 보기
        </button>
        <span className="ml-1">휠: 확대/축소 · 드래그: 이동 · 사건 hover: 연결선 · 클릭: 상세</span>
      </div>

      <div
        ref={ref}
        className="w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40"
      >
        <svg
          ref={svgRef}
          className="timeline-svg block"
          width={w}
          height={height}
          role="group"
          aria-label="세계사 4문화권 타임라인. 휠로 확대·축소, 드래그로 이동, 사건은 클릭 또는 Enter 키로 상세 보기."
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          style={{ cursor: panning ? 'grabbing' : 'grab' }}
        >
          <defs>
            <clipPath id="plot-clip">
              <rect x={ML} y={MARGIN.top} width={plotWidth} height={plotHeight} />
            </clipPath>
          </defs>

          {/* 레인 배경 + 이름 */}
          {TRACK_ORDER.map((track, i) => {
            const y0 = MARGIN.top + i * LANE_HEIGHT;
            return (
              <g key={track}>
                <rect
                  x={0}
                  y={y0}
                  width={w}
                  height={LANE_HEIGHT}
                  fill={i % 2 === 0 ? '#0f172a' : '#111a2e'}
                />
                <line x1={0} y1={y0} x2={w} y2={y0} stroke="#1e293b" strokeWidth={1} />
                <text x={12} y={y0 + 22} fill="#94a3b8" fontSize={narrow ? 11 : 13} fontWeight={600}>
                  {TRACK_LABELS[track]}
                </text>
              </g>
            );
          })}

          {/* 세로 눈금선 + 연도 라벨 */}
          {ticks.map((t) => {
            const px = x(t);
            if (px < ML - 1 || px > w - MARGIN.right + 1) return null;
            return (
              <g key={t}>
                <line
                  x1={px}
                  y1={MARGIN.top}
                  x2={px}
                  y2={MARGIN.top + plotHeight}
                  stroke="#1e293b"
                  strokeWidth={1}
                />
                <text x={px} y={MARGIN.top - 14} fill="#64748b" fontSize={11} textAnchor="middle">
                  {formatSignedYear(t)}
                </text>
              </g>
            );
          })}

          {/* 축 기준선 */}
          <line
            x1={ML}
            y1={MARGIN.top - 6}
            x2={w - MARGIN.right}
            y2={MARGIN.top - 6}
            stroke="#334155"
            strokeWidth={1}
          />

          {/* 동시대 포커스 라인 */}
          {(() => {
            const fx = x(focusYear);
            if (fx < ML || fx > w - MARGIN.right) return null;
            const label = formatSignedYear(focusYear);
            const boxW = Math.max(44, label.length * 9 + 16);
            return (
              <g pointerEvents="none">
                <line
                  x1={fx}
                  y1={MARGIN.top - 6}
                  x2={fx}
                  y2={MARGIN.top + plotHeight}
                  stroke="#fbbf24"
                  strokeWidth={1.5}
                  strokeDasharray="5 3"
                  opacity={0.9}
                />
                <rect
                  x={fx - boxW / 2}
                  y={MARGIN.top + plotHeight + 4}
                  width={boxW}
                  height={18}
                  rx={9}
                  fill="#fbbf24"
                />
                <text
                  x={fx}
                  y={MARGIN.top + plotHeight + 17}
                  fontSize={11}
                  fontWeight={700}
                  fill="#0b1120"
                  textAnchor="middle"
                >
                  {label}
                </text>
              </g>
            );
          })()}

          {/* 사건 간 연결선 */}
          <g clipPath="url(#plot-clip)" pointerEvents="none">
            {links.map((lk, i) => {
              const p1 = layout.positions.get(lk.a)!;
              const p2 = layout.positions.get(lk.b)!;
              const mx = (p1.cx + p2.cx) / 2;
              const d = `M ${p1.cx} ${p1.cy} C ${mx} ${p1.cy}, ${mx} ${p2.cy}, ${p2.cx} ${p2.cy}`;
              const st = linkStyle(lk.type);
              const opacity = lk.active ? 0.95 : showAllLinks ? 0.25 : 0.9;
              return (
                <g key={`${lk.a}-${lk.b}-${i}`}>
                  <path
                    d={d}
                    fill="none"
                    stroke={st.stroke}
                    strokeWidth={lk.active ? st.width + 0.75 : st.width}
                    strokeDasharray={st.dash}
                    opacity={opacity}
                    strokeLinecap="round"
                  />
                  {lk.active && !showAllLinks && (
                    <g>
                      <rect
                        x={mx - 34}
                        y={(p1.cy + p2.cy) / 2 - 9}
                        width={68}
                        height={16}
                        rx={8}
                        fill="#0b1120"
                        stroke={st.stroke}
                        strokeWidth={1}
                        opacity={0.95}
                      />
                      <text
                        x={mx}
                        y={(p1.cy + p2.cy) / 2 + 3}
                        fontSize={10}
                        fontWeight={600}
                        fill={st.stroke}
                        textAnchor="middle"
                      >
                        {lk.type}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* 레인별 마커 */}
          {layout.lanes.map((lane) => (
            <g key={lane.track} clipPath="url(#plot-clip)">
              {lane.items.map((it) => {
                const color = CATEGORY_COLORS[it.e.category];
                const isSel = selectedId === it.e.id;
                const isHov = hoveredId === it.e.id;
                const active = isSel || isHov;
                const labelX = it.markerRight + 6;
                return (
                  <g
                    key={it.e.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${it.e.title}, ${formatEventYears(it.e)}, ${TRACK_LABELS[it.e.track]}, ${it.e.category}`}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      guardedSelect(it.e.id);
                    }}
                    onKeyDown={(ev) => {
                      if (ev.key === 'Enter' || ev.key === ' ') {
                        ev.preventDefault();
                        onSelect(it.e.id);
                      }
                    }}
                    onMouseEnter={() => setHoveredId(it.e.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onFocus={() => setHoveredId(it.e.id)}
                    onBlur={() => setHoveredId(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {it.hasRange ? (
                      <rect
                        x={it.x0}
                        y={it.cy - 5}
                        width={Math.max(6, it.x1 - it.x0)}
                        height={10}
                        rx={4}
                        fill={color}
                        opacity={active ? 1 : 0.82}
                        stroke={isSel ? '#ffffff' : 'none'}
                        strokeWidth={isSel ? 1.5 : 0}
                      />
                    ) : (
                      <circle
                        cx={it.x0}
                        cy={it.cy}
                        r={active ? it.r + 1.5 : it.r}
                        fill={color}
                        opacity={active ? 1 : 0.88}
                        stroke={isSel ? '#ffffff' : '#0b1120'}
                        strokeWidth={isSel ? 2 : 1}
                      />
                    )}
                    {(it.labelAuto || active) && (
                      <text
                        x={labelX}
                        y={it.cy + 4}
                        fontSize={11}
                        fill={active ? '#f1f5f9' : '#cbd5e1'}
                        fontWeight={active ? 600 : 400}
                      >
                        {it.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
