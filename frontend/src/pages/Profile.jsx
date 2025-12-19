"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { LayoutDashboard, FileUp, PieChartIcon, Bell, User, Loader, Check, AlertCircle } from "lucide-react"
import { profileService } from "../services/profileService"
import { useAuth } from "../context/AuthContext"
import { useNotificationCounts } from "../hooks/useNotificationCounts"

export default function Profile() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [activeNav, setActiveNav] = useState("profile")
  const { totalCount } = useNotificationCounts()

  // Profile state
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  })

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [updateStatus, setUpdateStatus] = useState(null) // 'success', 'error', or null
  const [updateMessage, setUpdateMessage] = useState("")

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        const profileData = await profileService.getProfile()
        setProfile(profileData)
        setFormData((prevData) => ({
          ...prevData,
          name: profileData.name || "",
        }))
      } catch (err) {
        console.error("Error fetching profile:", err)
        setError("Failed to load profile data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Handle form submission
  const handleSave = async (e) => {
    e.preventDefault()

    // Validate form
    if (formData.password && formData.password !== formData.confirmPassword) {
      setUpdateStatus("error")
      setUpdateMessage("Passwords do not match")
      return
    }

    // Prepare data for API
    const updateData = {
      name: formData.name,
    }

    // Only include password if it's provided
    if (formData.password) {
      updateData.password = formData.password
    }

    try {
      setIsSubmitting(true)
      setUpdateStatus(null)
      setUpdateMessage("")

      const updatedProfile = await profileService.updateProfile(updateData)

      // Update local state with new profile data
      setProfile(updatedProfile)

      // Clear password fields
      setFormData((prevData) => ({
        ...prevData,
        password: "",
        confirmPassword: "",
      }))

      setUpdateStatus("success")
      setUpdateMessage("Profile updated successfully!")
    } catch (err) {
      console.error("Update error:", err)
      setUpdateStatus("error")
      setUpdateMessage(err.message || "Failed to update profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle logout
  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <div className="flex h-screen bg-[#f5f3ff]">
      {/* Sidebar */}
      <div className="w-56 bg-[#f5f3ff] border-r border-[#e9d5ff] flex flex-col">
        <div className="p-4 flex-1">
          <nav className="space-y-1">
            <NavItem
              icon={<LayoutDashboard size={18} />}
              label="Dashboard"
              id="dashboard"
              active={activeNav === "dashboard"}
              onClick={() => setActiveNav("dashboard")}
              to="/dashboard"
            />
            <NavItem
              icon={<FileUp size={18} />}
              label="Upload Document"
              id="upload"
              active={activeNav === "upload"}
              onClick={() => setActiveNav("upload")}
              to="/upload"
            />
            <NavItem
              icon={<PieChartIcon size={18} />}
              label="Scenario analysis"
              id="analysis"
              active={activeNav === "analysis"}
              onClick={() => setActiveNav("analysis")}
              to="/scenario-analysis"
            />
            <NavItem
              icon={<Bell size={18} />}
              label="Notifications"
              id="notifications"
              active={activeNav === "notifications"}
              onClick={() => setActiveNav("notifications")}
              to="/notifications"
              badge={totalCount}
            />
          </nav>
        </div>

        <div className="p-4 border-t border-[#e9d5ff]">
          <div className="text-xs text-gray-500 mb-2">Settings</div>
          <nav className="space-y-1">
            <NavItem
              icon={<User size={18} />}
              label="Profile"
              id="profile"
              active={activeNav === "profile"}
              onClick={() => setActiveNav("profile")}
              to="/profile"
            />
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Header with title */}
        <div className="p-6">
          <h1 className="text-2xl font-semibold text-[#6b7280]">PERSONAL SETTINGS</h1>
        </div>

        {loading ? (
          // Loading state
          <div className="flex items-center justify-center h-64">
            <Loader className="w-8 h-8 text-[#a78bfa] animate-spin" />
          </div>
        ) : error ? (
          // Error state
          <div className="p-6">
            <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        ) : (
          // Profile form
          <div className="p-6">
            {/* Status message */}
            {updateStatus && (
              <div
                className={`mb-6 p-4 rounded-lg flex items-center
                  ${updateStatus === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
              >
                {updateStatus === "success" ? (
                  <Check className="w-5 h-5 mr-2" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-2" />
                )}
                <span>{updateMessage}</span>
              </div>
            )}

            <form onSubmit={handleSave}>
              {/* Profile Details Section */}
              <div className="bg-white rounded-lg p-6 mb-6">
                <h2 className="text-lg font-medium text-[#6b7280] mb-6">PROFILE DETAILS</h2>

                <div className="space-y-6">
                  {/* Email (read-only) */}
                  <div>
                    <label className="block text-sm text-[#6b7280] mb-2">Email Address</label>
                    <input
                      type="email"
                      value={profile?.email || ""}
                      readOnly
                      className="w-full p-3 bg-gray-50 border border-[#e9d5ff] rounded-md text-gray-500"
                    />
                  </div>

                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm text-[#6b7280] mb-2">
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-[#e9d5ff] rounded-md focus:outline-none focus:ring-2 focus:ring-[#a78bfa]"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Password Section */}
              <div className="bg-white rounded-lg p-6 mb-6">
                <h2 className="text-lg font-medium text-[#6b7280] mb-6">CHANGE PASSWORD</h2>

                <div className="space-y-6">
                  {/* New Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm text-[#6b7280] mb-2">
                      New Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-[#e9d5ff] rounded-md focus:outline-none focus:ring-2 focus:ring-[#a78bfa]"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave blank to keep your current password</p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm text-[#6b7280] mb-2">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-[#e9d5ff] rounded-md focus:outline-none focus:ring-2 focus:ring-[#a78bfa]"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Account Access Section */}
              <div className="bg-white rounded-lg p-6 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-medium text-[#6b7280]">ACCOUNT ACCESS</h2>
                    <p className="text-sm text-gray-500 mt-1">Securely log out of your account</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-6 py-2 bg-[#f9f9f9] border border-[#e9d5ff] text-[#ef4444] rounded-full hover:bg-[#fee2e2] transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-8 py-3 rounded-full shadow-md transition-colors
                    ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#a78bfa] text-white hover:bg-[#9061f9]"}`}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

// Navigation item component
function NavItem({ icon, label, active, onClick, badge, id, to }) {
  const baseClasses = "flex items-center px-3 py-2 text-sm rounded-lg transition-colors"
  const activeClasses = active
    ? "bg-[#a78bfa] text-white font-medium"
    : "text-gray-600 hover:bg-[#e9d5ff] hover:text-gray-900"

  const content = (
    <div className={`${baseClasses} ${activeClasses}`} onClick={onClick}>
      <span className="mr-3">{icon}</span>
      <span>{label}</span>
      {badge > 0 && (
        <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {badge}
        </span>
      )}
    </div>
  )

  if (to) {
    return <Link to={to}>{content}</Link>
  }

  return content
}
