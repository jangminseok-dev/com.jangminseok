# agent/dependencies/agent_provider.py
from fastapi import Depends

from agent.adapter.outbound.gemini_llm import GeminiToolLlm
from agent.app.ask import AskInteractor
from agent.app.tool_runner import ToolRunner
from core.config import BANNED_TERMS, MAX_TOOL_CALLS
from core.question_log import QuestionLog
from core.rate_limit import RateLimiter
from hub.app.ports.output.catalog_port import ProjectCatalogPort
from hub.app.ports.output.search_port import KnowledgeSearchPort
from hub.dependencies.catalog_provider import get_catalog_port
from hub.dependencies.search_provider import get_search_port


def get_tool_runner(catalog: ProjectCatalogPort = Depends(get_catalog_port),
                    search: KnowledgeSearchPort = Depends(get_search_port)) -> ToolRunner:
    return ToolRunner(catalog, search)


def get_ask_interactor(runner: ToolRunner = Depends(get_tool_runner),
                       catalog: ProjectCatalogPort = Depends(get_catalog_port)) -> AskInteractor:
    return AskInteractor(GeminiToolLlm(), runner, catalog, BANNED_TERMS, MAX_TOOL_CALLS)


def get_rate_limiter() -> RateLimiter:
    return RateLimiter()


def get_question_log() -> QuestionLog:
    return QuestionLog()
