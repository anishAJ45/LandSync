from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel
from app.models.application import ApplicationStatus, ApplicationPriority, ServiceType

class ApplicationBase(BaseModel):
    parcel_id: str
    service_type: str
    description: str
    priority: Optional[str] = "MEDIUM"

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationStatusUpdate(BaseModel):
    status: str
    remarks: Optional[str] = None

class ApplicationAssign(BaseModel):
    officer_id: int

class ApplicationResubmit(BaseModel):
    additional_notes: str

class OfficerNoteCreate(BaseModel):
    note: str
    note_type: Optional[str] = "INTERNAL"

class OfficerNoteResponse(BaseModel):
    id: int
    application_id: str
    officer_id: int
    officer_name: Optional[str] = None
    note: str
    note_type: str
    created_at: datetime

    class Config:
        from_attributes = True

class StatusHistoryResponse(BaseModel):
    id: int
    application_id: str
    previous_status: Optional[str] = None
    new_status: str
    changed_by: str
    remarks: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TimelineEvent(BaseModel):
    id: str
    event_type: str
    title: str
    description: str
    actor: str
    timestamp: datetime
    badge_variant: str

class ApplicationResponse(BaseModel):
    id: int
    application_id: str
    parcel_id: str
    citizen_id: int
    citizen_name: Optional[str] = None
    citizen_email: Optional[str] = None
    service_type: str
    description: str
    status: str
    priority: str
    assigned_officer_id: Optional[int] = None
    assigned_officer_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    submitted_at: datetime
    completed_at: Optional[datetime] = None
    
    # Parcel summary snippet
    survey_number: Optional[str] = None
    village: Optional[str] = None
    district: Optional[str] = None
    current_owner: Optional[str] = None
    recorded_area: Optional[float] = None
    land_use: Optional[str] = None

    class Config:
        from_attributes = True

class ApplicationDetailResponse(ApplicationResponse):
    status_history: List[StatusHistoryResponse] = []
    notes: List[OfficerNoteResponse] = []
    parcel_details: Optional[Any] = None

class OfficerQueueStats(BaseModel):
    pending_cases: int
    under_review: int
    verification_pending: int
    completed_today: int
    high_priority: int
