import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { describe, expect, it } from "vitest";
import { skillIcon, stackIconSlug } from "@/lib/icons";
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
    const items = [...profile.skills.flatMap((g) => g.items), ...profile.education.flatMap((e) => e.topics)];
    const missing = items.filter((s) => s.icon && !skillIcon(s.icon));
    expect(missing.map((s) => s.icon)).toEqual([]);
  });
});

describe("stackIconSlug", () => {
  it("버전·부가 설명이 붙은 스택 이름에서 첫 단어로 로고를 찾는다", () => {
    expect(stackIconSlug("Python 3.13")).toBe("python");
    expect(stackIconSlug("SQLAlchemy 2 + Alembic")).toBe("sqlalchemy");
    expect(stackIconSlug("Next.js 16 × 3")).toBe("nextdotjs");
    expect(stackIconSlug("Gemini 임베딩")).toBe("googlegemini");
    expect(stackIconSlug("Cloudflare Tunnel")).toBe("cloudflare");
    expect(stackIconSlug("Docker Compose")).toBe("docker");
    expect(stackIconSlug("k3s + AWS")).toBe("k3s");
  });

  it("로고가 없는 스택은 null", () => {
    expect(stackIconSlug("KoE5 임베딩")).toBeNull();
    expect(stackIconSlug("import-linter")).toBeNull();
  });

  it("모든 프로젝트 스택의 로고 slug가 실제 아이콘으로 존재한다", () => {
    const dir = path.resolve(import.meta.dirname, "..", "..", "content");
    const stacks = fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .flatMap((e) => (parse(fs.readFileSync(path.join(dir, e.name, "project.yaml"), "utf8")) as { stack: string[] }).stack);
    const broken = stacks.map(stackIconSlug).filter((s): s is string => s !== null && !skillIcon(s));
    expect(broken).toEqual([]);
  });
});
