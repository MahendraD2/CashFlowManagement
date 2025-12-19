from typing import List, Dict, Any
import uuid
import random

from app.schemas.scenario import ScenarioInput, ScenarioResult, PredefinedScenario

def simulate_scenario(scenario_in: ScenarioInput, user_id: int) -> ScenarioResult:
    """
    Simulate a financial scenario
    """
    # In a real app, this would apply the scenario to the user's data
    # For now, we'll return dummy data
    
    scenario_id = str(uuid.uuid4())
    
    # Generate dummy original data
    original_data = {
        "cash_flow": {
            "months": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            "values": [10000, 12000, 15000, 13000, 16000, 18000]
        },
        "total_revenue": 84000,
        "total_expenses": 50000,
        "net_profit": 34000
    }
    
    # Apply scenario effect (dummy implementation)
    if scenario_in.scenario_type == "payment_delay":
        # Simulate payment delay effect
        modified_data = {
            "cash_flow": {
                "months": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                "values": [8000, 10000, 13000, 12000, 15000, 20000]
            },
            "total_revenue": 78000,
            "total_expenses": 50000,
            "net_profit": 28000
        }
        
        impact_summary = {
            "revenue_impact": -6000,
            "cash_flow_impact": -6000,
            "profit_impact": -6000,
            "risk_level": "Medium"
        }
    elif scenario_in.scenario_type == "cost_increase":
        # Simulate cost increase effect
        modified_data = {
            "cash_flow": {
                "months": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                "values": [8000, 10000, 13000, 11000, 14000, 16000]
            },
            "total_revenue": 84000,
            "total_expenses": 58000,
            "net_profit": 26000
        }
        
        impact_summary = {
            "revenue_impact": 0,
            "cash_flow_impact": -8000,
            "profit_impact": -8000,
            "risk_level": "High"
        }
    else:
        # Default scenario
        modified_data = original_data.copy()
        modified_data["cash_flow"]["values"] = [v * 0.9 for v in original_data["cash_flow"]["values"]]
        modified_data["total_revenue"] = original_data["total_revenue"] * 0.9
        modified_data["net_profit"] = modified_data["total_revenue"] - original_data["total_expenses"]
        
        impact_summary = {
            "revenue_impact": original_data["total_revenue"] - modified_data["total_revenue"],
            "cash_flow_impact": sum(original_data["cash_flow"]["values"]) - sum(modified_data["cash_flow"]["values"]),
            "profit_impact": original_data["net_profit"] - modified_data["net_profit"],
            "risk_level": "Low"
        }
    
    return ScenarioResult(
        scenario_id=scenario_id,
        description=scenario_in.description or f"Scenario: {scenario_in.scenario_type}",
        original_data=original_data,
        modified_data=modified_data,
        impact_summary=impact_summary
    )

def get_predefined_scenarios() -> List[PredefinedScenario]:
    """
    Get predefined scenarios
    """
    return [
        PredefinedScenario(
            id="payment-delay-30",
            name="30-Day Payment Delay",
            description="Simulate the impact of clients delaying payments by 30 days",
            parameters={
                "scenario_type": "payment_delay",
                "delay_days": 30
            }
        ),
        PredefinedScenario(
            id="cost-increase-10",
            name="10% Cost Increase",
            description="Simulate the impact of a 10% increase in operational costs",
            parameters={
                "scenario_type": "cost_increase",
                "increase_percentage": 10
            }
        ),
        PredefinedScenario(
            id="revenue-decrease-15",
            name="15% Revenue Decrease",
            description="Simulate the impact of a 15% decrease in revenue",
            parameters={
                "scenario_type": "revenue_decrease",
                "decrease_percentage": 15
            }
        ),
        PredefinedScenario(
            id="project-delay",
            name="Project Delay",
            description="Simulate the impact of a project being delayed by 2 months",
            parameters={
                "scenario_type": "project_delay",
                "delay_months": 2,
                "project_id": "all"
            }
        )
    ]
