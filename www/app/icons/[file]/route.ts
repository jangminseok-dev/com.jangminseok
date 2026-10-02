import { getProject, getProjects } from "@/lib/content";

// 프로젝트 파비콘 /icons/{slug}.svg — 루트 icon.svg와 같은 별 모양에 프로젝트 accent 색만 바꾼다.
// .svg 확장자라 서브도메인 rewrite(proxy.ts matcher)에서 빠진다.
export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map((p) => ({ file: `${p.slug}.svg` }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const project = getProject(file.replace(/\.svg$/, ""));
  if (!project) return new Response(null, { status: 404 });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0b0d18"/><path d="M32 9C33.8 24 40 30.2 55 32C40 33.8 33.8 40 32 55C30.2 40 24 33.8 9 32C24 30.2 30.2 24 32 9Z" fill="${project.accent}"/></svg>`;
  return new Response(svg, { headers: { "Content-Type": "image/svg+xml" } });
}
