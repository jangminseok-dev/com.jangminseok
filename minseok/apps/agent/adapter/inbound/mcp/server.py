"""MCP 입구 — 도구 로직은 ToolRunner에만 있다. 여기는 이름·설명·인자를 MCP 형식으로 노출할 뿐이다."""
from __future__ import annotations

import json
from typing import Callable

from mcp.server import MCPServer
from mcp.server.transport_security import TransportSecuritySettings

from agent.app.tool_runner import ToolRunner
from agent.domain.tools import TOOLS
from core.config import ALLOWED_HOSTS, MCP_RATE_PER_DAY, MCP_RATE_PER_MINUTE
from core.rate_limit import RateLimiter

DESC = {t.name: t.description for t in TOOLS}
RATE_LIMITED = {"error": "호출이 많아 잠시 쉬고 있습니다"}


def transport_security() -> TransportSecuritySettings:
    return TransportSecuritySettings(allowed_hosts=ALLOWED_HOSTS + [f"{h}:*" for h in ALLOWED_HOSTS])


def mcp_limiter() -> RateLimiter:
    return RateLimiter(MCP_RATE_PER_MINUTE, MCP_RATE_PER_DAY)


def build_mcp(runner_factory: Callable[[], ToolRunner],
              limiter_factory: Callable[[], RateLimiter] = mcp_limiter) -> MCPServer:
    mcp = MCPServer(
        "jangminseok-portfolio",
        instructions="장민석 포트폴리오의 프로젝트 8개(이 사이트 포함)를 조회합니다. 답할 때는 결과의 url을 근거로 인용하십시오.",
    )

    async def _run(name: str, args: dict) -> str:
        # 호출자 IP를 알 수 없으므로 MCP 전체를 한 버킷으로 묶는다
        if not await limiter_factory().hit("mcp"):
            return json.dumps(RATE_LIMITED, ensure_ascii=False)
        result = await runner_factory().run(name, args)
        return json.dumps(result.payload, ensure_ascii=False)

    @mcp.tool(description=DESC["search_portfolio"])
    async def search_portfolio(query: str, top_k: int = 5) -> str:
        return await _run("search_portfolio", {"query": query, "top_k": top_k})

    @mcp.tool(description=DESC["get_project"])
    async def get_project(slug: str) -> str:
        return await _run("get_project", {"slug": slug})

    @mcp.tool(description=DESC["find_by_skill"])
    async def find_by_skill(skill: str) -> str:
        return await _run("find_by_skill", {"skill": skill})

    return mcp
