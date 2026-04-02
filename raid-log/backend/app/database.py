import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from dotenv import load_dotenv

load_dotenv()

# Database: proj-tech-debt, schema: PM
# Override via DATABASE_URL environment variable
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
    """Create ENUMs and tables in schema PM if they don't exist."""
    from app.models.raid import (  # noqa: F401 — registers metadata
        RaidEntry,
        RaidTypeEnum, RaidStatusEnum, PriorityEnum, UrgencyEnum, RiskLevelEnum,
    )

    async with engine.begin() as conn:
        # Create each ENUM type in PM schema (safe if already exists)
        for enum_type in (RaidTypeEnum, RaidStatusEnum, PriorityEnum, UrgencyEnum, RiskLevelEnum):
            await conn.run_sync(lambda c, et=enum_type: et.create(c, checkfirst=True))

        # Create the table (schema PM was created manually via psql)
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
