import SkillBoard from "@/components/home/SkillBoard";
import type { Profile, Project } from "@/lib/content/schema";

type HeroProps = { profile: Profile; projects: Project[]; isProd: boolean; skillsNote: string };

export default function Hero({ profile, projects, isProd, skillsNote }: HeroProps) {
  return (
    // 설명(제목, 소개, 강점)을 먼저 읽고, 기술 스택은 그 아래에 둔다
    <section id="about" className="mx-auto max-w-7xl px-5 pb-16 pt-12">
      {/* 넓은 화면에서는 강점을 제목 오른쪽 칸에 둔다 — 첫 화면 오른쪽이 비지 않고, 기술 스택이 첫 화면에 걸친다 */}
      <div className="grid gap-x-12 gap-y-7 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)] lg:items-center">
        {/* 제목 칸은 예전 왼쪽 칸 폭 — 제목이 세 줄로 나뉘게 */}
        <div className="max-w-xl">
          <p className="font-semibold text-brand-soft">
            <span className="mr-3 text-xl text-white">{profile.name}</span>
            {profile.role}
          </p>
          {/* 줄 길이를 고르게 — 데스크톱에서 마지막 줄에 '개발자'만 남지 않게 */}
          <h1 className="display mt-3 text-4xl leading-[1.15] text-balance md:text-5xl">{profile.headline}</h1>
          <p className="mt-5 text-lg leading-relaxed text-white/85">{profile.intro}</p>
        </div>
        {/* 프로젝트와 스킬 인벤토리로 가는 버튼은 두지 않는다 — 위 메뉴에 같은 항목이 있다 */}
        {/* 강점이 이 화면의 본문 — 왼쪽 소개 문장과 같은 크기로 키우고, 별빛과 불빛이 글자 뒤에서 오르내리지 않게 glass 판 위에 둔다 */}
        <ul className="glass max-w-xl space-y-3 rounded-3xl p-6 md:p-7 lg:max-w-none lg:space-y-3.5">
          {profile.highlights.map((h) => (
            <li key={h.keyword} className="flex gap-3 text-base leading-relaxed text-white/85 lg:text-lg">
              <span className="mt-[0.63em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-soft" />
              <span>
                <strong className="font-semibold text-brand-soft">{h.keyword}</strong>: {h.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-12">
        <SkillBoard skills={profile.skills} education={profile.education} projects={projects} isProd={isProd} note={skillsNote} />
      </div>
    </section>
  );
}
