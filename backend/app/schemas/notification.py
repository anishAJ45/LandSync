from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class NotificationBase(BaseModel):
    title: str
    message: str
    notification_type: Optional[str] = "INFO"
    related_application_id: Optional[str] = None

class NotificationCreate(NotificationBase):
    user_id: int

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    notification_type: str
    is_read: bool
    related_application_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class UnreadCountResponse(BaseModel):
    unread_count: int
