import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "apps"))

from fastapi import FastAPI  # noqa: E402
from fastapi.responses import JSONResponse  # noqa: E402

from core.database import ping as database_ping  # noqa: E402

app = FastAPI(title="jangminseok portfolio agent", docs_url=None, redoc_url=None)


@app.get("/health")
async def health():
    ok = await database_ping()
    return JSONResponse({"status": "ok" if ok else "degraded", "db": ok}, status_code=200 if ok else 503)


from agent.adapter.inbound.api.ask_router import ask_router  # noqa: E402
from catalog.dependencies.catalog_gateway import get_catalog_gateway  # noqa: E402
from hub.dependencies.catalog_provider import get_catalog_port  # noqa: E402
from hub.dependencies.search_provider import get_search_port  # noqa: E402
from knowledge.dependencies.search_gateway import get_search_gateway  # noqa: E402

app.include_router(ask_router)
app.dependency_overrides[get_catalog_port] = get_catalog_gateway
app.dependency_overrides[get_search_port] = get_search_gateway
