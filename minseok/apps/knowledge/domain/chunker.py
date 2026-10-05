from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass


@dataclass(frozen=True)
class ChunkDraft:
    slug: str
    section_number: int
    title: str
    text: str
    url: str
    content_hash: str


def _url(site: str, slug: str, number: int) -> str:
    return f"https://{slug}.{site.replace('https://', '')}#{number:02d}"


def _hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


# 문장이나 줄이 끝나는 곳 — 소수점(0.765)과 주소(jangminseok.com)는 뒤에 공백이 없어 걸리지 않는다
_BOUNDARY = re.compile(r"[.!?](?=\s)|\n")


def _pieces(text: str, max_chars: int) -> list[str]:
    """max_chars 이하로 나누되 문장이나 줄이 끝나는 곳에서 자른다. 글자 수로만 자르면 "import-linter"가
    "im"과 "port-linter"로 갈려 어느 조각도 검색에 걸리지 않는다. 한 문장이 max_chars보다 길 때만 글자 수로 자른다."""
    pieces, start = [], 0
    while len(text) - start > max_chars:
        limit = start + max_chars
        ends = [m.end() for m in _BOUNDARY.finditer(text, start, limit)]
        cut = ends[-1] if ends else limit
        pieces.append(text[start:cut].strip())
        start = cut
        while start < len(text) and text[start].isspace():
            start += 1
    pieces.append(text[start:].strip())
    return [p for p in pieces if p] or [""]


PROFILE_SLUG = "profile"  # 프로젝트가 아닌 장민석 본인 정보 — 링크는 메인 페이지의 해당 구역으로 건다


def chunk_catalog(projects: list[dict], site: str, max_chars: int = 800, profile: dict | None = None) -> list[ChunkDraft]:
    out: list[ChunkDraft] = []
    for s in (profile or {}).get("sections", []):
        head = f"{s['title']}\n"
        for piece in _pieces(s["text"], max_chars):
            text = head + piece
            out.append(ChunkDraft(PROFILE_SLUG, s["number"], s["title"], text, f"{site}#{s['anchor']}", _hash(text)))
    for p in projects:
        intro = f"{p['title']} 소개\n{p['tagline']}"
        out.append(ChunkDraft(p["slug"], 1, f"{p['title']} 소개", intro, _url(site, p["slug"], 1), _hash(intro)))
        for s in p["sections"]:
            head = f"{p['title']} {s['title']}\n"
            for piece in _pieces(s["text"], max_chars):
                text = head + piece
                out.append(ChunkDraft(p["slug"], s["number"], s["title"], text, _url(site, p["slug"], s["number"]), _hash(text)))
        # notes.md 설명 — 섹션보다 깊은 근거. 링크는 딸린 섹션으로 건다
        for n in p.get("notes", []):
            title = f"{n['title']} (설명)"
            head = f"{p['title']} {n['title']}\n"
            for piece in _pieces(n["text"], max_chars):
                text = head + piece
                out.append(ChunkDraft(p["slug"], n["section"], title, text, _url(site, p["slug"], n["section"]), _hash(text)))
    return out
