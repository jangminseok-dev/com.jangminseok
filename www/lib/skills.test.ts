import { describe, expect, it } from "vitest";
import { skillEvidence, usesSkill } from "@/lib/skills";

const P = (slug: string, order: number, size: number, stack: string[]) => ({ slug, title: slug, accent: "#000000", order, team: { size }, stack });
const projects = [
  P("b", 2, 4, ["Python 3.13", "PostgreSQL + pgvector", "k3s + AWS", "GitHub Actions"]),
  P("a", 1, 1, ["FastAPI", "Ubuntu", "Tailwind 4", "AWS (EC2 시험 배포, S3)"]),
];
const education = [
  { org: "과정 A", course: "c", period: "p", topics: [{ name: "LangGraph", icon: "x" }] },
];

describe("usesSkill", () => {
  it("stack 한 줄을 낱말로 나눠 맞춘다", () => {
    expect(usesSkill(["PostgreSQL + pgvector"], "pgvector")).toBe(true);
    expect(usesSkill(["Elasticsearch 9 + nori"], "Elasticsearch")).toBe(true);
    expect(usesSkill(["Next.js 16 × 3"], "Next.js")).toBe(true);
  });

  it("두 낱말로 된 기술도 맞추지만, 낱말 일부만 같은 것은 맞추지 않는다", () => {
    expect(usesSkill(["GitHub Actions"], "GitHub Actions")).toBe(true);
    expect(usesSkill(["GitHub Actions"], "Git")).toBe(false);
    expect(usesSkill(["React 19"], "React Native")).toBe(false);
  });

  it("이름이 다른 기술은 짝을 지어 둔 이름으로 맞춘다", () => {
    expect(usesSkill(["k3s + AWS"], "Kubernetes")).toBe(true);
    expect(usesSkill(["Ubuntu"], "Linux")).toBe(true);
    expect(usesSkill(["Tailwind 4"], "Tailwind CSS")).toBe(true);
  });
});

describe("skillEvidence", () => {
  it("프로젝트 칩은 그 기술을 쓴 프로젝트를 order 순으로, 팀 여부와 함께 준다", () => {
    expect(skillEvidence({ name: "AWS", learned: false }, projects, education)).toEqual({
      kind: "projects",
      projects: [
        { slug: "a", title: "a", accent: "#000000", team: false },
        { slug: "b", title: "b", accent: "#000000", team: true },
      ],
    });
  });

  it("교육 칩은 그 기술을 다룬 과정을 준다", () => {
    expect(skillEvidence({ name: "LangGraph", learned: true }, projects, education)).toEqual({ kind: "courses", courses: ["과정 A"] });
  });

  it("근거가 없으면 none — 화면에서는 누를 수 없는 칩으로 둔다", () => {
    expect(skillEvidence({ name: "Neo4j", learned: false }, projects, education)).toEqual({ kind: "none" });
  });
});
