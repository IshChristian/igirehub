import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db()
    
    const complaint = await db.collection("complaints").findOne({ id: params.id })
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

    const result = await db.collection("complaints").updateOne(
      { id: params.id },
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