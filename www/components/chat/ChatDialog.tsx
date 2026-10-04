"use client";

import { useEffect, useRef } from "react";
import { answerParts, citedSources } from "@/lib/agentApi";
import type { AskResponse } from "@/lib/agentApi";

export type Turn = { question: string; result: AskResponse | null; error: string | null };

export default function ChatDialog({ turns, onClose }: { turns: Turn[]; onClose: () => void }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div aria-hidden onClick={onClose} className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="포트폴리오 질문 대화"
        className="glass fixed inset-x-0 bottom-24 top-16 z-50 mx-auto flex w-[min(42rem,calc(100vw-2rem))] flex-col rounded-3xl text-white"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <p className="font-semibold">포트폴리오에 질문하기</p>
          <button type="button" onClick={onClose} className="text-white/70 hover:text-white" aria-label="닫기">
            ✕
          </button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4 text-sm">
          {turns.map((t, i) => (
            <div key={i} className="space-y-2">
              <p className="ml-auto w-fit max-w-[85%] rounded-2xl bg-brand/80 px-3 py-2 text-paper">{t.question}</p>
              {t.error ? <p className="w-fit max-w-[85%] rounded-2xl bg-white/10 px-3 py-2 text-white/80">{t.error}</p> : null}
              {t.result ? (
                <div className="max-w-[90%] space-y-2 rounded-2xl bg-white/10 px-4 py-3">
                  <p className="whitespace-pre-line leading-relaxed">
                    {answerParts(t.result.answer, t.result.sources).map((part, j) =>
                      part.href ? (
                        <a key={j} href={part.href} className="underline underline-offset-2 hover:text-white/80">
                          {part.text}
                        </a>
                      ) : (
                        part.text
                      ),
                    )}
                  </p>
                  {t.result.sources.length ? (
                    <ul className="flex flex-wrap gap-2">
                      {citedSources(t.result.answer, t.result.sources).map((s) => (
                        <li key={s.url}>
                          <a href={s.url} className="inline-block rounded-full bg-white/10 px-2 py-1 text-xs hover:bg-white/20">
                            {s.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {t.result.tool_calls.length ? (
                    <details className="text-xs text-white/60">
                      <summary className="cursor-pointer">사용한 도구 {t.result.tool_calls.length}개</summary>
                      <ul className="mt-1 space-y-1 font-mono">
                        {t.result.tool_calls.map((c, j) => (
                          <li key={j}>
                            {c.ok ? "✓" : "✗"} {c.name}({JSON.stringify(c.args)})
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : null}
                </div>
              ) : null}
              {!t.result && !t.error ? <p className="text-white/60">도구로 찾는 중입니다…</p> : null}
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>
    </>
  );
}
