import TroubleFigure from "@/components/home/TroubleFigure";
import type { Project } from "@/lib/content/schema";
import { projectHref } from "@/lib/site";

// 메인 트러블슈팅 구역 — 문장은 각 프로젝트 page.yaml 트러블슈팅(troubles)의 사실을 줄인 것. 숫자는 원고에 있는 값만 쓴다
type Incident = {
  slug: string;
  title: string;
  figure: { value: string; label: string; before?: boolean };
  steps: [string, string, string, string];
};

// 프로젝트 페이지의 트러블슈팅 칸 이름(문제, 원인, 해결, 결과)과 맞춘다
const STEP_LABELS = ["문제", "원인", "해결", "결과"] as const;

export const INCIDENTS: Incident[] = [
  {
    slug: "redoceanmap",
    title: "지표는 정상인데 답은 모두 틀리던 장애를 찾아 고쳤습니다",
    figure: { value: "44건 중 0건", label: "지표는 1.0인데 실제로 성공한 응답", before: true },
    steps: [
      "상권 코드를 돌려주던 응답이 40건 중 40건에서 44건 중 0건이 됐습니다. 지역 적중률 지표는 1.0으로 정상처럼 보였습니다.",
      "프롬프트가 4,178토큰으로 늘어 Ollama 기본 문맥 창 4,096토큰을 넘었습니다. 넘친 앞부분의 답변 형식 지시가 잘렸습니다.",
      "문맥 창을 8,192토큰으로 명시하고, 처리한 토큰 수가 한도에 가까워지면 경고를 남기게 했습니다.",
      "같은 프롬프트가 잘리지 않고 정상 형식으로 돌아옵니다. 이 조건은 회귀 테스트로 고정했고, AI 서버 상태를 매일 점검하게 했습니다.",
    ],
  },
  {
    slug: "callguard",
    title: "말하는 도중의 자막에 번호가 새던 문제를, 그 자막만 넓게 가려 막았습니다",
    figure: { value: "6건 중 5건", label: "번호 앞자리가 보이던 운영 표본", before: true },
    steps: [
      "운영 표본 6건 중 5건에서, 말하는 도중에 뜨는 자막에 카드번호와 전화번호 앞자리가 보였습니다.",
      "마스킹 규칙은 완성된 번호만 찾습니다. 아직 말하고 있는 7~8자리 숫자는 어느 규칙에도 맞지 않았습니다.",
      "완성본 규칙을 넓히면 금액과 호수까지 가려집니다. 그래서 말하는 도중의 자막에만 세 자리 이상 숫자를 모두 가리는 규칙을 얹었습니다.",
      "저장되는 완성본 자막은 그대로 두면서, 화면에 번호가 스치는 일을 막았습니다.",
    ],
  },
  {
    slug: "portfolio",
    title: "평가로 찾은 챗봇 결함을 고쳐, 도구 선택 정확도를 0.533에서 0.933으로 올렸습니다",
    figure: { value: "0.533 → 0.933", label: "도구 선택 정확도, 골든셋 30문항 첫 채점과 10월 7일 3회 평가 최저값" },
    steps: [
      "골든셋 30문항으로 처음 채점했을 때, 챗봇이 질문에 맞는 도구를 고른 비율이 0.533이었습니다.",
      "AI가 프로젝트 이름을 짐작해 없는 값을 넣었고, 도구를 3번 부른 뒤에는 모은 근거가 있어도 답하지 않았습니다.",
      "도구 설명에 실제 프로젝트 이름 목록을 넣고, 호출 한도에 닿으면 모은 근거로 답하게 했습니다. 잘못 세던 채점 기준도 바로잡았습니다.",
      "남은 오답까지 문항별로 고친 뒤, 10월 7일 3회 평가에서 가장 낮은 값이 0.933이었습니다.",
    ],
  },
];

function DetailLink({ href, label, className }: { href: string; label: string; className: string }) {
  return (
    <a
      href={href}
      className={`trouble-link inline-flex items-center rounded-2xl border border-(--accent)/60 bg-(--accent)/20 px-5 py-3 text-base font-semibold text-white hover:bg-(--accent)/30 ${className}`}
    >
      {label}
    </a>
  );
}

export default function TroubleLog({ projects, isProd }: { projects: Project[]; isProd: boolean }) {
  const bySlug = new Map(projects.map((p) => [p.slug, p]));
  return (
    <section id="troubleshooting" className="mx-auto max-w-7xl px-5 py-16">
      <h2 className="display text-3xl md:text-4xl">트러블슈팅</h2>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/80">
        문제가 생긴 뒤 원인을 찾아 고치고, 다시 생기지 않게 막은 기록입니다. 숫자는 모두 측정한 값입니다.
      </p>
      <ol className="mt-10 space-y-8">
        {INCIDENTS.map((it) => {
          const p = bySlug.get(it.slug);
          if (!p) return null;
          const href = `${projectHref(p.slug, isProd)}#05`;
          return (
            // 별빛과 도시 불빛이 글자 뒤에서 오르내려 읽기 어려웠다 — 사례마다 프로젝트 카드와 같은 glass 판을 깐다(배경은 판 사이로 보인다)
            <li
              key={it.slug}
              className="glass rounded-3xl border-t-[3px] p-6 md:p-8"
              style={{ borderTopColor: p.accent, ["--accent" as string]: p.accent }}
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="max-w-3xl">
                  <p className="flex items-center gap-2 text-sm font-semibold text-white/80">
                    <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: p.accent }} />
                    {p.title}
                  </p>
                  <h3 className="mt-2 text-xl font-bold leading-snug md:text-2xl">{it.title}</h3>
                </div>
                {/* 넓은 화면에서는 버튼을 숫자 아래에 둔다 — 판 오른쪽 아래에 두면 화면 아래 떠 있는 챗봇 입력창에 가려졌다 */}
                <div className="flex shrink-0 flex-col gap-5 md:items-end md:text-right">
                  <TroubleFigure figure={it.figure} tone="text-brand-soft" />
                  <DetailLink href={href} label={`${p.title} 페이지에서 자세히 보기`} className="max-md:hidden" />
                </div>
              </div>
              <ol className="mt-7 grid gap-6 md:grid-cols-4 md:gap-5">
                {it.steps.map((text, i) => (
                  <li key={STEP_LABELS[i]}>
                    <p className="flex items-center gap-2.5 text-sm font-semibold">
                      <span className="num text-lg leading-none text-brand-soft">{i + 1}</span>
                      {STEP_LABELS[i]}
                      <span aria-hidden className="hidden h-px flex-1 bg-white/20 md:block" />
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-white/85">{text}</p>
                  </li>
                ))}
              </ol>
              {/* 휴대폰에서는 판 너비에 꽉 차게, 글자는 짧게 — 긴 글자는 두 줄로 꺾였다 */}
              <DetailLink href={href} label="자세히 보기" className="mt-6 w-full justify-center md:hidden" />
            </li>
          );
        })}
      </ol>
    </section>
  );
}
