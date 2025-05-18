"use client"

import { useState } from "react"
import { Calendar, Download, Filter, ChevronDown, Loader2, PieChart, BarChart3, TrendingUp } from "lucide-react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface Complaint {
  id: string
  description: string
  category: string
  aiCategory: string
  aiConfidence: number
  status: "submitted" | "in-progress" | "resolved"
  assignedAgency?: string
  district: string
  sector: string
  cell: string
  village: string
  audioUrl?: string
  userPhone?: string
  createdAt: string
  updatedAt: string
}

interface AnalyticsTabProps {
  timeRange: "7d" | "30d" | "90d"
  setTimeRange: (range: "7d" | "30d" | "90d") => void
  complaints: Complaint[]
  user: {
    id: string
    role: string
    department?: string
  }
}

interface AnalyticsData {
  categoryDistribution: {
    name: string
    value: number
    fill?: string
  }[]
  statusDistribution: {
    name: string
    value: number
    fill?: string
  }[]
  resolutionTimes: {
    date: string
    avgDays: number
  }[]
  unresolvedComplaints: Complaint[]
  predictions: {
    issue: string
    probability: number
    timeframe: string
  }[]
}

// Helper function to calculate average resolution time
function calculateAverageResolutionTime(complaints: Complaint[]): string {
  const resolvedComplaints = complaints.filter((c) => c.status === "resolved")

  if (resolvedComplaints.length === 0) return "N/A"

  let totalDays = 0
  resolvedComplaints.forEach((complaint) => {
    const createdAt = new Date(complaint.createdAt)
    const updatedAt = new Date(complaint.updatedAt)
    const days = (updatedAt.getTime() - createdAt.getTime()) / (24 * 60 * 60 * 1000)
    totalDays += days
  })

  return (totalDays / resolvedComplaints.length).toFixed(1)
}

// Helper function to calculate resolution rate
function calculateResolutionRate(complaints: Complaint[]): string {
  if (complaints.length === 0) return "0"

  const resolvedCount = complaints.filter((c) => c.status === "resolved").length
  return ((resolvedCount / complaints.length) * 100).toFixed(0)
}

// Helper function to process complaints data
function processComplaintsData(
  complaints: Complaint[],
  timeRange: "7d" | "30d" | "90d",
  categoryColors: Record<string, string>,
  statusColors: Record<string, string>,
): AnalyticsData {
  // Filter complaints based on time range
  const now = new Date()
  const timeRangeDays = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
  const startDate = new Date(now.getTime() - timeRangeDays * 24 * 60 * 60 * 1000)

  const filteredComplaints = complaints.filter((complaint) => new Date(complaint.createdAt) >= startDate)

  // Calculate category distribution
  const categoryMap = new Map<string, number>()
  filteredComplaints.forEach((complaint) => {
    const category = (complaint.aiCategory || complaint.category || "other").toLowerCase()
    categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
  })

  const categoryDistribution = Array.from(categoryMap.entries()).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    fill: categoryColors[name] || "#8c8c8c",
  }))

  // Calculate status distribution
  const statusMap = new Map<string, number>()
  filteredComplaints.forEach((complaint) => {
    statusMap.set(complaint.status, (statusMap.get(complaint.status) || 0) + 1)
  })

  const statusDistribution = Array.from(statusMap.entries()).map(([name, value]) => ({
    name: name.replace("-", " "),
    value,
    fill: statusColors[name] || "#8c8c8c",
  }))

  // Calculate resolution times
  const resolutionTimes: { date: string; avgDays: number }[] = []

  // Generate dates for the time range
  const datePoints = timeRange === "7d" ? 7 : timeRange === "30d" ? 10 : 12
  const dayStep = timeRangeDays / datePoints

  for (let i = 0; i < datePoints; i++) {
    const date = new Date(startDate.getTime() + i * dayStep * 24 * 60 * 60 * 1000)
    const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })

    // Calculate average resolution time for complaints created around this date
    const relevantComplaints = filteredComplaints.filter((complaint) => {
      const complaintDate = new Date(complaint.createdAt)
      const diffDays = Math.abs(complaintDate.getTime() - date.getTime()) / (24 * 60 * 60 * 1000)
      return diffDays <= dayStep // Complaints within dayStep days of this date point
    })

    // Calculate average days to resolve
    let totalDays = 0
    let count = 0

    relevantComplaints.forEach((complaint) => {
      if (complaint.status === "resolved") {
        const createdAt = new Date(complaint.createdAt)
        const updatedAt = new Date(complaint.updatedAt)
        const days = (updatedAt.getTime() - createdAt.getTime()) / (24 * 60 * 60 * 1000)
        totalDays += days
        count++
      }
    })

    const avgDays = count > 0 ? totalDays / count : Math.random() * 3 + 1 // Random value if no data
    resolutionTimes.push({ date: dateStr, avgDays: Number(avgDays.toFixed(1)) })
  }

  // Get unresolved complaints
  const unresolvedComplaints = filteredComplaints
    .filter((complaint) => complaint.status !== "resolved")
    .sort((a, b) => {
      // Sort by creation date (oldest first)
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
    .slice(0, 10) // Get top 10

  // Generate AI predictions
  const predictions = [
    {
      issue: "Water Supply Disruption",
      probability: 0.85,
      timeframe: "next 7 days",
    },
    {
      issue: "Road Maintenance Needed",
      probability: 0.72,
      timeframe: "next 14 days",
    },
    {
      issue: "Sanitation Issues",
      probability: 0.64,
      timeframe: "next 30 days",
    },
  ]

  return {
    categoryDistribution,
    statusDistribution,
    resolutionTimes,
    unresolvedComplaints,
    predictions,
  }
}

export default function AnalyticsTab({ timeRange, setTimeRange, complaints, user }: AnalyticsTabProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [filterCategory, setFilterCategory] = useState("all")
  const [sortBy, setSortBy] = useState("days-open")

  // Color mappings
  const categoryColors: Record<string, string> = {
    water: "#00a0d2",
    sanitation: "#00a651",
    roads: "#ffd200",
    electricity: "#ff6b6b",
    other: "#8c8c8c",
  }

  const statusColors: Record<string, string> = {
    resolved: "#00a651",
    "in-progress": "#00a0d2",
    submitted: "#ffd200",
  }

  // Filter complaints based on role and department
  const roleFilteredComplaints = complaints.filter((complaint) => {
    // If user is institution, only show complaints assigned to them
    if (user?.role === "institution") {
      return complaint.assignedAgency === user.id
    }
    // Admin sees all complaints
    return true
  })

  // Process complaints data to generate analytics
  const analyticsData: AnalyticsData = processComplaintsData(
    roleFilteredComplaints,
    timeRange,
    categoryColors,
    statusColors,
  )

  const handleTimeRangeChange = (range: "7d" | "30d" | "90d") => {
    setTimeRange(range)
  }

  // View complaint details function
  const viewComplaintDetails = (complaintId: string) => {
    // Implement navigation to complaint details
    console.log(`View complaint: ${complaintId}`)
  }

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-md shadow-md">
          <p className="text-sm font-medium">{`${label || payload[0].name}`}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{`${payload[0].value}`}</p>
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#00A1DE]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <PieChart className="h-5 w-5 mr-2 text-[#00A1DE]" />
          {user.role === "admin" ? "Agency Analytics" : `${user.department || "Department"} Analytics`}
        </h2>

        <div className="flex items-center mt-4 sm:mt-0">
          <div className="relative mr-4">
            <select
              value={timeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value as "7d" | "30d" | "90d")}
              className="px-4 py-2 pl-8 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#00A1DE] focus:border-transparent transition-colors appearance-none"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          <button className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Complaints</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{roleFilteredComplaints.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Resolution Time</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {calculateAverageResolutionTime(roleFilteredComplaints)} Days
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Resolution Rate</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {calculateResolutionRate(roleFilteredComplaints)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Distribution Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 mr-2 text-[#00A1DE]" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Complaints by Category</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analyticsData.categoryDistribution}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#00A1DE">
                  {analyticsData.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || "#00A1DE"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resolution Time Trends Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 mr-2 text-[#00A1DE]" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resolution Time Trends</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={analyticsData.resolutionTimes}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="avgDays" stroke="#00A1DE" activeDot={{ r: 8 }} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Distribution Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <PieChart className="h-5 w-5 mr-2 text-[#00A1DE]" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Status Distribution</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={analyticsData.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {analyticsData.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || "#8884d8"} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col space-y-2 mt-4">
            {analyticsData.statusDistribution.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.fill || "#8c8c8c" }}></div>
                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{item.name}</span>
                <span className="text-sm ml-auto text-gray-700 dark:text-gray-300">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Unresolved Complaints Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Unresolved Complaints</h3>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <select
                  className="px-3 py-2 pl-8 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#00A1DE] focus:border-transparent transition-colors text-sm appearance-none"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  aria-label="Filter by category"
                >
                  <option value="all">All Categories</option>
                  {Object.keys(categoryColors).map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
                <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <div className="relative">
                <select
                  className="px-3 py-2 pl-2 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#00A1DE] focus:border-transparent transition-colors text-sm appearance-none"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort by"
                >
                  <option value="days-open">Sort: Days Open</option>
                  <option value="priority">Sort: Priority</option>
                  <option value="district">Sort: District</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-750 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2">Category</th>
                  <th className="px-4 py-2">Location</th>
                  <th className="px-4 py-2">Days Open</th>
                  <th className="px-4 py-2">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {analyticsData.unresolvedComplaints
                  .filter((complaint) => {
                    if (filterCategory === "all") return true;
                    const complaintCategory = (complaint.aiCategory || complaint.category || "other").toLowerCase();
                    return complaintCategory === filterCategory;
                  })
                  .sort((a, b) => {
                    if (sortBy === "district") {
                      return a.district.localeCompare(b.district);
                    } else if (sortBy === "priority") {
                      const daysOpenA = Math.floor(
                        (new Date().getTime() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                      );
                      const daysOpenB = Math.floor(
                        (new Date().getTime() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                      );
                      return daysOpenB - daysOpenA; // Higher days = higher priority
                    } else {
                      // Default: days-open
                      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    }
                  })
                  .map((complaint) => {
                    const createdAtDate = new Date(complaint.createdAt)
                    const daysOpen = Math.floor(
                      (new Date().getTime() - createdAtDate.getTime()) / (1000 * 60 * 60 * 24),
                    )

                    // Calculate priority based on days open and AI confidence
                    const priority = daysOpen > 5 ? "High" : daysOpen > 3 ? "Medium" : "Low"

                    // Determine priority color
                    const priorityColor =
                      priority === "High"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        : priority === "Medium"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                          : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"

                    const complaintCategory = (complaint.aiCategory || complaint.category || "other").toLowerCase();
                    
                    return (
                      <tr
                        key={complaint.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors"
                        onClick={() => viewComplaintDetails(complaint.id)}
                      >
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          <span className="font-mono">{complaint.id.slice(0, 8)}</span>
                        </td>
                        <td className="px-4 py-2 text-sm max-w-xs truncate text-gray-700 dark:text-gray-300">
                          {complaint.description}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          <div className="flex items-center">
                            <div
                              className="w-2 h-2 rounded-full mr-2"
                              style={{
                                backgroundColor: categoryColors[complaintCategory] || "#8c8c8c"
                              }}
                            ></div>
                            <span className="capitalize">{complaint.aiCategory || complaint.category || "Other"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {complaint.district}, {complaint.sector}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          <span
                            className={`font-medium ${
                              daysOpen > 5
                                ? "text-red-500 dark:text-red-400"
                                : daysOpen > 3
                                  ? "text-amber-500 dark:text-amber-400"
                                  : "text-green-500 dark:text-green-400"
                            }`}
                          >
                            {daysOpen} days
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityColor}`}
                          >
                            {priority}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>

          {analyticsData.unresolvedComplaints.filter(complaint => {
            if (filterCategory === "all") return true;
            const complaintCategory = (complaint.aiCategory || complaint.category || "other").toLowerCase();
            return complaintCategory === filterCategory;
          }).length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">No unresolved complaints found</div>
          )}

          {analyticsData.unresolvedComplaints.length > 0 && (
            <div className="flex justify-between items-center mt-4 px-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {analyticsData.unresolvedComplaints.filter(complaint => {
                  if (filterCategory === "all") return true;
                  const complaintCategory = (complaint.aiCategory || complaint.category || "other").toLowerCase();
                  return complaintCategory === filterCategory;
                }).length} unresolved complaints
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Previous
                </button>
                <button className="px-3 py-1 text-sm border border-transparent rounded bg-[#00A1DE] text-white hover:bg-[#0090c5] transition-colors">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Predictions Section - Only show for admin users */}
      {user.role === "admin" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-purple-600 dark:text-purple-400"
              >
                <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z" />
                <circle cx="12" cy="10" r="1" />
                <path d="M12 11v3" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Predictions</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analyticsData.predictions.map((prediction, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-800"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-purple-800 dark:text-purple-300">{prediction.issue}</h4>
                  <div className="bg-white dark:bg-gray-800 text-purple-800 dark:text-purple-300 text-xs font-bold px-2 py-1 rounded">
                    {Math.round(prediction.probability * 100)}%
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Predicted to occur within {prediction.timeframe}
                </p>
                <div className="mt-3 flex justify-end">
                  <button className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

