import { describe, expect, it } from "vitest";
import { isOptedOut } from "@/lib/analytics";

describe("isOptedOut", () => {
  it("집계 제외 쿠키가 있으면 true", () => {
    expect(isOptedOut("theme=dark; va-disable=1")).toBe(true);
    expect(isOptedOut("va-disable=1")).toBe(true);
  });

  it("쿠키가 없거나 이름만 비슷하면 false", () => {
    expect(isOptedOut("")).toBe(false);
    expect(isOptedOut("theme=dark")).toBe(false);
    expect(isOptedOut("xva-disable=1")).toBe(false);
  });
});
