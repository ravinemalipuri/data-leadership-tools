from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import get_db
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class AdminAction(BaseModel):
    performed_by: str
    reason: Optional[str] = None


@router.post("/archive/{idea_id}")
async def archive_idea(idea_id: int, action: AdminAction, db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("SELECT id FROM ideas WHERE id = :id"), {"id": idea_id})
    if not result.mappings().first():
        raise HTTPException(status_code=404, detail="Idea not found")

    await db.execute(
        text("UPDATE ideas SET status = 'archived', updated_at = CURRENT_TIMESTAMP WHERE id = :id"),
        {"id": idea_id}
    )
    await db.execute(text("""
        INSERT INTO admin_log (action, idea_id, performed_by, reason)
        VALUES ('archive', :idea_id, :performed_by, :reason)
    """), {"idea_id": idea_id, "performed_by": action.performed_by, "reason": action.reason})
    await db.commit()
    return {"status": "archived"}


@router.post("/restore/{idea_id}")
async def restore_idea(idea_id: int, action: AdminAction, db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("SELECT id FROM ideas WHERE id = :id"), {"id": idea_id})
    if not result.mappings().first():
        raise HTTPException(status_code=404, detail="Idea not found")

    await db.execute(
        text("UPDATE ideas SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = :id"),
        {"id": idea_id}
    )
    await db.execute(text("""
        INSERT INTO admin_log (action, idea_id, performed_by, reason)
        VALUES ('restore', :idea_id, :performed_by, :reason)
    """), {"idea_id": idea_id, "performed_by": action.performed_by, "reason": action.reason})
    await db.commit()
    return {"status": "restored"}


@router.get("/archived")
async def list_archived(db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("""
        SELECT
            i.id, i.title, i.description, i.size, i.category,
            i.role AS submitted_by_role, i.team AS submitted_by_team,
            i.status, i.created_at,
            COALESCE(COUNT(v.id), 0)                                          AS total_votes,
            COALESCE(SUM(CASE WHEN v.vote = 'up'   THEN 1 ELSE 0 END), 0)   AS votes_up,
            COALESCE(SUM(CASE WHEN v.vote = 'down' THEN 1 ELSE 0 END), 0)   AS votes_down,
            COALESCE(SUM(CASE WHEN v.vote = 'up' AND v.role = 'Developer' THEN 1 ELSE 0 END), 0) AS dev_votes_up,
            COALESCE(SUM(CASE WHEN v.vote = 'up' AND v.role = 'Manager'   THEN 1 ELSE 0 END), 0) AS mgr_votes_up,
            COALESCE(SUM(CASE WHEN v.vote = 'up' AND v.role = 'Leader'    THEN 1 ELSE 0 END), 0) AS ldr_votes_up
        FROM ideas i
        LEFT JOIN votes v ON v.idea_id = i.id
        WHERE i.status = 'archived'
        GROUP BY i.id, i.title, i.description, i.size, i.category,
                 i.role, i.team, i.status, i.created_at
        ORDER BY i.updated_at DESC
    """))
    return result.mappings().all()


@router.get("/log")
async def get_admin_log(db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("""
        SELECT al.id, al.action, al.idea_id, i.title AS idea_title,
               al.performed_by, al.reason, al.performed_at
        FROM admin_log al
        JOIN ideas i ON i.id = al.idea_id
        ORDER BY al.performed_at DESC
        LIMIT 100
    """))
    return result.mappings().all()
