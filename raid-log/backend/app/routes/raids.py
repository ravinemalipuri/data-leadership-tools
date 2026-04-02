import re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.models.raid import RaidEntry
from app.schemas import RaidEntryCreate, RaidEntryUpdate, RaidEntryOut
from typing import Optional

router = APIRouter()


async def _next_id(db: AsyncSession, raid_type: str) -> str:
    """Generate the next sequential ID for a given type: R1, R2 … A1, A2 … etc."""
    result = await db.execute(
        select(RaidEntry.id).where(RaidEntry.type == raid_type)
    )
    existing = result.scalars().all()
    nums = [
        int(m.group(1))
        for eid in existing
        if (m := re.match(rf'^{raid_type}(\d+)$', eid))
    ]
    return f"{raid_type}{max(nums, default=0) + 1}"


@router.get('/', response_model=list[RaidEntryOut])
async def list_raids(
    type:     Optional[str] = None,
    status:   Optional[str] = None,
    priority: Optional[str] = None,
    urgency:  Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    q = select(RaidEntry).order_by(RaidEntry.type, RaidEntry.id)
    if type     and type     != 'All': q = q.where(RaidEntry.type     == type)
    if status   and status   != 'All': q = q.where(RaidEntry.status   == status)
    if priority and priority != 'All': q = q.where(RaidEntry.priority == priority)
    if urgency  and urgency  != 'All': q = q.where(RaidEntry.urgency  == urgency)
    result = await db.execute(q)
    return result.scalars().all()


@router.post('/', response_model=RaidEntryOut, status_code=201)
async def create_raid(data: RaidEntryCreate, db: AsyncSession = Depends(get_db)):
    # Always generate sequential type-prefixed ID — ignore any client-supplied id
    entry_id = await _next_id(db, data.type)
    fields = data.model_dump()
    fields.pop('id', None)   # discard client value if schema still sends one
    entry = RaidEntry(**fields, id=entry_id)
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry


@router.get('/{raid_id}', response_model=RaidEntryOut)
async def get_raid(raid_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(RaidEntry).where(RaidEntry.id == raid_id))
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail='RAID entry not found')
    return entry


@router.put('/{raid_id}', response_model=RaidEntryOut)
async def update_raid(raid_id: str, data: RaidEntryUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(RaidEntry).where(RaidEntry.id == raid_id))
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail='RAID entry not found')
    for field, value in data.model_dump().items():
        setattr(entry, field, value)
    await db.commit()
    await db.refresh(entry)
    return entry


@router.delete('/{raid_id}', status_code=204)
async def delete_raid(raid_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(RaidEntry).where(RaidEntry.id == raid_id))
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail='RAID entry not found')
    await db.delete(entry)
    await db.commit()
