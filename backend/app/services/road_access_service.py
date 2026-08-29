"""
LandSync SIH26014 - Road Access Analysis Service
"""
from typing import Dict, Any, List

def analyze_road_access(road_record: Dict[str, Any]) -> Dict[str, Any]:
    distance = road_record.get("distance_to_road", 0.0)
    road_type = road_record.get("road_type", "LOCAL_ROAD")
    width = road_record.get("road_width", 12.0)
    has_encroachment = road_record.get("encroachment_detected", False)
    
    restrictions: List[str] = []
    if distance > 100:
        access_cat = "NO_DIRECT_ACCESS"
        restrictions.append(f"Parcel is {distance}m away from the nearest public right of way.")
        score = 25
    elif distance > 25:
        access_cat = "LIMITED_ACCESS"
        restrictions.append(f"Narrow pathway / {distance}m access easement required.")
        score = 55
    elif has_encroachment:
        access_cat = "REQUIRES_REVIEW"
        restrictions.append("Frontage right-of-way overlap / encroachment detected.")
        score = 45
    else:
        access_cat = "GOOD_ACCESS"
        score = 95

    return {
        "parcel_id": road_record.get("parcel_id"),
        "nearest_road": road_record.get("road_name", "Municipal Link Road"),
        "road_distance_meters": distance,
        "road_type": road_type,
        "road_width_meters": width,
        "access_category": access_cat,
        "access_availability": f"Direct frontage on {width}m wide {road_type.replace('_', ' ').title()}" if distance <= 25 else f"{distance}m distance to nearest {road_type.replace('_', ' ').title()}",
        "possible_access_restrictions": restrictions,
        "access_score": score,
        "recommendation": "Maintain clear frontage setbacks in accordance with municipal development control rules." if access_cat == "GOOD_ACCESS" else "Field verification and access easement regularization recommended."
    }
