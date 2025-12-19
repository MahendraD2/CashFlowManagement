from typing import Dict, Any, Optional
import random
import uuid

from app.services.data_processing import get_processed_data
from app.schemas.financial import (
    DashboardSummary,
    CashFlowTimelineData,
    RevenueExpensesData,
    ProjectProfitabilityData,
    PaymentStatusData
)

# For demo purposes, we'll generate dummy data
# In a real app, this would be replaced with actual data processing logic

def get_dashboard_summary(user_id: int) -> DashboardSummary:
    """
    Get dashboard summary data
    """
    # Generate dummy data
    total_revenue = random.uniform(500000, 1000000)
    total_expenses = total_revenue * random.uniform(0.6, 0.9)
    net_cash_flow = total_revenue - total_expenses
    pending_payments = total_revenue * random.uniform(0.1, 0.3)
    
    # Generate cash flow timeline data
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    inflows = [random.uniform(30000, 100000) for _ in range(12)]
    outflows = [random.uniform(20000, 80000) for _ in range(12)]
    net_flow = [inflows[i] - outflows[i] for i in range(12)]
    
    cash_flow_timeline = CashFlowTimelineData(
        months=months,
        inflows=inflows,
        outflows=outflows,
        net_flow=net_flow
    )
    
    # Generate revenue and expenses data
    revenue_categories = ["Client Payments", "Consulting Fees", "Equipment Rental", "Material Sales"]
    revenue_amounts = [random.uniform(50000, 200000) for _ in range(len(revenue_categories))]
    
    expense_categories = ["Salaries", "Materials", "Equipment", "Rent", "Utilities", "Insurance", "Marketing"]
    expense_amounts = [random.uniform(20000, 100000) for _ in range(len(expense_categories))]
    
    revenue_expenses = RevenueExpensesData(
        revenue_categories=revenue_categories,
        revenue_amounts=revenue_amounts,
        expense_categories=expense_categories,
        expense_amounts=expense_amounts
    )
    
    # Generate project profitability data
    project_names = ["Office Tower Construction", "Highway Expansion", "Bridge Repair", 
                    "School Renovation", "Hospital Wing Addition", "Shopping Mall Development"]
    profit_margins = [random.uniform(5, 25) for _ in range(len(project_names))]
    total_revenue = [random.uniform(100000, 500000) for _ in range(len(project_names))]
    total_costs = [total_revenue[i] * (1 - profit_margins[i]/100) for i in range(len(project_names))]
    status = ["In Progress", "Completed", "On Hold", "In Progress", "In Progress", "On Hold"]
    
    project_profitability = ProjectProfitabilityData(
        project_names=project_names,
        profit_margins=profit_margins,
        total_revenue=total_revenue,
        total_costs=total_costs,
        status=status
    )
    
    # Generate payment status data
    labels = ["Paid", "Pending", "Overdue"]
    values = [random.randint(10, 50), random.randint(5, 20), random.randint(1, 10)]
    
    payment_status = PaymentStatusData(
        labels=labels,
        values=values
    )
    
    try:
        return DashboardSummary(
            total_revenue=sum(total_revenue),
            total_expenses=float(total_expenses),
            net_cash_flow=float(net_cash_flow),
            pending_payments=float(pending_payments),
            cash_flow_timeline=cash_flow_timeline,
            revenue_expenses=revenue_expenses,
            project_profitability=project_profitability,
            payment_status=payment_status
        )
    except ValueError as e:
        raise ValueError(f"Error creating DashboardSummary: {str(e)}")

def get_cash_flow_timeline(file_id: str, user_id: int) -> CashFlowTimelineData:
    """
    Get cash flow timeline data
    """
    data = get_processed_data(file_id, user_id)
    if data and 'cash_flow_timeline' in data:
        return CashFlowTimelineData(**data['cash_flow_timeline'])
    
    # Fallback to dummy data
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    inflows = [random.uniform(30000, 100000) for _ in range(12)]
    outflows = [random.uniform(20000, 80000) for _ in range(12)]
    net_flow = [inflows[i] - outflows[i] for i in range(12)]
    
    return CashFlowTimelineData(
        months=months,
        inflows=inflows,
        outflows=outflows,
        net_flow=net_flow
    )

def get_revenue_expenses(file_id: str, user_id: int) -> RevenueExpensesData:
    """
    Get revenue and expenses breakdown
    """
    data = get_processed_data(file_id, user_id)
    if data and 'revenue_expenses' in data:
        return RevenueExpensesData(**data['revenue_expenses'])
    
    # Fallback to dummy data
    revenue_categories = ["Client Payments", "Consulting Fees", "Equipment Rental", "Material Sales"]
    revenue_amounts = [random.uniform(50000, 200000) for _ in range(len(revenue_categories))]
    
    expense_categories = ["Salaries", "Materials", "Equipment", "Rent", "Utilities", "Insurance", "Marketing"]
    expense_amounts = [random.uniform(20000, 100000) for _ in range(len(expense_categories))]
    
    return RevenueExpensesData(
        revenue_categories=revenue_categories,
        revenue_amounts=revenue_amounts,
        expense_categories=expense_categories,
        expense_amounts=expense_amounts
    )

def get_project_profitability(file_id: str, user_id: int) -> ProjectProfitabilityData:
    """
    Get project profitability data
    """
    data = get_processed_data(file_id, user_id)
    if data and 'project_profitability' in data:
        return ProjectProfitabilityData(**data['project_profitability'])
    
    # Fallback to dummy data
    project_names = ["Office Tower Construction", "Highway Expansion", "Bridge Repair", 
                    "School Renovation", "Hospital Wing Addition", "Shopping Mall Development"]
    profit_margins = [random.uniform(5, 25) for _ in range(len(project_names))]
    total_revenue = [random.uniform(100000, 500000) for _ in range(len(project_names))]
    total_costs = [total_revenue[i] * (1 - profit_margins[i]/100) for i in range(len(project_names))]
    status = ["In Progress", "Completed", "On Hold", "In Progress", "In Progress", "On Hold"]
    
    return ProjectProfitabilityData(
        project_names=project_names,
        profit_margins=profit_margins,
        total_revenue=total_revenue,
        total_costs=total_costs,
        status=status
    )

def get_payment_status(file_id: str, user_id: int) -> PaymentStatusData:
    """
    Get payment status data
    """
    data = get_processed_data(file_id, user_id)
    if data and 'payment_status' in data:
        return PaymentStatusData(**data['payment_status'])
    
    # Fallback to dummy data
    labels = ["Paid", "Pending", "Overdue"]
    values = [random.randint(10, 50), random.randint(5, 20), random.randint(1, 10)]
    
    return PaymentStatusData(
        labels=labels,
        values=values
    )
