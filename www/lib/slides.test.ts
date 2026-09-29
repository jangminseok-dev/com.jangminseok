import { describe, expect, it } from "vitest";
import { slideAnchor } from "@/lib/slides";

describe("slideAnchor", () => {
  it("두 자리로 0을 채운다", () => {
    expect(slideAnchor(1)).toBe("01");
    expect(slideAnchor(7)).toBe("07");
    expect(slideAnchor(12)).toBe("12");
  });
});
