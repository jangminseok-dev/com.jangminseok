import type { MatrixRow } from "@/lib/matrix";
import { projectHref } from "@/lib/site";
import { slideAnchor } from "@/lib/slides";

export default function RequirementMatrix({ rows, isProd }: { rows: MatrixRow[]; isProd: boolean }) {
  return (
    <section className="mx-auto max-w-5xl px-5 py-16">
      <h2 className="text-2xl font-bold text-ink md:text-3xl">이런 일을 해봤어요</h2>
      <p className="mt-2 text-ink-sub">요건마다 근거가 되는 슬라이드로 바로 이동할 수 있어요.</p>
      <ul className="mt-8 divide-y divide-line rounded-3xl bg-surface">
        {rows.map((row) => (
          <li key={row.id} className="grid grid-cols-1 gap-3 p-5 md:grid-cols-[14rem_1fr] md:p-6">
            <div>
              <p className="font-semibold text-ink">{row.label}</p>
              <p className="mt-1 text-sm text-ink-mute">{row.detail}</p>
            </div>
            <div className="flex flex-wrap content-start gap-2">
              {row.evidence.length ? (
                row.evidence.map((ev) => (
                  <a
                    key={`${ev.slug}-${ev.slideNumber}`}
                    href={`${projectHref(ev.slug, isProd)}#${slideAnchor(ev.slideNumber)}`}
                    className="rounded-full bg-white px-3 py-1.5 text-sm text-ink-sub shadow-sm hover:text-brand"
                  >
                    {ev.projectTitle} · {ev.slideTitle}
                  </a>
                ))
              ) : (
                <span className="text-sm text-ink-mute">준비 중</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
