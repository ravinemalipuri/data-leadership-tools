from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class SizeEnum(str, Enum):
    S  = "S"
    M  = "M"
    L  = "L"
    XL = "XL"

class IdeaCreate(BaseModel):
    title:       str
    description: str
    size:        SizeEnum
    category:    Optional[str] = None
    submitted_by: str
    role:        str
    team:        str

class IdeaResponse(BaseModel):
    id:                int
    title:             str
    description:       str
    size:              str
    category:          Optional[str]
    submitted_by_role: str
    submitted_by_team: str
    status:            str
    created_at:        datetime
    planning_flag:     bool = False
    total_votes:       int
    votes_up:          int
    votes_down:        int
    dev_votes_up:      int
    mgr_votes_up:      int
    ldr_votes_up:      int


class FlagUpdate(BaseModel):
    flag:         bool
    performed_by: str
    role:         str
    is_admin:     bool = False
