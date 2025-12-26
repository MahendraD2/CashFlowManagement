"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
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
} from "recharts";
import {
  LayoutDashboard,
  FileUp,
  PieChartIcon,
  Bell,
  User,
} from "lucide-react";

export default function Dashboard() {
  // Dummy data for the line chart
  const lineChartData = [
    { name: "Jan", value: 65 },
    { name: "Feb", value: 45 },
    { name: "Mar", value: 50 },
    { name: "Apr", value: 90 },
    { name: "May", value: 60 },
    { name: "Jun", value: 75 },
    { name: "Jul", value: 40 },
    { name: "Aug", value: 30 },
    { name: "Sep", value: 50 },
    { name: "Oct", value: 30 },
    { name: "Nov", value: 25 },
    { name: "Dec", value: 20 },
  ];

  // Dummy data for the bar chart
  const barChartData = [
    { name: "Jan", value: 340 },
    { name: "Feb", value: 420 },
    { name: "Mar", value: 380 },
    { name: "Apr", value: 620 },
    { name: "May", value: 520 },
    { name: "Jun", value: 400 },
  ];

  // Dummy data for the pie chart
  const pieChartData = [
    { name: "Inflow", value: 2300, color: "#a78bfa" },
    { name: "Outflow", value: 4570, color: "#e9d5ff" },
  ];

  // Stats data
  const statsData = [
    { title: "Total Revenue", value: "132", id: "revenue" },
    { title: "Inflow", value: "23", id: "inflow" },
    { title: "Outflow", value: "864", id: "outflow" },
    { title: "Payment pending", value: "47", id: "pending" },
  ];

  // Active navigation item
  const [activeNav, setActiveNav] = useState("dashboard");

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
        <div className="flex justify-between items-center p-6">
          <h1 className="text-2xl font-semibold text-[#6b7280]">DASHBOARD</h1>
          <button className="bg-white text-[#8b5cf6] px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow">
            Export
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-4 gap-4 px-6">
          {statsData.map((stat) => (
            <div key={stat.id} className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">{stat.title}</div>
              <div className="text-3xl font-semibold mt-1 text-[#6b7280]">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Line chart */}
        <div className="bg-white rounded-lg shadow-sm m-6 p-6">
          <h2 className="text-lg font-semibold mb-4 text-[#374151]">REPORT</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={lineChartData}
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
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.1} />
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

        {/* Bottom charts */}
        <div className="grid grid-cols-2 gap-4 px-6 mb-6">
          {/* Bar chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 text-[#374151]">GRAPH</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip />
                  <Bar dataKey="value" fill="#e9d5ff" radius={[4, 4, 0, 0]}>
                    {barChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 3 ? "#a78bfa" : "#e9d5ff"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 text-[#374151]">
              Statistics
            </h2>
            <div className="h-64 flex items-center">
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
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="text-center">
                  <div className="text-2xl font-bold">6 870</div>
                  <div className="text-sm text-gray-500">Total</div>
                </div>
              </div>
              <div className="w-1/2">
                <div className="space-y-4">
                  {pieChartData.map((item) => (
                    <div key={item.name} className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <div className="text-sm text-gray-600">
                        {item.name.toLowerCase()}
                      </div>
                    </div>
                  ))}
                </div>
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
