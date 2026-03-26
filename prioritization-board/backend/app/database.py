import os
import aiosqlite
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.utils import resource_path, get_data_dir

# ---------------------------------------------------------------------------
# Database URL — defaults to SQLite (desktop mode).
# Override with DATABASE_URL env var to use PostgreSQL (server/Docker mode).
# ---------------------------------------------------------------------------
_default_db = "sqlite+aiosqlite:///" + os.path.join(get_data_dir(), "board.db")
DATABASE_URL = os.getenv("DATABASE_URL", _default_db)

IS_SQLITE = DATABASE_URL.startswith("sqlite")

engine = create_async_engine(DATABASE_URL, echo=False)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def init_db():
    if IS_SQLITE:
        # Run the SQLite-specific schema using aiosqlite's executescript
        # which handles multi-statement SQL files reliably.
        schema_path = resource_path("db/schema_sqlite.sql")
        db_path = DATABASE_URL.replace("sqlite+aiosqlite:///", "")
        async with aiosqlite.connect(db_path) as db:
            with open(schema_path) as f:
                await db.executescript(f.read())
    else:
        # PostgreSQL: tables and views are managed via db/schema.sql applied
        # externally (Docker init script or manual migration).
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
