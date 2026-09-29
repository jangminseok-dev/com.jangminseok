# agent/app/ports.py
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Literal, Union

from agent.domain.tools import ToolSpec


class LlmUnavailable(Exception):
    """LLM 한도 초과·장애 — 라우터가 503으로 바꾼다"""


@dataclass(frozen=True)
class Message:
    role: Literal["user", "assistant", "tool"]
    content: str
    tool_name: str | None = None
    tool_args: dict | None = field(default=None)
    signature: bytes | None = None  # 모델이 도구 호출에 붙인 서명 — 다음 턴에 그대로 돌려준다


@dataclass(frozen=True)
class ToolCall:
    name: str
    args: dict
    signature: bytes | None = None


@dataclass(frozen=True)
class FinalAnswer:
    text: str


LlmTurn = Union[ToolCall, FinalAnswer]


class ToolLlmPort(ABC):
    @abstractmethod
    async def next_turn(self, history: list[Message], tools: tuple[ToolSpec, ...]) -> LlmTurn: ...
