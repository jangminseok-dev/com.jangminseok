from __future__ import annotations

import httpx
from google import genai
from google.genai import errors, types

from core.config import EMBED_DIM, EMBED_MODEL, GEMINI_API_KEY
from knowledge.app.ports import EmbeddingPort, EmbeddingUnavailable

BATCH = 50


class GeminiEmbedding(EmbeddingPort):
    def __init__(self) -> None:
        self._client = genai.Client(api_key=GEMINI_API_KEY)

    async def embed(self, texts, task):
        task_type = "RETRIEVAL_QUERY" if task == "query" else "RETRIEVAL_DOCUMENT"
        out: list[list[float]] = []
        try:
            for i in range(0, len(texts), BATCH):
                res = await self._client.aio.models.embed_content(
                    model=EMBED_MODEL, contents=texts[i : i + BATCH],
                    config=types.EmbedContentConfig(output_dimensionality=EMBED_DIM, task_type=task_type),
                )
                out += [e.values for e in res.embeddings]
        except (errors.APIError, httpx.HTTPError) as e:  # 한도, 서버 오류, 네트워크 시간 초과
            raise EmbeddingUnavailable(str(e)) from e
        return out
