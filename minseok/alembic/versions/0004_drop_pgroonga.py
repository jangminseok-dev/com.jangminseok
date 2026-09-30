"""PGroonga 제거 — pg_trgm과의 비교를 마쳐 쓰지 않는다(결과는 data/eval.json의 backends)"""
from alembic import op

revision = "0004"
down_revision = "0003"


def upgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_chunk_pgroonga")
    op.execute("DROP EXTENSION IF EXISTS pgroonga")


def downgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pgroonga WITH SCHEMA extensions")
    op.execute("CREATE INDEX ix_chunk_pgroonga ON knowledge_chunk USING pgroonga (text)")
