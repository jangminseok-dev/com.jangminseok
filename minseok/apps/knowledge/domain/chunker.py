from __future__ import annotations

import hashlib
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


def chunk_catalog(projects: list[dict], site: str, max_chars: int = 800) -> list[ChunkDraft]:
    out: list[ChunkDraft] = []
    for p in projects:
        intro = f"{p['title']} 소개\n{p['tagline']}"
        out.append(ChunkDraft(p["slug"], 1, f"{p['title']} 소개", intro, _url(site, p["slug"], 1), _hash(intro)))
        for s in p["sections"]:
            head = f"{p['title']} {s['title']}\n"
            body = s["text"]
            for start in range(0, max(len(body), 1), max_chars):
                text = head + body[start : start + max_chars]
                out.append(ChunkDraft(p["slug"], s["number"], s["title"], text, _url(site, p["slug"], s["number"]), _hash(text)))
        # notes.md 설명 — 섹션보다 깊은 근거. 링크는 딸린 섹션으로 건다
        for n in p.get("notes", []):
            title = f"{n['title']} (설명)"
            head = f"{p['title']} {n['title']}\n"
            for start in range(0, max(len(n["text"]), 1), max_chars):
                text = head + n["text"][start : start + max_chars]
                out.append(ChunkDraft(p["slug"], n["section"], title, text, _url(site, p["slug"], n["section"]), _hash(text)))
    return out
