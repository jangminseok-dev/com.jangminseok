// www/lib/agentApi.ts
// ── POST /agent/v1/ask (백엔드 직접 — snake_case 그대로) ──
export type AskResponse = {
  answer: string;
  refused: boolean;
  sources: { project: string; section: number; title: string; url: string }[];
  tool_calls: { name: string; args: Record<string, unknown>; ok: boolean }[];
};

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
