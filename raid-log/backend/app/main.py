from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import raids
from app.routes import auth as auth_router
from app.database import init_db

app = FastAPI(
    title="RAID Log API",
    description="Corporate Risk & Project RAID Log — Risk, Assumptions, Issues, Dependencies, Decisions",
    version="1.0.0",
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


app.include_router(auth_router.router, prefix="/api/auth", tags=["auth"])
app.include_router(raids.router,       prefix="/api/raids", tags=["raids"])


@app.get("/health")
def health():
    return {"status": "ok"}
