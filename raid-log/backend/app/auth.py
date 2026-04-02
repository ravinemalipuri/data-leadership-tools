"""
Simple JWT auth — three hardcoded roles, no user DB needed for PoC.
"""
import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

SECRET_KEY = os.getenv("SECRET_KEY", "malvin-raid-secret-2024-change-in-prod")
ALGORITHM  = "HS256"
TOKEN_EXPIRE_HOURS = 12

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ── Built-in accounts (username → {hashed_pw, role, display_name}) ────────────
# Roles: leadership (read-only) | contributor (create + update) | tpm (full)
USERS = {
    "ravi": {
        "display": "Ravine Malipuri",
        "role": "tpm",
        "email": "ravi.nemalipuri@gmail.com",
        "hashed_pw": pwd_ctx.hash("Malvin@2024"),
    },
    "tpm": {
        "display": "TPM Admin",
        "role": "tpm",
        "hashed_pw": pwd_ctx.hash("tpm2024"),
    },
    "engineer": {
        "display": "Data Engineer",
        "role": "contributor",
        "hashed_pw": pwd_ctx.hash("eng2024"),
    },
    "leadership": {
        "display": "Leadership View",
        "role": "leadership",
        "hashed_pw": pwd_ctx.hash("lead2024"),
    },
}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)


def authenticate(username: str, password: str) -> Optional[dict]:
    user = USERS.get(username)
    if not user or not verify_password(password, user["hashed_pw"]):
        return None
    return {"username": username, **user}


def create_token(data: dict) -> str:
    payload = {
        **data,
        "exp": datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRE_HOURS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    return decode_token(token)


async def require_contributor(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") not in ("contributor", "tpm"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    return user


async def require_tpm(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "tpm":
        raise HTTPException(status_code=403, detail="TPM role required")
    return user
