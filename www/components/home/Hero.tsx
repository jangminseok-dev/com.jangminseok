import type { Profile } from "@/lib/content/schema";

export default function Hero({ profile }: { profile: Profile }) {
  return (
    <section className="mx-auto grid min-h-[88dvh] max-w-6xl grid-cols-1 items-center gap-12 px-5 pb-16 pt-24 md:grid-cols-[1.1fr_1fr] md:pt-28">
      <div>
        <p className="text-lg font-semibold text-brand-soft">{profile.name}</p>
        <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight md:text-6xl">{profile.headline}</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">{profile.intro}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#projects" className="rounded-2xl bg-brand px-6 py-4 font-semibold text-white hover:opacity-90">
            프로젝트 보기
          </a>
          <a
            href={profile.links.github}
            target="_blank"
            rel="noreferrer"
            className="glass rounded-2xl px-6 py-4 font-semibold text-white hover:bg-white/15"
          >
            GitHub
          </a>
        </div>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {profile.requirements.map((req, i) => (
          <li
            key={req.id}
            // 7개라 마지막 카드는 한 줄을 다 쓴다 — 홀로 떨어져 보이지 않게
            className={`float ${i === profile.requirements.length - 1 ? "col-span-2 sm:col-span-3" : ""}`}
            style={{ animationDelay: `${i * 0.6}s` }}
          >
            <a
              href={`#req-${req.id}`}
              className="glass block h-full rounded-2xl p-4 transition-colors hover:border-brand-soft/60 hover:bg-white/10"
            >
              <p className="text-sm font-semibold leading-snug">{req.label}</p>
              <p className="mt-2 text-xs text-brand-soft">근거 보기 →</p>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
