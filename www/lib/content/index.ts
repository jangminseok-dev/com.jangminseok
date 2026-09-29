// 서버 전용 진입점 — 클라이언트 컴포넌트에서 import하지 않는다(node:fs 사용).
import path from "node:path";
import { cache } from "react";
import { readBannedTerms } from "@/lib/content/banned";
import { loadProfile, loadProjectPage, loadProjects } from "@/lib/content/load";
import { PROJECT_SLUGS } from "@/lib/slugs";

const CONTENT_DIR = path.resolve(process.cwd(), "..", "content");

export const getProjects = cache(() =>
  loadProjects(CONTENT_DIR, { slugs: PROJECT_SLUGS, bannedTerms: readBannedTerms(CONTENT_DIR) }),
);

export const getProject = (slug: string) => getProjects().find((p) => p.slug === slug) ?? null;

export const getProfile = cache(() => loadProfile(CONTENT_DIR, readBannedTerms(CONTENT_DIR)));

export const getProjectPage = (slug: string) => loadProjectPage(CONTENT_DIR, slug, readBannedTerms(CONTENT_DIR));
