import { z } from 'zod';

/**
 * 데이터 모델의 단일 소스(single source of truth).
 * 이 Zod 스키마에서 TypeScript 타입과 런타임 검증을 모두 파생한다.
 * 앱(런타임 로드)과 검증 스크립트(scripts/validate.ts)가 동일 스키마를 공유한다.
 */

export const TRACKS = ['europe', 'eastasia', 'south_asia_islam', 'korea'] as const;
export const CATEGORIES = ['정치', '전쟁', '문화', '과학기술', '종교', '경제'] as const;
export const ERAS = ['BCE', 'CE'] as const;
// '동시대(무관)' = 같은 시기이지만 인과·영향 관계가 아님을 명시(우연적 동시성)
export const RELATION_TYPES = ['인과', '영향', '동시대(무관)'] as const;

export const SourceSchema = z.object({
  label: z.string().min(1), // 출처명(문헌/사전/기관 + 항목)
  url: z.string().url().optional(), // 안정적 링크가 있을 때만(없으면 생략 — 지어내지 않음)
});

export const RelationSchema = z.object({
  id: z.string().min(1),
  type: z.enum(RELATION_TYPES),
  note: z.string().optional(),
});

export const HistEventSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    era: z.enum(ERAS),
    yearStart: z.number().int(),
    yearEnd: z.number().int().optional(), // 범위 없으면 생략
    track: z.enum(TRACKS),
    category: z.enum(CATEGORIES),
    importance: z.number().int().min(1).max(5), // 줌/필터용
    description: z.string().min(1), // 객관적 사실만
    significance: z.string().min(1), // 세계사적 의미·해석 (사실과 혼용 금지)
    sources: z.array(SourceSchema).min(1), // 모든 이벤트에 최소 1개(검증에서 강제)
    contested: z.boolean(), // 연대·해석 논쟁 여부
    contestedNote: z.string().optional(), // 무엇이 논쟁인지
    region: z.string().optional(), // 트랙 내 세부(예: 남아시아·이슬람 → 압바스/무굴/굽타)
    related: z.array(RelationSchema).optional(),
  })
  .strict(); // 스키마에 없는 키가 있으면 오류(오타·잉여 필드 탐지)

export const EventsSchema = z.array(HistEventSchema);

export type Track = (typeof TRACKS)[number];
export type Category = (typeof CATEGORIES)[number];
export type Era = (typeof ERAS)[number];
export type RelationType = (typeof RELATION_TYPES)[number];
export type Source = z.infer<typeof SourceSchema>;
export type Relation = z.infer<typeof RelationSchema>;
export type HistEvent = z.infer<typeof HistEventSchema>;
