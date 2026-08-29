from typing import Optional
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog

def create_audit_log(
    db: Session,
    user_id: Optional[int],
    action: str,
    entity_type: str,
    entity_id: Optional[str],
    details: str,
    ip_address: str = "127.0.0.1"
) -> AuditLog:
    """
    Creates an immutable audit log entry for system actions.
    """
    log_entry = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details,
        ip_address=ip_address
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry
