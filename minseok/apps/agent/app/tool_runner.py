# agent/app/tool_runner.py
from __future__ import annotations

from dataclasses import asdict, dataclass

from hub.app.dtos import SlideRef
from hub.app.ports.output.catalog_port import ProjectCatalogPort
from hub.app.ports.output.search_port import KnowledgeSearchPort

DEFAULT_TOP_K, MAX_TOP_K = 5, 8


def _with_project(project: str | None, title: str) -> str:
    return title if not project or title.startswith(project) else f"{project} {title}"


@dataclass(frozen=True)
class ToolResult:
    ok: bool
    payload: dict
    evidence_text: str
    sources: list[SlideRef]


class ToolRunner:
    """도구 = 유스케이스. 챗봇(툴콜링)과 MCP가 이 한 곳만 호출한다."""

    def __init__(self, catalog: ProjectCatalogPort, search: KnowledgeSearchPort) -> None:
        self._catalog, self._search = catalog, search

    async def run(self, name: str, args: dict) -> ToolResult:
        if name == "search_portfolio":
            query = str(args.get("query", ""))
            top_k = max(1, min(int(args.get("top_k", DEFAULT_TOP_K)), MAX_TOP_K))
            chunks = await self._search.search(query, top_k)
            # 근거 칩에 프로젝트 이름을 붙인다 — "아키텍처"만 있으면 어느 프로젝트인지 알 수 없다
            names = {slug: f.title for slug in {c.slug for c in chunks} if (f := self._catalog.get_project(slug))}
            refs = [SlideRef(c.slug, c.slide_number, _with_project(names.get(c.slug), c.title), c.url) for c in chunks]
            payload = {"results": [{"project": c.slug, "slide": c.slide_number, "title": c.title,
                                    "url": c.url, "text": c.text} for c in chunks]}
            return ToolResult(True, payload, "\n".join(c.text for c in chunks), refs)
        if name == "get_project":
            slug = str(args.get("slug", ""))
            facts = self._catalog.get_project(slug)
            if facts is None:
                return ToolResult(False, {"error": f"없는 slug입니다. 가능한 값: {', '.join(self._catalog.slugs())}"}, "", [])
            payload = asdict(facts)
            evidence = " ".join([facts.period, f"{facts.team_size}명", facts.role, *facts.stack,
                                 *(f"{k} {v}" for k, v in facts.metrics)])
            return ToolResult(True, payload, evidence, list(facts.slides))
        if name == "find_by_skill":
            matches = self._catalog.find_by_skill(str(args.get("skill", "")))
            payload = {"projects": [asdict(m) for m in matches]}
            refs = [e for m in matches for e in m.evidence]
            return ToolResult(True, payload, " ".join(r.title for r in refs), refs)
        return ToolResult(False, {"error": f"없는 도구입니다: {name}"}, "", [])
