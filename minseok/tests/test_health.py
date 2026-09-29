from fastapi.testclient import TestClient

import main


def test_health_reports_db_status(monkeypatch):
    async def fake_ping() -> bool:
        return True

    monkeypatch.setattr(main, "database_ping", fake_ping)
    res = TestClient(main.app).get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok", "db": True}


def test_health_is_503_when_db_down(monkeypatch):
    async def fake_ping() -> bool:
        return False

    monkeypatch.setattr(main, "database_ping", fake_ping)
    res = TestClient(main.app).get("/health")
    assert res.status_code == 503
