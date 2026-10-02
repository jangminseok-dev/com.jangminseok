"""question_log — 챗봇 질문과 답변, 30일 보관(core/question_log.py가 지운다)"""
from alembic import op

revision = "0005"
down_revision = "0004"


def upgrade() -> None:
    op.execute("""
        CREATE TABLE question_log (
          id serial PRIMARY KEY, ip_hash varchar(64) NOT NULL, question text NOT NULL, answer text NOT NULL,
          refused boolean NOT NULL, created_at timestamptz NOT NULL DEFAULT now())""")
    op.execute("CREATE INDEX ix_question_log_created_at ON question_log (created_at)")


def downgrade() -> None:
    op.execute("DROP TABLE question_log")
