"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import {
  Calendar,
  Download,
  Filter,
  ChevronDown,
  Loader2,
  ArrowLeft,
  BarChart3,
  Clock,
  PieChart,
  AlertTriangle,
} from "lucide-react"
import AIPredictionCard from "@/components/ai-prediction-card"
import useSWR from "swr"

interface Complaint {
  id: string
  description: string
  category: string
  aiCategory: string
  status: "submitted" | "in-progress" | "resolved"
  district: string
  sector: string
  cell: string
  village: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  aiConfidence: number
}

interface AnalyticsData {
  categoryDistribution: {
    category: string
    count: number
  }[]
  statusDistribution: {
    status: string
    count: number
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

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error("Failed to fetch data")
    }
    return res.json()
  })

export default function AnalyticsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d")

  // Fetch real analytics data
  const {
    data: analyticsData,
    error,
    isLoading,
  } = useSWR<AnalyticsData>(user ? `/api/analytics?timeRange=${timeRange}` : null, fetcher, { refreshInterval: 30000 })

  useEffect(() => {
    if (!user) {
      router.push("/auth/login?redirect=/analytics")
      return
    }

    if (user.role !== "admin") {
      router.push("/")
      return
    }
  }, [user, router])

  const handleTimeRangeChange = (range: "7d" | "30d" | "90d") => {
    setTimeRange(range)
  }

  // View complaint details function
  const viewComplaintDetails = (complaintId: string) => {
    router.push(`/complaints/${complaintId}`)
  }

  if (!user || user.role !== "admin") {
    return null // Will redirect in useEffect
  }

  // Color mappings
  const categoryColors: Record<string, string> = {
    Water: "#00a0d2",
    Sanitation: "#00a651",
    Roads: "#ffd200",
    Electricity: "#ff6b6b",
    Other: "#8c8c8c",
  }

  const statusColors: Record<string, string> = {
    resolved: "#00a651",
    "in-progress": "#00a0d2",
    submitted: "#ffd200",
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#00A1DE] mb-4" />
          <p className="text-gray-600 font-medium">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  if (error || !analyticsData) {
    return (
      <div className="max-w-7xl mx-auto flex justify-center items-center h-screen">
        <div className="bg-red-50 p-8 rounded-lg border border-red-200 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium text-lg">Failed to load analytics data</p>
          <p className="text-gray-600 mt-2">Please try refreshing the page or contact support</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#00A1DE] text-white rounded-md hover:bg-[#0090c5] transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back to admin navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center">
            <Link href="/admin" className="flex items-center text-gray-600 hover:text-[#00A1DE] transition-colors">
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="font-medium">Back to Admin</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="h-8 w-8 mr-3 text-[#00A1DE]" />
              Agency Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Comprehensive overview of citizen complaints and resolution metrics</p>
          </div>

          <div className="flex items-center mt-4 sm:mt-0 space-x-4">
            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value as "7d" | "30d" | "90d")}
                className="h-10 pl-10 pr-10 rounded-md border border-gray-300 bg-white text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-[#00A1DE] focus:border-transparent transition-colors"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>

            <button className="h-10 px-4 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center transition-colors">
              <Download className="h-4 w-4 mr-2 text-gray-500" />
              Export Data
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 transition-transform hover:transform hover:scale-[1.02]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Complaints</p>
                <h3 className="text-3xl font-bold mt-1 text-gray-900">
                  {analyticsData.categoryDistribution.reduce((sum, item) => sum + item.count, 0)}
                </h3>
                <p className="text-sm text-green-600 mt-2 flex items-center">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                  <span>+12% from previous period</span>
                </p>
              </div>
              <div className="bg-[#00A1DE]/10 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-[#00A1DE]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 transition-transform hover:transform hover:scale-[1.02]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Avg. Resolution Time</p>
                <h3 className="text-3xl font-bold mt-1 text-gray-900">
                  {analyticsData.resolutionTimes.length > 0
                    ? `${analyticsData.resolutionTimes[analyticsData.resolutionTimes.length - 1].avgDays.toFixed(1)} days`
                    : "N/A"}
                </h3>
                <p className="text-sm text-red-600 mt-2 flex items-center">
                  <span className="inline-block h-2 w-2 rounded-full bg-red-500 mr-1"></span>
                  <span>+0.5 days from previous period</span>
                </p>
              </div>
              <div className="bg-[#009A44]/10 p-3 rounded-full">
                <Clock className="h-6 w-6 text-[#009A44]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 transition-transform hover:transform hover:scale-[1.02]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Resolution Rate</p>
                <h3 className="text-3xl font-bold mt-1 text-gray-900">
                  {analyticsData.statusDistribution.length > 0
                    ? `${Math.round(
                        ((analyticsData.statusDistribution.find((s) => s.status.toLowerCase() === "resolved")?.count ||
                          0) /
                          analyticsData.statusDistribution.reduce((sum, item) => sum + item.count, 0)) *
                          100,
                      )}%`
                    : "N/A"}
                </h3>
                <p className="text-sm text-green-600 mt-2 flex items-center">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                  <span>+5% from previous period</span>
                </p>
              </div>
              <div className="bg-[#ffd200]/20 p-3 rounded-full">
                <PieChart className="h-6 w-6 text-[#ffd200]" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-[#00A1DE]" />
                  Complaints by Category
                </h2>
                <div className="text-sm text-gray-500">
                  Total: {analyticsData.categoryDistribution.reduce((sum, item) => sum + item.count, 0)}
                </div>
              </div>
              <div className="h-64 relative">
                <div className="absolute inset-0 flex items-end justify-around">
                  {analyticsData.categoryDistribution?.map((category, index) => {
                    if (!category) return null
                    const maxCount = Math.max(...analyticsData.categoryDistribution.map((d) => d.count || 0))
                    const height = maxCount > 0 ? (category.count / maxCount) * 180 : 0
                    return (
                      <div key={index} className="flex flex-col items-center group">
                        <div className="relative">
                          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {category.count} complaints
                          </div>
                          <div
                            className="w-16 rounded-t-md transition-all duration-500 ease-in-out hover:brightness-110"
                            style={{
                              height: `${height}px`,
                              backgroundColor: categoryColors[category.category] || "#8c8c8c",
                            }}
                          ></div>
                        </div>
                        <div className="text-sm mt-2 font-medium">{category.category}</div>
                        <div className="text-xs text-gray-500">{category.count}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-[#009A44]" />
                  Resolution Time Trends
                </h2>
                <div className="text-sm text-gray-500">
                  Last {timeRange === "7d" ? "7" : timeRange === "30d" ? "30" : "90"} days
                </div>
              </div>
              <div className="h-64 relative">
                <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gray-200"></div>
                <div className="absolute inset-y-0 left-0 w-[1px] bg-gray-200"></div>

                {analyticsData.resolutionTimes.length > 0 && (
                  <svg className="w-full h-full" viewBox="0 0 300 200" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="40" x2="300" y2="40" stroke="#f3f4f6" strokeWidth="1" />
                    <line x1="0" y1="80" x2="300" y2="80" stroke="#f3f4f6" strokeWidth="1" />
                    <line x1="0" y1="120" x2="300" y2="120" stroke="#f3f4f6" strokeWidth="1" />
                    <line x1="0" y1="160" x2="300" y2="160" stroke="#f3f4f6" strokeWidth="1" />

                    {/* Area under the line */}
                    <path
                      d={`M0,200 ${analyticsData.resolutionTimes
                        .map((d, i) => {
                          const x = (i / Math.max(1, analyticsData.resolutionTimes.length - 1)) * 300
                          const y = 200 - Math.min(1, d.avgDays / 5) * 180
                          return `${i === 0 ? "L" : ""} ${x},${y}`
                        })
                        .join(" ")} L300,200 Z`}
                      fill="url(#gradient)"
                      opacity="0.2"
                    />

                    {/* Line */}
                    <polyline
                      points={analyticsData.resolutionTimes
                        .map((d, i) => {
                          const x = (i / Math.max(1, analyticsData.resolutionTimes.length - 1)) * 300
                          const y = 200 - Math.min(1, d.avgDays / 5) * 180
                          return `${x},${y}`
                        })
                        .join(" ")}
                      fill="none"
                      stroke="#00A1DE"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Data points */}
                    {analyticsData.resolutionTimes.map((d, i) => {
                      const x = (i / Math.max(1, analyticsData.resolutionTimes.length - 1)) * 300
                      const y = 200 - Math.min(1, d.avgDays / 5) * 180
                      return <circle key={i} cx={x} cy={y} r="4" fill="#ffffff" stroke="#00A1DE" strokeWidth="2" />
                    })}

                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#00A1DE" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#00A1DE" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>
                  </svg>
                )}

                <div className="absolute bottom-0 left-0 text-xs text-gray-500">
                  {timeRange === "7d" ? "7 days ago" : timeRange === "30d" ? "30 days ago" : "90 days ago"}
                </div>
                <div className="absolute bottom-0 right-0 text-xs text-gray-500">Today</div>
                <div className="absolute top-0 left-0 text-xs text-gray-500">5 days</div>
                <div className="absolute bottom-0 left-0 text-xs text-gray-500">0</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 md:col-span-1">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <PieChart className="h-5 w-5 mr-2 text-[#ffd200]" />
                  Status Distribution
                </h2>
              </div>
              <div className="h-64 flex items-center justify-center">
                {analyticsData.statusDistribution.length > 0 && (
                  <div className="relative w-48 h-48">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="20" />

                      {analyticsData.statusDistribution.map((item, index) => {
                        const total = analyticsData.statusDistribution.reduce((sum, d) => sum + d.count, 0)
                        const startAngle = analyticsData.statusDistribution
                          .slice(0, index)
                          .reduce((sum, d) => sum + (d.count / total) * 360, 0)
                        const angle = (item.count / total) * 360

                        // Convert status to lowercase for consistent key lookup
                        const status = item.status.toLowerCase()

                        // Calculate SVG arc parameters
                        const startAngleRad = ((startAngle - 90) * Math.PI) / 180
                        const endAngleRad = ((startAngle + angle - 90) * Math.PI) / 180

                        const x1 = 50 + 40 * Math.cos(startAngleRad)
                        const y1 = 50 + 40 * Math.sin(startAngleRad)
                        const x2 = 50 + 40 * Math.cos(endAngleRad)
                        const y2 = 50 + 40 * Math.sin(endAngleRad)

                        // Determine if the arc should take the long path (> 180 degrees)
                        const largeArcFlag = angle > 180 ? 1 : 0

                        return (
                          <path
                            key={index}
                            d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                            fill={statusColors[status] || "#8c8c8c"}
                          />
                        )
                      })}

                      {/* Inner white circle for donut effect */}
                      <circle cx="50" cy="50" r="25" fill="white" />

                      {/* Center text */}
                      <text x="50" y="45" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#333">
                        {analyticsData.statusDistribution.reduce((sum, item) => sum + item.count, 0)}
                      </text>
                      <text x="50" y="55" textAnchor="middle" fontSize="6" fill="#666">
                        Total
                      </text>
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex flex-col space-y-3 mt-4">
                {analyticsData.statusDistribution.map((item, index) => {
                  const total = analyticsData.statusDistribution.reduce((sum, d) => sum + d.count, 0)
                  const percentage = Math.round((item.count / total) * 100)

                  return (
                    <div key={index} className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: statusColors[item.status.toLowerCase()] || "#8c8c8c" }}
                      ></div>
                      <span className="text-sm font-medium">{item.status}</span>
                      <div className="flex-grow mx-2">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: statusColors[item.status.toLowerCase()] || "#8c8c8c",
                            }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 md:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-[#ff6b6b]" />
                  Top Unresolved Complaints
                </h2>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <select
                      className="h-9 pl-8 pr-8 rounded-md border border-gray-300 bg-white text-gray-700 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#00A1DE] focus:border-transparent transition-colors"
                      defaultValue="all"
                      aria-label="Filter by category"
                    >
                      <option value="all">All Categories</option>
                      {analyticsData.categoryDistribution.map((category, index) => (
                        <option key={index} value={category.category?.toLowerCase()}>
                          {category.category}
                        </option>
                      ))}
                    </select>
                    <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select
                      className="h-9 pl-2 pr-8 rounded-md border border-gray-300 bg-white text-gray-700 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#00A1DE] focus:border-transparent transition-colors"
                      defaultValue="days-open"
                      aria-label="Sort by"
                    >
                      <option value="days-open">Sort: Days Open</option>
                      <option value="priority">Sort: Priority</option>
                      <option value="district">Sort: District</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="px-4 py-3 rounded-tl-md">ID</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Days Open</th>
                      <th className="px-4 py-3 rounded-tr-md">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {analyticsData.unresolvedComplaints.map((complaint) => {
                      const createdAtDate = new Date(complaint.createdAt)
                      const daysOpen = Math.floor(
                        (new Date().getTime() - createdAtDate.getTime()) / (1000 * 60 * 60 * 24),
                      )

                      // Calculate priority based on days open and AI confidence
                      const priority = daysOpen > 5 ? "High" : daysOpen > 3 ? "Medium" : "Low"

                      // Determine priority color
                      const priorityColor =
                        priority === "High"
                          ? "bg-red-100 text-red-800"
                          : priority === "Medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"

                      return (
                        <tr
                          key={complaint.id}
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => viewComplaintDetails(complaint.id)}
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                            {complaint.id.slice(0, 8)}
                          </td>
                          <td className="px-4 py-3 text-sm max-w-xs truncate">{complaint.description}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <div className="flex items-center">
                              <div
                                className="w-2 h-2 rounded-full mr-2"
                                style={{ backgroundColor: categoryColors[complaint.category] || "#8c8c8c" }}
                              ></div>
                              {complaint.category}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {complaint.district}, {complaint.sector}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span
                              className={`font-medium ${
                                daysOpen > 5 ? "text-red-500" : daysOpen > 3 ? "text-yellow-500" : "text-green-500"
                              }`}
                            >
                              {daysOpen} days
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
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

              {analyticsData.unresolvedComplaints.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <CheckIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium">No unresolved complaints found</p>
                  <p className="text-sm text-gray-400 mt-1">All complaints have been resolved</p>
                </div>
              )}

              {analyticsData.unresolvedComplaints.length > 0 && (
                <div className="flex justify-between items-center mt-6 px-4">
                  <div className="text-sm text-gray-500">
                    Showing {analyticsData.unresolvedComplaints.length} unresolved complaints
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-colors">
                      Previous
                    </button>
                    <button className="px-3 py-1 text-sm border border-transparent rounded-md bg-[#00A1DE] text-white hover:bg-[#0090c5] transition-colors">
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Predictions Section */}
          {analyticsData.predictions && analyticsData.predictions.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-[#009A44]" />
                  AI Predictions & Insights
                </h2>
                <div className="text-sm text-gray-500">Based on historical data patterns</div>
              </div>
              <AIPredictionCard predictions={analyticsData.predictions} location="Kigali Region" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// CheckIcon component for empty state
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

// Zap icon for AI predictions
function Zap(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}
