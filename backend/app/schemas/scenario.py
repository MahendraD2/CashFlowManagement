from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class ScenarioInput(BaseModel):
    scenario_type: str
    parameters: Dict[str, Any]
    description: Optional[str] = None

class ScenarioResult(BaseModel):
    scenario_id: str
    description: str
    original_data: Dict[str, Any]
    modified_data: Dict[str, Any]
    impact_summary: Dict[str, Any]

class PredefinedScenario(BaseModel):
    id: str
    name: str
    description: str
    parameters: Dict[str, Any]
