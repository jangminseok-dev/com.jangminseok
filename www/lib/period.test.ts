import { describe, expect, it } from "vitest";
import { cardPeriod, pagePeriod } from "@/lib/period";

describe("cardPeriod", () => {
  it("운영 중인 프로젝트는 시작 달부터 운영 중", () => {
    expect(cardPeriod({ start: "2026-05-22", end: null }, true)).toBe("2026.05부터 운영 중");
  });

  it("끝나지 않은 프로젝트는 시작 달부터 진행 중", () => {
    expect(cardPeriod({ start: "2026-08-20", end: null })).toBe("2026.08부터 진행 중");
  });

  it("끝난 프로젝트는 시작과 끝 달, 같은 달이면 한 번만", () => {
    expect(cardPeriod({ start: "2026-09-01", end: "2026-10-07" })).toBe("2026.09 ~ 2026.10");
    expect(cardPeriod({ start: "2026-06-11", end: "2026-06-13" })).toBe("2026.06");
  });
});

describe("pagePeriod", () => {
  it("끝이 없으면 운영 중 또는 진행 중", () => {
    expect(pagePeriod({ start: "2026-09-29", end: null }, true)).toBe("2026-09-29 ~ 운영 중");
    expect(pagePeriod({ start: "2026-09-20", end: null })).toBe("2026-09-20 ~ 진행 중");
    expect(pagePeriod({ start: "2026-06-11", end: "2026-06-13" })).toBe("2026-06-11 ~ 2026-06-13");
  });
});
