from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.db import get_db
from app.models.snapshot import SnapshotCreate, SnapshotResponse, SkillRating

router = APIRouter()


@router.post("/snapshots", response_model=SnapshotResponse)
async def create_snapshot(payload: SnapshotCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("INSERT INTO snapshots (user_id, label) VALUES (:user_id, :label) RETURNING id, created_at"),
        {"user_id": payload.user_id, "label": payload.label},
    )
    row = result.fetchone()
    snapshot_id, created_at = row.id, row.created_at

    for rating in payload.ratings:
        await db.execute(
            text(
                "INSERT INTO snapshot_skills (snapshot_id, skill_id, value) "
                "VALUES (:sid, :skill_id, :value) "
                "ON CONFLICT (snapshot_id, skill_id) DO UPDATE SET value = :value"
            ),
            {"sid": snapshot_id, "skill_id": rating.skill_id, "value": rating.value},
        )

    await db.commit()
    return SnapshotResponse(
        snapshot_id=snapshot_id,
        label=payload.label,
        created_at=created_at,
        ratings=payload.ratings,
    )


@router.get("/users/{user_id}/snapshots")
async def list_snapshots(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("SELECT id, label, created_at FROM snapshots WHERE user_id = :uid ORDER BY created_at ASC"),
        {"uid": user_id},
    )
    return [{"snapshot_id": r.id, "label": r.label, "created_at": r.created_at} for r in result.fetchall()]


@router.get("/snapshots/{snapshot_id}", response_model=SnapshotResponse)
async def get_snapshot(snapshot_id: int, db: AsyncSession = Depends(get_db)):
    snap = (await db.execute(
        text("SELECT id, label, created_at FROM snapshots WHERE id = :id"),
        {"id": snapshot_id},
    )).fetchone()
    if not snap:
        raise HTTPException(status_code=404, detail="Snapshot not found")

    rows = (await db.execute(
        text("SELECT skill_id, value FROM snapshot_skills WHERE snapshot_id = :id"),
        {"id": snapshot_id},
    )).fetchall()

    return SnapshotResponse(
        snapshot_id=snap.id,
        label=snap.label,
        created_at=snap.created_at,
        ratings=[SkillRating(skill_id=r.skill_id, value=float(r.value)) for r in rows],
    )
