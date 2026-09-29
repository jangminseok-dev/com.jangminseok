import json
from pathlib import Path

import yaml

from scripts.build_catalog import build


def _project(tmp: Path, slug: str) -> None:
    d = tmp / slug
    d.mkdir(parents=True)
    (d / "project.yaml").write_text(
        yaml.safe_dump(
            {
                "slug": slug, "order": 1, "title": slug.upper(), "tagline": "한 줄",
                "period": {"start": "2026-01-01", "end": None},
                "team": {"size": 1, "role": "1인 개발"}, "stack": ["FastAPI", "PostgreSQL + pgvector"],
                "languages": ["Python"],
                "slides": [{"title": "설계 원칙 - 요지", "label": "라벨", "summary": "요약입니다.",
                            "stats": {"problem": "문제", "choice": "선택", "cost": "대가", "effect": "효과"},
                            "alternatives": [{"name": "대안", "reason": "이유"}],
                            "concept": {"title": "개념", "body": "설명"}}],
                "retro": {"metrics": [{"label": "정확도", "value": "0.97"}], "regrets": []},
            },
            allow_unicode=True,
        ),
        encoding="utf-8",
    )


def test_build_makes_slide_text_and_numbers(tmp_path):
    _project(tmp_path, "demo")
    data = build(tmp_path)
    p = data["projects"][0]
    assert p["slug"] == "demo"
    assert p["slides"][0]["number"] == 2  # 01은 소개 슬라이드
    assert "요약입니다." in p["slides"][0]["text"] and "대안" in p["slides"][0]["text"]
    assert p["metrics"] == [{"label": "정확도", "value": "0.97"}]


def test_check_mode_detects_stale_file(tmp_path):
    _project(tmp_path, "demo")
    out = tmp_path / "catalog.json"
    out.write_text(json.dumps({"projects": []}), encoding="utf-8")
    from scripts.build_catalog import is_stale
    assert is_stale(tmp_path, out) is True


def test_notes_sections_are_read_with_slide_number(tmp_path):
    _project(tmp_path, "demo")
    (tmp_path / "demo" / "notes.md").write_text(
        "# 머리말은 무시\n\n## [01] 맡은 범위\n혼자 만들었습니다.\n\n## [02] 설계 이유\n둘째 줄입니다.\n셋째 줄입니다.\n",
        encoding="utf-8",
    )
    notes = build(tmp_path)["projects"][0]["notes"]
    assert notes == [
        {"slide": 1, "title": "맡은 범위", "text": "혼자 만들었습니다."},
        {"slide": 2, "title": "설계 이유", "text": "둘째 줄입니다.\n셋째 줄입니다."},
    ]


def test_project_without_notes_has_empty_list(tmp_path):
    _project(tmp_path, "demo")
    assert build(tmp_path)["projects"][0]["notes"] == []


def test_note_pointing_to_missing_slide_fails(tmp_path):
    import pytest

    _project(tmp_path, "demo")  # 슬라이드 01(소개)과 02뿐
    (tmp_path / "demo" / "notes.md").write_text("## [09] 없는 슬라이드\n본문\n", encoding="utf-8")
    with pytest.raises(ValueError, match="09"):
        build(tmp_path)


def test_banned_term_in_notes_fails(tmp_path):
    import pytest

    _project(tmp_path, "demo")
    (tmp_path / ".banned.local.txt").write_text("홍길동\n", encoding="utf-8")
    (tmp_path / "demo" / "notes.md").write_text("## [01] 맡은 범위\n홍길동 팀원과 함께했습니다.\n", encoding="utf-8")
    with pytest.raises(ValueError, match="공개 금지"):
        build(tmp_path)
