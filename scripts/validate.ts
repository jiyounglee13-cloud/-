import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { EventsSchema, type HistEvent } from '../src/types/event';

/**
 * 시드 데이터 무결성 검증 (CI 게이트).
 * - Zod 스키마 검증(타입·enum·필수 필드)
 * - 연대 오류(범위 역전·미래·상식 이탈)
 * - 출처 누락(모든 이벤트 최소 1개)
 * - contested 규칙(논쟁이면 범위 또는 근거 노트 필요)
 * - related 참조 무결성 + 우연 동시성 힌트
 * 오류가 하나라도 있으면 종료코드 1.
 */

const here = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(here, '../src/data/events.json');

const errors: string[] = [];
const warnings: string[] = [];
let count = 0;

// 1) 파일 읽기 + JSON 파싱
let json: unknown;
try {
  json = JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
} catch (e) {
  console.error(`✗ 데이터 파일 읽기/파싱 실패 (${DATA_PATH})\n  ${(e as Error).message}`);
  process.exit(1);
}

// 2) 스키마 검증
const parsed = EventsSchema.safeParse(json);
if (!parsed.success) {
  for (const issue of parsed.error.issues) {
    errors.push(`스키마 위반 [${issue.path.join('.') || '(root)'}]: ${issue.message}`);
  }
  report();
  process.exit(1);
}

const events: HistEvent[] = parsed.data;
count = events.length;
const ids = new Set<string>();
const CURRENT_YEAR = new Date().getFullYear();

// 3) 개별 규칙
for (const e of events) {
  if (ids.has(e.id)) errors.push(`중복 id: ${e.id}`);
  ids.add(e.id);

  if (e.yearStart < 1 || e.yearStart > 4000) {
    warnings.push(`${e.id}: yearStart(${e.yearStart})가 상식 범위(1–4000)를 벗어남`);
  }
  if (e.era === 'CE' && e.yearStart > CURRENT_YEAR) {
    errors.push(`${e.id}: CE 연도(${e.yearStart})가 미래임`);
  }
  if (e.yearEnd != null) {
    // BCE는 숫자가 클수록 이른 시기 → 부호 있는 연도로 순서 검사
    const s = e.era === 'BCE' ? -e.yearStart : e.yearStart;
    const en = e.era === 'BCE' ? -e.yearEnd : e.yearEnd;
    if (en < s) {
      errors.push(
        `${e.id}: 연대 순서 오류 — 종료(${e.era} ${e.yearEnd})가 시작(${e.era} ${e.yearStart})보다 이르다`,
      );
    }
  }
  if (e.sources.length === 0) {
    errors.push(`${e.id}: 출처(sources)가 없음 — 모든 연대에 출처 필요`);
  }
  if (e.contested && e.yearEnd == null && !e.contestedNote) {
    errors.push(`${e.id}: contested=true 이면 범위(yearEnd) 또는 contestedNote가 필요`);
  }
  if (!e.contested && e.contestedNote) {
    warnings.push(`${e.id}: contested=false 인데 contestedNote가 있음`);
  }
}

// 4) related 참조 무결성 + 우연 동시성 힌트
const byId = new Map(events.map((e) => [e.id, e]));
for (const e of events) {
  for (const r of e.related ?? []) {
    if (r.id === e.id) {
      errors.push(`${e.id}: related가 자기 자신을 참조`);
      continue;
    }
    const other = byId.get(r.id);
    if (!other) {
      errors.push(`${e.id}: related.id '${r.id}'가 존재하지 않는 이벤트를 참조`);
      continue;
    }
    if (
      (r.type === '인과' || r.type === '영향') &&
      other.era === e.era &&
      other.yearStart === e.yearStart &&
      !r.note
    ) {
      warnings.push(
        `${e.id} → ${r.id}: 같은 해(${e.yearStart})를 '${r.type}'로 연결. 우연적 동시성이 아닌지 확인하고 note를 추가하세요.`,
      );
    }
  }
}

report();
process.exit(errors.length > 0 ? 1 : 0);

function report() {
  console.log('');
  console.log('══════════════════════════════════════════');
  console.log('  세계사 타임라인 데이터 검증');
  console.log(`   • 이벤트 수 : ${count}`);
  console.log(`   • 오류      : ${errors.length}`);
  console.log(`   • 경고      : ${warnings.length}`);
  console.log('══════════════════════════════════════════');
  if (warnings.length) {
    console.log('\n[경고]');
    for (const w of warnings) console.log(`  ⚠ ${w}`);
  }
  if (errors.length) {
    console.log('\n[오류]');
    for (const er of errors) console.log(`  ✗ ${er}`);
    console.log('\n검증 실패 ✗\n');
  } else {
    console.log('\n검증 통과 ✓\n');
  }
}
