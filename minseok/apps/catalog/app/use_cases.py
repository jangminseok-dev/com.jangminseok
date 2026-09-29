from __future__ import annotations

from catalog.domain.models import CatalogData
from hub.app.dtos import ProjectFacts, SkillMatch, SlideRef
from hub.app.ports.output.catalog_port import ProjectCatalogPort

INTRO_SLIDE = 1
REJECTED_PREFIX = "버린 대안"


def _used_text(text: str) -> str:
    """기술 검색용 본문 — '버린 대안' 줄은 쓰지 않은 기술이라 뺀다."""
    return "\n".join(line for line in text.lower().splitlines() if not line.startswith(REJECTED_PREFIX))


class CatalogInteractor(ProjectCatalogPort):
    def __init__(self, data: CatalogData) -> None:
        self._data = data

    def _ref(self, slug: str, number: int, title: str) -> SlideRef:
        return SlideRef(slug, number, title, self._data.slide_url(slug, number))

    def get_project(self, slug: str) -> ProjectFacts | None:
        p = next((x for x in self._data.projects if x.slug == slug), None)
        if p is None:
            return None
        return ProjectFacts(
            slug=p.slug, title=p.title, tagline=p.tagline, period=p.period, team_size=p.team_size, role=p.role,
            stack=p.stack, languages=p.languages, metrics=p.metrics,
            slides=tuple(self._ref(p.slug, s.number, s.title) for s in p.slides),
            url=self._data.slide_url(p.slug, INTRO_SLIDE).split("#")[0],
        )

    def find_by_skill(self, skill: str) -> list[SkillMatch]:
        q = skill.strip().lower()
        if not q:
            return []
        out: list[SkillMatch] = []
        for p in self._data.projects:
            evidence = tuple(self._ref(p.slug, s.number, s.title) for s in p.slides if q in _used_text(s.text))
            if not evidence and any(q in s.lower() for s in p.stack):
                evidence = (self._ref(p.slug, INTRO_SLIDE, f"{p.title} 소개"),)
            if evidence:
                out.append(SkillMatch(p.slug, p.title, evidence))
        return out

    def slugs(self) -> list[str]:
        return [p.slug for p in self._data.projects]

    def all_slide_urls(self) -> set[str]:
        urls = set()
        for p in self._data.projects:
            urls.add(self._data.slide_url(p.slug, INTRO_SLIDE))
            urls.update(self._data.slide_url(p.slug, s.number) for s in p.slides)
        return urls
