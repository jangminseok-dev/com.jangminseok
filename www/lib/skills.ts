import type { Profile } from "@/lib/content/schema";

// 기술 칩을 누르면 보여 줄 근거 — 프로젝트 칩은 그 기술을 쓴 프로젝트(project.yaml의 stack), 교육 칩은 그 기술을 다룬 과정
type StackProject = { slug: string; title: string; accent: string; order: number; team: { size: number }; stack: string[] };

export type SkillProject = { slug: string; title: string; accent: string; team: boolean };
export type SkillEvidence =
  | { kind: "projects"; projects: SkillProject[] }
  | { kind: "courses"; courses: string[] }
  | { kind: "none" };

// 칩 이름과 stack에 적힌 이름이 다른 것만 짝을 지어 둔다
const STACK_ALIASES: Record<string, string[]> = {
  kubernetes: ["k3s"],
  linux: ["ubuntu"],
  tailwindcss: ["tailwind"],
};

const norm = (s: string) => s.toLowerCase().replace(/[^0-9a-z가-힣]/g, "");

// stack 한 줄("PostgreSQL + pgvector", "AWS (EC2 시험 배포, S3)")을 낱말로 나누고, 이웃한 두 낱말을 붙인 것("githubactions")까지 만든다
function stackTerms(entry: string): Set<string> {
  const words = entry.split(/[\s+(),×]+/).map(norm).filter(Boolean);
  return new Set([...words, ...words.slice(1).map((w, i) => words[i] + w)]);
}

export function usesSkill(stack: string[], skill: string): boolean {
  const names = [norm(skill), ...(STACK_ALIASES[norm(skill)] ?? [])];
  return stack.some((entry) => {
    const terms = stackTerms(entry);
    return names.some((n) => terms.has(n));
  });
}

export function skillEvidence(
  skill: { name: string; learned: boolean },
  projects: StackProject[],
  education: Profile["education"],
): SkillEvidence {
  if (skill.learned) {
    const courses = education.filter((e) => e.topics.some((t) => norm(t.name) === norm(skill.name))).map((e) => e.org);
    return courses.length ? { kind: "courses", courses } : { kind: "none" };
  }
  const used = projects
    .filter((p) => usesSkill(p.stack, skill.name))
    .sort((a, b) => a.order - b.order)
    .map((p) => ({ slug: p.slug, title: p.title, accent: p.accent, team: p.team.size > 1 }));
  return used.length ? { kind: "projects", projects: used } : { kind: "none" };
}
