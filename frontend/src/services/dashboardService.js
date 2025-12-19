import { enhancedExcelService } from "./enhancedExcelService"

// Get dashboard summary data
const getSummary = async () => {
  try {
    // Check if we're using real data or need to generate fallback data
    const dataSource = enhancedExcelService.checkDataSource()
    console.log("Data source check:", dataSource)

    // Get the current user ID
    const userId = localStorage.getItem("user_id") || "default_user"

    // Calculate summary data from the stored data
    const cashFlowData = enhancedExcelService.getCashFlowData()
    const revenueExpensesData = enhancedExcelService.getRevenueExpensesData()
    const paymentStatusData = enhancedExcelService.getPaymentStatusData()

    // Calculate total revenue
    const totalRevenue = cashFlowData.inflows.reduce((sum, value) => sum + value, 0)

    // Calculate total expenses
    const totalExpenses = cashFlowData.outflows.reduce((sum, value) => sum + value, 0)

    // Calculate net cash flow
    const netCashFlow = totalRevenue - totalExpenses

    // Calculate pending payments
    let pendingPayments = 0
    if (paymentStatusData && paymentStatusData.raw_data) {
      pendingPayments = paymentStatusData.raw_data
        .filter((item) => item.normalized_status === "Pending" || item.normalized_status === "Overdue")
        .reduce((sum, item) => sum + item.amount, 0)
    }

    return {
      total_revenue: totalRevenue,
      total_expenses: totalExpenses,
      net_cash_flow: netCashFlow,
      pending_payments: pendingPayments,
      revenue_expenses: revenueExpensesData,
      payment_status: paymentStatusData,
    }
  } catch (error) {
    console.error("Error getting dashboard summary:", error)
    throw error
  }
}

// Get cash flow timeline data
const getCashFlowTimeline = async (fileId) => {
  try {
    return enhancedExcelService.getCashFlowData(fileId)
  } catch (error) {
    console.error("Error getting cash flow timeline:", error)
    throw error
  }
}

// Get revenue and expenses data
const getRevenueExpenses = async (fileId) => {
  try {
    return enhancedExcelService.getRevenueExpensesData(fileId)
  } catch (error) {
    console.error("Error getting revenue expenses:", error)
    throw error
  }
}

// Get project profitability data
const getProjectProfitability = async (fileId) => {
  try {
    return enhancedExcelService.getProjectProfitabilityData(fileId)
  } catch (error) {
    console.error("Error getting project profitability:", error)
    throw error
  }
}

// Get payment status data
const getPaymentStatus = async (fileId) => {
  try {
    return enhancedExcelService.getPaymentStatusData(fileId)
  } catch (error) {
    console.error("Error getting payment status:", error)
    throw error
  }
}

export const dashboardService = {
  getSummary,
  getCashFlowTimeline,
  getRevenueExpenses,
  getProjectProfitability,
  getPaymentStatus,
  // Keep other methods for backward compatibility
  getStats: async () => {
    try {
      const response = await dashboardService.getSummary()
      return response
    } catch (error) {
      throw error
    }
  },

  getLineChartData: async (period = "year") => {
    try {
      const response = await dashboardService.getSummary()
      return response.cash_flow_timeline
    } catch (error) {
      throw error
    }
  },

  getBarChartData: async (period = "halfyear") => {
    try {
      const response = await dashboardService.getSummary()
      return response.revenue_expenses
    } catch (error) {
      throw error
    }
  },

  getPieChartData: async () => {
    try {
      const response = await dashboardService.getSummary()
      return response.payment_status
    } catch (error) {
      throw error
    }
  },
}
