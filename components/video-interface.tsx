"use client"

import { useState, useRef } from "react"
import { Upload, Video, Loader2, CheckCircle2, XCircle } from "lucide-react"

export default function VideoUploader() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [error, setError] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("")
    setStatus("idle")
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      
      // Validate file type
      if (!file.type.startsWith('video/')) {
        setError("Please select a valid video file")
        return
      }

      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        setError("Video file must be less than 50MB")
        return
      }

      setVideoFile(file)
    }
  }

  const handleUpload = async () => {
    if (!videoFile) return

    try {
      setStatus("uploading")
      setError("")

      const formData = new FormData()
      formData.append('video', videoFile)
      formData.append('language', 'en')

      const apiResponse = await fetch("/api/submit-complaints", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      })

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json()
        throw new Error(errorData.error || 'Failed to submit video')
      }

      const data = await apiResponse.json()
      console.log("Video submitted successfully:", data)
      setStatus("success")
    } catch (err) {
      console.error("Upload error:", err)
      setError(err instanceof Error ? err.message : "Submission failed")
      setStatus("error")
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Upload Circle */}
        <div 
          onClick={triggerFileInput}
          className={`relative h-40 w-40 mx-auto rounded-full flex items-center justify-center border-2 border-dashed cursor-pointer transition-all
            ${status === "idle" ? "border-gray-300 hover:border-[#00A1DE] hover:bg-gray-50" : ""}
            ${status === "uploading" ? "border-[#00A1DE]" : ""}
            ${status === "success" ? "border-green-500" : ""}
            ${status === "error" ? "border-red-500" : ""}
          `}
        >
          <input
            type="file"
            ref={fileInputRef}
            accept="video/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {status === "idle" && (
            <div className="text-center">
              <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Click to upload video</p>
              <p className="text-xs text-gray-400 mt-1">MP4, MOV, etc.</p>
            </div>
          )}
          
          {status === "uploading" && (
            <div className="text-center">
              <Loader2 className="h-10 w-10 mx-auto text-[#00A1DE] animate-spin mb-2" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          )}
          
          {status === "success" && (
            <div className="text-center">
              <CheckCircle2 className="h-10 w-10 mx-auto text-green-500 mb-2" />
              <p className="text-sm text-gray-600">Upload complete!</p>
            </div>
          )}
          
          {status === "error" && (
            <div className="text-center">
              <XCircle className="h-10 w-10 mx-auto text-red-500 mb-2" />
              <p className="text-sm text-gray-600">Upload failed</p>
            </div>
          )}
        </div>

        {/* Video Preview */}
        {videoFile && status !== "success" && (
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Video className="h-5 w-5 mr-2 text-[#00A1DE]" />
                <span className="text-sm font-medium truncate max-w-xs">
                  {videoFile.name}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
              </span>
            </div>
            
            <video
              ref={videoRef}
              src={URL.createObjectURL(videoFile)}
              controls
              className="w-full rounded-lg border"
            />
            
            <button
              onClick={handleUpload}
              disabled={status === "uploading"}
              className="w-full mt-4 flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-[#00A1DE] hover:bg-[#0090c5] transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "uploading" ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Uploading Video
                </>
              ) : "Submit Video Complaint"}
            </button>
          </div>
        )}

        {/* Success Message */}
        {status === "success" && (
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center text-green-600">
              <CheckCircle2 className="h-5 w-5 mr-2" />
              <span>Video complaint submitted successfully!</span>
            </div>
            <button
              onClick={() => {
                setVideoFile(null)
                setStatus("idle")
              }}
              className="mt-4 text-sm text-[#00A1DE] hover:underline"
            >
              Upload another video
            </button>
          </div>
        )}

        {/* Error Message */}
        {status === "error" && (
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center text-red-600">
              <XCircle className="h-5 w-5 mr-2" />
              <span>{error || "Upload failed"}</span>
            </div>
            <button
              onClick={() => {
                setError("")
                setStatus("idle")
              }}
              className="mt-4 text-sm text-[#00A1DE] hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            How to record your complaint:
          </h4>
          <ol className="list-decimal list-inside text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
            <li>Start by clearly stating your <span className="font-bold">full name</span>.</li>
            <li>Say your <span className="font-bold">location</span> in this order: <span className="font-semibold">district, sector, cell, village</span>.</li>
            <li>Describe your <span className="font-bold">complaint</span> in detail.</li>
          </ol>
          <p className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
            Example: "My name is Jane Doe. I am in Gasabo district, Remera sector, Nyabisindu cell, Village A. My complaint is about water shortage for the past week."
          </p>
        </div>
      </div>
    </div>
  )
}