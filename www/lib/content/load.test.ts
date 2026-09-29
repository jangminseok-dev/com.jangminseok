import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { stringify } from "yaml";
import { beforeEach, describe, expect, it } from "vitest";
import { ContentError, loadProfile, loadProjects } from "@/lib/content/load";
import { validPageData, validProfileData, validProjectData } from "@/lib/content/fixtures";

let dir: string;

function writeProject(
  slug: string,
  data: Record<string, unknown>,
  media: string[] = ["poster.webp", "arch.svg"],
  page: Record<string, unknown> | null = validPageData(),
) {
  const pdir = path.join(dir, slug);
  fs.mkdirSync(path.join(pdir, "media"), { recursive: true });
  fs.writeFileSync(path.join(pdir, "project.yaml"), stringify(data));
  if (page) fs.writeFileSync(path.join(pdir, "page.yaml"), stringify(page));
  for (const m of media) fs.writeFileSync(path.join(pdir, "media", m), "<svg/>");
}

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "content-"));
});

describe("loadProjects", () => {
  it("order 오름차순으로 반환한다", () => {
    writeProject("b", validProjectData({ slug: "b", order: 2 }));
    writeProject("a", validProjectData({ slug: "a", order: 1 }));
    const projects = loadProjects(dir, { slugs: ["a", "b"], bannedTerms: [] });
    expect(projects.map((p) => p.slug)).toEqual(["a", "b"]);
  });

  it("스키마 오류는 파일 경로와 필드 경로를 메시지에 담는다", () => {
    writeProject("a", validProjectData({ slug: "a", accent: "red" }));
    expect(() => loadProjects(dir, { slugs: ["a"], bannedTerms: [] })).toThrowError(/a\/project\.yaml[\s\S]*accent/);
  });

  it("YAML 문법 오류도 파일 경로를 담은 ContentError로 알린다", () => {
    writeProject("a", validProjectData({ slug: "a" }));
    fs.writeFileSync(path.join(dir, "a", "project.yaml"), 'slug: a\ntagline: "따옴표" 뒤에 글자\n');
    const run = () => loadProjects(dir, { slugs: ["a"], bannedTerms: [] });
    expect(run).toThrowError(ContentError);
    expect(run).toThrowError(/a\/project\.yaml: YAML 문법 오류/);
  });

  it("디렉터리 이름과 slug가 다르면 실패한다", () => {
    writeProject("a", validProjectData({ slug: "zzz" }));
    expect(() => loadProjects(dir, { slugs: ["a"], bannedTerms: [] })).toThrowError(ContentError);
  });

  it("참조한 미디어 파일이 없으면 그 경로를 알려준다", () => {
    writeProject("a", validProjectData({ slug: "a" }), ["poster.webp"]);
    expect(() => loadProjects(dir, { slugs: ["a"], bannedTerms: [] })).toThrowError(/media\/arch\.svg/);
  });

  it("소개 페이지(page.yaml)를 합쳐 돌려주고, 없으면 실패한다", () => {
    writeProject("a", validProjectData({ slug: "a" }));
    expect(loadProjects(dir, { slugs: ["a"], bannedTerms: [] })[0].page.overview.role).toBe("역할 한 줄");
    writeProject("b", validProjectData({ slug: "b" }), undefined, null);
    expect(() => loadProjects(dir, { slugs: ["a", "b"], bannedTerms: [] })).toThrowError(/b\/page\.yaml/);
  });

  it("전체 시연 영상 파일이 없으면 그 경로를 알려준다", () => {
    writeProject("a", validProjectData({ slug: "a", preview: { poster: "media/poster.webp", demo: "media/demo.mp4" } }));
    expect(() => loadProjects(dir, { slugs: ["a"], bannedTerms: [] })).toThrowError(/media\/demo\.mp4/);
  });

  it("PROJECT_SLUGS와 content 디렉터리 목록이 다르면 실패한다", () => {
    writeProject("a", validProjectData({ slug: "a" }));
    expect(() => loadProjects(dir, { slugs: ["a", "b"], bannedTerms: [] })).toThrowError(/디렉터리 없음: \[b\]/);
    writeProject("b", validProjectData({ slug: "b" }));
    expect(() => loadProjects(dir, { slugs: ["a"], bannedTerms: [] })).toThrowError(/목록에 없음: \[b\]/);
  });

  it("SVG 도식 안의 금지어도 잡는다", () => {
    writeProject("a", validProjectData({ slug: "a" }));
    fs.writeFileSync(path.join(dir, "a", "media", "arch.svg"), "<svg><text>홍길동 담당</text></svg>");
    const run = () => loadProjects(dir, { slugs: ["a"], bannedTerms: ["홍길동"] });
    expect(run).toThrowError(/arch\.svg[\s\S]*금지어 #1/);
    expect(run).not.toThrowError(/홍길동/);
  });

  it("금지어가 있으면 원문 없이 실패한다", () => {
    writeProject("a", validProjectData({ slug: "a", tagline: "홍길동과 함께 만든 서비스" }));
    const run = () => loadProjects(dir, { slugs: ["a"], bannedTerms: ["홍길동"] });
    expect(run).toThrowError(/금지어 #1/);
    expect(run).not.toThrowError(/홍길동/);
  });
});

describe("loadProfile", () => {
  it("profile.yaml을 검증해 반환한다", () => {
    fs.writeFileSync(path.join(dir, "profile.yaml"), stringify(validProfileData()));
    expect(loadProfile(dir, []).name).toBe("장민석");
  });

  it("사설 IP가 있으면 실패한다", () => {
    fs.writeFileSync(path.join(dir, "profile.yaml"), stringify({ ...validProfileData(), intro: "10.0.0.1" }));
    expect(() => loadProfile(dir, [])).toThrowError(/사설 IP/);
  });
});
