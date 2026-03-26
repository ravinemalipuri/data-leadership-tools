import os
import secrets
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.db import get_db
from app.models.perception import (
    DimensionResponse, SurveyCreate, SurveyResponse,
    ResponseCreate, ResponseRecord, DimensionRating,
    DimensionSummary, TokenCreate, TokenResponse,
)

router = APIRouter()
BASE_URL = os.environ.get("BASE_URL", "http://localhost:3001")


# ── Dimensions ───────────────────────────────────────────────────────────────

@router.get("/dimensions", response_model=list[DimensionResponse])
async def list_dimensions(db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(
        text("SELECT id, position, teasing_label, pleasing_label FROM perception_dimensions WHERE active ORDER BY position")
    )).fetchall()
    return [DimensionResponse(id=r.id, position=r.position, teasing_label=r.teasing_label, pleasing_label=r.pleasing_label) for r in rows]


# ── Surveys ──────────────────────────────────────────────────────────────────

@router.post("/surveys", response_model=SurveyResponse)
async def create_survey(payload: SurveyCreate, db: AsyncSession = Depends(get_db)):
    row = (await db.execute(
        text("INSERT INTO perception_surveys (label, anonymous) VALUES (:label, :anon) RETURNING id, label, anonymous, created_at"),
        {"label": payload.label, "anon": payload.anonymous},
    )).fetchone()
    await db.commit()
    return SurveyResponse(id=row.id, label=row.label, anonymous=row.anonymous, created_at=row.created_at)


@router.get("/surveys", response_model=list[SurveyResponse])
async def list_surveys(db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(
        text("SELECT id, label, anonymous, created_at FROM perception_surveys ORDER BY created_at DESC")
    )).fetchall()
    return [SurveyResponse(id=r.id, label=r.label, anonymous=r.anonymous, created_at=r.created_at) for r in rows]


@router.get("/surveys/{survey_id}", response_model=SurveyResponse)
async def get_survey(survey_id: int, db: AsyncSession = Depends(get_db)):
    row = (await db.execute(
        text("SELECT id, label, anonymous, created_at FROM perception_surveys WHERE id = :id"),
        {"id": survey_id},
    )).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Survey not found")
    return SurveyResponse(id=row.id, label=row.label, anonymous=row.anonymous, created_at=row.created_at)


@router.patch("/surveys/{survey_id}/anonymous")
async def toggle_anonymous(survey_id: int, anonymous: bool, db: AsyncSession = Depends(get_db)):
    await db.execute(
        text("UPDATE perception_surveys SET anonymous = :anon WHERE id = :id"),
        {"anon": anonymous, "id": survey_id},
    )
    await db.commit()
    return {"ok": True}


# ── Responses ────────────────────────────────────────────────────────────────

@router.post("/surveys/{survey_id}/responses")
async def submit_response(survey_id: int, payload: ResponseCreate, db: AsyncSession = Depends(get_db)):
    survey = (await db.execute(
        text("SELECT id FROM perception_surveys WHERE id = :id"), {"id": survey_id}
    )).fetchone()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")

    row = (await db.execute(
        text("""
            INSERT INTO perception_responses (survey_id, respondent_type, respondent_name, respondent_team)
            VALUES (:sid, :rtype, :rname, :rteam) RETURNING id
        """),
        {"sid": survey_id, "rtype": payload.respondent_type,
         "rname": payload.respondent_name, "rteam": payload.respondent_team},
    )).fetchone()
    response_id = row.id

    for r in payload.ratings:
        await db.execute(
            text("""
                INSERT INTO perception_ratings (response_id, dimension_id, value)
                VALUES (:rid, :did, :val)
                ON CONFLICT (response_id, dimension_id) DO UPDATE SET value = :val
            """),
            {"rid": response_id, "did": r.dimension_id, "val": r.value},
        )
    await db.commit()
    return {"response_id": response_id}


@router.get("/surveys/{survey_id}/responses", response_model=list[ResponseRecord])
async def list_responses(survey_id: int, admin: bool = False, db: AsyncSession = Depends(get_db)):
    """
    Returns all responses for a survey.
    - admin=true  → returns actual respondent names
    - admin=false → hides names when survey is set to anonymous
    """
    survey = (await db.execute(
        text("SELECT anonymous FROM perception_surveys WHERE id = :id"), {"id": survey_id}
    )).fetchone()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")

    hide_names = survey.anonymous and not admin

    rows = (await db.execute(
        text("""
            SELECT id, respondent_type, respondent_name, respondent_team, submitted_at
            FROM perception_responses WHERE survey_id = :sid ORDER BY submitted_at
        """),
        {"sid": survey_id},
    )).fetchall()

    result = []
    for r in rows:
        ratings_rows = (await db.execute(
            text("SELECT dimension_id, value FROM perception_ratings WHERE response_id = :rid"),
            {"rid": r.id},
        )).fetchall()
        ratings = [DimensionRating(dimension_id=rr.dimension_id, value=float(rr.value)) for rr in ratings_rows]

        # Hide name for XFN when anonymous mode is on
        name = None if (hide_names and r.respondent_type == 'xfn') else r.respondent_name

        result.append(ResponseRecord(
            id=r.id,
            respondent_type=r.respondent_type,
            respondent_name=name,
            respondent_team=r.respondent_team,
            submitted_at=r.submitted_at,
            ratings=ratings,
        ))
    return result


# ── Summary ──────────────────────────────────────────────────────────────────

@router.get("/surveys/{survey_id}/summary", response_model=list[DimensionSummary])
async def get_summary(survey_id: int, db: AsyncSession = Depends(get_db)):
    """XFN average per dimension for a survey."""
    rows = (await db.execute(
        text("""
            SELECT dimension_id, position, teasing_label, pleasing_label, avg_value, response_count
            FROM vw_perception_xfn_summary WHERE survey_id = :sid ORDER BY position
        """),
        {"sid": survey_id},
    )).fetchall()
    return [
        DimensionSummary(
            dimension_id=r.dimension_id, position=r.position,
            teasing_label=r.teasing_label, pleasing_label=r.pleasing_label,
            avg_value=float(r.avg_value), response_count=r.response_count,
        ) for r in rows
    ]


# ── Tokens (share links for XFN) ─────────────────────────────────────────────

@router.post("/tokens", response_model=TokenResponse)
async def create_token(payload: TokenCreate, db: AsyncSession = Depends(get_db)):
    token = secrets.token_urlsafe(32)
    await db.execute(
        text("INSERT INTO perception_tokens (survey_id, token, label) VALUES (:sid, :token, :label)"),
        {"sid": payload.survey_id, "token": token, "label": payload.label},
    )
    await db.commit()
    return TokenResponse(
        token=token,
        respond_url=f"{BASE_URL}/perception/respond/{token}",
        label=payload.label,
    )


@router.get("/tokens/{token}")
async def resolve_token(token: str, db: AsyncSession = Depends(get_db)):
    row = (await db.execute(
        text("""
            SELECT pt.survey_id, ps.label AS survey_label, ps.anonymous
            FROM perception_tokens pt
            JOIN perception_surveys ps ON ps.id = pt.survey_id
            WHERE pt.token = :token
        """),
        {"token": token},
    )).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Link not found")
    return {"survey_id": row.survey_id, "survey_label": row.survey_label, "anonymous": row.anonymous}
