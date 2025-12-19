import api from "./api"

export const profileService = {
  getProfile: async () => {
    try {
      const response = await api.get("/settings/profile")
      return response.data
    } catch (error) {
      console.error("Error fetching profile:", error)
      throw error
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put("/settings/profile", profileData)
      return response.data
    } catch (error) {
      console.error("Error updating profile:", error)
      throw error
    }
  },
}
