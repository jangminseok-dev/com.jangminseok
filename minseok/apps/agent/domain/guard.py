# agent/domain/guard.py
from __future__ import annotations

import re
from dataclasses import dataclass

NO_NUMBER_NOTE = "확인된 수치가 없습니다."
BLOCKED_ANSWER = "답변에 공개할 수 없는 내용이 있어 표시하지 않습니다."

_NUM = re.compile(r"\d[\d,]*(?:\.\d+)?")
# 모든 링크를 검사한다 — 문장 끝 마침표·쉼표는 링크에 넣지 않는다
_URL = re.compile(r"https?://[^\s<>()\[\]]*[^\s<>()\[\].,!?]")
_SENT = re.compile(r"(?<=[.!?。])\s+|\n+")


@dataclass(frozen=True)
class GuardResult:
    text: str
    removed_sentences: int
    removed_links: int
    blocked: bool


def _numbers(s: str) -> set[str]:
    return {n.replace(",", "") for n in _NUM.findall(s)}


def guard_answer(answer: str, evidence_text: str, known_urls: set[str], banned: list[str]) -> GuardResult:
    if any(term and term in answer for term in banned):
        return GuardResult(BLOCKED_ANSWER, 0, 0, True)

    removed_links = 0
    homes = {u.split("#")[0] for u in known_urls}  # 프로젝트 첫 화면 주소(섹션 번호 없음)

    def keep_link(m: re.Match) -> str:
        nonlocal removed_links
        if m.group(0) in known_urls or m.group(0) in homes:
            return m.group(0)
        removed_links += 1
        return ""

    text = _URL.sub(keep_link, answer)
    allowed = _numbers(evidence_text) | _numbers(" ".join(known_urls))
    kept, removed = [], 0
    for sent in (s for s in _SENT.split(text) if s.strip()):
        body = _URL.sub("", sent)  # 링크 속 섹션 번호는 수치로 보지 않는다
        if _numbers(body) - allowed:
            removed += 1
        else:
            kept.append(sent.strip())
    out = " ".join(kept).strip() or NO_NUMBER_NOTE
    return GuardResult(out, removed, removed_links, False)
