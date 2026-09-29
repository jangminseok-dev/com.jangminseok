import { afterEach, describe, expect, it, vi } from "vitest";
import { AgentError, askAgent } from "@/lib/agentApi";

afterEach(() => vi.unstubAllGlobals());

describe("askAgent", () => {
  it("rewrite 경로로 POST하고 응답을 돌려준다", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ answer: "네", refused: false, sources: [], tool_calls: [] })));
    vi.stubGlobal("fetch", fetchMock);
    const r = await askAgent("질문");
    expect(fetchMock.mock.calls[0][0]).toBe("/api/backend/agent/v1/ask");
    expect(r.answer).toBe("네");
  });

  it("429·503은 서버 안내 문구를 담은 AgentError", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: "잠시 뒤" }), { status: 503 })));
    await expect(askAgent("질문")).rejects.toMatchObject({ status: 503, detail: "잠시 뒤" });
    expect(new AgentError(429, "x")).toBeInstanceOf(Error);
  });
});
