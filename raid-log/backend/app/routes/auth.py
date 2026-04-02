from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from app.auth import authenticate, create_token, get_current_user

router = APIRouter()


class TokenOut(BaseModel):
    access_token: str
    token_type: str
    role: str
    display: str
    username: str


@router.post("/token", response_model=TokenOut)
async def login(form: OAuth2PasswordRequestForm = Depends()):
    user = authenticate(form.username, form.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    token = create_token({
        "sub": user["username"],
        "role": user["role"],
        "display": user["display"],
    })
    return TokenOut(
        access_token=token,
        token_type="bearer",
        role=user["role"],
        display=user["display"],
        username=user["username"],
    )


@router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    return user
