from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.alarm_records import AlarmRecord
from app.models.device import Device
from app.models.fence import ElectronicFence
from app.schemas.alarm_schema import AlarmCreate, AlarmUpdate
from app.utils.logger import get_logger
from datetime import datetime

logger = get_logger("AlarmService")

class AlarmService:
    def create_alarm(self, db: Session, alarm: AlarmCreate):
        logger.warning(f"ALARM TRIGGERED: Device {alarm.device_id}, Type {alarm.alarm_type}")
        device = db.query(Device).filter(Device.id == alarm.device_id).first()
        if not device:
            raise HTTPException(status_code=400, detail=f"Device not found: {alarm.device_id}")
        if alarm.fence_id is not None:
            fence = db.query(ElectronicFence).filter(ElectronicFence.id == alarm.fence_id).first()
            if not fence:
                raise HTTPException(status_code=400, detail=f"Fence not found: {alarm.fence_id}")
            # Prepend fence name to location coordinates
            alarm.location = f"{fence.name} {alarm.location}"

        new_alarm = AlarmRecord(
            device_id=alarm.device_id,
            fence_id=alarm.fence_id,
            alarm_type=alarm.alarm_type,
            severity=alarm.severity,
            description=alarm.description,
            location=alarm.location,
            status=alarm.status
        )
        db.add(new_alarm)
        db.commit()
        db.refresh(new_alarm)
        return new_alarm

    def get_alarms(self, db: Session, skip: int = 0, limit: int = 100):
        return db.query(AlarmRecord).order_by(AlarmRecord.timestamp.desc()).offset(skip).limit(limit).all()

    def update_alarm(self, db: Session, alarm_id: int, update_data: AlarmUpdate):
        db_alarm = db.query(AlarmRecord).filter(AlarmRecord.id == alarm_id).first()
        if not db_alarm:
            return None
        
        if update_data.status:
            db_alarm.status = update_data.status
            if update_data.status == "resolved":
                db_alarm.handled_at = datetime.now()
        
        if update_data.description:
            db_alarm.description = update_data.description
            
        if update_data.severity:
            db_alarm.severity = update_data.severity
            
        db.commit()
        db.refresh(db_alarm)
        return db_alarm

    def delete_alarm(self, db: Session, alarm_id: int):
        db_alarm = db.query(AlarmRecord).filter(AlarmRecord.id == alarm_id).first()
        if db_alarm:
            db.delete(db_alarm)
            db.commit()
            return True
        return False
