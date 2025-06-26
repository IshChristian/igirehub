"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { CheckCircle2, Clock, FileText, MapPin, Bell, Gift, ArrowLeft, Home, ChevronRight, AlertCircle, Sparkles, Coins } from 'lucide-react'
import useSWR from "swr"
import confetti from "canvas-confetti"
import ReactPlayer from "react-player"

type ComplaintStatus = "submitted" | "in-progress" | "resolved"

interface Complaint {
  id: string
  description: string
  category: string
  location: string
  status: ComplaintStatus
  createdAt: string
  updatedAt: string
  audioUrl?: string | null
  videoUrl?: string
  pointsAwarded: number
  assignedAgency?: string | null
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.')
    throw error
  }
  return res.json()
}

function getCookie(name: string) {
  if (typeof document === "undefined") return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null
  return null
}

export default function TrackPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [isRedeemed, setIsRedeemed] = useState<Record<string, boolean>>({})
  const [showRewardAnimation, setShowRewardAnimation] = useState(false)
  const [rewardPoints, setRewardPoints] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const confettiRef = useRef<HTMLDivElement>(null)

  const userId = getCookie("userId")

  const { data, error, isLoading } = useSWR<Complaint[]>(
    user && userId ? `/api/track/user?userId=${userId}` : null,
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
    }
  )

  // Ensure complaints is always an array
  const complaints = Array.isArray(data) ? data : []

  // Set the first complaint as selected when data loads
  useEffect(() => {
    if (complaints.length > 0 && !selectedComplaint) {
      setSelectedComplaint(complaints[0])
    }
    
    // Set page as loaded for animations
    setTimeout(() => {
      setIsLoaded(true)
    }, 100)
  }, [complaints, selectedComplaint])

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/auth/login?redirect=/track")
    }
  }, [user, router])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case "submitted":
        return "bg-yellow-500"
      case "in-progress":
        return "bg-blue-500"
      case "resolved":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: ComplaintStatus) => {
    switch (status) {
      case "submitted":
        return "Submitted"
      case "in-progress":
        return "In Progress"
      case "resolved":
        return "Resolved"
      default:
        return "Unknown"
    }
  }

  const handleRedeemPoints = async (complaintId: string) => {
    try {
      const response = await fetch(`/api/complaints/${complaintId}/redeem`, {
        method: "POST"
      })
      
      if (!response.ok) {
        console.error("Failed to redeem points")
        return
      }
      
      // Update local state to mark as redeemed
      setIsRedeemed((prev) => ({ ...prev, [complaintId]: true }))
      
      // Find the complaint to get points
      const complaint = complaints.find(c => c.id === complaintId)
      if (complaint) {
        setRewardPoints(complaint.pointsAwarded)
        setShowRewardAnimation(true)
        
        // Trigger confetti effect
        if (confettiRef.current) {
          const rect = confettiRef.current.getBoundingClientRect()
          const x = rect.left + rect.width / 2
          const y = rect.top + rect.height / 2
          
          confetti({
            particleCount: 100,
            spread: 70,
            origin: {
              x: x / window.innerWidth,
              y: y / window.innerHeight,
            },
            colors: ["#00A1DE", "#009A44", "#FFC726"],
          })
        }
        
        // Hide animation after a few seconds
        setTimeout(() => {
          setShowRewardAnimation(false)
        }, 3000)
      }
    } catch (error) {
      console.error("Error redeeming points:", error)
    }
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  // Skeleton Loading Components
  const ComplaintListSkeleton = () => (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="w-full p-4 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse">
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full mr-2 bg-gray-300 dark:bg-gray-600"></div>
            <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
          <div className="h-3 w-full mt-2 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-3 w-32 mt-2 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      ))}
    </div>
  )

  const ComplaintDetailSkeleton = () => (
    <div className="space-y-4 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="h-6 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>

      <div>
        <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
        <div className="h-4 w-full bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
          <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
        <div>
          <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
          <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
          <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
        <div>
          <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
          <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start">
              <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600"></div>
              <div className="ml-4">
                <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                <div className="h-3 w-48 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header with navigation */}
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md sticky top-0 z-10 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center group">
                <Home className="h-6 w-6 text-[#009A44] transition-transform group-hover:scale-110" />
                <span className="ml-2 text-gray-700 dark:text-gray-300">Home</span>
              </Link>
            </div>
            <div className="flex items-center">
              <Link
                href="/submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#00A1DE] hover:bg-[#0090c5] transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group"
              >
                Submit New Complaint
                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div
          className={`transition-all duration-1000 ease-out ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="flex items-center mb-6">
            <div className="bg-[#00A1DE]/10 p-2 rounded-full mr-3">
              <FileText className="h-6 w-6 text-[#00A1DE]" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Track Your Complaints</h1>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6 flex items-center animate-fadeIn">
              <AlertCircle className="h-5 w-5 mr-2" />
              Error loading complaints
              <button onClick={() => window.location.reload()} className="ml-auto text-sm text-[#00A1DE] underline">
                Try Again
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-[#00A1DE]" />
                    Your Complaints
                  </h2>
                  <ComplaintListSkeleton />
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                  <ComplaintDetailSkeleton />
                </div>
              </div>
            </div>
          ) : complaints.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
              <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No complaints found</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">You haven&apos;t submitted any complaints yet.</p>
              <Link
                href="/submit"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#00A1DE] hover:bg-[#0090c5] transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
              >
                Submit a Complaint
                <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
                  <h2 className="text-lg font-semibold mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-[#00A1DE]" />
                    Your Complaints
                  </h2>
                  <div className="space-y-3">
                    {complaints.map((complaint) => (
                      <button
                        key={complaint.id}
                        onClick={() => setSelectedComplaint(complaint)}
                        className={`w-full text-left p-4 rounded-lg transition-all duration-300 ${
                          selectedComplaint?.id === complaint.id
                            ? "bg-[#00A1DE]/10 border-l-4 border-[#00A1DE] shadow-md"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800 hover:translate-x-1"
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`h-3 w-3 rounded-full mr-2 ${getStatusColor(complaint.status)}`}></div>
                          <span className="font-medium truncate capitalize">{complaint.category}</span>
                          {isRedeemed[complaint.id] && (
                            <span className="ml-auto bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2 py-0.5 rounded-full flex items-center">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Redeemed
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate mt-1">
                          {complaint.description || "No description available"}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(complaint.createdAt)}</p>
                          {complaint.status === "resolved" && !isRedeemed[complaint.id] && (
                            <span className="text-xs text-[#00A1DE] flex items-center">
                              <Coins className="h-3 w-3 mr-1" />
                              {complaint.pointsAwarded} points
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
                  {selectedComplaint ? (
                    <>
                      <div className="flex justify-between items-start mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                          <span className="mr-2">Complaint Details</span>
                          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                            #{selectedComplaint.id}
                          </span>
                        </h2>
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
                            selectedComplaint.status === "resolved"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                              : selectedComplaint.status === "in-progress"
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                                : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                          }`}
                        >
                          <div
                            className={`h-2 w-2 rounded-full mr-2 ${getStatusColor(selectedComplaint.status)}`}
                          ></div>
                          {getStatusText(selectedComplaint.status)}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</h3>
                          <p className="text-gray-900 dark:text-gray-100">
                            {selectedComplaint.description || "No description available"}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Category</h3>
                            <p className="text-gray-900 dark:text-gray-100 capitalize">{selectedComplaint.category}</p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Location</h3>
                            <div className="flex items-center text-gray-900 dark:text-gray-100">
                              <MapPin className="h-4 w-4 mr-2 text-[#00A1DE]" />
                              <span>{selectedComplaint.location}</span>
                            </div>
                          </div>
                        </div>


                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Submitted</h3>
                            <p className="text-gray-900 dark:text-gray-100">
                              {formatDate(selectedComplaint.createdAt)}
                            </p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Last Updated</h3>
                            <p className="text-gray-900 dark:text-gray-100">
                              {formatDate(selectedComplaint.updatedAt)}
                            </p>
                          </div>
                        </div>

                        {selectedComplaint.audioUrl && (
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                              Audio Recording
                            </h3>
                            <audio controls className="w-full">
                              <source src={selectedComplaint.audioUrl} type="audio/webm" />
                              Your browser does not support the audio element.
                            </audio>
                            <audio src={selectedComplaint.audioUrl} type="audio/webm"></audio>
                          </div>
                        )}

                        {selectedComplaint.videoUrl && (
  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 mb-4">
    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
      Video Recording
    </h3>
    <ReactPlayer
      url={selectedComplaint.videoUrl}
      controls
      width="100%"
      height="360px"
      style={{ maxHeight: 400, background: "#000" }}
    />
<video src={selectedComplaint.videoUrl}></video>
  </div>
)}
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Timeline</h3>
                          <div className="relative">
                            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

                            <div className="relative flex items-start mb-6">
                              <div className="h-6 w-6 rounded-full flex items-center justify-center z-10 bg-green-500 text-white">
                                <CheckCircle2 className="h-4 w-4" />
                              </div>
                              <div className="ml-4">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Submitted</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDate(selectedComplaint.createdAt)}
                                </p>
                              </div>
                            </div>

                            <div className="relative flex items-start mb-6">
                              <div
                                className={`h-6 w-6 rounded-full flex items-center justify-center z-10 ${
                                  selectedComplaint.status === "in-progress" || selectedComplaint.status === "resolved"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                                }`}
                              >
                                <Clock className="h-4 w-4" />
                              </div>
                              <div className="ml-4">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">In Progress</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {selectedComplaint.status === "in-progress" || selectedComplaint.status === "resolved"
                                    ? selectedComplaint.assignedAgency
                                      ? `${selectedComplaint.assignedAgency} is working on your complaint`
                                      : "Agency is working on your complaint"
                                    : "Waiting for agency to start working on your complaint"}
                                </p>
                              </div>
                            </div>

                            <div className="relative flex items-start">
                              <div
                                className={`h-6 w-6 rounded-full flex items-center justify-center z-10 ${
                                  selectedComplaint.status === "resolved"
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                                }`}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </div>
                              <div className="ml-4">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Resolved</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {selectedComplaint.status === "resolved"
                                    ? "Your complaint has been resolved"
                                    : "Waiting for resolution"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex items-center">
                            
                          </div>

                          {selectedComplaint.status === "resolved" && !isRedeemed[selectedComplaint.id] && (
                            <div ref={confettiRef}>
                              <button
                                onClick={() => handleRedeemPoints(selectedComplaint.id)}
                                className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md text-white bg-[#009A44] hover:bg-[#008a3d] transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
                              >
                                <Gift className="h-5 w-5 mr-2" />
                                Redeem {selectedComplaint.pointsAwarded} Coins - {selectedComplaint.pointsAwarded * 10}{" "}
                                RWF Airtime
                              </button>
                            </div>
                          )}

                          {isRedeemed[selectedComplaint.id] && (
                            <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-4 py-2 rounded-md flex items-center">
                              <CheckCircle2 className="h-5 w-5 mr-2" />
                              Points redeemed successfully!
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <ComplaintDetailSkeleton />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Reward animation overlay */}
      {showRewardAnimation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-2xl max-w-md w-full text-center transform animate-bounceIn">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-ping absolute h-16 w-16 rounded-full bg-[#FFC726]/75"></div>
                <div className="animate-pulse absolute h-24 w-24 rounded-full bg-[#FFC726]/30"></div>
              </div>
              <div className="relative flex justify-center">
                <div className="bg-[#FFC726] h-16 w-16 rounded-full flex items-center justify-center shadow-lg">
                  <Coins className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white flex items-center justify-center">
              <Sparkles className="h-5 w-5 mr-2 text-[#FFC726]" />
              Congratulations!
              <Sparkles className="h-5 w-5 ml-2 text-[#FFC726]" />
            </h2>
            <p className="text-lg mb-4 text-gray-700 dark:text-gray-300">
              You've earned <span className="font-bold text-[#FFC726]">{rewardPoints} coins</span>
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {rewardPoints * 10} RWF airtime will be sent to your phone number shortly.
            </p>
            <button
              onClick={() => setShowRewardAnimation(false)}
              className="px-6 py-3 bg-[#00A1DE] text-white rounded-md font-medium hover:bg-[#0090c5] transition-all duration-300"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
