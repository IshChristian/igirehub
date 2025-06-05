"use client"

import React from "react"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import {
  Search,
  ChevronRight,
  ChevronUp,
  Edit,
  X,
  UserPlus,
  Trash2,
  RefreshCw,
  MessageSquare,
  Phone,
  BarChart3,
  Users,
  FileText,
  Filter,
  Bell,
  CheckCircle,
  Clock,
  AlertTriangle,
  Briefcase,
  MapPin,
  Calendar,
  Headphones,
  LogOut,
  Download,
  PieChart,
} from "lucide-react"
import useSWR, { mutate } from "swr"
import { toast } from "sonner"
import Link from "next/link"
import ReactPlayer from "react-player"

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
  videoUrl?: string
  userPhone?: string
  createdAt: string
  updatedAt: string
}

interface Institution {
  id: string
  name: string
  email: string
  phone: string
  role: "admin" | "institution"
  department: string
  createdAt: string
  updatedAt: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())



export default function AdminDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"complaints" | "institutions">("complaints")
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d")
  const [expandedComplaint, setExpandedComplaint] = useState<string | null>(null)
  const [editMode, setEditMode] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<Complaint>>({})
  const [showInstitutionForm, setShowInstitutionForm] = useState(false)
  const [newInstitution, setNewInstitution] = useState<Omit<Institution, "id" | "createdAt" | "updatedAt">>({
    name: "",
    email: "",
    phone: "",
    role: "institution",
    department: "",
  })
  const [editInstitution, setEditInstitution] = useState<Institution | null>(null)
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    search: "",
  })
  const [sendingNotification, setSendingNotification] = useState(false)
  const [customMessage, setCustomMessage] = useState("")
  const [showCustomMessageForm, setShowCustomMessageForm] = useState<string | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  // Add a new state variable for tracking when changes are being saved
  const [isSavingChanges, setIsSavingChanges] = useState(false)

  // Fetch data with real-time updates
  const { data: complaints, mutate: mutateComplaints } = useSWR<Complaint[]>("/api/complaints", fetcher, {
    refreshInterval: 5000, // Refresh every 5 seconds
  })
  const { data: institutions } = useSWR<Institution[]>(user?.role === "admin" ? "/api/institutions" : null, fetcher)

  // Filter complaints based on role and department
  const filteredComplaints = complaints?.filter((complaint) => {
    // Base filters for search, status, category
    const matchesStatus = !filters.status || complaint.status === filters.status
    const matchesCategory =
      !filters.category ||
      [complaint.category, complaint.aiCategory].some((c) => c.toLowerCase().includes(filters.category.toLowerCase()))
    const matchesSearch =
      !filters.search ||
      [complaint.description, complaint.id, complaint.district, complaint.sector].some((f) =>
        f.toLowerCase().includes(filters.search.toLowerCase()),
      )

    // Additional filter for institution users - only show complaints assigned to their department
    if (user?.role === "institution") {
      return matchesStatus && matchesCategory && matchesSearch && complaint.assignedAgency === user.id
    }

    return matchesStatus && matchesCategory && matchesSearch
  })

  // Update the updateComplaint function to show loading state
  const updateComplaint = async (id: string, data: Partial<Complaint>) => {
    try {
      setIsSavingChanges(true)
      const response = await fetch(`/api/complaints/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to update complaint")

      // Find the full complaint object
      const complaint = complaints?.find((c) => c.id === id)

      // Send SMS if assigned agency changed and has phone
      if (data.assignedAgency && complaint) {
        const institution = institutions?.find((i) => i.id === data.assignedAgency)

        if (institution?.phone) {
          await sendSMSNotification(institution.phone, complaint, "institution")
        }
      }

      // Send SMS to user if status changed and user has phone
      if (data.status && data.status !== complaint?.status && complaint?.userPhone) {
        await sendStatusUpdateToUser(complaint.userPhone, data.status, complaint.id)
      }

      mutateComplaints()
      toast.success("Complaint updated successfully")
      setEditMode(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed")
    } finally {
      setIsSavingChanges(false)
    }
  }

  // Send SMS via PindoTest
  const sendSMSNotification = async (phone: string, complaint: Complaint, recipientType: "institution" | "user") => {
    try {
      let message = ""

      if (recipientType === "institution") {
        message = `New complaint assigned: ${complaint.description.substring(0, 50)}... 
        Location: ${complaint.district}, ${complaint.sector}
        Status: ${complaint.status}`
      } else {
        // Message for user
        message = `Your complaint about "${complaint.description.substring(0, 30)}..." has been updated.
        Status: ${complaint.status}
        Thank you for your report.`
      }

      const response = await fetch("/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: phone,
          text: message,
        }),
      })

      if (!response.ok) throw new Error("Failed to send SMS")

      toast.success(`SMS notification sent to ${recipientType}`)
    } catch (error) {
      console.error("SMS sending failed:", error)
      toast.error("Failed to send SMS notification")
    }
  }

  // Send custom SMS to user
  const sendCustomSMSToUser = async (id: string) => {
    if (!customMessage) {
      toast.error("Please enter a message")
      return
    }

    try {
      setSendingNotification(true)
      const complaint = complaints?.find((c) => c.id === id)

      if (!complaint?.userPhone) {
        toast.error("User phone number not available")
        return
      }

      const response = await fetch("/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: complaint.userPhone,
          text: customMessage,
        }),
      })

      if (!response.ok) throw new Error("Failed to send SMS")

      toast.success("Custom notification sent to user")
      setCustomMessage("")
      setShowCustomMessageForm(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send notification")
    } finally {
      setSendingNotification(false)
    }
  }

  // Send status update SMS to user
  const sendStatusUpdateToUser = async (phone: string, status: string, complaintId: string) => {
    try {
      let message = ""

      switch (status) {
        case "in-progress":
          message = `Update on your complaint #${complaintId}: Your report is now being processed. We're working on resolving the issue. Thank you for bringing this to our attention.`
          break
        case "resolved":
          message = `Good news! Your complaint #${complaintId} has been resolved. Thank you for your patience and for helping us improve our services.`
          break
        default:
          message = `Your complaint #${complaintId} status has been updated to: ${status}. Thank you for your report.`
      }

      const response = await fetch("/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: phone,
          text: message,
        }),
      })

      if (!response.ok) throw new Error("Failed to send status update SMS")

      toast.success("Status update notification sent to user")
    } catch (error) {
      console.error("Status SMS sending failed:", error)
      toast.error("Failed to send status update notification")
    }
  }

  // Institution actions
  const createInstitution = async () => {
    try {
      const response = await fetch("/api/institutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInstitution),
      })

      if (!response.ok) throw new Error("Failed to create institution")

      mutate("/api/institutions")
      toast.success("Institution created")
      setShowInstitutionForm(false)
      setNewInstitution({
        name: "",
        email: "",
        phone: "",
        role: "institution",
        department: "",
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Creation failed")
    }
  }

  const updateInstitution = async () => {
    if (!editInstitution) return

    try {
      const response = await fetch(`/api/institutions/${editInstitution.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editInstitution),
      })

      if (!response.ok) throw new Error("Failed to update institution")

      mutate("/api/institutions")
      toast.success("Institution updated")
      setEditInstitution(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed")
    }
  }

  const deleteInstitution = async (id: string) => {
    if (!confirm("Are you sure you want to delete this institution?")) return

    try {
      const response = await fetch(`/api/institutions/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete institution")

      mutate("/api/institutions")
      toast.success("Institution deleted")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Deletion failed")
    }
  }

  // UI helpers
  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-amber-500"
      case "in-progress":
        return "bg-[#00A1DE]"
      case "resolved":
        return "bg-emerald-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "in-progress":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "resolved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return <AlertTriangle className="h-4 w-4 mr-2" />
      case "in-progress":
        return <Clock className="h-4 w-4 mr-2" />
      case "resolved":
        return <CheckCircle className="h-4 w-4 mr-2" />
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  // Calculate statistics
  const stats = {
    total: filteredComplaints?.length || 0,
    submitted: filteredComplaints?.filter((c) => c.status === "submitted").length || 0,
    inProgress: filteredComplaints?.filter((c) => c.status === "in-progress").length || 0,
    resolved: filteredComplaints?.filter((c) => c.status === "resolved").length || 0,
  }

  // Check if user is authorized to access the dashboard
  if (!user || (user.role !== "admin" && user.role !== "institution")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Unauthorized Access</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You do not have permission to view this dashboard. Please contact an administrator if you believe this is an
            error.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-[#00A1DE] text-white rounded-lg hover:bg-[#0090c5] transition-colors"
          >
            Return to Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Dashboard Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                {user.role === "admin" ? (
                  <>
                    <BarChart3 className="h-6 w-6 mr-2 text-[#00A1DE]" />
                    Admin Dashboard
                  </>
                ) : (
                  <>
                    <Briefcase className="h-6 w-6 mr-2 text-[#00A1DE]" />
                    Institution Dashboard
                  </>
                )}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {user.role === "admin"
                  ? "Manage complaints and institutions"
                  : `Manage complaints for ${user.department}`}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-[#00A1DE] text-white flex items-center justify-center font-medium">
                  {user.name?.charAt(0) || "U"}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user.name || user.email || "User"}
                </span>
              </div>
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("user")
                    window.location.href = "/auth/login"
                  }
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center"
              >
                <LogOut className="h-3.5 w-3.5 mr-1.5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 mr-4">
                <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Complaints</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 mr-4">
                <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.submitted}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 mr-4">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inProgress}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 mr-4">
                <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Resolved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.resolved}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Only show Institutions tab for admin */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              className={`px-6 py-4 font-medium text-sm flex items-center ${
                activeTab === "complaints"
                  ? "border-b-2 border-[#00A1DE] text-[#00A1DE]"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("complaints")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Complaints
            </button>
            {user.role === "admin" && (
              <button
                className={`px-6 py-4 font-medium text-sm flex items-center ${
                  activeTab === "institutions"
                    ? "border-b-2 border-[#00A1DE] text-[#00A1DE]"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
                onClick={() => setActiveTab("institutions")}
              >
                <Users className="h-4 w-4 mr-2" />
                Institutions
              </button>
            )}
          </div>
          <div className="flex justify-end">
            <Link href="/analytics"
              className="px-6 py-4 font-medium text-sm text-[#00A1DE] flex items-center hover:text-[#00A1DE]/80">
                View Analytics
            </Link>
          </div>
        </div>

        {/* Complaints Tab */}
        {activeTab === "complaints" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center mb-4 sm:mb-0">
                  <Filter className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                  Filters
                </h2>
                <button
                  onClick={() => setFilters({ status: "", category: "", search: "" })}
                  className="text-sm text-[#00A1DE] hover:text-[#0090c5] flex items-center transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  Reset Filters
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search complaints..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full px-4 py-2.5 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#00A1DE] focus:border-transparent transition-colors"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>

                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#00A1DE] focus:border-transparent transition-colors min-w-[160px]"
                >
                  <option value="">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>

                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#00A1DE] focus:border-transparent transition-colors min-w-[160px]"
                >
                  <option value="">All Categories</option>
                  <option value="water">Water</option>
                  <option value="sanitation">Sanitation</option>
                  <option value="roads">Roads</option>
                  <option value="electricity">Electricity</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Institution-specific header */}
            {user.role === "institution" && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl border border-blue-200 dark:border-blue-800 mb-6 flex items-start">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-800 mr-4 mt-0.5">
                  <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Department View</h2>
                  <p className="text-blue-600 dark:text-blue-400 text-sm">
                    Showing complaints assigned to your department:{" "}
                    <span className="font-medium">{user.department}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Complaints Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-750">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        ID
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Category
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3.5 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredComplaints?.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 mb-3">
                              <Search className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">No complaints found</p>
                            <p className="text-gray-400 dark:text-gray-500 text-sm">
                              Try adjusting your search or filter criteria
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredComplaints?.map((complaint) => (
                        <React.Fragment key={complaint.id}>
                          <tr
                            className={`hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${expandedComplaint === complaint.id ? "bg-gray-50 dark:bg-gray-750" : ""}`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              <span className="font-mono">{complaint.id}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                              <span className="capitalize">{complaint.aiCategory || complaint.category}</span>
                              {complaint.aiConfidence && (
                                <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded">
                                  {complaint.aiConfidence}% AI
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  complaint.status === "submitted"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                    : complaint.status === "in-progress"
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                      : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                                }`}
                              >
                                <div
                                  className={`h-1.5 w-1.5 rounded-full ${getStatusColor(complaint.status)} mr-1.5`}
                                />
                                <span className="capitalize">{complaint.status.replace("-", " ")}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                              <div className="flex items-center">
                                <Calendar className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                                {new Date(complaint.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                              <div className="flex justify-end space-x-3">
                                <button
                                  onClick={() =>
                                    setExpandedComplaint(expandedComplaint === complaint.id ? null : complaint.id)
                                  }
                                  className="text-[#00A1DE] hover:text-[#0090c5] flex items-center transition-colors"
                                >
                                  {expandedComplaint === complaint.id ? (
                                    <ChevronUp className="h-4 w-4 mr-1" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 mr-1" />
                                  )}
                                  {expandedComplaint === complaint.id ? "Hide" : "View"}
                                </button>

                                {complaint.userPhone && (
                                  <button
                                    onClick={() => setShowCustomMessageForm(complaint.id)}
                                    className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400 flex items-center transition-colors"
                                    title="Send message to user"
                                  >
                                    <MessageSquare className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>

                          {expandedComplaint === complaint.id && (
                            <tr>
                              <td colSpan={5} className="px-0 py-0 bg-gray-50 dark:bg-gray-750">
                                <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                                        <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                                        Complaint Details
                                      </h3>
                                      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
                                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                                          {complaint.description}
                                        </p>
                                      </div>

                                      {complaint.audioUrl && (
                                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
                                          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center">
                                            <Headphones className="h-3.5 w-3.5 mr-1.5" />
                                            Audio Recording
                                          </h4>
                                          <audio controls className="w-full h-10">
                                            <source src={complaint.audioUrl} type="audio/webm" />
                                            Your browser does not support the audio element.
                                          </audio>
                                        </div>
                                      )}

                                      {complaint.videoUrl && (
  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 mb-4">
    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
      Video Recording
    </h3>
    <ReactPlayer
      url={complaint.videoUrl}
      controls
      width="100%"
      height="360px"
      style={{ maxHeight: 400, background: "#000" }}
    />
  </div>
)}

                                      {complaint.userPhone && (
                                        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mt-3 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-100 dark:border-blue-800">
                                          <Phone className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
                                          <span>User has provided contact information</span>
                                        </div>
                                      )}
                                    </div>

                                    <div>
                                      <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                                          <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                                          Location & Status
                                        </h3>
                                        <button
                                          onClick={() => {
                                            setEditMode(editMode === complaint.id ? null : complaint.id)
                                            setEditValues({
                                              status: complaint.status,
                                              assignedAgency: complaint.assignedAgency,
                                            })
                                          }}
                                          className="text-xs text-[#00A1DE] hover:text-[#0090c5] flex items-center transition-colors"
                                        >
                                          {editMode === complaint.id ? (
                                            <X className="h-3.5 w-3.5 mr-1" />
                                          ) : (
                                            <Edit className="h-3.5 w-3.5 mr-1" />
                                          )}
                                          {editMode === complaint.id ? "Cancel" : "Edit"}
                                        </button>
                                      </div>

                                      {editMode === complaint.id ? (
                                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
                                          <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                              Status
                                            </label>
                                            <select
                                              value={editValues.status || ""}
                                              onChange={(e) =>
                                                setEditValues({
                                                  ...editValues,
                                                  status: e.target.value as "submitted" | "in-progress" | "resolved",
                                                })
                                              }
                                              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#00A1DE] focus:border-transparent transition-colors text-sm"
                                            >
                                              <option value="submitted">Submitted</option>
                                              <option value="in-progress">In Progress</option>
                                              <option value="resolved">Resolved</option>
                                            </select>
                                          </div>

                                          {/* Only admin can change assigned agency */}
                                          {user.role === "admin" && (
                                            <div>
                                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                Assigned Agency
                                              </label>
                                              <select
                                                value={editValues.assignedAgency || ""}
                                                onChange={(e) =>
                                                  setEditValues({
                                                    ...editValues,
                                                    assignedAgency: e.target.value,
                                                  })
                                                }
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#00A1DE] focus:border-transparent transition-colors text-sm"
                                              >
                                                <option value="">Select Institution</option>
                                                {institutions?.map((institution) => (
                                                  <option key={institution.id} value={institution.id}>
                                                    {institution.name} ({institution.department})
                                                  </option>
                                                ))}
                                              </select>
                                            </div>
                                          )}

                                          <div className="flex justify-end space-x-2 pt-2">
                                            <button
                                              onClick={() => setEditMode(null)}
                                              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                            >
                                              Cancel
                                            </button>
                                            <button
                                              onClick={() => updateComplaint(complaint.id, editValues)}
                                              disabled={isSavingChanges}
                                              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#00A1DE] hover:bg-[#0090c5] text-white transition-colors flex items-center"
                                            >
                                              {isSavingChanges ? (
                                                <>
                                                  <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                                  Saving...
                                                </>
                                              ) : (
                                                "Save Changes"
                                              )}
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                          <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                Status
                                              </p>
                                              <div
                                                className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusBgColor(complaint.status)}`}
                                              >
                                                {getStatusIcon(complaint.status)}
                                                <span className="capitalize">{complaint.status.replace("-", " ")}</span>
                                              </div>
                                            </div>

                                            <div>
                                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                Assigned To
                                              </p>
                                              <p className="text-gray-900 dark:text-gray-100">
                                                {complaint.assignedAgency}
                                              </p>
                                            </div>

                                            <div>
                                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                District
                                              </p>
                                              <p className="text-gray-900 dark:text-gray-100">{complaint.district}</p>
                                            </div>

                                            <div>
                                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                Sector
                                              </p>
                                              <p className="text-gray-900 dark:text-gray-100">{complaint.sector}</p>
                                            </div>

                                            <div>
                                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                Cell
                                              </p>
                                              <p className="text-gray-900 dark:text-gray-100">{complaint.cell}</p>
                                            </div>

                                            <div>
                                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                Village
                                              </p>
                                              <p className="text-gray-900 dark:text-gray-100">
                                                {complaint.village || "N/A"}
                                              </p>
                                            </div>
                                          </div>

                                          <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                              <div>
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                  Created
                                                </p>
                                                <p className="text-gray-900 dark:text-gray-100">
                                                  {formatDate(complaint.createdAt)}
                                                </p>
                                              </div>

                                              <div>
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                  Last Updated
                                                </p>
                                                <p className="text-gray-900 dark:text-gray-100">
                                                  {formatDate(complaint.updatedAt)}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}

                          {/* Custom message form */}
                          {showCustomMessageForm === complaint.id && (
                            <tr>
                              <td colSpan={5} className="px-0 py-0">
                                <div className="border-t border-gray-200 dark:border-gray-700 bg-emerald-50 dark:bg-emerald-900/20 px-6 py-4">
                                  <div>
                                    <h3 className="text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-3 flex items-center">
                                      <MessageSquare className="h-4 w-4 mr-2" />
                                      Send Custom SMS to User
                                    </h3>
                                    <div className="flex flex-col gap-3">
                                      <textarea
                                        value={customMessage}
                                        onChange={(e) => setCustomMessage(e.target.value)}
                                        placeholder="Type your message here..."
                                        className="w-full px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-sm h-24 resize-none"
                                      />
                                      <div className="text-xs text-emerald-700 dark:text-emerald-400 flex items-start">
                                        <AlertTriangle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 mt-0.5" />
                                        Keep messages concise and polite. Avoid including sensitive information.
                                      </div>
                                      <div className="flex justify-end space-x-2">
                                        <button
                                          onClick={() => {
                                            setShowCustomMessageForm(null)
                                            setCustomMessage("")
                                          }}
                                          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                          disabled={sendingNotification}
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          onClick={() => sendCustomSMSToUser(complaint.id)}
                                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center"
                                          disabled={!customMessage || sendingNotification}
                                        >
                                          {sendingNotification ? (
                                            <>
                                              <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                              Sending...
                                            </>
                                          ) : (
                                            <>
                                              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                                              Send SMS
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Institutions Tab - Admin Only */}
        {activeTab === "institutions" && user.role === "admin" && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => setShowInstitutionForm(true)}
                className="px-4 py-2 rounded-lg bg-[#00A1DE] hover:bg-[#0090c5] text-white font-medium text-sm flex items-center transition-colors"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Institution
              </button>
            </div>

            {/* Institution Creation Form */}
            {showInstitutionForm && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  {editInstitution ? (
                    <>
                      <Edit className="h-5 w-5 mr-2 text-[#00A1DE]" />
                      Edit Institution
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5 mr-2 text-[#00A1DE]" />
                      Add New Institution
                    </>
                  )}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Institution Name
                    </label>
                    <input
                      type="text"
                      value={editInstitution?.name || newInstitution.name}
                      onChange={(e) =>
                        editInstitution
                          ? setEditInstitution({ ...editInstitution, name: e.target.value })
                          : setNewInstitution({ ...newInstitution, name: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#00A1DE] focus:border-transparent transition-colors"
                      placeholder="Enter institution name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={editInstitution?.email || newInstitution.email}
                      onChange={(e) =>
                        editInstitution
                          ? setEditInstitution({ ...editInstitution, email: e.target.value })
                          : setNewInstitution({ ...newInstitution, email: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#00A1DE] focus:border-transparent transition-colors"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={editInstitution?.phone || newInstitution.phone}
                      onChange={(e) =>
                        editInstitution
                          ? setEditInstitution({ ...editInstitution, phone: e.target.value })
                          : setNewInstitution({ ...newInstitution, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#00A1DE] focus:border-transparent transition-colors"
                      placeholder="+250 7XX XXX XXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Department
                    </label>
                    <input
                      type="text"
                      value={editInstitution?.department || newInstitution.department}
                      onChange={(e) =>
                        editInstitution
                          ? setEditInstitution({ ...editInstitution, department: e.target.value })
                          : setNewInstitution({ ...newInstitution, department: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#00A1DE] focus:border-transparent transition-colors"
                      placeholder="e.g. Water & Sanitation"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Role</label>
                    <select
                      value={editInstitution?.role || newInstitution.role}
                      onChange={(e) =>
                        editInstitution
                          ? setEditInstitution({ ...editInstitution, role: e.target.value as "admin" | "institution" })
                          : setNewInstitution({ ...newInstitution, role: e.target.value as "admin" | "institution" })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#00A1DE] focus:border-transparent transition-colors"
                    >
                      <option value="institution">Institution</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowInstitutionForm(false)
                      setEditInstitution(null)
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editInstitution ? updateInstitution : createInstitution}
                    className="px-4 py-2 rounded-lg bg-[#00A1DE] hover:bg-[#0090c5] text-white font-medium text-sm transition-colors"
                  >
                    {editInstitution ? "Update Institution" : "Create Institution"}
                  </button>
                </div>
              </div>
            )}

            {/* Institutions Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-750">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Phone
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Department
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Role
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3.5 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {institutions?.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 mb-3">
                              <Users className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">No institutions found</p>
                            <p className="text-gray-400 dark:text-gray-500 text-sm">
                              Click "Add Institution" to create one
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      institutions?.map((institution, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {institution.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {institution.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {institution.phone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {institution.department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                institution.role === "admin"
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                              }`}
                            >
                              <span className="capitalize">{institution.role}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <div className="flex justify-end space-x-3">
                              <button
                                onClick={() => {
                                  setEditInstitution(institution)
                                  setShowInstitutionForm(true)
                                }}
                                className="text-[#00A1DE] hover:text-[#0090c5] transition-colors"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteInstitution(institution.id)}
                                className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}