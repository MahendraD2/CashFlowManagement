import api, { handleApiError } from "./api"

export const forecastService = {
  createForecast: async (forecastData) => {
    try {
      const response = await api.post("/forecasting/forecasts", forecastData)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  getForecastStatus: async (forecastId) => {
    try {
      const response = await api.get(`/forecasting/forecasts/${forecastId}/status`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  getForecastResults: async (forecastId) => {
    try {
      const response = await api.get(`/forecasting/forecasts/${forecastId}`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  createScenario: async (forecastId, scenarioData) => {
    try {
      const response = await api.post(`/forecasting/forecasts/${forecastId}/scenarios`, scenarioData)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  getScenarioResults: async (forecastId, scenarioId) => {
    try {
      const response = await api.get(`/forecasting/forecasts/${forecastId}/scenarios/${scenarioId}`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}
