import SkillBoard from "@/components/home/SkillBoard";
import type { Profile } from "@/lib/content/schema";

export default function Hero({ profile, skillsNote }: { profile: Profile; skillsNote: string }) {
  return (
    // pb-28: 화면 아래에 고정된 챗봇 입력창이 첫 화면 내용을 가리지 않게 비워 둔다
    <section
      id="about"
      className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 pb-28 pt-12 md:min-h-[calc(100dvh-4rem)] md:grid-cols-[1fr_1.2fr]"
    >
      <div>
        <p className="font-semibold text-brand-soft">
          <span className="mr-3 text-xl text-white">{profile.name}</span>
          {profile.role}
        </p>
        {/* 줄 길이를 고르게 — 데스크톱에서 마지막 줄에 '개발자'만 남지 않게 */}
        <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-balance md:text-5xl">{profile.headline}</h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/85">{profile.intro}</p>
        {/* 버튼을 항목 위에 둔다. 화면이 낮아도 챗봇 입력창 뒤로 들어가지 않는다 */}
        <div className="mt-7 flex flex-wrap gap-3">
          <a href="#projects" className="rounded-2xl bg-brand-deep px-6 py-3.5 font-semibold text-paper hover:opacity-90">
            프로젝트 보기
          </a>
          <a href="#requirements" className="glass rounded-2xl px-6 py-3.5 font-semibold text-white hover:bg-white/15">
            스킬 인벤토리 보기
          </a>
        </div>
        <ul className="mt-8 max-w-xl space-y-2.5">
          {profile.highlights.map((h) => (
            <li key={h.keyword} className="flex gap-3 text-sm leading-relaxed text-white/85">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-soft" />
              <span>
                <strong className="font-semibold text-brand-soft">{h.keyword}</strong>: {h.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <SkillBoard skills={profile.skills} note={skillsNote} />
    </section>
  );
}
