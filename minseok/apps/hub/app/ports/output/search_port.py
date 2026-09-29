from abc import ABC, abstractmethod

from hub.app.dtos import Chunk


class SearchUnavailable(Exception):
    """검색 백엔드(임베딩 한도, 장애)를 잠시 쓸 수 없음 — 도구는 오류 결과로 바꿔 LLM에 되돌린다"""


class KnowledgeSearchPort(ABC):
    @abstractmethod
    async def search(self, query: str, top_k: int) -> list[Chunk]: ...
