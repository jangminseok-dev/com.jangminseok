"use client";

import { useCallback, useState } from "react";
import ChatDialog from "@/components/chat/ChatDialog";
import type { Turn } from "@/components/chat/ChatDialog";
import { AgentError, askAgent } from "@/lib/agentApi";

// 평가 시험 문제(minseok/apps/agent/eval/golden.yaml) 중 도구, 근거, 핵심 사실이 모두 맞은 질문에서 채용 담당자가 물을 만한 것만 — 입력창을 누를 때마다 3개를 새로 고른다
const EXAMPLE_POOL = [
  "Elasticsearch를 쓴 프로젝트는 무엇인가요?",
  "CallGuard에서 개인정보는 어떻게 보호했나요?",
  "RedOceanMap에서 하이브리드 검색을 기각한 이유는 무엇인가요?",
  "k3s를 써 본 프로젝트는 어디인가요?",
  "Docker를 쓴 프로젝트들은 배포를 어떻게 구성했나요?",
  "차곡노트는 AI로 대량으로 코드를 짜면서 구조를 어떻게 지켰나요?",
];
const EXAMPLE_COUNT = 3;

const pickExamples = () => [...EXAMPLE_POOL].sort(() => Math.random() - 0.5).slice(0, EXAMPLE_COUNT);

export default function ChatDock() {
  const [state, setState] = useState<{ turns: Turn[]; busy: boolean; open: boolean; examples: string[] }>({
    turns: [],
    busy: false,
    open: false,
    // 서버와 브라우저의 첫 화면이 같도록 처음에는 고정된 3개, 입력창을 누르면 새로 고른다
    examples: EXAMPLE_POOL.slice(0, EXAMPLE_COUNT),
  });

  const close = useCallback(() => setState((s) => ({ ...s, open: false })), []);

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || state.busy) return;
    setState((s) => ({ ...s, busy: true, open: true, turns: [...s.turns, { question: q, result: null, error: null }] }));
    const settle = (patch: Partial<Turn>) =>
      setState((s) => ({ ...s, busy: false, turns: s.turns.map((t, i) => (i === s.turns.length - 1 ? { ...t, ...patch } : t)) }));
    try {
      settle({ result: await askAgent(q) });
    } catch (e) {
      settle({ error: e instanceof AgentError ? e.detail : "연결할 수 없습니다." });
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const question = String(new FormData(form).get("question") ?? "");
    form.reset();
    void ask(question);
  };

  return (
    <>
      {state.open ? <ChatDialog turns={state.turns} onClose={close} /> : null}
      {/* 고정 바가 페이지 끝 내용을 가리지 않도록 자리를 비워 둔다 */}
      <div aria-hidden className="h-24" />
      <div className="group fixed inset-x-0 bottom-5 z-50 mx-auto w-[min(48rem,calc(100vw-2rem))]">
        {state.turns.length === 0 ? (
          // 검색창 추천어처럼 입력창과 같은 불투명 배경의 목록 — 칩은 밤하늘 배경에 묻혀 읽기 어려웠다
          <div className="mb-2 hidden rounded-3xl border border-white/10 bg-panel p-2 backdrop-blur-xl group-focus-within:block">
            <p className="px-3 pb-1 pt-2 text-sm text-white/70">예시 질문</p>
            <ul>
              {state.examples.map((q) => (
                <li key={q}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => void ask(q)}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm text-white hover:bg-white/10"
                  >
                    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-brand-soft" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {q}
                  </button>
                </li>
              ))}
            </ul>
            {/* 질문 저장은 minseok/core/question_log.py */}
            <p className="px-3 pb-2 pt-1 text-sm text-white/70">질문과 답변은 챗봇 개선을 위해 보관합니다. 개인정보는 입력하지 마십시오.</p>
          </div>
        ) : null}
        {/* 밤하늘 배경에 묻히지 않도록 그라데이션 테두리와 빛 번짐을 준다. 입력 중에는 빛 번짐이 짙어진다 */}
        <div className="rounded-full bg-linear-to-r from-brand via-brand-soft to-violet-400 p-[1.5px] shadow-[0_0_36px_rgb(49_130_246/0.45)] focus-within:shadow-[0_0_44px_rgb(49_130_246/0.75)]">
          <form onSubmit={onSubmit} className="flex items-center gap-3 rounded-full bg-panel py-2 pl-5 pr-2 text-white backdrop-blur-xl">
            {/* 검색창이 아니라 챗봇임을 알리는 말풍선 */}
            <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-brand-soft" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              name="question"
              maxLength={500}
              autoComplete="off"
              onFocus={(e) => {
                // 예시 질문에서 키보드로 돌아온 경우는 보던 목록을 유지한다
                const fromList = e.relatedTarget instanceof Node && !!e.currentTarget.closest(".group")?.contains(e.relatedTarget);
                setState((s) => (s.turns.length ? { ...s, open: true } : fromList ? s : { ...s, examples: pickExamples() }));
              }}
              placeholder="직접 만든 챗봇에게 물어보십시오"
              aria-label="포트폴리오에 질문하기"
              className="min-w-0 flex-1 bg-transparent py-1.5 text-base outline-none placeholder:text-white/75"
            />
            <button
              type="submit"
              disabled={state.busy}
              aria-label="보내기"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-paper hover:opacity-90 disabled:opacity-50"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
