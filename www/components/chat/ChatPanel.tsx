"use client";

import { useState } from "react";
import { AgentError, askAgent } from "@/lib/agentApi";
import type { AskResponse } from "@/lib/agentApi";

const EXAMPLES = ["CallGuard에서 개인정보는 어떻게 보호했나요?", "Elasticsearch를 쓴 프로젝트는 무엇인가요?", "RedOceanMap의 평가 방식은?"];

type Turn = { question: string; result: AskResponse | null; error: string | null };

export default function ChatPanel({ onClose }: { onClose: () => void }) {
  const [state, setState] = useState<{ turns: Turn[]; busy: boolean }>({ turns: [], busy: false });

  const ask = async (question: string) => {
    if (!question.trim() || state.busy) return;
    setState((s) => ({ busy: true, turns: [...s.turns, { question, result: null, error: null }] }));
    try {
      const result = await askAgent(question.trim());
      setState((s) => ({ busy: false, turns: s.turns.map((t, i) => (i === s.turns.length - 1 ? { ...t, result } : t)) }));
    } catch (e) {
      const error = e instanceof AgentError ? e.detail : "연결할 수 없습니다.";
      setState((s) => ({ busy: false, turns: s.turns.map((t, i) => (i === s.turns.length - 1 ? { ...t, error } : t)) }));
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
    <div className="glass fixed bottom-24 right-5 z-50 flex max-h-[70dvh] w-[min(26rem,calc(100vw-2.5rem))] flex-col rounded-3xl text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <p className="font-semibold">포트폴리오에 질문하기</p>
        <button type="button" onClick={onClose} className="text-white/70 hover:text-white" aria-label="닫기">✕</button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4 text-sm">
        {state.turns.length === 0 ? (
          <div className="space-y-2">
            <p className="text-white/70">도구로 슬라이드를 찾아 근거와 함께 답합니다.</p>
            {EXAMPLES.map((q) => (
              <button key={q} type="button" onClick={() => void ask(q)} className="block w-full rounded-xl bg-white/10 px-3 py-2 text-left hover:bg-white/15">
                {q}
              </button>
            ))}
          </div>
        ) : null}
        {state.turns.map((t, i) => (
          <div key={i} className="space-y-2">
            <p className="ml-8 rounded-2xl bg-brand/80 px-3 py-2">{t.question}</p>
            {t.error ? <p className="rounded-2xl bg-white/10 px-3 py-2 text-white/80">{t.error}</p> : null}
            {t.result ? (
              <div className="mr-8 space-y-2 rounded-2xl bg-white/10 px-3 py-2">
                <p className="whitespace-pre-line leading-relaxed">{t.result.answer}</p>
                {t.result.sources.length ? (
                  <ul className="flex flex-wrap gap-2">
                    {t.result.sources.map((s) => (
                      <li key={s.url}>
                        <a href={s.url} className="rounded-full bg-white/10 px-2 py-1 text-xs hover:bg-white/20">{s.title}</a>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {t.result.tool_calls.length ? (
                  <details className="text-xs text-white/60">
                    <summary>사용한 도구 {t.result.tool_calls.length}개</summary>
                    <ul className="mt-1 space-y-1 font-mono">
                      {t.result.tool_calls.map((c, j) => (
                        <li key={j}>{c.ok ? "✓" : "✗"} {c.name}({JSON.stringify(c.args)})</li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </div>
            ) : null}
            {!t.result && !t.error ? <p className="text-white/60">도구로 찾는 중입니다…</p> : null}
          </div>
        ))}
      </div>
      <form onSubmit={onSubmit} className="flex gap-2 border-t border-white/10 p-3">
        <input name="question" maxLength={500} placeholder="질문을 입력해 주십시오" className="min-w-0 flex-1 rounded-xl bg-white/10 px-3 py-2 text-sm outline-none placeholder:text-white/50" />
        <button type="submit" disabled={state.busy} className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold disabled:opacity-50">보내기</button>
      </form>
    </div>
  );
}
