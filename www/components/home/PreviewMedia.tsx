"use client";

import { useEffect, useRef } from "react";

type Props = { poster: string; video: string | null; alt: string };

// 화면에 절반 이상 보일 때만 재생. 영상이 없거나 모션 감소 설정이면 poster만.
export default function PreviewMedia({ poster, video, alt }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void el.play().catch(() => undefined);
        else el.pause();
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!video) {
    return <img src={poster} alt={alt} loading="lazy" className="aspect-video w-full object-cover object-top" />;
  }
  return (
    <video
      ref={ref}
      src={video}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={alt}
      className="aspect-video w-full object-cover object-top"
    />
  );
}
