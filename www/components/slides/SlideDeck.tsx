"use client";

import { useEffect, useRef, useState } from "react";
import { slideAnchor } from "@/lib/slides";

const NEXT_KEYS = ["ArrowRight", "ArrowDown", "PageDown"];
const PREV_KEYS = ["ArrowLeft", "ArrowUp", "PageUp"];

export default function SlideDeck({ count, children }: { count: number; children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(1);

  // 화면 세로 중앙선을 지나는 슬라이드를 현재 슬라이드로 — 화면보다 긴 슬라이드도 잡힌다
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          setCurrent(Number(el.dataset.slide));
          history.replaceState(null, "", `#${el.id}`);
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    root.querySelectorAll("section[data-slide]").forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const delta = NEXT_KEYS.includes(e.key) ? 1 : PREV_KEYS.includes(e.key) ? -1 : 0;
      if (delta === 0) return;
      e.preventDefault();
      const next = Math.min(count, Math.max(1, current + delta));
      document.getElementById(slideAnchor(next))?.scrollIntoView();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, current]);

  return (
    <div ref={rootRef} className="md:h-dvh md:snap-y md:snap-mandatory md:overflow-y-auto">
      {children}
      <ol aria-hidden className="fixed right-4 top-1/2 hidden -translate-y-1/2 flex-col gap-2 md:flex">
        {Array.from({ length: count }, (_, i) => (
          <li
            key={i}
            className={`h-2 w-2 rounded-full transition-colors ${i + 1 === current ? "bg-(--accent)" : "bg-white/25"}`}
          />
        ))}
      </ol>
    </div>
  );
}
