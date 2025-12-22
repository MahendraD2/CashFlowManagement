import axios from "axios"

// Create a separate axios instance just for notifications
const notificationApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api", // Use env var for production, relative for dev
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor for adding auth token
notificationApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

export default notificationApi
