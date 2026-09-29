import httpx

import main

INIT = {"jsonrpc": "2.0", "id": 1, "method": "initialize",
        "params": {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "t", "version": "0"}}}
LIST = {"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}}
HEADERS = {"accept": "application/json, text/event-stream", "content-type": "application/json"}


async def test_mcp_endpoint():
    # session_manager.run()은 인스턴스당 한 번만 가능 — lifespan 한 번 안에서 모두 확인한다
    async with main.app.router.lifespan_context(main.app):
        transport = httpx.ASGITransport(app=main.app)

        async def post(host: str, payload: dict) -> httpx.Response:
            async with httpx.AsyncClient(transport=transport, base_url=f"http://{host}") as c:
                return await c.post("/mcp/", json=payload, headers=HEADERS)

        init = await post("localhost", INIT)
        assert init.status_code == 200 and "jangminseok" in init.text

        public = await post("api.jangminseok.com", INIT)
        assert public.status_code == 200  # 운영 Host가 DNS rebinding 보호에 막히지 않는다

        evil = await post("evil.example.com", INIT)
        assert evil.status_code == 421  # 허용 목록 밖 Host는 거절

        tools = await post("localhost", LIST)
        assert {t["name"] for t in tools.json()["result"]["tools"]} == {"search_portfolio", "get_project", "find_by_skill"}
