import PreviewMedia from "@/components/home/PreviewMedia";
import { mediaUrl } from "@/lib/content/media";
import type { Project } from "@/lib/content/schema";
import { projectHref } from "@/lib/site";

export default function ProjectGrid({ projects, isProd }: { projects: Project[]; isProd: boolean }) {
  return (
    <section id="projects" className="mx-auto max-w-6xl scroll-mt-8 px-5 py-16">
      <h2 className="text-2xl font-bold md:text-3xl">프로젝트</h2>
      <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {projects.map((p) => (
          <li key={p.slug}>
            <a
              href={projectHref(p.slug, isProd)}
              className="glass group block overflow-hidden rounded-3xl transition-transform hover:-translate-y-1"
            >
              <PreviewMedia
                poster={mediaUrl(p.slug, p.preview.poster)}
                video={p.preview.video ? mediaUrl(p.slug, p.preview.video) : null}
                alt={`${p.title} 미리보기`}
              />
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.accent }} />
                  <h3 className="text-lg font-bold group-hover:text-brand-soft">{p.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/75">{p.tagline}</p>
                <p className="mt-3 text-xs text-white/50">
                  {p.period.start.slice(0, 7)} · {p.team.size}명 · {p.team.role}
                </p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
