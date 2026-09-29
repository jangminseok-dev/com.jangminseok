import LanguagePins from "@/components/home/LanguagePins";
import PreviewMedia from "@/components/home/PreviewMedia";
import { mediaUrl } from "@/lib/content/media";
import type { Project } from "@/lib/content/schema";
import { projectHref } from "@/lib/site";
import { byStartDate } from "@/lib/timeline";

function ProjectCard({ p, isProd }: { p: Project; isProd: boolean }) {
  return (
    <li className="h-full">
      <a
        href={projectHref(p.slug, isProd)}
        className="glass group flex h-full flex-col overflow-hidden rounded-3xl transition-transform hover:-translate-y-1"
      >
        <div className="relative">
          <PreviewMedia
            poster={mediaUrl(p.slug, p.preview.poster)}
            video={p.preview.video ? mediaUrl(p.slug, p.preview.video) : null}
            alt={`${p.title} 미리보기`}
          />
          <LanguagePins languages={p.languages} />
        </div>
        {/* 소개 길이가 달라도 같은 줄의 카드 높이가 맞도록 — 소개는 두 줄, 하단 정보는 바닥에 */}
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.accent }} />
            <h4 className="text-lg font-bold group-hover:text-brand-soft">{p.title}</h4>
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/75">{p.tagline}</p>
          <p className="mt-auto flex items-center gap-2 pt-3 text-xs text-white/55">
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
  const groups = [
    { title: "개인 프로젝트", items: projects.filter((p) => p.team.size === 1).sort(byStartDate) },
    { title: "팀 프로젝트", items: projects.filter((p) => p.team.size > 1).sort(byStartDate) },
  ];
  return (
    <section id="projects" className="mx-auto max-w-6xl px-5 py-16">
      <h2 className="text-2xl font-bold md:text-3xl">프로젝트</h2>
      {groups.map((g) => (
        <div key={g.title} className="mt-8">
          <h3 className="flex items-baseline gap-2 text-lg font-semibold text-white/90">
            {g.title}
            <span className="text-sm font-normal text-white/55">{g.items.length}개</span>
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
