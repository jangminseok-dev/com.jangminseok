import type { Profile, Project, RequirementId } from "@/lib/content/schema";

export type MatrixEvidence = { slug: string; projectTitle: string; slideNumber: number; slideTitle: string };
export type MatrixRow = { id: RequirementId; label: string; detail: string; evidence: MatrixEvidence[] };

// 결정 슬라이드 번호 = index + 2 (01은 소개 슬라이드) — app/p/[slug]/page.tsx와 같은 규칙
const FIRST_DECISION_NUMBER = 2;

export function buildRequirementMatrix(requirements: Profile["requirements"], projects: Project[]): MatrixRow[] {
  return requirements.map((req) => ({
    ...req,
    evidence: projects.flatMap((p) =>
      p.slides.flatMap((s, i) =>
        s.proves.includes(req.id)
          ? [{ slug: p.slug, projectTitle: p.title, slideNumber: i + FIRST_DECISION_NUMBER, slideTitle: s.title }]
          : [],
      ),
    ),
  }));
}
