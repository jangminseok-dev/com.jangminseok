import { groupEvidenceByProject } from "@/lib/matrix";
import type { MatrixRow } from "@/lib/matrix";
import { projectHref } from "@/lib/site";

export default function RequirementMatrix({ rows, isProd }: { rows: MatrixRow[]; isProd: boolean }) {
  return (
    <section id="requirements" className="mx-auto max-w-7xl px-5 py-16">
      <h2 className="text-2xl font-bold md:text-3xl">이런 일을 해왔습니다</h2>
      <p className="mt-2 text-white/70">요건마다 근거가 되는 프로젝트 설명으로 바로 이동할 수 있습니다.</p>
      <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {rows.map((row, i) => (
          <li key={row.id} id={`req-${row.id}`} className="glass flex flex-col rounded-3xl p-5 md:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/20 text-sm font-bold text-brand-soft">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-lg font-bold leading-snug">{row.label}</h3>
              </div>
              <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/75">
                근거 {row.evidence.length}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/70">{row.detail}</p>

            {row.evidence.length ? (
              <ul className="mt-4 space-y-2.5 border-t border-white/10 pt-4">
                {groupEvidenceByProject(row.evidence).map((g) => (
                  <li key={g.slug} className="grid grid-cols-[8.5rem_1fr] items-baseline gap-3 text-sm">
                    <span className="flex items-center gap-2 truncate font-semibold">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: g.accent }} />
                      {g.projectTitle}
                    </span>
                    <span className="flex flex-wrap gap-x-3 gap-y-1 text-white/75">
                      {g.items.map((it, j) => (
                        <span key={`${it.anchor}-${j}`}>
                          <a
                            href={`${projectHref(g.slug, isProd)}#${it.anchor}`}
                            className="underline decoration-white/25 underline-offset-4 hover:text-white hover:decoration-brand-soft"
                          >
                            {it.label}
                          </a>
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 border-t border-white/10 pt-4 text-sm text-white/50">준비 중</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
