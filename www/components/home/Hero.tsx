import type { Profile } from "@/lib/content/schema";

export default function Hero({ profile }: { profile: Profile }) {
  return (
    <section className="mx-auto max-w-5xl px-5 pb-16 pt-24 md:pt-32">
      <p className="text-lg font-semibold text-brand">{profile.name}</p>
      <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-ink md:text-6xl">{profile.headline}</h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-sub">{profile.intro}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a href="#projects" className="rounded-2xl bg-brand px-6 py-4 font-semibold text-white hover:opacity-90">
          프로젝트 보기
        </a>
        <a
          href={profile.links.github}
          target="_blank"
          rel="noreferrer"
          className="rounded-2xl bg-surface px-6 py-4 font-semibold text-ink hover:bg-line"
        >
          GitHub
        </a>
      </div>
    </section>
  );
}
