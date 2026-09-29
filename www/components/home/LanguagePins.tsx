import type { Language } from "@/lib/content/schema";
import { skillIcon } from "@/lib/icons";

const ICON: Record<Language, string> = {
  Python: "python",
  TypeScript: "typescript",
  Dart: "dart",
  JavaScript: "javascript",
  Java: "openjdk",
};

// 카드 미리보기 오른쪽 위에 얹는 작은 언어 핀 — 화면을 가리지 않게 작고 반투명하게
export default function LanguagePins({ languages }: { languages: readonly Language[] }) {
  return (
    <ul className="pointer-events-none absolute right-3 top-3 flex gap-1.5" aria-label="주 사용 언어">
      {languages.map((lang) => {
        const icon = skillIcon(ICON[lang]);
        return (
          <li
            key={lang}
            className="flex items-center gap-1 rounded-full border border-white/15 bg-night/75 px-2 py-1 text-[11px] font-medium leading-none text-white/90 backdrop-blur-sm"
          >
            {icon ? (
              <svg viewBox="0 0 24 24" aria-hidden className="h-3 w-3" fill={icon.color}>
                <path d={icon.path} />
              </svg>
            ) : null}
            {lang}
          </li>
        );
      })}
    </ul>
  );
}
