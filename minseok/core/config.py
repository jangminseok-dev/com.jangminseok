from core.key.secret_manager import get_secret_manager

_s = get_secret_manager()

# DB·키가 없어도 앱은 뜬다(테스트·CI). 쓰는 시점에 없으면 어댑터가 실패한다.
_db = _s.get("DATABASE_URL")
DATABASE_URL = _db.replace("postgresql://", "postgresql+psycopg://", 1) if _db else None
GEMINI_API_KEY = _s.get("GEMINI_API_KEY")

GEMINI_MODEL = "gemini-3.8-flash"
EMBED_MODEL = "gemini-embedding-2"
EMBED_DIM = 768

MAX_QUESTION_CHARS = 500
MAX_TOOL_CALLS = 3
RATE_PER_MINUTE = 5
RATE_PER_DAY = 30

BANNED_TERMS = [t.strip() for t in (_s.get("BANNED_TERMS") or "").replace(",", "\n").splitlines() if t.strip()]
ALLOWED_HOSTS = [h.strip() for h in (_s.get("ALLOWED_HOSTS") or "localhost,127.0.0.1,testserver").split(",") if h.strip()]
SITE_URL = "https://jangminseok.com"
