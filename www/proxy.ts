import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { projectSlugFromHost } from "@/lib/host";
import { PROJECT_SLUGS } from "@/lib/slugs";

// {slug}.jangminseok.com/<path> → /p/{slug}/<path>
// {slug}.jangminseok.com/favicon.ico → /icons/{slug}.png (Safari는 SVG 파비콘 대신 favicon.ico를 쓴다)
export function proxy(request: NextRequest) {
  const slug = projectSlugFromHost(request.headers.get("host"), PROJECT_SLUGS);
  if (!slug) return NextResponse.next();
  const url = request.nextUrl.clone();
  if (url.pathname === "/favicon.ico") {
    url.pathname = `/icons/${slug}.png`;
    url.search = "";
    return NextResponse.rewrite(url);
  }
  url.pathname = `/p/${slug}${url.pathname === "/" ? "" : url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // 정적 자원(_next, 미디어, 폰트, 아이콘)과 챗봇 백엔드 경로(api/)는 rewrite하지 않는다. /favicon.ico는 위에서 프로젝트 아이콘으로 바꾼다
  matcher: ["/favicon.ico", "/((?!_next/|_vercel/|media/|api/|favicon|.*\\.(?:png|webp|jpg|mp4|svg|ico|woff2)$).*)"],
};
