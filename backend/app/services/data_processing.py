import os
import uuid
import pandas as pd
from typing import Dict, Any, Optional, List

from app.config import settings
from app.utils.excel_utils import validate_excel_structure

# In-memory cache for processed data (in a real app, use Redis or another caching solution)
processed_data_cache = {}

def process_excel_file(file_path: str, user_id: int) -> str:
    """
    Process an Excel file and store the results in cache
    Returns a file_id that can be used to retrieve the processed data
    """
    # Validate the Excel file structure
    if not validate_excel_structure(file_path):
        raise ValueError("Invalid Excel file structure")
    
    # Generate a unique ID for this file
    file_id = str(uuid.uuid4())
    
    # Process the file and extract data
    result = {}
    
    # Read the Excel file
    xls = pd.ExcelFile(file_path)
    
    # Process Monthly Cash Flow sheet
    if 'Monthly Cash Flow' in xls.sheet_names:
        df = pd.read_excel(xls, 'Monthly Cash Flow')
        
        # Extract monthly cash flow data
        months = df['Month/Year'].tolist()
        inflows = df['Total Inflows'].tolist()
        outflows = df['Total Outflows'].tolist()
        net_flow = df['Net Cash Flow'].tolist()
        
        result['cash_flow_timeline'] = {
            'months': months,
            'inflows': inflows,
            'outflows': outflows,
            'net_flow': net_flow
        }
    
    # Process Revenue & Expenses sheet
    if 'Revenue & Expenses' in xls.sheet_names:
        df = pd.read_excel(xls, 'Revenue & Expenses')
        
        # Group by category and subcategory
        revenue_data = df[df['Category'] == 'Revenue'].groupby('Subcategory')['Amount'].sum().reset_index()
        expense_data = df[df['Category'] == 'Expense'].groupby('Subcategory')['Amount'].sum().reset_index()
        
        result['revenue_expenses'] = {
            'revenue_categories': revenue_data['Subcategory'].tolist(),
            'revenue_amounts': revenue_data['Amount'].tolist(),
            'expense_categories': expense_data['Subcategory'].tolist(),
            'expense_amounts': expense_data['Amount'].tolist()
        }
    
    # Process Projects sheet
    if 'Projects' in xls.sheet_names:
        df = pd.read_excel(xls, 'Projects')
        
        result['project_profitability'] = {
            'project_names': df['Project Name'].tolist(),
            'profit_margins': df['Profit Margin (%)'].tolist(),
            'total_revenue': df['Total Revenue'].tolist(),
            'total_costs': df['Total Costs'].tolist(),
            'status': df['Status'].tolist()
        }
    
    # Process Payments sheet
    if 'Payments' in xls.sheet_names:
        df = pd.read_excel(xls, 'Payments')
        
        # Count payments by status
        payment_counts = df['Status'].value_counts().to_dict()
        
        result['payment_status'] = {
            'labels': list(payment_counts.keys()),
            'values': list(payment_counts.values())
        }
    
    # Store the processed data in cache
    processed_data_cache[file_id] = {
        'user_id': user_id,
        'data': result
    }
    
    return file_id

def extract_payment_data(file_path: str, user_id: int) -> Dict[str, Any]:
    """
    Extract payment data from the Excel file
    Returns a dictionary with payment statistics
    """
    try:
        # Read the Excel file
        xls = pd.ExcelFile(file_path)
        
        # Process Payments sheet
        if 'Payments' in xls.sheet_names:
            df = pd.read_excel(xls, 'Payments')
            
            # Count payments by status
            payment_counts = df['Status'].value_counts().to_dict()
            
            # Calculate total payments
            total_payments = len(df)
            
            # Count due payments
            due_payments = df[df['Status'].str.lower() == 'due'].shape[0]
            
            # Count pending payments
            pending_payments = df[df['Status'].str.lower() == 'pending'].shape[0]
            
            # Count paid payments
            paid_payments = df[df['Status'].str.lower() == 'paid'].shape[0]
            
            # Calculate total amount
            total_amount = df['Amount'].sum()
            
            # Calculate due amount
            due_amount = df[df['Status'].str.lower() == 'due']['Amount'].sum()
            
            return {
                'total_payments': total_payments,
                'due_payments': due_payments,
                'pending_payments': pending_payments,
                'paid_payments': paid_payments,
                'total_amount': float(total_amount),
                'due_amount': float(due_amount)
            }
        
        return None
    except Exception as e:
        print(f"Error extracting payment data: {str(e)}")
        return None

def get_processed_data(file_id: str, user_id: int) -> Optional[Dict[str, Any]]:
    """
    Retrieve processed data from cache
    """
    if file_id not in processed_data_cache:
        return None
    
    cache_entry = processed_data_cache[file_id]
    if cache_entry['user_id'] != user_id:
        return None
    
    return cache_entry['data']
