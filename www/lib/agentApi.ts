// www/lib/agentApi.ts
import { SITE_DOMAIN } from "@/lib/site";

// ── POST /agent/v1/ask (백엔드 직접 — snake_case 그대로) ──
export type AskResponse = {
  answer: string;
  refused: boolean;
  sources: { project: string; section: number; title: string; url: string }[];
  tool_calls: { name: string; args: Record<string, unknown>; ok: boolean }[];
};

type Source = AskResponse["sources"][number];

// 백엔드 guard.py와 같은 규칙 — 문장 끝 마침표·쉼표와 뒤에 붙은 한글 조사는 주소에 넣지 않는다
const URL_RE = /https?:\/\/[^\s<>()[\]가-힣]*[^\s<>()[\]가-힣.,!?]/g;
// 답변 끝에 붙어 오는 근거 주소(사이트 안 주소) — 답변 아래 근거 칩과 겹치므로 화면에서는 뺀다
const TRAILING_SITE_URLS = new RegExp(`(?:[\\s,]*https?://[\\w.-]*${SITE_DOMAIN.replace(".", "\\.")}(?:#\\w+)?)+[\\s.]*$`);

// 답변 본문 조각 — 문장 가운데 남은 주소는 링크로, 근거에 있는 주소면 그 제목을 단다
export function answerParts(answer: string, sources: Source[]): { text: string; href?: string }[] {
  const body = answer.replace(TRAILING_SITE_URLS, "");
  const parts: { text: string; href?: string }[] = [];
  let last = 0;
  for (const m of body.matchAll(URL_RE)) {
    if (m.index > last) parts.push({ text: body.slice(last, m.index) });
    parts.push({ text: sources.find((s) => s.url === m[0])?.title ?? m[0].replace(/^https?:\/\//, ""), href: m[0] });
    last = m.index + m[0].length;
  }
  if (last < body.length) parts.push({ text: body.slice(last) });
  return parts;
}

// 근거 칩 — 답변이 인용한 섹션만 보여 준다. 인용이 없으면 도구가 찾은 근거 전체
export function citedSources(answer: string, sources: Source[]): Source[] {
  const urls: string[] = answer.match(URL_RE) ?? [];
  const cited = sources.filter((s) => urls.includes(s.url) || urls.includes(s.url.split("#")[0]));
  return cited.length ? cited : sources;
}

export class AgentError extends Error {
  constructor(
    public status: number,
    public detail: string,
  ) {
    super(detail);
  }
}

export async function askAgent(question: string): Promise<AskResponse> {
  const res = await fetch("/api/backend/agent/v1/ask", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { detail?: unknown } | null;
    const detail = typeof body?.detail === "string" ? body.detail : "지금은 답할 수 없습니다. 잠시 뒤 다시 시도해 주십시오.";
    throw new AgentError(res.status, detail);
  }
  return res.json();
}
