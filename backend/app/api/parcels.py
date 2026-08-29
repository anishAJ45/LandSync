import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.user import User
from app.api.auth import get_current_user
from app.models.parcel import Parcel, ParcelGeometry, ParcelHistory
from app.schemas.parcel import (
    ParcelResponse,
    ParcelGeometryResponse,
    ParcelHistoryResponse,
    ParcelAnalysisResponse,
    GISStatisticsResponse,
    GeoJSONFeatureCollection
)
from app.services.parcel_service import (
    get_all_parcels,
    get_parcel_by_id,
    search_parcels,
    get_parcels_geojson,
    get_parcel_analysis,
    get_gis_statistics
)

router = APIRouter(prefix="/api/parcels", tags=["Parcels & GIS Intelligence"])

@router.get("/stats", response_model=GISStatisticsResponse)
def get_stats(db: Session = Depends(get_db)):
    """
    Get aggregated GIS parcel statistics across land use, boundary discrepancies, and overlaps.
    """
    return get_gis_statistics(db)

@router.get("/geojson")
def get_geojson_collection(db: Session = Depends(get_db)):
    """
    Get complete GeoJSON FeatureCollection of all land parcel boundaries for GIS Map rendering.
    """
    return get_parcels_geojson(db)

@router.get("/search", response_model=List[ParcelResponse])
def search_parcels_endpoint(
    q: Optional[str] = Query(None, description="Search term across parcel_id, survey_number, owner, village"),
    village: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    land_use: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Search and filter land parcels by various attributes.
    """
    parcels = search_parcels(db, query=q, village=village, district=district, land_use=land_use, status=status)
    return parcels

@router.get("", response_model=List[ParcelResponse])
def list_parcels(db: Session = Depends(get_db)):
    """
    List all cadastral land parcels in the system.
    """
    return get_all_parcels(db)

@router.get("/{parcel_id}", response_model=ParcelResponse)
def get_parcel(parcel_id: str, db: Session = Depends(get_db)):
    """
    Get single parcel 360 foundation record by Parcel ID (e.g. TN-CBE-001-124-1).
    """
    parcel = get_parcel_by_id(db, parcel_id)
    if not parcel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Parcel with ID '{parcel_id}' not found."
        )
    return parcel

@router.get("/{parcel_id}/geometry")
def get_geometry(parcel_id: str, db: Session = Depends(get_db)):
    """
    Get GeoJSON polygon geometry for a specific parcel.
    """
    geom = db.query(ParcelGeometry).filter(ParcelGeometry.parcel_id == parcel_id).first()
    if not geom:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Geometry for parcel '{parcel_id}' not found."
        )
    return {
        "id": geom.id,
        "parcel_id": geom.parcel_id,
        "geometry_type": geom.geometry_type,
        "coordinates": json.loads(geom.coordinates_json),
        "geojson": json.loads(geom.geojson),
        "created_at": geom.created_at,
        "updated_at": geom.updated_at
    }

@router.get("/{parcel_id}/history", response_model=List[ParcelHistoryResponse])
def get_history(parcel_id: str, db: Session = Depends(get_db)):
    """
    Get chronological mutation, registration, and survey events for a parcel.
    """
    history = db.query(ParcelHistory).filter(ParcelHistory.parcel_id == parcel_id).order_by(ParcelHistory.event_date.desc()).all()
    return history

@router.get("/{parcel_id}/analysis", response_model=ParcelAnalysisResponse)
def get_analysis(parcel_id: str, db: Session = Depends(get_db)):
    """
    Get Shapely GIS analysis: area discrepancy (recorded vs GIS), overlap detection, and neighbouring parcels.
    """
    analysis = get_parcel_analysis(db, parcel_id)
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Parcel with ID '{parcel_id}' not found."
        )
    return analysis
