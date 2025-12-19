from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.schemas.scenario import ScenarioInput, ScenarioResult, PredefinedScenario
from app.services import scenario_service

router = APIRouter()

@router.post("/simulate", response_model=ScenarioResult)
def simulate_scenario(
    *,
    db: Session = Depends(deps.get_db),
    scenario_in: ScenarioInput,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Simulate a financial scenario
    """
    return scenario_service.simulate_scenario(scenario_in, current_user.id)

@router.get("/predefined", response_model=List[PredefinedScenario])
def get_predefined_scenarios(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get predefined scenarios
    """
    return scenario_service.get_predefined_scenarios()
