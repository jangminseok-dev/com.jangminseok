import { Fragment } from "react";
import Slide from "@/components/slides/Slide";
import { mediaUrl } from "@/lib/content/media";
import type { DecisionSlide } from "@/lib/content/schema";
import { slideAnchor } from "@/lib/slides";

const STAT_KEYS = ["problem", "choice", "cost", "effect"] as const;
const STAT_LABEL: Record<(typeof STAT_KEYS)[number], string> = {
  problem: "문제",
  choice: "선택",
  cost: "대가",
  effect: "효과",
};

type Props = { n: number; slug: string; slide: DecisionSlide };

export default function SlideDecision({ n, slug, slide }: Props) {
  return (
    <Slide n={n}>
      <h2 className="text-3xl font-bold leading-tight md:text-5xl">
        <span className="text-(--accent)">{slideAnchor(n)}.</span> {slide.title}
      </h2>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-white/80">{slide.summary}</p>

      <dl className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_KEYS.map((key) => (
          <div key={key} className="glass rounded-2xl p-4">
            <dt className="text-sm font-semibold text-(--accent)">{STAT_LABEL[key]}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-white/85">{slide.stats[key]}</dd>
          </div>
        ))}
      </dl>

      <div
        className={`mt-8 flex flex-col items-center gap-3 md:flex-row ${slide.frames.length === 1 ? "mx-auto max-w-3xl" : ""}`}
      >
        {slide.frames.map((frame, i) => (
          <Fragment key={frame.image}>
            {i > 0 ? (
              <span aria-hidden className="shrink-0 rotate-90 text-2xl text-(--accent) md:rotate-0">
                →
              </span>
            ) : null}
            <figure className="glass w-full min-w-0 flex-1 overflow-hidden rounded-2xl">
              <img
                src={mediaUrl(slug, frame.image)}
                alt={frame.caption}
                loading="lazy"
                className="aspect-video w-full object-cover object-top"
              />
              <figcaption className="px-3 py-2 text-center text-sm text-white/80">{frame.caption}</figcaption>
            </figure>
          </Fragment>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold text-(--accent)">왜 이 선택인가 — 버린 대안</h3>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-white/85">
            {slide.alternatives.map((alt) => (
              <li key={alt.name}>
                <span className="font-semibold text-white">{alt.name}</span>
                <br />
                {alt.reason}
              </li>
            ))}
          </ul>
        </div>
        {slide.concept ? (
          <div className="glass rounded-2xl border-(--accent)/50 p-5">
            <h3 className="font-semibold text-(--accent)">{slide.concept.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/85">{slide.concept.body}</p>
          </div>
        ) : null}
      </div>

      <p className="mt-6 flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/65">
        <span>근거:</span>
        {slide.evidence.map((ev) => (
          <span key={ev.label}>
            {ev.url ? (
              <a href={ev.url} target="_blank" rel="noreferrer" className="underline hover:text-white">
                {ev.label}
              </a>
            ) : (
              ev.label
            )}
          </span>
        ))}
      </p>
    </Slide>
  );
}
