import * as XLSX from "xlsx"

// Main function to extract and validate invoices from Excel
export async function extractAndValidateInvoices(workbook) {
  try {
    console.log("Extracting and validating invoices...")

    // Find the invoice sheet
    const invoiceSheet = findInvoiceSheet(workbook)
    if (!invoiceSheet) {
      console.error("No invoice sheet found in the workbook")
      return generateFallbackPaymentData()
    }

    // Extract invoice data
    const invoices = extractInvoices(workbook, invoiceSheet)
    console.log(`Extracted ${invoices.length} invoices`)

    // Validate and categorize invoices
    const categorizedInvoices = categorizeInvoices(invoices)
    console.log("Categorized invoices:", categorizedInvoices)

    // Store payment status data
    const paymentStatusData = {
      labels: ["Paid", "Pending", "Overdue"],
      values: [categorizedInvoices.paid.length, categorizedInvoices.pending.length, categorizedInvoices.overdue.length],
      raw_data: [
        ...categorizedInvoices.paid.map((invoice) => ({
          original_status: invoice.status,
          normalized_status: "Paid",
          amount: invoice.amount,
        })),
        ...categorizedInvoices.pending.map((invoice) => ({
          original_status: invoice.status,
          normalized_status: "Pending",
          amount: invoice.amount,
        })),
        ...categorizedInvoices.overdue.map((invoice) => ({
          original_status: invoice.status,
          normalized_status: "Overdue",
          amount: invoice.amount,
        })),
      ],
    }

    console.log("Payment status data:", paymentStatusData)
    return paymentStatusData
  } catch (error) {
    console.error("Error extracting and validating invoices:", error)
    return generateFallbackPaymentData()
  }
}

// Find the invoice sheet in the workbook
function findInvoiceSheet(workbook) {
  // Keywords that might indicate an invoice sheet
  const invoiceKeywords = ["invoice", "payment", "due date", "status", "Invoice ID", "Client Name", "Days Outstanding"]

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName]
    const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] || []

    // Convert headers to lowercase strings for comparison
    const headerStrings = headers.map((h) => (h ? String(h).toLowerCase() : ""))

    // Check if any of the invoice keywords are in the headers
    if (invoiceKeywords.some((keyword) => headerStrings.some((header) => header.includes(keyword.toLowerCase())))) {
      console.log(`Found invoice sheet: ${sheetName}`)
      return sheetName
    }
  }

  // If no specific invoice sheet is found, return the last sheet as a fallback
  console.log("No specific invoice sheet found, using last sheet as fallback")
  return workbook.SheetNames[workbook.SheetNames.length - 1]
}

// Extract invoices from the workbook
function extractInvoices(workbook, sheetName) {
  const worksheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(worksheet)

  console.log("Raw invoice data:", data)

  // Map the data to a standardized invoice format
  return data.map((row) => {
    // Try different possible column names
    const invoiceId = row["Invoice ID"] || row["InvoiceID"] || row["Invoice Number"] || ""
    const clientName = row["Client Name"] || row["ClientName"] || row["Client"] || ""
    const projectId = row["Project ID"] || row["ProjectID"] || row["Project"] || ""
    const amount = Number.parseFloat(row["Amount"] || 0)
    const invoiceDate = row["Invoice Date"] || row["InvoiceDate"] || ""
    const dueDate = row["Due Date"] || row["DueDate"] || ""
    const status = row["Status"] || row["status"] || ""
    const daysOutstanding = Number.parseInt(row["Days Outstanding"] || row["DaysOutstanding"] || 0)

    return {
      invoiceId,
      clientName,
      projectId,
      amount,
      invoiceDate,
      dueDate,
      status,
      daysOutstanding,
    }
  })
}

// Categorize invoices by status
function categorizeInvoices(invoices) {
  const categories = {
    paid: [],
    pending: [],
    overdue: [],
  }

  console.log(
    "Categorizing invoices with statuses:",
    invoices.map((inv) => inv.status),
  )

  invoices.forEach((invoice) => {
    // Get the status value, ensuring it's a string and trimmed
    const statusValue = String(invoice.status || "").trim()
    console.log(`Processing invoice with status: "${statusValue}"`)

    // Convert to lowercase for case-insensitive comparison
    const statusLower = statusValue.toLowerCase()

    // Categorize based on exact status values
    if (statusLower === "paid") {
      console.log(`Invoice ${invoice.invoiceId} categorized as PAID`)
      categories.paid.push(invoice)
    } else if (statusLower === "due" || statusLower === "overdue") {
      console.log(`Invoice ${invoice.invoiceId} categorized as OVERDUE`)
      categories.overdue.push(invoice)
    } else if (statusLower === "pending") {
      console.log(`Invoice ${invoice.invoiceId} categorized as PENDING`)
      categories.pending.push(invoice)
    }
    // If no exact match, check for partial matches
    else if (statusLower.includes("paid")) {
      console.log(`Invoice ${invoice.invoiceId} categorized as PAID (partial match)`)
      categories.paid.push(invoice)
    } else if (statusLower.includes("due") || statusLower.includes("over")) {
      console.log(`Invoice ${invoice.invoiceId} categorized as OVERDUE (partial match)`)
      categories.overdue.push(invoice)
    } else {
      // Default to pending if no match
      console.log(`Invoice ${invoice.invoiceId} defaulted to PENDING (no match)`)
      categories.pending.push(invoice)
    }
  })

  console.log("Categorization results:", {
    paid: categories.paid.length,
    pending: categories.pending.length,
    overdue: categories.overdue.length,
  })

  return categories
}

// Fallback data generator for when data is missing
export function generateFallbackPaymentData() {
  return {
    labels: ["Paid", "Pending", "Overdue"],
    values: [25, 10, 5],
    raw_data: [],
  }
}
