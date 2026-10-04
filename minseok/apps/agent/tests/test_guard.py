# test_guard.py
from agent.domain.guard import BLOCKED_ANSWER, NO_NUMBER_NOTE, guard_answer

EVIDENCE = "Recall@5 0.971, 누락 0건, 144문항"
URLS = {"https://callguard.jangminseok.com#05"}


def test_supported_numbers_pass():
    r = guard_answer("검색 Recall@5는 0.971입니다.", EVIDENCE, URLS, [])
    assert r.text == "검색 Recall@5는 0.971입니다." and r.removed_sentences == 0


def test_unsupported_number_sentence_removed():
    r = guard_answer("정확도는 99%입니다. 누락은 0건입니다.", EVIDENCE, URLS, [])
    assert "99" not in r.text and "누락은 0건입니다." in r.text and r.removed_sentences == 1


def test_all_sentences_removed_becomes_note():
    r = guard_answer("정확도는 99%입니다.", EVIDENCE, URLS, [])
    assert r.text == NO_NUMBER_NOTE


def test_unknown_section_link_removed():
    r = guard_answer("근거: https://callguard.jangminseok.com#05 와 https://callguard.jangminseok.com#99",
                     EVIDENCE, URLS, [])
    assert "#99" not in r.text and "#05" in r.text and r.removed_links == 1


def test_banned_term_blocks_whole_answer():
    r = guard_answer("팀원 홍길동이 만들었습니다.", EVIDENCE, URLS, ["홍길동"])
    assert r.blocked and r.text == BLOCKED_ANSWER


def test_numbers_with_commas_and_units_match():
    r = guard_answer("테스트는 1,257개입니다.", "server 1,257 · ai 496", URLS, [])
    assert r.removed_sentences == 0


def test_date_with_leading_zero_matches():
    r = guard_answer("2026년 8월 20일에 시작했습니다.", "2026-08-20 ~ 진행 중", URLS, [])
    assert r.removed_sentences == 0


def test_external_link_without_section_number_removed():
    r = guard_answer("자세한 내용은 https://evil.example.com/login 에 있습니다.", EVIDENCE, URLS, [])
    assert "example.com" not in r.text and r.removed_links == 1


def test_project_home_link_and_sentence_end_period_kept():
    r = guard_answer("https://callguard.jangminseok.com 과 https://callguard.jangminseok.com#05.", EVIDENCE, URLS, [])
    assert r.text == "https://callguard.jangminseok.com 과 https://callguard.jangminseok.com#05." and r.removed_links == 0


def test_link_followed_by_korean_particle_is_kept():
    # "…#05에서"를 통째로 주소로 보면 모르는 주소가 되어 지워지고 문장에 구멍이 난다
    r = guard_answer("자세한 내용은 https://callguard.jangminseok.com#05에서 확인할 수 있습니다.", EVIDENCE, URLS, [])
    assert r.text == "자세한 내용은 https://callguard.jangminseok.com#05에서 확인할 수 있습니다." and r.removed_links == 0
