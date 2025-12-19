"use client"

import { useState, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  FileUp,
  PieChartIcon,
  Bell,
  User,
  Check,
  AlertCircle,
  Download,
  FileSpreadsheet,
} from "lucide-react"
import { documentService } from "../services/documentService"
import { useNotificationCounts } from "../hooks/useNotificationCounts"

export default function UploadDocuments() {
  const [activeNav, setActiveNav] = useState("upload")
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null) // 'success', 'error', or null
  const [errorMessage, setErrorMessage] = useState("")
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const { totalCount } = useNotificationCounts()

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0])
    }
  }

  // Process the file
  const handleFile = (selectedFile) => {
    // Check if file is an Excel file
    const isExcel =
      selectedFile.type === "application/vnd.ms-excel" ||
      selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      selectedFile.name.endsWith(".xlsx") ||
      selectedFile.name.endsWith(".xls")

    if (!isExcel) {
      setErrorMessage("Please upload an Excel file (.xlsx or .xls)")
      setUploadStatus("error")
      return
    }

    setFile(selectedFile)
    setUploadStatus(null)
    setErrorMessage("")
  }

  // Trigger file input click
  const handleUploadClick = () => {
    if (!file) {
      fileInputRef.current.click()
    } else {
      uploadFile()
    }
  }

  // Download template
  const handleDownloadTemplate = async () => {
    setIsDownloading(true)
    try {
      await documentService.downloadTemplate()
    } catch (error) {
      console.error("Template download error:", error)
      setErrorMessage("Failed to download template. Please try again.")
      setUploadStatus("error")
    } finally {
      setIsDownloading(false)
    }
  }

  // Upload file to server
  const uploadFile = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadStatus(null)
    setErrorMessage("")

    try {
      const response = await documentService.uploadExcelDocument(file)

      if (response.success) {
        setUploadStatus("success")

        // Get current user ID
        const userId = localStorage.getItem("user_id")

        // Store the file ID in user-specific localStorage
        if (userId) {
          localStorage.setItem(`uploadedFileId_${userId}`, response.file_id)
          localStorage.setItem(`uploadedFileDate_${userId}`, new Date().toISOString())
        }

        // Clear file after successful upload
        setTimeout(() => {
          setFile(null)
          // Navigate to dashboard after successful upload
          navigate("/dashboard")
        }, 2000)
      } else {
        throw new Error(response.message || "Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      setUploadStatus("error")
      setErrorMessage(error.message || "Failed to upload document. Please try again.")
    } finally {
      setIsUploading(false)
    }
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
        {/* Header */}
        <div className="p-6">
          <h1 className="text-2xl font-semibold text-[#6b7280]">UPLOAD EXCEL DOCUMENT</h1>
        </div>

        {/* Template download button */}
        <div className="px-6 mb-4">
          <button
            onClick={handleDownloadTemplate}
            disabled={isDownloading}
            className="flex items-center px-4 py-2 bg-white text-[#8b5cf6] rounded-md shadow-sm hover:shadow-md transition-shadow"
          >
            <Download className="w-4 h-4 mr-2" />
            {isDownloading ? "Downloading..." : "Download Template"}
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Download our Excel template to ensure your data is formatted correctly.
          </p>
        </div>

        {/* Upload area */}
        <div className="flex flex-col items-center justify-center px-6 py-6">
          <div
            className={`w-full max-w-3xl h-64 bg-white rounded-lg border-2 border-dashed 
              ${isDragging ? "border-[#a78bfa]" : "border-[#e9d5ff]"} 
              flex flex-col items-center justify-center cursor-pointer transition-colors
              ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current.click()}
          >
            <div className="w-16 h-16 bg-[#a78bfa] rounded-lg flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-8 h-8 text-white" />
            </div>
            <p className="text-lg font-medium text-[#6b7280]">DRAG AND DROP EXCEL FILE</p>
            <p className="text-sm text-gray-500 mt-2">or click to browse files (.xlsx or .xls)</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            />
          </div>

          {/* Status message */}
          {uploadStatus && (
            <div
              className={`mt-4 p-3 rounded-md w-full max-w-3xl flex items-center
                ${uploadStatus === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
            >
              {uploadStatus === "success" ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  <span>Document uploaded successfully! Redirecting to dashboard...</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span>{errorMessage}</span>
                </>
              )}
            </div>
          )}

          <button
            className={`mt-8 px-8 py-3 rounded-full shadow-md transition-colors
              ${isUploading ? "bg-gray-400 cursor-not-allowed" : "bg-[#a78bfa] text-white hover:bg-[#9061f9]"}`}
            onClick={handleUploadClick}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : file ? "Upload File" : "Select Excel File"}
          </button>

          {/* File info - will show if file is selected */}
          {file && (
            <div className="w-full max-w-3xl mt-8">
              <h2 className="text-lg font-medium text-[#6b7280] mb-4">Selected File</h2>
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center p-2 border border-[#e9d5ff] rounded">
                  <FileSpreadsheet className="w-5 h-5 text-[#a78bfa] mr-2" />
                  <span className="text-sm text-[#6b7280]">{file.name}</span>
                  <span className="ml-auto text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</span>
                </div>
              </div>
            </div>
          )}
        </div>
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
