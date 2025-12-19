import * as XLSX from "xlsx"

// Validate Excel file structure
export const validateExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: "array" })

        // Check if workbook has at least one sheet
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          return reject(new Error("Excel file does not contain any sheets"))
        }

        // Log all sheet names for debugging
        console.log("Available sheets:", workbook.SheetNames)

        // Define expected sheet types and their required headers
        const expectedSheets = [
          {
            type: "Cash Flow",
            requiredHeaders: ["Month/Year", "Total Inflows", "Total Outflows", "Net Cash Flow"],
          },
          {
            type: "Revenue and Expenses",
            requiredHeaders: ["Category", "Subcategory", "Amount"],
          },
          {
            type: "Projects",
            requiredHeaders: ["Project Name", "Total Revenue", "Total Costs", "Profit Margin"],
          },
          {
            type: "Invoices",
            requiredHeaders: ["Invoice ID", "Amount", "Status"],
          },
        ]

        // Check if at least one sheet matches each expected type
        const validationResults = expectedSheets.map((expectedSheet) => {
          // Try to find a sheet that contains the required headers
          for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName]
            const jsonData = XLSX.utils.sheet_to_json(sheet)

            if (jsonData.length === 0) continue

            // Get the first row and check if it has the required headers
            const firstRow = jsonData[0]
            const headers = Object.keys(firstRow)

            // Check if all required headers are present
            const hasAllRequiredHeaders = expectedSheet.requiredHeaders.every((header) => {
              return headers.some((h) => h.includes(header))
            })

            if (hasAllRequiredHeaders) {
              return {
                type: expectedSheet.type,
                valid: true,
                sheetName,
              }
            }
          }

          return {
            type: expectedSheet.type,
            valid: false,
            sheetName: null,
          }
        })

        // Check if at least one sheet type is valid
        const hasValidSheet = validationResults.some((result) => result.valid)

        if (!hasValidSheet) {
          return reject(new Error("Excel file does not contain any of the expected data structures"))
        }

        // Return validation results
        resolve({
          valid: true,
          results: validationResults,
        })
      } catch (error) {
        console.error("Error validating Excel file:", error)
        reject(new Error("Failed to validate Excel file: " + error.message))
      }
    }

    reader.onerror = () => {
      reject(new Error("Error reading the file."))
    }

    reader.readAsArrayBuffer(file)
  })
}
