from typing import Optional
from datetime import datetime
from pydantic import BaseModel, validator

# Shared properties
class NotificationBase(BaseModel):
    message: str
    status: str = "pending"
    
    @validator('status')
    def validate_status(cls, v):
        allowed_statuses = ["due", "paid", "pending"]
        if v.lower() not in allowed_statuses:
            raise ValueError(f'Status must be one of {allowed_statuses}')
        return v.lower()

# Properties to receive via API on creation
class NotificationCreate(NotificationBase):
    user_id: int

# Properties to receive via API on update
class NotificationUpdate(BaseModel):
    status: str
    
    @validator('status')
    def validate_status(cls, v):
        allowed_statuses = ["due", "paid", "pending"]
        if v.lower() not in allowed_statuses:
            raise ValueError(f'Status must be one of {allowed_statuses}')
        return v.lower()

# Properties shared by models stored in DB
class NotificationInDBBase(NotificationBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        orm_mode = True

# Properties to return via API
class Notification(NotificationInDBBase):
    pass

# Properties stored in DB
class NotificationInDB(NotificationInDBBase):
    pass
