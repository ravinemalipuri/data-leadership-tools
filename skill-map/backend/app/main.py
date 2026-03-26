from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.db import engine
from app.routes import users, snapshots, share, skills, perception

app = FastAPI(title="Skill Map API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router,     prefix="/users",     tags=["users"])
app.include_router(snapshots.router,                      tags=["snapshots"])
app.include_router(share.router,     prefix="/share",     tags=["share"])
app.include_router(skills.router,      prefix="/skills",      tags=["skills"])
app.include_router(perception.router,  prefix="/perception",  tags=["perception"])


@app.on_event("startup")
async def seed_default_user():
    """Ensure a default user (username='me') exists for single-user local mode."""
    async with engine.begin() as conn:
        await conn.execute(text(
            "INSERT INTO users (username, display_name) VALUES ('me', 'Me') "
            "ON CONFLICT (username) DO NOTHING"
        ))


@app.get("/health")
async def health():
    return {"status": "ok"}
