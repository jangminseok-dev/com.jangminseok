import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import type { z } from "zod";
import { findBannedTerms } from "@/lib/content/banned";
import { ProfileSchema, ProjectPageSchema, ProjectSchema } from "@/lib/content/schema";
import type { Profile, Project, ProjectMeta, ProjectPage } from "@/lib/content/schema";

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

function mediaPaths(p: ProjectMeta): string[] {
  return [p.preview.poster, ...(p.preview.video ? [p.preview.video] : []), ...(p.preview.demo ? [p.preview.demo] : [])];
}

// 미디어가 있는지, SVG 도식 안에 금지어(실명, IP)가 섞이지 않았는지
function checkMedia(file: string, contentDir: string, slug: string, media: string[], bannedTerms: readonly string[]) {
  for (const m of media) {
    const mediaFile = path.join(contentDir, slug, m);
    if (!fs.existsSync(mediaFile)) throw new ContentError(`${file}: 미디어 파일 없음 — ${slug}/${m}`);
    if (m.endsWith(".svg")) {
      const banned = findBannedTerms(fs.readFileSync(mediaFile, "utf8"), bannedTerms);
      if (banned.length) throw new ContentError(`${mediaFile}: 공개 금지 항목 발견 — ${banned.join(", ")}`);
    }
  }
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

  const projects = opts.slugs.map((slug): Project => {
    const file = path.join(contentDir, slug, "project.yaml");
    const meta = readChecked(file, ProjectSchema, opts.bannedTerms);
    if (meta.slug !== slug) {
      throw new ContentError(`${file}: slug "${meta.slug}"가 디렉터리 이름 "${slug}"와 다릅니다`);
    }
    checkMedia(file, contentDir, slug, mediaPaths(meta), opts.bannedTerms);
    const page = loadProjectPage(contentDir, slug, opts.bannedTerms);
    if (!page) throw new ContentError(`${path.join(contentDir, slug, "page.yaml")}: 소개 페이지 원고가 없습니다`);
    return { ...meta, page };
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
  const media = [page.architecture.image, ...page.features.flatMap((f) => (f.image ? [f.image] : []))];
  checkMedia(file, contentDir, slug, media, bannedTerms);
  return page;
}
