import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "apps"))

from contextlib import asynccontextmanager  # noqa: E402

from fastapi import FastAPI  # noqa: E402
from fastapi.responses import JSONResponse  # noqa: E402

from agent.adapter.inbound.api.ask_router import ask_router  # noqa: E402
from agent.adapter.inbound.mcp.server import build_mcp, transport_security  # noqa: E402
from agent.app.tool_runner import ToolRunner  # noqa: E402
from catalog.dependencies.catalog_gateway import get_catalog_gateway  # noqa: E402
from core.database import ping as database_ping  # noqa: E402
from hub.dependencies.catalog_provider import get_catalog_port  # noqa: E402
from hub.dependencies.search_provider import get_search_port  # noqa: E402
from knowledge.dependencies.search_gateway import get_search_gateway  # noqa: E402

mcp = build_mcp(lambda: ToolRunner(get_catalog_gateway(), get_search_gateway()))


@asynccontextmanager
async def lifespan(_app):
    async with mcp.session_manager.run():
        yield


app = FastAPI(title="jangminseok portfolio agent", docs_url=None, redoc_url=None, openapi_url=None, lifespan=lifespan)


@app.get("/health")
async def health():
    ok = await database_ping()
    return JSONResponse({"status": "ok" if ok else "degraded", "db": ok}, status_code=200 if ok else 503)


app.include_router(ask_router)
app.dependency_overrides[get_catalog_port] = get_catalog_gateway
app.dependency_overrides[get_search_port] = get_search_gateway
app.mount("/mcp", mcp.streamable_http_app(streamable_http_path="/", stateless_http=True, json_response=True,
                                          transport_security=transport_security()))
