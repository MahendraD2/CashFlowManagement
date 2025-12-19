from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.schemas.financial import CashFlowTimelineData, RevenueExpensesData, ProjectProfitabilityData, PaymentStatusData
from app.services import financial_analysis

router = APIRouter()

@router.get("/cash-flow/timeline/{file_id}", response_model=CashFlowTimelineData)
def get_cash_flow_timeline(
    file_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get cash flow timeline data
    """
    return financial_analysis.get_cash_flow_timeline(file_id, current_user.id)

@router.get("/revenue-expenses/{file_id}", response_model=RevenueExpensesData)
def get_revenue_expenses(
    file_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get revenue and expenses breakdown
    """
    return financial_analysis.get_revenue_expenses(file_id, current_user.id)

@router.get("/projects/profitability/{file_id}", response_model=ProjectProfitabilityData)
def get_project_profitability(
    file_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get project profitability data
    """
    return financial_analysis.get_project_profitability(file_id, current_user.id)

@router.get("/payments/status/{file_id}", response_model=PaymentStatusData)
def get_payment_status(
    file_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get payment status data
    """
    return financial_analysis.get_payment_status(file_id, current_user.id)
