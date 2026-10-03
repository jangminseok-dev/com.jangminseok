import PreviewMedia from "@/components/home/PreviewMedia";
import { mediaUrl } from "@/lib/content/media";
import type { Project } from "@/lib/content/schema";
import { groupProjects } from "@/lib/projectGroups";
import { projectHref } from "@/lib/site";

function ProjectCard({ p, isProd }: { p: Project; isProd: boolean }) {
  const figure = p.page.overview.highlights[0];
  return (
    <li className="h-full">
      <a
        href={projectHref(p.slug, isProd)}
        className="glass group flex h-full flex-col overflow-hidden rounded-3xl"
      >
        <div className="relative">
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
          <p className="mt-2 line-clamp-2 text-base leading-[1.7] text-white/85">{p.tagline}</p>
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
  const teamCount = projects.filter((p) => p.team.size > 1).length;
  const counts = [
    { label: "총 프로젝트", value: projects.length },
    { label: "개인 프로젝트", value: projects.length - teamCount },
    { label: "팀 프로젝트", value: teamCount },
  ];
  return (
    <section id="projects" className="mx-auto max-w-7xl px-5 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold md:text-3xl">프로젝트</h2>
        <dl className="grid w-full max-w-md grid-cols-3 gap-3">
          {counts.map((c) => (
            <div key={c.label} className="glass rounded-2xl px-4 py-3">
              <dd className="text-2xl font-bold tabular-nums">{c.value}</dd>
              <dt className="mt-0.5 text-sm text-white/70">{c.label}</dt>
            </div>
          ))}
        </dl>
      </div>
      {groupProjects(projects).map((g) => (
        <div key={g.title} className="mt-8">
          <h3 className="flex items-baseline gap-2 text-xl font-semibold text-white/90">
            {g.title}
            <span className="text-sm font-normal text-white/70">{g.items.length}개</span>
          </h3>
          <ul className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {g.items.map((p) => (
              <ProjectCard key={p.slug} p={p} isProd={isProd} />
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
