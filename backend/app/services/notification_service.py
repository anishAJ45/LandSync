from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.notification import Notification

def send_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notification_type: str = "INFO",
    related_application_id: Optional[str] = None
) -> Notification:
    """
    Creates a new notification record for a specific user.
    """
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        is_read=False,
        related_application_id=related_application_id
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif

def get_user_notifications(db: Session, user_id: int, unread_only: bool = False) -> List[Notification]:
    query = db.query(Notification).filter(Notification.user_id == user_id)
    if unread_only:
        query = query.filter(Notification.is_read == False)
    return query.order_by(Notification.created_at.desc()).all()

def get_unread_count(db: Session, user_id: int) -> int:
    return db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read == False).count()

def mark_notification_read(db: Session, notification_id: int, user_id: int) -> Optional[Notification]:
    notif = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user_id).first()
    if notif:
        notif.is_read = True
        db.commit()
        db.refresh(notif)
    return notif

def mark_all_read(db: Session, user_id: int) -> int:
    count = db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read == False).update({"is_read": True})
    db.commit()
    return count
