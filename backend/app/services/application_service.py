from datetime import datetime
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.application import (
    Application,
    ApplicationStatusHistory,
    OfficerNotes,
    ApplicationStatus,
    ApplicationPriority
)
from app.models.parcel import Parcel
from app.models.user import User, UserRole
from app.schemas.application import ApplicationCreate, ApplicationStatusUpdate
from app.services.notification_service import send_notification
from app.services.audit_service import create_audit_log

# Valid workflow transitions map
VALID_TRANSITIONS: Dict[str, List[str]] = {
    ApplicationStatus.DRAFT.value: [ApplicationStatus.SUBMITTED.value],
    ApplicationStatus.SUBMITTED.value: [ApplicationStatus.UNDER_REVIEW.value, ApplicationStatus.REJECTED.value],
    ApplicationStatus.UNDER_REVIEW.value: [
        ApplicationStatus.VERIFICATION_PENDING.value,
        ApplicationStatus.MORE_INFORMATION_REQUIRED.value,
        ApplicationStatus.APPROVED.value,
        ApplicationStatus.REJECTED.value
    ],
    ApplicationStatus.MORE_INFORMATION_REQUIRED.value: [
        ApplicationStatus.SUBMITTED.value,
        ApplicationStatus.UNDER_REVIEW.value,
        ApplicationStatus.REJECTED.value
    ],
    ApplicationStatus.VERIFICATION_PENDING.value: [
        ApplicationStatus.VERIFIED.value,
        ApplicationStatus.MORE_INFORMATION_REQUIRED.value,
        ApplicationStatus.UNDER_REVIEW.value,
        ApplicationStatus.REJECTED.value
    ],
    ApplicationStatus.VERIFIED.value: [
        ApplicationStatus.APPROVED.value,
        ApplicationStatus.REJECTED.value,
        ApplicationStatus.MORE_INFORMATION_REQUIRED.value,
        ApplicationStatus.CLOSED.value
    ],
    ApplicationStatus.APPROVED.value: [ApplicationStatus.CLOSED.value],
    ApplicationStatus.REJECTED.value: [ApplicationStatus.CLOSED.value],
    ApplicationStatus.CLOSED.value: []
}

def generate_application_id(db: Session) -> str:
    """
    Generates sequenced ID in format: LS-2026-000001
    """
    year = datetime.utcnow().year
    count = db.query(Application).count() + 1
    return f"LS-{year}-{count:06d}"

def create_application(db: Session, citizen_id: int, app_in: ApplicationCreate, ip_address: str = "127.0.0.1") -> Application:
    # Verify parcel exists
    parcel = db.query(Parcel).filter(Parcel.parcel_id == app_in.parcel_id).first()
    if not parcel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Parcel identifier '{app_in.parcel_id}' was not found in the cadastral registry."
        )

    citizen = db.query(User).filter(User.id == citizen_id).first()
    if not citizen:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Citizen profile not found.")

    app_id = generate_application_id(db)
    now = datetime.utcnow()

    # Priority rule: area or boundary discrepancy defaults to HIGH/CRITICAL if not specified
    priority = app_in.priority or ApplicationPriority.MEDIUM.value
    if "DISCREPANCY" in app_in.service_type.upper():
        priority = ApplicationPriority.HIGH.value

    application = Application(
        application_id=app_id,
        parcel_id=app_in.parcel_id,
        citizen_id=citizen_id,
        service_type=app_in.service_type,
        description=app_in.description,
        status=ApplicationStatus.SUBMITTED.value,
        priority=priority,
        created_at=now,
        updated_at=now,
        submitted_at=now
    )

    db.add(application)
    db.commit()
    db.refresh(application)

    # Add initial status history
    history = ApplicationStatusHistory(
        application_id=app_id,
        previous_status=None,
        new_status=ApplicationStatus.SUBMITTED.value,
        changed_by=citizen.full_name,
        remarks="Application submitted via Citizen LandSync Portal."
    )
    db.add(history)
    db.commit()

    # Notify Citizen
    send_notification(
        db=db,
        user_id=citizen_id,
        title="Application Submitted Successfully",
        message=f"Your request '{app_in.service_type}' for parcel {app_in.parcel_id} has been registered with ID {app_id}.",
        notification_type="SUCCESS",
        related_application_id=app_id
    )

    # Notify Officers
    officers = db.query(User).filter(User.role == UserRole.OFFICER.value).all()
    for off in officers:
        send_notification(
            db=db,
            user_id=off.id,
            title="New Case in Review Queue",
            message=f"Application {app_id} ({app_in.service_type}) submitted for parcel {app_in.parcel_id}.",
            notification_type="INFO",
            related_application_id=app_id
        )

    # Audit log
    create_audit_log(
        db=db,
        user_id=citizen_id,
        action="APPLICATION_CREATED",
        entity_type="Application",
        entity_id=app_id,
        details=f"Citizen '{citizen.full_name}' created {app_in.service_type} for parcel {app_in.parcel_id}",
        ip_address=ip_address
    )

    return application

def get_application_by_id(db: Session, application_id: str) -> Optional[Application]:
    return db.query(Application).filter(Application.application_id == application_id).first()

def get_applications_for_user(db: Session, user: User, status_filter: Optional[str] = None, priority_filter: Optional[str] = None) -> List[Application]:
    query = db.query(Application)

    if user.role == UserRole.CITIZEN.value:
        query = query.filter(Application.citizen_id == user.id)
    elif user.role == UserRole.OFFICER.value:
        # Officer sees assigned cases OR unassigned in review queue
        query = query.filter((Application.assigned_officer_id == user.id) | (Application.assigned_officer_id == None))
    # Admin sees all

    if status_filter:
        query = query.filter(Application.status == status_filter)
    if priority_filter:
        query = query.filter(Application.priority == priority_filter)

    return query.order_by(Application.created_at.desc()).all()

def update_application_status(
    db: Session,
    application_id: str,
    status_update: ApplicationStatusUpdate,
    current_user: User,
    ip_address: str = "127.0.0.1"
) -> Application:
    app = get_application_by_id(db, application_id)
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Application '{application_id}' not found.")

    new_stat = status_update.status.upper()
    valid_next = VALID_TRANSITIONS.get(app.status, [])

    if new_stat not in valid_next:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status transition from '{app.status}' to '{new_stat}'. Allowed transitions: {valid_next}"
        )

    previous_status = app.status
    app.status = new_stat
    app.updated_at = datetime.utcnow()

    if new_stat in [ApplicationStatus.APPROVED.value, ApplicationStatus.REJECTED.value, ApplicationStatus.CLOSED.value]:
        app.completed_at = datetime.utcnow()

    # Record history
    history = ApplicationStatusHistory(
        application_id=app.application_id,
        previous_status=previous_status,
        new_status=new_stat,
        changed_by=f"{current_user.full_name} ({current_user.role.title()})",
        remarks=status_update.remarks or f"Status transitioned to {new_stat}"
    )
    db.add(history)
    db.commit()
    db.refresh(app)

    # Notifications
    notif_type = "SUCCESS" if new_stat == "APPROVED" else "WARNING" if new_stat in ["REJECTED", "MORE_INFORMATION_REQUIRED"] else "INFO"
    send_notification(
        db=db,
        user_id=app.citizen_id,
        title=f"Application Status Updated: {new_stat}",
        message=f"Case {app.application_id} has been moved to {new_stat}. Remarks: {status_update.remarks or 'No additional remarks.'}",
        notification_type=notif_type,
        related_application_id=app.application_id
    )

    # Audit log
    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="STATUS_CHANGED",
        entity_type="Application",
        entity_id=app.application_id,
        details=f"Status changed from {previous_status} to {new_stat}. Remarks: {status_update.remarks}",
        ip_address=ip_address
    )

    return app

def assign_officer(db: Session, application_id: str, officer_id: int, current_user: User, ip_address: str = "127.0.0.1") -> Application:
    app = get_application_by_id(db, application_id)
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Application '{application_id}' not found.")

    officer = db.query(User).filter(User.id == officer_id, User.role == UserRole.OFFICER.value).first()
    if not officer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target officer account not found.")

    app.assigned_officer_id = officer_id
    app.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(app)

    send_notification(
        db=db,
        user_id=officer_id,
        title="Case Assigned to You",
        message=f"Application {app.application_id} ({app.service_type}) for parcel {app.parcel_id} has been assigned to you.",
        notification_type="INFO",
        related_application_id=app.application_id
    )

    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="OFFICER_ASSIGNED",
        entity_type="Application",
        entity_id=app.application_id,
        details=f"Assigned to officer {officer.full_name} (ID: {officer.id})",
        ip_address=ip_address
    )

    return app

def add_officer_note(db: Session, application_id: str, officer_id: int, note_text: str, note_type: str = "INTERNAL", ip_address: str = "127.0.0.1") -> OfficerNotes:
    app = get_application_by_id(db, application_id)
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Application '{application_id}' not found.")

    officer = db.query(User).filter(User.id == officer_id).first()
    if not officer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Officer not found.")

    note = OfficerNotes(
        application_id=application_id,
        officer_id=officer_id,
        note=note_text,
        note_type=note_type,
        created_at=datetime.utcnow()
    )
    db.add(note)
    db.commit()
    db.refresh(note)

    if note_type in ["CITIZEN_VISIBLE", "ACTION_REQUIRED"]:
        send_notification(
            db=db,
            user_id=app.citizen_id,
            title="Officer Note on Your Application",
            message=f"Officer {officer.full_name} left a message on {app.application_id}: '{note_text}'",
            notification_type="ACTION_REQUIRED" if note_type == "ACTION_REQUIRED" else "INFO",
            related_application_id=app.application_id
        )

    create_audit_log(
        db=db,
        user_id=officer_id,
        action="NOTE_ADDED",
        entity_type="Application",
        entity_id=application_id,
        details=f"Added note type '{note_type}': {note_text[:60]}...",
        ip_address=ip_address
    )

    return note

def resubmit_application(db: Session, application_id: str, citizen_id: int, additional_notes: str, ip_address: str = "127.0.0.1") -> Application:
    app = get_application_by_id(db, application_id)
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Application '{application_id}' not found.")

    if app.citizen_id != citizen_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only resubmit your own applications.")

    if app.status != ApplicationStatus.MORE_INFORMATION_REQUIRED.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Resubmission is only allowed when status is 'MORE_INFORMATION_REQUIRED'. Current status: '{app.status}'."
        )

    app.status = ApplicationStatus.SUBMITTED.value
    app.updated_at = datetime.utcnow()

    history = ApplicationStatusHistory(
        application_id=app.application_id,
        previous_status=ApplicationStatus.MORE_INFORMATION_REQUIRED.value,
        new_status=ApplicationStatus.SUBMITTED.value,
        changed_by="Citizen (Resubmission)",
        remarks=f"Citizen responded to inquiry: {additional_notes}"
    )
    db.add(history)
    db.commit()
    db.refresh(app)

    if app.assigned_officer_id:
        send_notification(
            db=db,
            user_id=app.assigned_officer_id,
            title="Citizen Resubmitted Requested Info",
            message=f"Application {app.application_id} has been resubmitted with additional remarks.",
            notification_type="INFO",
            related_application_id=app.application_id
        )

    create_audit_log(
        db=db,
        user_id=citizen_id,
        action="APPLICATION_RESUBMITTED",
        entity_type="Application",
        entity_id=app.application_id,
        details=f"Resubmitted with response: {additional_notes}",
        ip_address=ip_address
    )

    return app

def get_combined_timeline(db: Session, application_id: str) -> List[Dict[str, Any]]:
    app = get_application_by_id(db, application_id)
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Application '{application_id}' not found.")

    events: List[Dict[str, Any]] = []

    # Creation event
    events.append({
        "id": f"evt-create-{app.id}",
        "event_type": "CREATION",
        "title": "Application Registered",
        "description": f"Service request '{app.service_type}' created and entered system queue.",
        "actor": app.citizen.full_name if app.citizen else "Citizen",
        "timestamp": app.submitted_at.isoformat(),
        "badge_variant": "primary"
    })

    # Status changes
    for h in app.status_history:
        variant = "success" if h.new_status == "APPROVED" else "danger" if h.new_status == "REJECTED" else "warning" if h.new_status == "MORE_INFORMATION_REQUIRED" else "info"
        events.append({
            "id": f"evt-status-{h.id}",
            "event_type": "STATUS_CHANGE",
            "title": f"Status: {h.new_status.replace('_', ' ')}",
            "description": h.remarks or f"Transitioned from {h.previous_status} to {h.new_status}",
            "actor": h.changed_by,
            "timestamp": h.created_at.isoformat(),
            "badge_variant": variant
        })

    # Notes
    for n in app.notes:
        events.append({
            "id": f"evt-note-{n.id}",
            "event_type": "OFFICER_NOTE",
            "title": f"Officer Note ({n.note_type.replace('_', ' ')})",
            "description": n.note,
            "actor": n.officer.full_name if n.officer else "Land Officer",
            "timestamp": n.created_at.isoformat(),
            "badge_variant": "secondary"
        })

    # Sort chronological
    events.sort(key=lambda x: x["timestamp"])
    return events
