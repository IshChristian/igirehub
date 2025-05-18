"use client"

import { useState, useEffect } from "react"
import { MapPin, Search, Filter, ChevronDown } from "lucide-react"

interface MapComplaint {
  id: string
  category: string
  status: string
  location: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export default function PublicAccountabilityMap() {
  const [complaints, setComplaints] = useState<MapComplaint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    // In a real app, fetch from API
    const fetchComplaints = async () => {
      setIsLoading(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock data
        const mockComplaints: MapComplaint[] = [
          {
            id: "C001",
            category: "Water",
            status: "in-progress",
            location: "Kigali, Nyarugenge",
            coordinates: { lat: -1.944, lng: 30.062 },
          },
          {
            id: "C002",
            category: "Sanitation",
            status: "submitted",
            location: "Kigali, Kicukiro",
            coordinates: { lat: -1.967, lng: 30.114 },
          },
          {
            id: "C003",
            category: "Roads",
            status: "resolved",
            location: "Kigali, Gasabo",
            coordinates: { lat: -1.916, lng: 30.104 },
          },
          {
            id: "C004",
            category: "Electricity",
            status: "submitted",
            location: "Kigali, Nyarugenge",
            coordinates: { lat: -1.954, lng: 30.058 },
          },
          {
            id: "C005",
            category: "Sanitation",
            status: "in-progress",
            location: "Kigali, Kicukiro",
            coordinates: { lat: -1.977, lng: 30.124 },
          },
        ]

        setComplaints(mockComplaints)
      } catch (error) {
        console.error("Error fetching map data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchComplaints()
  }, [])

  const filteredComplaints = filter === "all" ? complaints : complaints.filter((c) => c.status === filter)

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Public Accountability Map</h2>
        <div className="flex space-x-2">
          <div className="relative">
            <input type="text" placeholder="Search location..." className="input h-9 pl-8" />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input h-9 pl-8 pr-8 appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="relative h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rwanda-blue"></div>
          </div>
        ) : (
          <>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">Interactive map would be implemented here</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Showing {filteredComplaints.length} complaints in Kigali
                </p>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-700 p-2 rounded shadow-md">
              <div className="flex flex-col space-y-1 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                  <span>Submitted</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                  <span>In Progress</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                  <span>Resolved</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">Agency Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
            <div className="text-xs text-gray-500 dark:text-gray-400">Water Authority</div>
            <div className="text-sm font-medium">85% resolved in 48hrs</div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
            <div className="text-xs text-gray-500 dark:text-gray-400">Sanitation Dept</div>
            <div className="text-sm font-medium">72% resolved in 48hrs</div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
            <div className="text-xs text-gray-500 dark:text-gray-400">Roads Agency</div>
            <div className="text-sm font-medium">68% resolved in 48hrs</div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
            <div className="text-xs text-gray-500 dark:text-gray-400">Electricity Utility</div>
            <div className="text-sm font-medium">79% resolved in 48hrs</div>
          </div>
        </div>
      </div>
    </div>
  )
}
