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
