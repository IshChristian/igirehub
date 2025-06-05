"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  MessageSquare,
  Phone,
  Hash,
  MapPin,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Mic,
  ArrowLeft,
  ArrowRight,
  Video,
} from "lucide-react"
import VoiceInterface from "@/components/voice-interface"

type SubmissionMethod = "web" | "sms" | "ussd" | "voice" | "video"
type Category = "water" | "sanitation" | "roads" | "electricity" | "other"

export default function SubmitPage() {
  const router = useRouter()
  const [method, setMethod] = useState<SubmissionMethod>("web")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<Category>("water")
  const [coordinates, setCoordinates] = useState("")
  const [district, setDistrict] = useState("")
  const [sector, setSector] = useState("")
  const [cell, setCell] = useState("")
  const [village, setVillage] = useState("")
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  // const [aiPrediction, setAiPrediction] = useState<{ category: string; confidence: number } | null>(null)
  const [aiPrediction, setAiPrediction] = useState<{ category: string; confidence: number } | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [locationPermission, setLocationPermission] = useState<"prompt" | "granted" | "denied">("prompt")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    setIsLoaded(true)
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setLocationPermission("denied")
      setLocationError("Geolocation is not supported by your browser")
    }
  }, [])
  const fetchLocationDetails = async (_lat: number, _lng: number) => {
    try {
      // In a real app, you would call a reverse geocoding API here
      // For demo purposes, we'll use mock data
      setDistrict("")
      setSector("")
      setCell("")
      setVillage("")
    } catch (error) {
      console.error("Error fetching location details:", error)
      throw new Error("Could not fetch location details")
    }
  }

  const getCurrentLocation = async (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          reject(error)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      // First get the user's location
      setIsGettingLocation(true)
      setLocationError("")
      
      try {
        const { lat, lng } = await getCurrentLocation()
        setCoordinates(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
        await fetchLocationDetails(lat, lng)
        setLocationPermission("granted")
      } catch (error) {
        setLocationPermission("denied")
        setLocationError("Please enable location services to submit a complaint")
        setIsGettingLocation(false)
        setIsSubmitting(false)
        return
      } finally {
        setIsGettingLocation(false)
      }

      // Prepare complaint data
      const complaintData = {
        description,
        category,
        coordinates,
        district,
        sector,
        cell,
        village,
        submissionMethod: method
      }

      // Submit to backend API
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(complaintData),
      })

      if (!response.ok) {
        throw new Error('Failed to submit complaint')
      }
      await response.json()
      setIsSuccess(true)
      setIsSuccess(true)

      // Redirect to tracking page after 2 seconds
      setTimeout(() => {
        router.push(`/track`)
      }, 2000)

    } catch (error) {
      console.error("Submission error:", error)
      setError(error instanceof Error ? error.message : "Failed to submit complaint")
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md sticky top-0 z-10 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center group">
                <ArrowLeft className="h-6 w-6 mr-2 text-[#00A1DE] transition-transform group-hover:-translate-x-1" />
                <span className="text-2xl font-bold text-[#00A1DE] transition-all duration-300 hover:text-[#0090c5]">
                  Igire
                </span>
                <span className="text-2xl font-bold text-[#009A44] ml-1 transition-all duration-300 hover:text-[#008a3d]">
                  Hub
                </span>
              </Link>
            </div>
            <div className="flex items-center">
              <Link
                href="/track"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#00A1DE] hover:bg-[#0090c5] transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group"
              >
                Track Complaints
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div
          className={`transition-all duration-1000 ease-out ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
            <span className="bg-[#00A1DE]/10 p-2 rounded-full mr-3">
              <MessageSquare className="h-6 w-6 text-[#00A1DE]" />
            </span>
            Submit a Complaint
          </h1>

          {isSuccess && (
            <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg mb-6 flex items-center animate-fadeIn">
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Complaint submitted successfully! You earned 50 Igire Points.
            </div>
          )}

          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6 flex items-center animate-fadeIn">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mb-6 transition-all duration-500 hover:shadow-xl">
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
              <button
                className={`flex items-center px-4 py-2 font-medium text-sm transition-all duration-300 border-b-2 ${
                  method === "web"
                    ? "border-[#00A1DE] text-[#00A1DE]"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
                onClick={() => setMethod("web")}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Web
              </button>
              <button
                className={`flex items-center px-4 py-2 font-medium text-sm transition-all duration-300 border-b-2 ${
                  method === "sms"
                    ? "border-[#00A1DE] text-[#00A1DE]"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
                onClick={() => setMethod("sms")}
              >
                <Phone className="h-4 w-4 mr-2" />
                SMS
              </button>
              <button
                className={`flex items-center px-4 py-2 font-medium text-sm transition-all duration-300 border-b-2 ${
                  method === "ussd"
                    ? "border-[#00A1DE] text-[#00A1DE]"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
                onClick={() => setMethod("ussd")}
              >
                <Hash className="h-4 w-4 mr-2" />
                USSD
              </button>
              <button
                className={`flex items-center px-4 py-2 font-medium text-sm transition-all duration-300 border-b-2 ${
                  method === "voice"
                    ? "border-[#00A1DE] text-[#00A1DE]"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
                onClick={() => setMethod("voice")}
              >
                <Mic className="h-4 w-4 mr-2" />
                Voice
              </button>
              <button
                className={`flex items-center px-4 py-2 font-medium text-sm transition-all duration-300 border-b-2 ${
                  method === "video"
                    ? "border-[#00A1DE] text-[#00A1DE]"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
                onClick={() => setMethod("video")}
              >
                <Video className="h-4 w-4 mr-2" />
                Video
              </button>
            </div>

            {method === "web" ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="transition-all duration-300 ease-in-out transform hover:translate-x-1">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                  >
                    Complaint Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#00A1DE] focus:border-transparent transition-all duration-300 min-h-[120px] resize-y"
                    placeholder="Describe your complaint in detail..."
                    required
                  />
                  {aiPrediction && (
                    <div className="mt-2 text-sm flex items-center animate-fadeIn">
                      <span className="text-gray-600 dark:text-gray-400">AI suggests category:</span>
                      <span className="ml-1 font-medium text-[#00A1DE] capitalize">{aiPrediction.category}</span>
                      <span className="ml-2 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">
                        {aiPrediction.confidence}% confidence
                      </span>
                    </div>
                  )}
                </div>

                <div className="transition-all duration-300 ease-in-out transform hover:translate-x-1">
                  <label htmlFor="category" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#00A1DE] focus:border-transparent transition-all duration-300"
                    required
                  >
                    <option value="water">Water</option>
                    <option value="sanitation">Sanitation</option>
                    <option value="roads">Roads</option>
                    <option value="electricity">Electricity</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="transition-all duration-300 ease-in-out transform hover:translate-x-1">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Location
                    {locationPermission === "denied" && (
                      <span className="text-red-500 ml-2">(Location access required)</span>
                    )}
                  </label>
                  <div className="mb-3">
        {/* Hide button if locationPermission is granted */}
        {locationPermission !== "granted" && (
          <button
            type="button"
            onClick={async () => {
              try {
                setIsGettingLocation(true)
                const { lat, lng } = await getCurrentLocation()
                setCoordinates(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
                await fetchLocationDetails(lat, lng)
                setLocationPermission("granted")
              } catch (error) {
                setLocationPermission("denied")
                setLocationError("Please enable location services in your browser settings")
              } finally {
                setIsGettingLocation(false)
              }
            }}
            className="px-4 py-2 rounded-lg bg-[#009A44] hover:bg-[#008a3d] text-white font-medium transition-all duration-300 flex items-center justify-center w-full"
            disabled={isGettingLocation}
          >
            {isGettingLocation ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {"Use My Current Location"}
                {locationPermission === "granted" ? "Update My Location" : "Use My Current Location"}
              </>
            )}
          </button>
        )}
        {locationError && (
          <p className="text-red-500 text-sm mt-1 animate-fadeIn">{locationError}</p>
        )}
      </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
                        District
                      </label>
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#00A1DE] focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">Sector</label>
                      <input
                        type="text"
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#00A1DE] focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">Cell</label>
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => setCell(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#00A1DE] focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">Village</label>
                      <input
                        type="text"
                        value={village}
                        onChange={(e) => setVillage(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#00A1DE] focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-750">
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Igire Points:</span>
                    <span className="ml-2 text-[#00A1DE] font-bold">+50</span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400"></div>
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-[#00A1DE] hover:bg-[#0090c5] transition-all duration-300 hover:shadow-lg hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit Complaint"}
                </button>
              </form>
            ) : method === "sms" ? (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md">
                  <h3 className="font-medium mb-3 text-gray-900 dark:text-white flex items-center">
                    <Phone className="h-5 w-5 mr-2 text-[#00A1DE]" />
                    SMS Instructions
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Send an SMS to <span className="font-bold text-[#00A1DE]">8844</span> with the following format:
                  </p>
                  <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 font-mono text-sm mb-3 transition-all duration-300 hover:border-[#00A1DE]">
                    IGIRE [CATEGORY] [LOCATION] [DESCRIPTION]
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Example:{" "}
                    <span className="font-medium">IGIRE WATER Kigali, Nyarugenge Water pipe broken on main street</span>
                  </p>
                </div>

                <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-750">
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Igire Points:</span>
                    <span className="ml-2 text-[#00A1DE] font-bold">+50</span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400"></div>
                </div>
              </div>
            ) : method === "ussd" ? (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md">
                  <h3 className="font-medium mb-3 text-gray-900 dark:text-white flex items-center">
                    <Hash className="h-5 w-5 mr-2 text-[#00A1DE]" />
                    USSD Instructions
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Dial <span className="font-bold text-[#00A1DE]">*677#</span> and follow the prompts:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li className="transition-all duration-300 hover:translate-x-1">
                      Select option 1 for "Submit complaint"
                    </li>
                    <li className="transition-all duration-300 hover:translate-x-1">
                      Select the category of your complaint
                    </li>
                    <li className="transition-all duration-300 hover:translate-x-1">Enter your location</li>
                    <li className="transition-all duration-300 hover:translate-x-1">
                      Enter a brief description of your complaint
                    </li>
                    <li className="transition-all duration-300 hover:translate-x-1">Confirm submission</li>
                  </ol>
                </div>

                <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-750">
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Igire Points:</span>
                    <span className="ml-2 text-[#00A1DE] font-bold">+50</span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400"></div>
                </div>
              </div>
            ) : method === "voice" ? (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md">
                  <h3 className="font-medium mb-3 text-gray-900 dark:text-white flex items-center">
                    <Mic className="h-5 w-5 mr-2 text-[#00A1DE]" />
                    Voice Instructions
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Call <span className="font-bold text-[#00A1DE]">+250 791 364 641</span> to submit your complaint by voice.
                  </p>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">How to record your complaint:</h4>
                    <ol className="list-decimal list-inside text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                      <li>Start by clearly stating your <span className="font-bold">full name</span>.</li>
                      <li>Say your <span className="font-bold">location</span> in this order: <span className="font-semibold">district, sector, cell, village</span>.</li>
                      <li>Describe your <span className="font-bold">complaint</span> in detail.</li>
                    </ol>
                    <p className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
                      Example: "My name is Jane Doe. I am in Gasabo district, Remera sector, Nyabisindu cell, Village A. My complaint is about water shortage for the past week."
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 mb-4">
                    <VoiceInterface />
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-750">
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Igire Points:</span>
                    <span className="ml-2 text-[#00A1DE] font-bold">+50</span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400"></div>
                </div>
              </div>
            ) : method === "video" ? (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md">
                  <h3 className="font-medium mb-3 text-gray-900 dark:text-white flex items-center">
                    <Video className="h-5 w-5 mr-2 text-[#00A1DE]" />
                    Video Instructions
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    You can record a video using your camera or upload a video file describing your complaint.
                  </p>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">How to record your complaint:</h4>
                    <ol className="list-decimal list-inside text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                      <li>Start by clearly stating your <span className="font-bold">full name</span>.</li>
                      <li>Say your <span className="font-bold">location</span> in this order: <span className="font-semibold">district, sector, cell, village</span>.</li>
                      <li>Describe your <span className="font-bold">complaint</span> in detail.</li>
                    </ol>
                    <p className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
                      Example: "My name is Jane Doe. I am in Gasabo district, Remera sector, Nyabisindu cell, Village A. My complaint is about water shortage for the past week."
                    </p>
                  </div>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault()
                      setError("")
                      setIsSubmitting(true)
                      const formData = new FormData()
                      if (videoFile) formData.append("video", videoFile)
                      formData.append("district", district)
                      formData.append("sector", sector)
                      formData.append("cell", cell)
                      formData.append("village", village)
                      formData.append("category", category)
                      try {
                        const res = await fetch("/api/complaints/video", {
                          method: "POST",
                          body: formData,
                        })
                        if (!res.ok) throw new Error("Failed to submit video complaint")
                        setIsSuccess(true)
                        setVideoFile(null)
                        setDistrict("")
                        setSector("")
                        setCell("")
                        setVillage("")
                        setTimeout(() => router.push("/track"), 2000)
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Failed to submit video complaint")
                      } finally {
                        setIsSubmitting(false)
                      }
                    }}
                    className="space-y-4"
                  >
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Upload or record your video
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      capture="environment"
                      onChange={e => setVideoFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600"
                      required
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">District</label>
                        <input type="text" value={district} onChange={e => setDistrict(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" required />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">Sector</label>
                        <input type="text" value={sector} onChange={e => setSector(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" required />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">Cell</label>
                        <input type="text" value={cell} onChange={e => setCell(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" required />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">Village</label>
                        <input type="text" value={village} onChange={e => setVillage(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" required />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-[#00A1DE] hover:bg-[#0090c5] transition-all duration-300 hover:shadow-lg hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                      disabled={isSubmitting || !videoFile}
                    >
                      {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit Video Complaint"}
                    </button>
                  </form>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  )
}
