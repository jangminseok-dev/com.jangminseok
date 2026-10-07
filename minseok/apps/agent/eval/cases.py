# agent/eval/cases.py
"""평가 문항 묶음 고르기 — 공개 수치를 내는 골든셋과 따로 돌리는 점검 세트를 이름으로 나눈다(LLM을 부르지 않는다)."""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import yaml

HERE = Path(__file__).resolve().parent
PUBLISHED_SET = "golden"  # eval.json에 쌓는 묶음은 이것뿐 — 사이트와 이력서가 이 30문항의 수치를 인용한다
SETS = {"golden": HERE / "golden.yaml", "recruiter": HERE / "recruiter.yaml"}


@dataclass(frozen=True)
class Options:
    set_name: str
    only: list[int] | None
    publish: bool  # eval.json에 실행 결과를 쌓을지


def parse_args(argv: list[str]) -> Options:
    set_name = argv[argv.index("--set") + 1] if "--set" in argv else PUBLISHED_SET
    if set_name not in SETS:
        raise SystemExit(f"알 수 없는 문항 묶음: {set_name} (가능: {', '.join(SETS)})")
    only = [int(x) for x in argv[argv.index("--only") + 1].split(",")] if "--only" in argv else None
    return Options(set_name, only, set_name == PUBLISHED_SET and only is None)


def load_cases(set_name: str) -> list[dict]:
    return yaml.safe_load(SETS[set_name].read_text(encoding="utf-8"))
