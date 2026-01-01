from pydantic import BaseModel
from datetime import datetime

class AlarmCreate(BaseModel):
    device_id: str
    fence_id: int | None = None
    alarm_type: str
    severity: str
    description: str
    location: str | None = None
    status: str = "pending"

class AlarmUpdate(BaseModel):
    status: str | None = None
    description: str | None = None
    severity: str | None = None

class AlarmOut(AlarmCreate):
    id: int
    timestamp: datetime
    handled_at: datetime | None = None
    
    class Config:
        from_attributes=True
