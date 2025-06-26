"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  MapPin,
  Calendar,
  Phone,
  MessageSquare,
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Users,
  FileText,
  Bell,
  Download,
  RefreshCw,
  Edit,
  Send,
  Star,
  Award,
  Globe,
  Smartphone,
  Monitor,
  Trash2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
// Remove node:timers/promises import; use browser setInterval instead

interface Complaint {
  _id: { $oid: string }
  id: string
  userId: string
  category: string
  translatedDescription: string
  location: string | null
  coordinates: string
  district: string
  sector: string
  cell: string
  aiConfidence: number
  aiCategory: string
  assignedAgency: string
  effects: string[]
  consequences: string[]
  severity: "low" | "medium" | "high" | "critical"
  suggestedActions: string[]
  language: string
  submissionMethod: "web" | "mobile" | "phone" | "sms"
  pointsAwarded: number
  createdAt: { $date: string }
  updatedAt: { $date: string }
  status?: "submitted" | "in-progress" | "resolved"
  userPhone?: string
  audioUrl?: string
  videoUrl?: string
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

// Mock data based on the provided structure
const mockComplaints: Complaint[] = []

export default function CitizenEngagementDashboard() {
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [expandedComplaint, setExpandedComplaint] = useState<string | null>(null)
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [customMessage, setCustomMessage] = useState("")
  const [status, setStatus] = useState("submitted")
  const [assignedAgency, setAssignedAgency] = useState("")
  const [complaintUpdates, setComplaintUpdates] = useState<Record<string, { status?: string; assignedAgency?: string }>>({})

  const [activeTab, setActiveTab] = useState<"complaints" | "institutions">("complaints")
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [showInstitutionForm, setShowInstitutionForm] = useState(false)
  const [editInstitution, setEditInstitution] = useState<Institution | null>(null)
  const [newInstitution, setNewInstitution] = useState<Omit<Institution, "id" | "createdAt" | "updatedAt">>({
    name: "",
    email: "",
    phone: "",
    role: "institution",
    department: "",
  })

  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)

  const [user, setUser] = useState<{ name?: string; email?: string; role?: string } | null>(null);

  // Add useEffect for data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        // setLoading(true)
        // Fetch complaints
        const complaintsResponse = await fetch("/api/complaints/joined")
        if (complaintsResponse.ok) {
          const complaintsData = await complaintsResponse.json()
          setComplaints(complaintsData)
        }

        // Fetch institutions
        const institutionsResponse = await fetch("/api/institutions")
        if (institutionsResponse.ok) {
          const institutionsData = await institutionsResponse.json()
          setInstitutions(institutionsData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }
    const intervalId = window.setInterval(() => {
      fetchData()
    }, 3000) // Refresh data every 3 seconds

    // Initial fetch
    fetchData()

    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      }
    }
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getSubmissionIcon = (method: string) => {
    switch (method) {
      case "web":
        return <Monitor className="h-4 w-4" />
      case "mobile":
        return <Smartphone className="h-4 w-4" />
      case "phone":
        return <Phone className="h-4 w-4" />
      case "sms":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Globe className="h-4 w-4" />
    }
  }

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.translatedDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.district.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || complaint.status === statusFilter
    const matchesSeverity = severityFilter === "all" || complaint.severity === severityFilter

    return matchesSearch && matchesStatus && matchesSeverity
  })

  const stats = {
    total: complaints.length,
    submitted: complaints.filter((c) => c.status === "submitted").length,
    inProgress: complaints.filter((c) => c.status === "in-progress").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
    avgConfidence:
      complaints.length > 0
        ? Math.round(complaints.reduce((acc, c) => acc + c.aiConfidence, 0) / complaints.length)
        : 0,
    totalPoints: complaints.reduce((acc, c) => acc + c.pointsAwarded, 0),
  }

  const createInstitution = async () => {
    try {
      const response = await fetch("/api/institutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInstitution),
      })

      if (!response.ok) throw new Error("Failed to create institution")

      const createdInstitution = await response.json()
      setInstitutions([...institutions, createdInstitution])
      setShowInstitutionForm(false)
      setNewInstitution({
        name: "",
        email: "",
        phone: "",
        role: "institution",
        department: "",
      })
    } catch (error) {
      console.error("Error creating institution:", error)
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

      const updatedInstitution = await response.json()
      setInstitutions(institutions.map((inst) => (inst.id === editInstitution.id ? updatedInstitution : inst)))
      setEditInstitution(null)
    } catch (error) {
      console.error("Error updating institution:", error)
    }
  }

  const deleteInstitution = async (id: string) => {
    if (!confirm("Are you sure you want to delete this institution?")) return

    try {
      const response = await fetch(`/api/institutions/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete institution")

      setInstitutions(institutions.filter((inst) => inst.id !== id))
    } catch (error) {
      console.error("Error deleting institution:", error)
    }
  }

 async function updateComplaint(id, update) {
  const res = await fetch(`/api/complaints/${id}`, { // <-- singular "complaint"
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(update),
  });
  return await res.json();
}

  // Helper functions to get current values
  const getCurrentStatus = (complaint: Complaint) => {
    return complaintUpdates[complaint.id]?.status || complaint.status || "submitted"
  }

  const getCurrentAssignedAgency = (complaint: Complaint) => {
    return complaintUpdates[complaint.id]?.assignedAgency || complaint.assignedAgency || ""
  }

  // Helper function to update complaint updates state
  const setComplaintUpdate = (complaintId: string, field: 'status' | 'assignedAgency', value: string) => {
    setComplaintUpdates(prev => ({
      ...prev,
      [complaintId]: {
        ...prev[complaintId],
        [field]: value
      }
    }))
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">IJWI RWANJYE</h1>
                  <p className="text-sm text-slate-600">AI-Powered Complaint Management System</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
             
              <div className="flex items-center space-x-4">
  {user ? (
    <div className="relative group">
      <button className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100">
        <Avatar>
          <AvatarFallback>
            {user.name ? user.name[0] : "U"}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium text-slate-900">{user.name || "User"}</span>
        <ChevronDown className="h-4 w-4" />
      </button>
      <div className="absolute right-0 w-56 mt-2 py-2 bg-white border border-slate-200 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
        <div className="px-4 py-2 text-sm text-slate-900 font-semibold">{user.name}</div>
        <div className="px-4 py-2 text-xs text-slate-600">{user.email}</div>
        <div className="px-4 py-2 text-xs text-slate-500">Role: {user.role}</div>
        <div className="border-t border-slate-100"></div>
        <button
          className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
          onClick={() => {
            localStorage.removeItem("user");
            setUser(null);
            window.location.href = "/auth/login";
          }}
        >
          Logout
        </button>
      </div>
    </div>
  ) : (
    <Button asChild>
      <a href="/auth/login">Sign in</a>
    </Button>
  )}
</div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Complaints</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Submitted</p>
                  <p className="text-3xl font-bold">{stats.submitted}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">In Progress</p>
                  <p className="text-3xl font-bold">{stats.inProgress}</p>
                </div>
                <RefreshCw className="h-8 w-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Resolved</p>
                  <p className="text-3xl font-bold">{stats.resolved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">AI Confidence</p>
                  <p className="text-3xl font-bold">{stats.avgConfidence}%</p>
                </div>
                <Brain className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-sm font-medium">Total Points</p>
                  <p className="text-3xl font-bold">{isNaN(stats.totalPoints) ? "" : stats.totalPoints}</p>
                </div>
                <Award className="h-8 w-8 text-pink-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <Card className="mb-8">
          <CardContent className="p-0">
            <div className="flex border-b border-slate-200">
              <button
                className={`px-6 py-4 font-medium text-sm flex items-center ${
                  activeTab === "complaints"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
                onClick={() => setActiveTab("complaints")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Complaints
              </button>
              <button
                className={`px-6 py-4 font-medium text-sm flex items-center ${
                  activeTab === "institutions"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
                onClick={() => setActiveTab("institutions")}
              >
                <Users className="h-4 w-4 mr-2" />
                Institutions
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Complaints Section */}
        {activeTab === "complaints" && (
          <div className="space-y-6">
            {/* Filters */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters & Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search complaints by ID, description, or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="Filter by severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("")
                      setStatusFilter("all")
                      setSeverityFilter("all")
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Complaints List */}
            <div className="space-y-6">
              {filteredComplaints.map((complaint, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    {/* Complaint Header */}
                    <div className="p-6 border-b border-slate-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <Badge variant="outline" className="font-mono text-sm">
                              {complaint.id}
                            </Badge>
                            <Badge className={getSeverityColor(complaint.severity)}>
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {complaint.severity.toUpperCase()}
                            </Badge>
                            <Badge className={getStatusColor(complaint.status || "submitted")}>
                              {complaint.status?.replace("-", " ").toUpperCase() || "SUBMITTED"}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              {getSubmissionIcon(complaint.submissionMethod)}
                              <span className="text-xs text-slate-600 capitalize">{complaint.submissionMethod}</span>
                            </div>
                          </div>

                          <Dialog>
                            <DialogTrigger asChild>
                              <h3 className="text-lg font-semibold text-slate-900 mb-2 cursor-pointer hover:text-blue-600 transition-colors">
                                {complaint.translatedDescription.length > 100
                                  ? `${complaint.translatedDescription.substring(0, 100)}...`
                                  : complaint.translatedDescription}
                              </h3>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Complaint Details - {complaint.id}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-sm font-medium text-slate-600">Full Description</Label>
                                  <p className="text-slate-900 mt-2 p-4 bg-slate-50 rounded-lg">
                                    {complaint.translatedDescription}
                                  </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium text-slate-600">Category</Label>
                                    <p className="text-slate-900">{complaint.aiCategory}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-slate-600">Severity</Label>
                                    <Badge className={getSeverityColor(complaint.severity)}>
                                      {complaint.severity.toUpperCase()}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <div className="flex items-center space-x-6 text-sm text-slate-600">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {complaint.district}, {complaint.sector}, {complaint.cell}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {complaint.createdAt && complaint.createdAt["$date"]
                                        ? new Date(complaint.createdAt["$date"]).toLocaleString()
                                        : ""}
                            </div>
                            <div className="flex items-center">
                              <Brain className="h-4 w-4 mr-1" />
                              AI: {complaint.aiConfidence}% confident
                            </div>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 mr-1 text-yellow-500" />
                              {complaint.pointsAwarded} points
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {complaint.userPhone && (
                            <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Send Message to Citizen</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="message">Custom Message</Label>
                                    <Textarea
                                      id="message"
                                      placeholder="Type your message here..."
                                      value={customMessage}
                                      onChange={(e) => setCustomMessage(e.target.value)}
                                    />
                                  </div>
                                  <Button className="w-full">
                                    <Send className="h-4 w-4 mr-2" />
                                    Send SMS
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setExpandedComplaint(expandedComplaint === complaint.id ? null : complaint.id)
                            }
                          >
                            {expandedComplaint === complaint.id ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedComplaint === complaint.id && (
                      <div className="p-6 bg-slate-50">
                        <Tabs defaultValue="ai-analysis" className="w-full">
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
                            <TabsTrigger value="location">Location</TabsTrigger>
                            <TabsTrigger value="actions">Actions</TabsTrigger>
                            <TabsTrigger value="management">Management</TabsTrigger>
                          </TabsList>

                          <TabsContent value="ai-analysis" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* AI Confidence */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="flex items-center text-lg">
                                    <Brain className="h-5 w-5 mr-2 text-purple-600" />
                                    AI Analysis
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div>
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-sm font-medium">Confidence Level</span>
                                      <span className="text-sm font-bold">{complaint.aiConfidence}%</span>
                                    </div>
                                    <Progress value={complaint.aiConfidence} className="h-2" />
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium">AI Category:</span>
                                    <Badge className="ml-2" variant="secondary">
                                      {complaint.aiCategory}
                                    </Badge>
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium">Original Category:</span>
                                    <Badge className="ml-2" variant="outline">
                                      {complaint.category}
                                    </Badge>
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium">Language:</span>
                                    <Badge className="ml-2" variant="outline">
                                      {complaint.language ? complaint.language.toUpperCase() : "N/A"}
                                    </Badge>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Effects */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="flex items-center text-lg">
                                    <Zap className="h-5 w-5 mr-2 text-orange-600" />
                                    Identified Effects
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <ul className="space-y-2">
                                    {complaint.effects.map((effect, index) => (
                                      <li key={index} className="flex items-start">
                                        <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                                        <span className="text-sm text-slate-700">{effect}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </CardContent>
                              </Card>

                              {/* Consequences */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="flex items-center text-lg">
                                    <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                                    Potential Consequences
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <ul className="space-y-2">
                                    {complaint.consequences.map((consequence, index) => (
                                      <li key={index} className="flex items-start">
                                        <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                                        <span className="text-sm text-slate-700">{consequence}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </CardContent>
                              </Card>

                              {/* Suggested Actions */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="flex items-center text-lg">
                                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                                    AI Suggested Actions
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <ul className="space-y-2">
                                    {complaint.suggestedActions.map((action, index) => (
                                      <li key={index} className="flex items-start">
                                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                                        <span className="text-sm text-slate-700">{action}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </CardContent>
                              </Card>
                            </div>
                          </TabsContent>

                          <TabsContent value="location" className="space-y-4">
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center">
                                  <MapPin className="h-5 w-5 mr-2" />
                                  Location Details
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium text-slate-600">District</Label>
                                    <p className="text-lg font-semibold">{complaint.district}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-slate-600">Sector</Label>
                                    <p className="text-lg font-semibold">{complaint.sector}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-slate-600">Cell</Label>
                                    <p className="text-lg font-semibold">{complaint.cell}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-slate-600">Coordinates</Label>
                                    <p className="text-sm font-mono bg-slate-100 p-2 rounded">
                                      {complaint.coordinates}
                                    </p>
                                  </div>
                                </div>
                                <div className="bg-slate-100 h-48 rounded-lg flex items-center justify-center">
                                  <p className="text-slate-500">Map visualization would appear here</p>
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>

                          <TabsContent value="actions" className="space-y-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Update Status Card */}
    <Card>
          <CardHeader>
            <CardTitle>Update Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
  value={getCurrentStatus(complaint)}
  onValueChange={value => setComplaintUpdate(complaint._id, "status", value)}
>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Button
              className="w-full"
              onClick={() =>
                updateComplaint(complaint._id, {
                  status: getCurrentStatus(complaint),
                  assignedAgency: getCurrentAssignedAgency(complaint),
                })
              }
            >
              <Edit className="h-4 w-4 mr-2" />
              Update Status
            </Button>
          </CardContent>
        </Card>

        {/* Assign Agency Card */}
        <Card>
          <CardHeader>
            <CardTitle>Assign Agency</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
  value={getCurrentAssignedAgency(complaint)}
  onValueChange={value => setComplaintUpdate(complaint._id, "assignedAgency", value)}
>
              <SelectTrigger>
                <SelectValue placeholder="Select agency" />
              </SelectTrigger>
              <SelectContent>
                {institutions.map(inst => (
  <SelectItem key={inst._id} value={inst.department || inst.name}>
    {inst.department || inst.name}
  </SelectItem>
))}
              </SelectContent>
            </Select>
            <Button
              className="w-full"
              variant="outline"
               onClick={() => updateComplaint(complaint._id, { status, assignedAgency })}
            >
              <Users className="h-4 w-4 mr-2" />
              Assign Agency
            </Button>
          </CardContent>
        </Card>
  </div>
</TabsContent>

                          <TabsContent value="management" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-sm">Submission Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-slate-600">Method:</span>
                                    <div className="flex items-center">
                                      {getSubmissionIcon(complaint.submissionMethod)}
                                      <span className="ml-1 text-sm capitalize">{complaint.submissionMethod}</span>
                                    </div>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-slate-600">Points:</span>
                                    <span className="text-sm font-semibold">{complaint.pointsAwarded}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-slate-600">Language:</span>
                                    <span className="text-sm">{complaint.language ? complaint.language.toUpperCase() : "N/A"}</span>
                                  </div>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-sm">Timeline</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                  <div>
                                    <span className="text-xs text-slate-500">Created:</span>
                                    <p className="text-sm">
                                      {complaint.createdAt
                                        ? new Date(complaint.createdAt).toLocaleString()
                                        : ""}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-xs text-slate-500">Updated:</span>
                                    <p className="text-sm">{complaint.updatedAt
                                        ? new Date(complaint.updatedAt).toLocaleString()
                                        : ""}</p>
                                  </div>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-sm">Contact Info</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                  {complaint.user ? (
  <div className="space-y-1">
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-600">Name:</span>
      <span className="text-sm font-mono">{complaint.user.name || "N/A"}</span>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-600">Email:</span>
      <span className="text-sm font-mono">{complaint.user.email || "N/A"}</span>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-600">Phone:</span>
      <span className="text-sm font-mono">{complaint.user.phone || "N/A"}</span>
    </div>
  </div>
) : (
  <p className="text-sm text-slate-500">No contact info provided</p>
                                  )}
                                  <Button size="sm" className="w-full" variant="outline">
                                    <Phone className="h-4 w-4 mr-2" />
                                    Contact Citizen
                                  </Button>
                                </CardContent>
                              </Card>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredComplaints.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No complaints found</h3>
                  <p className="text-slate-600">Try adjusting your search criteria or filters</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Institutions Tab */}
        {activeTab === "institutions" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Institution Management</h2>
              <Button onClick={() => setShowInstitutionForm(true)}>
                <Users className="h-4 w-4 mr-2" />
                Add Institution
              </Button>
            </div>

            {/* Institution Creation Form */}
            {showInstitutionForm && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {editInstitution ? (
                      <>
                        <Edit className="h-5 w-5 mr-2 text-blue-600" />
                        Edit Institution
                      </>
                    ) : (
                      <>
                        <Users className="h-5 w-5 mr-2 text-blue-600" />
                        Add New Institution
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Institution Name</Label>
                      <Input
                        value={editInstitution?.name || newInstitution.name}
                        onChange={(e) =>
                          editInstitution
                            ? setEditInstitution({ ...editInstitution, name: e.target.value })
                            : setNewInstitution({ ...newInstitution, name: e.target.value })
                        }
                        placeholder="Enter institution name"
                      />
                    </div>
                    <div>
                      <Label>Email Address</Label>
                      <Input
                        type="email"
                        value={editInstitution?.email || newInstitution.email}
                        onChange={(e) =>
                          editInstitution
                            ? setEditInstitution({ ...editInstitution, email: e.target.value })
                            : setNewInstitution({ ...newInstitution, email: e.target.value })
                        }
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <Label>Phone Number</Label>
                      <Input
                        value={editInstitution?.phone || newInstitution.phone}
                        onChange={(e) =>
                          editInstitution
                            ? setEditInstitution({ ...editInstitution, phone: e.target.value })
                            : setNewInstitution({ ...newInstitution, phone: e.target.value })
                        }
                        placeholder="+250 7XX XXX XXX"
                      />
                    </div>
                    <div>
                      <Label>Department</Label>
                      <Input
                        value={editInstitution?.department || newInstitution.department}
                        onChange={(e) =>
                          editInstitution
                            ? setEditInstitution({ ...editInstitution, department: e.target.value })
                            : setNewInstitution({ ...newInstitution, department: e.target.value })
                        }
                        placeholder="e.g. Water & Sanitation"
                      />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Select
                        value={editInstitution?.role || newInstitution.role}
                        onValueChange={(value: "admin" | "institution") =>
                          editInstitution
                            ? setEditInstitution({ ...editInstitution, role: value })
                            : setNewInstitution({ ...newInstitution, role: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="institution">Institution</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowInstitutionForm(false)
                        setEditInstitution(null)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={editInstitution ? updateInstitution : createInstitution}>
                      {editInstitution ? "Update Institution" : "Create Institution"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Institutions Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {institutions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center">
                              <Users className="h-12 w-12 text-slate-400 mb-4" />
                              <h3 className="text-lg font-semibold text-slate-900 mb-2">No institutions found</h3>
                              <p className="text-slate-600">Click "Add Institution" to create one</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        institutions
                          .filter((institution) =>
                            (institution.name ?? "").toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((institution) => (
                            <tr key={institution.id} className="hover:bg-slate-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                {institution.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                {institution.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                {institution.phone}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                {typeof institution.department === "string"
                                  ? institution.department.toUpperCase()
                                  : "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <Badge
                                  className={
                                    institution.role === "admin"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-blue-100 text-blue-800"
                                  }
                                >
                                  {institution.role}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                <div className="flex justify-end space-x-3">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditInstitution(institution)
                                      setShowInstitutionForm(true)
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteInstitution(institution.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
