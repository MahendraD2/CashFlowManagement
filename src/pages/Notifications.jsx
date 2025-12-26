"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";

export default function Notifications() {
  const [activeNav, setActiveNav] = useState("notifications");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([1, 2, 3, 4, 5]); // Pre-selected rows
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(null);
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc"); // desc = newest first
  const [filterStatus, setFilterStatus] = useState(null);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [filteredData, setFilteredData] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const rowsPerPage = 10;

  // Dummy notification data
  const notificationsData = [
    {
      id: 1,
      name: "Isabelle Stanley",
      avatar: "/placeholder.svg?height=40&width=40",
      address: "686 Blake Highway",
      email: "stanley.l@hotmail.com",
      phone: "527-965-2636",
      date: "Nov 12, 2020",
      status: "New",
    },
    {
      id: 2,
      name: "Jone Blake",
      avatar: "/placeholder.svg?height=40&width=40",
      address: "734 Grimes Plains Apt. 783",
      email: "jone.blake@hotmail.com",
      phone: "849-795-2217",
      date: "Nov 12, 2020",
      status: "New",
    },
    {
      id: 3,
      name: "Jeanette Richardson",
      avatar: "/placeholder.svg?height=40&width=40",
      address: "699 Darrin Shores",
      email: "jeanette.r@gmail.com",
      phone: "304-202-4876",
      date: "Nov 12, 2020",
      status: "New",
    },
    {
      id: 4,
      name: "Cordelia Ferguson",
      avatar: "/placeholder.svg?height=40&width=40",
      address: "872 Fell Crossing",
      email: "ferguson.c@hotmail.com",
      phone: "936-112-9219",
      date: "Nov 12, 2020",
      status: "New",
    },
    {
      id: 5,
      name: "Sylvia West",
      avatar: "/placeholder.svg?height=40&width=40",
      address: "97 Jonatan Inlet Suite 559",
      email: "west.sylvia@hotmail.com",
      phone: "643-648-9664",
      date: "Nov 12, 2020",
      status: "Pending",
    },
    {
      id: 6,
      name: "Henry Mann",
      avatar: "/placeholder.svg?height=40&width=40",
      address: "662 Marks Pass Apt. 637",
      email: "henrymann@gmail.com",
      phone: "275-911-4126",
      date: "Nov 11, 2020",
      status: "Pending",
    },
    {
      id: 7,
      name: "Ryan Montgomery",
      avatar: "/placeholder.svg?height=40&width=40",
      address: "726 Grimes Avenue Apt. 314",
      email: "ryan.mon@hotmail.com",
      phone: "289-684-8441",
      date: "Nov 11, 2020",
      status: "Pending",
    },
    {
      id: 8,
      name: "Harold Atkins",
      avatar: "/placeholder.svg?height=40&width=40",
      address: "298 Jordyn Ford Apt. 694",
      email: "harold.a@hotmail.com",
      phone: "836-729-9248",
      date: "Nov 11, 2020",
      status: "Completed",
    },
    {
      id: 9,
      name: "Bessie Salazar",
      avatar: "/placeholder.svg?height=40&width=40",
      address: "05 Orle Gardens Suite 097",
      email: "bessie.salazar@gmail.com",
      phone: "773-356-0434",
      date: "Nov 11, 2020",
      status: "Completed",
    },
    {
      id: 10,
      name: "Maurice Nichols",
      avatar: "/placeholder.svg?height=40&width=40",
      address: "4226 Torp Lodge",
      email: "maurice.nn@gmail.com",
      phone: "064-902-8616",
      date: "Nov 10, 2020",
      status: "Rejected",
    },
    {
      id: 11,
      name: "Genevieve Figueroa",
      avatar: "/placeholder.svg?height=40&width=40",
      address: "5994 Miller Tunnel Apt. 674",
      email: "genevieve.fig@hotmail.com",
      phone: "179-314-0523",
      date: "Nov 10, 2020",
      status: "Rejected",
    },
    {
      id: 12,
      name: "Mabel Marsh",
      avatar: "/placeholder.svg?height=40&width=40",
      address: "740 Ellsworth Cape Apt. 071",
      email: "mabel.marsh@gmail.com",
      phone: "641-607-0587",
      date: "Nov 10, 2020",
      status: "Completed",
    },
    {
      id: 13,
      name: "Gussie Norman",
      avatar: "/placeholder.svg?height=40&width=40",
      address: "030 Rolfson Ville",
      email: "gussienorman@hotmail.com",
      phone: "993-668-3683",
      date: "Nov 10, 2020",
      status: "Pending",
    },
    // Adding more dummy data to demonstrate pagination
    {
      id: 14,
      name: "Leroy Jenkins",
      avatar: "/placeholder.svg?height=40&width=40",
      address: "123 Main St",
      email: "leroy@example.com",
      phone: "555-123-4567",
      date: "Nov 9, 2020",
      status: "New",
    },
    {
      id: 15,
      name: "Sarah Connor",
      avatar: "/placeholder.svg?height=40&width=40",
      address: "456 Skynet Ave",
      email: "sarah@example.com",
      phone: "555-987-6543",
      date: "Nov 9, 2020",
      status: "Pending",
    },
    {
      id: 16,
      name: "John Doe",
      avatar: "/placeholder.svg?height=40&width=40",
      address: "789 Unknown Blvd",
      email: "john@example.com",
      phone: "555-246-8101",
      date: "Nov 8, 2020",
      status: "Completed",
    },
    {
      id: 17,
      name: "Jane Smith",
      avatar: "/placeholder.svg?height=40&width=40",
      address: "321 Anonymous Ln",
      email: "jane@example.com",
      phone: "555-135-7911",
      date: "Nov 8, 2020",
      status: "Rejected",
    },
    {
      id: 18,
      name: "Bob Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      address: "654 Generic Rd",
      email: "bob@example.com",
      phone: "555-864-2097",
      date: "Nov 7, 2020",
      status: "New",
    },
    {
      id: 19,
      name: "Alice Williams",
      avatar: "/placeholder.svg?height=40&width=40",
      address: "987 Standard St",
      email: "alice@example.com",
      phone: "555-753-1590",
      date: "Nov 7, 2020",
      status: "Pending",
    },
    {
      id: 20,
      name: "Charlie Brown",
      avatar: "/placeholder.svg?height=40&width=40",
      address: "246 Peanuts Dr",
      email: "charlie@example.com",
      phone: "555-369-1478",
      date: "Nov 6, 2020",
      status: "Completed",
    },
    {
      id: 21,
      name: "Lucy van Pelt",
      avatar: "/placeholder.svg?height=40&width=40",
      address: "135 Comic Strip Ct",
      email: "lucy@example.com",
      phone: "555-258-0369",
      date: "Nov 6, 2020",
      status: "Rejected",
    },
    {
      id: 22,
      name: "Linus van Pelt",
      avatar: "/placeholder.svg?height=40&width=40",
      address: "135 Comic Strip Ct",
      email: "linus@example.com",
      phone: "555-147-2583",
      date: "Nov 5, 2020",
      status: "New",
    },
    {
      id: 23,
      name: "Peppermint Patty",
      avatar: "/placeholder.svg?height=40&width=40",
      address: "369 Peanuts Dr",
      email: "patty@example.com",
      phone: "555-036-9147",
      date: "Nov 5, 2020",
      status: "Pending",
    },
    {
      id: 24,
      name: "Marcie Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      address: "258 Comic Strip Ct",
      email: "marcie@example.com",
      phone: "555-925-8036",
      date: "Nov 4, 2020",
      status: "Completed",
    },
    {
      id: 25,
      name: "Schroeder Piano",
      avatar: "/placeholder.svg?height=40&width=40",
      address: "147 Beethoven Blvd",
      email: "schroeder@example.com",
      phone: "555-814-7036",
      date: "Nov 4, 2020",
      status: "Rejected",
    },
    {
      id: 26,
      name: "Franklin Armstrong",
      avatar: "/placeholder.svg?height=40&width=40",
      address: "036 Peanuts Dr",
      email: "franklin@example.com",
      phone: "555-703-6914",
      date: "Nov 3, 2020",
      status: "New",
    },
  ];

  // Parse date strings to Date objects for comparison
  const parseDate = (dateStr) => {
    const parts = dateStr.split(" ");
    const month = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    };
    return new Date(2020, month[parts[0]], Number.parseInt(parts[1]));
  };

  // Filter and sort data
  useEffect(() => {
    let result = [...notificationsData];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.email.toLowerCase().includes(query) ||
          item.address.toLowerCase().includes(query) ||
          item.phone.includes(query)
      );
    }

    // Apply status filter
    if (filterStatus) {
      result = result.filter((item) => item.status === filterStatus);
    }

    // Apply date filter
    if (dateRange.start && dateRange.end) {
      result = result.filter((item) => {
        const itemDate = parseDate(item.date);
        return itemDate >= dateRange.start && itemDate <= dateRange.end;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === "date") {
        comparison = parseDate(a.date) - parseDate(b.date);
      } else if (sortField === "status") {
        comparison = a.status.localeCompare(b.status);
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    setTotalResults(result.length);

    // Apply pagination
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedResult = result.slice(startIndex, startIndex + rowsPerPage);

    setFilteredData(paginatedResult);
  }, [
    searchQuery,
    filterStatus,
    dateRange,
    sortField,
    sortDirection,
    currentPage,
  ]);

  // Handle row selection
  const handleRowSelect = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredData.map((row) => row.id));
    }
    setSelectAll(!selectAll);
  };

  // Handle delete selected
  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) return;

    // In a real app, you would call an API to delete these rows
    // For this demo, we'll just show an alert
    alert(`Deleting ${selectedRows.length} notifications`);

    // Clear selection after delete
    setSelectedRows([]);
    setSelectAll(false);
  };

  // Handle sort toggle
  const handleSortToggle = () => {
    if (sortField === "date") {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField("date");
      setSortDirection("desc"); // Default to newest first
    }
  };

  // Handle status change
  const handleStatusChange = (id, newStatus) => {
    // In a real app, you would update the status in your database
    // For this demo, we'll just show an alert
    alert(`Changing status of notification ${id} to ${newStatus}`);

    // Close the dropdown
    setIsStatusOpen(null);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "New":
        return "text-[#a78bfa]";
      case "Pending":
        return "text-[#f59e0b]";
      case "Completed":
        return "text-[#10b981]";
      case "Rejected":
        return "text-[#ef4444]";
      default:
        return "text-gray-500";
    }
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalResults / rowsPerPage);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if there are few
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate start and end of visible pages
      let start = Math.max(2, currentPage - 1);
      const end = Math.min(start + maxVisiblePages - 3, totalPages - 1);

      // Adjust start if end is maxed out
      if (end === totalPages - 1) {
        start = Math.max(2, end - (maxVisiblePages - 3));
      }

      // Add ellipsis if needed
      if (start > 2) {
        pages.push("...");
      }

      // Add visible pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  // Apply date filter
  const applyDateFilter = () => {
    // In a real app, you would have a date picker component
    // For this demo, we'll just set a fixed date range
    const start = new Date(2020, 10, 10); // Nov 10, 2020
    const end = new Date(2020, 10, 12); // Nov 12, 2020

    setDateRange({ start, end });
    setIsDateFilterOpen(false);
  };

  // Clear date filter
  const clearDateFilter = () => {
    setDateRange({ start: null, end: null });
    setIsDateFilterOpen(false);
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
            NOTIFICATIONS
          </h1>
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
                  placeholder="Search your customer..."
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
                    <span>
                      Filter {filterStatus ? `(${filterStatus})` : ""}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </button>

                  {isFilterOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                      <div className="py-1">
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => {
                            setFilterStatus(null);
                            setIsFilterOpen(false);
                          }}
                        >
                          All
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-[#a78bfa] hover:bg-gray-100"
                          onClick={() => {
                            setFilterStatus("New");
                            setIsFilterOpen(false);
                          }}
                        >
                          New
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-[#f59e0b] hover:bg-gray-100"
                          onClick={() => {
                            setFilterStatus("Pending");
                            setIsFilterOpen(false);
                          }}
                        >
                          Pending
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-[#10b981] hover:bg-gray-100"
                          onClick={() => {
                            setFilterStatus("Completed");
                            setIsFilterOpen(false);
                          }}
                        >
                          Completed
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-[#ef4444] hover:bg-gray-100"
                          onClick={() => {
                            setFilterStatus("Rejected");
                            setIsFilterOpen(false);
                          }}
                        >
                          Rejected
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
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Date Range
                        </p>
                        <p className="text-xs text-gray-500 mb-4">
                          In a real app, this would be a date picker
                        </p>
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
                  <button
                    className="flex items-center px-4 py-2 text-gray-600 text-sm"
                    onClick={handleSortToggle}
                  >
                    {sortField === "date" ? (
                      sortDirection === "desc" ? (
                        <ArrowDown className="mr-2 h-4 w-4" />
                      ) : (
                        <ArrowUp className="mr-2 h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                    )}
                    <span>New Added</span>
                  </button>
                </div>

                <button
                  className="p-2 text-gray-500 hover:text-red-500"
                  onClick={handleDeleteSelected}
                  disabled={selectedRows.length === 0}
                >
                  <Trash2
                    className={`h-5 w-5 ${
                      selectedRows.length === 0 ? "opacity-50" : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Table */}
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
                        <span className="ml-3">Name</span>
                      </div>
                    </th>
                    <th className="px-6 py-3">Address</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Phone</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((notification) => (
                    <tr key={notification.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(notification.id)}
                            onChange={() => handleRowSelect(notification.id)}
                            className="h-4 w-4 text-[#a78bfa] rounded border-gray-300 focus:ring-[#a78bfa]"
                          />
                          <div className="flex items-center ml-3">
                            <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                              <img
                                src={notification.avatar || "/placeholder.svg"}
                                alt={notification.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {notification.name}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {notification.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {notification.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {notification.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {notification.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative">
                          <button
                            className="flex items-center"
                            onClick={() =>
                              setIsStatusOpen(
                                isStatusOpen === notification.id
                                  ? null
                                  : notification.id
                              )
                            }
                          >
                            <span
                              className={`text-sm ${getStatusColor(
                                notification.status
                              )}`}
                            >
                              {notification.status}
                            </span>
                            <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
                          </button>

                          {isStatusOpen === notification.id && (
                            <div className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                              <div className="py-1">
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-[#a78bfa] hover:bg-gray-100"
                                  onClick={() =>
                                    handleStatusChange(notification.id, "New")
                                  }
                                >
                                  New
                                </button>
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-[#f59e0b] hover:bg-gray-100"
                                  onClick={() =>
                                    handleStatusChange(
                                      notification.id,
                                      "Pending"
                                    )
                                  }
                                >
                                  Pending
                                </button>
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-[#10b981] hover:bg-gray-100"
                                  onClick={() =>
                                    handleStatusChange(
                                      notification.id,
                                      "Completed"
                                    )
                                  }
                                >
                                  Completed
                                </button>
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-[#ef4444] hover:bg-gray-100"
                                  onClick={() =>
                                    handleStatusChange(
                                      notification.id,
                                      "Rejected"
                                    )
                                  }
                                >
                                  Rejected
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button
                  className="p-1 rounded-md border border-gray-200"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft
                    className={`h-5 w-5 ${
                      currentPage === 1 ? "text-gray-300" : "text-gray-400"
                    }`}
                  />
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
                        currentPage === page
                          ? "bg-[#a78bfa] text-white"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  className="p-1 rounded-md border border-gray-200"
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight
                    className={`h-5 w-5 ${
                      currentPage === totalPages
                        ? "text-gray-300"
                        : "text-gray-400"
                    }`}
                  />
                </button>
              </div>
              <div className="text-sm text-gray-500">
                {totalResults} Results
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
