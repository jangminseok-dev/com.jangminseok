import { describe, expect, it } from "vitest";
import { groupProjects } from "@/lib/projectGroups";

const p = (slug: string, order: number, size: number) => ({ slug, order, team: { size } });

describe("groupProjects", () => {
  it("팀 프로젝트를 먼저, 각 그룹 안에서는 order순으로 둔다", () => {
    const groups = groupProjects([p("solo2", 5, 1), p("team2", 3, 4), p("solo1", 0, 1), p("team1", 1, 4)]);
    expect(groups.map((g) => g.title)).toEqual(["팀 프로젝트", "개인 프로젝트"]);
    expect(groups[0].items.map((x) => x.slug)).toEqual(["team1", "team2"]);
    expect(groups[1].items.map((x) => x.slug)).toEqual(["solo1", "solo2"]);
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
});
