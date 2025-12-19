import api, { handleApiError } from "./api"
import axios from "axios"

export const authService = {
  login: async (email, password) => {
    try {
      console.log("Attempting login with:", { email, password: "***" })

      // Create form data
      const formData = new URLSearchParams()
      formData.append("username", email)
      formData.append("password", password)

      // Make the request with the correct content type
      const response = await axios.post("/api/token", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      console.log("Login response:", response.data)

      if (response.data.access_token) {
        localStorage.setItem("access_token", response.data.access_token)

        // If user ID is included in the response, store it
        if (response.data.user_id) {
          localStorage.setItem("user_id", response.data.user_id)
        }
      }
      return response.data
    } catch (error) {
      console.error("Login error details:", error)
      throw new Error(handleApiError(error))
    }
  },

  register: async (userData) => {
    try {
      console.log("Attempting registration with:", { ...userData, password: "***" })

      // Make sure this matches your backend endpoint
      const response = await api.post("/register", {
        email: userData.email,
        password: userData.password,
        name: userData.name || userData.firstName + " " + userData.lastName,
      })

      console.log("Registration response:", response.data)
      return response.data
    } catch (error) {
      console.error("Registration error details:", error)
      throw new Error(handleApiError(error))
    }
  },

  logout: () => {
    // Get user ID before clearing
    const userId = localStorage.getItem("user_id")

    // Clear auth token
    localStorage.removeItem("access_token")

    // Clear user-specific document data
    if (userId) {
      localStorage.removeItem(`uploadedFileId_${userId}`)
      localStorage.removeItem(`uploadedFileDate_${userId}`)
      localStorage.removeItem("user_id")
    }
  },

  getCurrentUser: async () => {
    try {
      console.log("Fetching current user data")

      // Make sure this matches your backend endpoint
      const response = await api.get("/me")

      console.log("User data response:", response.data)
      return response.data
    } catch (error) {
      console.error("Get user error details:", error)
      throw new Error(handleApiError(error))
    }
  },
}
