from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.schemas.notification import Notification, NotificationUpdate
from app.services import notification_service

router = APIRouter()

@router.get("/", response_model=List[Notification])
def read_notifications(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve notifications
    """
    notifications = notification_service.get_multi_by_user(
        db=db, user_id=current_user.id, skip=skip, limit=limit
    )
    return notifications

@router.get("/count/pending", response_model=int)
def count_pending_notifications(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Count pending notifications
    """
    return notification_service.count_pending(db=db, user_id=current_user.id)

@router.get("/count/due", response_model=int)
def count_due_notifications(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Count due notifications
    """
    return notification_service.count_due(db=db, user_id=current_user.id)

@router.patch("/{notification_id}/update-status", response_model=Notification)
def update_notification_status(
    *,
    db: Session = Depends(deps.get_db),
    notification_id: int,
    status_update: NotificationUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a notification's status (due, paid, or pending)
    """
    notification = notification_service.get(db=db, id=notification_id)
    if not notification or notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    
    return notification_service.update(db=db, db_obj=notification, obj_in=status_update)

@router.patch("/{notification_id}/mark-as-paid", response_model=Notification)
def mark_notification_as_paid(
    *,
    db: Session = Depends(deps.get_db),
    notification_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Mark a notification as paid
    """
    notification = notification_service.get(db=db, id=notification_id)
    if not notification or notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    
    notification_in = NotificationUpdate(status="paid")
    return notification_service.update(db=db, db_obj=notification, obj_in=notification_in)

@router.post("/mark-all-as-paid", response_model=int)
def mark_all_notifications_as_paid(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Mark all pending and due notifications as paid
    """
    return notification_service.mark_all_as_paid(db=db, user_id=current_user.id)
