from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.schemas.user import User as UserSchema, UserUpdate
from app.schemas.export import ExportRequest
from app.services import user_service
from app.utils.export_utils import export_financial_data

router = APIRouter()

@router.get("/profile", response_model=UserSchema)
def get_profile(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get user profile
    """
    return current_user

@router.put("/profile", response_model=UserSchema)
def update_profile(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update user profile
    """
    user = user_service.update(db, db_obj=current_user, obj_in=user_in)
    return user

@router.post("/export-data")
def export_data(
    *,
    db: Session = Depends(deps.get_db),
    export_request: ExportRequest,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Export user financial data in Excel or CSV format.
    
    - For Excel export: Multiple sheets can be specified, or all will be included if none are specified.
    - For CSV export: Exactly one sheet must be specified.
    
    Available sheets:
    - cash_flow_timeline: Monthly cash flow data
    - revenue_expenses: Revenue and expense breakdown
    - project_profitability: Project profitability analysis
    - payment_status: Payment status summary
    """
    try:
        return export_financial_data(
            file_id=export_request.file_id,
            user_id=current_user.id,
            export_format=export_request.export_format,
            sheets=export_request.sheets
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating export: {str(e)}"
        )
