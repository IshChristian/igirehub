"use client"

import { useState, useRef } from "react"
import { Mic, StopCircle, CheckCircle2, AlertCircle, Info } from "lucide-react"

export default function VoiceInterface() {
  const [status, setStatus] = useState<"idle" | "recording" | "uploading" | "success" | "error">("idle")
  const [error, setError] = useState("")
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    setStatus("recording")
    setError("")

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = uploadAudio
      mediaRecorder.start(250) // Collect data every 250ms
    } catch (err) {
      setError("Microphone access denied")
      setStatus("error")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && status === "recording") {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
      setStatus("uploading")
    }
  }

  const uploadAudio = async () => {
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
      const formData = new FormData()
      formData.append("audio", audioBlob, "complaint.webm")

      const response = await fetch("/api/submit-complaint", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setStatus("success")
      } else {
        throw new Error(data.error || "Upload failed")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed")
      setStatus("error")
    }
  }

  const resetForm = () => {
    setStatus("idle")
    setError("")
    mediaRecorderRef.current = null
    audioChunksRef.current = []
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-[#00A1DE] to-[#009A44] p-4 text-white">
          <h2 className="text-xl font-bold text-center">Voice Complaint Submission</h2>
          <p className="text-sm text-center mt-1 text-white/80">Speak clearly in Kinyarwanda or English</p>
        </div>

        <div className="p-6">
          {status === "idle" && (
            <div className="space-y-6">
              <div className="flex items-start space-x-3 bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <p>Your voice recording will be processed to identify the nature and location of your complaint.</p>
              </div>

              <div className="flex justify-center">
                <button onClick={startRecording} className="relative group" aria-label="Start recording">
                  <div className="absolute inset-0 rounded-full bg-[#00A1DE]/20 group-hover:bg-[#00A1DE]/30 animate-ping"></div>
                  <div className="relative flex items-center justify-center h-24 w-24 rounded-full bg-[#00A1DE] hover:bg-[#0090c5] transition-colors">
                    <Mic size={36} className="text-white" />
                  </div>
                </button>
              </div>

              <p className="text-center text-gray-600 font-medium">Tap the microphone to start recording</p>
            </div>
          )}

          {status === "recording" && (
            <div className="space-y-6">
              <div className="flex justify-center">
                {/* Recording animation */}
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping"></div>
                  <div className="absolute -inset-4 rounded-full bg-red-500/10 animate-pulse"></div>
                  <div className="relative flex items-center justify-center h-24 w-24 rounded-full bg-red-500 border-4 border-white">
                    <div className="h-4 w-4 rounded-full bg-white animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Audio waveform visualization */}
              <div className="flex items-center justify-center h-12 space-x-1">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-red-400 rounded-full"
                    style={{
                      height: `${Math.max(15, Math.floor(Math.random() * 40))}px`,
                      animationDelay: `${i * 0.05}s`,
                      animation: "waveform 0.5s ease infinite alternate",
                    }}
                  ></div>
                ))}
              </div>

              <div className="text-center">
                <p className="text-red-600 font-medium flex items-center justify-center">
                  <StopCircle size={20} className="mr-2 animate-pulse" />
                  Recording in progress...
                </p>
                <p className="text-sm text-gray-500 mt-1">Speak clearly and describe your complaint</p>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={stopRecording}
                  className="px-6 py-3 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors flex items-center"
                >
                  <StopCircle size={20} className="mr-2" />
                  Stop & Submit
                </button>
              </div>
            </div>
          )}

          {status === "uploading" && (
            <div className="py-8 space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <svg
                    className="animate-spin h-16 w-16 text-[#00A1DE]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              </div>

              <div className="text-center">
                <p className="text-lg font-medium text-gray-800">Processing your complaint</p>
                <p className="text-gray-500 mt-2">Please wait while we analyze your recording...</p>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="py-8 space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute -inset-4 rounded-full bg-green-500/10 animate-pulse"></div>
                  <div className="relative flex items-center justify-center h-24 w-24 rounded-full bg-green-100">
                    <CheckCircle2 size={48} className="text-green-600" />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900">Complaint Submitted!</h3>
                <p className="text-gray-600 mt-2">Thank you for your feedback. Your complaint has been recorded.</p>

                <div className="mt-4 inline-block bg-green-50 px-4 py-2 rounded-lg">
                  <p className="text-green-800 font-medium">You earned 50 points</p>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={resetForm}
                  className="px-6 py-3 bg-[#009A44] text-white rounded-full hover:bg-[#008a3d] transition-colors"
                >
                  Record Another Complaint
                </button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="py-8 space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute -inset-4 rounded-full bg-red-500/10 animate-pulse"></div>
                  <div className="relative flex items-center justify-center h-24 w-24 rounded-full bg-red-100">
                    <AlertCircle size={48} className="text-red-600" />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900">Error Occurred</h3>
                <p className="text-red-600 mt-2">{error}</p>
                <p className="text-gray-500 mt-2">Please check your microphone and internet connection.</p>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add keyframe animation for waveform */}
      <style jsx global>{`
        @keyframes waveform {
          0% {
            height: 5px;
          }
          100% {
            height: 40px;
          }
        }
      `}</style>
    </div>
  )
}
