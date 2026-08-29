"""
LandSync SIH26014 - Property Tax Service
Connects parcel ULPIN with local body municipal property tax records.
"""
from typing import Dict, Any, Optional

def analyze_property_tax(tax_record: Optional[Dict[str, Any]], parcel_owner: str) -> Dict[str, Any]:
    if not tax_record:
        return {
            "has_tax_record": False,
            "status": "UNASSESSED",
            "mismatch_detected": False,
            "message": "No municipal property tax assessment on record."
        }

    tax_payer = tax_record.get("tax_payer_name", "")
    is_mismatch = bool(tax_payer and parcel_owner and tax_payer.strip().lower() != parcel_owner.strip().lower())

    return {
        "has_tax_record": True,
        "tax_record_id": tax_record.get("tax_record_id"),
        "assessment_year": tax_record.get("assessment_year"),
        "payment_status": tax_record.get("payment_status"),
        "amount_due": tax_record.get("amount_due", 0),
        "arrears": tax_record.get("arrears", 0),
        "is_overdue": tax_record.get("payment_status") == "OVERDUE" or tax_record.get("arrears", 0) > 0,
        "owner_mismatch": is_mismatch,
        "discrepancy_note": f"Tax record payer '{tax_payer}' does not match Revenue Patta owner '{parcel_owner}'." if is_mismatch else None
    }
