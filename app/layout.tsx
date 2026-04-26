import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: "echo — 기억은 대화로 살아납니다",
  description: "소중한 카카오톡 대화 기록으로 그리운 사람의 기억을 되살립니다. 그 사람이 아직 거기 있어요.",
  keywords: "카카오톡, AI, 기억, 대화, 추억, echo",
  metadataBase: new URL("https://minghaus.vercel.app"),
  openGraph: {
    title: "echo — 기억은 대화로 살아납니다",
    description: "그리운 사람이 아직 거기 있어요. 카카오톡 대화 기록으로 그 사람의 목소리를 되살립니다.",
    url: "https://minghaus.vercel.app",
    siteName: "echo",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "echo — 기억은 대화로 살아납니다",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "echo — 기억은 대화로 살아납니다",
    description: "그리운 사람이 아직 거기 있어요.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body style={{ background: "#07090f" }}>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-7EFEEZKJQX" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-7EFEEZKJQX');
        `}</Script>
        {children}
      </body>
    </html>
  );
}
