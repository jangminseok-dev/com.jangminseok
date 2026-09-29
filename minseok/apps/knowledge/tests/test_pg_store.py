import pytest

from core.database import get_sessionmaker
from knowledge.adapter.outbound.pg_chunk_store import PgChunkStore

pytestmark = pytest.mark.network


async def test_keyword_search_finds_korean_text():
    ids = await PgChunkStore(get_sessionmaker()).keyword_search("개인정보 마스킹", 5)
    assert ids, "색인 후 실행 — python -m knowledge.adapter.inbound.cli.index"


async def test_pgroonga_keyword_search_finds_korean_text():
    from knowledge.adapter.outbound.pg_chunk_store import PgroongaChunkStore

    ids = await PgroongaChunkStore(get_sessionmaker()).keyword_search("개인정보 마스킹", 5)
    assert ids
