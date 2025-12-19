"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  LayoutDashboard,
  FileUp,
  PieChartIcon,
  Bell,
  User,
  Search,
  ChevronDown,
  Calendar,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader,
  AlertCircle,
} from "lucide-react"
import { notificationService } from "../services/notificationService"
import { useNotificationCounts } from "../hooks/useNotificationCounts"

export default function Notifications() {
  const [activeNav, setActiveNav] = useState("notifications")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRows, setSelectedRows] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false)
  const [sortField, setSortField] = useState("created_at")
  const [sortDirection, setSortDirection] = useState("desc") // desc = newest first
  const [filterStatus, setFilterStatus] = useState(null)
  const [dateRange, setDateRange] = useState({ start: null, end: null })
  const [notifications, setNotifications] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [totalResults, setTotalResults] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const rowsPerPage = 10

  // Use the custom hook to get notification counts
  const { pendingCount, dueCount, totalCount } = useNotificationCounts()

  // Fetch notifications on component mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        const data = await notificationService.getNotifications()
        // Ensure data is an array
        const notificationsArray = Array.isArray(data) ? data : []
        setNotifications(notificationsArray)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching notifications:", err)
        setError(err.message || "Failed to load notifications")
        setNotifications([]) // Set empty array on error
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  // Parse date strings to Date objects for comparison
  const parseDate = (dateStr) => {
    return new Date(dateStr)
  }

  // Filter and sort data
  useEffect(() => {
    if (loading) return

    let result = [...notifications]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((item) => item.message.toLowerCase().includes(query))
    }

    // Apply status filter
    if (filterStatus) {
      result = result.filter((item) => item.status === filterStatus)
    }

    // Apply date filter
    if (dateRange.start && dateRange.end) {
      result = result.filter((item) => {
        const itemDate = parseDate(item.created_at)
        return itemDate >= dateRange.start && itemDate <= dateRange.end
      })
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0

      if (sortField === "message") {
        comparison = a.message.localeCompare(b.message)
      } else if (sortField === "created_at") {
        comparison = parseDate(a.created_at) - parseDate(b.created_at)
      } else if (sortField === "status") {
        comparison = a.status.localeCompare(b.status)
      }

      return sortDirection === "asc" ? comparison : -comparison
    })

    setTotalResults(result.length)

    // Apply pagination
    const startIndex = (currentPage - 1) * rowsPerPage
    const paginatedResult = result.slice(startIndex, startIndex + rowsPerPage)

    setFilteredData(paginatedResult)
  }, [notifications, searchQuery, filterStatus, dateRange, sortField, sortDirection, currentPage, loading])

  // Handle row selection
  const handleRowSelect = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id))
    } else {
      setSelectedRows([...selectedRows, id])
    }
  }

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([])
    } else {
      setSelectedRows(filteredData.map((row) => row.id))
    }
    setSelectAll(!selectAll)
  }

  // Handle delete selected
  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) return

    // In a real app, you would call an API to delete these rows
    // For this demo, we'll just show an alert
    alert(`Deleting ${selectedRows.length} notifications`)

    // Clear selection after delete
    setSelectedRows([])
    setSelectAll(false)
  }

  // Handle sort toggle
  const handleSortToggle = () => {
    if (sortField === "created_at") {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField("created_at")
      setSortDirection("desc") // Default to newest first
    }
  }

  // Handle status change
  const handleStatusChange = (id, newStatus) => {
    // In a real app, you would update the status in your database
    // For this demo, we'll just show an alert
    alert(`Changing status of notification ${id} to ${newStatus}`)
  }

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-[#f59e0b]"
      case "due":
        return "text-[#ef4444]"
      default:
        return "text-gray-500"
    }
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Add this helper function near the formatDate function
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Calculate total pages
  const totalPages = Math.ceil(totalResults / rowsPerPage)

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      // Show all pages if there are few
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      // Calculate start and end of visible pages
      let start = Math.max(2, currentPage - 1)
      const end = Math.min(start + maxVisiblePages - 3, totalPages - 1)

      // Adjust start if end is maxed out
      if (end === totalPages - 1) {
        start = Math.max(2, end - (maxVisiblePages - 3))
      }

      // Add ellipsis if needed
      if (start > 2) {
        pages.push("...")
      }

      // Add visible pages
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push("...")
      }

      // Always show last page
      pages.push(totalPages)
    }

    return pages
  }

  // Apply date filter
  const applyDateFilter = () => {
    // In a real app, you would have a date picker component
    // For this demo, we'll just set a fixed date range
    const start = new Date()
    start.setDate(start.getDate() - 7) // 7 days ago
    const end = new Date() // today

    setDateRange({ start, end })
    setIsDateFilterOpen(false)
  }

  // Clear date filter
  const clearDateFilter = () => {
    setDateRange({ start: null, end: null })
    setIsDateFilterOpen(false)
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
          <h1 className="text-2xl font-semibold text-[#6b7280]">NOTIFICATIONS</h1>
        </div>

        {/* Notifications table */}
        <div className="px-6 pb-6">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Search and filters */}
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#a78bfa]"
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button
                    className="flex items-center px-4 py-2 text-gray-600 text-sm border border-gray-200 rounded-md"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                  >
                    <span>Filter {filterStatus ? `(${filterStatus})` : ""}</span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </button>

                  {isFilterOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                      <div className="py-1">
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => {
                            setFilterStatus(null)
                            setIsFilterOpen(false)
                          }}
                        >
                          All
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-[#f59e0b] hover:bg-gray-100"
                          onClick={() => {
                            setFilterStatus("pending")
                            setIsFilterOpen(false)
                          }}
                        >
                          Pending
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-[#ef4444] hover:bg-gray-100"
                          onClick={() => {
                            setFilterStatus("due")
                            setIsFilterOpen(false)
                          }}
                        >
                          Due
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    className="flex items-center px-4 py-2 text-gray-600 text-sm border border-gray-200 rounded-md"
                    onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
                  >
                    <Calendar className="mr-2 h-4 w-4 text-[#a78bfa]" />
                    <span>Date filter {dateRange.start ? "(Active)" : ""}</span>
                  </button>

                  {isDateFilterOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 border border-gray-200 p-4">
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Date Range</p>
                        <p className="text-xs text-gray-500 mb-4">In a real app, this would be a date picker</p>
                        <div className="flex justify-between">
                          <button
                            className="px-3 py-1 text-sm bg-[#a78bfa] text-white rounded-md"
                            onClick={applyDateFilter}
                          >
                            Apply Filter
                          </button>
                          <button
                            className="px-3 py-1 text-sm border border-gray-200 text-gray-600 rounded-md"
                            onClick={clearDateFilter}
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <button className="flex items-center px-4 py-2 text-gray-600 text-sm" onClick={handleSortToggle}>
                    {sortField === "created_at" ? (
                      sortDirection === "desc" ? (
                        <ArrowDown className="mr-2 h-4 w-4" />
                      ) : (
                        <ArrowUp className="mr-2 h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                    )}
                    <span>Date</span>
                  </button>
                </div>

                <button
                  className="p-2 text-gray-500 hover:text-red-500"
                  onClick={handleDeleteSelected}
                  disabled={selectedRows.length === 0}
                >
                  <Trash2 className={`h-5 w-5 ${selectedRows.length === 0 ? "opacity-50" : ""}`} />
                </button>
              </div>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="flex justify-center items-center py-20">
                <Loader className="w-8 h-8 text-[#a78bfa] animate-spin" />
                <span className="ml-2 text-gray-500">Loading notifications...</span>
              </div>
            )}

            {/* Error state */}
            {error && !loading && (
              <div className="flex justify-center items-center py-20">
                <AlertCircle className="w-8 h-8 text-red-500" />
                <span className="ml-2 text-red-500">{error}</span>
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && filteredData.length === 0 && (
              <div className="flex flex-col justify-center items-center py-20">
                <Bell className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-1">No notifications found</h3>
                <p className="text-gray-400">
                  {searchQuery || filterStatus || dateRange.start
                    ? "Try adjusting your filters"
                    : "You don't have any notifications yet"}
                </p>
              </div>
            )}

            {/* Table */}
            {!loading && !error && filteredData.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                            className="h-4 w-4 text-[#a78bfa] rounded border-gray-300 focus:ring-[#a78bfa]"
                          />
                          <span className="ml-3">Message</span>
                        </div>
                      </th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.map((notification) => (
                      <tr key={notification.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(notification.id)}
                              onChange={() => handleRowSelect(notification.id)}
                              className="h-4 w-4 text-[#a78bfa] rounded border-gray-300 focus:ring-[#a78bfa]"
                            />
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{notification.message}</div>
                              {notification.type === "invoice" && notification.amount && (
                                <div className="text-xs text-gray-500">
                                  Amount: {formatCurrency(notification.amount)}
                                </div>
                              )}
                              {notification.type === "project" && notification.projectName && (
                                <div className="text-xs text-gray-500">Project: {notification.projectName}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(notification.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="relative">
                            <span className={`text-sm ${getStatusColor(notification.status)}`}>
                              {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && filteredData.length > 0 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <button
                    className="p-1 rounded-md border border-gray-200"
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className={`h-5 w-5 ${currentPage === 1 ? "text-gray-300" : "text-gray-400"}`} />
                  </button>

                  {getPageNumbers().map((page, index) =>
                    page === "..." ? (
                      <span key={`ellipsis-${index}`} className="text-gray-500">
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === page ? "bg-[#a78bfa] text-white" : "text-gray-500 hover:bg-gray-100"
                        }`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    ),
                  )}

                  <button
                    className="p-1 rounded-md border border-gray-200"
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight
                      className={`h-5 w-5 ${currentPage === totalPages ? "text-gray-300" : "text-gray-400"}`}
                    />
                  </button>
                </div>
                <div className="text-sm text-gray-500">{totalResults} Results</div>
              </div>
            )}
          </div>
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
