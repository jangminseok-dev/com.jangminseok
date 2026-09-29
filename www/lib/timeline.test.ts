import { describe, expect, it } from "vitest";
import { byStartDate } from "@/lib/timeline";

const p = (slug: string, start: string) => ({ slug, period: { start } });

describe("byStartDate", () => {
  it("시작일이 이른 프로젝트가 먼저 온다 (성장 순서)", () => {
    const sorted = [p("c", "2026-09-20"), p("a", "2026-05-22"), p("b", "2026-06-11")].sort(byStartDate);
    expect(sorted.map((x) => x.slug)).toEqual(["a", "b", "c"]);
  });

  it("시작일이 같으면 slug 순으로 고정한다", () => {
    const sorted = [p("z", "2026-06-01"), p("m", "2026-06-01")].sort(byStartDate);
    expect(sorted.map((x) => x.slug)).toEqual(["m", "z"]);
  });
});
