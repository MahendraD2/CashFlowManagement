"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts"
import {
  LayoutDashboard,
  FileUp,
  PieChartIcon,
  Bell,
  User,
  ChevronDown,
  ChevronUp,
  Download,
  AlertTriangle,
} from "lucide-react"
import { scenarioService } from "../services/scenarioService"
import { useNotificationCounts } from "../hooks/useNotificationCounts"

export default function ScenarioAnalysis() {
  const [activeNav, setActiveNav] = useState("analysis")
  const { totalCount } = useNotificationCounts()
  const [scenarioInput, setScenarioInput] = useState("")
  const [isAnalyzed, setIsAnalyzed] = useState(false)
  const [predefinedScenarios, setPredefinedScenarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedScenario, setSelectedScenario] = useState(null)
  const [showScenarioDropdown, setShowScenarioDropdown] = useState(false)
  const [simulationResults, setSimulationResults] = useState(null)
  const [customScenarioMode, setCustomScenarioMode] = useState(false)
  const [chartView, setChartView] = useState("line") // "line" or "bar"

  // Fetch predefined scenarios on component mount
  useEffect(() => {
    const fetchPredefinedScenarios = async () => {
      try {
        setLoading(true)
        const scenarios = await scenarioService.getPredefinedScenarios()
        setPredefinedScenarios(scenarios)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching predefined scenarios:", err)
        setError("Failed to load predefined scenarios. Please try again later.")
        setLoading(false)
      }
    }

    fetchPredefinedScenarios()
  }, [])

  // Handle scenario selection
  const handleSelectScenario = (scenario) => {
    setSelectedScenario(scenario)
    setScenarioInput(scenario.description)
    setShowScenarioDropdown(false)
    setCustomScenarioMode(false)
  }

  // Prepare chart data from simulation results
  const prepareChartData = () => {
    if (!simulationResults) return []

    const { original_data, modified_data } = simulationResults

    return original_data.cash_flow.months.map((month, index) => ({
      name: month,
      original: original_data.cash_flow.values[index],
      modified: modified_data.cash_flow.values[index],
      difference: modified_data.cash_flow.values[index] - original_data.cash_flow.values[index],
    }))
  }

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Get risk level color
  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel.toLowerCase()) {
      case "low":
        return "text-green-500 bg-green-50"
      case "medium":
        return "text-orange-500 bg-orange-50"
      case "high":
        return "text-red-500 bg-red-50"
      default:
        return "text-gray-500 bg-gray-50"
    }
  }

  // Export simulation results as CSV
  const exportResults = () => {
    if (!simulationResults) return

    const { original_data, modified_data, impact_summary } = simulationResults

    let csvContent = "data:text/csv;charset=utf-8,"

    // Headers
    csvContent += "Month,Original Cash Flow,Modified Cash Flow,Difference\n"

    // Data rows
    original_data.cash_flow.months.forEach((month, index) => {
      const original = original_data.cash_flow.values[index]
      const modified = modified_data.cash_flow.values[index]
      const difference = modified - original
      csvContent += `${month},${original},${modified},${difference}\n`
    })

    // Summary
    csvContent += "\nImpact Summary\n"
    csvContent += `Revenue Impact,${impact_summary.revenue_impact}\n`
    csvContent += `Cash Flow Impact,${impact_summary.cash_flow_impact}\n`
    csvContent += `Profit Impact,${impact_summary.profit_impact}\n`
    csvContent += `Risk Level,${impact_summary.risk_level}\n`

    // Create download link
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `scenario-analysis-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle scenario analysis
  const handleAnalyze = async () => {
    if (customScenarioMode && scenarioInput.trim() === "") {
      alert("Please enter a scenario to analyze")
      return
    }

    if (!customScenarioMode && !selectedScenario) {
      alert("Please select a scenario to analyze")
      return
    }

    setLoading(true)
    setError(null)

    try {
      let scenarioType, parameters, description

      if (customScenarioMode) {
        // For custom scenarios, we'll use a default type and parameters
        // In a real app, you might want to parse the input or provide more fields
        scenarioType = "custom"
        parameters = { custom_description: scenarioInput }
        description = scenarioInput
      } else {
        // For predefined scenarios, use the selected scenario's parameters
        scenarioType = selectedScenario.parameters.scenario_type
        parameters = {}

        // Extract parameters from the selected scenario
        Object.keys(selectedScenario.parameters).forEach((key) => {
          if (key !== "scenario_type") {
            parameters[key] = selectedScenario.parameters[key]
          }
        })

        description = selectedScenario.description
      }

      // Call the simulation API
      const results = await scenarioService.simulateScenario(scenarioType, parameters, description)

      setSimulationResults(results)
      setIsAnalyzed(true)
      setLoading(false)
    } catch (err) {
      console.error("Error simulating scenario:", err)
      setError("Failed to simulate scenario. Please try again later.")
      setLoading(false)
    }
  }

  // Toggle between custom and predefined scenario modes
  const toggleCustomMode = () => {
    setCustomScenarioMode(!customScenarioMode)
    if (!customScenarioMode) {
      setSelectedScenario(null)
      setScenarioInput("")
    }
  }

  // Toggle chart view between line and bar
  const toggleChartView = () => {
    setChartView(chartView === "line" ? "bar" : "line")
  }

  // Calculate month-by-month percentage changes
  const calculateMonthlyChanges = () => {
    if (!simulationResults) return []

    const { original_data, modified_data } = simulationResults

    return original_data.cash_flow.months.map((month, index) => {
      const originalValue = original_data.cash_flow.values[index]
      const modifiedValue = modified_data.cash_flow.values[index]
      const absoluteChange = modifiedValue - originalValue
      const percentageChange = originalValue !== 0 ? (absoluteChange / originalValue) * 100 : 0

      return {
        month,
        originalValue,
        modifiedValue,
        absoluteChange,
        percentageChange: Number.parseFloat(percentageChange.toFixed(2)),
      }
    })
  }

  // Calculate cumulative cash flow
  const calculateCumulativeCashFlow = () => {
    if (!simulationResults) return []

    const { original_data, modified_data } = simulationResults
    let originalCumulative = 0
    let modifiedCumulative = 0

    return original_data.cash_flow.months.map((month, index) => {
      originalCumulative += original_data.cash_flow.values[index]
      modifiedCumulative += modified_data.cash_flow.values[index]

      return {
        month,
        originalCumulative,
        modifiedCumulative,
        difference: modifiedCumulative - originalCumulative,
      }
    })
  }

  // Calculate financial ratios
  const calculateFinancialRatios = () => {
    if (!simulationResults) return null

    const { original_data, modified_data } = simulationResults

    // Profit margin
    const originalProfitMargin = (original_data.net_profit / original_data.total_revenue) * 100
    const modifiedProfitMargin = (modified_data.net_profit / modified_data.total_revenue) * 100

    // Expense ratio
    const originalExpenseRatio = (original_data.total_expenses / original_data.total_revenue) * 100
    const modifiedExpenseRatio = (modified_data.total_expenses / modified_data.total_revenue) * 100

    return {
      profitMargin: {
        original: Number.parseFloat(originalProfitMargin.toFixed(2)),
        modified: Number.parseFloat(modifiedProfitMargin.toFixed(2)),
        change: Number.parseFloat((modifiedProfitMargin - originalProfitMargin).toFixed(2)),
      },
      expenseRatio: {
        original: Number.parseFloat(originalExpenseRatio.toFixed(2)),
        modified: Number.parseFloat(modifiedExpenseRatio.toFixed(2)),
        change: Number.parseFloat((modifiedExpenseRatio - originalExpenseRatio).toFixed(2)),
      },
    }
  }

  // Identify most impacted months
  const identifyMostImpactedMonths = () => {
    if (!simulationResults) return { positive: [], negative: [] }

    const monthlyChanges = calculateMonthlyChanges()

    // Sort by absolute percentage change
    const sortedMonths = [...monthlyChanges].sort((a, b) => Math.abs(b.percentageChange) - Math.abs(a.percentageChange))

    // Get top 3 positive and negative impacts
    const positiveImpacts = sortedMonths.filter((m) => m.percentageChange > 0).slice(0, 3)

    const negativeImpacts = sortedMonths.filter((m) => m.percentageChange < 0).slice(0, 3)

    return { positive: positiveImpacts, negative: negativeImpacts }
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
          <h1 className="text-2xl font-semibold text-[#6b7280]">SCENARIO ANALYSIS</h1>
        </div>

        {/* Scenario input section */}
        <div className="px-6 mb-6">
          <div className="bg-white rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-[#6b7280]">Select Scenario</h2>
              <div className="flex items-center">
                <button
                  onClick={toggleCustomMode}
                  className={`px-4 py-1 text-sm rounded-full mr-2 ${
                    customScenarioMode ? "bg-[#a78bfa] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Custom
                </button>
                <button
                  onClick={toggleCustomMode}
                  className={`px-4 py-1 text-sm rounded-full ${
                    !customScenarioMode ? "bg-[#a78bfa] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Predefined
                </button>
              </div>
            </div>

            {customScenarioMode ? (
              <div className="mb-4">
                <label className="block text-sm text-[#6b7280] mb-2">Enter Custom Scenario</label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={scenarioInput}
                    onChange={(e) => setScenarioInput(e.target.value)}
                    placeholder="Scenario: payment is delayed by 3 days"
                    className="flex-1 p-3 border border-[#e9d5ff] rounded-md focus:outline-none focus:ring-2 focus:ring-[#a78bfa]"
                  />
                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="px-8 py-2 bg-[#a78bfa] text-white rounded-full hover:bg-[#9061f9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Simulating..." : "Simulate"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm text-[#6b7280] mb-2">Select Predefined Scenario</label>
                <div className="relative">
                  <div
                    className="flex justify-between items-center p-3 border border-[#e9d5ff] rounded-md cursor-pointer"
                    onClick={() => setShowScenarioDropdown(!showScenarioDropdown)}
                  >
                    <span className={selectedScenario ? "text-[#374151]" : "text-gray-400"}>
                      {selectedScenario ? selectedScenario.name : "Select a scenario"}
                    </span>
                    {showScenarioDropdown ? (
                      <ChevronUp size={18} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-400" />
                    )}
                  </div>

                  {showScenarioDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-[#e9d5ff] rounded-md shadow-lg max-h-60 overflow-auto">
                      {loading ? (
                        <div className="p-3 text-center text-gray-500">Loading scenarios...</div>
                      ) : error ? (
                        <div className="p-3 text-center text-red-500">{error}</div>
                      ) : predefinedScenarios.length === 0 ? (
                        <div className="p-3 text-center text-gray-500">No scenarios available</div>
                      ) : (
                        predefinedScenarios.map((scenario) => (
                          <div
                            key={scenario.id}
                            className="p-3 hover:bg-[#f5f3ff] cursor-pointer border-b border-[#e9d5ff] last:border-b-0"
                            onClick={() => handleSelectScenario(scenario)}
                          >
                            <div className="font-medium text-[#374151]">{scenario.name}</div>
                            <div className="text-sm text-gray-500">{scenario.description}</div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleAnalyze}
                    disabled={loading || !selectedScenario}
                    className="px-8 py-2 bg-[#a78bfa] text-white rounded-full hover:bg-[#9061f9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Simulating..." : "Simulate"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analysis Results */}
        {isAnalyzed && simulationResults && (
          <div className="px-6 mb-6">
            <div className="bg-white rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-[#6b7280]">Simulation Results</h2>
                <button
                  onClick={exportResults}
                  className="flex items-center px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  <Download size={16} className="mr-2" />
                  Export Results
                </button>
              </div>

              {/* Impact Summary */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-[#f5f3ff] p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Revenue Impact</div>
                  <div
                    className={`text-xl font-bold ${
                      simulationResults.impact_summary.revenue_impact < 0 ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {simulationResults.impact_summary.revenue_impact > 0 ? "+" : ""}
                    {formatCurrency(simulationResults.impact_summary.revenue_impact)}
                  </div>
                </div>

                <div className="bg-[#f5f3ff] p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Cash Flow Impact</div>
                  <div
                    className={`text-xl font-bold ${
                      simulationResults.impact_summary.cash_flow_impact < 0 ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {simulationResults.impact_summary.cash_flow_impact > 0 ? "+" : ""}
                    {formatCurrency(simulationResults.impact_summary.cash_flow_impact)}
                  </div>
                </div>

                <div className="bg-[#f5f3ff] p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Profit Impact</div>
                  <div
                    className={`text-xl font-bold ${
                      simulationResults.impact_summary.profit_impact < 0 ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {simulationResults.impact_summary.profit_impact > 0 ? "+" : ""}
                    {formatCurrency(simulationResults.impact_summary.profit_impact)}
                  </div>
                </div>

                <div className="bg-[#f5f3ff] p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Risk Level</div>
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(simulationResults.impact_summary.risk_level)}`}
                  >
                    {simulationResults.impact_summary.risk_level}
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-md font-medium text-gray-700 mb-3">Original Financials</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Revenue</div>
                      <div className="text-lg font-semibold">
                        {formatCurrency(simulationResults.original_data.total_revenue)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Expenses</div>
                      <div className="text-lg font-semibold">
                        {formatCurrency(simulationResults.original_data.total_expenses)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Net Profit</div>
                      <div className="text-lg font-semibold">
                        {formatCurrency(simulationResults.original_data.net_profit)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-md font-medium text-gray-700 mb-3">Modified Financials</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Revenue</div>
                      <div className="text-lg font-semibold">
                        {formatCurrency(simulationResults.modified_data.total_revenue)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Expenses</div>
                      <div className="text-lg font-semibold">
                        {formatCurrency(simulationResults.modified_data.total_expenses)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Net Profit</div>
                      <div className="text-lg font-semibold">
                        {formatCurrency(simulationResults.modified_data.net_profit)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Assessment */}
              {simulationResults.impact_summary.risk_level !== "Low" && (
                <div
                  className={`mb-6 p-4 rounded-lg border-l-4 ${
                    simulationResults.impact_summary.risk_level === "High"
                      ? "bg-red-50 border-red-500"
                      : "bg-orange-50 border-orange-500"
                  }`}
                >
                  <div className="flex">
                    <AlertTriangle
                      size={20}
                      className={
                        simulationResults.impact_summary.risk_level === "High" ? "text-red-500" : "text-orange-500"
                      }
                      style={{ marginTop: "2px", marginRight: "8px" }}
                    />
                    <div>
                      <h3
                        className={`font-medium ${
                          simulationResults.impact_summary.risk_level === "High" ? "text-red-800" : "text-orange-800"
                        }`}
                      >
                        {simulationResults.impact_summary.risk_level} Risk Assessment
                      </h3>
                      <p
                        className={
                          simulationResults.impact_summary.risk_level === "High" ? "text-red-700" : "text-orange-700"
                        }
                      >
                        {simulationResults.impact_summary.risk_level === "High"
                          ? "This scenario poses a significant risk to your financial stability. Consider implementing mitigation strategies immediately."
                          : "This scenario poses a moderate risk to your financial performance. Review your contingency plans to address potential issues."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Chart Controls */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-medium text-gray-700">Cash Flow Comparison</h3>
                <div className="flex items-center">
                  <button
                    onClick={toggleChartView}
                    className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    {chartView === "line" ? "Switch to Bar Chart" : "Switch to Line Chart"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cash Flow Comparison Charts */}
        {isAnalyzed && simulationResults && (
          <div className="px-6 mb-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white rounded-lg p-6 h-[400px]">
                {chartView === "line" ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={prepareChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `₹${value.toLocaleString()}`}
                      />
                      <Tooltip
                        formatter={(value) => [`₹${value.toLocaleString()}`, ""]}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Legend />
                      <Line
                        name="Original Cash Flow"
                        type="monotone"
                        dataKey="original"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        name="Modified Cash Flow"
                        type="monotone"
                        dataKey="modified"
                        stroke="#82ca9d"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `₹${value.toLocaleString()}`}
                      />
                      <Tooltip
                        formatter={(value) => [`₹${value.toLocaleString()}`, ""]}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Legend />
                      <Bar name="Original Cash Flow" dataKey="original" fill="#8884d8" />
                      <Bar name="Modified Cash Flow" dataKey="modified" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Monthly Impact Analysis */}
        {isAnalyzed && simulationResults && (
          <div className="px-6 mb-6">
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-md font-medium text-gray-700 mb-4">Monthly Impact Analysis</h3>

              <div className="overflow-x-auto">
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
                        Original
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Modified
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Absolute Change
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        % Change
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {calculateMonthlyChanges().map((item) => (
                      <tr key={item.month}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.month}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(item.originalValue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(item.modifiedValue)}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                            item.absoluteChange >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {item.absoluteChange >= 0 ? "+" : ""}
                          {formatCurrency(item.absoluteChange)}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                            item.percentageChange >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {item.percentageChange >= 0 ? "+" : ""}
                          {item.percentageChange}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Cumulative Cash Flow Chart */}
        {isAnalyzed && simulationResults && (
          <div className="px-6 mb-6">
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-md font-medium text-gray-700 mb-4">Cumulative Cash Flow</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={calculateCumulativeCashFlow()} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value.toLocaleString()}`} />
                    <Tooltip
                      formatter={(value) => [`₹${value.toLocaleString()}`, ""]}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend />
                    <Line
                      name="Original Cumulative"
                      type="monotone"
                      dataKey="originalCumulative"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      name="Modified Cumulative"
                      type="monotone"
                      dataKey="modifiedCumulative"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Financial Ratios */}
        {isAnalyzed && simulationResults && (
          <div className="px-6 mb-6">
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-md font-medium text-gray-700 mb-4">Financial Ratios</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Profit Margin</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Original</div>
                      <div className="text-lg font-semibold">{calculateFinancialRatios().profitMargin.original}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Modified</div>
                      <div className="text-lg font-semibold">{calculateFinancialRatios().profitMargin.modified}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Change</div>
                      <div
                        className={`text-lg font-semibold ${
                          calculateFinancialRatios().profitMargin.change >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {calculateFinancialRatios().profitMargin.change >= 0 ? "+" : ""}
                        {calculateFinancialRatios().profitMargin.change}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Expense Ratio</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Original</div>
                      <div className="text-lg font-semibold">{calculateFinancialRatios().expenseRatio.original}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Modified</div>
                      <div className="text-lg font-semibold">{calculateFinancialRatios().expenseRatio.modified}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Change</div>
                      <div
                        className={`text-lg font-semibold ${
                          calculateFinancialRatios().expenseRatio.change <= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {calculateFinancialRatios().expenseRatio.change >= 0 ? "+" : ""}
                        {calculateFinancialRatios().expenseRatio.change}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Most Impacted Months */}
        {isAnalyzed && simulationResults && (
          <div className="px-6 mb-6">
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-md font-medium text-gray-700 mb-4">Most Impacted Months</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-green-600 mb-3">Positive Impact</h4>
                  {identifyMostImpactedMonths().positive.length > 0 ? (
                    <div className="space-y-3">
                      {identifyMostImpactedMonths().positive.map((item) => (
                        <div key={item.month} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="font-medium">{item.month}</div>
                          <div className="text-green-600 font-medium">+{item.percentageChange}%</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-500 text-center">No positive impacts</div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-red-600 mb-3">Negative Impact</h4>
                  {identifyMostImpactedMonths().negative.length > 0 ? (
                    <div className="space-y-3">
                      {identifyMostImpactedMonths().negative.map((item) => (
                        <div key={item.month} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div className="font-medium">{item.month}</div>
                          <div className="text-red-600 font-medium">{item.percentageChange}%</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-500 text-center">No negative impacts</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="px-6 mb-6">
            <div
              className="bg-white rounded-lg p-6 flex flex-col items-center justify-center"
              style={{ minHeight: "300px" }}
            >
              <div className="w-12 h-12 border-4 border-[#a78bfa] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500">Simulating scenario impact...</p>
              <p className="text-gray-400 text-sm mt-2">This may take a few moments</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="px-6 mb-6">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex">
                <AlertTriangle size={20} className="text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-red-800 font-medium">Error</h3>
                  <p className="text-red-700">{error}</p>
                  <button onClick={() => setError(null)} className="mt-2 text-red-700 underline text-sm">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isAnalyzed && !loading && !error && (
          <div className="px-6 mb-6">
            <div
              className="bg-white rounded-lg p-6 flex flex-col items-center justify-center text-center"
              style={{ minHeight: "300px" }}
            >
              <PieChartIcon size={48} className="text-[#a78bfa] mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No Scenario Simulated Yet</h3>
              <p className="text-gray-500 max-w-md">
                Select a predefined scenario or create a custom one to see how it would impact your financial
                performance.
              </p>
            </div>
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
