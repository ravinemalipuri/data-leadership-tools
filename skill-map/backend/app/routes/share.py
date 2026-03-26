import os
import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.db import get_db
from app.models.snapshot import ShareTokenCreate, ShareTokenResponse, SnapshotResponse, SkillRating

router = APIRouter()

BASE_URL = os.environ.get("BASE_URL", "http://localhost:3001")


@router.post("", response_model=ShareTokenResponse)
async def create_share_token(payload: ShareTokenCreate, db: AsyncSession = Depends(get_db)):
    token = secrets.token_urlsafe(32)
    await db.execute(
        text(
            "INSERT INTO share_tokens (snapshot_id, token, label, expires_at) "
            "VALUES (:snapshot_id, :token, :label, :expires_at)"
        ),
        {"snapshot_id": payload.snapshot_id, "token": token, "label": payload.label, "expires_at": payload.expires_at},
    )
    await db.commit()
    return ShareTokenResponse(
        token=token,
        share_url=f"{BASE_URL}/share/{token}",
        expires_at=payload.expires_at,
    )


@router.get("/{token}", response_model=SnapshotResponse)
async def get_shared_snapshot(token: str, db: AsyncSession = Depends(get_db)):
    share = (await db.execute(
        text("SELECT snapshot_id, expires_at FROM share_tokens WHERE token = :token"),
        {"token": token},
    )).fetchone()
    if not share:
        raise HTTPException(status_code=404, detail="Share link not found")
    if share.expires_at and share.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="Share link has expired")

    snap = (await db.execute(
        text("SELECT id, label, created_at FROM snapshots WHERE id = :id"),
        {"id": share.snapshot_id},
    )).fetchone()

    rows = (await db.execute(
        text("SELECT skill_id, value FROM snapshot_skills WHERE snapshot_id = :id"),
        {"id": share.snapshot_id},
    )).fetchall()

    return SnapshotResponse(
        snapshot_id=snap.id,
        label=snap.label,
        created_at=snap.created_at,
        ratings=[SkillRating(skill_id=r.skill_id, value=float(r.value)) for r in rows],
    )
