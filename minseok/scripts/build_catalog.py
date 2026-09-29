"""content/*/project.yaml → data/catalog.json. 백엔드 런타임은 이 JSON만 읽는다(Vercel 번들에 content가 없어서).

사용: python scripts/build_catalog.py          # 생성
      python scripts/build_catalog.py --check  # CI: 커밋된 JSON이 최신인지 확인
"""
from __future__ import annotations

import json
import re
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


_NOTE_HEAD = re.compile(r"^## \[(\d{2})\] (.+)$", re.M)


def _banned_terms(content_dir: Path) -> list[str]:
    f = content_dir / ".banned.local.txt"  # 사이트 빌드와 같은 금지어 파일(gitignore)
    return [t.strip() for t in f.read_text(encoding="utf-8").splitlines() if t.strip()] if f.exists() else []


def _notes(path: Path, max_slide: int, banned: list[str]) -> list[dict]:
    """notes.md의 `## [NN] 제목` 섹션 → 슬라이드 NN에 딸린 설명. 파일이 없으면 빈 목록."""
    if not path.exists():
        return []
    src = path.read_text(encoding="utf-8")
    if any(t in src for t in banned):
        raise ValueError(f"{path}: 공개 금지 항목이 있습니다")
    heads = list(_NOTE_HEAD.finditer(src))
    out = []
    for i, m in enumerate(heads):
        slide = int(m.group(1))
        if not 1 <= slide <= max_slide:
            raise ValueError(f"{path}: [{m.group(1)}] 슬라이드가 없습니다 (01~{max_slide:02d})")
        end = heads[i + 1].start() if i + 1 < len(heads) else len(src)
        out.append({"slide": slide, "title": m.group(2).strip(), "text": src[m.end():end].strip()})
    return out


def build(content_dir: Path) -> dict:
    banned = _banned_terms(content_dir)
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
                "notes": _notes(f.parent / "notes.md", len(p["slides"]) + FIRST_DECISION_NUMBER - 1, banned),
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
