import { describe, expect, it } from "vitest";
import { groupProjects } from "@/lib/projectGroups";

const p = (slug: string, start: string, size: number) => ({ slug, period: { start }, team: { size } });

describe("groupProjects", () => {
  it("팀 프로젝트를 먼저, 각 그룹 안에서는 최근에 시작한 것부터 둔다", () => {
    const groups = groupProjects([
      p("solo-old", "2026-05-22", 1),
      p("team-old", "2026-06-11", 4),
      p("solo-new", "2026-09-29", 1),
      p("team-new", "2026-09-15", 3),
      p("team-mid", "2026-08-20", 4),
    ]);
    expect(groups.map((g) => g.title)).toEqual(["팀 프로젝트", "개인 프로젝트"]);
    expect(groups[0].items.map((x) => x.slug)).toEqual(["team-new", "team-mid", "team-old"]);
    expect(groups[1].items.map((x) => x.slug)).toEqual(["solo-new", "solo-old"]);
  });

  it("시작일이 같으면 slug 순으로 고정한다", () => {
    const groups = groupProjects([p("z", "2026-06-01", 1), p("m", "2026-06-01", 1)]);
    expect(groups[0].items.map((x) => x.slug)).toEqual(["m", "z"]);
  });

  it("빈 그룹은 내보내지 않는다", () => {
    expect(groupProjects([p("solo", "2026-01-01", 1)]).map((g) => g.title)).toEqual(["개인 프로젝트"]);
    expect(groupProjects([])).toEqual([]);
  });

  it("넘겨받은 배열의 순서를 바꾸지 않는다", () => {
    const input = [p("a", "2026-01-01", 1), p("b", "2026-02-01", 1)];
    groupProjects(input);
    expect(input.map((x) => x.slug)).toEqual(["a", "b"]);
  });
});
