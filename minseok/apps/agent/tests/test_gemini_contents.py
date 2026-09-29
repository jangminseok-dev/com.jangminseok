from agent.adapter.outbound.gemini_llm import _contents
from agent.app.ports import Message


def test_function_call_part_keeps_thought_signature():
    out = _contents([Message("assistant", "", tool_name="get_project", tool_args={"slug": "x"}, signature=b"sig")])
    assert out[0].parts[0].thought_signature == b"sig"
