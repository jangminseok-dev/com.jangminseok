from catalog.app.use_cases import CatalogInteractor
from catalog.domain.models import CatalogData

DATA = CatalogData.from_dict(
    {
        "projects": [
            {"slug": "callguard", "order": 1, "title": "CallGuard", "tagline": "t",
             "period": {"start": "2026-08-20", "end": None}, "team": {"size": 4, "role": "백엔드"},
             "stack": ["Python 3.13", "Elasticsearch 9 + nori"], "languages": ["Python"],
             "metrics": [{"label": "Recall@5", "value": "0.971"}],
             "slides": [{"number": 2, "title": "설계 원칙", "label": "l", "text": "server와 ai 분리"},
                        {"number": 5, "title": "검색 구성", "label": "l", "text": "Elasticsearch BM25와 dense 비교"}]},
            {"slug": "redoceanmap", "order": 2, "title": "RedOceanMap", "tagline": "t",
             "period": {"start": "2026-05-22", "end": None}, "team": {"size": 1, "role": "1인"},
             "stack": ["PostgreSQL + pgvector"], "languages": ["Python"], "metrics": [],
             "slides": [{"number": 2, "title": "설계 원칙", "label": "l", "text": "import-linter"}]},
        ]
    },
    site="https://jangminseok.com",
)


def test_get_project_returns_facts_with_slide_urls():
    facts = CatalogInteractor(DATA).get_project("callguard")
    assert facts is not None and facts.team_size == 4
    assert facts.slides[1].url == "https://callguard.jangminseok.com#05"
    assert ("Recall@5", "0.971") in facts.metrics


def test_get_project_unknown_slug_is_none():
    assert CatalogInteractor(DATA).get_project("nope") is None


def test_find_by_skill_matches_stack_and_slide_text_case_insensitive():
    matches = CatalogInteractor(DATA).find_by_skill("elasticsearch")
    assert [m.slug for m in matches] == ["callguard"]
    assert [e.slide_number for e in matches[0].evidence] == [5]


def test_find_by_skill_stack_only_match_has_intro_slide():
    matches = CatalogInteractor(DATA).find_by_skill("pgvector")
    assert matches[0].slug == "redoceanmap" and matches[0].evidence[0].slide_number == 1


def test_all_slide_urls_includes_intro():
    urls = CatalogInteractor(DATA).all_slide_urls()
    assert "https://redoceanmap.jangminseok.com#01" in urls


def test_find_by_skill_ignores_rejected_alternatives():
    data = CatalogData.from_dict(
        {"projects": [{"slug": "chagocnote", "order": 5, "title": "차곡노트", "tagline": "t",
                       "period": {"start": "2026-09-20", "end": None}, "team": {"size": 1, "role": "1인"},
                       "stack": ["PostgreSQL"], "languages": ["Python"], "metrics": [],
                       "slides": [{"number": 6, "title": "고객 검색", "label": "l",
                                   "text": "pg_trgm 색인\n버린 대안 전용 검색 엔진(Elasticsearch 등): 과하다"}]}]},
        site="https://jangminseok.com",
    )
    assert CatalogInteractor(data).find_by_skill("Elasticsearch") == []


def test_all_slide_urls_has_only_real_sections():
    urls = CatalogInteractor(DATA).all_slide_urls()
    assert urls == {
        "https://callguard.jangminseok.com#01", "https://callguard.jangminseok.com#02", "https://callguard.jangminseok.com#05",
        "https://redoceanmap.jangminseok.com#01", "https://redoceanmap.jangminseok.com#02",
    }  # 없는 섹션 번호(옛 회고 슬라이드 자리)는 만들지 않는다
