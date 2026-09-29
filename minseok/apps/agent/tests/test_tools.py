# test_tools.py
from agent.domain.tools import TOOLS, tool_names


def test_three_tools_with_json_schema():
    assert tool_names() == {"search_portfolio", "get_project", "find_by_skill"}
    for t in TOOLS:
        assert t.parameters["type"] == "object" and t.parameters["required"]
        assert t.description.endswith("다.")  # 설명은 LLM이 읽는 문장 — 합쇼체 한 문장 이상


def test_get_project_slug_is_enum_filled_later():
    spec = next(t for t in TOOLS if t.name == "get_project")
    assert spec.parameters["properties"]["slug"]["type"] == "string"
