"use client";

// 라이트·다크 전환 — 고른 값은 localStorage에 남겨 다음 방문에도 쓴다 (기본은 다크 — layout.tsx 스크립트)
// 아이콘은 상태 없이 CSS(light: 변형)로 바꿔 서버 렌더와 어긋나지 않게 한다
export default function ThemeToggle() {
  const toggle = () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="라이트·다크 테마 전환"
      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10 hover:bg-white/20"
    >
      {/* 다크일 때 해, 라이트일 때 달 — 누르면 바뀔 테마를 보여 준다 */}
      <svg viewBox="0 0 24 24" aria-hidden className="h-[18px] w-[18px] light:hidden" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      <svg viewBox="0 0 24 24" aria-hidden className="hidden h-[18px] w-[18px] light:block" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
    </button>
  );
}
