from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import get_db
from app.models.idea import IdeaCreate, IdeaResponse, FlagUpdate
from typing import List

router = APIRouter()

@router.get("/", response_model=List[IdeaResponse])
async def list_ideas(db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("SELECT * FROM vw_idea_summary ORDER BY votes_up DESC"))
    return result.mappings().all()

@router.post("/", response_model=dict)
async def create_idea(idea: IdeaCreate, db: AsyncSession = Depends(get_db)):
    await db.execute(text("""
        INSERT INTO ideas (title, description, size, category, submitted_by, role, team)
        VALUES (:title, :description, :size, :category, :submitted_by, :role, :team)
    """), idea.model_dump())
    await db.commit()
    return {"status": "created"}

@router.patch("/{idea_id}/flag")
async def set_planning_flag(idea_id: int, body: FlagUpdate, db: AsyncSession = Depends(get_db)):
    if body.role != 'Leader' and not body.is_admin:
        raise HTTPException(status_code=403, detail="Only Leaders or admins can update the planning flag")
    result = await db.execute(
        text("SELECT id FROM ideas WHERE id = :id AND status = 'active'"), {"id": idea_id}
    )
    if not result.mappings().first():
        raise HTTPException(status_code=404, detail="Idea not found")
    await db.execute(
        text("UPDATE ideas SET planning_flag = :flag, updated_at = CURRENT_TIMESTAMP WHERE id = :id"),
        {"flag": body.flag, "id": idea_id}
    )
    await db.commit()
    return {"status": "updated", "planning_flag": body.flag}


@router.get("/{idea_id}", response_model=IdeaResponse)
async def get_idea(idea_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("SELECT * FROM vw_idea_summary WHERE id = :id"), {"id": idea_id}
    )
    row = result.mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Idea not found")
    return row
