from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.db import get_db

router = APIRouter()


@router.get("")
async def list_skills(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("SELECT id, name, category FROM skills WHERE active = TRUE ORDER BY category, name")
    )
    return [{"id": r.id, "name": r.name, "category": r.category} for r in result.fetchall()]
