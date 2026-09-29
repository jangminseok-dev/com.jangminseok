from functools import lru_cache

from core.config import KEYWORD_BACKEND
from core.database import get_sessionmaker
from hub.app.ports.output.search_port import KnowledgeSearchPort
from knowledge.adapter.outbound.gemini_embedding import GeminiEmbedding
from knowledge.adapter.outbound.pg_chunk_store import PgChunkStore, PgroongaChunkStore
from knowledge.app.use_cases import SearchInteractor


def build_search(backend: str) -> KnowledgeSearchPort:
    """키워드 백엔드를 골라 조립 — 평가 CLI의 백엔드 비교용"""
    store = PgroongaChunkStore if backend == "pgroonga" else PgChunkStore
    return SearchInteractor(GeminiEmbedding(), store(get_sessionmaker()))


@lru_cache
def get_search_gateway() -> KnowledgeSearchPort:  # FastAPI 의존성 — 인자를 두면 쿼리 파라미터로 노출된다
    return build_search(KEYWORD_BACKEND)
