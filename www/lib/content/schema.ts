import { z } from "zod";

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const text = z.string().trim().min(1);
const mediaPath = z
  .string()
  .regex(/^media\/[\w.\-/]+\.(webp|png|jpg|svg|mp4)$/, "media/ 아래 webp·png·jpg·svg·mp4 경로여야 합니다");

// 주 사용 언어 — 백엔드 카탈로그(minseok/scripts/build_catalog.py)가 읽는다
export const LANGUAGES = ["Python", "TypeScript", "Dart", "JavaScript", "Java"] as const;

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
  // 프로젝트 카드 썸네일 위에 보여 주는 핵심 기술
  tags: z.array(text.max(20)).min(1).max(3),
  preview: z.strictObject({ poster: mediaPath, video: mediaPath.optional(), demo: mediaPath.optional() }),
  links: z.strictObject({
    blog: z.url().optional(),
    site: z.url().optional(),
    repo: z.url().optional(),
  }),
  // 지금 실제로 운영 중인 서비스 — 메인 카드 날짜 자리에 "YYYY-MM부터 운영 중"을 붙인다(카탈로그에는 넣지 않는다)
  live: z.boolean().optional(),
});
// project.yaml(기본 정보) + page.yaml(소개 페이지) — 로더가 합친다
export type ProjectMeta = z.infer<typeof ProjectSchema>;
export type Project = ProjectMeta & { page: ProjectPage };

export const ProfileSchema = z.strictObject({
  name: text,
  // 첫 화면 이름 옆 직함
  role: text,
  headline: text,
  intro: text,
  // 첫 화면 소개 아래 핵심 키워드 줄
  highlights: z.array(z.strictObject({ keyword: text, text: text })).min(1).max(6),
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

// ── 프로젝트 소개 페이지 v2 (content/<slug>/page.yaml) — 한눈에, 기능, 아키텍처, 맡은 일, 트러블슈팅, 회고 ──
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
        // 제목 옆에 크게 보이는 대표 숫자 — 이 사례 본문에 있는 값만 쓴다. before: 고치기 전의 실패 숫자(성과 숫자와 구분해 보인다)
        figure: z.strictObject({ value: text, label: text, before: z.boolean().default(false) }).optional(),
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
