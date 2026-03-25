from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import ideas, votes, admin
from app.database import init_db

app = FastAPI(
    title="Prioritization Board API",
    description="Team-driven data platform roadmap prioritization tool",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await init_db()

app.include_router(ideas.router, prefix="/api/ideas", tags=["ideas"])
app.include_router(votes.router, prefix="/api/votes", tags=["votes"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

@app.get("/health")
def health():
    return {"status": "ok"}
