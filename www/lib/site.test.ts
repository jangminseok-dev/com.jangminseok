import { describe, expect, it } from "vitest";
import { mainHref, projectHref } from "@/lib/site";

describe("링크 생성", () => {
  it("운영은 서브도메인 절대 URL", () => {
    expect(projectHref("redoceanmap", true)).toBe("https://redoceanmap.jangminseok.com");
    expect(mainHref(true)).toBe("https://jangminseok.com");
  });

  it("로컬·프리뷰는 상대 경로", () => {
    expect(projectHref("redoceanmap", false)).toBe("/p/redoceanmap");
    expect(mainHref(false)).toBe("/");
  });
});
