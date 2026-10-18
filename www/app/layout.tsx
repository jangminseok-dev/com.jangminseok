import type { Metadata } from "next";
import { Barlow_Condensed } from "next/font/google";
import localFont from "next/font/local";
import ChatDock from "@/components/chat/ChatDock";
import SiteAnalytics from "@/components/SiteAnalytics";
import "./globals.css";

// 글꼴은 자주 쓰는 한글 2,350자(KS X 1001)와 영문, 기호(✓ ✗ 포함)만 남긴 부분집합(2MB → 0.5MB)
const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

// 실측 숫자와 날짜에만 쓰는 숫자 전용 글꼴 — 제목은 본문과 같은 Pretendard의 가장 굵은 굵기를 쓴다
const numeral = Barlow_Condensed({ weight: ["600"], subsets: ["latin"], variable: "--font-num-src", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://jangminseok.com"),
  title: "장민석 포트폴리오",
  description: "LLM 서비스를 만들고, 만든 뒤에도 품질을 지키는 AI 서비스 개발자 장민석의 포트폴리오",
};

// 첫 그림 전에 테마를 정해 깜빡임을 막는다 — 기본은 다크, 버튼으로 라이트를 고른 방문자만 저장된 값을 쓴다
const THEME_SCRIPT = `try{document.documentElement.dataset.theme=localStorage.getItem("theme")||"dark"}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${pretendard.variable} ${numeral.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="font-sans">
        {children}
        <ChatDock />
        <SiteAnalytics />
      </body>
    </html>
  );
}
