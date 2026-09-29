// 프로젝트 포인트 컬러를 CSS 변수로 주입 — Tailwind에서 text-(--accent) 등으로 사용
export const accentStyle = (hex: string): React.CSSProperties =>
  ({ ["--accent" as string]: hex }) as React.CSSProperties;
