import { describe, expect, it } from "vitest";
import { projectSlugFromHost } from "@/lib/host";

const SLUGS = ["redoceanmap", "callguard"] as const;

describe("projectSlugFromHost", () => {
  it("운영 서브도메인을 slug로 바꾼다", () => {
    expect(projectSlugFromHost("redoceanmap.jangminseok.com", SLUGS)).toBe("redoceanmap");
  });

  it("대문자·포트를 정규화한다", () => {
    expect(projectSlugFromHost("RedOceanMap.jangminseok.com:443", SLUGS)).toBe("redoceanmap");
    expect(projectSlugFromHost("callguard.localhost:3000", SLUGS)).toBe("callguard");
  });

  it("루트·www·미등록 서브도메인은 null (메인 표시)", () => {
    expect(projectSlugFromHost("jangminseok.com", SLUGS)).toBeNull();
    expect(projectSlugFromHost("www.jangminseok.com", SLUGS)).toBeNull();
    expect(projectSlugFromHost("foo.jangminseok.com", SLUGS)).toBeNull();
    expect(projectSlugFromHost("localhost:3000", SLUGS)).toBeNull();
  });

  it("다른 도메인과 헤더 누락은 null", () => {
    expect(projectSlugFromHost("redoceanmap.evil.com", SLUGS)).toBeNull();
    expect(projectSlugFromHost("www-git-main.vercel.app", SLUGS)).toBeNull();
    expect(projectSlugFromHost(null, SLUGS)).toBeNull();
  });

  it("2단계 이상 서브도메인은 null", () => {
    expect(projectSlugFromHost("a.redoceanmap.jangminseok.com", SLUGS)).toBeNull();
  });
});
