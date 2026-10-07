import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadProjects } from "@/lib/content/load";
import { groupProjects } from "@/lib/projectGroups";
import { PROJECT_SLUGS } from "@/lib/slugs";

const p = (slug: string, order: number, size: number) => ({ slug, order, team: { size } });

describe("groupProjects", () => {
  it("팀 프로젝트를 먼저, 각 그룹 안에서는 order가 작은 것부터 둔다", () => {
    const groups = groupProjects([
      p("solo-b", 2, 1),
      p("team-c", 4, 4),
      p("solo-a", 0, 1),
      p("team-a", 1, 3),
      p("team-b", 3, 4),
    ]);
    expect(groups.map((g) => g.title)).toEqual(["팀 프로젝트", "개인 프로젝트"]);
    expect(groups[0].items.map((x) => x.slug)).toEqual(["team-a", "team-b", "team-c"]);
    expect(groups[1].items.map((x) => x.slug)).toEqual(["solo-a", "solo-b"]);
  });

  it("order가 같으면 slug 순으로 고정한다", () => {
    const groups = groupProjects([p("z", 1, 1), p("m", 1, 1)]);
    expect(groups[0].items.map((x) => x.slug)).toEqual(["m", "z"]);
  });

  it("빈 그룹은 내보내지 않는다", () => {
    expect(groupProjects([p("solo", 0, 1)]).map((g) => g.title)).toEqual(["개인 프로젝트"]);
    expect(groupProjects([])).toEqual([]);
  });

  it("넘겨받은 배열의 순서를 바꾸지 않는다", () => {
    const input = [p("b", 2, 1), p("a", 1, 1)];
    groupProjects(input);
    expect(input.map((x) => x.slug)).toEqual(["b", "a"]);
  });

  // 이력서 공통본의 프로젝트 순서 — 원고의 order를 고치면 여기서 먼저 걸린다
  it("실제 원고의 메인 순서는 이력서와 같다", () => {
    const contentDir = path.resolve(process.cwd(), "..", "content");
    const [team, solo] = groupProjects(loadProjects(contentDir, { slugs: PROJECT_SLUGS, bannedTerms: [] }));
    expect(team.items.map((x) => x.slug)).toEqual(["callguard", "remakeday", "localhostdaegu", "balzaguk", "jbconnect"]);
    expect(solo.items.map((x) => x.slug)).toEqual(["redoceanmap", "portfolio", "chagocnote"]);
  });
});
