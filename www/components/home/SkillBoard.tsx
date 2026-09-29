import type { Profile } from "@/lib/content/schema";
import { skillIcon } from "@/lib/icons";

export default function SkillBoard({ skills, note }: { skills: Profile["skills"]; note: string }) {
  return (
    <div id="skills" className="glass rounded-3xl p-5 md:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold">기술 스택</h2>
        <p className="flex gap-3 text-xs text-white/70">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-white/80" /> 프로젝트에서 사용
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm border border-dashed border-white/60" /> 교육에서 학습
          </span>
        </p>
      </div>
      <p className="mt-1 text-sm text-white/65">{note}</p>
      <dl className="mt-5 space-y-4">
        {skills.map((g) => (
          <div key={g.group} className="grid grid-cols-1 gap-2 sm:grid-cols-[5.5rem_1fr]">
            <dt className="pt-1.5 text-sm font-semibold text-white/70">{g.group}</dt>
            <dd className="flex flex-wrap gap-2">
              {g.items.map((s) => {
                const icon = s.icon ? skillIcon(s.icon) : null;
                return (
                  <span
                    key={s.name}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm ${
                      s.learned ? "border border-dashed border-white/30 text-white/65" : "bg-white/12 font-medium text-white"
                    }`}
                  >
                    {icon ? (
                      <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 shrink-0" fill={icon.color}>
                        <path d={icon.path} />
                      </svg>
                    ) : null}
                    {s.name}
                  </span>
                );
              })}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
