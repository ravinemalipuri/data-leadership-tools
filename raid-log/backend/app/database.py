import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres@localhost/proj-tech-debt"
)

engine = create_async_engine(DATABASE_URL, echo=False)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def init_db():
    """Create ENUMs and tables in schema PM. Safe to run on existing databases."""
    from app.models.raid import (  # noqa: F401
        RaidEntry,
        RaidTypeEnum, RaidStatusEnum, PriorityEnum, UrgencyEnum, RiskLevelEnum,
    )

    async with engine.begin() as conn:
        # ── Migrate existing databases: add new enum values & columns ──────
        migrations = [
            # New RAID type
            "ALTER TYPE \"PM\".raid_type ADD VALUE IF NOT EXISTS 'DC'",
            # Decision statuses
            "ALTER TYPE \"PM\".raid_status ADD VALUE IF NOT EXISTS 'Proposed'",
            "ALTER TYPE \"PM\".raid_status ADD VALUE IF NOT EXISTS 'Accepted'",
            "ALTER TYPE \"PM\".raid_status ADD VALUE IF NOT EXISTS 'Superseded'",
            "ALTER TYPE \"PM\".raid_status ADD VALUE IF NOT EXISTS 'Deprecated'",
            # Decision-only columns
            'ALTER TABLE "PM".raid_entries ADD COLUMN IF NOT EXISTS options_considered TEXT',
            'ALTER TABLE "PM".raid_entries ADD COLUMN IF NOT EXISTS decision_rationale TEXT',
            'ALTER TABLE "PM".raid_entries ADD COLUMN IF NOT EXISTS made_by VARCHAR(256)',
            'ALTER TABLE "PM".raid_entries ADD COLUMN IF NOT EXISTS review_date VARCHAR(20)',
        ]
        for sql in migrations:
            try:
                await conn.execute(text(sql))
            except Exception:
                pass  # type/table doesn't exist yet — create_all handles it below

        # ── Create ENUMs if fresh database ─────────────────────────────────
        for enum_type in (RaidTypeEnum, RaidStatusEnum, PriorityEnum, UrgencyEnum, RiskLevelEnum):
            await conn.run_sync(lambda c, et=enum_type: et.create(c, checkfirst=True))

        # ── Create tables ──────────────────────────────────────────────────
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
