from pydantic import BaseModel
from typing import Optional
from enum import Enum

class VoteEnum(str, Enum):
    up   = "up"
    down = "down"

class VoteCreate(BaseModel):
    idea_id:    int
    voter_name: str
    role:       str
    team:       str
    vote:       VoteEnum
    comment:    Optional[str] = None
