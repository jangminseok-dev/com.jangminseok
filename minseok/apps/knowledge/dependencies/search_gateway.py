from functools import lru_cache

from core.database import get_sessionmaker
from hub.app.ports.output.search_port import KnowledgeSearchPort
from knowledge.adapter.outbound.gemini_embedding import GeminiEmbedding
from knowledge.adapter.outbound.pg_chunk_store import PgChunkStore
from knowledge.app.use_cases import SearchInteractor


@lru_cache
def get_search_gateway() -> KnowledgeSearchPort:  # FastAPI 의존성 — 인자를 두면 쿼리 파라미터로 노출된다
    return SearchInteractor(GeminiEmbedding(), PgChunkStore(get_sessionmaker()))
