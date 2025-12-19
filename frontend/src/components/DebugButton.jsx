"use client"

import { useState } from "react"
import { enhancedExcelService } from "../services/enhancedExcelService"

const DebugButton = ({ onClick, children }) => {
  const [showDetails, setShowDetails] = useState(false)

  const handleClick = () => {
    console.log("Debug Button Clicked")

    // Check data source
    const dataSourceInfo = enhancedExcelService.checkDataSource()
    console.log("Data Source Information:", dataSourceInfo)

    // If we have real data, show it
    if (dataSourceInfo.isUsingRealData) {
      console.log("Dashboard is using REAL DATA from uploaded Excel file")
      console.log("File ID:", dataSourceInfo.fileId)
      console.log("Upload Date:", dataSourceInfo.uploadDate)

      // Log all the data being used for charts
      const userId = localStorage.getItem("user_id") || "default_user"

      console.log("--- DETAILED DATA INSPECTION ---")

      // Cash Flow Data
      const cashFlowData = localStorage.getItem(`cashFlowData_${userId}`)
      if (cashFlowData) {
        console.log("Cash Flow Data:", JSON.parse(cashFlowData))
      } else {
        console.log("No Cash Flow Data found")
      }

      // Revenue/Expenses Data
      const revenueExpensesData = localStorage.getItem(`revenueExpensesData_${userId}`)
      if (revenueExpensesData) {
        console.log("Revenue/Expenses Data:", JSON.parse(revenueExpensesData))
      } else {
        console.log("No Revenue/Expenses Data found")
      }

      // Project Profitability Data
      const projectProfitabilityData = localStorage.getItem(`projectProfitabilityData_${userId}`)
      if (projectProfitabilityData) {
        console.log("Project Profitability Data:", JSON.parse(projectProfitabilityData))
      } else {
        console.log("No Project Profitability Data found")
      }

      // Payment Status Data
      const paymentStatusData = localStorage.getItem(`paymentStatusData_${userId}`)
      if (paymentStatusData) {
        console.log("Payment Status Data:", JSON.parse(paymentStatusData))
      } else {
        console.log("No Payment Status Data found")
      }
    } else {
      console.log("Dashboard is using FALLBACK/DUMMY DATA")
    }

    // Toggle details panel
    setShowDetails(!showDetails)

    // Call the original onClick handler if provided
    if (onClick) {
      onClick()
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm py-1 px-3 rounded-md"
      >
        {children || "Debug"}
      </button>

      {showDetails && (
        <div className="absolute right-0 mt-2 p-4 bg-white border border-gray-200 rounded-md shadow-lg z-50 w-80">
          <h3 className="font-medium text-gray-800 mb-2">Data Source Info</h3>
          <DataSourceInfo />
          <div className="mt-2 text-xs text-gray-500">Check console for detailed data logs (F12)</div>
          <button onClick={() => setShowDetails(false)} className="mt-2 text-xs text-blue-600 hover:text-blue-800">
            Close
          </button>
        </div>
      )}
    </div>
  )
}

// Component to display data source information
const DataSourceInfo = () => {
  const userId = localStorage.getItem("user_id") || "default_user"
  const fileId = localStorage.getItem(`uploadedFileId_${userId}`)
  const uploadDate = localStorage.getItem(`uploadedFileDate_${userId}`)

  // Check if data exists
  const hasCashFlowData = !!localStorage.getItem(`cashFlowData_${userId}`)
  const hasRevenueData = !!localStorage.getItem(`revenueExpensesData_${userId}`)
  const hasProjectData = !!localStorage.getItem(`projectProfitabilityData_${userId}`)
  const hasPaymentData = !!localStorage.getItem(`paymentStatusData_${userId}`)

  const isUsingRealData = hasCashFlowData || hasRevenueData || hasProjectData || hasPaymentData

  return (
    <div className="text-xs">
      <div className="flex justify-between mb-1">
        <span className="font-medium">Using Real Data:</span>
        <span className={isUsingRealData ? "text-green-600" : "text-red-600"}>{isUsingRealData ? "Yes" : "No"}</span>
      </div>

      {fileId && (
        <div className="flex justify-between mb-1">
          <span className="font-medium">File ID:</span>
          <span className="text-gray-600">{fileId.substring(0, 10)}...</span>
        </div>
      )}

      {uploadDate && (
        <div className="flex justify-between mb-1">
          <span className="font-medium">Upload Date:</span>
          <span className="text-gray-600">{new Date(uploadDate).toLocaleString()}</span>
        </div>
      )}

      <div className="mt-2 font-medium">Data Available:</div>
      <div className="grid grid-cols-2 gap-1 mt-1">
        <div
          className={`px-2 py-1 rounded ${hasCashFlowData ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}
        >
          Cash Flow
        </div>
        <div
          className={`px-2 py-1 rounded ${hasRevenueData ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}
        >
          Revenue/Expenses
        </div>
        <div
          className={`px-2 py-1 rounded ${hasProjectData ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}
        >
          Projects
        </div>
        <div
          className={`px-2 py-1 rounded ${hasPaymentData ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}
        >
          Payments
        </div>
      </div>
    </div>
  )
}

export default DebugButton
