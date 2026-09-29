import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import type { z } from "zod";
import { findBannedTerms } from "@/lib/content/banned";
import { ProfileSchema, ProjectPageSchema, ProjectSchema } from "@/lib/content/schema";
import type { Profile, Project, ProjectPage } from "@/lib/content/schema";

export class ContentError extends Error {}

function readChecked<T extends z.ZodType>(file: string, schema: T, bannedTerms: readonly string[]): z.infer<T> {
  const raw = fs.readFileSync(file, "utf8");
  const banned = findBannedTerms(raw, bannedTerms);
  if (banned.length) throw new ContentError(`${file}: 공개 금지 항목 발견 — ${banned.join(", ")}`);

  let data: unknown;
  try {
    data = parse(raw);
  } catch (e) {
    throw new ContentError(`${file}: YAML 문법 오류 — ${e instanceof Error ? e.message : String(e)}`);
  }

  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new ContentError(`${file}: 스키마 검증 실패\n${issues}`);
  }
  return result.data;
}

function mediaPaths(p: Project): string[] {
  return [
    p.preview.poster,
    ...(p.preview.video ? [p.preview.video] : []),
    ...(p.preview.demo ? [p.preview.demo] : []),
    ...p.slides.flatMap((s) => s.frames.map((f) => f.image)),
  ];
}

export function loadProjects(
  contentDir: string,
  opts: { slugs: readonly string[]; bannedTerms: readonly string[] },
): Project[] {
  const dirs = fs
    .readdirSync(contentDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("."))
    .map((e) => e.name);

  const missing = opts.slugs.filter((s) => !dirs.includes(s));
  const unlisted = dirs.filter((d) => !opts.slugs.includes(d));
  if (missing.length || unlisted.length) {
    throw new ContentError(
      `PROJECT_SLUGS(lib/slugs.ts)와 content/ 불일치 — 디렉터리 없음: [${missing.join(", ")}], 목록에 없음: [${unlisted.join(", ")}]`,
    );
  }

  const projects = opts.slugs.map((slug) => {
    const file = path.join(contentDir, slug, "project.yaml");
    const project = readChecked(file, ProjectSchema, opts.bannedTerms);
    if (project.slug !== slug) {
      throw new ContentError(`${file}: slug "${project.slug}"가 디렉터리 이름 "${slug}"와 다릅니다`);
    }
    for (const m of mediaPaths(project)) {
      const mediaFile = path.join(contentDir, slug, m);
      if (!fs.existsSync(mediaFile)) {
        throw new ContentError(`${file}: 미디어 파일 없음 — ${slug}/${m}`);
      }
      // SVG 도식은 텍스트라 실명·IP가 섞일 수 있다
      if (m.endsWith(".svg")) {
        const banned = findBannedTerms(fs.readFileSync(mediaFile, "utf8"), opts.bannedTerms);
        if (banned.length) throw new ContentError(`${mediaFile}: 공개 금지 항목 발견 — ${banned.join(", ")}`);
      }
    }
    return project;
  });

  return projects.sort((a, b) => a.order - b.order);
}

export function loadProfile(contentDir: string, bannedTerms: readonly string[]): Profile {
  return readChecked(path.join(contentDir, "profile.yaml"), ProfileSchema, bannedTerms);
}

// 소개 페이지 v2 — page.yaml이 없으면 null (시범 단계: 일부 프로젝트만 있다)
export function loadProjectPage(contentDir: string, slug: string, bannedTerms: readonly string[]): ProjectPage | null {
  const file = path.join(contentDir, slug, "page.yaml");
  if (!fs.existsSync(file)) return null;
  const page = readChecked(file, ProjectPageSchema, bannedTerms);
  const media = [page.architecture.image, ...page.features.map((f) => f.image)];
  const missing = media.filter((m) => !fs.existsSync(path.join(contentDir, slug, m)));
  if (missing.length) throw new ContentError(`${file}: 미디어 파일 없음 — ${missing.join(", ")}`);
  return page;
}
