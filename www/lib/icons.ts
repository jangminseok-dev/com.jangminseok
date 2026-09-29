import * as simpleIcons from "simple-icons";

type SimpleIcon = { path: string; hex: string };

// 이 밝기(0~1) 아래의 로고는 어두운 배경에서 보이지 않아 흰색으로 그린다
const MIN_LUMINANCE = 0.3;

function luminance(hex: string): number {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// 서버 컴포넌트에서만 쓴다 — simple-icons 전체가 클라이언트 번들에 들어가지 않게
export function skillIcon(slug: string): { path: string; color: string } | null {
  const key = `si${slug.charAt(0).toUpperCase()}${slug.slice(1)}`;
  const icon = (simpleIcons as unknown as Record<string, SimpleIcon | undefined>)[key];
  if (!icon) return null;
  const color = luminance(icon.hex) < MIN_LUMINANCE ? "#FFFFFF" : `#${icon.hex}`;
  return { path: icon.path, color };
}

// 스택 이름의 첫 단어(소문자) → simple-icons slug. 목록에 없으면 로고 없이 이름만 보인다.
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
};

export function stackIconSlug(name: string): string | null {
  const first = name.trim().split(/\s+/)[0].toLowerCase();
  return STACK_ICON[first] ?? null;
}
