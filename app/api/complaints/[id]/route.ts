import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db()

    // Try to find by both custom id and MongoDB _id
    let complaint = await db.collection("complaints").findOne({ id: params.id })
    if (!complaint && ObjectId.isValid(params.id)) {
      complaint = await db.collection("complaints").findOne({ _id: new ObjectId(params.id) })
    }
    if (!complaint) return NextResponse.json({ error: "Complaint not found" }, { status: 404 })

    return NextResponse.json(complaint)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch complaint" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, context: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db()
    const { id } = await context.params
    const body = await request.json()

    // Only allow updating status and assignedAgency
    const updateFields: any = {}
    if (body.status) updateFields.status = body.status
    if (body.assignedAgency) updateFields.assignedAgency = body.assignedAgency

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    // Try to update by custom id first
    let result = await db.collection("complaints").updateOne(
      { id },
      { $set: updateFields }
    )

    // If not found and id is a valid ObjectId, try by _id
    if (result.matchedCount === 0 && ObjectId.isValid(id)) {
      result = await db.collection("complaints").updateOne(
        { _id: new ObjectId(id) },
        { $set: updateFields }
      )
    }

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