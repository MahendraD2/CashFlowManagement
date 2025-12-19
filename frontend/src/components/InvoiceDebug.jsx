"use client"

import { useState } from "react"
import { enhancedExcelService } from "../services/enhancedExcelService"

const InvoiceDebug = () => {
  const [showDebug, setShowDebug] = useState(false)
  const [paymentData, setPaymentData] = useState(null)

  const loadDebugData = () => {
    try {
      const data = enhancedExcelService.getPaymentStatusData()
      setPaymentData(data)
      setShowDebug(true)
    } catch (error) {
      console.error("Error loading debug data:", error)
    }
  }

  return (
    <div className="mt-4">
      <button
        onClick={loadDebugData}
        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md"
      >
        {showDebug ? "Hide Debug Info" : "Show Invoice Debug Info"}
      </button>

      {showDebug && paymentData && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200 overflow-auto">
          <h3 className="text-lg font-semibold mb-2">Payment Status Debug</h3>

          <div className="mb-4">
            <h4 className="font-medium">Status Counts:</h4>
            <ul className="list-disc pl-5">
              {paymentData.labels.map((label, index) => (
                <li key={label}>
                  {label}: {paymentData.values[index]}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Raw Invoice Data:</h4>
            {paymentData.raw_data && paymentData.raw_data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      {Object.keys(paymentData.raw_data[0]).map((key) => (
                        <th key={key} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paymentData.raw_data.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {Object.keys(paymentData.raw_data[0]).map((key) => (
                          <td key={`${rowIndex}-${key}`} className="px-3 py-2 text-sm">
                            {row[key]?.toString() || ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No raw data available</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default InvoiceDebug
