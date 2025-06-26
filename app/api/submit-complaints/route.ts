import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import clientPromise from "@/lib/mongodb"
import { uploadToCloudinary } from "@/lib/upload"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    console.log("=== API Route Started ===")
    
    let audioUrl: string | undefined = undefined
    let videoUrl: string | undefined = undefined
    let language = ""
    let fileType: 'audio' | 'video' | null = null
    
    // Fixed cookie handling
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value

    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      )
    }

    // Get content type header
    const contentType = request.headers.get("content-type") || ""
    console.log("Content-Type:", contentType)
    
    // Handle multipart/form-data (audio or video files)
    if (contentType.includes("multipart/form-data")) {
      console.log("Processing multipart form data...")
      
      try {
        const formData = await request.formData()
        console.log("FormData parsed successfully")
        
        // Check for audio file
        const audioFile = formData.get("audio") as File | null
        const videoFile = formData.get("video") as File | null
        const languageFromForm = formData.get("language") as string | null
        
        console.log("Audio file:", audioFile ? `${audioFile.name} (${audioFile.size} bytes, ${audioFile.type})` : "No audio file")
        console.log("Video file:", videoFile ? `${videoFile.name} (${videoFile.size} bytes, ${videoFile.type})` : "No video file")
        console.log("Language:", languageFromForm || "Not specified")
        
        if (languageFromForm) {
          language = languageFromForm
        }
        
        if (audioFile) {
          // Process audio file
          fileType = 'audio'
          console.log("Processing audio file...")
          const buffer = Buffer.from(await audioFile.arrayBuffer())
          console.log("Audio buffer created, size:", buffer.length)
          
          console.log("Uploading audio to Cloudinary...")
          audioUrl = await uploadToCloudinary(buffer, "complaints/audio", "video") // Use 'video' for webm audio
          console.log("Audio upload successful:", audioUrl)
          
        } else if (videoFile) {
          // Process video file
          fileType = 'video'
          console.log("Processing video file...")
          const buffer = Buffer.from(await videoFile.arrayBuffer())
          console.log("Video buffer created, size:", buffer.length)
          
          console.log("Uploading video to Cloudinary...")
          videoUrl = await uploadToCloudinary(buffer, "complaints/video", "video")
          console.log("Video upload successful:", videoUrl)
          
        } else {
          console.log("No audio or video file provided")
          return NextResponse.json({ error: "No audio or video file provided" }, { status: 400 })
        }
        
      } catch (formError) {
        console.error("Error processing form data:", formError)
        return NextResponse.json({ 
          error: `Failed to process form data: ${formError instanceof Error ? formError.message : 'Unknown error'}` 
        }, { status: 500 })
      }
      
    } else {
      // Handle JSON (video URL or other data)
      console.log("Processing JSON data...")
      try {
        const body = await request.json()
        videoUrl = body.videoUrl
        language = body.language || ""
        fileType = 'video'
        
        if (!videoUrl) {
          return NextResponse.json({ error: "No video URL provided" }, { status: 400 })
        }
        
        console.log("Video URL from JSON:", videoUrl)
        console.log("Language from JSON:", language)
        
      } catch (jsonError) {
        console.error("Error parsing JSON:", jsonError)
        return NextResponse.json({ error: "Invalid JSON data" }, { status: 400 })
      }
    }

    if (!fileType) {
      return NextResponse.json({ error: "No file type determined" }, { status: 400 })
    }

    // Test MongoDB connection
    console.log("Connecting to MongoDB...")
    const client = await clientPromise
    console.log("MongoDB client obtained")
    
    const db = client.db()
    console.log("Database reference obtained")
    
    const complaintId = uuidv4()
    console.log("Generated complaint ID:", complaintId)
    
    const document = {
      id: complaintId,
      userId: userId,
      audioUrl,
      videoUrl,
      language,
      fileType,
      status: "submitted",
      pointsAwarded: 50,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    console.log("Inserting document:", document)
    
    const result = await db.collection("complaints").insertOne(document)
    console.log("Document inserted successfully:", result.insertedId)
    
    console.log("=== API Route Completed Successfully ===")
    return NextResponse.json({
      success: true,
      userId: userId,
      audioUrl,
      videoUrl,
      fileType,
      language,
      message: `${fileType === 'audio' ? 'Audio' : 'Video'} complaint submitted successfully`
    })
    
  } catch (error) {
    console.error("=== UNHANDLED ERROR IN API ROUTE ===")
    console.error("Error:", error)
    console.error("=====================================")
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process complaint" },
      { status: 500 }
    )
  }
}