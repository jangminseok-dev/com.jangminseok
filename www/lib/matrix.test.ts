import { describe, expect, it } from "vitest";
import { validPageData, validProfileData, validProjectData } from "@/lib/content/fixtures";
import { ProfileSchema, ProjectPageSchema, ProjectSchema } from "@/lib/content/schema";
import { buildRequirementMatrix, groupEvidenceByProject } from "@/lib/matrix";

const profile = ProfileSchema.parse(validProfileData());

function project(slug: string, order: number, proves: { id: string; label: string; anchor: string }[]) {
  const meta = ProjectSchema.parse(validProjectData({ slug, order, title: slug.toUpperCase() }));
  return { ...meta, page: ProjectPageSchema.parse(validPageData({ proves })) };
}

describe("buildRequirementMatrix", () => {
  it("요건마다 그것을 증명하는 소개 페이지 섹션을 모은다", () => {
    const rows = buildRequirementMatrix(profile.requirements, [
      project("a", 1, [{ id: "rag", label: "a 검색", anchor: "05" }, { id: "git", label: "a 협업", anchor: "04" }]),
      project("b", 2, [{ id: "rag", label: "b 평가", anchor: "05" }]),
    ]);
    expect(rows.find((r) => r.id === "rag")?.evidence).toEqual([
      { slug: "a", projectTitle: "A", accent: "#ef4444", anchor: "05", label: "a 검색" },
      { slug: "b", projectTitle: "B", accent: "#ef4444", anchor: "05", label: "b 평가" },
    ]);
  });

  it("증거가 없는 요건도 행으로 남긴다 (빈 배열)", () => {
    const rows = buildRequirementMatrix(profile.requirements, []);
    expect(rows).toHaveLength(profile.requirements.length);
    expect(rows.every((r) => r.evidence.length === 0)).toBe(true);
  });

  it("행 순서는 profile.requirements 순서를 따른다", () => {
    const rows = buildRequirementMatrix(profile.requirements, []);
    expect(rows.map((r) => r.id)).toEqual(profile.requirements.map((r) => r.id));
  });
});

describe("groupEvidenceByProject", () => {
  it("같은 프로젝트의 근거를 순서대로 묶고, 링크 문구는 한 줄 설명(label)을 쓴다", () => {
    const groups = groupEvidenceByProject([
      { slug: "a", projectTitle: "A", accent: "#111111", anchor: "03", label: "서버 분리 아키텍처" },
      { slug: "b", projectTitle: "B", accent: "#222222", anchor: "05", label: "검색 방식 비교 측정" },
      { slug: "a", projectTitle: "A", accent: "#111111", anchor: "05", label: "개인정보 마스킹" },
    ]);
    expect(groups).toEqual([
      { slug: "a", projectTitle: "A", accent: "#111111", items: [{ anchor: "03", label: "서버 분리 아키텍처" }, { anchor: "05", label: "개인정보 마스킹" }] },
      { slug: "b", projectTitle: "B", accent: "#222222", items: [{ anchor: "05", label: "검색 방식 비교 측정" }] },
    ]);
  });
});
