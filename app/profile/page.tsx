"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import {
  User,
  Mail,
  Phone,
  Lock,
  Settings,
  LogOut,
  Loader2,
  AlertCircle,
  CheckCircle,
  Coins,
  Zap,
  Wifi,
  Lightbulb,
  Clock,
  Shield,
  ArrowRight,
} from "lucide-react"

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  coins: number
  joinedDate: string
  lastActivity: string
  rewardHistory: {
    id: string
    type: "airtime" | "internet" | "electricity"
    amount: number
    coins: number
    date: string
    status: "pending" | "completed"
  }[]
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"profile" | "rewards" | "settings">("profile")
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [selectedReward, setSelectedReward] = useState<"airtime" | "internet" | "electricity" | null>(null)
  const [redeemAmount, setRedeemAmount] = useState<number>(0)
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [redeemSuccess, setRedeemSuccess] = useState("")
  const [redeemError, setRedeemError] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/auth/login?redirect=/profile")
      return
    }
    fetchUserProfile()
  }, [user, router])

  const fetchUserProfile = async () => {
    setIsLoading(true)
    setError("")
    try {
      const response = await fetch("/api/profile", { credentials: "include" })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Failed to fetch profile")
      setProfile(data)
      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile")
      setIsLoading(false)
    }
  }

  

  // Update profile handler (example for name/phone)
  const handleProfileUpdate = async (updatedFields: Partial<UserProfile>) => {
    setError("")
    setIsLoading(true)
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedFields),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Failed to update profile")
      setProfile(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")
    setPasswordSuccess("")

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match")
      return
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters")
      return
    }

    setIsChangingPassword(true)

    try {
      const response = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Failed to change password")
      setPasswordSuccess("Password changed successfully")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to change password")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleRedeemReward = async (e: React.FormEvent) => {
    e.preventDefault()
    setRedeemError("")
    setRedeemSuccess("")

    if (!selectedReward) {
      setRedeemError("Please select a reward type")
      return
    }

    if (redeemAmount <= 0) {
      setRedeemError("Please enter a valid amount")
      return
    }

    const requiredCoins = calculateRequiredCoins(selectedReward, redeemAmount)

    if (!profile || profile.coins < requiredCoins) {
      setRedeemError(`You need at least ${requiredCoins} coins for this reward`)
      return
    }

    setIsRedeeming(true)

    try {
      const response = await fetch("/api/profile/redeem-reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          type: selectedReward,
          amount: redeemAmount,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Failed to redeem reward")
      setRedeemSuccess(`Successfully redeemed ${redeemAmount} RWF of ${selectedReward}!`)
      fetchUserProfile() // Refresh profile
      setSelectedReward(null)
      setRedeemAmount(0)
    } catch (err) {
      setRedeemError(err instanceof Error ? err.message : "Failed to redeem reward")
    } finally {
      setIsRedeeming(false)
    }
  }

  const calculateRequiredCoins = (type: "airtime" | "internet" | "electricity", amount: number): number => {
    // Example conversion rates (can be adjusted based on your business logic)
    const conversionRates = {
      airtime: 0.2, // 1 coin = 5 RWF of airtime
      internet: 0.25, // 1 coin = 4 RWF of internet
      electricity: 0.2, // 1 coin = 5 RWF of electricity
    }

    return Math.ceil(amount * conversionRates[type])
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#00A1DE] mb-4" />
          <p className="text-gray-600 dark:text-gray-300 font-medium">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="flex flex-col items-center">
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full mb-4">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Profile</h2>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">{error}</p>
            <div className="flex space-x-4">
              <button
                onClick={fetchUserProfile}
                className="px-4 py-2 bg-[#00A1DE] text-white rounded-md hover:bg-[#0090c5] transition-colors"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return null
  }

function formatDate(dateString?: string): string {
  if (!dateString) return ""
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ""
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-[#00A1DE] to-[#009A44] rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-6 sm:p-8 md:flex items-center">
            <div className="flex-shrink-0 flex items-center justify-center h-24 w-24 rounded-full bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-800 shadow-md mb-4 md:mb-0 md:mr-6">
              <User className="h-12 w-12 text-[#00A1DE]" />
            </div>
            <div className="md:flex-1">
              <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
              <div className="flex flex-wrap items-center mt-2 text-white/80">
                <Mail className="h-4 w-4 mr-1" />
                <span className="mr-4">{profile.email}</span>
                {profile.phone && (
                  <>
                    <Phone className="h-4 w-4 mr-1 ml-2" />
                    <span>{profile.phone}</span>
                  </>
                )}
              </div>
              <div className="mt-4 flex items-center">
                <div className="bg-white/20 rounded-full px-3 py-1 text-sm text-white flex items-center">
                  <Coins className="h-4 w-4 mr-1" />
                  <span className="font-medium">{profile.coins} Coins</span>
                </div>
                <div className="ml-4 text-sm text-white/80">Member since {formatDate(profile.joinedDate)}</div>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-md text-white transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white dark:bg-gray-800 px-6 flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-4 px-4 font-medium text-sm flex items-center ${
                activeTab === "profile"
                  ? "text-[#00A1DE] border-b-2 border-[#00A1DE]"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab("rewards")}
              className={`py-4 px-4 font-medium text-sm flex items-center ${
                activeTab === "rewards"
                  ? "text-[#00A1DE] border-b-2 border-[#00A1DE]"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Coins className="h-4 w-4 mr-2" />
              Rewards
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`py-4 px-4 font-medium text-sm flex items-center ${
                activeTab === "settings"
                  ? "text-[#00A1DE] border-b-2 border-[#00A1DE]"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Account Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</h3>
                    <p className="mt-1 text-gray-900 dark:text-white">{profile.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</h3>
                    <p className="mt-1 text-gray-900 dark:text-white">{profile.email}</p>
                  </div>
                  {profile.phone && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</h3>
                      <p className="mt-1 text-gray-900 dark:text-white">{profile.phone}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</h3>
                    <p className="mt-1 text-gray-900 dark:text-white">{formatDate(profile.joinedDate)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Activity</h3>
                    <p className="mt-1 text-gray-900 dark:text-white">{formatDate(profile.lastActivity)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Coins</h3>
                    <p className="mt-1 flex items-center text-gray-900 dark:text-white">
                      <Coins className="h-5 w-5 text-yellow-500 mr-1" />
                      <span className="font-medium">{profile.coins}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                {profile.rewardHistory.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Type
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Amount
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Coins Used
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Date
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {profile.rewardHistory.map((reward) => (
                          <tr key={reward.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {reward.type === "airtime" && <Zap className="h-5 w-5 text-blue-500 mr-2" />}
                                {reward.type === "internet" && <Wifi className="h-5 w-5 text-green-500 mr-2" />}
                                {reward.type === "electricity" && (
                                  <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
                                )}
                                <span className="capitalize">{reward.type}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{reward.amount} RWF</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Coins className="h-4 w-4 text-yellow-500 mr-1" />
                                {reward.coins}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{formatDate(reward.date)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  reward.status === "completed"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                }`}
                              >
                                {reward.status === "completed" ? (
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                ) : (
                                  <Clock className="h-3 w-3 mr-1" />
                                )}
                                <span className="capitalize">{reward.status}</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No activity yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rewards Tab */}
          {activeTab === "rewards" && (
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Rewards</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Redeem your coins for valuable rewards</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center bg-[#00A1DE]/10 px-4 py-2 rounded-lg">
                  <Coins className="h-5 w-5 text-[#00A1DE] mr-2" />
                  <span className="font-medium text-gray-900 dark:text-white">Available: {profile.coins} Coins</span>
                </div>
              </div>

              {/* Minimum coins notice */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Shield className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Redemption Requirement</h3>
                    <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-200">
                      <p>You need at least 100 coins to redeem any reward.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reward Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Airtime Card */}
                <div
                  className={`border rounded-lg overflow-hidden transition-all ${
                    selectedReward === "airtime"
                      ? "border-[#00A1DE] ring-2 ring-[#00A1DE]/50"
                      : "border-gray-200 dark:border-gray-700 hover:shadow-md"
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                        <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">5 coins = 25 RWF</div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Mobile Airtime</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      Redeem your coins for MTN or Airtel airtime credit
                    </p>
                    <button
                      onClick={() => setSelectedReward("airtime")}
                      className={`w-full py-2 rounded-md flex items-center justify-center transition-colors ${
                        selectedReward === "airtime"
                          ? "bg-[#00A1DE] text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {selectedReward === "airtime" ? "Selected" : "Select"}
                    </button>
                  </div>
                </div>

                {/* Internet Card */}
                <div
                  className={`border rounded-lg overflow-hidden transition-all ${
                    selectedReward === "internet"
                      ? "border-[#00A1DE] ring-2 ring-[#00A1DE]/50"
                      : "border-gray-200 dark:border-gray-700 hover:shadow-md"
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                        <Wifi className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">5 coins = 20 RWF</div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Internet Data</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      Convert your coins to mobile internet data bundles
                    </p>
                    <button
                      onClick={() => setSelectedReward("internet")}
                      className={`w-full py-2 rounded-md flex items-center justify-center transition-colors ${
                        selectedReward === "internet"
                          ? "bg-[#00A1DE] text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {selectedReward === "internet" ? "Selected" : "Select"}
                    </button>
                  </div>
                </div>

                {/* Electricity Card */}
                <div
                  className={`border rounded-lg overflow-hidden transition-all ${
                    selectedReward === "electricity"
                      ? "border-[#00A1DE] ring-2 ring-[#00A1DE]/50"
                      : "border-gray-200 dark:border-gray-700 hover:shadow-md"
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full">
                        <Lightbulb className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">5 coins = 25 RWF</div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Electricity Bill</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      Use your coins to pay for electricity bills
                    </p>
                    <button
                      onClick={() => setSelectedReward("electricity")}
                      className={`w-full py-2 rounded-md flex items-center justify-center transition-colors ${
                        selectedReward === "electricity"
                          ? "bg-[#00A1DE] text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {selectedReward === "electricity" ? "Selected" : "Select"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Redemption Form */}
              {selectedReward && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6 animate-fadeIn">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Redeem {selectedReward.charAt(0).toUpperCase() + selectedReward.slice(1)}
                  </h3>

                  {redeemError && (
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center mb-4">
                      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <p>{redeemError}</p>
                    </div>
                  )}

                  {redeemSuccess && (
                    <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center mb-4">
                      <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <p>{redeemSuccess}</p>
                    </div>
                  )}

                  <form onSubmit={handleRedeemReward} className="space-y-4">
                    <div>
                      <label
                        htmlFor="amount"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Amount (RWF)
                      </label>
                      <input
                        type="number"
                        id="amount"
                        min="100"
                        step="100"
                        value={redeemAmount}
                        onChange={(e) => setRedeemAmount(Number.parseInt(e.target.value) || 0)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00A1DE] focus:border-[#00A1DE] sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="Enter amount in RWF"
                        required
                      />
                    </div>

                    {redeemAmount > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                          <span className="text-gray-900 dark:text-white font-medium">{redeemAmount} RWF</span>
                        </div>
                        <div className="flex justify-between text-sm mt-2">
                          <span className="text-gray-500 dark:text-gray-400">Required coins:</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {calculateRequiredCoins(selectedReward, redeemAmount)} coins
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mt-2">
                          <span className="text-gray-500 dark:text-gray-400">Remaining coins after redemption:</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {Math.max(0, profile.coins - calculateRequiredCoins(selectedReward, redeemAmount))} coins
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setSelectedReward(null)}
                        className="mr-4 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={
                          isRedeeming ||
                          redeemAmount <= 0 ||
                          (profile && profile.coins < calculateRequiredCoins(selectedReward, redeemAmount)) ||
                          profile.coins < 100
                        }
                        className="px-4 py-2 bg-[#00A1DE] text-white rounded-md hover:bg-[#0090c5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {isRedeeming ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Coins className="h-4 w-4 mr-2" />
                        )}
                        Redeem Now
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Reward History */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Redemption History</h3>
                {profile.rewardHistory.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Type
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Amount
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Coins Used
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Date
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {profile.rewardHistory.map((reward) => (
                          <tr key={reward.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {reward.type === "airtime" && <Zap className="h-5 w-5 text-blue-500 mr-2" />}
                                {reward.type === "internet" && <Wifi className="h-5 w-5 text-green-500 mr-2" />}
                                {reward.type === "electricity" && (
                                  <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
                                )}
                                <span className="capitalize">{reward.type}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{reward.amount} RWF</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Coins className="h-4 w-4 text-yellow-500 mr-1" />
                                {reward.coins}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{formatDate(reward.date)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  reward.status === "completed"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                }`}
                              >
                                {reward.status === "completed" ? (
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                ) : (
                                  <Clock className="h-3 w-3 mr-1" />
                                )}
                                <span className="capitalize">{reward.status}</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <Coins className="h-8 w-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                    <p>No redemption history yet</p>
                    <p className="text-sm mt-1">Redeem your first reward to see it here</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Account Settings</h2>

              {/* Change Password Section */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h3>

                {passwordError && (
                  <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center mb-4">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p>{passwordError}</p>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center mb-4">
                    <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p>{passwordSuccess}</p>
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  <div>
                    <label
                      htmlFor="current-password"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Current Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="current-password"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00A1DE] focus:border-[#00A1DE] sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="Enter your current password"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="new-password"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="new-password"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00A1DE] focus:border-[#00A1DE] sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="Enter new password (min. 8 characters)"
                        minLength={8}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirm-new-password"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirm-new-password"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00A1DE] focus:border-[#00A1DE] sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="Confirm your new password"
                        minLength={8}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="px-4 py-2 bg-[#00A1DE] text-white rounded-md hover:bg-[#0090c5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isChangingPassword ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Lock className="h-4 w-4 mr-2" />
                      )}
                      Change Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add animation keyframes */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
