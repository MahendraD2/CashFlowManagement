import { enhancedExcelService } from "./enhancedExcelService"

export const notificationService = {
  // Get all notifications
  getNotifications: async () => {
    try {
      console.log("Fetching notifications...")

      // Get the auth token
      const token = localStorage.getItem("access_token")
      if (!token) {
        console.warn("No auth token found, using local data")
      }

      // Get notifications from local storage
      return enhancedExcelService.getNotificationData()
    } catch (error) {
      console.error("Error fetching notifications:", error)
      console.log("Using fallback notification data")

      // Return fallback data on error
      return enhancedExcelService.getNotificationData()
    }
  },

  // Mark a notification as read
  markNotificationAsRead: async (notificationId) => {
    try {
      // Get current notifications
      const userId = localStorage.getItem("user_id") || "default_user"
      const notificationsStr = localStorage.getItem(`notificationData_${userId}`)

      if (notificationsStr) {
        const notifications = JSON.parse(notificationsStr)

        // Update the notification status
        const updatedNotifications = notifications.map((notification) => {
          if (notification.id === notificationId) {
            return { ...notification, status: "read" }
          }
          return notification
        })

        // Save back to localStorage
        localStorage.setItem(`notificationData_${userId}`, JSON.stringify(updatedNotifications))
      }

      return { success: true }
    } catch (error) {
      console.error("Error marking notification as read:", error)
      // Return mock success response
      return { success: true }
    }
  },

  // Get notification counts by status
  getNotificationCounts: async () => {
    try {
      const notifications = await notificationService.getNotifications()

      // Count notifications by status
      const pendingCount = notifications.filter((n) => n.status === "pending").length
      const dueCount = notifications.filter((n) => n.status === "due").length
      const totalCount = pendingCount + dueCount

      return { pendingCount, dueCount, totalCount }
    } catch (error) {
      console.error("Error fetching notification counts:", error)
      // Return mock counts on error
      return { pendingCount: 2, dueCount: 1, totalCount: 3 }
    }
  },

  // Update notification preferences
  updateNotificationPreferences: async (preferences) => {
    try {
      // Store preferences in localStorage
      const userId = localStorage.getItem("user_id") || "default_user"
      localStorage.setItem(`notificationPreferences_${userId}`, JSON.stringify(preferences))

      return { success: true }
    } catch (error) {
      console.error("Error updating notification preferences:", error)
      // Return mock success response
      return { success: true }
    }
  },
}
