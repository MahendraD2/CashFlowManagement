import api from "./api"
import { mockApi } from "./mockApi"

// Use the real API for production
const apiService = api

export const financialService = {
  // Cash Flow Timeline for a specific file
  getCashFlowTimeline: async (fileId) => {
    try {
      const response = await apiService.get(`/analysis/cash-flow/timeline/${fileId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching cash flow timeline:", error)
      throw error
    }
  },

  // Existing methods
  getTransactions: async (params = {}) => {
    try {
      const response = await mockApi.getTransactions(params)
      return response
    } catch (error) {
      console.error("Error fetching transactions:", error)
      throw error
    }
  },

  getAccounts: async () => {
    try {
      const response = await mockApi.getAccounts()
      return response
    } catch (error) {
      console.error("Error fetching accounts:", error)
      throw error
    }
  },
}
