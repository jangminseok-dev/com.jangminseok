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
