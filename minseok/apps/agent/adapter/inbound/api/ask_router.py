# agent/adapter/inbound/api/ask_router.py
from dataclasses import asdict

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from agent.app.ask import AskInteractor
from agent.app.ports import LlmUnavailable
from agent.dependencies.agent_provider import get_ask_interactor, get_rate_limiter
from core.config import MAX_QUESTION_CHARS

ask_router = APIRouter(prefix="/agent", tags=["agent"])


class AskBody(BaseModel):
    question: str = Field(min_length=1, max_length=MAX_QUESTION_CHARS)


def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for", "")
    return fwd.split(",")[0].strip() or (request.client.host if request.client else "unknown")


@ask_router.post("/v1/ask")
async def ask(body: AskBody, request: Request, interactor: AskInteractor = Depends(get_ask_interactor),
              limiter=Depends(get_rate_limiter)):
    if not body.question.strip():
        raise HTTPException(422, "질문을 입력해 주십시오.")
    if not await limiter.hit(_client_ip(request)):
        raise HTTPException(429, "질문이 많아 잠시 쉬고 있습니다. 1분 뒤 다시 시도해 주십시오.")
    try:
        r = await interactor.ask(body.question.strip())
    except LlmUnavailable:
        raise HTTPException(503, "AI 응답 한도에 도달했습니다. 잠시 뒤 다시 시도해 주십시오.")
    return {
        "answer": r.answer,
        "refused": r.refused,
        "sources": [{"project": s.slug, "slide": s.slide_number, "title": s.title, "url": s.url} for s in r.sources],
        "tool_calls": [asdict(t) for t in r.tool_calls],
    }


@ask_router.get("/myself")
async def myself():
    return {"app": "agent", "role": "포트폴리오 질문에 도구 3개로 답합니다"}
