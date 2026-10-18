import type { Project } from "@/lib/content/schema";
import { projectHref } from "@/lib/site";

// 메인 "일하는 방식" 구역 — 처음 다룬 문제를 익힌 방법과 직접 설계한 평가 기준을 사례 하나씩으로 보인다
// 문장은 각 프로젝트 page.yaml과 notes.md의 사실을 줄인 것. 숫자는 원고에 있는 값만 쓴다(facts.test.ts가 확인)
type Story = {
  slug: string;
  title: string;
  rows: { label: string; text: string }[];
};

export const STORIES: Story[] = [
  {
    slug: "remakeday",
    title: "처음 다룬 GPU 메모리 문제를 실측으로 익혔습니다",
    rows: [
      {
        label: "몰랐던 것",
        text: "16GB GPU 한 장에 AI 모델 두 개를 함께 올려야 했습니다. 모델이 GPU 메모리를 실제로 얼마나 차지하는지 몰라 처음에는 파일 크기로 짐작했습니다. 파일이 8.95 GiB인 후보가 실제로는 3.06 GiB만 차지해 짐작이 크게 빗나갔습니다.",
      },
      {
        label: "익힌 방법",
        text: "그 뒤로는 실제로 올려서 측정한 값으로만 판단했습니다. 한 모델을 먼저 올리고 다른 후보를 올렸습니다. 두 모델에 번갈아 요청을 보내며 요청마다 GPU에 올라가 있는 모델을 기록했습니다. 한 모델이 밀려나거나 일부가 CPU로 넘어가는지 확인하는 방법입니다.",
      },
      {
        label: "결과",
        text: "채택한 두 모델은 합계 12.42 GiB였습니다. 번갈아 요청한 구간에서 밀려난 모델이 없었습니다. 약 1분의 짧은 측정이라 여러 사람이 동시에 접속하는 부하는 아직 측정 전입니다.",
      },
    ],
  },
  {
    slug: "redoceanmap",
    title: "AI 답변을 채점하는 평가 기준을 직접 설계했습니다",
    rows: [
      {
        label: "설계",
        text: "AI 답을 받아 기록하는 단계와 그 기록을 규칙으로 채점하는 단계를 나눴습니다. 채점은 AI가 아니라 규칙이 하므로 같은 기록은 언제나 같은 점수를 받습니다. 데이터도 한 시점의 사본으로 고정해 데이터가 바뀌어도 정답이 흔들리지 않게 했습니다.",
      },
      {
        label: "기준선을 정한 이유",
        text: "같은 조건으로 4번 돌려도 종목 질문 정확도가 0.767에서 0.833 사이를 오갔습니다. 이 폭은 회귀로 보는 허용치 3%p보다 넓습니다. 최고 기록을 기준으로 삼으면 평소 수준의 실행도 실패가 됩니다. 그래서 여러 번 돌려 나온 가장 낮은 값을 기준선으로 삼았습니다.",
      },
      {
        label: "포기한 것",
        text: "답이 얼마나 유용한지 같은 주관적인 품질은 측정하지 않습니다. 데이터 사본의 통계 일부가 합성이라 답이 사실인지보다 근거를 지켰는지를 측정합니다.",
      },
      {
        label: "결과",
        text: "후보 모델들에게 같은 시험을 치르게 해 답변 모델을 바꿨습니다. 교체 뒤 골든셋 144문항에서 오류가 0건이었습니다.",
      },
    ],
  },
];

export default function WorkStyle({ projects, isProd }: { projects: Project[]; isProd: boolean }) {
  const bySlug = new Map(projects.map((p) => [p.slug, p]));
  return (
    <section id="approach" className="mx-auto max-w-7xl px-5 py-16">
      <h2 className="display text-3xl md:text-4xl">일하는 방식</h2>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/80">
        처음 다룬 문제를 어떻게 익혔는지, 평가 기준을 어떻게 세웠는지 한 가지씩 적었습니다.
      </p>
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {STORIES.map((s) => {
          const p = bySlug.get(s.slug);
          if (!p) return null;
          return (
            // 트러블슈팅과 같은 glass 판 — 배경 사진 위에서도 글이 읽히게
            <article key={s.slug} className="glass flex flex-col rounded-3xl p-6 md:p-8" style={{ ["--accent" as string]: p.accent }}>
              <p className="flex items-center gap-2 text-sm font-semibold text-white/80">
                <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: p.accent }} />
                {p.title}
              </p>
              <h3 className="mt-2 text-xl font-bold leading-snug md:text-2xl">{s.title}</h3>
              {/* 넓은 화면에서는 이름표를 왼쪽 칸에, 좁은 화면에서는 글 위에 둔다 */}
              <dl className="mt-6 space-y-5 sm:grid sm:grid-cols-[8.5rem_1fr] sm:gap-x-5 sm:gap-y-5 sm:space-y-0">
                {s.rows.map((r) => (
                  <div key={r.label} className="sm:contents">
                    <dt className="border-l-2 border-(--accent) pl-3 text-sm font-semibold leading-relaxed text-brand-soft">{r.label}</dt>
                    <dd className="mt-1.5 text-base leading-relaxed text-white/85 sm:mt-0">{r.text}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-auto flex justify-end pt-7">
                <a
                  href={`${projectHref(p.slug, isProd)}#05`}
                  className="inline-flex items-center rounded-2xl border border-(--accent)/60 bg-(--accent)/20 px-5 py-3 text-base font-semibold text-white hover:bg-(--accent)/30"
                >
                  {p.title} 페이지에서 자세히 보기
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
