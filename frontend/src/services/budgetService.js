import api, { handleApiError } from "./api"

export const budgetService = {
  createBudget: async (budgetData) => {
    try {
      const response = await api.post("/budgeting/budgets", budgetData)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  getBudgets: async (params = {}) => {
    try {
      const response = await api.get("/budgeting/budgets", { params })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  getBudgetDetails: async (budgetId) => {
    try {
      const response = await api.get(`/budgeting/budgets/${budgetId}`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  updateBudget: async (budgetId, budgetData) => {
    try {
      const response = await api.put(`/budgeting/budgets/${budgetId}`, budgetData)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}
