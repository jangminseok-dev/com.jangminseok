import { afterEach, describe, expect, it, vi } from "vitest";
import { AgentError, answerParts, askAgent, citedSources } from "@/lib/agentApi";

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

const SOURCES = [
  { project: "callguard", section: 3, title: "CallGuard 아키텍처", url: "https://callguard.jangminseok.com#03" },
  { project: "callguard", section: 4, title: "CallGuard 맡은 일", url: "https://callguard.jangminseok.com#04" },
  { project: "remakeday", section: 5, title: "REMAKE DAY 채점", url: "https://remakeday.jangminseok.com#05" },
];

describe("answerParts", () => {
  it("답변 끝에 붙은 근거 주소를 뺀다", () => {
    expect(answerParts("팀원이 수행했습니다. https://callguard.jangminseok.com#03, https://callguard.jangminseok.com#04", SOURCES)).toEqual([
      { text: "팀원이 수행했습니다." },
    ]);
    expect(answerParts("CallGuard입니다.\nhttps://callguard.jangminseok.com", SOURCES)).toEqual([{ text: "CallGuard입니다." }]);
    expect(answerParts("포트폴리오에 없는 내용이라 답할 수 없습니다.", [])).toEqual([{ text: "포트폴리오에 없는 내용이라 답할 수 없습니다." }]);
  });

  it("문장 가운데 주소는 근거 제목을 단 링크로 바꾼다", () => {
    expect(answerParts("과정은 https://callguard.jangminseok.com#04에서 볼 수 있습니다.", SOURCES)).toEqual([
      { text: "과정은 " },
      { text: "CallGuard 맡은 일", href: "https://callguard.jangminseok.com#04" },
      { text: "에서 볼 수 있습니다." },
    ]);
  });

  it("근거 칩과 겹치는 '자세한 내용은 ~에서 확인' 안내 문장을 뺀다", () => {
    expect(answerParts("마스킹했습니다. 자세한 내용은 https://callguard.jangminseok.com#04에서 확인할 수 있습니다.", SOURCES)).toEqual([
      { text: "마스킹했습니다." },
    ]);
    expect(
      answerParts("마스킹했습니다. 더 자세한 내용은 https://callguard.jangminseok.com#04, https://callguard.jangminseok.com#05에서 보실 수 있습니다. 끝입니다.", SOURCES),
    ).toEqual([{ text: "마스킹했습니다. 끝입니다." }]);
    // 앞 문장이 '자세한'으로 시작해도 주소가 없는 문장은 남긴다
    expect(answerParts("자세한 설계는 팀원이 했습니다. 과정은 https://callguard.jangminseok.com#04에서 볼 수 있습니다.", SOURCES)[0]).toEqual({
      text: "자세한 설계는 팀원이 했습니다. 과정은 ",
    });
  });

  it("사이트 밖 주소는 끝에 있어도 남기고 링크로 만든다", () => {
    expect(answerParts("GitHub는 https://github.com/jangminseok-dev", [])).toEqual([
      { text: "GitHub는 " },
      { text: "github.com/jangminseok-dev", href: "https://github.com/jangminseok-dev" },
    ]);
  });
});

describe("citedSources", () => {
  it("답변이 인용한 섹션의 근거만 남긴다", () => {
    expect(citedSources("했습니다. https://callguard.jangminseok.com#04", SOURCES).map((s) => s.section)).toEqual([4]);
  });

  it("프로젝트 첫 화면 주소를 인용하면 그 프로젝트의 근거를 모두 남긴다", () => {
    expect(citedSources("했습니다. https://callguard.jangminseok.com", SOURCES).map((s) => s.project)).toEqual(["callguard", "callguard"]);
  });

  it("인용이 없거나 근거와 맞는 것이 없으면 전체를 보여 준다", () => {
    expect(citedSources("했습니다.", SOURCES)).toHaveLength(3);
    expect(citedSources("했습니다. https://callguard.jangminseok.com#06", SOURCES)).toHaveLength(3);
  });
});
