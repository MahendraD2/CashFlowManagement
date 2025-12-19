import pandas as pd
import io
import uuid
import os
from fastapi.responses import StreamingResponse
from typing import Dict, List, Any, Optional, Union

from app.config import settings
from app.services.data_processing import get_processed_data


def generate_excel_export(data: Dict[str, Any], user_id: int, include_sheets: Optional[List[str]] = None) -> io.BytesIO:
    """
    Generate an Excel file containing the user's financial data
    
    Args:
        data: Dictionary containing the data to export
        user_id: ID of the user exporting the data
        include_sheets: List of sheets to include in the export (if None, include all)
        
    Returns:
        BytesIO object containing the Excel file
    """
    output = io.BytesIO()
    
    # Create a Pandas Excel writer
    writer = pd.ExcelWriter(output, engine='openpyxl')
    
    # If no specific sheets are requested, include all available
    all_sheets = ["cash_flow_timeline", "revenue_expenses", "project_profitability", "payment_status"]
    sheets_to_export = include_sheets or all_sheets
    
    # Export Cash Flow Timeline
    if "cash_flow_timeline" in data and "cash_flow_timeline" in sheets_to_export:
        cf_data = data["cash_flow_timeline"]
        df = pd.DataFrame({
            'Month/Year': cf_data['months'],
            'Total Inflows': cf_data['inflows'],
            'Total Outflows': cf_data['outflows'],
            'Net Cash Flow': cf_data['net_flow']
        })
        df.to_excel(writer, sheet_name='Monthly Cash Flow', index=False)
    
    # Export Revenue & Expenses
    if "revenue_expenses" in data and "revenue_expenses" in sheets_to_export:
        re_data = data["revenue_expenses"]
        
        # Revenue data
        revenue_df = pd.DataFrame({
            'Category': ['Revenue'] * len(re_data['revenue_categories']),
            'Subcategory': re_data['revenue_categories'],
            'Amount': re_data['revenue_amounts']
        })
        
        # Expense data
        expense_df = pd.DataFrame({
            'Category': ['Expense'] * len(re_data['expense_categories']),
            'Subcategory': re_data['expense_categories'],
            'Amount': re_data['expense_amounts']
        })
        
        # Combine revenue and expense data
        combined_df = pd.concat([revenue_df, expense_df])
        combined_df.to_excel(writer, sheet_name='Revenue & Expenses', index=False)
    
    # Export Project Profitability
    if "project_profitability" in data and "project_profitability" in sheets_to_export:
        pp_data = data["project_profitability"]
        df = pd.DataFrame({
            'Project Name': pp_data['project_names'],
            'Total Revenue': pp_data['total_revenue'],
            'Total Costs': pp_data['total_costs'],
            'Profit Margin (%)': pp_data['profit_margins'],
            'Status': pp_data['status']
        })
        df.to_excel(writer, sheet_name='Projects', index=False)
    
    # Export Payment Status
    if "payment_status" in data and "payment_status" in sheets_to_export:
        ps_data = data["payment_status"]
        df = pd.DataFrame({
            'Status': ps_data['labels'],
            'Count': ps_data['values']
        })
        df.to_excel(writer, sheet_name='Payment Summary', index=False)
    
    # Save the Excel file to the BytesIO object
    writer.close()
    
    # Move the cursor to the beginning of the BytesIO object
    output.seek(0)
    
    return output


def generate_csv_export(data: Dict[str, Any], sheet: str) -> io.StringIO:
    """
    Generate a CSV file containing a specific sheet of the user's financial data
    
    Args:
        data: Dictionary containing the data to export
        sheet: The specific sheet/data to export as CSV
        
    Returns:
        StringIO object containing the CSV file
    """
    output = io.StringIO()
    
    if sheet == "cash_flow_timeline" and sheet in data:
        cf_data = data[sheet]
        df = pd.DataFrame({
            'Month/Year': cf_data['months'],
            'Total Inflows': cf_data['inflows'],
            'Total Outflows': cf_data['outflows'],
            'Net Cash Flow': cf_data['net_flow']
        })
        df.to_csv(output, index=False)
    
    elif sheet == "revenue_expenses" and sheet in data:
        re_data = data[sheet]
        
        # Revenue data
        revenue_df = pd.DataFrame({
            'Category': ['Revenue'] * len(re_data['revenue_categories']),
            'Subcategory': re_data['revenue_categories'],
            'Amount': re_data['revenue_amounts']
        })
        
        # Expense data
        expense_df = pd.DataFrame({
            'Category': ['Expense'] * len(re_data['expense_categories']),
            'Subcategory': re_data['expense_categories'],
            'Amount': re_data['expense_amounts']
        })
        
        # Combine revenue and expense data
        combined_df = pd.concat([revenue_df, expense_df])
        combined_df.to_csv(output, index=False)
    
    elif sheet == "project_profitability" and sheet in data:
        pp_data = data[sheet]
        df = pd.DataFrame({
            'Project Name': pp_data['project_names'],
            'Total Revenue': pp_data['total_revenue'],
            'Total Costs': pp_data['total_costs'],
            'Profit Margin (%)': pp_data['profit_margins'],
            'Status': pp_data['status']
        })
        df.to_csv(output, index=False)
    
    elif sheet == "payment_status" and sheet in data:
        ps_data = data[sheet]
        df = pd.DataFrame({
            'Status': ps_data['labels'],
            'Count': ps_data['values']
        })
        df.to_csv(output, index=False)
    
    # Move the cursor to the beginning of the StringIO object
    output.seek(0)
    
    return output


def export_financial_data(
    file_id: str, 
    user_id: int, 
    export_format: str = "excel",
    sheets: Optional[List[str]] = None
) -> Union[StreamingResponse, Dict[str, str]]:
    """
    Export the user's financial data in the specified format
    
    Args:
        file_id: ID of the file to export
        user_id: ID of the user exporting the data
        export_format: Format to export the data in ('excel' or 'csv')
        sheets: List of sheets to include (for Excel) or the sheet to export (for CSV)
        
    Returns:
        StreamingResponse containing the exported file
    """
    # Get the processed data for the file
    data = get_processed_data(file_id, user_id)
    
    if not data:
        return {"error": "File not found or access denied"}
    
    filename_base = f"cashvista_export_{user_id}_{uuid.uuid4().hex[:8]}"
    
    if export_format.lower() == "excel":
        # Generate Excel file
        excel_file = generate_excel_export(data, user_id, sheets)
        
        # Return the Excel file as a response
        return StreamingResponse(
            excel_file,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename_base}.xlsx"}
        )
    
    elif export_format.lower() == "csv":
        # For CSV, we need to specify which sheet to export
        if not sheets or len(sheets) != 1:
            return {"error": "Please specify exactly one sheet to export as CSV"}
        
        sheet = sheets[0]
        csv_file = generate_csv_export(data, sheet)
        
        # Return the CSV file as a response
        return StreamingResponse(
            csv_file,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename_base}_{sheet}.csv"}
        )
    
    else:
        return {"error": f"Unsupported format: {export_format}"}
