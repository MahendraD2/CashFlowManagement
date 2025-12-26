"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileUp,
  PieChartIcon,
  Bell,
  User,
  ChevronDown,
} from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("profile");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    occupation: "",
    company: "",
    city: "",
    zipCode: "",
  });

  const [email, setEmail] = useState("stanley.l@hotmail.com");
  const [password, setPassword] = useState("password123");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [tempEmail, setTempEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // City options for dropdown
  const cityOptions = [
    "New York",
    "Los Angeles",
    "Chicago",
    "Houston",
    "Phoenix",
    "Philadelphia",
    "San Antonio",
    "San Diego",
    "Dallas",
    "San Jose",
  ];

  // Occupation options for dropdown
  const occupationOptions = [
    "Software Developer",
    "Financial Analyst",
    "Marketing Specialist",
    "Project Manager",
    "Data Scientist",
    "Business Analyst",
    "Product Manager",
    "UX Designer",
    "Sales Representative",
    "Human Resources",
  ];

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setHasChanges(true);
  };

  // Handle dropdown selection
  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
    setHasChanges(true);
  };

  // Handle email edit
  const handleEmailEdit = () => {
    if (isEditingEmail) {
      setEmail(tempEmail);
      setIsEditingEmail(false);
      setHasChanges(true);
    } else {
      setTempEmail(email);
      setIsEditingEmail(true);
    }
  };

  // Handle password edit
  const handlePasswordEdit = () => {
    if (isEditingPassword) {
      setPassword(tempPassword);
      setIsEditingPassword(false);
      setHasChanges(true);
    } else {
      setTempPassword(password);
      setIsEditingPassword(true);
    }
  };

  // Handle form submission
  const handleSave = () => {
    // Here you would typically send the data to your backend
    console.log("Saving profile data:", {
      ...formData,
      email,
      password,
    });

    setHasChanges(false);
    // Show success message or redirect
    alert("Profile updated successfully!");
  };

  // Handle cancel
  const handleCancel = () => {
    // Reset form data
    setFormData({
      firstName: "",
      lastName: "",
      occupation: "",
      company: "",
      city: "",
      zipCode: "",
    });
    setIsEditingEmail(false);
    setIsEditingPassword(false);
    setHasChanges(false);
  };

  // Handle logout
  const handleLogout = () => {
    // In a real app, you would clear auth tokens, session data, etc.
    alert("Logging out...");
    // Navigate to login page
    navigate("/");
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
        {/* Header with buttons */}
        <div className="flex justify-between items-center p-6">
          <h1 className="text-2xl font-semibold text-[#6b7280]">
            PERSONAL SETTINGS
          </h1>
          <div className="flex gap-4">
            <button
              onClick={handleCancel}
              className="px-6 py-2 rounded-full bg-white text-[#6b7280] hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`px-6 py-2 rounded-full text-white transition-colors ${
                hasChanges
                  ? "bg-[#a78bfa] hover:bg-[#9061f9]"
                  : "bg-[#c4b5fd] cursor-not-allowed"
              }`}
            >
              Save
            </button>
          </div>
        </div>

        {/* Profile details section */}
        <div className="p-6">
          <div className="bg-white rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-[#6b7280] mb-6">
              PROFILE DETAILS
            </h2>

            <div className="grid grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm text-[#6b7280] mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-[#e9d5ff] rounded-md focus:outline-none focus:ring-2 focus:ring-[#a78bfa]"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm text-[#6b7280] mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-[#e9d5ff] rounded-md focus:outline-none focus:ring-2 focus:ring-[#a78bfa]"
                />
              </div>

              {/* Occupation - Dropdown */}
              <div>
                <label className="block text-sm text-[#6b7280] mb-2">
                  Occupation
                </label>
                <div className="relative">
                  <button
                    type="button"
                    className="w-full p-2 text-left border border-[#e9d5ff] rounded-md focus:outline-none focus:ring-2 focus:ring-[#a78bfa] flex justify-between items-center"
                    onClick={() =>
                      document
                        .getElementById("occupation-dropdown")
                        .classList.toggle("hidden")
                    }
                  >
                    <span
                      className={
                        formData.occupation
                          ? "text-[#6b7280]"
                          : "text-[#c4b5fd]"
                      }
                    >
                      {formData.occupation || "Please select"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#6b7280]" />
                  </button>
                  <div
                    id="occupation-dropdown"
                    className="absolute z-10 w-full mt-1 bg-white border border-[#e9d5ff] rounded-md shadow-lg hidden max-h-60 overflow-auto"
                  >
                    {occupationOptions.map((option) => (
                      <div
                        key={option}
                        className="p-2 hover:bg-[#f5f3ff] cursor-pointer"
                        onClick={() => {
                          handleSelectChange("occupation", option);
                          document
                            .getElementById("occupation-dropdown")
                            .classList.add("hidden");
                        }}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm text-[#6b7280] mb-2">
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-[#e9d5ff] rounded-md focus:outline-none focus:ring-2 focus:ring-[#a78bfa]"
                />
              </div>

              {/* City - Dropdown */}
              <div>
                <label className="block text-sm text-[#6b7280] mb-2">
                  City
                </label>
                <div className="relative">
                  <button
                    type="button"
                    className="w-full p-2 text-left border border-[#e9d5ff] rounded-md focus:outline-none focus:ring-2 focus:ring-[#a78bfa] flex justify-between items-center"
                    onClick={() =>
                      document
                        .getElementById("city-dropdown")
                        .classList.toggle("hidden")
                    }
                  >
                    <span
                      className={
                        formData.city ? "text-[#6b7280]" : "text-[#c4b5fd]"
                      }
                    >
                      {formData.city || "Please select"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#6b7280]" />
                  </button>
                  <div
                    id="city-dropdown"
                    className="absolute z-10 w-full mt-1 bg-white border border-[#e9d5ff] rounded-md shadow-lg hidden max-h-60 overflow-auto"
                  >
                    {cityOptions.map((option) => (
                      <div
                        key={option}
                        className="p-2 hover:bg-[#f5f3ff] cursor-pointer"
                        onClick={() => {
                          handleSelectChange("city", option);
                          document
                            .getElementById("city-dropdown")
                            .classList.add("hidden");
                        }}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ZIP Code */}
              <div>
                <label className="block text-sm text-[#6b7280] mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-[#e9d5ff] rounded-md focus:outline-none focus:ring-2 focus:ring-[#a78bfa]"
                />
              </div>
            </div>
          </div>

          {/* Privacy & Security section */}
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-lg font-medium text-[#6b7280] mb-6">
              PRIVACY & SECURITY
            </h2>

            <div className="grid grid-cols-2 gap-6">
              {/* Email Address */}
              <div className="bg-white p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <label className="block text-sm text-[#6b7280] mb-2">
                      EMAIL ADDRESS
                    </label>
                    {isEditingEmail ? (
                      <input
                        type="email"
                        value={tempEmail}
                        onChange={(e) => setTempEmail(e.target.value)}
                        className="w-full p-2 border border-[#e9d5ff] rounded-md focus:outline-none focus:ring-2 focus:ring-[#a78bfa]"
                      />
                    ) : (
                      <p className="text-[#6b7280]">{email}</p>
                    )}
                  </div>
                  <button
                    onClick={handleEmailEdit}
                    className="px-4 py-1 border border-[#e9d5ff] rounded-full text-[#6b7280] hover:bg-[#f5f3ff] transition-colors"
                  >
                    {isEditingEmail ? "Save" : "Edit"}
                  </button>
                </div>
              </div>

              {/* Password */}
              <div className="bg-white p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <label className="block text-sm text-[#6b7280] mb-2">
                      PASSWORD
                    </label>
                    {isEditingPassword ? (
                      <input
                        type="password"
                        value={tempPassword}
                        onChange={(e) => setTempPassword(e.target.value)}
                        className="w-full p-2 border border-[#e9d5ff] rounded-md focus:outline-none focus:ring-2 focus:ring-[#a78bfa]"
                      />
                    ) : (
                      <p className="text-[#6b7280]">•••••••</p>
                    )}
                  </div>
                  <button
                    onClick={handlePasswordEdit}
                    className="px-4 py-1 border border-[#e9d5ff] rounded-full text-[#6b7280] hover:bg-[#f5f3ff] transition-colors"
                  >
                    {isEditingPassword ? "Save" : "Edit"}
                  </button>
                </div>
              </div>
              {/* Logout Button */}
              <div className="bg-white p-4 rounded-lg col-span-2 mt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="block text-sm text-[#6b7280] mb-2">
                      ACCOUNT ACCESS
                    </label>
                    <p className="text-[#6b7280]">
                      Securely log out of your account
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-6 py-2 bg-[#f9f9f9] border border-[#e9d5ff] text-[#ef4444] rounded-full hover:bg-[#fee2e2] transition-colors"
                  >
                    Logout
                  </button>
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
