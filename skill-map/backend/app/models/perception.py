from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class DimensionResponse(BaseModel):
    id:             int
    position:       int
    teasing_label:  str
    pleasing_label: str


class SurveyCreate(BaseModel):
    label:     str
    anonymous: bool = True


class SurveyResponse(BaseModel):
    id:         int
    label:      str
    anonymous:  bool
    created_at: datetime


class DimensionRating(BaseModel):
    dimension_id: int
    value: float = Field(..., ge=0.0, le=1.0)


class ResponseCreate(BaseModel):
    respondent_type: str          # 'self' or 'xfn'
    respondent_name: Optional[str] = None
    respondent_team: Optional[str] = None
    ratings: List[DimensionRating]


class ResponseRecord(BaseModel):
    id:               int
    respondent_type:  str
    respondent_name:  Optional[str]   # None when anonymous view
    respondent_team:  Optional[str]
    submitted_at:     datetime
    ratings:          List[DimensionRating]


class DimensionSummary(BaseModel):
    dimension_id:   int
    position:       int
    teasing_label:  str
    pleasing_label: str
    avg_value:      float
    response_count: int


class TokenCreate(BaseModel):
    survey_id:  int
    label:      Optional[str] = None


class TokenResponse(BaseModel):
    token:      str
    respond_url: str
    label:      Optional[str]
