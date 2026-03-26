from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import get_db
from app.models.vote import VoteCreate

router = APIRouter()

@router.post("/")
async def cast_vote(vote: VoteCreate, db: AsyncSession = Depends(get_db)):
    # Upsert — user can change their vote
    await db.execute(text("""
        INSERT INTO votes (idea_id, voter_name, role, team, vote, comment)
        VALUES (:idea_id, :voter_name, :role, :team, :vote, :comment)
        ON CONFLICT (idea_id, voter_name)
        DO UPDATE SET vote = EXCLUDED.vote,
                      comment = EXCLUDED.comment,
                      updated_at = CURRENT_TIMESTAMP
    """), vote.model_dump())
    await db.commit()
    return {"status": "voted"}

@router.get("/{idea_id}")
async def get_votes(idea_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("SELECT role, team, vote, comment, updated_at FROM votes WHERE idea_id = :id"),
        {"id": idea_id}
    )
    return result.mappings().all()
