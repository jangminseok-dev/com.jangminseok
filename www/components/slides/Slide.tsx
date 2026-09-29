import { slideAnchor } from "@/lib/slides";

// 프로젝트 포인트 컬러를 CSS 변수로 주입 — Tailwind에서 text-(--accent) 등으로 사용
export const accentStyle = (hex: string): React.CSSProperties =>
  ({ ["--accent" as string]: hex }) as React.CSSProperties;

export default function Slide({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <section
      id={slideAnchor(n)}
      data-slide={n}
      className="flex min-h-[calc(100dvh-4rem)] snap-start flex-col justify-center px-5 py-16 md:px-16"
    >
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}
