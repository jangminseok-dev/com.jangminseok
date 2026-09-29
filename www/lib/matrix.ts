import type { Profile, Project, RequirementId } from "@/lib/content/schema";

export type MatrixEvidence = { slug: string; projectTitle: string; accent: string; anchor: string; label: string };
export type MatrixRow = { id: RequirementId; label: string; detail: string; evidence: MatrixEvidence[] };

// 요건마다, 그것을 보여 주는 프로젝트 소개 페이지의 섹션(page.yaml의 proves)을 모은다
export function buildRequirementMatrix(requirements: Profile["requirements"], projects: Project[]): MatrixRow[] {
  return requirements.map((req) => ({
    ...req,
    evidence: projects.flatMap((p) =>
      p.page.proves
        .filter((v) => v.id === req.id)
        .map((v) => ({ slug: p.slug, projectTitle: p.title, accent: p.accent, anchor: v.anchor, label: v.label })),
    ),
  }));
}

export type EvidenceGroup = {
  slug: string;
  projectTitle: string;
  accent: string;
  items: { anchor: string; label: string }[];
};

// 카드에서 프로젝트별로 한 줄씩 보여주기 위해 묶는다
export function groupEvidenceByProject(evidence: MatrixEvidence[]): EvidenceGroup[] {
  const groups: EvidenceGroup[] = [];
  for (const ev of evidence) {
    let g = groups.find((x) => x.slug === ev.slug);
    if (!g) {
      g = { slug: ev.slug, projectTitle: ev.projectTitle, accent: ev.accent, items: [] };
      groups.push(g);
    }
    g.items.push({ anchor: ev.anchor, label: ev.label });
  }
  return groups;
}
