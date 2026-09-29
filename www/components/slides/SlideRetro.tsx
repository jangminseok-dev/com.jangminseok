import Slide from "@/components/slides/Slide";
import type { Project } from "@/lib/content/schema";
import { slideAnchor } from "@/lib/slides";

const LINK_LABEL: Record<keyof Project["links"], string> = {
  blog: "개발 블로그 보기",
  site: "원본 사이트",
  repo: "GitHub",
};

export default function SlideRetro({ n, project, mainHref }: { n: number; project: Project; mainHref: string }) {
  const links = (Object.keys(LINK_LABEL) as (keyof Project["links"])[]).flatMap((key) => {
    const url = project.links[key];
    return url ? [{ key, url }] : [];
  });
  return (
    <Slide n={n}>
      <h2 className="text-3xl font-bold md:text-5xl">
        <span className="text-(--accent)">{slideAnchor(n)}.</span> 결과와 회고
      </h2>
      {project.retro.metrics.length ? (
        <dl className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {project.retro.metrics.map((m) => (
            <div key={m.label} className="rounded-2xl border border-slide-line bg-slide-panel p-5">
              <dt className="text-sm text-white/60">{m.label}</dt>
              <dd className="mt-2 text-2xl font-bold text-(--accent)">{m.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {project.retro.regrets.length ? (
        <div className="mt-6 rounded-2xl border border-slide-line bg-slide-panel p-5">
          <h3 className="font-semibold">아쉬운 점 · 다음에 할 것</h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-white/85">
            {project.retro.regrets.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="mt-8 flex flex-wrap gap-3">
        {links.map(({ key, url }) => (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-(--accent) px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            {LINK_LABEL[key]}
          </a>
        ))}
        <a href={mainHref} className="rounded-full bg-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/20">
          다른 프로젝트 보기
        </a>
      </div>
    </Slide>
  );
}
