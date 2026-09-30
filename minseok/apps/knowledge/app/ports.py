from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Literal

from knowledge.domain.chunker import ChunkDraft


class EmbeddingUnavailable(Exception):
    """임베딩 API 한도 초과·장애"""


@dataclass(frozen=True)
class StoredChunk:
    id: int
    slug: str
    section_number: int
    title: str
    text: str
    url: str


class EmbeddingPort(ABC):
    @abstractmethod
    async def embed(self, texts: list[str], task: Literal["query", "document"]) -> list[list[float]]: ...


class ChunkStorePort(ABC):
    @abstractmethod
    async def vector_search(self, vec: list[float], limit: int) -> list[int]: ...
    @abstractmethod
    async def keyword_search(self, query: str, limit: int) -> list[int]: ...
    @abstractmethod
    async def get(self, ids: list[int]) -> dict[int, StoredChunk]: ...
    @abstractmethod
    async def existing_hashes(self) -> set[str]: ...
    @abstractmethod
    async def replace_all(self, chunks: list[tuple[ChunkDraft, list[float]]], keep_hashes: set[str]) -> None: ...
