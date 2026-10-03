# agent/adapter/outbound/gemini_llm.py
from __future__ import annotations

import httpx
from google import genai
from google.genai import errors, types

from agent.app.ports import FinalAnswer, LlmUnavailable, Message, ToolCall, ToolLlmPort
from core.config import GEMINI_API_KEY, GEMINI_MODEL

TIMEOUT_MS = 30_000  # 응답 없는 호출 하나가 끝없이 기다리던 일(10/3 평가 중 35분) — 넘으면 LlmUnavailable


def _contents(history: list[Message]) -> list[types.Content]:
    out: list[types.Content] = []
    for m in history:
        if m.role == "user":
            out.append(types.Content(role="user", parts=[types.Part(text=m.content)]))
        elif m.role == "assistant":
            out.append(types.Content(role="model", parts=[types.Part(
                function_call=types.FunctionCall(name=m.tool_name, args=m.tool_args or {}),
                thought_signature=m.signature)]))
        else:
            out.append(types.Content(role="user", parts=[types.Part.from_function_response(
                name=m.tool_name, response={"result": m.content})]))
    return out


def _config(tools) -> types.GenerateContentConfig:
    decls = [types.FunctionDeclaration(name=t.name, description=t.description, parameters_json_schema=t.parameters)
             for t in tools]
    return types.GenerateContentConfig(
        tools=[types.Tool(function_declarations=decls)] if decls else None,
        automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True),
        temperature=0,
    )


class GeminiToolLlm(ToolLlmPort):
    def __init__(self) -> None:
        self._client = genai.Client(api_key=GEMINI_API_KEY, http_options=types.HttpOptions(timeout=TIMEOUT_MS))

    async def next_turn(self, history, tools):
        cfg = _config(tools)
        try:
            res = await self._client.aio.models.generate_content(model=GEMINI_MODEL, contents=_contents(history), config=cfg)
        except (errors.APIError, httpx.HTTPError) as e:  # 한도, 서버 오류, 네트워크 시간 초과 — 모두 503으로
            raise LlmUnavailable(str(e)) from e
        if res.function_calls:
            part = next(p for p in res.candidates[0].content.parts if p.function_call)
            return ToolCall(part.function_call.name, dict(part.function_call.args or {}), part.thought_signature)
        return FinalAnswer((res.text or "").strip())
