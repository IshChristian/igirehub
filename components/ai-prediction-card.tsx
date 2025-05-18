"use client"

import { useState } from "react"
import { AlertTriangle, ChevronDown, ChevronUp, Brain, Loader2 } from "lucide-react"
import useSWR from "swr"
import { toast } from "sonner"

interface Prediction {
  id: string
  issue: string
  category: string
  probability: number
  timeframe: string
  location: string
  confidence: number
  evidence: string[]
  createdAt: string
}

interface AIPredictionCardProps {
  location: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function AIPredictionCard({ location }: AIPredictionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Fetch predictions from API
  const { data: predictions, mutate, isLoading } = useSWR<Prediction[]>(
    `/api/predictions?location=${encodeURIComponent(location)}`,
    fetcher,
    {
      revalidateOnFocus: false,
      errorRetryCount: 2
    }
  )

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await mutate()
      toast.success("Predictions refreshed")
    } catch (error) {
      toast.error("Failed to refresh predictions")
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDismissPrediction = async (predictionId: string) => {
    try {
      await fetch(`/api/predictions/${predictionId}`, {
        method: "DELETE"
      })
      mutate(predictions?.filter(p => p.id !== predictionId), false)
      toast.success("Prediction dismissed")
    } catch (error) {
      toast.error("Failed to dismiss prediction")
    }
  }

  if (isLoading) {
    return (
      <div className="card flex justify-center items-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!predictions || predictions.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-full mr-3">
              <Brain className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold">AI Predictions</h2>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          No predictions available for <span className="font-medium">{location}</span> at this time.
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-full mr-3">
            <Brain className="h-5 w-5 text-purple-600" />
          </div>
          <h2 className="text-lg font-semibold">AI Predictions</h2>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="ml-3 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Refresh predictions"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
          </button>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>

      <div className="mb-3">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Predicted issues for <span className="font-medium">{location}</span> based on historical data:
        </p>
      </div>

      <div className={`space-y-4 ${isExpanded ? "" : "max-h-[180px] overflow-hidden"}`}>
        {predictions.map((prediction) => (
          <div key={prediction.id} className="group relative">
            <div className="flex items-start">
              <div className={`p-2 rounded-full flex-shrink-0 ${getColorByProbability(prediction.probability)}`}>
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center">
                  <h3 className="text-sm font-medium">{prediction.issue}</h3>
                  <span
                    className={`ml-2 text-xs px-2 py-0.5 rounded-full ${getProbabilityBadgeColor(prediction.probability)}`}
                  >
                    {prediction.probability}% probability
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                    {prediction.category}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-full">
                    {prediction.location}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span className="font-medium">Timeframe:</span> {prediction.timeframe}
                </p>
                {isExpanded && (
                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                    <p className="font-medium">Evidence:</p>
                    <ul className="list-disc pl-4 space-y-1 mt-1">
                      {prediction.evidence.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                    <p className="mt-1">
                      <span className="font-medium">Confidence:</span> {prediction.confidence}%
                    </p>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => handleDismissPrediction(prediction.id)}
              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 text-xs text-gray-400 hover:text-red-500 transition-opacity"
              title="Dismiss prediction"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {!isExpanded && predictions.length > 2 && (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full text-center text-sm text-purple-600 hover:underline mt-2"
        >
          Show all {predictions.length} predictions
        </button>
      )}

      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Predictions generated by our AI system analyzing historical complaint patterns, weather data, and infrastructure reports.
          Last updated: {new Date(predictions[0].createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  )
}

function getColorByProbability(probability: number) {
  if (probability >= 80) {
    return "bg-red-100 dark:bg-red-900/20 text-red-500"
  } else if (probability >= 60) {
    return "bg-orange-100 dark:bg-orange-900/20 text-orange-500"
  } else {
    return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-500"
  }
}

function getProbabilityBadgeColor(probability: number) {
  if (probability >= 80) {
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
  } else if (probability >= 60) {
    return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
  } else {
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
  }
}