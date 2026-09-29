# agent/app/ask.py
from __future__ import annotations

import json
from dataclasses import dataclass

from agent.app.ports import FinalAnswer, Message, ToolLlmPort
from agent.app.tool_runner import ToolRunner
from agent.domain.guard import guard_answer
from agent.domain.tools import TOOLS
from hub.app.dtos import SlideRef
from hub.app.ports.output.catalog_port import ProjectCatalogPort

REFUSAL = "포트폴리오에 없는 내용이라 답할 수 없습니다."
SYSTEM = (
    "당신은 장민석의 포트폴리오 안내자입니다. 반드시 도구로 확인한 내용만 합쇼체로 답하십시오. "
    "3~5문장으로, 무엇을 했는지와 왜 그렇게 했는지(버린 대안·대가 포함)를 설명하고 도구 결과에 있는 수치를 함께 적으십시오. "
    "근거 슬라이드 URL을 답변 끝에 붙이십시오. 도구 결과에 없는 수치는 쓰지 마십시오. "
    "포트폴리오와 무관한 질문에는 답하지 말고 도구도 부르지 마십시오."
)


@dataclass(frozen=True)
class ToolTrace:
    name: str
    args: dict
    ok: bool


@dataclass(frozen=True)
class AskResult:
    answer: str
    sources: list[SlideRef]
    tool_calls: list[ToolTrace]
    refused: bool


class AskInteractor:
    def __init__(self, llm: ToolLlmPort, runner: ToolRunner, catalog: ProjectCatalogPort,
                 banned: list[str], max_tool_calls: int = 3) -> None:
        self._llm, self._runner, self._catalog = llm, runner, catalog
        self._banned, self._max = banned, max_tool_calls

    async def ask(self, question: str) -> AskResult:
        history = [Message("user", f"{SYSTEM}\n\n질문: {question}")]
        traces: list[ToolTrace] = []
        sources: list[SlideRef] = []
        evidence: list[str] = []
        while True:
            turn = await self._llm.next_turn(history, TOOLS)
            if isinstance(turn, FinalAnswer):
                break
            if len(traces) >= self._max:
                return AskResult(REFUSAL, sources, traces, True)
            result = await self._runner.run(turn.name, turn.args)
            traces.append(ToolTrace(turn.name, turn.args, result.ok))
            if result.ok:
                sources += [s for s in result.sources if s not in sources]
                evidence.append(result.evidence_text)
            history.append(Message("assistant", "", tool_name=turn.name, tool_args=turn.args, signature=turn.signature))
            history.append(Message("tool", json.dumps(result.payload, ensure_ascii=False), tool_name=turn.name))
        if not evidence:
            return AskResult(REFUSAL, [], traces, True)
        guarded = guard_answer(turn.text, "\n".join(evidence), self._catalog.all_slide_urls(), self._banned)
        return AskResult(guarded.text, sources, traces, guarded.blocked)
