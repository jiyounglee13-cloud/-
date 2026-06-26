import { retrieve } from "../lib/rag";
import type { AppealInput } from "../lib/types";

const cases: { name: string; input: AppealInput }[] = [
  {
    name: "무릎 줄기세포 + 생체징후",
    input: {
      category: "knee_stemcell",
      diagnosis: "무릎 골관절염 BMAC 시술",
      treatmentDate: "2026-03-12",
      claimAmount: "3200000",
      rejectionReason: "입원 필요성 불인정, 의료자문 결과 통원으로 충분",
      patientFacts: "고혈압 아스피린 복용",
      vitalSigns: "시술 직후 혈압 162/100mmHg 급상승",
    },
  },
  {
    name: "백내장 다초점렌즈",
    input: {
      category: "cataract",
      diagnosis: "노년백내장 다초점렌즈 삽입술",
      treatmentDate: "2026-04-02",
      claimAmount: "8800000",
      rejectionReason: "외모개선 목적, 6시간 관찰 불필요로 통원 처리",
      patientFacts: "홍채섬모체염 기저질환 보유",
      vitalSigns: "",
    },
  },
  {
    name: "도수치료",
    input: {
      category: "manual_therapy",
      diagnosis: "경추간판장애 도수치료 20회",
      treatmentDate: "2026-03-18",
      claimAmount: "2000000",
      rejectionReason: "횟수 초과 과잉진료, 사후 서면 의료자문 결과",
      patientFacts: "치료 후 ROM 호전",
      vitalSigns: "",
    },
  },
  {
    name: "가드레일: 본인부담상한제",
    input: {
      category: "general",
      diagnosis: "감기",
      treatmentDate: "",
      claimAmount: "",
      rejectionReason: "본인부담상한제 사후환급금 해당",
      patientFacts: "공단에서 환급받음",
      vitalSigns: "",
    },
  },
];

for (const c of cases) {
  const r = retrieve(c.input);
  console.log(`\n### ${c.name}`);
  if (r.triggeredExclusions.length) {
    console.log(
      "  [가드레일 발동]",
      r.triggeredExclusions.map((e) => `${e.name} (${e.citation})`).join(", "),
    );
  }
  r.entries.forEach((e, i) =>
    console.log(`  ${i + 1}. [${e.category}] ${e.title} — ${e.citation}`),
  );
}
