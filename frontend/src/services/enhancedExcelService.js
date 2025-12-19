import * as XLSX from "xlsx"
// Remove the incorrect import
// import { getUserId } from "./authService"

// Helper function to read file as ArrayBuffer
const readFileAsArrayBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = (e) => reject(new Error("Error reading file"))
    reader.readAsArrayBuffer(file)
  })
}

// Process Excel file and extract data
const processExcelFile = async (file) => {
  try {
    console.log("Processing Excel file in enhanced service...")

    // Read the file as ArrayBuffer
    const arrayBuffer = await readFileAsArrayBuffer(file)

    // Parse the Excel file
    const workbook = XLSX.read(arrayBuffer, { type: "array" })

    // Log all sheet names for debugging
    console.log("Available sheets:", workbook.SheetNames)

    // Extract all types of data
    const cashFlowData = extractCashFlowData(workbook)
    const revenueExpensesData = extractRevenueExpensesData(workbook)
    const projectData = extractProjectData(workbook)
    const paymentStatusData = extractPaymentStatusData(workbook)

    // Store the upload time
    const userId = localStorage.getItem("user_id") || "default_user"
    localStorage.setItem(`uploadTime_${userId}`, new Date().toISOString())

    // Generate notifications based on the extracted data
    const notifications = generateNotificationsFromExcelData()
    localStorage.setItem(`notificationData_${userId}`, JSON.stringify(notifications))
    console.log("Generated notifications from Excel data:", notifications)

    // Return all extracted data
    return {
      cashFlowData,
      revenueExpensesData,
      projectData,
      paymentStatusData,
    }
  } catch (error) {
    console.error("Error processing Excel file:", error)
    throw new Error(`Failed to process Excel file: ${error.message}`)
  }
}

// Updated function to extract cash flow data to match your Excel structure
function extractCashFlowData(workbook) {
  // Try to find the cash flow sheet - look for exact column headers
  const exactHeaders = ["Month/Year", "Total Inflows", "Total Outflows", "Net Cash Flow", "Cumulative Cash Flow"]
  const sheetName =
    findSheetByExactHeaders(workbook, exactHeaders) ||
    findSheetByKeywords(workbook, ["cash flow", "inflow", "outflow"]) ||
    workbook.SheetNames[0]

  console.log("Using sheet for Cash Flow data:", sheetName)

  const sheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 })

  console.log("Cash Flow Sheet Data (first few rows):", data.slice(0, 3))

  // Process the data to extract months, inflows, outflows, and net flow
  const months = []
  const inflows = []
  const outflows = []
  const net_flow = []

  // Find header row first
  let headerRowIndex = -1
  for (let i = 0; i < Math.min(10, data.length); i++) {
    const row = data[i] || []
    if (row.length >= 4) {
      const potentialHeaders = row.map((h) => String(h || "").toLowerCase())
      if (potentialHeaders.some((h) => h.includes("month") || h.includes("inflow") || h.includes("outflow"))) {
        headerRowIndex = i
        break
      }
    }
  }

  // If header row found, start extracting from the next row
  const startRow = headerRowIndex >= 0 ? headerRowIndex + 1 : 1

  // Skip header row
  for (let i = startRow; i < data.length; i++) {
    const row = data[i]
    if (row && row.length >= 4) {
      // Extract month/year (could be in column 0)
      const monthYear = row[0]
      if (monthYear && typeof monthYear === "string") {
        months.push(monthYear)

        // Try to get values from the correct columns
        // If the header row was found, use the column indices from there
        const inflowValue = Number.parseFloat(row[1]) || 0
        const outflowValue = Number.parseFloat(row[2]) || 0
        const netFlowValue = Number.parseFloat(row[3]) || 0

        inflows.push(inflowValue)
        outflows.push(outflowValue)
        net_flow.push(netFlowValue)
      }
    }
  }

  console.log("Extracted Cash Flow Data:", {
    months: months.slice(0, 3) + "...",
    inflows: inflows.slice(0, 3) + "...",
    outflows: outflows.slice(0, 3) + "...",
    net_flow: net_flow.slice(0, 3) + "...",
  })

  // Store the extracted data in localStorage
  const userId = localStorage.getItem("user_id") || "default_user"
  localStorage.setItem(`cashFlowData_${userId}`, JSON.stringify({ months, inflows, outflows, net_flow }))

  return { months, inflows, outflows, net_flow }
}

// Updated function to extract revenue and expenses data to match your Excel structure
function extractRevenueExpensesData(workbook) {
  // Try to find the revenue and expenses sheet - look for exact column headers
  const exactHeaders = ["Category", "Subcategory", "Amount", "Month/Year", "Notes"]
  const sheetName =
    findSheetByExactHeaders(workbook, exactHeaders) ||
    findSheetByKeywords(workbook, ["revenue", "expense", "category", "subcategory"]) ||
    (workbook.SheetNames.length > 1 ? workbook.SheetNames[1] : workbook.SheetNames[0])

  console.log("Using sheet for Revenue/Expenses data:", sheetName)

  const sheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(sheet)

  console.log("Revenue/Expense Sheet Data (sample):", data.slice(0, 3))

  // Process the data to extract revenue and expense categories
  const revenue_categories = []
  const revenue_amounts = []
  const expense_categories = []
  const expense_amounts = []

  // Group by subcategory
  const revenueBySubcategory = {}
  const expenseBySubcategory = {}

  data.forEach((row) => {
    // Check for different possible column names
    const category = row.Category || row["category"] || ""
    const subcategory = row.Subcategory || row["subcategory"] || ""
    const amount = Number.parseFloat(row.Amount || row["amount"]) || 0

    // Normalize category name to handle case differences
    const categoryLower = String(category).toLowerCase()

    if (categoryLower.includes("revenue")) {
      if (!revenueBySubcategory[subcategory]) {
        revenueBySubcategory[subcategory] = 0
      }
      revenueBySubcategory[subcategory] += amount
    } else if (categoryLower.includes("expense")) {
      if (!expenseBySubcategory[subcategory]) {
        expenseBySubcategory[subcategory] = 0
      }
      expenseBySubcategory[subcategory] += amount
    }
  })

  // Convert to arrays
  for (const [subcategory, amount] of Object.entries(revenueBySubcategory)) {
    if (subcategory) {
      revenue_categories.push(subcategory)
      revenue_amounts.push(amount)
    }
  }

  for (const [subcategory, amount] of Object.entries(expenseBySubcategory)) {
    if (subcategory) {
      expense_categories.push(subcategory)
      expense_amounts.push(amount)
    }
  }

  console.log("Extracted Revenue/Expense Data:", {
    revenue_categories,
    revenue_amounts,
    expense_categories,
    expense_amounts,
  })

  // Store the extracted data in localStorage
  const userId = localStorage.getItem("user_id") || "default_user"
  localStorage.setItem(
    `revenueExpensesData_${userId}`,
    JSON.stringify({
      revenue_categories,
      revenue_amounts,
      expense_categories,
      expense_amounts,
    }),
  )

  return { revenue_categories, revenue_amounts, expense_categories, expense_amounts }
}

// Updated function to extract project data to match your Excel structure
function extractProjectData(workbook) {
  // Try to find the project sheet - look for exact column headers
  const exactHeaders = [
    "Project ID",
    "Project Name",
    "Start Date",
    "End Date",
    "Total Revenue",
    "Total Costs",
    "Profit Margin",
    "Status",
  ]
  const sheetName =
    findSheetByExactHeaders(workbook, exactHeaders) ||
    findSheetByKeywords(workbook, ["project", "profit", "margin", "Project ID"]) ||
    (workbook.SheetNames.length > 2 ? workbook.SheetNames[2] : workbook.SheetNames[0])

  console.log("Using sheet for Project data:", sheetName)

  const sheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(sheet)

  console.log("Project Sheet Data (sample):", data.slice(0, 2))

  // Process the data to extract project information
  const project_names = []
  const profit_margins = []
  const total_revenue = []
  const total_costs = []
  const status = []

  data.forEach((row) => {
    // Check for different possible column names with exact matches
    const projectName = row["Project Name"] || ""
    const profitMargin = Number.parseFloat(row["Profit Margin"] || 0)
    const revenue = Number.parseFloat(row["Total Revenue"] || 0)
    const costs = Number.parseFloat(row["Total Costs"] || 0)
    const projectStatus = row["Status"] || ""

    if (projectName) {
      project_names.push(projectName)
      profit_margins.push(profitMargin)
      total_revenue.push(revenue)
      total_costs.push(costs)
      status.push(projectStatus)
    }
  })

  console.log("Extracted Project Data:", {
    project_names,
    profit_margins: profit_margins.map((p) => p.toFixed(2)),
    total_revenue: total_revenue.map((r) => r.toFixed(2)),
    total_costs: total_costs.map((c) => c.toFixed(2)),
    status,
  })

  // Store the extracted data in localStorage
  const userId = localStorage.getItem("user_id") || "default_user"
  localStorage.setItem(
    `projectProfitabilityData_${userId}`,
    JSON.stringify({
      project_names,
      profit_margins,
      total_revenue,
      total_costs,
      status,
    }),
  )

  return { project_names, profit_margins, total_revenue, total_costs, status }
}

// Updated function to extract payment status data to match your Excel structure
function extractPaymentStatusData(workbook) {
  // Try to find the invoice sheet - look for exact column headers
  const exactHeaders = [
    "Invoice ID",
    "Client Name",
    "Project ID",
    "Amount",
    "Invoice Date",
    "Due Date",
    "Status",
    "Days Outstanding",
  ]
  const sheetName =
    findSheetByExactHeaders(workbook, exactHeaders) ||
    findSheetByKeywords(workbook, ["invoice", "status", "Invoice ID", "Due Date"]) ||
    (workbook.SheetNames.length > 3 ? workbook.SheetNames[3] : workbook.SheetNames[0])

  console.log("Using sheet for Invoice data:", sheetName)

  const sheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(sheet)

  console.log("Invoice Sheet Data (sample):", data.slice(0, 2))

  // Count invoices by status
  const statusCounts = {
    Paid: 0,
    Pending: 0,
    Overdue: 0,
  }

  // Raw data for debugging
  const raw_data = []

  // Get today's date for overdue calculation
  const today = new Date()

  data.forEach((row) => {
    // Extract invoice data with exact column names
    const invoiceId = row["Invoice ID"] || ""
    const amount = Number.parseFloat(row["Amount"] || 0)
    const status = row["Status"] || ""
    const daysOutstanding = Number.parseInt(row["Days Outstanding"] || 0)
    const dueDate = row["Due Date"] ? new Date(row["Due Date"]) : null

    // Determine status based on available information
    let normalizedStatus = "Pending" // Default

    // Normalize the status value to handle case differences
    const statusLower = String(status).toLowerCase().trim()

    if (statusLower === "paid") {
      normalizedStatus = "Paid"
      statusCounts.Paid++
    } else if (statusLower === "due" || statusLower === "overdue") {
      normalizedStatus = "Overdue"
      statusCounts.Overdue++
    } else if (statusLower === "pending") {
      normalizedStatus = "Pending"
      statusCounts.Pending++
    } else if (dueDate && dueDate < today) {
      // If due date exists and is in the past
      normalizedStatus = "Overdue"
      statusCounts.Overdue++
    } else if (daysOutstanding > 30) {
      // If days outstanding is more than 30
      normalizedStatus = "Overdue"
      statusCounts.Overdue++
    } else {
      // Default case
      statusCounts.Pending++
    }

    // Add to raw data for debugging
    raw_data.push({
      invoice_id: invoiceId,
      original_status: status,
      normalized_status: normalizedStatus,
      amount: amount,
      due_date: dueDate ? dueDate.toISOString() : null,
      days_outstanding: daysOutstanding,
    })
  })

  const result = {
    labels: Object.keys(statusCounts),
    values: Object.values(statusCounts),
    raw_data: raw_data,
  }

  console.log("Extracted Payment Status Data:", {
    labels: result.labels,
    values: result.values,
    raw_data_count: raw_data.length,
  })

  // Store the extracted data in localStorage
  const userId = localStorage.getItem("user_id") || "default_user"
  localStorage.setItem(`paymentStatusData_${userId}`, JSON.stringify(result))

  return result
}

// New helper function to find a sheet by exact headers
function findSheetByExactHeaders(workbook, headers) {
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 })

    // Check if any row in the first few rows matches the headers
    for (let i = 0; i < Math.min(5, data.length); i++) {
      const row = data[i] || []

      // Convert all values to strings for comparison
      const rowHeaders = row.map((h) => String(h || "").trim())

      // Check if this row contains all the required headers
      const hasAllHeaders = headers.every((header) => rowHeaders.some((h) => h === header))

      if (hasAllHeaders) {
        console.log(`Found sheet "${sheetName}" with exact headers: ${headers}`)
        return sheetName
      }
    }
  }

  return null
}

// Updated function to find a sheet by keywords
function findSheetByKeywords(workbook, keywords) {
  // Try to find a sheet that contains any of the keywords
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 })

    // Check if any of the keywords are in the first few rows
    let foundKeywords = false
    for (let i = 0; i < Math.min(5, data.length); i++) {
      const row = data[i] || []
      const rowValues = row.map((cell) => String(cell || "").toLowerCase())

      if (keywords.some((keyword) => rowValues.some((cell) => cell.includes(keyword.toLowerCase())))) {
        foundKeywords = true
        break
      }
    }

    if (foundKeywords) {
      console.log(`Found sheet "${sheetName}" matching keywords: ${keywords}`)
      return sheetName
    }
  }

  console.log(`No sheet found matching keywords: ${keywords}, using first sheet`)
  return null
}

// Get the stored Excel data
const getStoredExcelData = () => {
  try {
    const userId = localStorage.getItem("user_id") || "default_user"

    // Get all stored data
    const cashFlowData = localStorage.getItem(`cashFlowData_${userId}`)
    const revenueExpensesData = localStorage.getItem(`revenueExpensesData_${userId}`)
    const projectProfitabilityData = localStorage.getItem(`projectProfitabilityData_${userId}`)
    const paymentStatusData = localStorage.getItem(`paymentStatusData_${userId}`)

    return {
      cashFlowData: cashFlowData ? JSON.parse(cashFlowData) : null,
      revenueExpensesData: revenueExpensesData ? JSON.parse(revenueExpensesData) : null,
      projectProfitabilityData: projectProfitabilityData ? JSON.parse(projectProfitabilityData) : null,
      paymentStatusData: paymentStatusData ? JSON.parse(paymentStatusData) : null,
    }
  } catch (error) {
    console.error("Error retrieving stored Excel data:", error)
    return null
  }
}

// Clear the stored Excel data
const clearStoredExcelData = () => {
  try {
    const userId = localStorage.getItem("user_id") || "default_user"
    localStorage.removeItem(`cashFlowData_${userId}`)
    localStorage.removeItem(`revenueExpensesData_${userId}`)
    localStorage.removeItem(`projectProfitabilityData_${userId}`)
    localStorage.removeItem(`paymentStatusData_${userId}`)
  } catch (error) {
    console.error("Error clearing stored Excel data:", error)
  }
}

// Analyze Excel structure for debugging
const analyzeExcelStructure = async (file) => {
  try {
    // Read the file as ArrayBuffer
    const arrayBuffer = await readFileAsArrayBuffer(file)

    // Parse the Excel file
    const workbook = XLSX.read(arrayBuffer, { type: "array" })

    // Get sheet names
    const sheetNames = workbook.SheetNames

    // Analyze each sheet
    const sheetAnalysis = sheetNames.map((sheetName) => {
      const worksheet = workbook.Sheets[sheetName]
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      // Get column headers (first row)
      const headers = data[0] || []

      // Count rows
      const rowCount = data.length

      return {
        sheetName,
        rowCount,
        headers,
        sampleRows: data.slice(1, 4), // Get a few sample rows
      }
    })

    console.log("Excel Structure Analysis:", sheetAnalysis)
    return sheetAnalysis
  } catch (error) {
    console.error("Error analyzing Excel structure:", error)
    throw new Error(`Failed to analyze Excel structure: ${error.message}`)
  }
}

// Log Excel data for debugging
const logExcelData = async (file) => {
  try {
    // Read the file as ArrayBuffer
    const arrayBuffer = await readFileAsArrayBuffer(file)

    // Parse the Excel file
    const workbook = XLSX.read(arrayBuffer, { type: "array" })

    // Extract data from the first sheet
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

    console.log("Raw Excel Data:", data)
    return data
  } catch (error) {
    console.error("Error logging Excel data:", error)
    throw new Error(`Failed to log Excel data: ${error.message}`)
  }
}

// Add a function to check data source
function checkDataSource() {
  const userId = localStorage.getItem("user_id") || "default_user"
  const fileId = localStorage.getItem(`uploadedFileId_${userId}`)
  const uploadDate = localStorage.getItem(`uploadTime_${userId}`)

  // Check if chart data exists in localStorage
  const cashFlowData = localStorage.getItem(`cashFlowData_${userId}`)
  const revenueExpensesData = localStorage.getItem(`revenueExpensesData_${userId}`)
  const projectProfitabilityData = localStorage.getItem(`projectProfitabilityData_${userId}`)
  const paymentStatusData = localStorage.getItem(`paymentStatusData_${userId}`)

  // Safely parse the payment status data
  let paymentStatusSample = null
  if (paymentStatusData) {
    try {
      const parsedData = JSON.parse(paymentStatusData)
      paymentStatusSample = {
        labels: parsedData.labels,
        values: parsedData.values,
        rawDataCount: parsedData.raw_data ? parsedData.raw_data.length : 0,
        rawDataSample: parsedData.raw_data ? parsedData.raw_data.slice(0, 2) : [],
      }
    } catch (error) {
      console.error("Error parsing payment status data:", error)
      paymentStatusSample = { error: "Could not parse data" }
    }
  }

  return {
    isUsingRealData: !!(cashFlowData || revenueExpensesData || projectProfitabilityData || paymentStatusData),
    fileId,
    uploadDate,
    hasCashFlowData: !!cashFlowData,
    hasRevenueExpensesData: !!revenueExpensesData,
    hasProjectProfitabilityData: !!projectProfitabilityData,
    hasPaymentStatusData: !!paymentStatusData,
    // Add sample of payment status data to verify content
    paymentStatusSample,
  }
}

// Generate fallback data functions
function generateFallbackPaymentData() {
  return { labels: ["Paid", "Pending", "Overdue"], values: [5, 3, 2], raw_data: [] }
}

function generateFallbackCashFlowData() {
  return {
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    inflows: [1000, 1200, 900, 1500, 1300, 1700],
    outflows: [800, 950, 1100, 1000, 1200, 1300],
    net_flow: [200, 250, -200, 500, 100, 400],
  }
}

function generateFallbackRevenueExpensesData() {
  return {
    revenue_categories: ["Sales", "Services", "Subscriptions"],
    revenue_amounts: [5000, 3000, 2000],
    expense_categories: ["Salaries", "Rent", "Marketing"],
    expense_amounts: [4000, 1500, 1000],
  }
}

function generateFallbackProjectData() {
  return {
    project_names: ["Project A", "Project B", "Project C"],
    profit_margins: [15, 20, 10],
    total_revenue: [10000, 15000, 8000],
    total_costs: [8500, 12000, 7200],
    status: ["Completed", "In Progress", "Completed"],
  }
}

function generateFallbackScenarioData() {
  return [
    {
      id: 1,
      name: "Delayed Payment",
      description: "Impact of clients delaying payments by 30 days",
      parameters: {
        scenario_type: "payment_delay",
        delay_days: 30,
      },
    },
    {
      id: 2,
      name: "Cost Reduction",
      description: "Impact of reducing operational costs by 10%",
      parameters: {
        scenario_type: "cost_reduction",
        reduction_percentage: 10,
      },
    },
    {
      id: 3,
      name: "Revenue Increase",
      description: "Impact of increasing revenue by 15%",
      parameters: {
        scenario_type: "revenue_increase",
        increase_percentage: 15,
      },
    },
  ]
}

function generateFallbackNotificationData() {
  return [
    {
      id: 1,
      message: "Invoice #1234 is due tomorrow",
      status: "pending",
      created_at: "2023-05-15T10:30:00Z",
    },
    {
      id: 2,
      message: "Project 'Office Tower' is 90% complete",
      status: "pending",
      created_at: "2023-05-14T14:45:00Z",
    },
    {
      id: 3,
      message: "Cash flow forecast updated",
      status: "read",
      created_at: "2023-05-13T09:15:00Z",
    },
  ]
}

function generateNotificationsFromExcelData() {
  const userId = localStorage.getItem("user_id") || "default_user"
  const notifications = []
  let notificationId = 1

  try {
    // Check for invoice data
    const paymentStatusDataStr = localStorage.getItem(`paymentStatusData_${userId}`)
    if (paymentStatusDataStr) {
      const paymentStatusData = JSON.parse(paymentStatusDataStr)

      // Generate notifications from invoice data
      if (paymentStatusData.raw_data && paymentStatusData.raw_data.length > 0) {
        // Get today's date
        const today = new Date()

        // Process each invoice
        paymentStatusData.raw_data.forEach((invoice) => {
          // Check for due invoices
          if (invoice.normalized_status === "Pending" || invoice.normalized_status === "Overdue") {
            let dueDate = null
            if (invoice.due_date) {
              dueDate = new Date(invoice.due_date)
            }

            // Create notification for invoices due soon or overdue
            if (dueDate) {
              const daysDiff = Math.round((dueDate - today) / (1000 * 60 * 60 * 24))

              if (daysDiff <= 0) {
                // Overdue invoice
                notifications.push({
                  id: notificationId++,
                  message: `Invoice #${invoice.invoice_id || "Unknown"} is overdue by ${Math.abs(daysDiff)} days`,
                  status: "pending",
                  created_at: new Date().toISOString(),
                  type: "invoice",
                  amount: invoice.amount,
                })
              } else if (daysDiff <= 7) {
                // Due soon
                const dueText = daysDiff === 1 ? "tomorrow" : `in ${daysDiff} days`
                notifications.push({
                  id: notificationId++,
                  message: `Invoice #${invoice.invoice_id || "Unknown"} is due ${dueText}`,
                  status: "pending",
                  created_at: new Date().toISOString(),
                  type: "invoice",
                  amount: invoice.amount,
                })
              }
            }
          }
        })
      }
    }

    // Check for project data
    const projectDataStr = localStorage.getItem(`projectProfitabilityData_${userId}`)
    if (projectDataStr) {
      const projectData = JSON.parse(projectDataStr)

      // Generate notifications from project data
      if (projectData.project_names && projectData.project_names.length > 0) {
        projectData.project_names.forEach((name, index) => {
          const status = projectData.status[index]

          // Create notification for in-progress projects
          if (status && status.toLowerCase().includes("progress")) {
            // Generate a random completion percentage between 75-95% for in-progress projects
            const completionPct = Math.floor(Math.random() * 21) + 75

            notifications.push({
              id: notificationId++,
              message: `Project '${name}' is ${completionPct}% complete`,
              status: "pending",
              created_at: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(), // Random time in last 3 days
              type: "project",
              projectName: name,
            })
          }
        })
      }
    }

    // Add a notification about cash flow if we have that data
    const cashFlowDataStr = localStorage.getItem(`cashFlowData_${userId}`)
    if (cashFlowDataStr) {
      notifications.push({
        id: notificationId++,
        message: "Cash flow forecast updated",
        status: "read",
        created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        type: "system",
      })
    }

    // Sort notifications by date (newest first)
    notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    return notifications
  } catch (error) {
    console.error("Error generating notifications from Excel data:", error)
    return generateFallbackNotificationData() // Fallback to sample data if there's an error
  }
}

// Export as a named export to maintain compatibility with existing code
export const enhancedExcelService = {
  processExcelFile,
  getStoredExcelData,
  clearStoredExcelData,
  analyzeExcelStructure,
  logExcelData,
  checkDataSource,
  // Data retrieval methods
  getPaymentStatusData: (fileId) => {
    const userId = localStorage.getItem("user_id") || "default_user"
    const data = localStorage.getItem(`paymentStatusData_${userId}`)

    if (data) {
      return JSON.parse(data)
    } else {
      // Return fallback data if nothing is found
      return generateFallbackPaymentData()
    }
  },

  getCashFlowData: (fileId) => {
    const userId = localStorage.getItem("user_id") || "default_user"
    const data = localStorage.getItem(`cashFlowData_${userId}`)

    if (data) {
      return JSON.parse(data)
    } else {
      // Return fallback data if nothing is found
      return generateFallbackCashFlowData()
    }
  },

  getRevenueExpensesData: (fileId) => {
    const userId = localStorage.getItem("user_id") || "default_user"
    const data = localStorage.getItem(`revenueExpensesData_${userId}`)

    if (data) {
      return JSON.parse(data)
    } else {
      return generateFallbackRevenueExpensesData()
    }
  },

  getProjectProfitabilityData: (fileId) => {
    const userId = localStorage.getItem("user_id") || "default_user"
    const data = localStorage.getItem(`projectProfitabilityData_${userId}`)

    if (data) {
      return JSON.parse(data)
    } else {
      return generateFallbackProjectData()
    }
  },

  getScenarioData: (fileId) => {
    const userId = localStorage.getItem("user_id") || "default_user"
    const data = localStorage.getItem(`scenarioData_${userId}`)

    if (data) {
      return JSON.parse(data)
    } else {
      return generateFallbackScenarioData()
    }
  },

  getNotificationData: () => {
    const userId = localStorage.getItem("user_id") || "default_user"
    const data = localStorage.getItem(`notificationData_${userId}`)

    if (data) {
      return JSON.parse(data)
    } else {
      // Generate notifications from Excel data instead of using fallback
      const notifications = generateNotificationsFromExcelData()

      // Store the generated notifications
      localStorage.setItem(`notificationData_${userId}`, JSON.stringify(notifications))

      return notifications
    }
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

  simulateScenario: (scenarioType, parameters, description) => {
    // This is just a wrapper to ensure the scenarioService can call this method
    // The actual implementation is in scenarioService.js
    console.log("Scenario simulation requested in enhancedExcelService:", { scenarioType, parameters, description })
    return null
  },
}
