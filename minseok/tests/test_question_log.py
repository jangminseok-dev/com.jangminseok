from datetime import datetime, timezone

from core.question_log import KEEP_DAYS, purge_before


def test_questions_are_kept_for_30_days():
    assert KEEP_DAYS == 30
    assert purge_before(datetime(2026, 10, 31, tzinfo=timezone.utc)) == datetime(2026, 10, 1, tzinfo=timezone.utc)
