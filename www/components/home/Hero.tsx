import SkillBoard from "@/components/home/SkillBoard";
import type { Profile } from "@/lib/content/schema";

type Props = { profile: Profile; projectCount: number; teamProjectCount: number; skillsNote: string };

export default function Hero({ profile, projectCount, teamProjectCount, skillsNote }: Props) {
  const stats = [
    { label: "총 프로젝트", value: projectCount },
    { label: "개인 프로젝트", value: projectCount - teamProjectCount },
    { label: "팀 프로젝트", value: teamProjectCount },
  ];
  return (
    <section
      id="about"
      className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 py-12 md:min-h-[calc(100dvh-4rem)] md:grid-cols-[1fr_1.2fr]"
    >
      <div>
        <p className="font-semibold text-brand-soft">
          <span className="mr-3 text-[1.2rem]">{profile.name}</span>
          {profile.role}
        </p>
        <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight md:text-5xl">{profile.headline}</h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/85">{profile.intro}</p>
        <ul className="mt-5 max-w-xl space-y-2.5">
          {profile.highlights.map((h) => (
            <li key={h.keyword} className="flex gap-3 text-[15px] leading-relaxed text-white/80">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-soft" />
              <span>
                <strong className="font-semibold text-brand-soft">{h.keyword}</strong> — {h.text}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-7 grid max-w-md grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="glass rounded-2xl px-4 py-3">
              <dd className="text-2xl font-bold">{s.value}</dd>
              <dt className="mt-0.5 text-xs text-white/70">{s.label}</dt>
            </div>
          ))}
        </dl>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#projects" className="rounded-2xl bg-brand px-6 py-3.5 font-semibold text-white hover:opacity-90">
            프로젝트 보기
          </a>
          <a href="#requirements" className="glass rounded-2xl px-6 py-3.5 font-semibold text-white hover:bg-white/15">
            해본 일 보기
          </a>
        </div>
      </div>
      <SkillBoard skills={profile.skills} note={skillsNote} />
    </section>
  );
}
