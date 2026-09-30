# agent/eval/scoring.py
from __future__ import annotations

import re
from dataclasses import dataclass

from agent.app.ask import AskResult

_URL = re.compile(r"https?://\S+")
_SENT_END = re.compile(r"[.!?]\s*")


def is_formal(answer: str) -> bool:
    """"~다"로 끝나는 문장은 모두 "~니다"여야 한다 — 합쇼체가 해라체로 새는지 검사"""
    body = _URL.sub("", answer)
    return all(not s.strip().endswith("다") or s.strip().endswith("니다") for s in _SENT_END.split(body))


@dataclass(frozen=True)
class CaseScore:
    tool_ok: bool
    args_ok: bool
    hit5: bool
    numbers_ok: bool
    refuse_ok: bool
    must_refuse: bool
    content_ok: bool | None = None  # must_include가 있는 문항만 — 핵심 사실이 답변에 들어갔는가
    formal_ok: bool = True  # 합쇼체 유지


def score_case(case: dict, result: AskResult) -> CaseScore:
    called = {t.name for t in result.tool_calls if t.ok}
    expected = set(case["expected_tools"])
    # 필요한 도구를 불렀는가(추가 호출은 허용). 거절 문항은 도구를 하나도 부르지 않아야 한다
    tool_ok = expected <= called if expected else not result.tool_calls
    args_ok = all(
        any(t.name == name and all(str(t.args.get(k, "")).lower() == str(v).lower() for k, v in exp.items())
            for t in result.tool_calls)
        for name, exp in case["expected_args"].items()
    )
    got = [f"{s.slug}#{s.section_number:02d}" for s in result.sources[:5]]
    hit5 = not case["expected_sources"] or any(e in got for e in case["expected_sources"])
    numbers_ok = "확인된 수치가 없습니다" not in result.answer or case.get("must_refuse", False)
    keys = case.get("must_include") or []
    content_ok = all(str(k).lower() in result.answer.lower() for k in keys) if keys else None
    return CaseScore(tool_ok, args_ok, hit5, numbers_ok, result.refused == case["must_refuse"], case["must_refuse"],
                     content_ok, is_formal(result.answer))


def summarize(scores: list[CaseScore]) -> dict[str, float]:
    def ratio(xs: list[bool]) -> float:
        return round(sum(xs) / len(xs), 3) if xs else 1.0

    answerable = [s for s in scores if not s.must_refuse]
    return {
        "tool_selection": ratio([s.tool_ok for s in scores]),
        "arg_accuracy": ratio([s.args_ok for s in answerable]),
        "hit_at_5": ratio([s.hit5 for s in answerable]),
        "number_check": ratio([s.numbers_ok for s in answerable]),
        "refusal": ratio([s.refuse_ok for s in scores]),
        "content": ratio([s.content_ok for s in scores if s.content_ok is not None]),
        "register": ratio([s.formal_ok for s in scores]),
    }
