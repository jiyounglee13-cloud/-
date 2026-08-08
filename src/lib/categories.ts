import type { Category, Track } from '../types/event';

/** 카테고리 = 색 (마커·범례 공통) */
export const CATEGORY_COLORS: Record<Category, string> = {
  정치: '#3b82f6', // blue
  전쟁: '#ef4444', // red
  문화: '#a855f7', // violet
  과학기술: '#14b8a6', // teal
  종교: '#f59e0b', // amber
  경제: '#ec4899', // pink
};

export const TRACK_LABELS: Record<Track, string> = {
  europe: '유럽',
  eastasia: '동아시아',
  south_asia_islam: '남아시아·이슬람',
  korea: '한국',
};

/** 위 → 아래 레인 순서 */
export const TRACK_ORDER: Track[] = ['europe', 'eastasia', 'south_asia_islam', 'korea'];
