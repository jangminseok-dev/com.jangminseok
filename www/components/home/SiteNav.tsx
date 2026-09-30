const SECTIONS = [
  { id: "about", label: "소개" },
  { id: "skills", label: "기술" },
  { id: "projects", label: "프로젝트" },
  { id: "requirements", label: "해본 일" },
  { id: "education", label: "교육" },
  { id: "contact", label: "연락처" },
] as const;

// 스크롤해도 따라오는 상단 메뉴 — 누르면 해당 섹션으로 바로 이동
// base: 메인에서는 "" — 프로젝트 페이지에서는 메인 주소를 넘겨 메인의 섹션으로 이동한다
export default function SiteNav({ name, github, base = "" }: { name: string; github: string; base?: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-night/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-5 sm:gap-6">
        <a href={`${base}#about`} className="shrink-0 text-[1.35rem] font-bold">
          {name}
        </a>
        {/* 모바일에선 옆으로 밀어서 본다 — 오른쪽 끝을 흐려 더 있다는 걸 알리고, 끝까지 밀면 마지막 항목이 흐림 밖으로 나오게 여백을 둔다 */}
        <ul className="flex flex-1 gap-1 overflow-x-auto whitespace-nowrap text-sm max-sm:pr-10 max-sm:[mask-image:linear-gradient(to_right,#000_85%,transparent)]">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`${base}#${s.id}`} className="block rounded-lg px-2 py-2 text-white/80 sm:px-3 hover:bg-white/10 hover:text-white">
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
