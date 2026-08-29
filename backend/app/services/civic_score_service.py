"""
LandSync SIH26014 - Civic Service Score Engine
Calculates 0-100 informational civic readiness indicator.
"""
from typing import Dict, Any, List

def calculate_civic_service_score(
    water_status: str,
    electricity_status: str,
    road_access_category: str,
    drainage_status: str,
    sewerage_status: str,
    digital_status: str
) -> Dict[str, Any]:
    # Water score (0-20)
    w_score = 20 if water_status == "CONNECTED" else 14 if water_status == "AVAILABLE" else 6 if water_status == "PENDING" else 0
    # Power score (0-20)
    p_score = 20 if electricity_status == "CONNECTED" else 15 if electricity_status == "AVAILABLE" else 8 if electricity_status == "PENDING" else 0
    # Road score (0-20)
    r_score = 20 if road_access_category == "GOOD_ACCESS" else 12 if road_access_category == "LIMITED_ACCESS" else 5 if road_access_category == "REQUIRES_REVIEW" else 0
    # Drainage score (0-15)
    d_score = 15 if drainage_status == "CONNECTED" or drainage_status == "AVAILABLE" else 8 if drainage_status == "UNDER_DEVELOPMENT" else 0
    # Sewerage score (0-15)
    s_score = 15 if sewerage_status == "CONNECTED" else 9 if sewerage_status == "AVAILABLE_NOT_CONNECTED" else 4 if sewerage_status == "PENDING" or sewerage_status == "IN_PROGRESS" else 0
    # Digital score (0-10)
    t_score = 10 if "HIGH_SPEED" in digital_status or digital_status == "CONNECTED" else 7 if digital_status == "AVAILABLE_ON_DEMAND" else 3

    total = w_score + p_score + r_score + d_score + s_score + t_score

    if total >= 76:
        category = "WELL_CONNECTED"
    elif total >= 51:
        category = "GOOD"
    elif total >= 26:
        category = "BASIC"
    else:
        category = "LIMITED"

    return {
        "overall_score": total,
        "score_category": category,
        "water_score": w_score,
        "electricity_score": p_score,
        "road_access_score": r_score,
        "drainage_score": d_score,
        "sewerage_score": s_score,
        "digital_score": t_score,
        "explainable_summary": f"Parcel has an overall Civic Service Score of {total}/100 ({category}). Powered by verified municipal infrastructure feeds.",
        "disclaimer": "Informational civic indicator, not an official government rating."
    }
