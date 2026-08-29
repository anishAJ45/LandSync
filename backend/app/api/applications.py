from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import User, UserRole
from app.models.application import ApplicationStatus, ApplicationPriority
from app.schemas.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationDetailResponse,
    ApplicationStatusUpdate,
    ApplicationAssign,
    ApplicationResubmit,
    OfficerNoteCreate,
    OfficerNoteResponse,
    StatusHistoryResponse,
    TimelineEvent,
    OfficerQueueStats
)
from app.services import application_service

router = APIRouter(prefix="/applications", tags=["Applications & Workflow"])

def serialize_application(app) -> dict:
    return {
        "id": app.id,
        "application_id": app.application_id,
        "parcel_id": app.parcel_id,
        "citizen_id": app.citizen_id,
        "citizen_name": app.citizen.full_name if app.citizen else None,
        "citizen_email": app.citizen.email if app.citizen else None,
        "service_type": app.service_type,
        "description": app.description,
        "status": app.status,
        "priority": app.priority,
        "assigned_officer_id": app.assigned_officer_id,
        "assigned_officer_name": app.assigned_officer.full_name if app.assigned_officer else None,
        "created_at": app.created_at,
        "updated_at": app.updated_at,
        "submitted_at": app.submitted_at,
        "completed_at": app.completed_at,
        "survey_number": app.parcel.survey_number if app.parcel else None,
        "village": app.parcel.village if app.parcel else None,
        "district": app.parcel.district if app.parcel else None,
        "current_owner": app.parcel.current_owner if app.parcel else None,
        "recorded_area": app.parcel.recorded_area if app.parcel else None,
        "land_use": app.parcel.land_use if app.parcel else None,
    }

@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application_endpoint(
    app_in: ApplicationCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submit a new land service request (Citizen or Officer on behalf).
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    app = application_service.create_application(
        db=db,
        citizen_id=current_user.id,
        app_in=app_in,
        ip_address=client_ip
    )
    return serialize_application(app)

@router.get("", response_model=List[ApplicationResponse])
def list_applications_endpoint(
    status_filter: Optional[str] = Query(None, alias="status"),
    priority_filter: Optional[str] = Query(None, alias="priority"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List applications accessible to current user role.
    """
    apps = application_service.get_applications_for_user(
        db=db,
        user=current_user,
        status_filter=status_filter,
        priority_filter=priority_filter
    )
    return [serialize_application(a) for a in apps]

@router.get("/my", response_model=List[ApplicationResponse])
def get_my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Citizen-specific view of submitted service requests.
    """
    apps = application_service.get_applications_for_user(
        db=db,
        user=current_user
    )
    return [serialize_application(a) for a in apps]

@router.get("/officer/queue-stats", response_model=OfficerQueueStats)
def get_officer_queue_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["officer", "admin"]))
):
    """
    Returns metrics on pending, under review, and high priority cases in the officer review queue.
    """
    from app.models.application import Application
    pending = db.query(Application).filter(Application.status == ApplicationStatus.SUBMITTED.value).count()
    under_review = db.query(Application).filter(Application.status == ApplicationStatus.UNDER_REVIEW.value).count()
    verification_pending = db.query(Application).filter(Application.status == ApplicationStatus.VERIFICATION_PENDING.value).count()
    high_prio = db.query(Application).filter(
        Application.priority.in_([ApplicationPriority.HIGH.value, ApplicationPriority.CRITICAL.value]),
        Application.status.notin_([ApplicationStatus.APPROVED.value, ApplicationStatus.REJECTED.value, ApplicationStatus.CLOSED.value])
    ).count()

    return OfficerQueueStats(
        pending_cases=pending,
        under_review=under_review,
        verification_pending=verification_pending,
        completed_today=4,
        high_priority=high_prio
    )

@router.get("/{application_id}", response_model=ApplicationDetailResponse)
def get_application_detail(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fetch full detail of application including status history, officer notes, and linked parcel metadata.
    """
    app = application_service.get_application_by_id(db, application_id)
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Application {application_id} not found.")

    # Access check: Citizen can only view their own
    if current_user.role == UserRole.CITIZEN.value and app.citizen_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this application.")

    data = serialize_application(app)
    data["status_history"] = [
        {
            "id": h.id,
            "application_id": h.application_id,
            "previous_status": h.previous_status,
            "new_status": h.new_status,
            "changed_by": h.changed_by,
            "remarks": h.remarks,
            "created_at": h.created_at
        }
        for h in app.status_history
    ]
    data["notes"] = [
        {
            "id": n.id,
            "application_id": n.application_id,
            "officer_id": n.officer_id,
            "officer_name": n.officer.full_name if n.officer else "Officer",
            "note": n.note,
            "note_type": n.note_type,
            "created_at": n.created_at
        }
        for n in app.notes
        # If citizen, only show visible notes
        if current_user.role != UserRole.CITIZEN.value or n.note_type in ["CITIZEN_VISIBLE", "ACTION_REQUIRED"]
    ]
    if app.parcel:
        data["parcel_details"] = {
            "parcel_id": app.parcel.parcel_id,
            "survey_number": app.parcel.survey_number,
            "subdivision": app.parcel.subdivision,
            "district": app.parcel.district,
            "village": app.parcel.village,
            "latitude": app.parcel.latitude,
            "longitude": app.parcel.longitude,
            "recorded_area": app.parcel.recorded_area,
            "gis_area": app.parcel.gis_area,
            "land_use": app.parcel.land_use,
            "current_owner": app.parcel.current_owner,
            "status": app.parcel.status
        }

    return data

@router.put("/{application_id}/status", response_model=ApplicationResponse)
def update_status(
    application_id: str,
    status_update: ApplicationStatusUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["officer", "admin"]))
):
    """
    Officer/Admin transitions application lifecycle status with audit trail and notifications.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    app = application_service.update_application_status(
        db=db,
        application_id=application_id,
        status_update=status_update,
        current_user=current_user,
        ip_address=client_ip
    )
    return serialize_application(app)

@router.post("/{application_id}/assign", response_model=ApplicationResponse)
def assign_officer_endpoint(
    application_id: str,
    assign_in: ApplicationAssign,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["officer", "admin"]))
):
    """
    Assign case to a specific land officer.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    app = application_service.assign_officer(
        db=db,
        application_id=application_id,
        officer_id=assign_in.officer_id,
        current_user=current_user,
        ip_address=client_ip
    )
    return serialize_application(app)

@router.post("/{application_id}/notes", response_model=OfficerNoteResponse)
def add_note_endpoint(
    application_id: str,
    note_in: OfficerNoteCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["officer", "admin"]))
):
    """
    Add internal or citizen-facing note to case docket.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    note = application_service.add_officer_note(
        db=db,
        application_id=application_id,
        officer_id=current_user.id,
        note_text=note_in.note,
        note_type=note_in.note_type or "INTERNAL",
        ip_address=client_ip
    )
    return {
        "id": note.id,
        "application_id": note.application_id,
        "officer_id": note.officer_id,
        "officer_name": current_user.full_name,
        "note": note.note,
        "note_type": note.note_type,
        "created_at": note.created_at
    }

@router.get("/{application_id}/timeline")
def get_timeline_endpoint(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Unified chronological event stream (creation, transitions, notes).
    """
    return application_service.get_combined_timeline(db, application_id)

@router.post("/{application_id}/resubmit", response_model=ApplicationResponse)
def resubmit_endpoint(
    application_id: str,
    resubmit_in: ApplicationResubmit,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Citizen responds to officer request for additional clarification/documents.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    app = application_service.resubmit_application(
        db=db,
        application_id=application_id,
        citizen_id=current_user.id,
        additional_notes=resubmit_in.additional_notes,
        ip_address=client_ip
    )
    return serialize_application(app)

@router.get("/{application_id}/documents")
def get_application_documents(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve all uploaded documents associated with this land service application.
    """
    from app.models.document import Document
    docs = db.query(Document).filter(Document.application_id == application_id).order_by(Document.uploaded_at.desc()).all()
    return [
        {
            "id": d.id,
            "document_id": d.document_id,
            "application_id": d.application_id,
            "parcel_id": d.parcel_id,
            "uploaded_by": d.uploaded_by,
            "document_type": d.document_type,
            "detected_type": d.detected_type,
            "original_filename": d.original_filename,
            "file_size": d.file_size,
            "mime_type": d.mime_type,
            "processing_status": d.processing_status,
            "verification_status": d.verification_status,
            "overall_score": d.verification_result.overall_score if d.verification_result else None,
            "mismatch_count": d.verification_result.mismatch_count if d.verification_result else 0,
            "critical_mismatch_count": d.verification_result.critical_mismatch_count if d.verification_result else 0,
            "uploaded_at": d.uploaded_at,
            "processed_at": d.processed_at
        }
        for d in docs
    ]

@router.get("/{application_id}/required-documents")
def get_required_documents(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns required vs uploaded document checklist for statutory workflow compliance.
    """
    from app.services.document_service import DocumentService
    return DocumentService.get_required_documents_for_application(db, application_id)

