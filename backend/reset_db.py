from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os
import math

# Add backend directory to sys.path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.core.database import SQLALCHEMY_DATABASE_URL
from app.core.database import Base
from app.models.admin_user import User
from app.models.alarm_records import AlarmRecord
from app.models.device import Device
from app.models.fence import ElectronicFence
from app.models.group_call import GroupCallSession

def reset_database():
    # confirm = input("DANGER: This will delete ALL tables in the database. Type 'DELETE' to confirm: ")
    # if confirm != "DELETE":
    #     print("Operation cancelled.")
    #     return
    print("Auto-confirming database reset...")

    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("All tables dropped successfully.")
    
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    print("All tables created successfully.")

    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    try:
        devices = []
        # Center: Shanghai People's Square (GCJ02 is approx 31.2304, 121.4737)
        # We store GCJ-02 directly in the DB to align with AMap (Frontend) and Fence Service.
        
        base_lat = 31.2304
        base_lng = 121.4737
        
        print(f"Base GCJ-02: {base_lat}, {base_lng}")
        print("Initializing devices with GCJ-02 coordinates...")

        for i in range(1, 11):
            device_id = f"DEV-{i:04d}"
            
            # Place devices in a small circle around the base
            # Radius ~500m (0.005 degrees)
            angle = (i / 10) * 2 * math.pi
            
            # Use deterministic offsets
            lat_offset = 0.005 * math.cos(angle)
            lng_offset = 0.005 * math.sin(angle)
            
            # Special case: Device 1 is EXACTLY at the center
            if i == 1:
                lat_offset = 0
                lng_offset = 0
                
            final_lat = base_lat + lat_offset
            final_lng = base_lng + lng_offset
            
            print(f"  {device_id}: {final_lat:.6f}, {final_lng:.6f}")

            devices.append(
                Device(
                    id=device_id,
                    device_name=f"Device {i}",
                    device_type="HELMET_CAM",
                    ip_address=f"192.168.1.{100 + i}",
                    port=8000,
                    stream_url=f"rtsp://192.168.1.{100 + i}/stream",
                    is_online=True, # Set to True so they appear active
                    last_latitude=final_lat,
                    last_longitude=final_lng
                )
            )
        session.add_all(devices)
        session.commit()
        print("Seeded 10 devices.")
    finally:
        session.close()

if __name__ == "__main__":
    reset_database()