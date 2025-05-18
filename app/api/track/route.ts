import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { getToken } from "next-auth/jwt"
import { NextRequest } from "next/server"
import { cookies } from "next/headers"


export async function GET(request: NextRequest) {
  try {

    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value

    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
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
      id: complaint.id,
      description: complaint.transcription || complaint.description || "",
      category: complaint.aiCategory || complaint.category || "General",
      location: complaint.district 
        ? `${complaint.district}${complaint.sector ? `, ${complaint.sector}` : ''}`
        : "Unknown location",
      status: complaint.status,
      createdAt: new Date(complaint.createdAt).toISOString(),
      updatedAt: new Date(complaint.updatedAt).toISOString(),
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