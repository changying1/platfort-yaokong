from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.admin_schema import UserCreate, UserOut
from app.services.admin_service import AdminService

router = APIRouter(prefix="/admin", tags=["Admin"])
service = AdminService()

@router.post("/users", response_model=UserOut)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    return service.create_user(db, user.username, user.role)

@router.get("/users/hierarchy/{user_id}")
def get_subordinates(user_id: int, db: Session = Depends(get_db)):
    return service.get_users_by_hierarchy(db, user_id)
