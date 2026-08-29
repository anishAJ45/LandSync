"""
LandSync SIH26014 - Phase 9 Civic, Fiscal & Infrastructure Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class PropertyTaxResponse(BaseModel):
    id: int
    tax_record_id: str
    parcel_id: str
    ulpin: str
    property_reference: str
    local_body: str
    assessment_year: str
    property_type: str
    assessed_value: float
    annual_tax: float
    amount_paid: float
    amount_due: float
    payment_status: str
    last_payment_date: Optional[datetime] = None
    due_date: datetime
    arrears: float
    tax_payer_name: Optional[str] = None
    updated_at: datetime

    class Config:
        from_attributes = True

class LandValuationResponse(BaseModel):
    id: int
    valuation_id: str
    parcel_id: str
    ulpin: str
    location_reference: str
    land_category: str
    reference_rate: float
    unit: str
    min_rate: float
    max_rate: float
    effective_date: datetime
    source_authority: str
    confidence_level: str
    notes: Optional[str] = None
    disclaimer: str = "Valuation references are indicative prototype data and do not represent official property valuation."
    created_at: datetime

    class Config:
        from_attributes = True

class WaterConnectionResponse(BaseModel):
    id: int
    connection_id: str
    parcel_id: str
    ulpin: str
    provider: str
    connection_status: str
    connection_type: str
    meter_status: str
    supply_status: str
    pipeline_distance_meters: float
    application_reference: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ElectricityConnectionResponse(BaseModel):
    id: int
    connection_id: str
    parcel_id: str
    ulpin: str
    provider: str
    connection_status: str
    connection_type: str
    meter_status: str
    service_status: str
    sanctioned_load_kw: float
    transformer_distance_meters: float
    application_reference: Optional[str] = None
    updated_at: datetime

    class Config:
        from_attributes = True

class RoadAccessResponse(BaseModel):
    id: int
    road_access_id: str
    parcel_id: str
    ulpin: str
    road_name: str
    road_type: str
    road_width: float
    distance_to_road: float
    access_status: str
    authority: str
    right_of_way_clear: bool
    updated_at: datetime

    class Config:
        from_attributes = True

class InfrastructureProjectResponse(BaseModel):
    id: int
    project_id: str
    project_name: str
    project_type: str
    authority: str
    status: str
    start_date: datetime
    expected_completion: datetime
    description: str
    affected_area: str
    investment_inr_cr: float
    influence_radius_meters: float
    created_at: datetime

    class Config:
        from_attributes = True

class CivicServiceScoreResponse(BaseModel):
    parcel_id: str
    overall_score: int
    score_category: str
    water_score: int
    electricity_score: int
    road_access_score: int
    drainage_score: int
    sewerage_score: int
    digital_score: int
    explainable_summary: str
    disclaimer: str = "Informational civic indicator, not an official government rating."

class CivicServiceRequestCreate(BaseModel):
    parcel_id: str
    service_category: str
    description: str
    priority: Optional[str] = "MEDIUM"
