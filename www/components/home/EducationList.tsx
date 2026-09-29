import type { Profile } from "@/lib/content/schema";

export default function EducationList({ education }: { education: Profile["education"] }) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <h2 className="text-2xl font-bold md:text-3xl">교육</h2>
      <ul className="mt-8 space-y-4">
        {education.map((e) => (
          <li key={e.org} className="glass rounded-3xl p-6">
            <p className="text-sm text-white/50">{e.period}</p>
            <p className="mt-1 font-bold">{e.org}</p>
            <p className="mt-1 text-white/75">{e.course}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {e.topics.map((t) => (
                <li key={t} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
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
