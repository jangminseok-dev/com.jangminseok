from __future__ import annotations

from dataclasses import dataclass

from hub.app.dtos import Chunk
from hub.app.ports.output.search_port import KnowledgeSearchPort, SearchUnavailable
from knowledge.app.ports import ChunkStorePort, EmbeddingPort, EmbeddingUnavailable
from knowledge.domain.chunker import chunk_catalog
from knowledge.domain.rrf import rrf_fuse

CANDIDATES = 20


class SearchInteractor(KnowledgeSearchPort):
    def __init__(self, embed: EmbeddingPort, store: ChunkStorePort) -> None:
        self._embed, self._store = embed, store

    async def search(self, query: str, top_k: int) -> list[Chunk]:
        q = query.strip()
        if not q:
            return []
        try:
            [vec] = await self._embed.embed([q], "query")
        except EmbeddingUnavailable as e:
            raise SearchUnavailable(str(e)) from e
        dense = await self._store.vector_search(vec, CANDIDATES)
        sparse = await self._store.keyword_search(q, CANDIDATES)
        fused = rrf_fuse([dense, sparse])[:top_k]
        rows = await self._store.get([i for i, _ in fused])
        return [Chunk(rows[i].slug, rows[i].section_number, rows[i].title, rows[i].text, rows[i].url, score)
                for i, score in fused if i in rows]


@dataclass(frozen=True)
class IndexReport:
    total: int
    embedded: int
    skipped: int


class IndexInteractor:
    def __init__(self, embed: EmbeddingPort, store: ChunkStorePort) -> None:
        self._embed, self._store = embed, store

    async def run(self, projects: list[dict], site: str, profile: dict | None = None) -> IndexReport:
        drafts = chunk_catalog(projects, site, profile=profile)
        existing = await self._store.existing_hashes()
        todo = [d for d in drafts if d.content_hash not in existing]
        vecs = await self._embed.embed([d.text for d in todo], "document") if todo else []
        keep = {d.content_hash for d in drafts if d.content_hash in existing}
        await self._store.replace_all(list(zip(todo, vecs)), keep)
        return IndexReport(len(drafts), len(todo), len(drafts) - len(todo))
