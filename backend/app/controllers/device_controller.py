from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.device import Device
from app.schemas.device_schema import DeviceOut

router = APIRouter(prefix="/devices", tags=["Devices"])


@router.get("/", response_model=list[DeviceOut])
def get_devices(db: Session = Depends(get_db)):
    return db.query(Device).all()
