import { z } from "zod";

// 타깃 공고 요건 — 메인 "요건 → 증거" 매트릭스의 행
export const REQUIREMENT_IDS = [
  "python-backend",
  "search-engine",
  "rag",
  "hybrid-search",
  "linux-docker",
  "git",
  "ai-assistant",
] as const;
export type RequirementId = (typeof REQUIREMENT_IDS)[number];

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const text = z.string().trim().min(1);
const mediaPath = z
  .string()
  .regex(/^media\/[\w.\-/]+\.(webp|png|jpg|svg|mp4)$/, "media/ 아래 webp·png·jpg·svg·mp4 경로여야 합니다");

const DecisionSlideSchema = z.object({
  title: text,
  summary: text,
  stats: z.object({ problem: text, choice: text, cost: text, effect: text }),
  frames: z.array(z.object({ image: mediaPath, caption: text })).min(1).max(3),
  alternatives: z.array(z.object({ name: text, reason: text })).min(1),
  concept: z.object({ title: text, body: text }).optional(),
  evidence: z.array(z.object({ label: text, url: z.url().optional() })).min(1),
  proves: z.array(z.enum(REQUIREMENT_IDS)).default([]),
});

export const ProjectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+$/, "slug는 영문 소문자·숫자만"),
  order: z.number().int(),
  title: text,
  tagline: text,
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/, "accent는 #RRGGBB"),
  period: z.object({ start: z.string().regex(DATE), end: z.string().regex(DATE).nullable() }),
  team: z.object({ size: z.number().int().min(1), role: text }),
  stack: z.array(text).min(1),
  preview: z.object({ poster: mediaPath, video: mediaPath.optional() }),
  links: z.object({
    blog: z.url().optional(),
    site: z.url().optional(),
    repo: z.url().optional(),
  }),
  slides: z.array(DecisionSlideSchema).min(2).max(5),
  retro: z.object({
    metrics: z.array(z.object({ label: text, value: text })),
    regrets: z.array(text),
  }),
});
export type Project = z.infer<typeof ProjectSchema>;
export type DecisionSlide = Project["slides"][number];

export const ProfileSchema = z.object({
  name: text,
  headline: text,
  intro: text,
  requirements: z
    .array(z.object({ id: z.enum(REQUIREMENT_IDS), label: text, detail: text }))
    .refine(
      (rs) => rs.length === REQUIREMENT_IDS.length && new Set(rs.map((r) => r.id)).size === rs.length,
      "requirements는 REQUIREMENT_IDS를 중복 없이 모두 포함해야 합니다",
    ),
  education: z.array(
    z.object({ org: text, course: text, period: text, topics: z.array(text) }),
  ),
  links: z.object({
    github: z.url(),
    blog: z.url().optional(),
    email: z.email().optional(),
  }),
});
export type Profile = z.infer<typeof ProfileSchema>;
