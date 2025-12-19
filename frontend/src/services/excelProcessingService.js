import * as XLSX from "xlsx"

export const excelProcessingService = {
  // Process the uploaded Excel file and extract all necessary data
  processExcelFile: async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: "array" })

          // Extract data from different sheets
          const cashFlowData = extractCashFlowData(workbook)
          const revenueExpensesData = extractRevenueExpensesData(workbook)
          const projectProfitabilityData = extractProjectData(workbook)
          const paymentStatusData = extractInvoiceData(workbook)

          // Get the current user ID
          const userId = localStorage.getItem("user_id") || "default_user"

          // Store the processed data in localStorage for this user
          localStorage.setItem(`cashFlowData_${userId}`, JSON.stringify(cashFlowData))
          localStorage.setItem(`revenueExpensesData_${userId}`, JSON.stringify(revenueExpensesData))
          localStorage.setItem(`projectProfitabilityData_${userId}`, JSON.stringify(projectProfitabilityData))
          localStorage.setItem(`paymentStatusData_${userId}`, JSON.stringify(paymentStatusData))

          // Generate a unique file ID
          const fileId = `excel_${Date.now()}`
          localStorage.setItem(`uploadedFileId_${userId}`, fileId)
          localStorage.setItem(`uploadedFileDate_${userId}`, new Date().toISOString())

          resolve({
            success: true,
            file_id: fileId,
            message: "Excel file processed successfully",
          })
        } catch (error) {
          console.error("Error processing Excel file:", error)
          reject(new Error("Failed to process Excel file. Please check the format."))
        }
      }

      reader.onerror = () => {
        reject(new Error("Error reading the file."))
      }

      reader.readAsArrayBuffer(file)
    })
  },

  // Get processed data from localStorage
  getCashFlowData: (fileId) => {
    const userId = localStorage.getItem("user_id") || "default_user"
    const data = localStorage.getItem(`cashFlowData_${userId}`)
    return data ? JSON.parse(data) : null
  },

  getRevenueExpensesData: (fileId) => {
    const userId = localStorage.getItem("user_id") || "default_user"
    const data = localStorage.getItem(`revenueExpensesData_${userId}`)
    return data ? JSON.parse(data) : null
  },

  getProjectProfitabilityData: (fileId) => {
    const userId = localStorage.getItem("user_id") || "default_user"
    const data = localStorage.getItem(`projectProfitabilityData_${userId}`)
    return data ? JSON.parse(data) : null
  },

  getPaymentStatusData: (fileId) => {
    const userId = localStorage.getItem("user_id") || "default_user"
    const data = localStorage.getItem(`paymentStatusData_${userId}`)
    return data ? JSON.parse(data) : null
  },

  // Generate a sample Excel template
  generateTemplate: () => {
    // Create a new workbook
    const wb = XLSX.utils.book_new()

    // Cash Flow Sheet
    const cashFlowData = [
      ["Month/Year", "Total Inflows", "Total Outflows", "Net Cash Flow", "Cumulative Cash Flow"],
      ["Jan 2023", 83973.71322, 69316.27476, 14657.43847, 14657.43847],
      ["Feb 2023", 83824.75344, 61191.24019, 22633.51325, 37290.95172],
      ["Mar 2023", 95829.19684, 65943.50287, 29885.69398, 67176.6457],
      ["Apr 2023", 109468.7836, 77117.62256, 32351.16108, 99527.80677],
      ["May 2023", 97658.46625, 78112.74838, 19545.71787, 119073.5246],
      ["Jun 2023", 102541.5629, 91493.72595, 11047.83613, 130121.3606],
      ["Jul 2023", 115792.1282, 78825.43629, 36966.69187, 167088.0525],
      ["Aug 2023", 118441.7828, 82935.96831, 35505.81371, 202593.8662],
      ["Sep 2023", 109601.0446, 109211.3734, 389.6711888, 202983.5374],
      ["Oct 2023", 126510.7205, 100157.6654, 26353.05514, 229336.5925],
      ["Nov 2023", 119207.2788, 106823.9897, 12383.2891, 241719.8816],
      ["Dec 2023", 104876.9727, 82842.88357, 22034.08914, 263753.9708],
    ]

    const cashFlowWS = XLSX.utils.aoa_to_sheet(cashFlowData)
    XLSX.utils.book_append_sheet(wb, cashFlowWS, "Cash Flow")

    // Revenue and Expenses Sheet
    const revenueExpensesData = [
      ["Category", "Subcategory", "Amount", "Month/Year", "Notes"],
      ["Revenue", "Client Payment", 22278.09, "Jan 2023", "Sample Client Payments for Jan 2023"],
      ["Revenue", "Consulting Fees", 25554.61, "Jan 2023", "Sample Consulting Fees for Jan 2023"],
      ["Revenue", "Equipment Rental", 19245.03, "Jan 2023", "Sample Equipment Rental for Jan 2023"],
      ["Revenue", "Material Sales", 26878.49, "Jan 2023", "Sample Material Sales for Jan 2023"],
      ["Expense", "Salaries", 11048.84, "Jan 2023", "Sample Salaries for Jan 2023"],
      ["Expense", "Materials", 11611.56, "Jan 2023", "Sample Materials for Jan 2023"],
      ["Expense", "Equipment", 11046.89, "Jan 2023", "Sample Equipment for Jan 2023"],
      ["Expense", "Rent", 15516.65, "Jan 2023", "Sample Rent for Jan 2023"],
    ]

    const revenueExpensesWS = XLSX.utils.aoa_to_sheet(revenueExpensesData)
    XLSX.utils.book_append_sheet(wb, revenueExpensesWS, "Revenue and Expenses")

    // Projects Sheet
    const projectsData = [
      [
        "Project ID",
        "Project Name",
        "Start Date",
        "End Date",
        "Total Revenue",
        "Total Costs",
        "Profit Margin",
        "Status",
      ],
      ["PROJ-2023-001", "Office Tower", "2023-02-23", "2023-12-09", 507592.43, 350341.33, 0.9798, "Completed"],
      ["PROJ-2023-002", "Highway Expansion", "2023-02-02", "2024-04-01", 1477942, 1043526, 29.39327, "Completed"],
      ["PROJ-2023-003", "Bridge Repair", "2023-05-25", "2023-11-04", 768234.15, 697356.25, 9.83828, "Completed"],
      ["PROJ-2023-004", "School Renovation", "2023-04-29", "2023-07-21", 135246, 91077.38, 32.65813, "In Progress"],
    ]

    const projectsWS = XLSX.utils.aoa_to_sheet(projectsData)
    XLSX.utils.book_append_sheet(wb, projectsWS, "Projects")

    // Invoices Sheet
    const invoicesData = [
      ["Invoice ID", "Client Name", "Project ID", "Amount", "Invoice Date", "Due Date", "Status", "Days Outstanding"],
      ["INV-2023-0001", "Umbrella Corp", "PROJ-2023-003", 30740.18896, "2023-07-11", "2023-08-10", "paid", 17],
      ["INV-2023-0002", "Stark Industries", "PROJ-2023-004", 26147.50313, "2023-02-15", "2023-03-17", "due", 760],
      ["INV-2023-0003", "Globex Corporation", "PROJ-2023-004", 5695.547744, "2023-10-07", "2023-11-06", "paid", 14],
      ["INV-2023-0004", "Acme Corporation", "PROJ-2023-003", 49114.92127, "2023-04-26", "2023-05-26", "paid", 21],
    ]

    const invoicesWS = XLSX.utils.aoa_to_sheet(invoicesData)
    XLSX.utils.book_append_sheet(wb, invoicesWS, "Invoices")

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })

    return blob
  },
}

// Helper functions to extract data from Excel sheets
function extractCashFlowData(workbook) {
  // Try to find a sheet with cash flow data
  const sheetName = findSheetByKeywords(workbook, ["cash flow", "inflow", "outflow"]) || workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 })

  // Process the data to extract months, inflows, outflows, and net flow
  const months = []
  const inflows = []
  const outflows = []
  const net_flow = []

  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const row = data[i]
    if (row.length >= 4) {
      months.push(row[0]) // Month/Year
      inflows.push(Number.parseFloat(row[1]) || 0) // Total Inflows
      outflows.push(Number.parseFloat(row[2]) || 0) // Total Outflows
      net_flow.push(Number.parseFloat(row[3]) || 0) // Net Cash Flow
    }
  }

  return { months, inflows, outflows, net_flow }
}

function extractRevenueExpensesData(workbook) {
  // Try to find a sheet with revenue and expense data
  const sheetName = findSheetByKeywords(workbook, ["revenue", "expense", "category"]) || workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(sheet)

  // Process the data to extract revenue and expense categories
  const revenue_categories = []
  const revenue_amounts = []
  const expense_categories = []
  const expense_amounts = []

  // Group by subcategory
  const revenueBySubcategory = {}
  const expenseBySubcategory = {}

  data.forEach((row) => {
    const category = row.Category || ""
    const subcategory = row.Subcategory || ""
    const amount = Number.parseFloat(row.Amount) || 0

    if (category.toLowerCase() === "revenue") {
      if (!revenueBySubcategory[subcategory]) {
        revenueBySubcategory[subcategory] = 0
      }
      revenueBySubcategory[subcategory] += amount
    } else if (category.toLowerCase() === "expense") {
      if (!expenseBySubcategory[subcategory]) {
        expenseBySubcategory[subcategory] = 0
      }
      expenseBySubcategory[subcategory] += amount
    }
  })

  // Convert to arrays
  for (const [subcategory, amount] of Object.entries(revenueBySubcategory)) {
    revenue_categories.push(subcategory)
    revenue_amounts.push(amount)
  }

  for (const [subcategory, amount] of Object.entries(expenseBySubcategory)) {
    expense_categories.push(subcategory)
    expense_amounts.push(amount)
  }

  return { revenue_categories, revenue_amounts, expense_categories, expense_amounts }
}

function extractProjectData(workbook) {
  // Try to find a sheet with project data
  const sheetName = findSheetByKeywords(workbook, ["project", "profit", "margin"]) || workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(sheet)

  // Process the data to extract project information
  const project_names = []
  const profit_margins = []
  const total_revenue = []
  const total_costs = []
  const status = []

  data.forEach((row) => {
    const projectName = row["Project Name"] || ""
    const profitMargin = Number.parseFloat(row["Profit Margin"]) || 0
    const revenue = Number.parseFloat(row["Total Revenue"]) || 0
    const costs = Number.parseFloat(row["Total Costs"]) || 0
    const projectStatus = row["Status"] || ""

    if (projectName) {
      project_names.push(projectName)
      profit_margins.push(profitMargin)
      total_revenue.push(revenue)
      total_costs.push(costs)
      status.push(projectStatus)
    }
  })

  return { project_names, profit_margins, total_revenue, total_costs, status }
}

function extractInvoiceData(workbook) {
  // Try to find a sheet with invoice data
  const sheetName = findSheetByKeywords(workbook, ["invoice", "payment", "status"]) || workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(sheet)

  // Process the data to extract payment status information
  const statusCounts = {
    Paid: 0,
    Pending: 0,
    Overdue: 0,
  }

  data.forEach((row) => {
    const status = (row["Status"] || "").toLowerCase()

    if (status === "paid") {
      statusCounts["Paid"]++
    } else if (status === "due") {
      // Check if it's overdue based on days outstanding
      const daysOutstanding = Number.parseInt(row["Days Outstanding"] || 0)
      if (daysOutstanding > 30) {
        statusCounts["Overdue"]++
      } else {
        statusCounts["Pending"]++
      }
    }
  })

  // Convert to arrays for the chart
  const labels = Object.keys(statusCounts)
  const values = Object.values(statusCounts)

  return { labels, values }
}

function findSheetByKeywords(workbook, keywords) {
  // Try to find a sheet that contains any of the keywords
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 })

    // Check if any of the keywords are in the first row
    if (data.length > 0) {
      const headerRow = data[0].map((cell) => String(cell).toLowerCase())
      if (keywords.some((keyword) => headerRow.some((cell) => cell.includes(keyword)))) {
        return sheetName
      }
    }
  }

  return null
}
