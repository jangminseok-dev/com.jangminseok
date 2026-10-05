# agent/app/ask.py
from __future__ import annotations

import json
from dataclasses import dataclass

from agent.app.ports import FinalAnswer, Message, ToolLlmPort
from agent.app.tool_runner import ToolRunner
from agent.domain.guard import NO_NUMBER_NOTE, guard_answer
from agent.domain.tools import TOOLS, with_project_slugs
from hub.app.dtos import SectionRef
from hub.app.ports.output.catalog_port import ProjectCatalogPort

REFUSAL = "포트폴리오에 없는 내용이라 답할 수 없습니다."
MAX_SOURCES = 6  # 답변 아래 근거 칩 — 너무 많으면 읽히지 않는다
LIMIT_NOTE = "도구 호출 한도에 도달했습니다. 도구를 더 부르지 말고 지금까지의 도구 결과만으로 답하십시오."
SYSTEM = (
    "당신은 장민석의 포트폴리오 안내자입니다. 반드시 도구로 확인한 내용만 답하십시오. 모든 문장은 '~했습니다', '~입니다'처럼 합쇼체로 끝내고, 도구 결과가 '~했다', '~한다'로 적혀 있어도 그대로 옮기지 말고 합쇼체로 바꾸십시오. "
    "3~5문장으로, 첫 문장에는 질문이 묻는 사실을 바로 답하고, 이어서 왜 그렇게 했는지(버린 대안과 그 선택으로 포기한 것 포함)를 적으십시오. 도구 결과에 답할 내용이 적으면 더 짧게 답하고, 문장 수를 채우려고 도구 결과에 없는 설명이나 의도를 덧붙이지 마십시오. 수치는 질문과 직접 관련된 것만 적고, 관계없는 수치를 늘어놓지 마십시오. "
    "한계나 약점을 물으면 도구 결과에 있는 한계와 함께, 이후 개선한 점이나 다시 한다면 바꿀 점도 도구 결과에 있을 때 함께 적으십시오. 도구 결과에 없는 개선 계획은 지어내지 마십시오. 질문이 묻지 않은 한계나 아쉬운 점은 덧붙이지 마십시오. "
    "질문이 묻는 경험이나 사례(예: 팀원과의 의견 충돌)가 도구 결과에 없으면 비슷한 이야기를 그 사례인 것처럼 쓰지 말고, 찾은 자료에서는 그 내용을 확인하지 못했다고 먼저 밝힌 뒤 가장 가까운 내용을 한두 문장으로 덧붙이십시오. 검색이 놓쳤을 수 있으니 포트폴리오에 그 내용이 없다고 단정하지 마십시오. "
    "팀 프로젝트는 장민석이 한 일과 팀원이 한 일을 구분해 적으십시오. 스택에 있는 기술이라도 그 일을 누가 맡았는지 도구 결과에서 확인하고, 팀원이 맡았으면 팀원이 했다고 적으십시오. 팀원은 '팀원'이라고만 부르십시오. 도구 결과의 '내', '제', '저는'은 장민석을 가리키므로 '장민석의', '장민석은'으로 바꿔 쓰십시오. 다른 프로젝트를 가리킬 때는 '다른 프로젝트'로 뭉뚱그리지 말고 이름을 쓰십시오. "
    "브랜치, 커밋, API, CPU, GPU처럼 개발에서 흔히 쓰는 말은 우리말로 옮기지 말고 그대로 쓰십시오. 생소한 약어(WER, NER 등)만 채용 담당자도 이해할 수 있는 쉬운 말로 풀어 쓰십시오. "
    "근거 페이지 URL은 마크다운 링크 없이 주소 그대로 답변 끝에 붙이고, '자세한 내용은 ~에서 확인할 수 있습니다' 같은 안내 문장은 쓰지 마십시오. 도구 결과에 없는 수치는 쓰지 마십시오. 수치에 조건이나 추정 범위가 붙어 있으면 그것도 함께 적으십시오. "
    "'도구 결과에 따르면', '밝히고 있습니다' 같은 출처 설명 말투는 쓰지 말고 사실을 직접 말하십시오. 가운뎃점(·) 대신 쉼표를 쓰십시오. "
    "프로젝트 이름은 CallGuard, RedOceanMap처럼 원래 표기 그대로 쓰고 한글로 옮기지 마십시오. slug(portfolio 등) 대신 제목(jangminseok.com)으로 부르십시오. "
    "어떤 기술을 쓴 경험을 물으면 find_by_skill로 프로젝트만 찾고 끝내지 말고, search_portfolio로 장민석이 실제로 한 일을 확인해 답하십시오. "
    "find_by_skill이 찾은 프로젝트는 하나도 빼지 말고 모두 이름을 밝히고, 그 기술을 팀원이 맡았으면 빼는 대신 팀원이 맡았다고 함께 적으십시오. "
    "장민석 본인의 소개, 기술 스택, 교육, 연락처를 묻는 질문은 search_portfolio로 찾아 답하십시오. 희망 연봉, 나이, 주소 같은 그 밖의 개인 정보는 포트폴리오에 없으므로 도구를 부르지 말고 답하지 마십시오. "
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
    sources: list[SectionRef]
    tool_calls: list[ToolTrace]
    refused: bool


class AskInteractor:
    def __init__(self, llm: ToolLlmPort, runner: ToolRunner, catalog: ProjectCatalogPort,
                 banned: list[str], max_tool_calls: int = 3) -> None:
        self._llm, self._runner, self._catalog = llm, runner, catalog
        self._banned, self._max = banned, max_tool_calls

    def _project_titles(self) -> dict[str, str]:
        return {slug: facts.title for slug in self._catalog.slugs() if (facts := self._catalog.get_project(slug))}

    async def ask(self, question: str) -> AskResult:
        history = [Message("user", f"{SYSTEM}\n\n질문: {question}")]
        traces: list[ToolTrace] = []
        sources: list[SectionRef] = []
        evidence: list[str] = []
        tools = with_project_slugs(TOOLS, self._project_titles())
        while True:
            turn = await self._llm.next_turn(history, tools)
            if isinstance(turn, FinalAnswer):
                break
            if len(traces) >= self._max:
                # 한도에 닿으면 도구 없이 한 번 더 — 모은 근거가 있으면 그것으로 답하게 한다
                if evidence:
                    turn = await self._llm.next_turn([*history, Message("user", LIMIT_NOTE)], ())
                if isinstance(turn, FinalAnswer):
                    break
                return AskResult(REFUSAL, sources[:MAX_SOURCES], traces, True)
            result = await self._runner.run(turn.name, turn.args)
            traces.append(ToolTrace(turn.name, turn.args, result.ok))
            if result.ok:
                seen = {s.url for s in sources}
                sources += [s for s in result.sources if s.url not in seen and not seen.add(s.url)]
                evidence.append(result.evidence_text)
            history.append(Message("assistant", "", tool_name=turn.name, tool_args=turn.args, signature=turn.signature))
            history.append(Message("tool", json.dumps(result.payload, ensure_ascii=False), tool_name=turn.name))
        if not evidence:
            return AskResult(REFUSAL, [], traces, True)
        sources = sources[:MAX_SOURCES]
        guarded = guard_answer(turn.text, "\n".join(evidence), self._catalog.all_section_urls(), self._banned)
        # 모든 문장이 수치 검증에서 빠지면 답하지 못한 것이다
        return AskResult(guarded.text, sources, traces, guarded.blocked or guarded.text == NO_NUMBER_NOTE)
