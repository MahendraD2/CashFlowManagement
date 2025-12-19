"use client"

import { useState, useEffect } from "react"
import { notificationService } from "../services/notificationService"

export function useNotificationCounts(pollingInterval = 30000) {
  const [counts, setCounts] = useState({
    pendingCount: 0,
    dueCount: 0,
    totalCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true)
        setError(null)
        const newCounts = await notificationService.getNotificationCounts()
        setCounts(newCounts)
      } catch (err) {
        console.error("Error fetching notification counts:", err)
        setError(err)
        // Don't update counts on error, keep the previous state
      } finally {
        setLoading(false)
      }
    }

    // Fetch counts immediately
    fetchCounts()

    // Set up polling
    const intervalId = setInterval(fetchCounts, pollingInterval)

    // Clean up on unmount
    return () => clearInterval(intervalId)
  }, [pollingInterval])

  return { ...counts, loading, error }
}
