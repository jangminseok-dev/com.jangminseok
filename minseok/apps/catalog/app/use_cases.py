from __future__ import annotations

from catalog.domain.models import CatalogData
from hub.app.dtos import ProjectFacts, SkillMatch, SectionRef
from hub.app.ports.output.catalog_port import ProjectCatalogPort

INTRO_SECTION = 1
ARCHITECTURE_SECTION = 3  # 소개 페이지의 아키텍처 섹션 — 계층별 기술 스택이 여기 있다


class CatalogInteractor(ProjectCatalogPort):
    def __init__(self, data: CatalogData) -> None:
        self._data = data

    def _ref(self, slug: str, number: int, title: str) -> SectionRef:
        return SectionRef(slug, number, title, self._data.section_url(slug, number))

    def get_project(self, slug: str) -> ProjectFacts | None:
        p = next((x for x in self._data.projects if x.slug == slug), None)
        if p is None:
            return None
        return ProjectFacts(
            slug=p.slug, title=p.title, tagline=p.tagline, period=p.period, team_size=p.team_size, role=p.role,
            stack=p.stack, languages=p.languages, metrics=p.metrics,
            sections=tuple(self._ref(p.slug, s.number, f"{p.title} {s.title}") for s in p.sections),
            url=self._data.section_url(p.slug, INTRO_SECTION).split("#")[0],
        )

    def find_by_skill(self, skill: str) -> list[SkillMatch]:
        q = skill.strip().lower()
        if not q:
            return []
        out: list[SkillMatch] = []
        for p in self._data.projects:
            # 쓴 기술은 스택으로만 판단한다 — 본문에는 "쓰지 않았습니다", "버린 대안"으로 언급된 기술도 있다
            if not any(q in s.lower() for s in p.stack):
                continue
            arch = tuple(self._ref(p.slug, s.number, f"{p.title} {s.title}") for s in p.sections if s.number == ARCHITECTURE_SECTION)
            out.append(SkillMatch(p.slug, p.title, arch or (self._ref(p.slug, INTRO_SECTION, f"{p.title} 소개"),)))
        return out

    def slugs(self) -> list[str]:
        return [p.slug for p in self._data.projects]

    def all_section_urls(self) -> set[str]:
        urls = set(self._data.profile_urls)
        for p in self._data.projects:
            urls.add(self._data.section_url(p.slug, INTRO_SECTION))
            urls.update(self._data.section_url(p.slug, s.number) for s in p.sections)
        return urls
