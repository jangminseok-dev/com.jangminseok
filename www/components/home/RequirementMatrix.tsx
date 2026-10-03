import { groupEvidenceByProject } from "@/lib/matrix";
import type { MatrixRow } from "@/lib/matrix";
import { projectHref } from "@/lib/site";

export default function RequirementMatrix({ rows, isProd }: { rows: MatrixRow[]; isProd: boolean }) {
  return (
    <section id="requirements" className="mx-auto max-w-7xl px-5 py-16">
      <h2 className="text-2xl font-bold md:text-3xl">스킬 인벤토리</h2>
      <p className="mt-2 text-white/70">요건마다 근거가 되는 프로젝트 설명으로 바로 이동할 수 있습니다.</p>
      <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {rows.map((row) => (
          <li key={row.id} id={`req-${row.id}`} className="glass flex flex-col rounded-3xl p-5 md:p-6">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-bold leading-snug">{row.label}</h3>
              <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-sm text-white/75">
                근거 {row.evidence.length}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-white/70">{row.detail}</p>

            {row.evidence.length ? (
              <ul className="mt-4 space-y-3 border-t border-white/10 pt-4">
                {groupEvidenceByProject(row.evidence).map((g) => (
                  <li key={g.slug} className="grid grid-cols-[8.5rem_1fr] items-baseline gap-3 text-sm">
                    <span className="flex items-center gap-2 truncate font-semibold">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: g.accent }} />
                      {g.projectTitle}
                    </span>
                    {/* 근거는 한 줄에 하나 — 여러 링크가 한 줄에 이어지면 어디까지가 한 항목인지 읽기 어렵다 */}
                    <ul className="space-y-1.5 text-white/85">
                      {g.items.map((it, j) => (
                        <li key={`${it.anchor}-${j}`}>
                          <a
                            href={`${projectHref(g.slug, isProd)}#${it.anchor}`}
                            className="underline decoration-white/25 underline-offset-4 hover:text-white hover:decoration-brand-soft"
                          >
                            {it.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 border-t border-white/10 pt-4 text-sm text-white/70">준비 중</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
