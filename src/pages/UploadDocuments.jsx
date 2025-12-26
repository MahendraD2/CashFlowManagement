"use client";

import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  FileUp,
  PieChartIcon,
  Bell,
  User,
  Upload,
} from "lucide-react";

export default function UploadDocuments() {
  const [activeNav, setActiveNav] = useState("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  // Process the files
  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList);
    setFiles([...files, ...newFiles]);

    // Here you would typically upload the files to your server
    console.log("Files to upload:", newFiles);
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current.click();
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
            UPLOAD DOCUMENTS
          </h1>
        </div>

        {/* Upload area */}
        <div className="flex flex-col items-center justify-center px-6 py-10">
          <div
            className={`w-full max-w-3xl h-64 bg-white rounded-lg border-2 border-dashed 
              ${isDragging ? "border-[#a78bfa]" : "border-[#e9d5ff]"} 
              flex flex-col items-center justify-center cursor-pointer transition-colors`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleUploadClick}
          >
            <div className="w-16 h-16 bg-[#a78bfa] rounded-lg flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <p className="text-lg font-medium text-[#6b7280]">DRAG AND DROP</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              multiple
            />
          </div>

          <button
            className="mt-8 bg-[#a78bfa] text-white px-8 py-3 rounded-full shadow-md hover:bg-[#9061f9] transition-colors"
            onClick={handleUploadClick}
          >
            upload
          </button>

          {/* File list - will show if files are selected */}
          {files.length > 0 && (
            <div className="w-full max-w-3xl mt-8">
              <h2 className="text-lg font-medium text-[#6b7280] mb-4">
                Selected Files
              </h2>
              <div className="bg-white rounded-lg p-4 space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center p-2 border border-[#e9d5ff] rounded"
                  >
                    <FileUp className="w-5 h-5 text-[#a78bfa] mr-2" />
                    <span className="text-sm text-[#6b7280]">{file.name}</span>
                    <span className="ml-auto text-xs text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
