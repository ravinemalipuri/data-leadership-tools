"""
Run this once to create the PM schema objects in proj-tech-debt.
Usage: python init_db.py
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://postgres@localhost/proj-tech-debt")

from app.database import init_db, engine  # noqa: E402


async def main():
    print("Connecting to proj-tech-debt …")
    try:
        await init_db()
        print("✓  Schema PM — ENUMs and table 'raid_entries' created successfully.")
    except Exception as exc:
        print(f"✗  Error: {exc}")
        sys.exit(1)
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
