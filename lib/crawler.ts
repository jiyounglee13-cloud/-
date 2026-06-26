import type { DisputeCategory, KnowledgeEntry } from "./types";
import { scrub } from "./scrub";

/**
 * 판례·분쟁조정례 수집(크롤링) 추상화.
 *
 * 실제 수집 대상(금융감독원 분쟁조정, 대법원 종합법률정보, 한국소비자원)은
 * 네트워크·이용약관·저작권 등 법적·기술적 검토가 선행되어야 하므로, 본
 * 모듈은 교체 가능한 CaseSource 인터페이스와 오프라인에서 동작하는 로컬
 * fixture 소스만 구현한다. 원격 소스 어댑터는 인터페이스 골격만 제공한다.
 *
 * 파이프라인: fetchRaw → scrub(PII 제거) → extractEntry(구조화) → data/incoming
 */

export interface RawDoc {
  sourceId: string;
  docId: string;
  title: string;
  url?: string;
  text: string;
}

export interface CaseSource {
  readonly id: string;
  fetchRaw(): Promise<RawDoc[]>;
}

// ── 카테고리·논거 추론 휴리스틱 ────────────────────────────────────

function inferCategory(text: string): DisputeCategory {
  if (/백내장|다초점|인공수정체/.test(text)) return "cataract";
  if (/도수치료/.test(text)) return "manual_therapy";
  if (/줄기세포|bmac|골수/i.test(text)) return "knee_stemcell";
  if (/의료자문|서면\s?심사|동시감정/.test(text)) return "medical_advisory";
  return "general";
}

/** 피보험자(소비자)에게 유리한 결론인지 휴리스틱 판정 */
function inferFavorsConsumer(text: string): boolean {
  const pro = (text.match(/인정|지급하라|원고\s?승소|취소한다|위법/g) || []).length;
  const con = (text.match(/기각|면책|부지급(?:이?\s?정당)|불인정/g) || []).length;
  return pro >= con;
}

/** 사건번호/출처 추출 */
function extractCitation(text: string): string {
  const court = text.match(
    /(대법원|[가-힣]+(?:지방|고등)법원)\s*\d{4}[.\s]*\d{0,2}[.\s]*\d{0,2}[.\s]*(?:선고)?\s*\d{4}[가-힣]{1,3}\d+/,
  );
  if (court) return court[0].replace(/\s+/g, " ").trim();
  const fss = text.match(/금융감독원\s*분쟁조정\s*(?:제)?\s*\d{4}-\d+호?/);
  if (fss) return fss[0].replace(/\s+/g, " ").trim();
  return "(출처 미상 — 검증 필요)";
}

/** 핵심 판시사항 후보 문장 추출 (판단/인정 관련 문장 우선) */
function extractHolding(text: string): string {
  const body = text
    .split("\n")
    .filter((line) => !line.trim().startsWith("#")) // 마크다운 제목 제외
    .join("\n");
  const sentences = body
    .replace(/\n+/g, " ")
    .split(/(?<=[.。])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const scored = sentences
    .map((s) => ({
      s,
      score:
        (/판단|판시|인정|필요성|약관|입원|자문/.test(s) ? 2 : 0) +
        (/법원[은이]|판단하(였|여야)|보았다|인정(하|되)/.test(s) ? 2 : 0) +
        (s.length > 30 && s.length < 220 ? 1 : 0) -
        // 사건번호만 담긴 인용 문장 배제
        (/\d{4}[가-힣]{1,3}\d+/.test(s) && s.length < 40 ? 3 : 0) -
        // 익명화된 메타데이터(인적사항) 줄 배제
        ((s.match(/\[(이름|전화번호|주민등록번호|이메일|등록번호|계좌번호)\]/g) || [])
          .length * 2),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return (scored[0]?.s || sentences[0] || "").slice(0, 220);
}

function extractKeywords(text: string): string[] {
  const dict = [
    "백내장", "다초점", "인공수정체", "도수치료", "경추간판장애",
    "줄기세포", "bmac", "골수", "입원", "통원", "의료자문", "동시감정",
    "기저질환", "고혈압", "생체징후", "약관", "과잉진료", "주치의",
  ];
  const lower = text.toLowerCase();
  const found = dict.filter((k) => lower.includes(k.toLowerCase()));
  return found.length ? Array.from(new Set(found)) : ["실손보험"];
}

function slugId(citation: string): string {
  let h = 0;
  for (let i = 0; i < citation.length; i++) h = (Math.imul(h, 31) + citation.charCodeAt(i)) | 0;
  return `kb-crawled-${(h >>> 0).toString(36)}`;
}

/** 원문(RawDoc) → 익명화 → KnowledgeEntry 후보로 구조화 */
export function extractEntry(raw: RawDoc): KnowledgeEntry {
  const { text } = scrub(raw.text); // PII 제거 후 구조화
  const citation = extractCitation(text);
  return {
    id: slugId(citation + raw.docId),
    category: inferCategory(text),
    title: raw.title.trim().slice(0, 80) || "(제목 미상)",
    citation,
    holding: extractHolding(text),
    favorsConsumer: inferFavorsConsumer(text),
    keywords: extractKeywords(text),
  };
}

// ── 소스 어댑터 ────────────────────────────────────────────────────

/** 로컬 fixture 디렉터리(data/fixtures/*.txt)에서 원문을 읽는 소스 (오프라인 동작) */
export class LocalFixtureSource implements CaseSource {
  readonly id = "local-fixture";
  constructor(private dir: string) {}

  async fetchRaw(): Promise<RawDoc[]> {
    const { existsSync, readdirSync, readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    if (!existsSync(this.dir)) return [];
    return readdirSync(this.dir)
      .filter((f) => f.endsWith(".txt"))
      .map((f) => {
        const text = readFileSync(join(this.dir, f), "utf-8");
        const title = text.split("\n")[0]?.replace(/^#\s*/, "") || f;
        return { sourceId: this.id, docId: f, title, text };
      });
  }
}

/** HTML → 평문 텍스트 변환 (태그 제거, 블록 요소는 줄바꿈) */
export function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/(p|div|br|h[1-6]|li|tr|article|section)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]*\n+/g, "\n")
    .trim();
}

/** robots.txt 의 User-agent:* 규칙으로 해당 경로 수집 허용 여부 판정 */
export async function isAllowedByRobots(url: string): Promise<boolean> {
  try {
    const u = new URL(url);
    const res = await fetch(`${u.origin}/robots.txt`);
    if (!res.ok) return true; // robots.txt 없음 → 허용
    const lines = (await res.text()).split(/\r?\n/).map((l) => l.trim());
    let applies = false;
    const disallows: string[] = [];
    for (const line of lines) {
      if (/^user-agent:/i.test(line)) {
        applies = line.split(":")[1].trim() === "*";
      } else if (applies && /^disallow:/i.test(line)) {
        const p = line.split(":").slice(1).join(":").trim();
        if (p) disallows.push(p);
      } else if (line === "") {
        applies = false;
      }
    }
    return !disallows.some((d) => u.pathname.startsWith(d));
  } catch {
    return true;
  }
}

/**
 * HTTP(S) 원격 소스 — robots.txt를 준수하여 공개 페이지를 수집한다.
 *
 * 안전 수칙: 수집 대상은 이용약관·저작권·robots 검토를 통과한 공개 출처여야
 * 하며, 요청 간 지연(politeness delay)과 식별 가능한 User-Agent를 사용한다.
 * 본 구현은 그 메커니즘(robots 확인 → fetch → HTML 평문화)을 제공한다.
 */
export class HttpCaseSource implements CaseSource {
  readonly id = "http";
  constructor(
    private urls: string[],
    private opts?: { userAgent?: string; delayMs?: number },
  ) {}

  async fetchRaw(): Promise<RawDoc[]> {
    const out: RawDoc[] = [];
    const ua = this.opts?.userAgent ?? "silson-fhi-crawler/0.1 (+research)";
    for (const url of this.urls) {
      if (!(await isAllowedByRobots(url))) {
        console.warn(`[http] robots.txt 금지 — 건너뜀: ${url}`);
        continue;
      }
      const res = await fetch(url, { headers: { "User-Agent": ua } });
      if (!res.ok) {
        console.warn(`[http] HTTP ${res.status} — 건너뜀: ${url}`);
        continue;
      }
      const text = htmlToText(await res.text());
      const title = (text.split("\n")[0] || url).slice(0, 80);
      out.push({ sourceId: this.id, docId: url, title, url, text });
      if (this.opts?.delayMs) await new Promise((r) => setTimeout(r, this.opts!.delayMs));
    }
    return out;
  }
}

/**
 * 원격 소스 어댑터 골격 (네트워크·법적 검토 필요).
 * 실제 구현 시 robots/이용약관 준수, 요청 제한, 인증을 추가해야 한다.
 */
export class RemoteCaseSource implements CaseSource {
  constructor(
    readonly id: string,
    private endpoint?: string,
  ) {}

  async fetchRaw(): Promise<RawDoc[]> {
    if (!this.endpoint) {
      console.warn(
        `[${this.id}] endpoint 미설정 — 원격 수집 건너뜀(no-op). 실 연동은 법적·기술 검토 후 구현.`,
      );
      return [];
    }
    throw new Error(`[${this.id}] 원격 수집 어댑터는 아직 구현되지 않았습니다.`);
  }
}
