const SECTIONS = [
  { id: "about", label: "소개" },
  { id: "skills", label: "기술" },
  { id: "projects", label: "프로젝트" },
  { id: "requirements", label: "해본 일" },
  { id: "education", label: "교육" },
  { id: "contact", label: "연락처" },
] as const;

// 스크롤해도 따라오는 상단 메뉴 — 누르면 해당 섹션으로 바로 이동
export default function SiteNav({ name, github }: { name: string; github: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-night/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5">
        <a href="#about" className="shrink-0 text-[1.35rem] font-bold">
          {name}
        </a>
        <ul className="flex flex-1 gap-1 overflow-x-auto whitespace-nowrap text-sm">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="block rounded-lg px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href={github}
          target="_blank"
          rel="noreferrer"
          className="hidden shrink-0 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20 sm:block"
        >
          GitHub
        </a>
      </nav>
    </header>
  );
}
