from datetime import datetime, timezone

from core.rate_limit import hash_ip, window_keys


def test_window_keys_minute_and_day():
    m, d = window_keys(datetime(2026, 9, 30, 12, 34, 56, tzinfo=timezone.utc))
    assert m == "m:202609301234" and d == "d:20260930"


def test_ip_is_hashed_not_stored_raw():
    h = hash_ip("203.0.113.5")
    assert len(h) == 64 and "203" not in h
