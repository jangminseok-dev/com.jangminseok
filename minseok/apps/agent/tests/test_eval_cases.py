import re

from agent.eval.cases import PUBLISHED_SET, load_cases, parse_args

REQUIRED = {"question", "expected_tools", "expected_args", "expected_sources", "must_refuse"}


def test_default_run_is_the_published_golden_set():
    opts = parse_args([])
    assert (opts.set_name, opts.only, opts.publish) == (PUBLISHED_SET, None, True)


def test_check_set_never_writes_published_metrics():
    assert not parse_args(["--set", "recruiter"]).publish


def test_only_diagnoses_any_set_without_publishing():
    opts = parse_args(["--set", "recruiter", "--only", "2,5"])
    assert (opts.set_name, opts.only, opts.publish) == ("recruiter", [2, 5], False)
    assert not parse_args(["--only", "23"]).publish


def test_unknown_set_name_stops_before_any_llm_call():
    import pytest

    with pytest.raises(SystemExit):
        parse_args(["--set", "typo"])


def test_every_case_file_loads_with_required_keys_and_section_refs():
    for name in ("golden", "recruiter"):
        cases = load_cases(name)
        assert cases, name
        for c in cases:
            assert REQUIRED <= c.keys(), (name, c["question"])
            assert all(re.fullmatch(r"[a-z]+#0[1-6]", s) for s in c["expected_sources"]), (name, c["question"])


def test_golden_set_stays_at_thirty_questions_without_conditional_checks():
    # 공개 수치(이력서와 사이트가 인용하는 30문항)는 점검 세트를 붙여도 그대로여야 한다
    golden = load_cases("golden")
    assert len(golden) == 30 and not any("must_qualify" in c for c in golden)
