from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.user import User
from app.services.auth_service import require_role

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/citizen")
def get_citizen_dashboard_data(
    current_user: User = Depends(require_role(["citizen", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Get citizen dashboard summary metrics and sample land record data for Phase 1.
    """
    return {
        "user": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "role": current_user.role
        },
        "stats": {
            "my_parcels": 3,
            "pending_requests": 1,
            "verified_records": 2,
            "unread_notifications": 4
        },
        "recent_parcels": [
            {
                "parcel_id": "IN-TN-CHE-2026-0042",
                "survey_no": "142/3B",
                "location": "Tambaram, Chennai District",
                "area": "2,400 sq.ft (5.5 Cents)",
                "type": "Residential Plot",
                "status": "Verified",
                "last_updated": "2026-02-15"
            },
            {
                "parcel_id": "IN-TN-CBE-2025-1089",
                "survey_no": "88/1A",
                "location": "Sulur, Coimbatore District",
                "area": "1.2 Acres",
                "type": "Agricultural Land",
                "status": "Verified",
                "last_updated": "2025-11-20"
            },
            {
                "parcel_id": "IN-TN-MDU-2026-0015",
                "survey_no": "209/7C",
                "location": "Melur, Madurai District",
                "area": "3,600 sq.ft",
                "type": "Commercial / Mixed",
                "status": "Under Mutation Review",
                "last_updated": "2026-02-24"
            }
        ],
        "recent_activity": [
            {
                "id": 1,
                "action": "Mutation Application Submitted",
                "target": "Parcel 209/7C (Melur)",
                "timestamp": "2026-02-24 11:30 AM",
                "status": "In Progress"
            },
            {
                "id": 2,
                "action": "Digitally Signed Encumbrance Certificate Downloaded",
                "target": "Parcel 142/3B (Tambaram)",
                "timestamp": "2026-02-18 04:15 PM",
                "status": "Completed"
            },
            {
                "id": 3,
                "action": "Aadhaar e-KYC Linked to Land Registry",
                "target": "Owner Profile",
                "timestamp": "2026-01-10 10:00 AM",
                "status": "Verified"
            }
        ]
    }

@router.get("/officer")
def get_officer_dashboard_data(
    current_user: User = Depends(require_role(["officer", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Get officer dashboard verification queue and workload metrics for Phase 1.
    """
    return {
        "user": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "role": current_user.role
        },
        "stats": {
            "pending_cases": 18,
            "high_priority_cases": 4,
            "completed_today": 9,
            "ai_flagged_cases": 3
        },
        "verification_queue": [
            {
                "case_id": "CASE-2026-884",
                "parcel_id": "IN-TN-CHE-2026-0091",
                "applicant_name": "S. Sundararaman",
                "request_type": "Title Deed Boundary Verification",
                "submitted_date": "2026-02-26",
                "priority": "High",
                "ai_risk_score": "Moderate (62%)",
                "status": "Awaiting Field Inspection"
            },
            {
                "case_id": "CASE-2026-881",
                "parcel_id": "IN-TN-MDU-2026-0015",
                "applicant_name": "Ramesh Kumar",
                "request_type": "Mutation & Inheritance Transfer",
                "submitted_date": "2026-02-24",
                "priority": "Medium",
                "ai_risk_score": "Low (12%)",
                "status": "Document Verification Passed"
            },
            {
                "case_id": "CASE-2026-879",
                "parcel_id": "IN-TN-KAN-2026-0312",
                "applicant_name": "M/s GreenHorizon Infrastructure",
                "request_type": "Agricultural to Non-Agricultural Conversion",
                "submitted_date": "2026-02-22",
                "priority": "High",
                "ai_risk_score": "Flagged (84% Overlap)",
                "status": "Under Legal Dispute Check"
            },
            {
                "case_id": "CASE-2026-875",
                "parcel_id": "IN-TN-CBE-2026-0048",
                "applicant_name": "K. Meenakshi",
                "request_type": "Patta Sub-division Request",
                "submitted_date": "2026-02-20",
                "priority": "Low",
                "ai_risk_score": "Clean (4%)",
                "status": "Ready for Approval"
            }
        ]
    }

@router.get("/admin")
def get_admin_dashboard_data(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """
    Get system-wide metrics, user statistics, and service health for Administrators.
    """
    total_users = db.query(User).count()
    citizens_count = db.query(User).filter(User.role == "citizen").count()
    officers_count = db.query(User).filter(User.role == "officer").count()
    admins_count = db.query(User).filter(User.role == "admin").count()

    return {
        "user": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "role": current_user.role
        },
        "stats": {
            "total_users": total_users,
            "citizens": citizens_count,
            "officers": officers_count,
            "admins": admins_count,
            "system_status": "Operational (Healthy)",
            "api_status": "100% Uptime"
        },
        "department_integrations": [
            {
                "department": "Survey & Land Records Directorate (Tamil Nadu / Central)",
                "protocol": "REST API v2 / WFS",
                "status": "Connected (Latency: 42ms)",
                "sync_rate": "99.8%"
            },
            {
                "department": "Registration Department (IGRS / CERSAI)",
                "protocol": "Secure Webhooks",
                "status": "Connected (Latency: 56ms)",
                "sync_rate": "100.0%"
            },
            {
                "department": "Revenue & Tahsildar Portal",
                "protocol": "JSON-RPC / OAuth2",
                "status": "Connected (Latency: 38ms)",
                "sync_rate": "99.4%"
            },
            {
                "department": "Judicial Court Case Information System (NJDG)",
                "protocol": "e-Courts API",
                "status": "Connected (Latency: 110ms)",
                "sync_rate": "98.2%"
            }
        ],
        "audit_logs": [
            {
                "id": "AUD-9912",
                "actor": "admin@landsync.demo",
                "action": "SYSTEM_POLICY_AUDIT",
                "detail": "Verified database integrity checksums and role permissions",
                "timestamp": "2026-02-26 08:30:12"
            },
            {
                "id": "AUD-9911",
                "actor": "officer@landsync.demo",
                "action": "VERIFICATION_STATUS_UPDATE",
                "detail": "Approved Patta transfer for parcel IN-TN-CHE-2026-0042",
                "timestamp": "2026-02-26 07:15:45"
            },
            {
                "id": "AUD-9910",
                "actor": "citizen@landsync.demo",
                "action": "AUTH_LOGIN",
                "detail": "Citizen authenticated via JWT session",
                "timestamp": "2026-02-25 19:40:02"
            }
        ]
    }
