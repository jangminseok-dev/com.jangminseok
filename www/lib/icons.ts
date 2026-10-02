import * as simpleIcons from "simple-icons";
import { EXTRA_ICONS } from "@/lib/icons-extra";

type SimpleIcon = { path: string; hex: string };

// 이 밝기(0~1) 아래의 로고는 어두운 배경에서 보이지 않아 다크 테마에서는 글자색(흰색)으로 그린다
const MIN_LUMINANCE = 0.3;
// 이 밝기 위의 로고(노랑·하늘색)는 밝은 배경에서 보이지 않아 라이트 테마에서는 어둡게 섞는다
const MAX_LUMINANCE = 0.6;
const LIGHT_DARKEN = 0.62;

function luminance(hex: string): number {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function darken(hex: string): string {
  return `#${[0, 2, 4]
    .map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * LIGHT_DARKEN).toString(16).padStart(2, "0"))
    .join("")}`;
}

// color: 다크 테마 색, lightColor: 라이트 테마 색 — logoStyle()로 CSS 변수에 넣어 .logo 클래스가 고른다
export type SkillIcon = { path: string; color: string; lightColor: string };

function themed(path: string, hex: string | null): SkillIcon {
  if (!hex) return { path, color: "currentColor", lightColor: "currentColor" };
  const l = luminance(hex);
  return {
    path,
    color: l < MIN_LUMINANCE ? "currentColor" : `#${hex}`,
    lightColor: l > MAX_LUMINANCE ? darken(hex) : `#${hex}`,
  };
}

// 서버 컴포넌트에서만 쓴다 — simple-icons 전체가 클라이언트 번들에 들어가지 않게
export function skillIcon(slug: string): SkillIcon | null {
  const extra = EXTRA_ICONS[slug];
  if (extra) return themed(extra.path, extra.hex);
  const key = `si${slug.charAt(0).toUpperCase()}${slug.slice(1)}`;
  const icon = (simpleIcons as unknown as Record<string, SimpleIcon | undefined>)[key];
  return icon ? themed(icon.path, icon.hex) : null;
}

// <svg className="logo" style={logoStyle(icon)}> — 테마별 색은 globals.css의 .logo가 고른다
export const logoStyle = (icon: SkillIcon): React.CSSProperties =>
  ({ ["--logo" as string]: icon.color, ["--logo-light" as string]: icon.lightColor }) as React.CSSProperties;

// 스택 이름 전체(소문자)로 먼저 찾는다 — 첫 단어만으로는 뜻이 갈리는 이름(예: "Web Speech API", "서울 열린데이터광장")
const STACK_ICON_FULL: Record<string, string> = {
  "web speech api": "microphone",
  "ios, android": "mobile",
  "메모리 저장소": "memory",
  "예비 답변": "fallback",
  "평가 러너": "evaluation",
  "로컬 gpu 서버": "server",
  "공공데이터 정기 수집": "datacollect",
  "서울 열린데이터광장": "database",
  "네이버 지도": "naver",
  "google stt": "googlecloud",
};

// 스택 이름의 첫 단어(소문자) → 아이콘 slug(simple-icons 또는 EXTRA_ICONS). 목록에 없으면 로고 없이 이름만 보인다.
const STACK_ICON: Record<string, string> = {
  python: "python",
  fastapi: "fastapi",
  sqlalchemy: "sqlalchemy",
  pydantic: "pydantic",
  postgresql: "postgresql",
  redis: "redis",
  elasticsearch: "elasticsearch",
  ollama: "ollama",
  gemini: "googlegemini",
  langchain: "langchain",
  pytorch: "pytorch",
  claude: "claude",
  google: "google",
  docker: "docker",
  k3s: "k3s",
  cloudflare: "cloudflare",
  vercel: "vercel",
  railway: "railway",
  "next.js": "nextdotjs",
  react: "react",
  flutter: "flutter",
  maplibre: "maplibre",
  minio: "minio",
  caddy: "caddy",
  jekyll: "jekyll",
  pandas: "pandas",
  typescript: "typescript",
  tailwind: "tailwindcss",
  github: "githubactions",
  mcp: "modelcontextprotocol",
  neon: "neon",
  supabase: "supabase",
  vite: "vite",
  websocket: "websocket",
  "import-linter": "shield",
  "metrics.yml": "yaml",
  alembic: "sqlalchemy",
  pgvector: "postgresql",
  pg_trgm: "postgresql",
  pyproj: "mapmarker",
  aws: "aws",
  groq: "bolt",
  gemma: "google",
  embeddinggemma: "google",
  kanana: "kakao",
  koe5: "huggingface",
  "qwen3-embedding": "qwen",
};

export function stackIconSlug(name: string): string | null {
  const full = name.trim().toLowerCase();
  const first = full.split(/\s+/)[0];
  return STACK_ICON_FULL[full] ?? STACK_ICON[first] ?? null;
}
