"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { authService } from "../services/authService"
import { profileService } from "../services/profileService"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check if user is logged in on page load
    const checkAuthStatus = async () => {
      try {
        if (localStorage.getItem("access_token")) {
          // Try to get user profile
          try {
            const userData = await profileService.getProfile()
            setUser(userData)
          } catch (profileErr) {
            console.error("Error fetching profile:", profileErr)
            // If profile fetch fails, clear token
            localStorage.removeItem("access_token")
          }
        }
      } catch (err) {
        console.error("Authentication error:", err)
        localStorage.removeItem("access_token")
      } finally {
        setLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      const data = await authService.login(email, password)

      // After successful login, fetch user profile
      try {
        const userData = await profileService.getProfile()

        // Store user ID in localStorage
        if (userData && userData.id) {
          localStorage.setItem("user_id", userData.id)
        }

        setUser(userData)
      } catch (profileErr) {
        console.error("Error fetching profile after login:", profileErr)
        throw new Error("Login successful but failed to fetch user profile")
      }

      return data
    } catch (err) {
      setError(err.message || "Login failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      setError(null)
      const data = await authService.register(userData)
      return data
    } catch (err) {
      setError(err.message || "Registration failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    // Get user ID before clearing
    const userId = localStorage.getItem("user_id")

    // Clear auth token
    authService.logout()

    // Clear user-specific document data
    if (userId) {
      localStorage.removeItem(`uploadedFileId_${userId}`)
      localStorage.removeItem(`uploadedFileDate_${userId}`)

      // Clear any other user-specific data that might be stored
      localStorage.removeItem(`cashFlowData_${userId}`)
      localStorage.removeItem(`revenueExpensesData_${userId}`)
      localStorage.removeItem(`projectProfitabilityData_${userId}`)
      localStorage.removeItem(`paymentStatusData_${userId}`)
    }

    // Clear user ID
    localStorage.removeItem("user_id")

    setUser(null)
  }

  const updateUserProfile = (updatedProfile) => {
    setUser(updatedProfile)
  }

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUserProfile,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
