"""content/*/project.yaml → data/catalog.json. 백엔드 런타임은 이 JSON만 읽는다(Vercel 번들에 content가 없어서).

사용: python scripts/build_catalog.py          # 생성
      python scripts/build_catalog.py --check  # CI: 커밋된 JSON이 최신인지 확인
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT.parent / "content"
OUT = ROOT / "data" / "catalog.json"
FIRST_DECISION_NUMBER = 2


def _slide_text(s: dict) -> str:
    parts = [s["title"], s["summary"]]
    parts += [f"{k}: {v}" for k, v in s["stats"].items()]
    parts += [f"버린 대안 {a['name']}: {a['reason']}" for a in s.get("alternatives", [])]
    if s.get("concept"):
        parts.append(f"{s['concept']['title']} {s['concept']['body']}")
    return "\n".join(parts)


def build(content_dir: Path) -> dict:
    projects = []
    for f in sorted(content_dir.glob("*/project.yaml")):
        p = yaml.safe_load(f.read_text(encoding="utf-8"))
        projects.append(
            {
                "slug": p["slug"], "order": p["order"], "title": p["title"], "tagline": p["tagline"],
                "period": p["period"], "team": p["team"], "stack": p["stack"],
                "languages": p.get("languages", []), "metrics": p["retro"]["metrics"],
                "slides": [
                    {"number": i + FIRST_DECISION_NUMBER, "title": s["title"], "label": s.get("label", s["title"]),
                     "text": _slide_text(s)}
                    for i, s in enumerate(p["slides"])
                ],
            }
        )
    projects.sort(key=lambda x: x["order"])
    return {"projects": projects}


def _dump(data: dict) -> str:
    return json.dumps(data, ensure_ascii=False, indent=1, default=str) + "\n"


def is_stale(content_dir: Path, out: Path) -> bool:
    return not out.exists() or out.read_text(encoding="utf-8") != _dump(build(content_dir))


if __name__ == "__main__":
    if "--check" in sys.argv:
        if is_stale(CONTENT, OUT):
            sys.exit("data/catalog.json이 content와 다릅니다 — python scripts/build_catalog.py 실행 후 커밋")
        print("catalog.json 최신")
    else:
        OUT.parent.mkdir(exist_ok=True)
        OUT.write_text(_dump(build(CONTENT)), encoding="utf-8")
        print(f"{OUT} 생성")
