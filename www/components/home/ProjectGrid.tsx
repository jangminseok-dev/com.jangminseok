import PreviewMedia from "@/components/home/PreviewMedia";
import { mediaUrl } from "@/lib/content/media";
import type { Project } from "@/lib/content/schema";
import { groupProjects, isWideCard } from "@/lib/projectGroups";
import { projectHref } from "@/lib/site";

function ProjectCard({ p, isProd, wide }: { p: Project; isProd: boolean; wide: boolean }) {
  const figure = p.page.overview.highlights[0];
  return (
    <li className={wide ? "h-full sm:col-span-2" : "h-full"}>
      <a
        href={projectHref(p.slug, isProd)}
        className={`glass group flex h-full flex-col overflow-hidden rounded-3xl ${wide ? "md:flex-row" : ""}`}
      >
        <div className={`relative ${wide ? "md:w-3/5" : ""}`}>
          <PreviewMedia
            poster={mediaUrl(p.slug, p.preview.poster)}
            video={p.preview.video ? mediaUrl(p.slug, p.preview.video) : null}
            alt={`${p.title} 미리보기`}
          />
          {/* 썸네일 위 핵심 기술 — 화면을 가리지 않게 오른쪽 위에 작게 */}
          <ul aria-label="핵심 기술" className="pointer-events-none absolute inset-x-3 top-3 flex flex-wrap justify-end gap-1.5">
            {p.tags.map((t) => (
              <li key={t} className="rounded-full border border-white/15 bg-night/80 px-2.5 py-1 text-sm font-medium leading-none text-white/90">
                {t}
              </li>
            ))}
          </ul>
        </div>
        {/* 소개 길이가 달라도 같은 줄의 카드 높이가 맞도록 — 하단 정보는 바닥에 */}
        <div className="flex flex-1 flex-col p-5 md:p-6">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.accent }} />
            <h4 className="text-xl font-bold group-hover:text-brand-soft">{p.title}</h4>
          </div>
          <p className={`mt-2 text-base leading-[1.7] text-white/85 ${wide ? "" : "line-clamp-2"}`}>{p.tagline}</p>
          <p className="mt-3 text-sm font-semibold tabular-nums">
            {figure.label} {figure.value}
          </p>
          <p className="mt-auto flex items-center gap-2 pt-4 text-sm text-white/70">
            <span className="shrink-0">{p.period.start.slice(0, 7)}</span>
            <span className="truncate rounded-full bg-(--accent)/15 px-2.5 py-1 font-medium text-white/85" style={{ ["--accent" as string]: p.accent }}>
              {p.page.overview.role}
            </span>
          </p>
        </div>
      </a>
    </li>
  );
}

export default function ProjectGrid({ projects, isProd }: { projects: Project[]; isProd: boolean }) {
  return (
    <section id="projects" className="mx-auto max-w-7xl px-5 py-16">
      <h2 className="text-2xl font-bold md:text-3xl">프로젝트</h2>
      {groupProjects(projects).map((g) => (
        <div key={g.title} className="mt-8">
          <h3 className="flex items-baseline gap-2 text-xl font-semibold text-white/90">
            {g.title}
            <span className="text-sm font-normal text-white/70">{g.items.length}개</span>
          </h3>
          <ul className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {g.items.map((p, i) => (
              <ProjectCard key={p.slug} p={p} isProd={isProd} wide={isWideCard(i, g.items.length)} />
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
