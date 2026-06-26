"use client";

import { useState } from "react";
import type { AppealInput, DisputeCategory } from "@/lib/types";

const CATEGORIES: { value: DisputeCategory; label: string; hint: string }[] = [
  {
    value: "cataract",
    label: "백내장(다초점렌즈) 입원 분쟁",
    hint: "예: 다초점렌즈 삽입술이 외모개선·통원이라며 입원 의료비를 거절",
  },
  {
    value: "manual_therapy",
    label: "도수치료 과잉진료 분쟁",
    hint: "예: 치료 횟수 초과·효과 미검증을 이유로 과잉진료 부지급",
  },
  {
    value: "knee_stemcell",
    label: "무릎 줄기세포(BMAC) 입원 분쟁",
    hint: "예: 시술 후 입원 필요성을 인정하지 않아 입원 의료비 거절",
  },
  {
    value: "medical_advisory",
    label: "보험사 의료자문 강요 대응",
    hint: "예: 제3 의료기관 서면 의료자문 결과를 근거로 면책 처리",
  },
  { value: "general", label: "기타 일반 부지급", hint: "그 밖의 보험금 지급 거절" },
];

const EXAMPLE: Partial<Record<DisputeCategory, Partial<AppealInput>>> = {
  knee_stemcell: {
    diagnosis: "양측 무릎 골관절염, BMAC(자가골수 줄기세포) 주사 시술",
    treatmentDate: "2026-03-12",
    claimAmount: "3,200,000",
    rejectionReason:
      "시술 후 단순 경과관찰에 불과하여 입원의 의학적 필요성이 인정되지 않으므로 입원 의료비는 부지급함. 의료자문 결과 통원 치료로 충분.",
    patientFacts:
      "고혈압으로 5년간 아스피린을 복용 중이며, 시술 직후 무릎 부종이 심하게 발생함.",
    vitalSigns:
      "시술 직후 혈압 162/100mmHg로 급상승, 의무기록상 의료진의 지속 관찰 지시가 기재됨.",
  },
};

type RetrievedCase = { citation: string; title: string };

export default function Home() {
  const [category, setCategory] = useState<DisputeCategory>("knee_stemcell");
  const [form, setForm] = useState<Omit<AppealInput, "category">>({
    diagnosis: "",
    treatmentDate: "",
    claimAmount: "",
    rejectionReason: "",
    patientFacts: "",
    vitalSigns: "",
  });
  const [output, setOutput] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [cases, setCases] = useState<RetrievedCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selected = CATEGORIES.find((c) => c.value === category)!;

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function loadExample() {
    const ex = EXAMPLE[category];
    if (!ex) return;
    setForm((f) => ({ ...f, ...ex }));
  }

  async function generate() {
    setLoading(true);
    setError("");
    setOutput("");
    setBlocked(false);
    setCases([]);

    const payload: AppealInput = { category, ...form };

    try {
      const res = await fetch("/api/appeal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("Content-Type") || "";

      // 가드레일 차단 / 오류 → JSON 응답
      if (contentType.includes("application/json")) {
        const data = await res.json();
        if (data.blocked) {
          setBlocked(true);
          setOutput(data.message);
          setCases(data.retrieved || []);
        } else {
          setError(data.error || "알 수 없는 오류가 발생했습니다.");
        }
        setLoading(false);
        return;
      }

      // 출처 헤더 파싱
      const header = res.headers.get("X-Retrieved-Cases");
      if (header) {
        try {
          setCases(JSON.parse(decodeURIComponent(header)));
        } catch {
          /* noop */
        }
      }

      // 스트리밍 본문
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          setOutput((prev) => prev + decoder.decode(value, { stream: true }));
        }
      }
    } catch (e: any) {
      setError(e?.message || "네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function copyOutput() {
    navigator.clipboard.writeText(output);
  }

  const canSubmit = form.diagnosis.trim() && form.rejectionReason.trim() && !loading;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8">
        <p className="text-sm font-semibold text-brand">
          한국형 Fight Health Insurance · 비영리
        </p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
          실손보험 이의신청서 초안 도우미
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          판례 기반 검색(RAG)과 규제 순응형 프롬프트로 이의신청서{" "}
          <strong>초안</strong>을 구성합니다. 본 도구는 변호사·손해사정사가 아니며,
          법률·의학 자문을 제공하지 않습니다.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 입력 영역 */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">사건 정보 입력</h2>

          <label className="mb-1 block text-sm font-medium">분쟁 유형</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as DisputeCategory)}
            className="mb-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <p className="mb-4 text-xs text-slate-500">{selected.hint}</p>

          <Field
            label="병명 / 진단명 *"
            value={form.diagnosis}
            onChange={(v) => update("diagnosis", v)}
            placeholder="예: 양측 무릎 골관절염, BMAC 시술"
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="진료(시술)일"
              value={form.treatmentDate}
              onChange={(v) => update("treatmentDate", v)}
              placeholder="2026-03-12"
            />
            <Field
              label="청구 의료비(원)"
              value={form.claimAmount}
              onChange={(v) => update("claimAmount", v)}
              placeholder="3,200,000"
            />
          </div>
          <Field
            label="보험사 거절 사유 * (거절 통지서 발췌)"
            value={form.rejectionReason}
            onChange={(v) => update("rejectionReason", v)}
            placeholder="예: 입원의 의학적 필요성 불인정, 의료자문 결과 통원으로 충분"
            textarea
          />
          <Field
            label="기저질환 등 사실관계"
            value={form.patientFacts}
            onChange={(v) => update("patientFacts", v)}
            placeholder="예: 고혈압으로 아스피린 장기 복용 중"
            textarea
          />
          <Field
            label="생체 징후 등 객관 증빙 (의무기록)"
            value={form.vitalSigns || ""}
            onChange={(v) => update("vitalSigns", v)}
            placeholder="예: 시술 직후 혈압 162/100mmHg 급상승, 지속 관찰 지시 기재"
            textarea
          />

          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={generate}
              disabled={!canSubmit}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "생성 중…" : "이의신청서 초안 생성"}
            </button>
            {EXAMPLE[category] && (
              <button
                onClick={loadExample}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                예시 채우기
              </button>
            )}
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </section>

        {/* 출력 영역 */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {blocked ? "보상 배제 안내" : "이의신청서 초안"}
            </h2>
            {output && !blocked && (
              <button
                onClick={copyOutput}
                className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
              >
                복사
              </button>
            )}
          </div>

          {cases.length > 0 && (
            <div className="mb-3 rounded-lg bg-brand-light p-3">
              <p className="mb-1 text-xs font-semibold text-brand-dark">
                참조된 판례·근거 (RAG)
              </p>
              <ul className="space-y-1 text-xs text-slate-700">
                {cases.map((c, i) => (
                  <li key={i}>
                    <span className="font-medium">{c.citation}</span> — {c.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div
            className={`min-h-[300px] whitespace-pre-wrap rounded-lg border p-4 text-sm leading-relaxed ${
              blocked
                ? "border-amber-300 bg-amber-50 text-amber-900"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            {output || (
              <span className="text-slate-400">
                좌측에 사건 정보를 입력한 뒤 ‘이의신청서 초안 생성’을 누르면
                여기에 결과가 표시됩니다.
              </span>
            )}
            {loading && <span className="ml-0.5 animate-pulse">▋</span>}
          </div>
        </section>
      </div>

      <footer className="mt-8 border-t border-slate-200 pt-4 text-xs leading-relaxed text-slate-500">
        <p>
          ⚠️ 본 서비스는 비영리 문서 서식 작성 보조 도구입니다. 생성된 문서는
          공인된 판례 데이터를 기계적으로 매핑한 초안일 뿐 법률·의학 자문이
          아니며, 제출 전 반드시 본인의 의무기록·사실관계와 대조하시기 바랍니다.
        </p>
      </footer>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <div className="mb-3">
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
      )}
    </div>
  );
}
