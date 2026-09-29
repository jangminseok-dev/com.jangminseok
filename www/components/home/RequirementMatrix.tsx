import type { MatrixRow } from "@/lib/matrix";
import { projectHref } from "@/lib/site";
import { slideAnchor } from "@/lib/slides";

export default function RequirementMatrix({ rows, isProd }: { rows: MatrixRow[]; isProd: boolean }) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <h2 className="text-2xl font-bold md:text-3xl">이런 일을 해봤어요</h2>
      <p className="mt-2 text-white/70">요건마다 근거가 되는 슬라이드로 바로 이동할 수 있어요.</p>
      <ul className="glass mt-8 divide-y divide-white/10 rounded-3xl">
        {rows.map((row) => (
          <li
            key={row.id}
            id={`req-${row.id}`}
            className="grid scroll-mt-24 grid-cols-1 gap-3 p-5 md:grid-cols-[14rem_1fr] md:p-6"
          >
            <div>
              <p className="font-semibold">{row.label}</p>
              <p className="mt-1 text-sm text-white/60">{row.detail}</p>
            </div>
            <div className="flex flex-wrap content-start gap-2">
              {row.evidence.length ? (
                row.evidence.map((ev) => (
                  <a
                    key={`${ev.slug}-${ev.slideNumber}`}
                    href={`${projectHref(ev.slug, isProd)}#${slideAnchor(ev.slideNumber)}`}
                    className="rounded-full bg-white/10 px-3 py-1.5 text-sm text-white/85 hover:bg-white/20 hover:text-white"
                  >
                    {ev.projectTitle} · {ev.slideTitle}
                  </a>
                ))
              ) : (
                <span className="text-sm text-white/50">준비 중</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
