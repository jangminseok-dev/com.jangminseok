"""비밀값 단일 창구 — 로컬은 minseok/.env, 운영(Vercel)은 환경변수. 다른 모듈은 os.getenv를 쓰지 않는다."""
from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

_ENV_PATH = Path(__file__).resolve().parents[2] / ".env"


class SecretManager:
    _instance: SecretManager | None = None

    def __init__(self) -> None:
        if _ENV_PATH.exists():
            load_dotenv(_ENV_PATH, override=False)

    def get(self, key: str) -> str | None:
        value = os.environ.get(key)
        return value if value else None

    def require(self, key: str) -> str:
        value = self.get(key)
        if value is None:
            raise RuntimeError(f"환경변수 {key}가 없습니다")
        return value


def get_secret_manager() -> SecretManager:
    if SecretManager._instance is None:
        SecretManager._instance = SecretManager()
    return SecretManager._instance
