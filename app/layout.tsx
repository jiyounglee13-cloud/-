import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "실손보험 이의신청 도우미 — 한국형 Fight Health Insurance",
  description:
    "비영리 실손의료보험 이의신청서 초안 작성 보조 도구. 판례 기반 RAG와 규제 순응형 프롬프트로 이의신청서 초안을 생성합니다.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
