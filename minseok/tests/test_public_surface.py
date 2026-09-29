from fastapi.testclient import TestClient

import main


def test_api_schema_is_not_public():
    c = TestClient(main.app)
    for path in ("/openapi.json", "/docs", "/redoc"):
        assert c.get(path).status_code == 404, path
