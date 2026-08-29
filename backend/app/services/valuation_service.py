"""
LandSync SIH26014 - Land Valuation Reference Service
"""
from typing import Dict, Any, Optional

def calculate_indicative_parcel_valuation(recorded_area_sqft: float, reference_rate: float) -> Dict[str, Any]:
    estimated_guideline_value = recorded_area_sqft * reference_rate
    min_est = estimated_guideline_value * 0.95
    max_est = estimated_guideline_value * 1.15

    return {
        "recorded_area_sqft": recorded_area_sqft,
        "reference_rate_per_sqft": reference_rate,
        "estimated_guideline_value_inr": round(estimated_guideline_value, 2),
        "indicative_value_range": {
            "min_inr": round(min_est, 2),
            "max_inr": round(max_est, 2)
        },
        "disclaimer": "Valuation references are indicative prototype data and do not represent official property valuation."
    }
