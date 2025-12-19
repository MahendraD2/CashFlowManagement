"use client"

import { useState } from "react"
import { enhancedExcelService } from "../services/enhancedExcelService"

export function ScenarioVerification() {
  const [verificationData, setVerificationData] = useState(null)
  const [loading, setLoading] = useState(false)

  const verifyData = () => {
    setLoading(true)
    try {
      const userId = localStorage.getItem("user_id") || "default_user"
      const fileId = localStorage.getItem(`uploadedFileId_${userId}`)

      if (!fileId) {
        setVerificationData({ error: "No uploaded file found" })
        setLoading(false)
        return
      }

      // Get data from the services
      const cashFlowData = enhancedExcelService.getCashFlowData(fileId)
      const revenueExpensesData = enhancedExcelService.getRevenueExpensesData(fileId)
      const projectData = enhancedExcelService.getProjectProfitabilityData(fileId)

      // Prepare verification data
      const verification = {
        cashFlow: {
          hasData: !!cashFlowData && !!cashFlowData.months && cashFlowData.months.length > 0,
          monthsCount: cashFlowData?.months?.length || 0,
          sampleMonths: cashFlowData?.months?.slice(0, 3) || [],
          totalInflows: cashFlowData?.inflows?.reduce((sum, val) => sum + val, 0) || 0,
          totalOutflows: cashFlowData?.outflows?.reduce((sum, val) => sum + val, 0) || 0,
        },
        revenue: {
          hasData:
            !!revenueExpensesData &&
            !!revenueExpensesData.revenue_categories &&
            revenueExpensesData.revenue_categories.length > 0,
          categoriesCount: revenueExpensesData?.revenue_categories?.length || 0,
          sampleCategories: revenueExpensesData?.revenue_categories?.slice(0, 3) || [],
          totalRevenue: revenueExpensesData?.revenue_amounts?.reduce((sum, val) => sum + val, 0) || 0,
        },
        projects: {
          hasData: !!projectData && !!projectData.project_names && projectData.project_names.length > 0,
          projectsCount: projectData?.project_names?.length || 0,
          sampleProjects: projectData?.project_names?.slice(0, 3) || [],
          totalProjectRevenue: projectData?.total_revenue?.reduce((sum, val) => sum + val, 0) || 0,
        },
        uploadInfo: {
          fileId,
          uploadTime: localStorage.getItem(`uploadTime_${userId}`) || "Unknown",
        },
      }

      setVerificationData(verification)
    } catch (error) {
      console.error("Verification error:", error)
      setVerificationData({ error: error.message })
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
      <h3 className="text-lg font-medium mb-2">Data Verification</h3>
      <p className="text-sm text-gray-600 mb-3">
        Verify that the scenario analysis is using your actual uploaded Excel data.
      </p>

      <button
        onClick={verifyData}
        disabled={loading}
        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? "Checking..." : "Verify Data Source"}
      </button>

      {verificationData && !verificationData.error && (
        <div className="mt-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded p-3">
              <h4 className="font-medium">Cash Flow Data</h4>
              <p className={verificationData.cashFlow.hasData ? "text-green-600" : "text-red-600"}>
                {verificationData.cashFlow.hasData ? "✓ Using actual data" : "✗ No data found"}
              </p>
              {verificationData.cashFlow.hasData && (
                <>
                  <p>Months: {verificationData.cashFlow.monthsCount}</p>
                  <p>Sample: {verificationData.cashFlow.sampleMonths.join(", ")}</p>
                  <p>Total Inflows: ${verificationData.cashFlow.totalInflows.toLocaleString()}</p>
                  <p>Total Outflows: ${verificationData.cashFlow.totalOutflows.toLocaleString()}</p>
                </>
              )}
            </div>

            <div className="border rounded p-3">
              <h4 className="font-medium">Revenue Data</h4>
              <p className={verificationData.revenue.hasData ? "text-green-600" : "text-red-600"}>
                {verificationData.revenue.hasData ? "✓ Using actual data" : "✗ No data found"}
              </p>
              {verificationData.revenue.hasData && (
                <>
                  <p>Categories: {verificationData.revenue.categoriesCount}</p>
                  <p>Sample: {verificationData.revenue.sampleCategories.join(", ")}</p>
                  <p>Total Revenue: ${verificationData.revenue.totalRevenue.toLocaleString()}</p>
                </>
              )}
            </div>
          </div>

          <div className="mt-4 border rounded p-3">
            <h4 className="font-medium">Project Data</h4>
            <p className={verificationData.projects.hasData ? "text-green-600" : "text-red-600"}>
              {verificationData.projects.hasData ? "✓ Using actual data" : "✗ No data found"}
            </p>
            {verificationData.projects.hasData && (
              <>
                <p>Projects: {verificationData.projects.projectsCount}</p>
                <p>Sample: {verificationData.projects.sampleProjects.join(", ")}</p>
                <p>Total Project Revenue: ${verificationData.projects.totalProjectRevenue.toLocaleString()}</p>
              </>
            )}
          </div>

          <div className="mt-4 text-xs text-gray-500">
            <p>File ID: {verificationData.uploadInfo.fileId}</p>
            <p>Upload Time: {new Date(verificationData.uploadInfo.uploadTime).toLocaleString()}</p>
          </div>
        </div>
      )}

      {verificationData && verificationData.error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-600">
          Error: {verificationData.error}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>For more detailed verification, open your browser's developer console (F12) and check the logs.</p>
      </div>
    </div>
  )
}
