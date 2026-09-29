from datetime import datetime, timezone

from core.rate_limit import hash_ip, window_keys


def test_window_keys_minute_and_day():
    m, d = window_keys(datetime(2026, 9, 30, 12, 34, 56, tzinfo=timezone.utc))
    assert m == "m:202609301234" and d == "d:20260930"


def test_ip_is_hashed_not_stored_raw():
    h = hash_ip("203.0.113.5")
    assert len(h) == 64 and "203" not in h


def test_limits_are_per_limiter_so_mcp_can_be_looser():
    from core.rate_limit import RateLimiter

    site = RateLimiter()
    mcp = RateLimiter(per_minute=20, per_day=300)
    assert site.allowed(5, 30) and not site.allowed(6, 1) and not site.allowed(1, 31)
    assert mcp.allowed(20, 300) and not mcp.allowed(21, 1)


def test_mcp_uses_its_own_looser_limits():
    from agent.adapter.inbound.mcp.server import mcp_limiter
    from core.config import MCP_RATE_PER_DAY, MCP_RATE_PER_MINUTE

    lim = mcp_limiter()
    assert (lim.per_minute, lim.per_day) == (MCP_RATE_PER_MINUTE, MCP_RATE_PER_DAY)
    assert MCP_RATE_PER_DAY > 30  # 한 명이 하루 한도를 다 써서 다른 MCP 사용자를 막지 않게
