from __future__ import annotations

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from core.config import DATABASE_URL


class Base(DeclarativeBase):
    pass


_engine: AsyncEngine | None = None


def get_engine() -> AsyncEngine:
    """서버리스 + Supabase transaction pooler — 연결을 들고 있지 않고(NullPool) prepared statement를 끈다."""
    global _engine
    if _engine is None:
        if DATABASE_URL is None:
            raise RuntimeError("DATABASE_URL이 없습니다")
        _engine = create_async_engine(
            DATABASE_URL, poolclass=NullPool, connect_args={"prepare_threshold": None}
        )
    return _engine


def get_sessionmaker() -> async_sessionmaker:
    return async_sessionmaker(get_engine(), expire_on_commit=False)


async def ping() -> bool:
    try:
        async with get_engine().connect() as conn:
            await conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
