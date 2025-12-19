from typing import List, Optional
from pydantic import BaseModel, validator

class ExportRequest(BaseModel):
    file_id: str
    export_format: str = "excel"  # "excel" or "csv"
    sheets: Optional[List[str]] = None
    
    @validator('export_format')
    def validate_format(cls, v):
        if v.lower() not in ["excel", "csv"]:
            raise ValueError('export_format must be either "excel" or "csv"')
        return v.lower()
    
    @validator('sheets', pre=True)
    def validate_sheets(cls, v, values):
        if not v:
            return None
            
        if values.get('export_format') == 'csv' and len(v) != 1:
            raise ValueError('For CSV export, exactly one sheet must be specified')
            
        valid_sheets = ["cash_flow_timeline", "revenue_expenses", "project_profitability", "payment_status"]
        for sheet in v:
            if sheet not in valid_sheets:
                raise ValueError(f'Invalid sheet: {sheet}. Must be one of {valid_sheets}')
                
        return v
