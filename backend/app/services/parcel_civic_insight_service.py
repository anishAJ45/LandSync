"""
LandSync SIH26014 - Parcel Civic Insight Engine
Cross-layer intelligence detecting mismatches, gaps, and project impacts.
"""
from typing import Dict, Any, List
from datetime import datetime

def generate_civic_insights(
    parcel: Dict[str, Any],
    tax_record: Dict[str, Any],
    road_record: Dict[str, Any],
    water_record: Dict[str, Any],
    power_record: Dict[str, Any],
    sewer_record: Dict[str, Any],
    projects: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    insights: List[Dict[str, Any]] = []
    pid = parcel.get("parcel_id", "")
    owner = parcel.get("current_owner", "")
    land_use = parcel.get("land_use", "")

    # 1. Tax vs Ownership Mismatch
    if tax_record:
        tax_payer = tax_record.get("tax_payer_name", "")
        if tax_payer and owner and tax_payer.strip().lower() != owner.strip().lower():
            insights.append({
                "id": f"INS-TAX-OWN-{pid}",
                "parcel_id": pid,
                "insight_type": "TAX_OWNERSHIP_MISMATCH",
                "severity": "WARNING",
                "title": "Property Tax Payer & Revenue Owner Mismatch",
                "description": f"Municipal tax assessment is registered under '{tax_payer}' while Revenue Patta record lists '{owner}'.",
                "source": "Local Body Municipal Tax Ledger vs Revenue Patta",
                "confidence": 92,
                "last_updated": datetime.utcnow().isoformat(),
                "requires_human_review": True,
                "recommended_action": "Verify latest registered conveyance deed and execute computerized mutation."
            })

        # Overdue tax check
        if tax_record.get("payment_status") == "OVERDUE" or tax_record.get("arrears", 0) > 0:
            insights.append({
                "id": f"INS-TAX-DUE-{pid}",
                "parcel_id": pid,
                "insight_type": "SERVICE_DEFICIT",
                "severity": "WARNING",
                "title": f"Property Tax Arrears of ₹{tax_record.get('arrears', 0):,}",
                "description": f"Outstanding municipal property tax for assessment year {tax_record.get('assessment_year')}.",
                "source": "Municipal Treasury Directorate",
                "confidence": 98,
                "last_updated": datetime.utcnow().isoformat(),
                "requires_human_review": False,
                "recommended_action": "Settle municipal property tax to maintain good civic compliance rating."
            })

    # 2. Road Access Gap
    if road_record:
        dist = road_record.get("distance_to_road", 0)
        if dist > 50:
            insights.append({
                "id": f"INS-ROAD-GAP-{pid}",
                "parcel_id": pid,
                "insight_type": "ROAD_ACCESS_GAP",
                "severity": "WARNING",
                "title": "Limited Direct Public Road Access",
                "description": f"Parcel is situated {dist}m from nearest public thoroughfare without recorded municipal frontage.",
                "source": "State Highways & Panchayat GIS Road Network",
                "confidence": 88,
                "last_updated": datetime.utcnow().isoformat(),
                "requires_human_review": True,
                "recommended_action": "Check registered easement rights before sanctioning commercial building permissions."
            })

    # 3. Utility vs Building Gap
    if land_use in ["Residential", "Commercial"]:
        if water_record and water_record.get("connection_status") == "NOT_AVAILABLE":
            insights.append({
                "id": f"INS-UTIL-GAP-{pid}",
                "parcel_id": pid,
                "insight_type": "UTILITY_BUILDING_GAP",
                "severity": "INFO",
                "title": "Municipal Water Network Gap",
                "description": "Parcel is developed for human habitation but piped water supply connection is not active.",
                "source": "TWAD Board / Water Resources Division",
                "confidence": 90,
                "last_updated": datetime.utcnow().isoformat(),
                "requires_human_review": False,
                "recommended_action": "Submit citizen connection request under Jal Jeevan / Urban Water Mission."
            })

    # 4. Infrastructure Project Proximity
    for proj in projects:
        d = proj.get("distance_to_parcel_meters", 1000)
        if d <= 500:
            insights.append({
                "id": f"INS-PROJ-{proj.get('project_id')}-{pid}",
                "parcel_id": pid,
                "insight_type": "PROJECT_PROXIMITY",
                "severity": "POSITIVE",
                "title": f"High Growth Corridor: Near {proj.get('project_name')}",
                "description": f"Located within {d}m of {proj.get('project_type').replace('_', ' ').title()} with ₹{proj.get('investment_inr_cr')} Cr capital outlay.",
                "source": "Infrastructure & Project Development Directorate",
                "confidence": 95,
                "last_updated": datetime.utcnow().isoformat(),
                "requires_human_review": False,
                "recommended_action": "Monitor municipal zoning changes and capital value appreciation."
            })

    return insights
