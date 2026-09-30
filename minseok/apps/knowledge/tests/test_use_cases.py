from dataclasses import dataclass

from knowledge.app.ports import ChunkStorePort, EmbeddingPort, StoredChunk
from knowledge.app.use_cases import IndexInteractor, SearchInteractor


class FakeEmbed(EmbeddingPort):
    def __init__(self):
        self.calls = 0

    async def embed(self, texts, task):
        self.calls += len(texts)
        return [[float(len(t))] for t in texts]


class FakeStore(ChunkStorePort):
    def __init__(self):
        self.rows = {1: StoredChunk(1, "a", 2, "설계", "벡터 본문", "u1"),
                     2: StoredChunk(2, "a", 3, "검색", "키워드 본문", "u2"),
                     3: StoredChunk(3, "b", 2, "기타", "둘 다", "u3")}
        self.hashes: set[str] = set()
        self.replaced = None

    async def vector_search(self, vec, limit):
        return [1, 3][:limit]

    async def keyword_search(self, query, limit):
        return [2, 3][:limit]

    async def get(self, ids):
        return {i: self.rows[i] for i in ids}

    async def existing_hashes(self):
        return self.hashes

    async def replace_all(self, chunks, keep_hashes):
        self.replaced = (chunks, keep_hashes)


async def test_search_fuses_vector_and_keyword_results():
    result = await SearchInteractor(FakeEmbed(), FakeStore()).search("질문", top_k=2)
    assert [c.slug for c in result][0] == "b"  # 3번이 양쪽 모두에 있어 1위
    assert len(result) == 2 and result[0].score > result[1].score


async def test_search_blank_query_returns_empty_without_embedding():
    embed = FakeEmbed()
    assert await SearchInteractor(embed, FakeStore()).search("   ", top_k=5) == []
    assert embed.calls == 0


async def test_index_skips_unchanged_chunks():
    store, embed = FakeStore(), FakeEmbed()
    projects = [{"slug": "a", "title": "A", "tagline": "t", "sections": [{"number": 2, "title": "s", "text": "x"}]}]
    first = await IndexInteractor(embed, store).run(projects, "https://jangminseok.com")
    store.hashes = {c.content_hash for c, _ in store.replaced[0]} | store.replaced[1]
    second = await IndexInteractor(embed, store).run(projects, "https://jangminseok.com")
    assert first.embedded == 2 and second.embedded == 0 and second.skipped == 2


async def test_embedding_outage_becomes_search_unavailable():
    import pytest

    from hub.app.ports.output.search_port import SearchUnavailable
    from knowledge.app.ports import EmbeddingUnavailable

    class Down(FakeEmbed):
        async def embed(self, texts, task):
            raise EmbeddingUnavailable("429")

    with pytest.raises(SearchUnavailable):
        await SearchInteractor(Down(), FakeStore()).search("검색", 5)


async def test_embedding_network_error_becomes_embedding_unavailable(monkeypatch):
    import httpx
    import pytest

    from knowledge.adapter.outbound.gemini_embedding import GeminiEmbedding
    from knowledge.app.ports import EmbeddingUnavailable

    monkeypatch.setattr("knowledge.adapter.outbound.gemini_embedding.GEMINI_API_KEY", "test-key")  # CI에는 키가 없다
    emb = GeminiEmbedding()

    async def boom(**_):
        raise httpx.ReadTimeout("timeout")

    monkeypatch.setattr(emb._client.aio.models, "embed_content", boom)
    with pytest.raises(EmbeddingUnavailable):
        await emb.embed(["q"], "query")
