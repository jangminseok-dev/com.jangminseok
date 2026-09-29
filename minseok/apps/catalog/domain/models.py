from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Slide:
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
    slides: tuple[Slide, ...]


@dataclass(frozen=True)
class CatalogData:
    projects: tuple[Project, ...]
    site: str

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
                    metrics=tuple((m["label"], m["value"]) for m in p["metrics"]),
                    slides=tuple(Slide(s["number"], s["title"], s["text"]) for s in p["slides"]),
                )
            )
        return CatalogData(tuple(ps), site)

    def slide_url(self, slug: str, number: int) -> str:
        host = self.site.replace("https://", "")
        return f"https://{slug}.{host}#{number:02d}"
