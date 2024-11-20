"""link user and wordlist tables

Revision ID: aba8a3714c27
Revises: c90edd808375
Create Date: 2024-11-20 16:11:43.443312

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "aba8a3714c27"
down_revision: Union[str, None] = "c90edd808375"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("wordlists") as batch_op:
        batch_op.add_column(sa.Column("user_id", sa.Integer(), nullable=False))
        batch_op.create_foreign_key(
            "fk_wordlist_user", "users", ["user_id"], ["id"], ondelete="CASCADE"
        )


def downgrade() -> None:
    with op.batch_alter_table("wordlists") as batch_op:
        batch_op.drop_constraint("fk_wordlist_user", type_="foreignkey")
        batch_op.drop_column("user_id")
