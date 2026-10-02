# core/question_log.py
from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy import text

from core.database import get_sessionmaker
from core.rate_limit import hash_ip

KEEP_DAYS = 30  # 오래 쌓아 둘 이유가 없다

_INSERT = text("INSERT INTO question_log (ip_hash, question, answer, refused) VALUES (:h, :q, :a, :r)")
_PURGE = text("DELETE FROM question_log WHERE created_at < :before")


def purge_before(now: datetime) -> datetime:
    return now - timedelta(days=KEEP_DAYS)


class QuestionLog:
    async def save(self, ip: str, question: str, answer: str, refused: bool) -> None:
        async with get_sessionmaker()() as s:
            await s.execute(_PURGE, {"before": purge_before(datetime.now(timezone.utc))})
            await s.execute(_INSERT, {"h": hash_ip(ip), "q": question, "a": answer, "r": refused})
            await s.commit()
