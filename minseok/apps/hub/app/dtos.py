"""스포크 공용 계약 — 도구 결과를 표현하는 불변 DTO."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class SlideRef:
    """근거 슬라이드"""

    slug: str
    slide_number: int
    title: str
    url: str


@dataclass(frozen=True)
class ProjectFacts:
    slug: str
    title: str
    tagline: str
    period: str
    team_size: int
    role: str
    stack: tuple[str, ...]
    languages: tuple[str, ...]
    metrics: tuple[tuple[str, str], ...]
    slides: tuple[SlideRef, ...]
    url: str


@dataclass(frozen=True)
class SkillMatch:
    slug: str
    title: str
    evidence: tuple[SlideRef, ...]


@dataclass(frozen=True)
class Chunk:
    """검색 결과"""

    slug: str
    slide_number: int
    title: str
    text: str
    url: str
    score: float
