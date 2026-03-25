from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class SkillRating(BaseModel):
    skill_id: int
    value:    float = Field(..., ge=0.0, le=1.0, description="Position on axis: 0 = center, 1 = tip")

class SnapshotCreate(BaseModel):
    user_id:  int
    label:    Optional[str] = None          # e.g. "Q1 2025"
    ratings:  List[SkillRating]

class SnapshotResponse(BaseModel):
    snapshot_id:    int
    label:          Optional[str]
    created_at:     datetime
    ratings:        List[SkillRating]

class ShareTokenCreate(BaseModel):
    snapshot_id: int
    label:       Optional[str] = None
    expires_at:  Optional[datetime] = None

class ShareTokenResponse(BaseModel):
    token:      str
    share_url:  str
    expires_at: Optional[datetime]
