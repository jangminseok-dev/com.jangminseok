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
