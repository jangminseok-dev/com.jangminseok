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

const DecisionSlideSchema = z.strictObject({
  title: text,
  // 요건 카드 등 맥락 없는 곳에 쓰는 한 줄 설명 — 무엇을 했고 결과가 어땠는지
  label: text.max(30),
  summary: text,
  stats: z.strictObject({ problem: text, choice: text, cost: text, effect: text }),
  frames: z.array(z.strictObject({ image: mediaPath, caption: text })).min(1).max(3),
  alternatives: z.array(z.strictObject({ name: text, reason: text })).min(1),
  concept: z.strictObject({ title: text, body: text }).optional(),
  evidence: z.array(z.strictObject({ label: text, url: z.url().optional() })).min(1),
  proves: z.array(z.enum(REQUIREMENT_IDS)).default([]),
});

// 프로젝트 카드 오른쪽 위 핀 — simple-icons slug와 1:1 (components/home/LanguagePins.tsx)
export const LANGUAGES = ["Python", "TypeScript", "Dart", "JavaScript", "Java"] as const;
export type Language = (typeof LANGUAGES)[number];

export const ProjectSchema = z.strictObject({
  slug: z.string().regex(/^[a-z0-9]+$/, "slug는 영문 소문자·숫자만"),
  order: z.number().int(),
  title: text,
  tagline: text,
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/, "accent는 #RRGGBB"),
  period: z.strictObject({ start: z.string().regex(DATE), end: z.string().regex(DATE).nullable() }),
  team: z.strictObject({ size: z.number().int().min(1), role: text }),
  stack: z.array(text).min(1),
  languages: z.array(z.enum(LANGUAGES)).min(1).max(3),
  preview: z.strictObject({ poster: mediaPath, video: mediaPath.optional(), demo: mediaPath.optional() }),
  links: z.strictObject({
    blog: z.url().optional(),
    site: z.url().optional(),
    repo: z.url().optional(),
  }),
  slides: z.array(DecisionSlideSchema).min(2).max(5),
  retro: z.strictObject({
    metrics: z.array(z.strictObject({ label: text, value: text })),
    regrets: z.array(text),
  }),
});
export type Project = z.infer<typeof ProjectSchema>;
export type DecisionSlide = Project["slides"][number];

export const ProfileSchema = z.strictObject({
  name: text,
  // 첫 화면 이름 옆 직함
  role: text,
  headline: text,
  intro: text,
  // 첫 화면 소개 아래 핵심 키워드 줄
  highlights: z.array(z.strictObject({ keyword: text, text: text })).min(1).max(5),
  requirements: z
    .array(z.strictObject({ id: z.enum(REQUIREMENT_IDS), label: text, detail: text }))
    .refine(
      (rs) => rs.length === REQUIREMENT_IDS.length && new Set(rs.map((r) => r.id)).size === rs.length,
      "requirements는 REQUIREMENT_IDS를 중복 없이 모두 포함해야 합니다",
    ),
  education: z.array(
    z.strictObject({
      org: text,
      course: text,
      period: text,
      topics: z.array(z.strictObject({ name: text, icon: z.string().regex(/^[a-z0-9]+$/).optional() })),
    }),
  ),
  // 첫 화면 기술 스택 — icon은 simple-icons slug, learned는 교육에서만 다룬 기술
  skills: z
    .array(
      z.strictObject({
        group: text,
        items: z
          .array(
            z.strictObject({
              name: text,
              icon: z.string().regex(/^[a-z0-9]+$/).optional(),
              learned: z.boolean().default(false),
            }),
          )
          .min(1),
      }),
    )
    .min(1),
  links: z.strictObject({
    github: z.url(),
    blog: z.url().optional(),
    email: z.email().optional(),
  }),
});
export type Profile = z.infer<typeof ProfileSchema>;

// ── 프로젝트 소개 페이지 v2 (content/<slug>/page.yaml) — 한눈에, 기능, 아키텍처, 맡은 일, 어려웠던 점, 회고 ──
const figure = z.strictObject({ value: text, label: text, note: text.optional() });

export const ProjectPageSchema = z.strictObject({
  // role: 첫 화면 제목 아래 한 줄 — 채용 담당자가 30초 안에 보는 "무엇을 맡았나"
  overview: z.strictObject({ what: text, why: text, role: text, highlights: z.array(figure).min(1).max(3) }),
  features: z
    .array(z.strictObject({ title: text, body: text, core: z.boolean().default(false), image: mediaPath.optional() }))
    .min(2)
    .max(8),
  featureNote: text.optional(),
  architecture: z.strictObject({
    image: mediaPath,
    summary: text,
    points: z.array(z.strictObject({ title: text, body: text })).min(2).max(5),
    layers: z.array(z.strictObject({ name: text, items: z.array(text).min(1) })).min(1),
  }),
  role: z.strictObject({
    summary: text,
    mine: z.array(text).min(1),
    team: z.array(text).default([]),
    collab: z.array(text).default([]), // 협업 방식 — 브랜치, 리뷰, 결정 기록, 역할을 나눈 기준
    ai: z.array(text).default([]), // AI 코딩 도구를 쓴 방식과 그 결과를 검증한 장치
  }),
  troubles: z
    .array(
      z.strictObject({
        title: text,
        problem: text,
        cause: text.optional(),
        solution: text,
        detail: text.optional(),
        result: text,
        evidence: z.array(z.strictObject({ label: text, url: z.url() })).default([]), // "코드로 확인" 링크
      }),
    )
    .min(2)
    .max(5),
  retro: z.strictObject({ metrics: z.array(figure), learned: z.array(text).default([]), regrets: z.array(text) }),
});
export type ProjectPage = z.infer<typeof ProjectPageSchema>;
