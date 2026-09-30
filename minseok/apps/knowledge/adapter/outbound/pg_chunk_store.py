from __future__ import annotations

from sqlalchemy import delete, select, text

from knowledge.adapter.outbound.orm import KnowledgeChunkOrm
from knowledge.app.ports import ChunkStorePort, StoredChunk
from knowledge.domain.chunker import ChunkDraft

TRGM_THRESHOLD = 0.05  # 한국어 긴 본문 대비 짧은 질문 — 기본값(0.3)이면 거의 안 걸린다


class PgChunkStore(ChunkStorePort):
    def __init__(self, sessionmaker) -> None:
        self._sm = sessionmaker

    async def vector_search(self, vec, limit):
        async with self._sm() as s:
            rows = await s.execute(
                select(KnowledgeChunkOrm.id).order_by(KnowledgeChunkOrm.embedding.cosine_distance(vec)).limit(limit)
            )
            return [r[0] for r in rows]

    async def keyword_search(self, query, limit):
        async with self._sm() as s:
            rows = await s.execute(
                text("SELECT id FROM knowledge_chunk WHERE extensions.word_similarity(:q, text) > :t "
                     "ORDER BY extensions.word_similarity(:q, text) DESC LIMIT :n"),
                {"q": query, "t": TRGM_THRESHOLD, "n": limit},
            )
            return [r[0] for r in rows]

    async def get(self, ids):
        if not ids:
            return {}
        async with self._sm() as s:
            rows = (await s.execute(select(KnowledgeChunkOrm).where(KnowledgeChunkOrm.id.in_(ids)))).scalars()
            return {r.id: StoredChunk(r.id, r.slug, r.section_number, r.title, r.text, r.url) for r in rows}

    async def existing_hashes(self):
        async with self._sm() as s:
            return set((await s.execute(select(KnowledgeChunkOrm.content_hash))).scalars())

    async def replace_all(self, chunks: list[tuple[ChunkDraft, list[float]]], keep_hashes):
        async with self._sm() as s:
            await s.execute(delete(KnowledgeChunkOrm).where(KnowledgeChunkOrm.content_hash.not_in(keep_hashes or {""})))
            s.add_all(
                KnowledgeChunkOrm(slug=d.slug, section_number=d.section_number, title=d.title, text=d.text, url=d.url,
                                  content_hash=d.content_hash, embedding=v)
                for d, v in chunks
            )
            await s.commit()


class PgroongaChunkStore(PgChunkStore):
    """키워드 검색만 PGroonga 전문 검색(&@~, 질의 문법)으로 바꾼다. 나머지는 동일."""

    async def keyword_search(self, query, limit):
        async with self._sm() as s:
            rows = await s.execute(
                text("SELECT id FROM knowledge_chunk WHERE text &@~ :q "
                     "ORDER BY extensions.pgroonga_score(tableoid, ctid) DESC LIMIT :n"),
                {"q": query, "n": limit},
            )
            return [r[0] for r in rows]
