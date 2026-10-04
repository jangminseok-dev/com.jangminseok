# agent/domain/tools.py
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ToolSpec:
    name: str
    description: str
    parameters: dict


TOOLS: tuple[ToolSpec, ...] = (
    ToolSpec(
        "search_portfolio",
        "장민석 포트폴리오의 프로젝트 소개 페이지와 본인 소개(기술 스택, 교육, 연락처)를 하이브리드 검색합니다. "
        "설계 이유, 방법, 기술 선택처럼 서술형 질문과 장민석 본인을 묻는 질문에 씁니다.",
        {"type": "object", "properties": {
            "query": {"type": "string", "description": "검색할 질문이나 핵심어"},
            "top_k": {"type": "integer", "minimum": 1, "maximum": 8, "description": "가져올 근거 수(기본 5)"}},
         "required": ["query"]},
    ),
    ToolSpec(
        "get_project",
        "프로젝트 하나의 기간, 팀 규모, 역할, 스택, 수치, 섹션 목록을 정확히 조회합니다.",
        {"type": "object", "properties": {"slug": {"type": "string", "description": "프로젝트 slug"}},
         "required": ["slug"]},
    ),
    ToolSpec(
        "find_by_skill",
        "특정 기술이나 키워드를 사용한 프로젝트와 근거 섹션을 찾습니다.",
        {"type": "object", "properties": {"skill": {"type": "string", "description": "기술 이름 (예: Elasticsearch)"}},
         "required": ["skill"]},
    ),
)


def tool_names() -> set[str]:
    return {t.name for t in TOOLS}


def with_project_slugs(tools: tuple[ToolSpec, ...], projects: dict[str, str]) -> tuple[ToolSpec, ...]:
    """get_project의 slug에 실제 프로젝트 목록(enum)과 이름을 넣는다 — 모델이 slug를 짐작하다 틀리지 않게."""
    hint = ", ".join(f"{slug}({title})" for slug, title in projects.items())
    out = []
    for t in tools:
        if t.name == "get_project":
            props = {**t.parameters["properties"],
                     "slug": {"type": "string", "enum": list(projects), "description": f"프로젝트 slug — {hint}"}}
            t = ToolSpec(t.name, t.description, {**t.parameters, "properties": props})
        out.append(t)
    return tuple(out)
