from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    username: str
    password: str
    full_name: str
    role: str
    department_id: Optional[int] = None

class UserOut(BaseModel):
    id: int
    username: str
    role: str
    
    class Config:
        from_attributes=True
