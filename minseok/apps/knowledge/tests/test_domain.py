from knowledge.domain.chunker import chunk_catalog
from knowledge.domain.rrf import rrf_fuse

PROJECTS = [{"slug": "a", "title": "A", "tagline": "소개", "sections": [
    {"number": 2, "title": "설계", "text": "가" * 1000},
    {"number": 3, "title": "검색", "text": "짧은 본문"},
]}]


def test_one_chunk_per_section_split_when_long_and_intro_chunk():
    chunks = chunk_catalog(PROJECTS, "https://jangminseok.com", max_chars=800)
    numbers = [c.section_number for c in chunks]
    assert numbers.count(2) == 2 and numbers.count(3) == 1 and numbers.count(1) == 1
    assert all(len(c.text) <= 800 + len("A 설계\n") for c in chunks)
    assert chunks[-1].url == "https://a.jangminseok.com#03"


def test_content_hash_is_stable_and_changes_with_text():
    a = chunk_catalog(PROJECTS, "https://jangminseok.com")
    b = chunk_catalog(PROJECTS, "https://jangminseok.com")
    assert [c.content_hash for c in a] == [c.content_hash for c in b]


def test_rrf_prefers_items_ranked_high_in_both():
    fused = rrf_fuse([[1, 2, 3], [2, 3, 1]])
    assert fused[0][0] == 2
    assert [i for i, _ in fused] == [2, 1, 3]


def test_rrf_handles_empty_and_single_list():
    assert rrf_fuse([]) == []
    assert [i for i, _ in rrf_fuse([[5, 6]])] == [5, 6]


def test_notes_become_chunks_linked_to_their_section():
    projects = [{**PROJECTS[0], "notes": [{"section": 3, "title": "검색 이유", "text": "키워드와 벡터를 섞었습니다."}]}]
    notes = [c for c in chunk_catalog(projects, "https://jangminseok.com") if "설명" in c.title]
    assert len(notes) == 1
    assert notes[0].section_number == 3 and notes[0].url == "https://a.jangminseok.com#03"
    assert "키워드와 벡터" in notes[0].text and notes[0].title == "검색 이유 (설명)"


def test_profile_sections_become_chunks_linked_to_main_page():
    profile = {"sections": [{"number": 5, "anchor": "contact", "title": "장민석 연락처", "text": "이메일: a@b.c"}]}
    chunks = [c for c in chunk_catalog(PROJECTS, "https://jangminseok.com", profile=profile) if c.slug == "profile"]
    assert len(chunks) == 1
    assert chunks[0].url == "https://jangminseok.com#contact" and chunks[0].section_number == 5
    assert chunks[0].text == "장민석 연락처\n이메일: a@b.c"
