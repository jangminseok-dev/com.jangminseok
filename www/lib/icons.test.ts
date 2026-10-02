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

  it("라이트 테마에서는 진한 로고는 브랜드색 그대로, 너무 밝은 로고는 어둡게 섞는다", () => {
    expect(skillIcon("redhatopenshift")?.lightColor).toBe("#EE0000");
    expect(skillIcon("python")?.lightColor).toBe("#3776AB");
    expect(skillIcon("k3s")?.lightColor).toBe("#9e7b11");
    expect(skillIcon("rag")?.lightColor).toBe("currentColor");
  });

  it("어두운 배경에서 안 보이는 검은 계열 로고는 다크 테마에서 글자색으로 바꾼다", () => {
    expect(skillIcon("vercel")?.color).toBe("currentColor");
    expect(skillIcon("anthropic")?.color).toBe("currentColor");
    expect(skillIcon("elasticsearch")?.color).toBe("currentColor");
  });

  it("simple-icons에 없는 상표 로고와 일반 개념 아이콘도 찾는다", () => {
    expect(skillIcon("aws")?.color).toBe("#FF9900");
    expect(skillIcon("rag")?.color).toBe("currentColor");
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

  it("profile.yaml의 모든 기술 칩에 아이콘이 있다", () => {
    const raw = fs.readFileSync(path.resolve(import.meta.dirname, "..", "..", "content", "profile.yaml"), "utf8");
    const profile = ProfileSchema.parse(parse(raw));
    const items = [...profile.skills.flatMap((g) => g.items), ...profile.education.flatMap((e) => e.topics)];
    expect(items.filter((s) => !s.icon).map((s) => s.name)).toEqual([]);
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

  it("첫 단어로 뜻이 갈리는 이름은 전체 이름으로 먼저 찾는다", () => {
    expect(stackIconSlug("Web Speech API")).toBe("microphone");
    expect(stackIconSlug("서울 열린데이터광장")).toBe("database");
    expect(stackIconSlug("Google STT")).toBe("googlecloud");
  });

  it("목록에 없는 스택은 null", () => {
    expect(stackIconSlug("없는 기술")).toBeNull();
  });

  it("모든 프로젝트 페이지의 기술 칩(architecture.layers)에 아이콘이 있다", () => {
    const dir = path.resolve(import.meta.dirname, "..", "..", "content");
    type Page = { architecture: { layers: { items: string[] }[] } };
    const items = fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && fs.existsSync(path.join(dir, e.name, "page.yaml")))
      .flatMap((e) => (parse(fs.readFileSync(path.join(dir, e.name, "page.yaml"), "utf8")) as Page).architecture.layers)
      .flatMap((l) => l.items);
    const missing = items.filter((s) => {
      const slug = stackIconSlug(s);
      return !slug || !skillIcon(slug);
    });
    expect(missing).toEqual([]);
  });

  it("모든 프로젝트 스택의 로고 slug가 실제 아이콘으로 존재한다", () => {
    const dir = path.resolve(import.meta.dirname, "..", "..", "content");
    const stacks = fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && fs.existsSync(path.join(dir, e.name, "project.yaml")))
      .flatMap((e) => (parse(fs.readFileSync(path.join(dir, e.name, "project.yaml"), "utf8")) as { stack: string[] }).stack);
    const broken = stacks.map(stackIconSlug).filter((s): s is string => s !== null && !skillIcon(s));
    expect(broken).toEqual([]);
  });
});
