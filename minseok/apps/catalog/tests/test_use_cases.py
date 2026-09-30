from catalog.app.use_cases import CatalogInteractor
from catalog.domain.models import CatalogData

DATA = CatalogData.from_dict(
    {
        "projects": [
            {"slug": "callguard", "order": 1, "title": "CallGuard", "tagline": "t",
             "period": {"start": "2026-08-20", "end": None}, "team": {"size": 4, "role": "백엔드"},
             "stack": ["Python 3.13", "Elasticsearch 9 + nori"], "languages": ["Python"],
             "metrics": [{"label": "Recall@5", "value": "0.971"}],
             "sections": [{"number": 2, "title": "설계 원칙", "label": "l", "text": "server와 ai 분리"},
                        {"number": 5, "title": "검색 구성", "label": "l", "text": "Elasticsearch BM25와 dense 비교"}]},
            {"slug": "redoceanmap", "order": 2, "title": "RedOceanMap", "tagline": "t",
             "period": {"start": "2026-05-22", "end": None}, "team": {"size": 1, "role": "1인"},
             "stack": ["PostgreSQL + pgvector"], "languages": ["Python"], "metrics": [],
             "sections": [{"number": 2, "title": "설계 원칙", "label": "l", "text": "import-linter"}]},
        ]
    },
    site="https://jangminseok.com",
)


def test_get_project_returns_facts_with_section_urls():
    facts = CatalogInteractor(DATA).get_project("callguard")
    assert facts is not None and facts.team_size == 4
    assert facts.sections[1].url == "https://callguard.jangminseok.com#05"
    assert ("Recall@5", "0.971") in facts.metrics


def test_get_project_unknown_slug_is_none():
    assert CatalogInteractor(DATA).get_project("nope") is None


def test_find_by_skill_matches_stack_case_insensitive_and_points_to_architecture():
    data = CatalogData.from_dict(
        {"projects": [{"slug": "callguard", "order": 1, "title": "CallGuard", "tagline": "t",
                       "period": {"start": "2026-08-20", "end": None}, "team": {"size": 4, "role": "r"},
                       "stack": ["Elasticsearch 9 + nori"], "languages": ["Python"], "metrics": [],
                       "sections": [{"number": 3, "title": "아키텍처", "label": "l", "text": "검색과 음성: Elasticsearch 9 + nori"}]}]},
        site="https://jangminseok.com",
    )
    matches = CatalogInteractor(data).find_by_skill("elasticsearch")
    assert [m.slug for m in matches] == ["callguard"]
    assert [e.section_number for e in matches[0].evidence] == [3]


def test_find_by_skill_stack_only_match_has_intro_section():
    matches = CatalogInteractor(DATA).find_by_skill("pgvector")
    assert matches[0].slug == "redoceanmap" and matches[0].evidence[0].section_number == 1


def test_all_section_urls_includes_intro():
    urls = CatalogInteractor(DATA).all_section_urls()
    assert "https://redoceanmap.jangminseok.com#01" in urls


def test_find_by_skill_ignores_tech_only_mentioned_in_text():
    # "Neo4j를 구성만 하고 쓰지 않았습니다"처럼 본문에만 나온 기술은 쓴 기술이 아니다 — 스택으로만 판단
    data = CatalogData.from_dict(
        {"projects": [{"slug": "localhostdaegu", "order": 3, "title": "localhost:daegu", "tagline": "t",
                       "period": {"start": "2026-09-15", "end": None}, "team": {"size": 3, "role": "r"},
                       "stack": ["FastAPI"], "languages": ["Python"], "metrics": [],
                       "sections": [{"number": 6, "title": "회고", "label": "l",
                                   "text": "아쉬운 점: Neo4j와 Redis를 구성만 하고 쓰지 않았습니다"}]}]},
        site="https://jangminseok.com",
    )
    assert CatalogInteractor(data).find_by_skill("Neo4j") == []


def test_all_section_urls_has_only_real_sections():
    urls = CatalogInteractor(DATA).all_section_urls()
    assert urls == {
        "https://callguard.jangminseok.com#01", "https://callguard.jangminseok.com#02", "https://callguard.jangminseok.com#05",
        "https://redoceanmap.jangminseok.com#01", "https://redoceanmap.jangminseok.com#02",
    }  # 없는 섹션 번호(옛 회고 슬라이드 자리)는 만들지 않는다


def test_section_refs_carry_project_title_so_chips_are_not_ambiguous():
    facts = CatalogInteractor(DATA).get_project("callguard")
    assert facts is not None and facts.sections[0].title == "CallGuard 설계 원칙"
