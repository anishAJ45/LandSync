import json
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.parcel import Parcel, ParcelGeometry, ParcelHistory
from app.services.gis_service import (
    calculate_area_discrepancy,
    detect_parcel_overlaps,
    find_neighboring_parcels
)

def get_all_parcels(db: Session) -> List[Parcel]:
    return db.query(Parcel).all()

def get_parcel_by_id(db: Session, parcel_id: str) -> Optional[Parcel]:
    return db.query(Parcel).filter(Parcel.parcel_id == parcel_id).first()

def search_parcels(
    db: Session,
    query: Optional[str] = None,
    village: Optional[str] = None,
    district: Optional[str] = None,
    land_use: Optional[str] = None,
    status: Optional[str] = None
) -> List[Parcel]:
    q = db.query(Parcel)
    
    if query:
        term = f"%{query.strip()}%"
        q = q.filter(
            (Parcel.parcel_id.ilike(term)) |
            (Parcel.survey_number.ilike(term)) |
            (Parcel.current_owner.ilike(term)) |
            (Parcel.village.ilike(term))
        )
    if village:
        q = q.filter(Parcel.village.ilike(f"%{village.strip()}%"))
    if district:
        q = q.filter(Parcel.district.ilike(f"%{district.strip()}%"))
    if land_use:
        q = q.filter(Parcel.land_use.ilike(f"%{land_use.strip()}%"))
    if status:
        q = q.filter(Parcel.status.ilike(f"%{status.strip()}%"))

    return q.all()

def get_parcels_geojson(db: Session) -> Dict[str, Any]:
    parcels = db.query(Parcel).all()
    features = []

    for p in parcels:
        geom_record = db.query(ParcelGeometry).filter(ParcelGeometry.parcel_id == p.parcel_id).first()
        geometry = json.loads(geom_record.geojson) if geom_record and geom_record.geojson else None
        
        if not geometry:
            continue

        features.append({
            "type": "Feature",
            "properties": {
                "id": p.id,
                "parcel_id": p.parcel_id,
                "survey_number": p.survey_number,
                "subdivision": p.subdivision,
                "owner": p.current_owner,
                "village": p.village,
                "district": p.district,
                "state": p.state,
                "latitude": p.latitude,
                "longitude": p.longitude,
                "recorded_area": p.recorded_area,
                "gis_area": p.gis_area,
                "area_unit": p.area_unit,
                "land_use": p.land_use,
                "status": p.status
            },
            "geometry": geometry
        })

    return {
        "type": "FeatureCollection",
        "name": "LandSync_Parcels_DPI",
        "features": features
    }

def get_parcel_analysis(db: Session, parcel_id: str) -> Optional[Dict[str, Any]]:
    parcel = db.query(Parcel).filter(Parcel.parcel_id == parcel_id).first()
    if not parcel:
        return None

    # Calculate area discrepancy
    diff, pct, boundary_status = calculate_area_discrepancy(parcel.recorded_area, parcel.gis_area)

    # Fetch all geometries for overlap and neighbor calculation
    all_parcels = db.query(Parcel).all()
    all_geoms_records = db.query(ParcelGeometry).all()
    
    geom_map = {}
    for g in all_geoms_records:
        try:
            geom_map[g.parcel_id] = json.loads(g.geojson)
        except Exception:
            pass

    target_geojson = geom_map.get(parcel.parcel_id)
    
    # Prepare list for overlap detection
    all_parcels_info = []
    for p in all_parcels:
        if p.parcel_id in geom_map:
            all_parcels_info.append({
                "parcel_id": p.parcel_id,
                "survey_number": p.survey_number,
                "owner": p.current_owner,
                "land_use": p.land_use,
                "geojson": geom_map[p.parcel_id]
            })

    overlap_status = {
        "has_overlap": False,
        "overlapping_parcels": [],
        "overlap_area_acres": 0.0,
        "overlap_severity": "NONE",
        "note": "Prototype GIS analysis – not a legal boundary determination."
    }
    neighbors = []

    if target_geojson:
        overlap_status = detect_parcel_overlaps(parcel.parcel_id, target_geojson, all_parcels_info)
        neighbors = find_neighboring_parcels(parcel.parcel_id, target_geojson, all_parcels_info)

    return {
        "parcel_id": parcel.parcel_id,
        "survey_number": parcel.survey_number,
        "village": parcel.village,
        "district": parcel.district,
        "state": parcel.state,
        "current_owner": parcel.current_owner,
        "land_use": parcel.land_use,
        "status": parcel.status,
        "recorded_area": parcel.recorded_area,
        "gis_area": parcel.gis_area,
        "area_unit": parcel.area_unit,
        "area_difference": diff,
        "percentage_difference": pct,
        "boundary_status": boundary_status,
        "neighbor_count": len(neighbors),
        "neighbors": neighbors,
        "overlap_status": overlap_status,
        "disclaimer": "Prototype visualization using fictional/sample GIS data. For demonstration purposes only."
    }

def get_gis_statistics(db: Session) -> Dict[str, Any]:
    parcels = db.query(Parcel).all()
    total = len(parcels)
    res_count = sum(1 for p in parcels if p.land_use.lower() == "residential")
    agri_count = sum(1 for p in parcels if p.land_use.lower() == "agricultural")
    comm_count = sum(1 for p in parcels if p.land_use.lower() == "commercial")
    gov_count = sum(1 for p in parcels if p.land_use.lower() == "government")

    mismatch_count = 0
    for p in parcels:
        _, pct, _ = calculate_area_discrepancy(p.recorded_area, p.gis_area)
        if pct > 2.0:
            mismatch_count += 1

    overlap_count = sum(1 for p in parcels if "overlap" in p.status.lower() or p.parcel_id in ["TN-CBE-001-124-3", "TN-CBE-001-125-1"])
    under_review = sum(1 for p in parcels if p.status.lower() == "under review")
    active_count = sum(1 for p in parcels if p.status.lower() == "active")
    boundary_discrepancy = sum(1 for p in parcels if "discrepancy" in p.status.lower())

    return {
        "total_parcels": total,
        "residential_count": res_count,
        "agricultural_count": agri_count,
        "commercial_count": comm_count,
        "government_count": gov_count,
        "area_mismatch_count": mismatch_count,
        "overlap_count": overlap_count,
        "under_review_count": under_review,
        "active_count": active_count,
        "boundary_discrepancy_count": boundary_discrepancy
    }
