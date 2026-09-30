# core/rate_limit.py
from __future__ import annotations

import hashlib
import hmac
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from sqlalchemy import text

from core.config import IP_HASH_SECRET, RATE_PER_DAY, RATE_PER_MINUTE
from core.database import get_sessionmaker

KST = ZoneInfo("Asia/Seoul")  # 하루 한도는 한국 자정에 풀린다


def hash_ip(ip: str, secret: str = IP_HASH_SECRET) -> str:
    # 비밀값을 섞어야 IPv4 전체(약 43억 개)를 해시해 보는 방식으로 원래 IP를 찾을 수 없다
    return hmac.new(secret.encode(), ip.encode(), hashlib.sha256).hexdigest()


def window_keys(now: datetime) -> tuple[str, str]:
    now = now.astimezone(KST)
    return now.strftime("m:%Y%m%d%H%M"), now.strftime("d:%Y%m%d")


_UPSERT = text(
    'INSERT INTO rate_limit_hit (ip_hash, "window", count) VALUES (:h, :w, 1) '
    'ON CONFLICT (ip_hash, "window") DO UPDATE SET count = rate_limit_hit.count + 1 RETURNING count'
)
# 지난 분·지난 날 기록은 더 쓰지 않는다 — 키가 0 채움 형식이라 문자열 비교가 시간 순서와 같다
_PURGE = text(
    'DELETE FROM rate_limit_hit WHERE ("window" LIKE \'m:%\' AND "window" < :m) '
    'OR ("window" LIKE \'d:%\' AND "window" < :d)'
)


class RateLimiter:
    def __init__(self, per_minute: int = RATE_PER_MINUTE, per_day: int = RATE_PER_DAY) -> None:
        self.per_minute, self.per_day = per_minute, per_day

    def exceeded(self, used_minute: int, used_day: int) -> str | None:
        """넘은 한도 — "day"가 우선(1분 뒤에도 풀리지 않으므로), 넘지 않았으면 None"""
        if used_day > self.per_day:
            return "day"
        return "minute" if used_minute > self.per_minute else None

    async def hit(self, ip: str) -> str | None:
        h = hash_ip(ip)
        m, d = window_keys(datetime.now(timezone.utc))
        async with get_sessionmaker()() as s:
            await s.execute(_PURGE, {"m": m, "d": d})
            per_min = (await s.execute(_UPSERT, {"h": h, "w": m})).scalar_one()
            per_day = (await s.execute(_UPSERT, {"h": h, "w": d})).scalar_one()
            await s.commit()
        return self.exceeded(per_min, per_day)
