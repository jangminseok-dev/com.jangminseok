from abc import ABC, abstractmethod

from hub.app.dtos import Chunk


class KnowledgeSearchPort(ABC):
    @abstractmethod
    async def search(self, query: str, top_k: int) -> list[Chunk]: ...
