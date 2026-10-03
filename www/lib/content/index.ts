// 서버 전용 진입점 — 클라이언트 컴포넌트에서 import하지 않는다(node:fs 사용).
import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { readBannedTerms } from "@/lib/content/banned";
import { loadProfile, loadProjects } from "@/lib/content/load";
import { PROJECT_SLUGS } from "@/lib/slugs";
import { svgSize } from "@/lib/svgSize";

const CONTENT_DIR = path.resolve(process.cwd(), "..", "content");

export const getProjects = cache(() =>
  loadProjects(CONTENT_DIR, { slugs: PROJECT_SLUGS, bannedTerms: readBannedTerms(CONTENT_DIR) }),
);

export const getProject = (slug: string) => getProjects().find((p) => p.slug === slug) ?? null;

export const getProfile = cache(() => loadProfile(CONTENT_DIR, readBannedTerms(CONTENT_DIR)));

// SVG 미디어의 크기 — <img>에 width와 height를 줘서, 그림이 늦게 떠도 아래 내용이 밀리지 않게 한다(근거 링크의 #섹션 위치가 어긋나지 않게)
export const getSvgSize = (slug: string, media: string) =>
  media.endsWith(".svg") ? svgSize(fs.readFileSync(path.join(CONTENT_DIR, slug, media), "utf8")) : null;
