import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

def generate_excel_template(output_path: str = "templates/CashVista_Template.xlsx") -> str:
    """
    Generate a sample Excel template that matches the expected structure
    
    Args:
        output_path: Path where the template will be saved
        
    Returns:
        The path to the generated template
    """
    # Create directory for templates if it doesn't exist
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Create a writer to save the Excel file
    writer = pd.ExcelWriter(output_path, engine='openpyxl')
    
    # Generate Monthly Cash Flow data
    start_date = datetime(2023, 1, 1)
    months = [(start_date + timedelta(days=30*i)).strftime('%b %Y') for i in range(12)]
    
    # Generate realistic cash flow data with seasonal patterns
    np.random.seed(42)  # For reproducibility
    base_inflow = 100000
    base_outflow = 85000
    
    # Add seasonal factors (higher in Q4, lower in Q1)
    seasonal_factors = [0.8, 0.85, 0.9, 0.95, 1.0, 1.05, 1.0, 1.1, 1.15, 1.2, 1.25, 1.1]
    
    inflows = [base_inflow * seasonal_factors[i] * (1 + np.random.normal(0, 0.1)) for i in range(12)]
    outflows = [base_outflow * seasonal_factors[i] * (1 + np.random.normal(0, 0.08)) for i in range(12)]
    net_flows = [inflows[i] - outflows[i] for i in range(12)]
    cumulative = [sum(net_flows[:i+1]) for i in range(12)]
    
    # Create DataFrame for Monthly Cash Flow
    cash_flow_data = {
        'Month/Year': months,
        'Total Inflows': inflows,
        'Total Outflows': outflows,
        'Net Cash Flow': net_flows,
        'Cumulative Cash Flow': cumulative
    }
    
    cash_flow_df = pd.DataFrame(cash_flow_data)
    cash_flow_df.to_excel(writer, sheet_name='Monthly Cash Flow', index=False)
    
    # Generate Revenue & Expenses data
    revenue_categories = ['Client Payments', 'Consulting Fees', 'Equipment Rental', 'Material Sales']
    expense_categories = ['Salaries', 'Materials', 'Equipment', 'Rent', 'Utilities', 'Insurance', 'Marketing']
    
    revenue_data = []
    expense_data = []
    
    for month in months:
        # Revenue entries
        for category in revenue_categories:
            amount = base_inflow / len(revenue_categories) * (1 + np.random.normal(0, 0.2))
            revenue_data.append({
                'Category': 'Revenue',
                'Subcategory': category,
                'Amount': amount,
                'Month/Year': month,
                'Notes': f'Sample {category} for {month}'
            })
        
        # Expense entries
        for category in expense_categories:
            amount = base_outflow / len(expense_categories) * (1 + np.random.normal(0, 0.15))
            expense_data.append({
                'Category': 'Expense',
                'Subcategory': category,
                'Amount': amount,
                'Month/Year': month,
                'Notes': f'Sample {category} for {month}'
            })
    
    revenue_expense_df = pd.DataFrame(revenue_data + expense_data)
    revenue_expense_df.to_excel(writer, sheet_name='Revenue & Expenses', index=False)
    
    # Generate Projects data
    project_names = ['Office Tower Construction', 'Highway Expansion', 'Bridge Repair', 
                    'School Renovation', 'Hospital Wing Addition', 'Shopping Mall Development']
    
    project_data = []
    for i, name in enumerate(project_names):
        # Generate realistic project financials
        revenue = np.random.uniform(500000, 2000000)
        cost_factor = np.random.uniform(0.65, 0.9)  # Cost as percentage of revenue
        costs = revenue * cost_factor
        profit_margin = ((revenue - costs) / revenue) * 100
        
        # Determine status
        status_options = ['In Progress', 'Completed', 'On Hold']
        status_weights = [0.5, 0.3, 0.2]
        status = np.random.choice(status_options, p=status_weights)
        
        project_data.append({
            'Project ID': f'PROJ-{2023}-{i+1:03d}',
            'Project Name': name,
            'Start Date': (start_date + timedelta(days=np.random.randint(0, 180))).strftime('%Y-%m-%d'),
            'End Date': (start_date + timedelta(days=np.random.randint(180, 540))).strftime('%Y-%m-%d'),
            'Total Revenue': revenue,
            'Total Costs': costs,
            'Profit Margin (%)': profit_margin,
            'Status': status
        })
    
    projects_df = pd.DataFrame(project_data)
    projects_df.to_excel(writer, sheet_name='Projects', index=False)
    
    # Generate Payments data
    client_names = ['Acme Corporation', 'Wayne Enterprises', 'Stark Industries', 
                   'Umbrella Corp', 'Globex Corporation', 'Initech']
    
    payment_data = []
    for i in range(50):  # Generate 50 invoices
        # Link to a random project
        project_idx = np.random.randint(0, len(project_names))
        project_id = f'PROJ-{2023}-{project_idx+1:03d}'
        
        # Generate invoice amount
        amount = np.random.uniform(5000, 50000)
        
        # Generate dates
        invoice_date = start_date + timedelta(days=np.random.randint(0, 330))
        due_date = invoice_date + timedelta(days=30)
        
        # Determine status
        days_since_invoice = (datetime.now() - invoice_date).days
        
        if days_since_invoice > 60:
            status_options = ['paid', 'due']
            status_weights = [0.8, 0.2]
        elif days_since_invoice > 30:
            status_options = ['paid', 'pending', 'due']
            status_weights = [0.6, 0.3, 0.1]
        else:
            status_options = ['paid', 'pending']
            status_weights = [0.4, 0.6]
        
        status = np.random.choice(status_options, p=status_weights)
        
        # Calculate days outstanding
        if status == 'paid':
            days_outstanding = np.random.randint(1, 30)
        elif status == 'pending':
            days_outstanding = max(0, (datetime.now() - invoice_date).days)
        else:  # due
            days_outstanding = (datetime.now() - due_date).days
        
        payment_data.append({
            'Invoice ID': f'INV-{2023}-{i+1:04d}',
            'Client Name': np.random.choice(client_names),
            'Project ID': project_id,
            'Amount': amount,
            'Invoice Date': invoice_date.strftime('%Y-%m-%d'),
            'Due Date': due_date.strftime('%Y-%m-%d'),
            'Status': status,
            'Days Outstanding': days_outstanding
        })
    
    payments_df = pd.DataFrame(payment_data)
    payments_df.to_excel(writer, sheet_name='Payments', index=False)
    
    # Save the Excel file
    writer.close()
    
    return output_path
