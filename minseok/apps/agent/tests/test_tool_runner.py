from agent.app.tool_runner import ToolRunner
from hub.app.dtos import Chunk, ProjectFacts, SkillMatch, SlideRef
from hub.app.ports.output.catalog_port import ProjectCatalogPort
from hub.app.ports.output.search_port import KnowledgeSearchPort

REF = SlideRef("callguard", 5, "검색 구성", "https://callguard.jangminseok.com#05")


class Cat(ProjectCatalogPort):
    def get_project(self, slug):
        if slug != "callguard":
            return None
        return ProjectFacts("callguard", "CallGuard", "t", "2026-08-20 ~ 진행 중", 4, "백엔드", ("FastAPI",),
                            ("Python",), (("Recall@5", "0.971"),), (REF,), "https://callguard.jangminseok.com")

    def find_by_skill(self, skill):
        return [SkillMatch("callguard", "CallGuard", (REF,))] if skill == "Elasticsearch" else []

    def slugs(self):
        return ["callguard"]

    def all_slide_urls(self):
        return {REF.url}


class Search(KnowledgeSearchPort):
    async def search(self, query, top_k):
        return [Chunk("callguard", 5, "검색 구성", "dense 0.979", REF.url, 0.03)]


async def test_get_project_returns_payload_and_evidence():
    r = await ToolRunner(Cat(), Search()).run("get_project", {"slug": "callguard"})
    assert r.ok and r.payload["team_size"] == 4 and "0.971" in r.evidence_text and r.sources == [REF]


async def test_bad_slug_is_error_result_not_exception():
    r = await ToolRunner(Cat(), Search()).run("get_project", {"slug": "nope"})
    assert not r.ok and "callguard" in r.payload["error"]  # 가능한 slug를 알려준다


async def test_unknown_tool_is_error_result():
    r = await ToolRunner(Cat(), Search()).run("delete_everything", {})
    assert not r.ok


async def test_search_top_k_is_clamped():
    r = await ToolRunner(Cat(), Search()).run("search_portfolio", {"query": "검색", "top_k": 99})
    assert r.ok and r.payload["results"][0]["url"] == REF.url
