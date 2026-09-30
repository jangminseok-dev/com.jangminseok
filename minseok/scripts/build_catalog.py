"""content/*/project.yaml(기본 정보) + page.yaml(소개 페이지) → data/catalog.json. 백엔드 런타임은 이 JSON만 읽는다(Vercel 번들에 content가 없어서).

사용: python scripts/build_catalog.py          # 생성
      python scripts/build_catalog.py --check  # CI: 커밋된 JSON이 최신인지 확인
"""
from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT.parent / "content"
OUT = ROOT / "data" / "catalog.json"
# 소개 페이지 섹션 번호 — 사이트의 #01~#06 앵커와 같다 (www/lib/content/schema.ts SECTION_ANCHORS)
OVERVIEW, FEATURES, ARCHITECTURE, ROLE, TROUBLES, RETRO = 1, 2, 3, 4, 5, 6


def _lines(*parts) -> str:
    return "\n".join(p for p in parts if p)


def _sections(page: dict) -> list[dict]:
    """page.yaml → 섹션별 검색 본문. 어려웠던 점은 하나씩 따로 둔다(챗봇이 그 문제만 근거로 집을 수 있게)."""
    o, a, r = page["overview"], page["architecture"], page["role"]
    fig = lambda f: f"{f['label']}: {f['value']}" + (f" ({f['note']})" if f.get("note") else "")
    out = [
        {"number": OVERVIEW, "title": "한눈에 보기", "text": _lines(o["what"], o["why"], o["role"], *map(fig, o["highlights"]))},
        {"number": FEATURES, "title": "주요 기능",
         "text": _lines(*(f"{f['title']}: {f['body']}" for f in page["features"]), page.get("featureNote"))},
        {"number": ARCHITECTURE, "title": "아키텍처",
         "text": _lines(a["summary"], *(f"{p['title']}: {p['body']}" for p in a["points"]),
                        *(f"{l['name']}: {', '.join(l['items'])}" for l in a["layers"]))},
        {"number": ROLE, "title": "맡은 일",
         "text": _lines(r["summary"], *(f"장민석이 한 일: {m}" for m in r["mine"]),
                        *(f"팀원이 한 일: {m}" for m in r.get("team", [])), *(f"협업 방식: {m}" for m in r.get("collab", [])),
                        *(f"AI 도구를 쓴 방식: {m}" for m in r.get("ai", [])))},
    ]
    for t in page["troubles"]:
        out.append({"number": TROUBLES, "title": t["title"],
                    "text": _lines(f"문제: {t['problem']}", t.get("cause") and f"원인: {t['cause']}",
                                   f"해결: {t['solution']}", t.get("detail"), f"결과: {t['result']}")})
    rt = page["retro"]
    out.append({"number": RETRO, "title": "성과와 회고",
                "text": _lines(*map(fig, rt["metrics"]), *(f"배운 점: {x}" for x in rt.get("learned", [])),
                               *(f"아쉬운 점: {x}" for x in rt["regrets"]))})
    return out


_NOTE_HEAD = re.compile(r"^## \[(\d{2})\] (.+)$", re.M)


def _banned_terms(content_dir: Path) -> list[str]:
    """사이트 빌드(www/lib/content/banned.ts)와 같은 출처 — 환경변수 BANNED_TERMS(CI)와 금지어 파일(로컬, gitignore)"""
    f = content_dir / ".banned.local.txt"
    from_file = f.read_text(encoding="utf-8").splitlines() if f.exists() else []
    from_env = re.split(r"[\n,]", os.environ.get("BANNED_TERMS", ""))  # 독립 실행 스크립트라 core 설정을 거치지 않는다
    return [t.strip() for t in [*from_env, *from_file] if t.strip()]


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
        page = yaml.safe_load((f.parent / "page.yaml").read_text(encoding="utf-8"))
        projects.append(
            {
                "slug": p["slug"], "order": p["order"], "title": p["title"], "tagline": p["tagline"],
                "period": p["period"], "team": p["team"], "stack": p["stack"],
                "languages": p.get("languages", []),
                "metrics": [{"label": m["label"], "value": m["value"]} for m in page["retro"]["metrics"]],
                "slides": [{**sec, "label": sec["title"]} for sec in _sections(page)],
                "notes": _notes(f.parent / "notes.md", RETRO, banned),
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
