import { describe, expect, it } from "vitest";
import { validProfileData, validProjectData } from "@/lib/content/fixtures";
import { ProfileSchema, ProjectSchema } from "@/lib/content/schema";
import { buildRequirementMatrix, groupEvidenceByProject } from "@/lib/matrix";

const profile = ProfileSchema.parse(validProfileData());

function project(slug: string, order: number, proves: string[][]) {
  const base = validProjectData({ slug, order, title: slug.toUpperCase() });
  const slides = (base.slides as Record<string, unknown>[]).map((s, i) => ({
    ...s,
    title: `${slug}-결정${i}`,
    label: `${slug}-결정${i} 한 줄 설명`,
    proves: proves[i] ?? [],
  }));
  return ProjectSchema.parse({ ...base, slides });
}

describe("buildRequirementMatrix", () => {
  it("요건마다 그것을 증명하는 슬라이드를 모은다 (슬라이드 번호 = index + 2)", () => {
    const rows = buildRequirementMatrix(profile.requirements, [
      project("a", 1, [["rag"], ["rag", "git"]]),
      project("b", 2, [[], ["rag"]]),
    ]);
    const rag = rows.find((r) => r.id === "rag");
    expect(rag?.evidence).toEqual([
      { slug: "a", projectTitle: "A", accent: "#ef4444", slideNumber: 2, label: "a-결정0 한 줄 설명" },
      { slug: "a", projectTitle: "A", accent: "#ef4444", slideNumber: 3, label: "a-결정1 한 줄 설명" },
      { slug: "b", projectTitle: "B", accent: "#ef4444", slideNumber: 3, label: "b-결정1 한 줄 설명" },
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
  it("같은 프로젝트의 근거를 순서대로 묶고, 링크 문구는 슬라이드의 한 줄 설명(label)을 쓴다", () => {
    const groups = groupEvidenceByProject([
      { slug: "a", projectTitle: "A", accent: "#111111", slideNumber: 2, label: "서버 분리 아키텍처" },
      { slug: "b", projectTitle: "B", accent: "#222222", slideNumber: 3, label: "검색 방식 비교 측정" },
      { slug: "a", projectTitle: "A", accent: "#111111", slideNumber: 4, label: "개인정보 마스킹" },
    ]);
    expect(groups).toEqual([
      { slug: "a", projectTitle: "A", accent: "#111111", slides: [{ slideNumber: 2, label: "서버 분리 아키텍처" }, { slideNumber: 4, label: "개인정보 마스킹" }] },
      { slug: "b", projectTitle: "B", accent: "#222222", slides: [{ slideNumber: 3, label: "검색 방식 비교 측정" }] },
    ]);
  });
});
