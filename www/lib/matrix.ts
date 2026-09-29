import type { Profile, Project, RequirementId } from "@/lib/content/schema";

export type MatrixEvidence = { slug: string; projectTitle: string; accent: string; slideNumber: number; slideTitle: string };
export type MatrixRow = { id: RequirementId; label: string; detail: string; evidence: MatrixEvidence[] };

// 결정 슬라이드 번호 = index + 2 (01은 소개 슬라이드) — app/p/[slug]/page.tsx와 같은 규칙
const FIRST_DECISION_NUMBER = 2;

export function buildRequirementMatrix(requirements: Profile["requirements"], projects: Project[]): MatrixRow[] {
  return requirements.map((req) => ({
    ...req,
    evidence: projects.flatMap((p) =>
      p.slides.flatMap((s, i) =>
        s.proves.includes(req.id)
          ? [{ slug: p.slug, projectTitle: p.title, accent: p.accent, slideNumber: i + FIRST_DECISION_NUMBER, slideTitle: s.title }]
          : [],
      ),
    ),
  }));
}

export type EvidenceGroup = {
  slug: string;
  projectTitle: string;
  accent: string;
  slides: { slideNumber: number; shortTitle: string }[];
};

// 카드에서 프로젝트별로 한 줄씩 보여주기 위해 묶는다 — 슬라이드 제목은 " - " 앞의 짧은 이름만
export function groupEvidenceByProject(evidence: MatrixEvidence[]): EvidenceGroup[] {
  const groups: EvidenceGroup[] = [];
  for (const ev of evidence) {
    let g = groups.find((x) => x.slug === ev.slug);
    if (!g) {
      g = { slug: ev.slug, projectTitle: ev.projectTitle, accent: ev.accent, slides: [] };
      groups.push(g);
    }
    g.slides.push({ slideNumber: ev.slideNumber, shortTitle: ev.slideTitle.split(" - ")[0] });
  }
  return groups;
}
