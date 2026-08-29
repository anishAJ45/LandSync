from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

class ParcelGeometryResponse(BaseModel):
    id: int
    parcel_id: str
    geometry_type: str
    coordinates: Any
    geojson: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ParcelHistoryResponse(BaseModel):
    id: int
    parcel_id: str
    event_type: str
    description: str
    event_date: str
    source: str
    created_at: datetime

    class Config:
        from_attributes = True

class ParcelResponse(BaseModel):
    id: int
    parcel_id: str
    survey_number: str
    subdivision: Optional[str] = None
    district: str
    state: str
    village: str
    latitude: float
    longitude: float
    recorded_area: float
    gis_area: float
    area_unit: str
    land_use: str
    current_owner: str
    status: str
    created_at: datetime
    updated_at: datetime
    geometry: Optional[ParcelGeometryResponse] = None
    history: Optional[List[ParcelHistoryResponse]] = []

    class Config:
        from_attributes = True

class NeighborParcel(BaseModel):
    parcel_id: str
    survey_number: str
    owner: str
    land_use: str
    relationship: str  # "Adjacent" or "Nearby"
    distance_approx_m: Optional[float] = None

class OverlapDetail(BaseModel):
    has_overlap: bool
    overlapping_parcels: List[str]
    overlap_area_acres: float
    overlap_severity: str  # "NONE", "LOW", "MEDIUM", "HIGH"
    note: str

class ParcelAnalysisResponse(BaseModel):
    parcel_id: str
    survey_number: str
    village: str
    district: str
    state: str
    current_owner: str
    land_use: str
    status: str
    recorded_area: float
    gis_area: float
    area_unit: str
    area_difference: float
    percentage_difference: float
    boundary_status: str  # "MATCH", "MINOR DIFFERENCE", "MAJOR DIFFERENCE"
    neighbor_count: int
    neighbors: List[NeighborParcel]
    overlap_status: OverlapDetail
    disclaimer: str = "Prototype GIS analysis – not a legal boundary determination."

class GISStatisticsResponse(BaseModel):
    total_parcels: int
    residential_count: int
    agricultural_count: int
    commercial_count: int
    government_count: int
    area_mismatch_count: int
    overlap_count: int
    under_review_count: int
    active_count: int
    boundary_discrepancy_count: int

class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[Dict[str, Any]]
