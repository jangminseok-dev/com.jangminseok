import Slide from "@/components/slides/Slide";
import { mediaUrl } from "@/lib/content/media";
import type { Project } from "@/lib/content/schema";

export default function SlideIntro({ project, mainHref }: { project: Project; mainHref: string }) {
  const { slug, preview, period, team } = project;
  return (
    <Slide n={1}>
      <a href={mainHref} className="text-sm text-white/60 hover:text-white">
        ← 전체 프로젝트
      </a>
      <div className="mt-6 grid grid-cols-1 items-center gap-10 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-(--accent)">01. 한 줄로 보는 {project.title}</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight md:text-6xl">{project.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-white/80 md:text-xl">{project.tagline}</p>
          <dl className="mt-8 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-2xl border border-slide-line bg-slide-panel p-4">
              <dt className="text-white/50">기간</dt>
              <dd className="mt-1 font-semibold">
                {period.start} ~ {period.end ?? "진행 중"}
              </dd>
            </div>
            <div className="rounded-2xl border border-slide-line bg-slide-panel p-4">
              <dt className="text-white/50">팀 · 역할</dt>
              <dd className="mt-1 font-semibold">
                {team.size}명 · {team.role}
              </dd>
            </div>
          </dl>
          <ul className="mt-4 flex flex-wrap gap-2">
            {project.stack.map((s) => (
              <li key={s} className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/85">
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="overflow-hidden rounded-3xl border border-slide-line bg-slide-panel">
            {preview.video ? (
              <video
                src={mediaUrl(slug, preview.video)}
                poster={mediaUrl(slug, preview.poster)}
                autoPlay
                muted
                loop
                playsInline
                className="aspect-video w-full object-cover motion-reduce:hidden"
              />
            ) : null}
            <img
              src={mediaUrl(slug, preview.poster)}
              alt={`${project.title} 대표 화면`}
              className={`aspect-video w-full object-cover object-top ${preview.video ? "hidden motion-reduce:block" : ""}`}
            />
          </div>
          {preview.demo ? (
            <a
              href={mediaUrl(slug, preview.demo)}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-(--accent) px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              ▶ 전체 시연 영상 보기 (소리 있음)
            </a>
          ) : null}
        </div>
      </div>
      <p className="mt-10 text-center text-sm text-white/40">↓ 스크롤 또는 ← → 키로 넘기기</p>
    </Slide>
  );
}
