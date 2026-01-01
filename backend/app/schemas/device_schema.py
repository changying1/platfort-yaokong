from pydantic import BaseModel

class DeviceBase(BaseModel):
    id: str
    device_name: str
    ip_address: str

class DeviceCreate(DeviceBase):
    pass

class DeviceOut(DeviceBase):
    is_online: bool
    stream_url: str = None
    last_latitude: float | None = None
    last_longitude: float | None = None
    
    class Config:
        from_attributes=True
