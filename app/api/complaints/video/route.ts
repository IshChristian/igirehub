import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import clientPromise from "@/lib/mongodb"
import { cookies } from "next/headers"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const video = formData.get("video") as File
    const description = formData.get("description")?.toString() || ""
    const category = formData.get("category")?.toString() || ""
    const coordinates = formData.get("coordinates")?.toString() || null
    const district = formData.get("district")?.toString() || ""
    const sector = formData.get("sector")?.toString() || ""
    const cell = formData.get("cell")?.toString() || ""
    const village = formData.get("village")?.toString() || ""

    // Get userId from cookie
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value || null

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    if (!video) {
      return NextResponse.json({ error: "No video file provided" }, { status: 400 })
    }

    // Ensure directory exists
    const videoDir = path.join(process.cwd(), "public", "complaints", "videos")
    await mkdir(videoDir, { recursive: true })

    // Save video to /public/complaints/videos
    const buffer = Buffer.from(await video.arrayBuffer())
    const fileName = `${Date.now()}-${video.name.replace(/\s+/g, "_")}`
    await writeFile(path.join(videoDir, fileName), buffer)

    // Generate a complaint ID (e.g., C1234)
    const complaintId = `C${Math.floor(1000 + Math.random() * 9000)}`

    // Save complaint record to DB
    const client = await clientPromise
    const db = client.db()
    const complaint = {
      id: complaintId,
      userId,
      description,
      category,
      location: null,
      coordinates,
      district,
      sector,
      cell,
      village,
      status: "submitted",
      assignedAgency: null,
      submissionMethod: "video",
      pointsAwarded: 50,
      videoUrl: `/complaints/videos/${fileName}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    await db.collection("complaints").insertOne(complaint)

    return NextResponse.json({ success: true, videoUrl: complaint.videoUrl })
  } catch (error) {
    console.error("Video complaint error:", error)
    return NextResponse.json({ error: "Failed to submit video complaint" }, { status: 500 })
  }
}