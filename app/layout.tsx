import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "echo — 기억은 대화로 살아납니다",
  description: "소중한 카카오톡 대화 기록으로 그리운 사람의 기억을 되살립니다. 그 사람이 아직 거기 있어요.",
  keywords: "카카오톡, AI, 기억, 대화, 추억, echo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body style={{ background: "#07090f" }}>
        {children}
      </body>
    </html>
  );
}
