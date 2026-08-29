from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.application import (
    Application,
    ApplicationStatusHistory,
    OfficerNotes,
    ApplicationStatus,
    ApplicationPriority,
    ServiceType
)
from app.models.notification import Notification
from app.models.audit_log import AuditLog
from app.models.user import User, UserRole
from app.models.parcel import Parcel

SAMPLE_APPLICATIONS = [
    {
        "id": "LS-2026-000001",
        "parcel_id": "IN-TN-CHE-2026-0001",
        "service_type": "LAND RECORD VERIFICATION",
        "description": "Comprehensive title deed and computerized Patta record verification request prior to property inheritance registration.",
        "status": "APPROVED",
        "priority": "HIGH",
        "days_ago": 18,
        "completed_days_ago": 2,
        "notes": [
            {"note": "Title deed verified with SRO Tambaram computerized sub-registry index book. No pending encumbrances.", "type": "INTERNAL"},
            {"note": "All statutory record validations completed successfully. Patta extract certified.", "type": "CITIZEN_VISIBLE"}
        ],
        "history": [
            ("SUBMITTED", "Citizen", "Submitted online via LandSync citizen portal", 18),
            ("UNDER_REVIEW", "Vikram Rathore (Tahsildar)", "Assigned to desk officer for statutory record matching", 16),
            ("VERIFICATION_PENDING", "Vikram Rathore (Tahsildar)", "Dispatched for sub-registrar cross verification", 12),
            ("VERIFIED", "Vikram Rathore (Tahsildar)", "Verified against digital land ledger archive", 5),
            ("APPROVED", "Vikram Rathore (Tahsildar)", "Approved for Patta transfer. Certificate issued.", 2)
        ]
    },
    {
        "id": "LS-2026-000002",
        "parcel_id": "IN-TN-CHE-2026-0002",
        "service_type": "BOUNDARY DISCREPANCY REPORT",
        "description": "East-side cadastral survey line encroaches 0.12 acres onto road easement according to satellite polygon overlay.",
        "status": "UNDER_REVIEW",
        "priority": "CRITICAL",
        "days_ago": 4,
        "notes": [
            {"note": "GIS layer detected 0.12 acre variance against master town planning grid.", "type": "INTERNAL"},
            {"note": "Field surveyor scheduled for physical boundary demarcation on site.", "type": "ACTION_REQUIRED"}
        ],
        "history": [
            ("SUBMITTED", "Citizen", "Citizen flagged spatial deviation in LandSync GIS explorer", 4),
            ("UNDER_REVIEW", "Vikram Rathore (Tahsildar)", "High priority case opened for spatial survey reconciliation", 3)
        ]
    },
    {
        "id": "LS-2026-000003",
        "parcel_id": "IN-TN-CBE-2026-0003",
        "service_type": "AREA DISCREPANCY REVIEW",
        "description": "Revenue record reflects 4.50 acres whereas GIS polygon boundary calculation indicates 4.18 acres.",
        "status": "VERIFICATION_PENDING",
        "priority": "HIGH",
        "days_ago": 9,
        "notes": [
            {"note": "DGPS survey team requested to execute field coordinates re-triangulation.", "type": "INTERNAL"}
        ],
        "history": [
            ("SUBMITTED", "Citizen", "Application filed with scanned FMB sketch", 9),
            ("UNDER_REVIEW", "Vikram Rathore (Tahsildar)", "Desk verification identified discrepancy of 0.32 acres", 7),
            ("VERIFICATION_PENDING", "Vikram Rathore (Tahsildar)", "Forwarded to District Survey Officer for field survey", 4)
        ]
    },
    {
        "id": "LS-2026-000004",
        "parcel_id": "IN-TN-CBE-2026-0004",
        "service_type": "OWNERSHIP VERIFICATION",
        "description": "Request for fast-track verification of succession pedigree and joint legal heir patta record update.",
        "status": "MORE_INFORMATION_REQUIRED",
        "priority": "MEDIUM",
        "days_ago": 12,
        "notes": [
            {"note": "Legal heir certificate copy missing signature of Tahsildar Sulur.", "type": "ACTION_REQUIRED"},
            {"note": "Awaiting citizen re-submission of notarized genealogy affidavit.", "type": "INTERNAL"}
        ],
        "history": [
            ("SUBMITTED", "Citizen", "Joint application submitted with death certificate", 12),
            ("UNDER_REVIEW", "Vikram Rathore (Tahsildar)", "Preliminary scrutiny commenced", 10),
            ("MORE_INFORMATION_REQUIRED", "Vikram Rathore (Tahsildar)", "Please upload the authenticated Legal Heirship Certificate from Revenue Division.", 6)
        ]
    },
    {
        "id": "LS-2026-000005",
        "parcel_id": "IN-TN-MDU-2026-0005",
        "service_type": "DOCUMENT VERIFICATION",
        "description": "Cross-verification of registered sale deed doc No. 1984/2021 with Madurai South Sub-Registrar records.",
        "status": "VERIFIED",
        "priority": "MEDIUM",
        "days_ago": 14,
        "notes": [
            {"note": "Sub-registrar database queried. Encumbrance certificate matches registration entry exactly.", "type": "INTERNAL"}
        ],
        "history": [
            ("SUBMITTED", "Citizen", "Document uploaded for clearance", 14),
            ("UNDER_REVIEW", "Vikram Rathore (Tahsildar)", "Under scrutiny by documentation assistant", 11),
            ("VERIFICATION_PENDING", "Vikram Rathore (Tahsildar)", "Pending OCR certificate matching", 7),
            ("VERIFIED", "Vikram Rathore (Tahsildar)", "All 4 title deeds digitally authenticated", 2)
        ]
    },
    {
        "id": "LS-2026-000006",
        "parcel_id": "IN-TN-MDU-2026-0006",
        "service_type": "LAND RECORD CORRECTION REQUEST",
        "description": "Spelling mistake in owner's surname in computerized Chitta database compared to Aadhaar & PAN.",
        "status": "SUBMITTED",
        "priority": "LOW",
        "days_ago": 1,
        "notes": [],
        "history": [
            ("SUBMITTED", "Citizen", "Request created with Aadhaar and PAN attachments", 1)
        ]
    },
    {
        "id": "LS-2026-000007",
        "parcel_id": "IN-TN-SLM-2026-0007",
        "service_type": "PARCEL INFORMATION REQUEST",
        "description": "Official certified boundary coordinates and master plan land use classification confirmation.",
        "status": "APPROVED",
        "priority": "LOW",
        "days_ago": 20,
        "completed_days_ago": 5,
        "notes": [
            {"note": "Certified GIS parcel blueprint generated and stamped.", "type": "CITIZEN_VISIBLE"}
        ],
        "history": [
            ("SUBMITTED", "Citizen", "Request initiated", 20),
            ("UNDER_REVIEW", "Vikram Rathore (Tahsildar)", "Processing request", 15),
            ("VERIFIED", "Vikram Rathore (Tahsildar)", "Record confirmed", 8),
            ("APPROVED", "Vikram Rathore (Tahsildar)", "Information report issued", 5)
        ]
    },
    {
        "id": "LS-2026-000008",
        "parcel_id": "IN-TN-SLM-2026-0008",
        "service_type": "BOUNDARY DISCREPANCY REPORT",
        "description": "Dispute regarding adjoining channel reserve boundary and survey stone displacement.",
        "status": "REJECTED",
        "priority": "HIGH",
        "days_ago": 25,
        "completed_days_ago": 10,
        "notes": [
            {"note": "Field survey revealed no displacement of permanent state theodolite boundary markers.", "type": "INTERNAL"}
        ],
        "history": [
            ("SUBMITTED", "Citizen", "Complaint filed", 25),
            ("UNDER_REVIEW", "Vikram Rathore (Tahsildar)", "Surveyor assigned", 22),
            ("VERIFICATION_PENDING", "Vikram Rathore (Tahsildar)", "Field team on-site", 16),
            ("REJECTED", "Vikram Rathore (Tahsildar)", "Rejected: Permanent survey benchmarks align accurately with Master Cadastre.", 10)
        ]
    },
    {
        "id": "LS-2026-000009",
        "parcel_id": "IN-TN-TRZ-2026-0009",
        "service_type": "LAND RECORD VERIFICATION",
        "description": "Validation of agricultural patta title for national farm subsidy & Kisan credit scheme verification.",
        "status": "SUBMITTED",
        "priority": "MEDIUM",
        "days_ago": 2,
        "notes": [],
        "history": [
            ("SUBMITTED", "Citizen", "Application filed with bank loan reference", 2)
        ]
    },
    {
        "id": "LS-2026-000010",
        "parcel_id": "IN-TN-TRZ-2026-0010",
        "service_type": "OWNERSHIP VERIFICATION",
        "description": "Re-affirmation of title post partition deed among 3 co-owners for survey parcel 12/4.",
        "status": "UNDER_REVIEW",
        "priority": "MEDIUM",
        "days_ago": 5,
        "notes": [
            {"note": "Reviewing registered partition document 4410/2024.", "type": "INTERNAL"}
        ],
        "history": [
            ("SUBMITTED", "Citizen", "Submitted online", 5),
            ("UNDER_REVIEW", "Vikram Rathore (Tahsildar)", "Under scrutiny by sub-divisional clerk", 3)
        ]
    },
    {
        "id": "LS-2026-000011",
        "parcel_id": "IN-TN-TVL-2026-0011",
        "service_type": "DOCUMENT VERIFICATION",
        "description": "Mutation order certificate authenticity check for industrial development permit.",
        "status": "VERIFICATION_PENDING",
        "priority": "HIGH",
        "days_ago": 8,
        "notes": [],
        "history": [
            ("SUBMITTED", "Citizen", "Submitted application", 8),
            ("UNDER_REVIEW", "Vikram Rathore (Tahsildar)", "Initial verification", 6),
            ("VERIFICATION_PENDING", "Vikram Rathore (Tahsildar)", "Dispatched for revenue divisional clearance", 3)
        ]
    },
    {
        "id": "LS-2026-000012",
        "parcel_id": "IN-TN-TVL-2026-0012",
        "service_type": "AREA DISCREPANCY REVIEW",
        "description": "Recorded area 3.00 acres vs Computed GIS area 3.02 acres (0.6% minor variance within statutory tolerance).",
        "status": "VERIFIED",
        "priority": "LOW",
        "days_ago": 11,
        "notes": [
            {"note": "Area variance is +0.02 acres (0.66%), well within Tamil Nadu statutory cadastral tolerance limit of 1.5%.", "type": "INTERNAL"}
        ],
        "history": [
            ("SUBMITTED", "Citizen", "Review request submitted", 11),
            ("UNDER_REVIEW", "Vikram Rathore (Tahsildar)", "Scrutiny initiated", 8),
            ("VERIFIED", "Vikram Rathore (Tahsildar)", "Tolerance verification passed successfully", 3)
        ]
    },
    {
        "id": "LS-2026-000013",
        "parcel_id": "IN-TN-VEL-2026-0013",
        "service_type": "LAND RECORD CORRECTION REQUEST",
        "description": "Correction of father's name from 'K. Selvam' to 'K. Selvakumar' in electronic register.",
        "status": "APPROVED",
        "priority": "LOW",
        "days_ago": 15,
        "completed_days_ago": 3,
        "notes": [
            {"note": "Gazette notification verified. Digital Land Registry database record updated.", "type": "CITIZEN_VISIBLE"}
        ],
        "history": [
            ("SUBMITTED", "Citizen", "Request created", 15),
            ("UNDER_REVIEW", "Vikram Rathore (Tahsildar)", "Gazette copy checked", 10),
            ("APPROVED", "Vikram Rathore (Tahsildar)", "Name correction executed in central database", 3)
        ]
    },
    {
        "id": "LS-2026-000014",
        "parcel_id": "IN-TN-VEL-2026-0014",
        "service_type": "BOUNDARY DISCREPANCY REPORT",
        "description": "Encroachment concern on southern border near State Highway expansion zone.",
        "status": "UNDER_REVIEW",
        "priority": "CRITICAL",
        "days_ago": 3,
        "notes": [
            {"note": "National Highway Authority alignment map cross-referenced.", "type": "INTERNAL"}
        ],
        "history": [
            ("SUBMITTED", "Citizen", "Urgent notification filed", 3),
            ("UNDER_REVIEW", "Vikram Rathore (Tahsildar)", "High-level review underway with Highways Dept", 2)
        ]
    },
    {
        "id": "LS-2026-000015",
        "parcel_id": "IN-TN-ERD-2026-0015",
        "service_type": "PARCEL INFORMATION REQUEST",
        "description": "Certified true extract of 'A-Register' and Field Measurement Book (FMB) diagram.",
        "status": "CLOSED",
        "priority": "LOW",
        "days_ago": 30,
        "completed_days_ago": 14,
        "notes": [
            {"note": "Certified PDF digitally signed with Government of India e-Sign PKI.", "type": "CITIZEN_VISIBLE"}
        ],
        "history": [
            ("SUBMITTED", "Citizen", "Application filed", 30),
            ("UNDER_REVIEW", "Vikram Rathore (Tahsildar)", "Record retrieval", 26),
            ("APPROVED", "Vikram Rathore (Tahsildar)", "PDF signed & dispatched", 18),
            ("CLOSED", "System Automation", "Delivered to citizen vault. Case archived.", 14)
        ]
    }
]

def seed_applications(db: Session):
    """
    Seeds comprehensive application data, status histories, officer notes, notifications and audit logs into SQLite.
    """
    citizen = db.query(User).filter(User.role == UserRole.CITIZEN.value).first()
    officer = db.query(User).filter(User.role == UserRole.OFFICER.value).first()
    admin = db.query(User).filter(User.role == UserRole.ADMIN.value).first()

    if not citizen or not officer:
        print("[SEED] Warning: Demo users not found when seeding applications.")
        return

    now = datetime.utcnow()

    for item in SAMPLE_APPLICATIONS:
        existing = db.query(Application).filter(Application.application_id == item["id"]).first()
        if existing:
            continue

        created_time = now - timedelta(days=item["days_ago"])
        completed_time = (now - timedelta(days=item["completed_days_ago"])) if "completed_days_ago" in item else None

        app = Application(
            application_id=item["id"],
            parcel_id=item["parcel_id"],
            citizen_id=citizen.id,
            service_type=item["service_type"],
            description=item["description"],
            status=item["status"],
            priority=item["priority"],
            assigned_officer_id=officer.id,
            created_at=created_time,
            updated_at=completed_time or created_time,
            submitted_at=created_time,
            completed_at=completed_time
        )
        db.add(app)
        db.commit()

        # Seed status history
        for h_status, h_actor, h_remarks, h_days in item["history"]:
            h_time = now - timedelta(days=h_days)
            hist = ApplicationStatusHistory(
                application_id=item["id"],
                previous_status=None,
                new_status=h_status,
                changed_by=h_actor,
                remarks=h_remarks,
                created_at=h_time
            )
            db.add(hist)

        # Seed notes
        for note_data in item.get("notes", []):
            note = OfficerNotes(
                application_id=item["id"],
                officer_id=officer.id,
                note=note_data["note"],
                note_type=note_data["type"],
                created_at=now - timedelta(days=item["days_ago"] // 2)
            )
            db.add(note)

        # Seed audit log
        audit = AuditLog(
            user_id=citizen.id,
            action="APPLICATION_CREATED",
            entity_type="Application",
            entity_id=item["id"],
            details=f"Citizen registered {item['service_type']} for {item['parcel_id']}",
            ip_address="127.0.0.1",
            created_at=created_time
        )
        db.add(audit)

        # Seed notification
        notif = Notification(
            user_id=citizen.id,
            title=f"Application {item['id']} Status: {item['status']}",
            message=f"Your request for parcel {item['parcel_id']} is currently '{item['status']}'.",
            notification_type="SUCCESS" if item["status"] == "APPROVED" else "WARNING" if item["status"] in ["REJECTED", "MORE_INFORMATION_REQUIRED"] else "INFO",
            is_read=item["status"] in ["APPROVED", "CLOSED"],
            related_application_id=item["id"],
            created_at=created_time
        )
        db.add(notif)

    db.commit()
    print(f"[SEED] Successfully seeded {len(SAMPLE_APPLICATIONS)} workflow applications, histories, and notes.")
