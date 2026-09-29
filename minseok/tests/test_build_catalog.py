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
