"""knowledge_chunk.slide_number → section_number — 슬라이드에서 소개 페이지 섹션으로 바뀐 뒤 이름을 맞춘다"""
from alembic import op

revision = "0003"
down_revision = "0002"


def upgrade() -> None:
    op.execute("ALTER TABLE knowledge_chunk RENAME COLUMN slide_number TO section_number")


def downgrade() -> None:
    op.execute("ALTER TABLE knowledge_chunk RENAME COLUMN section_number TO slide_number")
