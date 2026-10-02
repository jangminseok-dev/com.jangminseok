from agent.app.ask import AskResult, ToolTrace
from agent.eval.scoring import score_case, summarize
from hub.app.dtos import SectionRef

REF = SectionRef("callguard", 5, "검색 구성", "https://callguard.jangminseok.com#05")


def test_perfect_case():
    case = {"question": "q", "expected_tools": ["search_portfolio"], "expected_args": {"search_portfolio": {}},
            "expected_sources": ["callguard#05"], "must_refuse": False}
    r = AskResult("답", [REF], [ToolTrace("search_portfolio", {"query": "x"}, True)], False)
    s = score_case(case, r)
    assert (s.tool_ok, s.args_ok, s.hit5, s.refuse_ok) == (True, True, True, True)


def test_wrong_slug_arg_and_missing_source():
    case = {"question": "q", "expected_tools": ["get_project"], "expected_args": {"get_project": {"slug": "redoceanmap"}},
            "expected_sources": ["redoceanmap#01"], "must_refuse": False}
    r = AskResult("답", [REF], [ToolTrace("get_project", {"slug": "callguard"}, True)], False)
    s = score_case(case, r)
    assert s.tool_ok and not s.args_ok and not s.hit5


def test_refusal_case_scores_only_refusal_and_no_tools():
    case = {"question": "오늘 날씨", "expected_tools": [], "expected_args": {}, "expected_sources": [], "must_refuse": True}
    s = score_case(case, AskResult("포트폴리오에 없는", [], [], True))
    assert s.refuse_ok and s.tool_ok


def test_summarize_ratios():
    case = {"question": "q", "expected_tools": [], "expected_args": {}, "expected_sources": [], "must_refuse": True}
    ok = score_case(case, AskResult("x", [], [], True))
    bad = score_case(case, AskResult("x", [], [], False))
    assert summarize([ok, bad])["refusal"] == 0.5


def test_must_include_checks_key_facts_in_answer():
    case = {"question": "q", "expected_tools": [], "expected_args": {}, "expected_sources": [], "must_refuse": False,
            "must_include": ["RedOceanMap", "대구"]}
    good = score_case(case, AskResult("RedOceanMap 백엔드를 대구 데이터로 바꿨습니다.", [], [], False))
    bad = score_case(case, AskResult("FastAPI로 만들었습니다.", [], [], False))
    assert good.content_ok and not bad.content_ok
    assert summarize([good, bad])["content"] == 0.5


def test_cases_without_must_include_are_left_out_of_content_metric():
    case = {"question": "q", "expected_tools": [], "expected_args": {}, "expected_sources": [], "must_refuse": False}
    s = score_case(case, AskResult("답", [], [], False))
    assert s.content_ok is None and summarize([s])["content"] == 1.0


def test_must_include_accepts_yaml_dates_and_numbers():
    import datetime

    case = {"question": "q", "expected_tools": [], "expected_args": {}, "expected_sources": [], "must_refuse": False,
            "must_include": [datetime.date(2026, 8, 20), 4]}
    assert score_case(case, AskResult("2026-08-20에 4명이 시작했습니다.", [], [], False)).content_ok


def test_must_include_nested_list_accepts_any_alternative():
    case = {"question": "q", "expected_tools": [], "expected_args": {}, "expected_sources": [], "must_refuse": False,
            "must_include": [["포트폴리오", "jangminseok.com"], "CI"]}
    assert score_case(case, AskResult("이후 jangminseok.com에서는 CI를 두었습니다.", [], [], False)).content_ok
    assert score_case(case, AskResult("이후 포트폴리오에서는 CI를 두었습니다.", [], [], False)).content_ok
    assert not score_case(case, AskResult("이후 CI를 두었습니다.", [], [], False)).content_ok


def test_extra_tool_is_ok_but_missing_required_tool_is_not():
    case = {"question": "q", "expected_tools": ["find_by_skill"], "expected_args": {}, "expected_sources": [],
            "must_refuse": False}
    extra = AskResult("답", [], [ToolTrace("find_by_skill", {}, True), ToolTrace("search_portfolio", {}, True)], False)
    missing = AskResult("답", [], [ToolTrace("search_portfolio", {}, True)], False)
    assert score_case(case, extra).tool_ok and not score_case(case, missing).tool_ok


def test_refusal_case_fails_tool_check_if_any_tool_called():
    case = {"question": "q", "expected_tools": [], "expected_args": {}, "expected_sources": [], "must_refuse": True}
    assert not score_case(case, AskResult("x", [], [ToolTrace("search_portfolio", {}, True)], True)).tool_ok


def test_register_check_flags_plain_style_endings():
    from agent.eval.scoring import is_formal

    assert is_formal("마스킹을 먼저 두었습니다. 누락은 0건입니다. https://callguard.jangminseok.com#03")
    assert not is_formal("마스킹을 먼저 두었다. 누락은 0건입니다.")
    assert not is_formal("전화번호는 받는 즉시 해시한다.")
