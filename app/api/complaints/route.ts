import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { processComplaint } from "@/lib/ai-utils"
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
        translatedDescription: 1,
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
        effects: 1,
        consequences: 1,
        severity: 1,
        suggestedActions: 1,
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
    const { id } = params
    const body = await request.json()

    // Only allow updating status and assignedAgency
    const updateFields: any = {}
    if (body.status) updateFields.status = body.status
    if (body.assignedAgency) updateFields.assignedAgency = body.assignedAgency

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    const result = await db.collection("complaints").updateOne(
      { id },
      { $set: updateFields }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, updated: updateFields })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update complaint" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db()
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value
    const data = await request.json()
    const language = data.language || 'rw' // Default to Kinyarwanda

    // Process complaint with AI
    const processed = await processComplaint(data.description, language)

    const complaint = {
      id: `C${Math.floor(1000 + Math.random() * 9000)}`,
      userId,
      complaint: data.description,
      category: data.category || (processed.category ? processed.category.category : undefined),
      translatedDescription: processed.translatedText,
      location: data.location,
      coordinates: data.coordinates,
      district: data.district,
      sector: data.sector,
      cell: data.cell,
      aiConfidence: processed.category ? processed.category.confidence : undefined,
      aiCategory: processed.category ? processed.category.category : undefined,
      assignedAgency: processed.category ? processed.category.suggestedAgency : undefined,
      aiCategory: processed.category.category,
      assignedAgency: processed.category.suggestedAgency,
      effects: processed.effects,
      consequences: processed.consequences,
      severity: processed.severity,
      suggestedActions: processed.suggestedActions,
      language,
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