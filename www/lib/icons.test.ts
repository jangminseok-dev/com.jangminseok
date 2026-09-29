import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { describe, expect, it } from "vitest";
import { skillIcon } from "@/lib/icons";
import { ProfileSchema } from "@/lib/content/schema";

describe("skillIcon", () => {
  it("slug로 로고 경로와 색을 돌려준다", () => {
    const icon = skillIcon("python");
    expect(icon?.path.length).toBeGreaterThan(10);
    expect(icon?.color).toBe("#3776AB");
  });

  it("어두운 배경에서 안 보이는 검은 계열 로고는 흰색으로 바꾼다", () => {
    expect(skillIcon("vercel")?.color).toBe("#FFFFFF");
    expect(skillIcon("anthropic")?.color).toBe("#FFFFFF");
    expect(skillIcon("elasticsearch")?.color).toBe("#FFFFFF");
  });

  it("없는 slug는 null", () => {
    expect(skillIcon("no-such-logo")).toBeNull();
  });

  it("profile.yaml의 모든 icon slug가 실제로 존재한다 (오타 방지)", () => {
    const raw = fs.readFileSync(path.resolve(import.meta.dirname, "..", "..", "content", "profile.yaml"), "utf8");
    const profile = ProfileSchema.parse(parse(raw));
    const missing = profile.skills.flatMap((g) => g.items).filter((s) => s.icon && !skillIcon(s.icon));
    expect(missing.map((s) => s.icon)).toEqual([]);
  });
});
