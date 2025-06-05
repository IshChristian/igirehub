import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Get userId from query parameter
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "User ID not provided" },
        { status: 401 }
      )
    }

    const client = await clientPromise
    const db = client.db()
    
    const complaints = await db.collection("complaints")
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .toArray()

    // Convert MongoDB objects to plain objects
    const serializedComplaints = complaints.map(complaint => ({
      id: complaint.id || complaint._id?.toString(),
      description: complaint.transcription || complaint.description || "",
      category: complaint.aiCategory || complaint.category || "General",
      location: complaint.district 
        ? `${complaint.district}${complaint.sector ? `, ${complaint.sector}` : ''}`
        : "Unknown location",
      status: complaint.status,
      createdAt: complaint.createdAt ? new Date(complaint.createdAt).toISOString() : null,
      updatedAt: complaint.updatedAt ? new Date(complaint.updatedAt).toISOString() : null,
      audioUrl: complaint.audioUrl || null,
      pointsAwarded: complaint.pointsAwarded || 0,
      assignedAgency: complaint.assignedAgency || null
    }))

    return NextResponse.json(serializedComplaints)
  } catch (error) {
    console.error("Error fetching complaints:", error)
    return NextResponse.json(
      { error: "Failed to fetch complaints" },
      { status: 500 }
    )
  }
}