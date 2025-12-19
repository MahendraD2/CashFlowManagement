"use client"

import { useState } from "react"

export default function DebugPanel() {
  const [showDebug, setShowDebug] = useState(false)
  const [debugData, setDebugData] = useState(null)

  const loadDebugData = () => {
    const userId = localStorage.getItem("user_id") || "default_user"
    const data = {
      cashFlow: JSON.parse(localStorage.getItem(`cashFlowData_${userId}`) || "null"),
      revenueExpenses: JSON.parse(localStorage.getItem(`revenueExpensesData_${userId}`) || "null"),
      projects: JSON.parse(localStorage.getItem(`projectProfitabilityData_${userId}`) || "null"),
      payments: JSON.parse(localStorage.getItem(`paymentStatusData_${userId}`) || "null"),
    }
    setDebugData(data)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => {
          setShowDebug(!showDebug)
          if (!showDebug) loadDebugData()
        }}
        className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm"
      >
        {showDebug ? "Hide Debug" : "Show Debug"}
      </button>

      {showDebug && debugData && (
        <div className="bg-white border border-gray-300 rounded-md shadow-lg p-4 mt-2 w-96 max-h-96 overflow-auto">
          <h3 className="font-bold mb-2">Extracted Excel Data</h3>
          <pre className="text-xs">{JSON.stringify(debugData, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
