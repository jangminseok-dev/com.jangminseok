"""PGroonga 키워드 인덱스 — pg_trgm과 비교용"""
from alembic import op

revision = "0002"
down_revision = "0001"


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pgroonga WITH SCHEMA extensions")
    op.execute("CREATE INDEX ix_chunk_pgroonga ON knowledge_chunk USING pgroonga (text)")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_chunk_pgroonga")
