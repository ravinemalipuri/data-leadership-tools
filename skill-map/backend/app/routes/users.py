from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.db import get_db

router = APIRouter()


@router.get("/me")
async def get_me(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("SELECT id, username, display_name FROM users WHERE username = 'me'")
    )
    row = result.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Default user not found")
    return {"id": row.id, "username": row.username, "display_name": row.display_name}
