"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  LayoutDashboard,
  FileUp,
  PieChartIcon,
  Bell,
  User,
} from "lucide-react";

export default function ScenarioAnalysis() {
  const [activeNav, setActiveNav] = useState("analysis");
  const [scenarioInput, setScenarioInput] = useState("");
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  // Dummy data for the "Before" chart
  const beforeChartData = [
    { name: "Jan", value: 65 },
    { name: "Feb", value: 45 },
    { name: "Mar", value: 55 },
    { name: "Apr", value: 90 },
    { name: "May", value: 58 },
    { name: "Jun", value: 75 },
    { name: "Jul", value: 40 },
    { name: "Aug", value: 30 },
    { name: "Sep", value: 55 },
    { name: "Oct", value: 28 },
    { name: "Nov", value: 25 },
    { name: "Dec", value: 20 },
  ];

  // Dummy data for the "After" chart - will be shown after analysis
  const afterChartData = [
    { name: "Jan", value: 65 },
    { name: "Feb", value: 45 },
    { name: "Mar", value: 55 },
    { name: "Apr", value: 90 },
    { name: "May", value: 58 },
    { name: "Jun", value: 75 },
    { name: "Jul", value: 35 }, // Changed values to simulate scenario impact
    { name: "Aug", value: 25 }, // Changed values to simulate scenario impact
    { name: "Sep", value: 40 }, // Changed values to simulate scenario impact
    { name: "Oct", value: 20 }, // Changed values to simulate scenario impact
    { name: "Nov", value: 15 }, // Changed values to simulate scenario impact
    { name: "Dec", value: 10 }, // Changed values to simulate scenario impact
  ];

  // Handle scenario analysis
  const handleAnalyze = () => {
    if (scenarioInput.trim() === "") {
      alert("Please enter a scenario to analyze");
      return;
    }

    // Here you would typically send the scenario to your backend for analysis
    console.log("Analyzing scenario:", scenarioInput);

    // Simulate analysis completion
    setIsAnalyzed(true);
  };

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
              badge={2}
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
          <h1 className="text-2xl font-semibold text-[#6b7280]">
            SCENARIO ANALYSIS
          </h1>
        </div>

        {/* Scenario input section */}
        <div className="px-6 mb-6">
          <div className="bg-white rounded-lg p-6">
            <div className="mb-4">
              <label className="block text-sm text-[#6b7280] mb-2">
                Enter Scenario
              </label>
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
                  className="px-8 py-2 bg-[#a78bfa] text-white rounded-full hover:bg-[#9061f9] transition-colors"
                >
                  Analyse
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Before and After comparison */}
        <div className="px-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Before section */}
            <div>
              <h2 className="text-lg font-medium text-[#6b7280] mb-4">
                Before
              </h2>
              <div className="bg-white rounded-lg p-6 h-[400px]">
                <h3 className="text-md font-semibold mb-4 text-[#374151]">
                  REPORT
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={beforeChartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#6d28d9",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          padding: "8px",
                        }}
                        itemStyle={{ color: "white" }}
                        formatter={(value) => [`${value} Customers`]}
                        labelFormatter={() => ""}
                      />
                      <defs>
                        <linearGradient
                          id="colorValue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#a78bfa"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#a78bfa"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#a78bfa"
                        strokeWidth={2}
                        dot={{ r: 4, fill: "#a78bfa", stroke: "#a78bfa" }}
                        activeDot={{
                          r: 6,
                          fill: "#a78bfa",
                          stroke: "white",
                          strokeWidth: 2,
                        }}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* After section */}
            <div>
              <h2 className="text-lg font-medium text-[#6b7280] mb-4">After</h2>
              <div className="bg-white rounded-lg p-6 h-[400px]">
                {isAnalyzed ? (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={afterChartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#6d28d9",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            padding: "8px",
                          }}
                          itemStyle={{ color: "white" }}
                          formatter={(value) => [`${value} Customers`]}
                          labelFormatter={() => ""}
                        />
                        <defs>
                          <linearGradient
                            id="colorValueAfter"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#a78bfa"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#a78bfa"
                              stopOpacity={0.1}
                            />
                          </linearGradient>
                        </defs>
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#a78bfa"
                          strokeWidth={2}
                          dot={{ r: 4, fill: "#a78bfa", stroke: "#a78bfa" }}
                          activeDot={{
                            r: 6,
                            fill: "#a78bfa",
                            stroke: "white",
                            strokeWidth: 2,
                          }}
                          fillOpacity={1}
                          fill="url(#colorValueAfter)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-72 flex items-center justify-center text-gray-400">
                    Enter a scenario and click Analyse to see results
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Navigation item component
function NavItem({ icon, label, active, onClick, badge, id, to }) {
  const baseClasses =
    "flex items-center px-3 py-2 text-sm rounded-lg transition-colors";
  const activeClasses = active
    ? "bg-[#a78bfa] text-white font-medium"
    : "text-gray-600 hover:bg-[#e9d5ff] hover:text-gray-900";

  const content = (
    <div className={`${baseClasses} ${activeClasses}`} onClick={onClick}>
      <span className="mr-3">{icon}</span>
      <span>{label}</span>
      {badge && (
        <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {badge}
        </span>
      )}
    </div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }

  return content;
}
