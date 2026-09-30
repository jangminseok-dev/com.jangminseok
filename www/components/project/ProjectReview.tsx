import TechChip from "@/components/home/TechChip";
import { mediaUrl } from "@/lib/content/media";
import type { Project, ProjectPage } from "@/lib/content/schema";
import { stackIconSlug } from "@/lib/icons";

// 프로젝트 소개 페이지 v2 — 한눈에, 주요 기능, 아키텍처, 맡은 일, 어려웠던 점, 회고 (서버 컴포넌트)
// anchor: 챗봇 근거 링크와 요건 카드가 쓰는 섹션 번호 (lib/content/schema.ts SECTION_ANCHORS)
const SECTIONS = [
  { id: "overview", anchor: "01", label: "한눈에" },
  { id: "features", anchor: "02", label: "주요 기능" },
  { id: "architecture", anchor: "03", label: "아키텍처" },
  { id: "role", anchor: "04", label: "맡은 일" },
  { id: "troubles", anchor: "05", label: "어려웠던 점" },
  { id: "retro", anchor: "06", label: "회고" },
] as const;

const anchorOf = (id: string) => SECTIONS.find((s) => s.id === id)?.anchor ?? "";

type Props = { project: Project; mainHref: string };
type Figure = ProjectPage["retro"]["metrics"][number];

function projectLinks(project: Project): { href: string; label: string }[] {
  const { links, preview, slug } = project;
  return [
    { href: preview.demo ? mediaUrl(slug, preview.demo) : undefined, label: "시연 영상" },
    { href: links.site, label: "서비스 보기" },
    { href: links.repo, label: "GitHub" },
    { href: links.blog, label: "개발 블로그" },
  ].filter((b): b is { href: string; label: string } => Boolean(b.href));
}

function LinkButtons({ project }: { project: Project }) {
  return (
    <div className="flex flex-wrap gap-2">
      {projectLinks(project).map((b, i) => (
        <a
          key={b.label}
          href={b.href}
          target="_blank"
          rel="noreferrer"
          className={`rounded-full px-4 py-2 text-sm font-semibold hover:opacity-90 ${
            i === 0 ? "bg-(--accent) text-black" : "glass text-white"
          }`}
        >
          {b.label}
        </a>
      ))}
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-32 py-14">
      <span id={anchorOf(id)} aria-hidden className="block scroll-mt-32" />
      <h2 className="text-2xl font-bold md:text-3xl">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function FigureCard({ f }: { f: Figure }) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-3xl font-bold text-(--accent)">{f.value}</p>
      <p className="mt-2 font-semibold">{f.label}</p>
      {f.note ? <p className="mt-1 text-sm text-white/60">{f.note}</p> : null}
    </div>
  );
}

function Overview({ project, mainHref }: Props) {
  const { slug, preview, period, team, page } = project;
  return (
    <section id="overview" className="scroll-mt-32 pt-10 pb-14">
      <span id="01" aria-hidden className="block scroll-mt-32" />
      <a href={mainHref} className="text-sm text-white/70 hover:text-white">
        ← 전체 프로젝트
      </a>
      <div className="mt-6 grid grid-cols-1 items-start gap-10 md:grid-cols-2">
        <div>
          <h1 className="flex items-center gap-3 text-4xl font-bold md:text-5xl">
            <span className="h-3 w-3 rounded-full bg-(--accent)" />
            {project.title}
          </h1>
          <p className="mt-3 font-semibold text-(--accent)">{page.overview.role}</p>
          <p className="mt-5 text-lg leading-relaxed md:text-xl">{page.overview.what}</p>
          <p className="mt-3 leading-relaxed text-white/75">{page.overview.why}</p>
          <p className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/65">
            <span>
              {period.start} ~ {period.end ?? "진행 중"}
            </span>
            <span>{team.size === 1 ? "개인 프로젝트" : `${team.size}인 팀`}</span>
          </p>
          <div className="mt-6">
            <LinkButtons project={project} />
          </div>
        </div>
        <div className="glass overflow-hidden rounded-3xl">
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
      </div>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {page.overview.highlights.map((f) => (
          <FigureCard key={f.label} f={f} />
        ))}
      </div>
    </section>
  );
}

function Features({ slug, page }: { slug: string; page: ProjectPage }) {
  const core = page.features.filter((f) => f.core);
  const rest = page.features.filter((f) => !f.core);
  return (
    <Section id="features" title="주요 기능">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {core.map((f) => (
          <article key={f.title} className="glass overflow-hidden rounded-3xl">
            {f.image ? (
              <img src={mediaUrl(slug, f.image)} alt={f.title} className="aspect-video w-full object-cover object-top" />
            ) : null}
            <div className="p-5">
              <p className="text-xs font-semibold text-(--accent)">핵심 기능</p>
              <h3 className="mt-1 text-lg font-bold">{f.title}</h3>
              <p className="mt-2 leading-relaxed text-white/80">{f.body}</p>
            </div>
          </article>
        ))}
      </div>
      {rest.length ? (
        <ul className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          {rest.map((f) => (
            <li key={f.title} className="glass overflow-hidden rounded-2xl">
              {f.image ? (
                <img src={mediaUrl(slug, f.image)} alt={f.title} className="aspect-video w-full object-cover object-top" />
              ) : null}
              <div className="p-5">
                <h3 className="font-bold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/75">{f.body}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      {page.featureNote ? <p className="mt-4 text-sm text-white/55">{page.featureNote}</p> : null}
    </Section>
  );
}

function Architecture({ slug, page }: { slug: string; page: ProjectPage }) {
  const a = page.architecture;
  return (
    <Section id="architecture" title="아키텍처">
      <p className="max-w-4xl text-lg leading-relaxed text-white/85">{a.summary}</p>
      <div className="glass mt-6 overflow-hidden rounded-3xl">
        <img src={mediaUrl(slug, a.image)} alt="전체 구조 도식" className="w-full" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {a.points.map((p) => (
          <div key={p.title} className="glass rounded-2xl p-5">
            <h3 className="font-bold">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/80">{p.body}</p>
          </div>
        ))}
      </div>
      <dl className="mt-6 space-y-3">
        {a.layers.map((l) => (
          <div key={l.name} className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <dt className="w-28 shrink-0 text-sm text-white/60">{l.name}</dt>
            <dd className="flex flex-wrap gap-2">
              {l.items.map((s) => (
                <TechChip key={s} name={s} icon={stackIconSlug(s) ?? undefined} />
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

function Role({ page }: { page: ProjectPage }) {
  const r = page.role;
  return (
    <Section id="role" title="맡은 일">
      <p className="max-w-4xl leading-relaxed text-white/85">{r.summary}</p>
      <div className={`mt-6 grid grid-cols-1 gap-4 ${r.team.length ? "md:grid-cols-2" : ""}`}>
        <div className="glass rounded-2xl p-5">
          <h3 className="font-bold text-(--accent)">제가 한 일</h3>
          <ul className="mt-3 space-y-2">
            {r.mine.map((m) => (
              <li key={m} className="flex gap-2 leading-relaxed">
                <span className="text-(--accent)">✓</span>
                {m}
              </li>
            ))}
          </ul>
        </div>
        {r.team.length ? (
          <div className="glass rounded-2xl p-5">
            <h3 className="font-bold text-white/70">팀원이 한 일</h3>
            <ul className="mt-3 space-y-2 text-white/75">
              {r.team.map((m) => (
                <li key={m} className="flex gap-2 leading-relaxed">
                  <span aria-hidden>•</span>
                  {m}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
      {r.collab.length || r.ai.length ? (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {[
            { title: "협업 방식", items: r.collab },
            { title: "AI 도구를 쓴 방식", items: r.ai },
          ]
            .filter((b) => b.items.length)
            .map((b) => (
              <div key={b.title} className="glass rounded-2xl p-5">
                <h3 className="font-bold">{b.title}</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-white/80">
                  {b.items.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      ) : null}
    </Section>
  );
}

const TROUBLE_PARTS = [
  ["problem", "문제"],
  ["cause", "원인"],
  ["solution", "해결"],
  ["result", "결과"],
] as const;

function Troubles({ page }: { page: ProjectPage }) {
  return (
    <Section id="troubles" title="어려웠던 점과 해결">
      <ol className="space-y-5">
        {page.troubles.map((t, i) => (
          <li key={t.title} className="glass rounded-3xl p-6">
            <h3 className="text-lg font-bold">
              <span className="mr-2 text-(--accent)">{i + 1}.</span>
              {t.title}
            </h3>
            <dl className="mt-4 space-y-3">
              {TROUBLE_PARTS.map(([key, label]) =>
                t[key] ? (
                  <div key={key} className="grid grid-cols-1 gap-1 sm:grid-cols-[4rem_1fr]">
                    <dt className={`text-sm font-semibold ${key === "result" ? "text-(--accent)" : "text-white/60"}`}>
                      {label}
                    </dt>
                    <dd className="leading-relaxed text-white/85">{t[key]}</dd>
                  </div>
                ) : null,
              )}
            </dl>
            {t.detail ? <p className="mt-4 rounded-xl bg-white/5 p-3 text-sm leading-relaxed text-white/70">{t.detail}</p> : null}
            {t.evidence.length ? (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                <span className="text-white/55">코드로 확인</span>
                {t.evidence.map((e) => (
                  <a
                    key={e.url}
                    href={e.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-white/10 px-3 py-1 text-white/85 hover:bg-white/20"
                  >
                    {e.label} ↗
                  </a>
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </Section>
  );
}

function Retro({ project, mainHref }: Props) {
  const { page } = project;
  return (
    <Section id="retro" title="성과와 회고">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {page.retro.metrics.map((f) => (
          <FigureCard key={f.label} f={f} />
        ))}
      </div>
      {page.retro.learned.length ? (
        <div className="glass mt-6 rounded-2xl p-5">
          <h3 className="font-bold text-(--accent)">배운 점</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-white/85">
            {page.retro.learned.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="glass mt-4 rounded-2xl p-5">
        <h3 className="font-bold">아쉬운 점과 다음에 할 것</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-white/80">
          {page.retro.regrets.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <LinkButtons project={project} />
        <a href={mainHref} className="glass rounded-full px-4 py-2 text-sm font-semibold hover:bg-white/10">
          다른 프로젝트 보기
        </a>
      </div>
    </Section>
  );
}

export default function ProjectReview(props: Props) {
  return (
    <>
      <nav className="glass sticky top-16 z-30 border-x-0 border-t-0">
        <ul className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-5 py-2 text-sm scroll-fade">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="block whitespace-nowrap rounded-lg px-2 py-1.5 sm:px-3 text-white/75 hover:bg-white/10 hover:text-white">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mx-auto max-w-7xl px-5">
        <Overview {...props} />
        <Features slug={props.project.slug} page={props.project.page} />
        <Architecture slug={props.project.slug} page={props.project.page} />
        <Role page={props.project.page} />
        <Troubles page={props.project.page} />
        <Retro {...props} />
      </div>
    </>
  );
}
