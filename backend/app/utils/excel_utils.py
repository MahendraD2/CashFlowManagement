import pandas as pd
from typing import List, Dict, Any, Optional
import os

def validate_excel_structure(file_path: str) -> bool:
    """
    Validate that the Excel file has the expected structure
    """
    try:
        # Check if file exists
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            return False
            
        # Check if file is readable
        try:
            xls = pd.ExcelFile(file_path)
        except Exception as e:
            print(f"Error reading Excel file: {str(e)}")
            return False
        
        # Check if required sheets exist
        required_sheets = ['Monthly Cash Flow', 'Revenue & Expenses', 'Projects', 'Payments']
        missing_sheets = [sheet for sheet in required_sheets if sheet not in xls.sheet_names]
        
        if missing_sheets:
            print(f"Missing required sheets: {', '.join(missing_sheets)}")
            return False
        
        # Validate Monthly Cash Flow sheet
        try:
            df_cash_flow = pd.read_excel(xls, 'Monthly Cash Flow')
            required_columns_cash_flow = ['Month/Year', 'Total Inflows', 'Total Outflows', 'Net Cash Flow']
            missing_columns = [col for col in required_columns_cash_flow if col not in df_cash_flow.columns]
            
            if missing_columns:
                print(f"Missing columns in Monthly Cash Flow sheet: {', '.join(missing_columns)}")
                return False
        except Exception as e:
            print(f"Error validating Monthly Cash Flow sheet: {str(e)}")
            return False
        
        # Validate Revenue & Expenses sheet
        try:
            df_rev_exp = pd.read_excel(xls, 'Revenue & Expenses')
            required_columns_rev_exp = ['Category', 'Subcategory', 'Amount', 'Month/Year']
            missing_columns = [col for col in required_columns_rev_exp if col not in df_rev_exp.columns]
            
            if missing_columns:
                print(f"Missing columns in Revenue & Expenses sheet: {', '.join(missing_columns)}")
                return False
        except Exception as e:
            print(f"Error validating Revenue & Expenses sheet: {str(e)}")
            return False
        
        # Validate Projects sheet
        try:
            df_projects = pd.read_excel(xls, 'Projects')
            required_columns_projects = ['Project Name', 'Total Revenue', 'Total Costs', 'Profit Margin (%)', 'Status']
            missing_columns = [col for col in required_columns_projects if col not in df_projects.columns]
            
            if missing_columns:
                print(f"Missing columns in Projects sheet: {', '.join(missing_columns)}")
                return False
        except Exception as e:
            print(f"Error validating Projects sheet: {str(e)}")
            return False
        
        # Validate Payments sheet
        try:
            df_payments = pd.read_excel(xls, 'Payments')
            required_columns_payments = ['Status', 'Amount']
            missing_columns = [col for col in required_columns_payments if col not in df_payments.columns]
            
            if missing_columns:
                print(f"Missing columns in Payments sheet: {', '.join(missing_columns)}")
                return False
        except Exception as e:
            print(f"Error validating Payments sheet: {str(e)}")
            return False
        
        return True
    
    except Exception as e:
        # Log the error in a real application
        print(f"Error validating Excel file: {str(e)}")
        return False
