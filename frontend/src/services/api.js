import axios from "axios"

// Create an axios instance with default config
const api = axios.create({
  // Use relative URLs that will be proxied by Vite
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Log the request URL for debugging
    console.log("Making request to:", config.url)
    console.log("Request data:", config.data)
    console.log("Request headers:", config.headers)

    const token = localStorage.getItem("access_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error("API Error Response:", error.response || error.message || error)

    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem("access_token")
      window.location.href = "/"
    }
    return Promise.reject(error)
  },
)

// Helper function to handle API errors
export const handleApiError = (error) => {
  if (error.response && error.response.data) {
    if (typeof error.response.data === "object") {
      // If it's an object, try to extract a meaningful message
      const detail = error.response.data.detail
      if (Array.isArray(detail)) {
        // FastAPI often returns validation errors as an array
        return detail.map((err) => `${err.loc.join(".")} - ${err.msg}`).join(", ")
      }
      return error.response.data.detail || error.response.data.message || JSON.stringify(error.response.data)
    }
    return error.response.data
  }
  return error.message || "An error occurred"
}

export default api
