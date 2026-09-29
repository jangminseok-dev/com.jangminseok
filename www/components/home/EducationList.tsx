import type { Profile } from "@/lib/content/schema";

export default function EducationList({ education }: { education: Profile["education"] }) {
  return (
    <section className="mx-auto max-w-5xl px-5 py-16">
      <h2 className="text-2xl font-bold text-ink md:text-3xl">교육</h2>
      <ul className="mt-8 space-y-4">
        {education.map((e) => (
          <li key={e.org} className="rounded-3xl bg-surface p-6">
            <p className="text-sm text-ink-mute">{e.period}</p>
            <p className="mt-1 font-bold text-ink">{e.org}</p>
            <p className="mt-1 text-ink-sub">{e.course}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {e.topics.map((t) => (
                <li key={t} className="rounded-full bg-white px-3 py-1 text-xs text-ink-sub">
                  {t}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
