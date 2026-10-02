import { logoStyle, skillIcon } from "@/lib/icons";

// 기술 이름 + 로고 칩 — 기술 스택 보드와 교육 섹션이 함께 쓴다 (서버 컴포넌트 전용)
export default function TechChip({ name, icon, dashed = false }: { name: string; icon?: string; dashed?: boolean }) {
  const logo = icon ? skillIcon(icon) : null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm ${
        dashed ? "border border-dashed border-white/30 text-white/65" : "bg-white/12 font-medium text-white"
      }`}
    >
      {logo ? (
        <svg viewBox="0 0 24 24" aria-hidden className="logo h-4 w-4 shrink-0" style={logoStyle(logo)}>
          <path d={logo.path} />
        </svg>
      ) : null}
      {name}
    </span>
  );
}
