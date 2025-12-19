from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime

class UploadResponse(BaseModel):
    success: bool
    message: str
    file_id: Optional[str] = None

class CashFlowTimelineData(BaseModel):
    months: List[str]
    inflows: List[float]
    outflows: List[float]
    net_flow: List[float]

class RevenueExpensesData(BaseModel):
    revenue_categories: List[str]
    revenue_amounts: List[float]
    expense_categories: List[str]
    expense_amounts: List[float]

class ProjectProfitabilityData(BaseModel):
    project_names: List[str]
    profit_margins: List[float]
    total_revenue: List[float]
    total_costs: List[float]
    status: List[str]

class PaymentStatusData(BaseModel):
    labels: List[str]
    values: List[int]

class DashboardSummary(BaseModel):
    total_revenue: float
    total_expenses: float
    net_cash_flow: float
    pending_payments: float
    pending_notifications: Optional[int] = 0
    due_notifications: Optional[int] = 0
    cash_flow_timeline: CashFlowTimelineData
    revenue_expenses: RevenueExpensesData
    project_profitability: ProjectProfitabilityData
    payment_status: PaymentStatusData
