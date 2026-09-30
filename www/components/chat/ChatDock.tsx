"use client";

import { useCallback, useState } from "react";
import ChatDialog from "@/components/chat/ChatDialog";
import type { Turn } from "@/components/chat/ChatDialog";
import { AgentError, askAgent } from "@/lib/agentApi";

const EXAMPLES = ["CallGuard에서 개인정보는 어떻게 보호했나요?", "Elasticsearch를 쓴 프로젝트는 무엇인가요?", "RedOceanMap의 평가 방식은?"];

export default function ChatDock() {
  const [state, setState] = useState<{ turns: Turn[]; busy: boolean; open: boolean }>({ turns: [], busy: false, open: false });

  const close = useCallback(() => setState((s) => ({ ...s, open: false })), []);

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || state.busy) return;
    setState((s) => ({ busy: true, open: true, turns: [...s.turns, { question: q, result: null, error: null }] }));
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
          <ul className="mb-2 hidden flex-wrap justify-center gap-2 group-focus-within:flex">
            {EXAMPLES.map((q) => (
              <li key={q}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => void ask(q)}
                  className="glass rounded-full px-3 py-1.5 text-xs text-white/85 hover:text-white"
                >
                  {q}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {/* 밤하늘 배경에 묻히지 않도록 그라데이션 테두리와 빛 번짐을 준다 */}
        <div className="rounded-full bg-linear-to-r from-brand via-brand-soft to-violet-400 p-[1.5px] shadow-[0_0_36px_rgb(49_130_246/0.45)]">
          <form onSubmit={onSubmit} className="flex items-center gap-3 rounded-full bg-[rgb(14_16_30/0.92)] py-2 pl-5 pr-2 text-white backdrop-blur-xl">
            <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-brand-soft" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input
              name="question"
              maxLength={500}
              autoComplete="off"
              onFocus={() => (state.turns.length ? setState((s) => ({ ...s, open: true })) : undefined)}
              placeholder="프로젝트에 대해 물어보십시오"
              aria-label="포트폴리오에 질문하기"
              className="min-w-0 flex-1 bg-transparent py-1.5 text-base outline-none placeholder:text-white/75"
            />
            <button
              type="submit"
              disabled={state.busy}
              aria-label="보내기"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-white hover:opacity-90 disabled:opacity-50"
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
