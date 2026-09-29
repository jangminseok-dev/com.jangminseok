from pgvector.sqlalchemy import Vector
from sqlalchemy import Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from core.config import EMBED_DIM
from core.database import Base


class KnowledgeChunkOrm(Base):
    __tablename__ = "knowledge_chunk"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(40), index=True)
    slide_number: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(200))
    text: Mapped[str] = mapped_column(Text)
    url: Mapped[str] = mapped_column(String(300))
    content_hash: Mapped[str] = mapped_column(String(64), unique=True)
    embedding: Mapped[list[float]] = mapped_column(Vector(EMBED_DIM))


class RateLimitHitOrm(Base):
    __tablename__ = "rate_limit_hit"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ip_hash: Mapped[str] = mapped_column(String(64), index=True)
    window: Mapped[str] = mapped_column(String(16))  # "m:202609301230" 또는 "d:20260930"
    count: Mapped[int] = mapped_column(Integer, default=0)
    __table_args__ = (Index("uq_rate_window", "ip_hash", "window", unique=True),)
