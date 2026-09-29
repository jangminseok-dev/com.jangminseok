# agent/adapter/inbound/api/ask_router.py
import logging
from dataclasses import asdict

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from agent.app.ask import AskInteractor
from agent.app.ports import LlmUnavailable
from agent.dependencies.agent_provider import get_ask_interactor, get_rate_limiter
from core.config import MAX_QUESTION_CHARS
from core.rate_limit import hash_ip

log = logging.getLogger("agent.ask")

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
    ip = _client_ip(request)
    # 어떤 IP 기준으로 호출 수를 세는지 운영 로그로 확인 — 원래 IP 대신 해시 앞 8자만 남긴다
    h = lambda v: hash_ip(v.split(",")[0].strip())[:8] if v else "-"
    log.warning("ask ip=%s xff=%s real=%s vercel=%s", h(ip), h(request.headers.get("x-forwarded-for", "")),
                h(request.headers.get("x-real-ip", "")), h(request.headers.get("x-vercel-forwarded-for", "")))
    if not await limiter.hit(ip):
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
