from sqlalchemy import Column, String, Integer, DateTime, Text, func
from sqlalchemy.dialects.postgresql import ENUM
from app.database import Base

RaidTypeEnum   = ENUM('R', 'A', 'I', 'D', 'DC',
                      name='raid_type',     schema='PM', create_type=True)
RaidStatusEnum = ENUM('Open', 'In Progress', 'Resolved', 'Closed',
                      'Blocked', 'Deferred', 'Deferred (Future)',
                      'Proposed', 'Accepted', 'Superseded', 'Deprecated',
                      name='raid_status',   schema='PM', create_type=True)
PriorityEnum   = ENUM('High', 'Medium', 'Low',
                      name='raid_priority', schema='PM', create_type=True)
UrgencyEnum    = ENUM('High', 'Medium', 'Low',
                      name='raid_urgency',  schema='PM', create_type=True)
RiskLevelEnum  = ENUM('Intolerable', 'Substantial', 'Moderate', 'Tolerable',
                      name='risk_level',   schema='PM', create_type=True)


class RaidEntry(Base):
    __tablename__ = 'raid_entries'
    __table_args__ = {'schema': 'PM'}

    id          = Column(String(20),  primary_key=True)
    type        = Column(RaidTypeEnum,   nullable=False)
    title       = Column(String(512),    nullable=False)
    description = Column(Text,           default='')
    status      = Column(RaidStatusEnum, nullable=False, default='Open')
    priority    = Column(PriorityEnum,   nullable=False, default='Medium')
    urgency     = Column(UrgencyEnum,    nullable=False, default='Medium')
    owner       = Column(String(256),    default='')
    mitigation  = Column(Text,           default='')
    due_date    = Column(String(20),     default='')
    project     = Column(String(256),    default='')

    # Risk-only fields
    impact      = Column(Integer,       nullable=True)
    likelihood  = Column(Integer,       nullable=True)
    risk_score  = Column(Integer,       nullable=True)
    risk_level  = Column(RiskLevelEnum, nullable=True)

    # Decision-only fields
    options_considered  = Column(Text,        nullable=True)
    decision_rationale  = Column(Text,        nullable=True)
    made_by             = Column(String(256), nullable=True)
    review_date         = Column(String(20),  nullable=True)

    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), server_default=func.now(),
                         onupdate=func.now())
