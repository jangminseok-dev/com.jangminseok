from fastapi.testclient import TestClient

import main
from agent.app.ask import AskResult, ToolTrace
from agent.app.ports import LlmUnavailable
from agent.dependencies.agent_provider import get_ask_interactor, get_rate_limiter
from hub.app.dtos import SlideRef


class FakeAsk:
    def __init__(self, exc=None):
        self.exc, self.calls = exc, 0

    async def ask(self, q):
        self.calls += 1
        if self.exc:
            raise self.exc
        return AskResult("4명입니다.", [SlideRef("callguard", 1, "소개", "https://callguard.jangminseok.com#01")],
                         [ToolTrace("get_project", {"slug": "callguard"}, True)], False)


class Limiter:
    def __init__(self, allow=True):
        self.allow = allow

    async def hit(self, ip):
        return self.allow


def client(ask=None, allow=True):
    main.app.dependency_overrides[get_ask_interactor] = lambda: ask or FakeAsk()
    main.app.dependency_overrides[get_rate_limiter] = lambda: Limiter(allow)
    return TestClient(main.app)


def test_ask_returns_answer_sources_and_tool_calls():
    res = client().post("/agent/v1/ask", json={"question": "CallGuard 팀 규모는?"})
    body = res.json()
    assert res.status_code == 200 and body["answer"] == "4명입니다."
    assert body["sources"][0]["url"].endswith("#01") and body["tool_calls"][0]["name"] == "get_project"


def test_rejects_empty_and_too_long():
    ask = FakeAsk()
    c = client(ask)
    assert c.post("/agent/v1/ask", json={"question": ""}).status_code == 422
    assert c.post("/agent/v1/ask", json={"question": "가" * 501}).status_code == 422
    assert ask.calls == 0


def test_rate_limited_returns_429():
    ask = FakeAsk()
    res = client(ask, allow=False).post("/agent/v1/ask", json={"question": "질문"})
    assert res.status_code == 429 and ask.calls == 0


def test_llm_quota_maps_to_503():
    res = client(FakeAsk(LlmUnavailable("429 RESOURCE_EXHAUSTED"))).post("/agent/v1/ask", json={"question": "질문"})
    assert res.status_code == 503 and "잠시 뒤" in res.json()["detail"]
