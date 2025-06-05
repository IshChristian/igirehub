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

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db()
    const data = await req.json()

    // Update by MongoDB _id
    const filter = ObjectId.isValid(params.id)
      ? { _id: new ObjectId(params.id) }
      : { id: params.id }

    const result = await db.collection("complaints").updateOne(
      filter,
      { $set: data }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "No changes made" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update complaint" },
      { status: 500 }
    )
  }
}