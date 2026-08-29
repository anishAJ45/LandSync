from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.notification import NotificationResponse, UnreadCountResponse
from app.services import notification_service

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
def get_my_notifications(
    unread_only: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get notifications for the logged in user.
    """
    return notification_service.get_user_notifications(db, current_user.id, unread_only)

@router.get("/unread-count", response_model=UnreadCountResponse)
def get_unread_count_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get count of unread notifications for notification bell.
    """
    count = notification_service.get_unread_count(db, current_user.id)
    return {"unread_count": count}

@router.put("/{notification_id}/read", response_model=NotificationResponse)
def mark_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Mark an individual notification as read.
    """
    notif = notification_service.mark_notification_read(db, notification_id, current_user.id)
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")
    return notif

@router.put("/read-all", response_model=dict)
def mark_all_read_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Mark all user's notifications as read.
    """
    count = notification_service.mark_all_read(db, current_user.id)
    return {"status": "success", "marked_read_count": count}
