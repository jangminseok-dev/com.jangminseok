# core/rate_limit.py
from __future__ import annotations

import hashlib
from datetime import datetime, timezone

from sqlalchemy import text

from core.config import RATE_PER_DAY, RATE_PER_MINUTE
from core.database import get_sessionmaker


def hash_ip(ip: str) -> str:
    return hashlib.sha256(f"jangminseok:{ip}".encode()).hexdigest()


def window_keys(now: datetime) -> tuple[str, str]:
    return now.strftime("m:%Y%m%d%H%M"), now.strftime("d:%Y%m%d")


_UPSERT = text(
    'INSERT INTO rate_limit_hit (ip_hash, "window", count) VALUES (:h, :w, 1) '
    'ON CONFLICT (ip_hash, "window") DO UPDATE SET count = rate_limit_hit.count + 1 RETURNING count'
)


class RateLimiter:
    def __init__(self, per_minute: int = RATE_PER_MINUTE, per_day: int = RATE_PER_DAY) -> None:
        self.per_minute, self.per_day = per_minute, per_day

    def allowed(self, used_minute: int, used_day: int) -> bool:
        return used_minute <= self.per_minute and used_day <= self.per_day

    async def hit(self, ip: str) -> bool:
        h = hash_ip(ip)
        m, d = window_keys(datetime.now(timezone.utc))
        async with get_sessionmaker()() as s:
            per_min = (await s.execute(_UPSERT, {"h": h, "w": m})).scalar_one()
            per_day = (await s.execute(_UPSERT, {"h": h, "w": d})).scalar_one()
            await s.commit()
        return self.allowed(per_min, per_day)
