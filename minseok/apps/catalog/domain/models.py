from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Section:
    number: int
    title: str
    text: str


@dataclass(frozen=True)
class Project:
    slug: str
    title: str
    tagline: str
    period: str
    team_size: int
    role: str
    stack: tuple[str, ...]
    languages: tuple[str, ...]
    metrics: tuple[tuple[str, str], ...]
    sections: tuple[Section, ...]


@dataclass(frozen=True)
class CatalogData:
    projects: tuple[Project, ...]
    site: str
    profile_urls: tuple[str, ...] = ()  # 메인 페이지 구역 주소와 프로필의 외부 링크(GitHub)

    @staticmethod
    def from_dict(d: dict, site: str) -> CatalogData:
        ps = []
        for p in d["projects"]:
            end = p["period"]["end"] or "진행 중"
            ps.append(
                Project(
                    slug=p["slug"], title=p["title"], tagline=p["tagline"],
                    period=f"{p['period']['start']} ~ {end}", team_size=p["team"]["size"], role=p["team"]["role"],
                    stack=tuple(p["stack"]), languages=tuple(p.get("languages", [])),
                    # 조건·추정 범위(note)를 값에 붙인다 — 빠지면 챗봇이 일부 값을 전체처럼 말한다
                    metrics=tuple((m["label"], f"{m['value']} ({m['note']})" if m.get("note") else m["value"])
                                  for m in p["metrics"]),
                    sections=tuple(Section(s["number"], s["title"], s["text"]) for s in p["sections"]),
                )
            )
        profile = d.get("profile") or {}
        urls = [f"{site}#{s['anchor']}" for s in profile.get("sections", [])] + profile.get("links", [])
        return CatalogData(tuple(ps), site, tuple(urls))

    def section_url(self, slug: str, number: int) -> str:
        host = self.site.replace("https://", "")
        return f"https://{slug}.{host}#{number:02d}"
