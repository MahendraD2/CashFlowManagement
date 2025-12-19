from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.schemas.notification import NotificationCreate, NotificationUpdate

def get(db: Session, id: int) -> Optional[Notification]:
    """Get a notification by ID"""
    return db.query(Notification).filter(Notification.id == id).first()

def get_multi_by_user(
    db: Session, *, user_id: int, skip: int = 0, limit: int = 100
) -> List[Notification]:
    """Get multiple notifications for a user"""
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def create(db: Session, *, obj_in: NotificationCreate) -> Notification:
    """Create a new notification"""
    db_obj = Notification(
        user_id=obj_in.user_id,
        message=obj_in.message,
        status=obj_in.status,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

# This function is an alias for the create function to maintain backward compatibility
def create_notification(db: Session, *, obj_in: NotificationCreate) -> Notification:
    """Alias for create function to maintain backward compatibility"""
    return create(db, obj_in=obj_in)

def update(
    db: Session, *, db_obj: Notification, obj_in: NotificationUpdate
) -> Notification:
    """Update a notification"""
    update_data = obj_in.dict(exclude_unset=True)
    for field in update_data:
        setattr(db_obj, field, update_data[field])
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def count_pending(db: Session, *, user_id: int) -> int:
    """Count notifications with 'pending' status for a user"""
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id, Notification.status == "pending")
        .count()
    )

def count_due(db: Session, *, user_id: int) -> int:
    """Count notifications with 'due' status for a user"""
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id, Notification.status == "due")
        .count()
    )

def mark_all_as_paid(db: Session, *, user_id: int) -> int:
    """Mark all pending and due notifications as paid for a user"""
    result = (
        db.query(Notification)
        .filter(
            Notification.user_id == user_id, 
            Notification.status.in_(["pending", "due"])
        )
        .update({"status": "paid"})
    )
    db.commit()
    return result
