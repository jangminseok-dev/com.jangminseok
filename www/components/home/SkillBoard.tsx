import SkillPicker from "@/components/home/SkillPicker";
import type { PickerEvidence, PickerGroup } from "@/components/home/SkillPicker";
import TechChip from "@/components/home/TechChip";
import type { Profile, Project } from "@/lib/content/schema";
import { projectHref } from "@/lib/site";
import { skillEvidence } from "@/lib/skills";

type SkillBoardProps = {
  skills: Profile["skills"];
  education: Profile["education"];
  projects: Project[];
  isProd: boolean;
  note: string;
};

export default function SkillBoard({ skills, education, projects, isProd, note }: SkillBoardProps) {
  const groups: PickerGroup[] = skills.map((g) => ({
    group: g.group,
    items: g.items.map((s) => {
      const e = skillEvidence(s, projects, education);
      const evidence: PickerEvidence =
        e.kind === "projects" ? { kind: "projects", projects: e.projects.map((p) => ({ ...p, href: projectHref(p.slug, isProd) })) } : e;
      return { name: s.name, chip: <TechChip name={s.name} icon={s.icon} dashed={s.learned} />, evidence };
    }),
  }));
  return (
    <div id="skills" className="glass rounded-3xl p-5 md:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-bold">기술 스택</h2>
        <p className="flex gap-3 text-sm text-white/70">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-white/80" /> 프로젝트에서 사용
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm border border-dashed border-white/60" /> 교육에서 학습
          </span>
        </p>
      </div>
      <p className="mt-1 text-sm text-white/70">{note}</p>
      <SkillPicker groups={groups} />
    </div>
  );
}
