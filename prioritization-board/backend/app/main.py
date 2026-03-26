import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.routes import ideas, votes, admin, config
from app.database import init_db, IS_SQLITE
from app.utils import resource_path

app = FastAPI(
    title="Prioritization Board API",
    description="Team-driven data platform roadmap prioritization tool",
    version="0.1.0",
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


app.include_router(ideas.router,  prefix="/api/ideas",  tags=["ideas"])
app.include_router(votes.router,  prefix="/api/votes",  tags=["votes"])
app.include_router(admin.router,  prefix="/api/admin",  tags=["admin"])
app.include_router(config.router, prefix="/api/config", tags=["config"])


@app.get("/health")
def health():
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Desktop mode: serve the bundled React build as static files.
# In server/Docker mode this is handled by nginx.
# The mount must come AFTER all API routes so /api/* is not intercepted.
# ---------------------------------------------------------------------------
if IS_SQLITE:
    static_dir = resource_path("static")
    if os.path.isdir(static_dir):
        app.mount("/", StaticFiles(directory=static_dir, html=True), name="frontend")
