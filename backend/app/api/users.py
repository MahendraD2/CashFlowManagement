from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.schemas.user import User as UserSchema, UserUpdate
from app.services import user_service

router = APIRouter()

@router.get("/", response_model=List[UserSchema])
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve users (admin only)
    """
    # In a real app, you would check if the user is an admin
    users = user_service.get_multi(db, skip=skip, limit=limit)
    return users

@router.put("/profile", response_model=UserSchema)
def update_user_profile(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update own user profile
    """
    user = user_service.update(db, db_obj=current_user, obj_in=user_in)
    return user
