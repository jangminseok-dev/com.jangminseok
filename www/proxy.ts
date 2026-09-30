import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { projectSlugFromHost } from "@/lib/host";
import { PROJECT_SLUGS } from "@/lib/slugs";

// {slug}.jangminseok.com/<path> → /p/{slug}/<path>
export function proxy(request: NextRequest) {
  const slug = projectSlugFromHost(request.headers.get("host"), PROJECT_SLUGS);
  if (!slug) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = `/p/${slug}${url.pathname === "/" ? "" : url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // 정적 자원(_next, 미디어, 폰트, 파비콘)과 챗봇 백엔드 경로(api/)는 rewrite하지 않는다
  matcher: ["/((?!_next/|_vercel/|media/|api/|favicon|.*\\.(?:png|webp|jpg|mp4|svg|ico|woff2)$).*)"],
};
