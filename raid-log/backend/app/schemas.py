from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

RaidType   = Literal['R', 'A', 'I', 'D']
RaidStatus = Literal['Open', 'In Progress', 'Resolved', 'Closed',
                     'Blocked', 'Deferred', 'Deferred (Future)']
Priority   = Literal['High', 'Medium', 'Low']
Urgency    = Literal['High', 'Medium', 'Low']
RiskLevel  = Literal['Intolerable', 'Substantial', 'Moderate', 'Tolerable']


class RaidEntryBase(BaseModel):
    type:        RaidType
    title:       str = Field(..., min_length=1, max_length=512)
    description: str = ''
    status:      RaidStatus = 'Open'
    priority:    Priority   = 'Medium'
    urgency:     Urgency    = 'Medium'
    owner:       str = ''
    mitigation:  str = ''
    due_date:    str = ''
    project:     str = ''
    impact:      Optional[int]      = None
    likelihood:  Optional[int]      = None
    risk_score:  Optional[int]      = None
    risk_level:  Optional[RiskLevel] = None


# Create: id is accepted but always overridden by backend (generates R1, A2…)
class RaidEntryCreate(RaidEntryBase):
    id: str = 'auto'


class RaidEntryUpdate(RaidEntryBase):
    pass


class RaidEntryOut(RaidEntryBase):
    id:         str
    created_at: datetime
    updated_at: datetime

    model_config = {'from_attributes': True}
