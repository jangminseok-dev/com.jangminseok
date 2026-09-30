import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import ChatDock from "@/components/chat/ChatDock";
import "./globals.css";

// 글꼴은 자주 쓰는 한글 2,350자(KS X 1001)와 영문, 기호(✓ ✗ 포함)만 남긴 부분집합(2MB → 0.5MB)
const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jangminseok.com"),
  title: "장민석 포트폴리오",
  description: "검색과 RAG로 답을 찾는 백엔드 개발자 장민석의 포트폴리오",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="font-sans">
        {children}
        <ChatDock />
        <Analytics />
      </body>
    </html>
  );
}
