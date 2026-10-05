import json
from pathlib import Path

import yaml

from scripts.build_catalog import build


PAGE = {
    "overview": {"what": "무엇을 하는 서비스입니다.", "why": "왜 만들었습니다.", "role": "혼자 만들었습니다.",
                 "highlights": [{"value": "0.97", "label": "정확도", "note": "시험 문제 30개"}]},
    "features": [{"title": "자동 추천", "body": "서류를 띄웁니다."}, {"title": "가림", "body": "개인정보를 가립니다."}],
    "architecture": {"image": "media/arch.svg", "summary": "요약입니다.",
                     "points": [{"title": "분리", "body": "나눴습니다."}, {"title": "검사", "body": "막았습니다."}],
                     "layers": [{"name": "서버", "items": ["FastAPI", "PostgreSQL + pgvector"]}]},
    "role": {"summary": "혼자 했습니다.", "mine": ["서버"], "team": [], "collab": [], "ai": ["검증했습니다."]},
    "troubles": [
        {"title": "첫 문제", "problem": "문제1", "solution": "해결1", "result": "결과1"},
        {"title": "둘째 문제", "problem": "문제2", "cause": "원인2", "solution": "해결2", "result": "결과2"},
    ],
    "retro": {"metrics": [{"value": "0.97", "label": "정확도"}], "learned": ["배운 점"], "regrets": ["아쉬운 점"]},
}


def _project(tmp: Path, slug: str) -> None:
    d = tmp / slug
    d.mkdir(parents=True)
    (d / "project.yaml").write_text(
        yaml.safe_dump(
            {
                "slug": slug, "order": 1, "title": slug.upper(), "tagline": "한 줄",
                "period": {"start": "2026-01-01", "end": None},
                "team": {"size": 1, "role": "1인 개발"}, "stack": ["FastAPI", "PostgreSQL + pgvector"],
                "languages": ["Python"], "preview": {"poster": "media/poster.webp"}, "links": {},
            },
            allow_unicode=True,
        ),
        encoding="utf-8",
    )
    (d / "page.yaml").write_text(yaml.safe_dump(PAGE, allow_unicode=True), encoding="utf-8")


def test_build_makes_one_entry_per_page_section_and_trouble(tmp_path):
    _project(tmp_path, "demo")
    p = build(tmp_path)["projects"][0]
    numbers = [s["number"] for s in p["sections"]]
    assert numbers == [1, 2, 3, 4, 4, 5, 5, 6]  # 한눈에, 기능, 아키텍처, 맡은 일, AI 도구를 쓴 방식, 어려웠던 점 2개, 회고
    # 협업과 AI 도구 방식은 맡은 일과 따로 둔다 — 한 조각에 묶이면 CI 같은 작은 주제가 검색에서 묻힌다
    ai = p["sections"][4]
    assert ai["title"] == "AI 도구를 쓴 방식" and "검증했습니다." in ai["text"]
    assert "검증했습니다." not in p["sections"][3]["text"]
    trouble = p["sections"][6]
    assert trouble["title"] == "둘째 문제" and "원인2" in trouble["text"] and "결과2" in trouble["text"]
    assert "FastAPI" in p["sections"][2]["text"]  # 아키텍처 계층의 기술 이름 — 기술별 찾기가 쓴다
    assert p["metrics"] == [{"label": "정확도", "value": "0.97"}]


def test_metric_note_is_kept_so_chatbot_sees_conditions(tmp_path):
    _project(tmp_path, "demo")
    page = tmp_path / "demo" / "page.yaml"
    data = yaml.safe_load(page.read_text(encoding="utf-8"))
    data["retro"]["metrics"] = [{"value": "0.461달러", "label": "한 판 비용", "note": "전체 환산 약 0.9~1.2달러"}]
    page.write_text(yaml.safe_dump(data, allow_unicode=True), encoding="utf-8")
    assert build(tmp_path)["projects"][0]["metrics"] == [
        {"label": "한 판 비용", "value": "0.461달러", "note": "전체 환산 약 0.9~1.2달러"}]


def test_check_mode_detects_stale_file(tmp_path):
    _project(tmp_path, "demo")
    out = tmp_path / "catalog.json"
    out.write_text(json.dumps({"projects": []}), encoding="utf-8")
    from scripts.build_catalog import is_stale
    assert is_stale(tmp_path, out) is True


def test_notes_sections_are_read_with_section_number(tmp_path):
    _project(tmp_path, "demo")
    (tmp_path / "demo" / "notes.md").write_text(
        "# 머리말은 무시\n\n## [01] 맡은 범위\n혼자 만들었습니다.\n\n## [02] 설계 이유\n둘째 줄입니다.\n셋째 줄입니다.\n",
        encoding="utf-8",
    )
    notes = build(tmp_path)["projects"][0]["notes"]
    assert notes == [
        {"section": 1, "title": "맡은 범위", "text": "혼자 만들었습니다."},
        {"section": 2, "title": "설계 이유", "text": "둘째 줄입니다.\n셋째 줄입니다."},
    ]


def test_project_without_notes_has_empty_list(tmp_path):
    _project(tmp_path, "demo")
    assert build(tmp_path)["projects"][0]["notes"] == []


def test_note_pointing_to_missing_section_fails(tmp_path):
    import pytest

    _project(tmp_path, "demo")  # 섹션은 01~06
    (tmp_path / "demo" / "notes.md").write_text("## [07] 없는 섹션\n본문\n", encoding="utf-8")
    with pytest.raises(ValueError, match="07"):
        build(tmp_path)


def test_banned_term_in_notes_fails(tmp_path):
    import pytest

    _project(tmp_path, "demo")
    (tmp_path / ".banned.local.txt").write_text("홍길동\n", encoding="utf-8")
    (tmp_path / "demo" / "notes.md").write_text("## [01] 맡은 범위\n홍길동 팀원과 함께했습니다.\n", encoding="utf-8")
    with pytest.raises(ValueError, match="공개 금지"):
        build(tmp_path)


def test_banned_terms_from_env_also_checked_so_ci_catches_notes(tmp_path, monkeypatch):
    import pytest

    _project(tmp_path, "demo")
    monkeypatch.setenv("BANNED_TERMS", "김철수,홍길동")  # CI엔 .banned.local.txt가 없고 이 환경변수만 있다
    (tmp_path / "demo" / "notes.md").write_text("## [01] 맡은 범위\n홍길동 팀원과 함께했습니다.\n", encoding="utf-8")
    with pytest.raises(ValueError, match="공개 금지"):
        build(tmp_path)


PROFILE = {
    "name": "장민석", "role": "AI 백엔드", "headline": "한 줄 소개", "intro": "소개 글입니다.",
    "highlights": [{"keyword": "평가", "text": "골든셋부터 만듭니다."}],
    "requirements": [{"id": "rag", "label": "RAG 설계", "detail": "청크와 임베딩"}],
    "education": [{"org": "아카데미", "course": "AI 과정", "period": "2026.04 ~ 2026.10", "topics": [{"name": "Python"}]}],
    "skills": [{"group": "백엔드", "items": [{"name": "Python"}, {"name": "Java", "learned": True}]},
               {"group": "빅데이터", "items": [{"name": "Hadoop", "learned": True}]}],
    "links": {"github": "https://github.com/demo", "email": "demo@example.com"},
}


def test_profile_becomes_sections_with_main_page_anchors(tmp_path):
    _project(tmp_path, "demo")
    (tmp_path / "profile.yaml").write_text(yaml.safe_dump(PROFILE, allow_unicode=True), encoding="utf-8")
    profile = build(tmp_path)["profile"]
    by_anchor = {s["anchor"]: s for s in profile["sections"]}
    assert list(by_anchor) == ["about", "skills", "requirements", "education", "contact"]
    assert [s["number"] for s in profile["sections"]] == [1, 2, 3, 4, 5]
    assert "골든셋부터" in by_anchor["about"]["text"]
    # 직접 쓴 기술과 교육에서만 배운 기술을 구분해 적는다 — 챗봇이 배운 기술을 써 본 기술로 말하지 않게
    assert "백엔드: Python (교육에서 학습: Java)" in by_anchor["skills"]["text"]
    assert "빅데이터: (교육에서 학습: Hadoop)" in by_anchor["skills"]["text"]
    assert by_anchor["skills"]["text"].startswith("프로젝트에서 직접 쓴 기술입니다.")
    assert "demo@example.com" in by_anchor["contact"]["text"] and "https://github.com/demo" in by_anchor["contact"]["text"]
    assert profile["links"] == ["https://github.com/demo"]


def test_build_without_profile_has_no_profile_key(tmp_path):
    _project(tmp_path, "demo")
    assert "profile" not in build(tmp_path)
