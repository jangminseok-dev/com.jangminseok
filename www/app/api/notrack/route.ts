import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { OPT_OUT_COOKIE } from "@/lib/analytics";

const ONE_YEAR_SEC = 60 * 60 * 24 * 365;

// 이 주소를 한 번 열면 그 브라우저의 방문은 집계에서 빠진다 — 서브도메인까지 같은 쿠키를 보도록 상위 도메인에 심는다
// 브라우저 스크립트가 아니라 서버가 심어야 Safari가 7일 뒤에 지우지 않는다
export function GET(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/", request.url));
  const host = (request.headers.get("host") ?? "").split(":")[0];
  res.cookies.set(OPT_OUT_COOKIE, "1", {
    path: "/",
    maxAge: ONE_YEAR_SEC,
    sameSite: "lax",
    secure: host.endsWith("jangminseok.com"),
    ...(host.endsWith("jangminseok.com") && { domain: ".jangminseok.com" }),
  });
  return res;
}
