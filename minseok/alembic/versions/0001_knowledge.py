"""knowledge_chunk, rate_limit_hit, 확장(vector, pg_trgm)"""
from alembic import op

revision = "0001"
down_revision = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions")
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions")
    op.execute("""
        CREATE TABLE knowledge_chunk (
          id serial PRIMARY KEY, slug varchar(40) NOT NULL, slide_number int NOT NULL,
          title varchar(200) NOT NULL, text text NOT NULL, url varchar(300) NOT NULL,
          content_hash varchar(64) NOT NULL UNIQUE, embedding extensions.vector(768) NOT NULL)""")
    op.execute("CREATE INDEX ix_chunk_slug ON knowledge_chunk (slug)")
    op.execute("CREATE INDEX ix_chunk_vec ON knowledge_chunk USING hnsw (embedding extensions.vector_cosine_ops)")
    op.execute("CREATE INDEX ix_chunk_trgm ON knowledge_chunk USING gin (text extensions.gin_trgm_ops)")
    op.execute("""
        CREATE TABLE rate_limit_hit (
          id serial PRIMARY KEY, ip_hash varchar(64) NOT NULL, "window" varchar(16) NOT NULL,
          count int NOT NULL DEFAULT 0)""")
    op.execute('CREATE UNIQUE INDEX uq_rate_window ON rate_limit_hit (ip_hash, "window")')


def downgrade() -> None:
    op.execute("DROP TABLE rate_limit_hit")
    op.execute("DROP TABLE knowledge_chunk")
