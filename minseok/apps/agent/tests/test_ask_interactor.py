import json

from agent.app.ask import REFUSAL, AskInteractor
from agent.app.ports import FinalAnswer, LlmUnavailable, ToolCall, ToolLlmPort
from agent.app.tool_runner import ToolRunner
from agent.tests.test_tool_runner import REF, Cat, Search  # 같은 스텁 재사용

import pytest


class Scripted(ToolLlmPort):
    def __init__(self, turns):
        self.turns, self.seen = list(turns), []

    async def next_turn(self, history, tools):
        self.seen.append(list(history))
        self.tools_seen = getattr(self, "tools_seen", []) + [tools]
        t = self.turns.pop(0)
        if isinstance(t, Exception):
            raise t
        return t


def make(llm):
    cat = Cat()
    return AskInteractor(llm, ToolRunner(cat, Search()), cat, banned=[])


async def test_tool_then_answer_with_sources():
    llm = Scripted([ToolCall("get_project", {"slug": "callguard"}), FinalAnswer("팀은 4명이고 Recall@5는 0.971입니다.")])
    r = await make(llm).ask("CallGuard 팀 규모는?")
    assert r.answer == "팀은 4명이고 Recall@5는 0.971입니다." and REF in r.sources
    assert [t.name for t in r.tool_calls] == ["get_project"] and not r.refused


async def test_unknown_tool_and_bad_slug_are_reported_back():
    llm = Scripted([ToolCall("nope", {}), ToolCall("get_project", {"slug": "x"}), ToolCall("get_project", {"slug": "callguard"}),
                    FinalAnswer("4명입니다.")])
    r = await make(llm).ask("팀 규모")
    assert [t.ok for t in r.tool_calls] == [False, False, True]
    assert "없는 도구" in llm.seen[1][-1].content  # 오류가 다음 턴에 전달된다


async def test_stops_after_three_tool_calls_with_refusal():
    llm = Scripted([ToolCall("find_by_skill", {"skill": "x"})] * 5)  # 도구 없이 답하라고 해도 또 도구를 요청
    r = await make(llm).ask("?")
    assert len(r.tool_calls) == 3 and r.refused and r.answer == REFUSAL  # 4번째 도구 요청에서 멈춘다


async def test_at_tool_limit_answers_from_gathered_evidence_without_tools():
    call = ToolCall("get_project", {"slug": "callguard"})
    llm = Scripted([call, call, call, ToolCall("search_portfolio", {"query": "x"}), FinalAnswer("팀은 4명입니다.")])
    r = await make(llm).ask("CallGuard 팀 규모는?")
    assert r.answer == "팀은 4명입니다." and not r.refused and len(r.tool_calls) == 3
    assert llm.tools_seen[-1] == ()  # 마지막 턴은 도구 없이 — 모은 근거로만 답한다


async def test_llm_sees_project_slug_enum():
    llm = Scripted([FinalAnswer("x")])
    await make(llm).ask("?")
    spec = next(t for t in llm.tools_seen[0] if t.name == "get_project")
    assert spec.parameters["properties"]["slug"]["enum"] == ["callguard"]


async def test_answer_without_any_evidence_is_refused():
    r = await make(Scripted([FinalAnswer("제 생각에는 그렇습니다.")])).ask("날씨 어때?")
    assert r.refused and r.answer == REFUSAL


async def test_guard_applies_to_final_answer():
    llm = Scripted([ToolCall("get_project", {"slug": "callguard"}), FinalAnswer("정확도는 99%입니다. 팀은 4명입니다.")])
    r = await make(llm).ask("?")
    assert "99" not in r.answer and "4명" in r.answer


async def test_llm_unavailable_propagates():
    with pytest.raises(LlmUnavailable):
        await make(Scripted([LlmUnavailable("429")])).ask("?")


async def test_tool_call_signature_is_carried_into_history():
    llm = Scripted([ToolCall("get_project", {"slug": "callguard"}, signature=b"sig"), FinalAnswer("4명입니다.")])
    await make(llm).ask("?")
    assert llm.seen[1][-2].signature == b"sig"  # 모델이 준 서명을 다음 턴에 그대로 돌려준다
