import asyncio
import os
import sys

from alembic import context

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "apps"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from core.database import Base, get_engine  # noqa: E402
import knowledge.adapter.outbound.orm  # noqa: E402,F401  — 모델 등록

target_metadata = Base.metadata


def run_migrations_online() -> None:
    async def run() -> None:
        async with get_engine().connect() as conn:
            await conn.run_sync(lambda c: (context.configure(connection=c, target_metadata=target_metadata),
                                           context.run_migrations()))
            await conn.commit()
    asyncio.run(run())


run_migrations_online()
