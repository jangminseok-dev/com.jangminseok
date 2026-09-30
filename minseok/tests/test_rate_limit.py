from datetime import datetime, timezone

from core.rate_limit import hash_ip, window_keys


def test_window_keys_minute_and_day():
    m, d = window_keys(datetime(2026, 9, 30, 12, 34, 56, tzinfo=timezone.utc))
    assert m == "m:202609302134" and d == "d:20260930"  # 한국 시간 21:34


def test_day_window_turns_at_korea_midnight():
    _, d = window_keys(datetime(2026, 9, 30, 15, 30, tzinfo=timezone.utc))  # 한국 10/1 00:30
    assert d == "d:20261001"


def test_ip_is_hashed_not_stored_raw():
    h = hash_ip("203.0.113.5")
    assert len(h) == 64 and "203" not in h


def test_ip_hash_depends_on_secret_so_ipv4_cannot_be_brute_forced():
    assert hash_ip("203.0.113.5", secret="a") != hash_ip("203.0.113.5", secret="b")


def test_exceeded_says_which_limit_so_day_limit_is_not_told_one_minute():
    from core.rate_limit import RateLimiter

    lim = RateLimiter(per_minute=5, per_day=30)
    assert lim.exceeded(5, 30) is None
    assert lim.exceeded(6, 1) == "minute"
    assert lim.exceeded(1, 31) == "day" and lim.exceeded(6, 31) == "day"


def test_limits_are_per_limiter_so_mcp_can_be_looser():
    from core.rate_limit import RateLimiter

    site = RateLimiter()
    mcp = RateLimiter(per_minute=20, per_day=300)
    assert site.exceeded(5, 30) is None and site.exceeded(6, 1) and site.exceeded(1, 31)
    assert mcp.exceeded(20, 300) is None and mcp.exceeded(21, 1)


def test_mcp_uses_its_own_looser_limits():
    from agent.adapter.inbound.mcp.server import mcp_limiter
    from core.config import MCP_RATE_PER_DAY, MCP_RATE_PER_MINUTE

    lim = mcp_limiter()
    assert (lim.per_minute, lim.per_day) == (MCP_RATE_PER_MINUTE, MCP_RATE_PER_DAY)
    assert MCP_RATE_PER_DAY > 30  # 한 명이 하루 한도를 다 써서 다른 MCP 사용자를 막지 않게
