import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { predictCategory } from "@/lib/ai-utils"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()
    
    const complaints = await db.collection("complaints")
      .find({})
      .project({
        id: 1,
        description: 1,
        category: 1,
        aiCategory: 1,
        aiConfidence: 1,
        status: 1,
        assignedAgency: 1,
        district: 1,
        sector: 1,
        cell: 1,
        village: 1,
        audioUrl: 1,
        createdAt: 1,
        updatedAt: 1
      })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(complaints)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch complaints" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db()
    const data = await request.json()

    const result = await db.collection("complaints").updateOne(
      { id: params.id },
      { $set: { ...data, updatedAt: new Date() } }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Complaint not found or not modified" },
        { status: 404 }
      )
    }

    // Get the updated complaint
    const updatedComplaint = await db.collection("complaints").findOne({ id: params.id })

    return NextResponse.json(updatedComplaint)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update complaint" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db()
    const data = await request.json()
    
    // Properly await cookies() call
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value

    // Use AI to predict category
    const aiPrediction = await predictCategory(data.description)

    const complaint = {
      id: `C${Math.floor(1000 + Math.random() * 9000)}`,
      userId,
      description: data.description,
      category: data.category || aiPrediction.category,
      location: data.location,
      coordinates: data.coordinates,
      district: data.district,
      sector: data.sector,
      cell: data.cell,
      village: data.village,
      status: "submitted",
      aiConfidence: aiPrediction.confidence,
      aiCategory: aiPrediction.category,
      assignedAgency: aiPrediction.suggestedAgency,
      submissionMethod: data.submissionMethod || "web",
      pointsAwarded: 50,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("complaints").insertOne(complaint)

    if (userId) {
      await db.collection("users").updateOne(
        { id: userId },
        { $inc: { points: 50 } }
      )
    }

    return NextResponse.json({
      id: complaint.id,
      ...complaint,
      _id: result.insertedId
    })

  } catch (error) {
    console.error("Error creating complaint:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create complaint" },
      { status: 500 }
    )
  }
}

