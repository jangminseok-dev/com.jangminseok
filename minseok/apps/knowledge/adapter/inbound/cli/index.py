"""python -m knowledge.adapter.inbound.cli.index — data/catalog.json을 청크·임베딩해 Supabase에 넣는다."""
import asyncio
import json
from pathlib import Path

from core.config import SITE_URL
from core.database import get_sessionmaker
from knowledge.adapter.outbound.gemini_embedding import GeminiEmbedding
from knowledge.adapter.outbound.pg_chunk_store import PgChunkStore
from knowledge.app.use_cases import IndexInteractor

CATALOG = Path(__file__).resolve().parents[5] / "data" / "catalog.json"


async def main() -> None:
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    report = await IndexInteractor(GeminiEmbedding(), PgChunkStore(get_sessionmaker())).run(
        catalog["projects"], SITE_URL, catalog.get("profile"))
    print(f"청크 {report.total}개 — 새로 임베딩 {report.embedded}, 건너뜀 {report.skipped}")


if __name__ == "__main__":
    asyncio.run(main())
