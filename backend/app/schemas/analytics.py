from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class StatusCountItem(BaseModel):
    status: str
    count: int
    percentage: float
    color: str

class ServiceTypeCountItem(BaseModel):
    service_type: str
    count: int
    percentage: float

class TrendItem(BaseModel):
    month: str
    submitted: int
    verified: int
    approved: int
    rejected: int

class PriorityDistributionItem(BaseModel):
    priority: str
    count: int
    color: str

class AnalyticsOverview(BaseModel):
    total_applications: int
    submitted: int
    under_review: int
    verification_pending: int
    more_info_required: int
    verified: int
    approved: int
    rejected: int
    closed: int
    high_priority_cases: int
    average_processing_days: float
    total_users: int
    total_parcels: int
    system_health: str
