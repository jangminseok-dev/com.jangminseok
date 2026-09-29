import type { Metadata } from "next";
import localFont from "next/font/local";
import ChatLauncher from "@/components/chat/ChatLauncher";
import "./globals.css";

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
        <ChatLauncher />
      </body>
    </html>
  );
}
