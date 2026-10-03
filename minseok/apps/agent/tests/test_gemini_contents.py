from agent.adapter.outbound.gemini_llm import _contents
from agent.app.ports import Message


def test_function_call_part_keeps_thought_signature():
    out = _contents([Message("assistant", "", tool_name="get_project", tool_args={"slug": "x"}, signature=b"sig")])
    assert out[0].parts[0].thought_signature == b"sig"


def test_config_without_tools_sends_no_tool_declarations():
    from agent.adapter.outbound.gemini_llm import _config
    from agent.domain.tools import TOOLS

    assert _config(()).tools is None  # 한도 도달 후 마지막 턴 — 도구 없이 답만
    assert len(_config(TOOLS).tools[0].function_declarations) == 3


async def test_network_error_becomes_llm_unavailable(monkeypatch):
    import httpx
    import pytest

    from agent.adapter.outbound.gemini_llm import GeminiToolLlm
    from agent.app.ports import LlmUnavailable, Message
    from agent.domain.tools import TOOLS

    monkeypatch.setattr("agent.adapter.outbound.gemini_llm.GEMINI_API_KEY", "test-key")  # CI에는 키가 없다
    llm = GeminiToolLlm()

    async def boom(**_):
        raise httpx.ConnectTimeout("timeout")

    monkeypatch.setattr(llm._client.aio.models, "generate_content", boom)
    with pytest.raises(LlmUnavailable):
        await llm.next_turn([Message("user", "q")], TOOLS)


def test_client_has_request_timeout(monkeypatch):
    from agent.adapter.outbound.gemini_llm import TIMEOUT_MS, GeminiToolLlm

    monkeypatch.setattr("agent.adapter.outbound.gemini_llm.GEMINI_API_KEY", "test-key")
    assert GeminiToolLlm()._client._api_client._http_options.timeout == TIMEOUT_MS  # 응답 없는 호출이 끝없이 기다리지 않게
