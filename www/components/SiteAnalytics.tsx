"use client";

import { Analytics } from "@vercel/analytics/next";
import { isOptedOut } from "@/lib/analytics";

// 집계 제외 쿠키가 있는 브라우저(본인)의 방문은 보내지 않는다
export default function SiteAnalytics() {
  return <Analytics beforeSend={(event) => (isOptedOut(document.cookie) ? null : event)} />;
}
