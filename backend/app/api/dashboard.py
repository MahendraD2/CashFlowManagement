from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.schemas.financial import DashboardSummary
from app.services import financial_analysis, notification_service

router = APIRouter()

@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get dashboard summary data
    """
    # Get financial summary
    summary = financial_analysis.get_dashboard_summary(current_user.id)
    
    # Add notification counts
    summary.pending_notifications = notification_service.count_pending(db, user_id=current_user.id)
    summary.due_notifications = notification_service.count_due(db, user_id=current_user.id)
    
    return summary
