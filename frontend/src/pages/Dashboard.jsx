"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ReferenceLine,
} from "recharts"
import {
  LayoutDashboard,
  FileUp,
  PieChartIcon,
  Bell,
  User,
  Loader,
  ArrowRight,
  FileSpreadsheet,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Download,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { dashboardService } from "../services/dashboardService"
import { documentService } from "../services/documentService"
import { useAuth } from "../context/AuthContext"
import { useNotificationCounts } from "../hooks/useNotificationCounts"
// Fix the import for DebugButton
import DebugButton from "../components/DebugButton.jsx"

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState("dashboard")
  const { user } = useAuth()
  const { totalCount } = useNotificationCounts()

  // State for dashboard data
  const [dashboardData, setDashboardData] = useState(null)
  const [cashFlowData, setCashFlowData] = useState(null)
  const [documents, setDocuments] = useState([])
  // Add state for revenue expenses data
  const [revenueExpensesData, setRevenueExpensesData] = useState(null)
  // Add state for project profitability data
  const [projectProfitabilityData, setProjectProfitabilityData] = useState(null)
  // Add state for payment status data
  const [paymentStatusData, setPaymentStatusData] = useState(null)
  const [loading, setLoading] = useState({
    dashboard: true,
    documents: true,
    cashFlow: false,
    revenueExpenses: false,
    projectProfitability: false,
    paymentStatus: false,
  })
  const [error, setError] = useState({
    dashboard: null,
    documents: null,
    cashFlow: null,
    revenueExpenses: null,
    projectProfitability: null,
    paymentStatus: null,
  })

  // UI state
  const [showDetailedCashFlow, setShowDetailedCashFlow] = useState(false)
  const [cashFlowChartType, setCashFlowChartType] = useState("line") // 'line' or 'bar'
  // Add a new state for toggling between revenue and expense view
  const [activeFinancialView, setActiveFinancialView] = useState("revenue") // 'revenue' or 'expense'
  // Add state for sorting project profitability
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  })

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // First check if documents have been uploaded
        setLoading((prev) => ({ ...prev, documents: true }))
        let documentsData = { documents: [] }
        try {
          documentsData = await documentService.getDocuments()
          setDocuments(documentsData.documents || [])
        } catch (err) {
          console.error("Error fetching documents:", err)
          setError((prev) => ({ ...prev, documents: err.message }))
          // If we can't fetch documents, assume none exist
          setDocuments([])
        }
        setLoading((prev) => ({ ...prev, documents: false }))

        // Only fetch dashboard data if documents exist
        if (documentsData.documents && documentsData.documents.length > 0) {
          setLoading((prev) => ({ ...prev, dashboard: true }))
          try {
            const summaryData = await dashboardService.getSummary()
            setDashboardData(summaryData)
          } catch (err) {
            console.error("Error fetching dashboard summary:", err)
            setError((prev) => ({ ...prev, dashboard: err.message }))
          }
          setLoading((prev) => ({ ...prev, dashboard: false }))

          // Fetch cash flow timeline data
          fetchCashFlowData()

          // Fetch revenue expenses data
          fetchRevenueExpensesData()

          // Fetch project profitability data
          fetchProjectProfitabilityData()

          // Fetch payment status data
          fetchPaymentStatusData()
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
      }
    }

    fetchData()
  }, [])

  // Extract the fetchCashFlowData function to be used in multiple places
  const fetchCashFlowData = async () => {
    const fileId = getFileId()
    if (!fileId) return

    setLoading((prev) => ({ ...prev, cashFlow: true }))
    try {
      const data = await dashboardService.getCashFlowTimeline(fileId)
      setCashFlowData(data)
    } catch (err) {
      console.error("Error fetching cash flow timeline:", err)
      setError((prev) => ({ ...prev, cashFlow: err.message }))
    } finally {
      setLoading((prev) => ({ ...prev, cashFlow: false }))
    }
  }

  // Add this after the fetchCashFlowData function
  const fetchRevenueExpensesData = async () => {
    const fileId = getFileId()
    if (!fileId) return

    setLoading((prev) => ({ ...prev, revenueExpenses: true }))
    try {
      const data = await dashboardService.getRevenueExpenses(fileId)
      setRevenueExpensesData(data)
    } catch (err) {
      console.error("Error fetching revenue expenses:", err)
      setError((prev) => ({ ...prev, revenueExpenses: err.message }))
    } finally {
      setLoading((prev) => ({ ...prev, revenueExpenses: false }))
    }
  }

  // Add function to fetch project profitability data
  const fetchProjectProfitabilityData = async () => {
    const fileId = getFileId()
    if (!fileId) return

    setLoading((prev) => ({ ...prev, projectProfitability: true }))
    try {
      const data = await dashboardService.getProjectProfitability(fileId)
      setProjectProfitabilityData(data)
      // Set initial sort to profit (descending)
      setSortConfig({ key: "profit", direction: "descending" })
    } catch (err) {
      console.error("Error fetching project profitability:", err)
      setError((prev) => ({ ...prev, projectProfitability: err.message }))
    } finally {
      setLoading((prev) => ({ ...prev, projectProfitability: false }))
    }
  }

  // Add function to fetch payment status data
  const fetchPaymentStatusData = async () => {
    const fileId = getFileId()
    if (!fileId) return

    setLoading((prev) => ({ ...prev, paymentStatus: true }))
    try {
      const data = await dashboardService.getPaymentStatus(fileId)
      setPaymentStatusData(data)
    } catch (err) {
      console.error("Error fetching payment status:", err)
      setError((prev) => ({ ...prev, paymentStatus: err.message }))
    } finally {
      setLoading((prev) => ({ ...prev, paymentStatus: false }))
    }
  }

  // Replace the formatCurrency function with this updated version
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Format percentage
  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`
  }

  // Prepare stats data for display
  const prepareStatsData = () => {
    if (!dashboardData) return []

    return [
      {
        title: "Total Amount Credited",
        value: formatCurrency(dashboardData.total_revenue),
        id: "revenue",
        icon: <DollarSign className="h-6 w-6 text-green-500" />,
      },
      {
        title: "Total Expenses",
        value: formatCurrency(dashboardData.total_expenses),
        id: "expenses",
        icon: <TrendingDown className="h-6 w-6 text-red-500" />,
      },
      {
        title: "Net Profit",
        value: formatCurrency(dashboardData.net_cash_flow),
        id: "cashflow",
        icon: <TrendingUp className="h-6 w-6 text-blue-500" />,
      },
      {
        title: "Pending Payments",
        value: formatCurrency(dashboardData.pending_payments),
        id: "pending",
        icon: <Clock className="h-6 w-6 text-yellow-500" />,
      },
    ]
  }

  // Prepare line chart data from cash flow timeline
  const prepareLineChartData = () => {
    if (!cashFlowData) return []

    const { months, inflows, outflows, net_flow } = cashFlowData

    return months.map((month, index) => ({
      name: month,
      inflow: inflows[index],
      outflow: outflows[index],
      netFlow: net_flow[index],
    }))
  }

  // Prepare detailed cash flow data
  const prepareDetailedCashFlowData = () => {
    if (!cashFlowData) return []

    const { months, inflows, outflows, net_flow } = cashFlowData

    return months.map((month, index) => ({
      name: month,
      inflow: inflows[index],
      outflow: outflows[index],
      netFlow: net_flow[index],
    }))
  }

  // Calculate cash flow totals
  const calculateCashFlowTotals = () => {
    if (!cashFlowData) return { totalInflow: 0, totalOutflow: 0, totalNetFlow: 0 }

    const totalInflow = cashFlowData.inflows.reduce((sum, value) => sum + value, 0)
    const totalOutflow = cashFlowData.outflows.reduce((sum, value) => sum + value, 0)
    const totalNetFlow = totalInflow - totalOutflow

    return { totalInflow, totalOutflow, totalNetFlow }
  }

  // Prepare bar chart data
  const prepareBarChartData = () => {
    if (revenueExpensesData) {
      const { revenue_categories, revenue_amounts } = revenueExpensesData
      return revenue_categories.map((category, index) => ({
        name: category,
        value: revenue_amounts[index],
      }))
    }

    // Fallback to dashboard data if revenue expenses data is not available
    if (!dashboardData || !dashboardData.revenue_expenses) return []

    const { revenue_categories, revenue_amounts } = dashboardData.revenue_expenses

    return revenue_categories.map((category, index) => ({
      name: category,
      value: revenue_amounts[index],
    }))
  }

  // Prepare expense chart data
  const prepareExpenseChartData = () => {
    if (revenueExpensesData) {
      const { expense_categories, expense_amounts } = revenueExpensesData
      return expense_categories.map((category, index) => ({
        name: category,
        value: expense_amounts[index],
      }))
    }

    // Fallback to dashboard data if revenue expenses data is not available
    if (!dashboardData || !dashboardData.revenue_expenses) return []

    const { expense_categories, expense_amounts } = dashboardData.revenue_expenses

    return expense_categories.map((category, index) => ({
      name: category,
      value: expense_amounts[index],
    }))
  }

  // Prepare pie chart data
  const preparePieChartData = () => {
    if (paymentStatusData) {
      const { labels, values } = paymentStatusData

      return labels.map((label, index) => ({
        name: label,
        value: values[index],
        color: label === "Paid" ? "#10b981" : label === "Pending" ? "#f59e0b" : "#ef4444",
      }))
    }

    // Fallback to dashboard data if payment status data is not available
    if (!dashboardData || !dashboardData.payment_status) return []

    const { labels, values } = dashboardData.payment_status

    return labels.map((label, index) => ({
      name: label,
      value: values[index],
      color: label === "Paid" ? "#10b981" : label === "Pending" ? "#f59e0b" : "#ef4444",
    }))
  }

  // Prepare project profitability data
  const prepareProjectProfitabilityData = () => {
    if (!projectProfitabilityData) return []

    const { project_names, profit_margins, total_revenue, total_costs, status } = projectProfitabilityData

    const projects = project_names.map((name, index) => ({
      name,
      profitMargin: profit_margins[index],
      revenue: total_revenue[index],
      costs: total_costs[index],
      status: status[index],
      profit: total_revenue[index] - total_costs[index],
    }))

    // Apply sorting if configured
    if (sortConfig.key) {
      projects.sort((a, b) => {
        // Handle different data types appropriately
        if (typeof a[sortConfig.key] === "string") {
          // Case-insensitive string comparison
          const comparison = a[sortConfig.key].localeCompare(b[sortConfig.key])
          return sortConfig.direction === "ascending" ? comparison : -comparison
        } else {
          // Numeric comparison
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === "ascending" ? -1 : 1
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === "ascending" ? 1 : -1
          }
          return 0
        }
      })
    }

    return projects
  }

  // Handle sorting for project profitability table
  const requestSort = (key) => {
    let direction = "ascending"
    if (sortConfig.key === key) {
      direction = sortConfig.direction === "ascending" ? "descending" : "ascending"
    }
    setSortConfig({ key, direction })
  }

  // Get sort direction indicator
  const getSortDirectionIndicator = (key) => {
    if (sortConfig.key !== key) return null
    return sortConfig.direction === "ascending" ? (
      <ArrowUpRight className="ml-1 w-4 h-4 text-[#8b5cf6]" />
    ) : (
      <ArrowDownRight className="ml-1 w-4 h-4 text-[#8b5cf6]" />
    )
  }

  // Use real data or empty arrays
  const statsData = loading.dashboard ? [] : prepareStatsData()
  const lineChartData = loading.cashFlow ? [] : prepareLineChartData()
  const detailedCashFlowData = loading.cashFlow ? [] : prepareDetailedCashFlowData()
  const barChartData = loading.dashboard ? [] : prepareBarChartData()
  const expenseChartData = loading.dashboard ? [] : prepareExpenseChartData()
  const pieChartData = loading.paymentStatus ? [] : preparePieChartData()
  const projectData = loading.projectProfitability ? [] : prepareProjectProfitabilityData()
  const { totalInflow, totalOutflow, totalNetFlow } = calculateCashFlowTotals()

  // Calculate project profitability totals
  const calculateProjectTotals = () => {
    if (!projectData.length) return { totalRevenue: 0, totalCosts: 0, totalProfit: 0, avgProfitMargin: 0 }

    const totalRevenue = projectData.reduce((sum, project) => sum + project.revenue, 0)
    const totalCosts = projectData.reduce((sum, project) => sum + project.costs, 0)
    const totalProfit = totalRevenue - totalCosts
    const avgProfitMargin = (totalProfit / totalRevenue) * 100

    return { totalRevenue, totalCosts, totalProfit, avgProfitMargin }
  }

  // Calculate payment metrics
  const calculatePaymentMetrics = () => {
    if (!pieChartData.length) return { totalInvoices: 0, paidPercentage: 0, overduePercentage: 0 }

    const totalInvoices = pieChartData.reduce((sum, item) => sum + item.value, 0)
    const paidInvoices = pieChartData.find((item) => item.name === "Paid")?.value || 0
    const overdueInvoices = pieChartData.find((item) => item.name === "Overdue")?.value || 0

    const paidPercentage = (paidInvoices / totalInvoices) * 100
    const overduePercentage = (overdueInvoices / totalInvoices) * 100

    return { totalInvoices, paidPercentage, overduePercentage }
  }

  const { totalRevenue, totalCosts, totalProfit, avgProfitMargin } = calculateProjectTotals()
  const { totalInvoices, paidPercentage, overduePercentage } = calculatePaymentMetrics()

  // Check if documents have been uploaded
  const hasDocuments = () => {
    const userId = localStorage.getItem("user_id")
    if (!userId) return false

    // Check localStorage for user-specific document ID
    const userFileId = localStorage.getItem(`uploadedFileId_${userId}`)
    if (userFileId) return true

    // If no document in localStorage, check the documents array for user-specific documents
    if (documents && documents.length > 0) {
      // Only count documents explicitly associated with this user
      const userDocuments = documents.filter((doc) => doc.user_id === userId)
      return userDocuments.length > 0
    }

    return false
  }

  // Replace this line:
  // const hasDocuments = documents && documents.length > 0

  // With this:
  const userHasDocuments = hasDocuments()

  // Custom tooltip for line chart
  const CustomLineTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium text-gray-700">{label}</p>
          {payload.map((entry) => (
            <p
              key={entry.dataKey}
              className={`text-sm ${
                entry.dataKey === "inflow"
                  ? "text-green-600"
                  : entry.dataKey === "outflow"
                    ? "text-red-600"
                    : "text-blue-600"
              }`}
            >
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const getFileId = () => {
    // Get the current user ID
    const userId = localStorage.getItem("user_id")

    // Get user-specific file ID
    if (userId) {
      // First check documents array
      if (documents && documents.length > 0) {
        // Filter documents by user ID if the property exists
        const userDocuments = documents.filter((doc) => !doc.user_id || doc.user_id === userId)
        if (userDocuments.length > 0) {
          return userDocuments[0].id
        }
      }

      // Then check localStorage
      return localStorage.getItem(`uploadedFileId_${userId}`)
    }

    return null
  }

  // Export cash flow data as CSV
  const exportCashFlowCSV = () => {
    if (!cashFlowData) return

    const { months, inflows, outflows, net_flow } = cashFlowData

    let csvContent = "Month,Inflow,Outflow,Net Flow\n"

    months.forEach((month, index) => {
      csvContent += `${month},${inflows[index]},${outflows[index]},${net_flow[index]}\n`
    })

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `cash_flow_${getFileId()}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  // Export project profitability data as CSV
  const exportProjectsCSV = () => {
    if (!projectProfitabilityData) return

    let csvContent = "Project,Revenue,Costs,Profit,Profit Margin,Status\n"

    projectData.forEach((project) => {
      csvContent += `"${project.name}",${project.revenue},${project.costs},${project.profit},${project.profitMargin},"${project.status}"\n`
    })

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `project_profitability_${getFileId()}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  // Export payment status data as CSV
  const exportPaymentStatusCSV = () => {
    if (!paymentStatusData) return

    let csvContent = "Status,Count\n"

    paymentStatusData.labels.forEach((label, index) => {
      csvContent += `"${label}",${paymentStatusData.values[index]}\n`
    })

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `payment_status_${getFileId()}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
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
        <div className="flex justify-between items-center p-6">
          <h1 className="text-2xl font-semibold text-[#6b7280]">DASHBOARD</h1>
          <div className="flex items-center gap-4">
            {user && <div className="text-gray-600">Welcome, {user.name}</div>}
            {userHasDocuments && (
              <button className="bg-white text-[#8b5cf6] px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow">
                Export
              </button>
            )}
          </div>
        </div>

        {loading.documents ? (
          // Loading state for documents check
          <div className="flex items-center justify-center h-64">
            <Loader className="w-8 h-8 text-[#a78bfa] animate-spin" />
          </div>
        ) : !userHasDocuments ? (
          // No documents uploaded yet
          <div className="flex flex-col items-center justify-center p-8 h-[calc(100vh-150px)]">
            <div className="bg-white p-8 rounded-lg shadow-sm max-w-2xl w-full text-center">
              <div className="w-16 h-16 bg-[#a78bfa] rounded-full flex items-center justify-center mx-auto mb-6">
                <FileSpreadsheet className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">No Financial Data Available</h2>
              <p className="text-gray-500 mb-8">
                To see your financial analysis and insights, please upload your Excel document first.
              </p>
              <Link
                to="/upload"
                className="inline-flex items-center px-6 py-3 bg-[#a78bfa] text-white rounded-full hover:bg-[#9061f9] transition-colors"
              >
                Upload Excel Document <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          // Documents exist, show dashboard content
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-6">
              {loading.dashboard ? (
                // Loading skeleton for stats
                Array(4)
                  .fill(0)
                  .map((_, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  ))
              ) : error.dashboard ? (
                <div className="col-span-4 bg-red-50 p-4 rounded-lg text-red-500">
                  Error loading stats: {error.dashboard}
                </div>
              ) : (
                statsData.map((stat) => (
                  <div key={stat.id} className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center mb-2">
                      {stat.icon}
                      <div className="text-sm text-gray-500 ml-2">{stat.title}</div>
                    </div>
                    <div className="text-2xl font-semibold text-[#6b7280]">{stat.value}</div>
                  </div>
                ))
              )}
            </div>

            {/* Cash Flow Timeline Section */}
            <div className="bg-white rounded-lg shadow-sm m-6">
              {/* Header with toggle */}
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <div className="flex items-center">
                  <h2 className="text-lg font-semibold text-[#374151]">CASH FLOW TIMELINE</h2>
                  <button
                    onClick={() => setShowDetailedCashFlow(!showDetailedCashFlow)}
                    className="ml-4 text-[#8b5cf6] flex items-center text-sm"
                  >
                    {showDetailedCashFlow ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-1" /> Show Summary
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1" /> Show Details
                      </>
                    )}
                  </button>
                </div>
                {showDetailedCashFlow && (
                  <div className="flex items-center gap-4">
                    <div className="flex bg-gray-100 rounded-full p-1">
                      <button
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          cashFlowChartType === "line" ? "bg-white text-[#8b5cf6] shadow-sm" : "text-gray-600"
                        }`}
                        onClick={() => setCashFlowChartType("line")}
                      >
                        Line
                      </button>
                      <button
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          cashFlowChartType === "bar" ? "bg-white text-[#8b5cf6] shadow-sm" : "text-gray-600"
                        }`}
                        onClick={() => setCashFlowChartType("bar")}
                      >
                        Bar
                      </button>
                    </div>
                    <button
                      onClick={exportCashFlowCSV}
                      className="flex items-center text-[#8b5cf6] text-sm"
                      disabled={loading.cashFlow}
                    >
                      <Download className="w-4 h-4 mr-1" /> Export
                    </button>
                  </div>
                )}
              </div>

              {/* Summary Chart */}
              {!showDetailedCashFlow && (
                <div className="p-6">
                  <div className="h-72">
                    {loading.cashFlow ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader className="w-8 h-8 text-[#a78bfa] animate-spin" />
                      </div>
                    ) : error.cashFlow ? (
                      <div className="flex items-center justify-center h-full text-red-500">
                        Error loading chart data: {error.cashFlow}
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={lineChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                          <Tooltip content={<CustomLineTooltip />} />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="inflow"
                            name="Inflow"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={{ r: 3, fill: "#10b981", stroke: "#10b981" }}
                            activeDot={{ r: 5, fill: "#10b981", stroke: "white", strokeWidth: 2 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="outflow"
                            name="Outflow"
                            stroke="#ef4444"
                            strokeWidth={2}
                            dot={{ r: 3, fill: "#ef4444", stroke: "#ef4444" }}
                            activeDot={{ r: 5, fill: "#ef4444", stroke: "white", strokeWidth: 2 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="netFlow"
                            name="Net Flow"
                            stroke="#a78bfa"
                            strokeWidth={2}
                            dot={{ r: 3, fill: "#a78bfa", stroke: "#a78bfa" }}
                            activeDot={{ r: 5, fill: "#a78bfa", stroke: "white", strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              )}

              {/* Detailed Cash Flow Analysis */}
              {showDetailedCashFlow && (
                <div className="p-6">
                  {/* Cash Flow Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <div className="text-sm text-gray-500 ml-2">Total Inflow</div>
                      </div>
                      <div className="text-xl font-semibold text-[#6b7280]">
                        {loading.cashFlow ? (
                          <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                        ) : (
                          formatCurrency(totalInflow)
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <TrendingDown className="h-5 w-5 text-red-500" />
                        <div className="text-sm text-gray-500 ml-2">Total Outflow</div>
                      </div>
                      <div className="text-xl font-semibold text-[#6b7280]">
                        {loading.cashFlow ? (
                          <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                        ) : (
                          formatCurrency(totalOutflow)
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <DollarSign className="h-5 w-5 text-blue-500" />
                        <div className="text-sm text-gray-500 ml-2">Net Profit</div>
                      </div>
                      <div className={`text-xl font-semibold ${totalNetFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {loading.cashFlow ? (
                          <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                        ) : (
                          formatCurrency(totalNetFlow)
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Chart */}
                  <div className="h-80">
                    {loading.cashFlow ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader className="w-8 h-8 text-[#a78bfa] animate-spin" />
                      </div>
                    ) : error.cashFlow ? (
                      <div className="flex items-center justify-center h-full text-red-500">
                        Error loading cash flow data: {error.cashFlow}
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        {cashFlowChartType === "line" ? (
                          <LineChart data={detailedCashFlowData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={(value) => `${value >= 0 ? "+" : ""}₹${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip content={<CustomLineTooltip />} />
                            <Legend />
                            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                            <Line
                              type="monotone"
                              dataKey="inflow"
                              name="Inflow"
                              stroke="#10b981"
                              strokeWidth={2}
                              dot={{ r: 4, fill: "#10b981", stroke: "#10b981" }}
                              activeDot={{ r: 6, fill: "#10b981", stroke: "white", strokeWidth: 2 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="outflow"
                              name="Outflow"
                              stroke="#ef4444"
                              strokeWidth={2}
                              dot={{ r: 4, fill: "#ef4444", stroke: "#ef4444" }}
                              activeDot={{ r: 6, fill: "#ef4444", stroke: "white", strokeWidth: 2 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="netFlow"
                              name="Net Flow"
                              stroke="#a78bfa"
                              strokeWidth={2}
                              dot={{ r: 4, fill: "#a78bfa", stroke: "#a78bfa" }}
                              activeDot={{ r: 6, fill: "#a78bfa", stroke: "white", strokeWidth: 2 }}
                            />
                          </LineChart>
                        ) : (
                          <BarChart data={detailedCashFlowData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={(value) => `${value >= 0 ? "+" : ""}₹${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip content={<CustomLineTooltip />} />
                            <Legend />
                            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                            <Bar dataKey="inflow" name="Inflow" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="outflow" name="Outflow" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="netFlow" name="Net Flow" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Monthly Data Table */}
                  <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Month
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Inflow
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Outflow
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Net Flow
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {loading.cashFlow ? (
                          Array(12)
                            .fill(0)
                            .map((_, index) => (
                              <tr key={index} className="animate-pulse">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                                </td>
                              </tr>
                            ))
                        ) : error.cashFlow ? (
                          <tr>
                            <td colSpan="4" className="px-6 py-4 text-center text-red-500">
                              Error loading cash flow data
                            </td>
                          </tr>
                        ) : (
                          detailedCashFlowData.map((item) => (
                            <tr key={item.name} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {item.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                {formatCurrency(item.inflow)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                {formatCurrency(item.outflow)}
                              </td>
                              <td
                                className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                  item.netFlow >= 0 ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {formatCurrency(item.netFlow)}
                              </td>
                            </tr>
                          ))
                        )}
                        {/* Total row */}
                        {!loading.cashFlow && !error.cashFlow && (
                          <tr className="bg-gray-50 font-medium">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Total</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                              {formatCurrency(totalInflow)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                              {formatCurrency(totalOutflow)}
                            </td>
                            <td
                              className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                totalNetFlow >= 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {formatCurrency(totalNetFlow)}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-6 mb-6">
              {/* Revenue and Expense Charts */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-[#374151]">
                    {activeFinancialView === "revenue"
                      ? "REVENUE BY CATEGORY OF THIS MONTH"
                      : "EXPENSES BY CATEGORY OF THIS MONTH"}
                  </h2>
                  <div className="flex bg-gray-100 rounded-full p-1">
                    <button
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        activeFinancialView === "revenue" ? "bg-white text-[#8b5cf6] shadow-sm" : "text-gray-600"
                      }`}
                      onClick={() => setActiveFinancialView("revenue")}
                    >
                      Revenue
                    </button>
                    <button
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        activeFinancialView === "expense" ? "bg-white text-[#8b5cf6] shadow-sm" : "text-gray-600"
                      }`}
                      onClick={() => setActiveFinancialView("expense")}
                    >
                      Expenses
                    </button>
                  </div>
                </div>
                <div className="h-64">
                  {loading.revenueExpenses ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader className="w-8 h-8 text-[#a78bfa] animate-spin" />
                    </div>
                  ) : error.revenueExpenses ? (
                    <div className="flex items-center justify-center h-full text-red-500">
                      Error loading chart data: {error.revenueExpenses}
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={activeFinancialView === "revenue" ? barChartData : expenseChartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 30 }} // Increased bottom margin
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          height={50} // Increased height for labels
                          tick={{ fontSize: 12, width: 100, angle: 0 }} // Adjusted tick properties
                        />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                        <Tooltip
                          formatter={(value) => [
                            `${formatCurrency(value)}`,
                            activeFinancialView === "revenue" ? "Revenue" : "Expense",
                          ]}
                          labelStyle={{ color: "#374151" }}
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "0.375rem",
                            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                          }}
                        />
                        <Bar
                          dataKey="value"
                          fill={activeFinancialView === "revenue" ? "#a78bfa" : "#ef4444"}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
                {/* Current Month Display */}
                <div className="text-center mt-4 text-gray-500">
                  {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
                </div>
              </div>

              {/* Pie chart - Payment Status */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-[#374151]">PAYMENT STATUS</h2>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={exportPaymentStatusCSV}
                      className="flex items-center text-[#8b5cf6] text-sm"
                      disabled={loading.paymentStatus}
                    >
                      <Download className="w-4 h-4 mr-1" /> Export
                    </button>
                  </div>
                </div>

                {/* Payment metrics */}
                {!loading.paymentStatus && !error.paymentStatus && (
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Total Invoices</div>
                      <div className="text-xl font-semibold text-[#6b7280]">{totalInvoices}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Paid Rate</div>
                      <div className="text-xl font-semibold text-green-600">{formatPercentage(paidPercentage)}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Overdue Rate</div>
                      <div className="text-xl font-semibold text-red-600">{formatPercentage(overduePercentage)}</div>
                    </div>
                  </div>
                )}

                <div className="h-64 flex items-center">
                  {loading.paymentStatus ? (
                    <div className="flex items-center justify-center w-full">
                      <Loader className="w-8 h-8 text-[#a78bfa] animate-spin" />
                    </div>
                  ) : error.paymentStatus ? (
                    <div className="flex items-center justify-center w-full text-red-500">
                      Error loading payment data: {error.paymentStatus}
                    </div>
                  ) : (
                    <>
                      <div className="w-1/2">
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={pieChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                              // Remove the label that gets cut off and rely on the legend instead
                              label={false}
                              labelLine={false}
                            >
                              {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [value, "Invoices"]} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="w-1/2">
                        <div className="space-y-4 pl-4">
                          {" "}
                          {/* Added left padding */}
                          {pieChartData.map((item) => (
                            <div key={item.name} className="flex items-center">
                              <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: item.color }}></div>
                              <div className="text-sm font-medium text-gray-600">{item.name}</div>
                              <div className="ml-auto text-sm font-medium">{item.value}</div>
                            </div>
                          ))}
                          <div className="pt-2 border-t border-gray-100">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-700">Total</div>
                              <div className="ml-auto text-sm font-medium">{totalInvoices}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                {/* Add this after the pie chart */}
                <div className="mt-4 flex justify-end">
                  <DebugButton>Verify Data Source</DebugButton>
                </div>
              </div>
            </div>

            {/* Project Profitability Section */}
            <div className="bg-white rounded-lg shadow-sm m-6">
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-[#374151]">PROJECT PROFITABILITY</h2>
                <div className="flex items-center gap-4">
                  <button
                    onClick={exportProjectsCSV}
                    className="flex items-center text-[#8b5cf6] text-sm"
                    disabled={loading.projectProfitability}
                  >
                    <Download className="w-4 h-4 mr-1" /> Export
                  </button>
                  <button className="flex items-center text-[#8b5cf6] text-sm">
                    <Filter className="w-4 h-4 mr-1" /> Filter
                  </button>
                </div>
              </div>

              {/* Project Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <BarChart3 className="h-5 w-5 text-[#8b5cf6]" />
                    <div className="text-sm text-gray-500 ml-2">Total Projects</div>
                  </div>
                  <div className="text-xl font-semibold text-[#6b7280]">
                    {loading.projectProfitability ? (
                      <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    ) : (
                      projectData.length
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    <div className="text-sm text-gray-500 ml-2">Total Revenue</div>
                  </div>
                  <div className="text-xl font-semibold text-[#6b7280]">
                    {loading.projectProfitability ? (
                      <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    ) : (
                      formatCurrency(totalRevenue)
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <TrendingDown className="h-5 w-5 text-red-500" />
                    <div className="text-sm text-gray-500 ml-2">Total Costs</div>
                  </div>
                  <div className="text-xl font-semibold text-[#6b7280]">
                    {loading.projectProfitability ? (
                      <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    ) : (
                      formatCurrency(totalCosts)
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    <div className="text-sm text-gray-500 ml-2">Avg. Profit Margin</div>
                  </div>
                  <div className="text-xl font-semibold text-[#6b7280]">
                    {loading.projectProfitability ? (
                      <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    ) : (
                      formatPercentage(avgProfitMargin)
                    )}
                  </div>
                </div>
              </div>

              {/* Project Table */}
              <div className="p-6 pt-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => requestSort("name")}
                        >
                          <div className="flex items-center">Project {getSortDirectionIndicator("name")}</div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => requestSort("revenue")}
                        >
                          <div className="flex items-center">Revenue {getSortDirectionIndicator("revenue")}</div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => requestSort("costs")}
                        >
                          <div className="flex items-center">Costs {getSortDirectionIndicator("costs")}</div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => requestSort("profit")}
                        >
                          <div className="flex items-center">Profit {getSortDirectionIndicator("profit")}</div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => requestSort("profitMargin")}
                        >
                          <div className="flex items-center">
                            Profit Margin {getSortDirectionIndicator("profitMargin")}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => requestSort("status")}
                        >
                          <div className="flex items-center">Status {getSortDirectionIndicator("status")}</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading.projectProfitability ? (
                        Array(6)
                          .fill(0)
                          .map((_, index) => (
                            <tr key={index} className="animate-pulse">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="h-4 bg-gray-200 rounded w-40"></div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                              </td>
                            </tr>
                          ))
                      ) : error.projectProfitability ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 text-center text-red-500">
                            Error loading project profitability data: {error.projectProfitability}
                          </td>
                        </tr>
                      ) : (
                        projectData.map((project) => (
                          <tr key={project.name} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {project.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(project.revenue)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(project.costs)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                              {formatCurrency(project.profit)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatPercentage(project.profitMargin)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${
                                  project.status === "In Progress"
                                    ? "bg-blue-100 text-blue-800"
                                    : project.status === "Completed"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {project.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    {/* Summary row */}
                    {!loading.projectProfitability && !error.projectProfitability && (
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(totalRevenue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(totalCosts)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            {formatCurrency(totalProfit)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatPercentage(avgProfitMargin)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap"></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </div>
          </>
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
