"use client"

import { useState } from "react"

export default function InvoiceDebugger({ onClose }) {
  const [activeTab, setActiveTab] = useState("status")
  const userId = localStorage.getItem("user_id") || "default_user"

  // Get data from localStorage
  const getStoredData = () => {
    try {
      // Try to get raw invoice data if available
      const rawData = localStorage.getItem(`invoiceRawData_${userId}`)
      if (rawData) {
        return JSON.parse(rawData)
      }
      return null
    } catch (error) {
      console.error("Error parsing stored invoice data:", error)
      return null
    }
  }

  const invoiceData = getStoredData()

  const renderStatusTable = () => {
    if (!invoiceData || !invoiceData.length) {
      return <p className="text-gray-500 italic">No invoice data available</p>
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Invoice ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Categorized As</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoiceData.map((invoice, index) => {
              // Determine categorization
              const status = String(invoice.status || "")
                .toLowerCase()
                .trim()
              let category = "Pending"

              if (status === "paid" || status.includes("paid")) {
                category = "Paid"
              } else if (
                status === "due" ||
                status === "overdue" ||
                status.includes("due") ||
                status.includes("over")
              ) {
                category = "Overdue"
              }

              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap text-sm">{invoice.invoiceId || `Invoice ${index + 1}`}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-mono">{`"${invoice.status || ""}"`}</td>
                  <td
                    className={`px-4 py-2 whitespace-nowrap text-sm font-medium ${
                      category === "Paid"
                        ? "text-green-600"
                        : category === "Overdue"
                          ? "text-red-600"
                          : "text-yellow-600"
                    }`}
                  >
                    {category}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  const renderRawData = () => {
    if (!invoiceData) {
      return <p className="text-gray-500 italic">No invoice data available</p>
    }

    return (
      <div className="bg-gray-50 p-4 rounded-md">
        <pre className="text-xs overflow-auto max-h-96">{JSON.stringify(invoiceData, null, 2)}</pre>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-lg font-semibold text-gray-700">Invoice Data Debugger</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === "status" ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-500"}`}
            onClick={() => setActiveTab("status")}
          >
            Status Categorization
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === "raw" ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-500"}`}
            onClick={() => setActiveTab("raw")}
          >
            Raw Data
          </button>
        </div>

        <div className="p-4 overflow-auto flex-1">{activeTab === "status" ? renderStatusTable() : renderRawData()}</div>

        <div className="border-t p-4 bg-gray-50">
          <p className="text-sm text-gray-500">
            This tool helps debug how invoice statuses are being categorized. If you're seeing incorrect categorization,
            check the raw status values in your Excel file.
          </p>
        </div>
      </div>
    </div>
  )
}
