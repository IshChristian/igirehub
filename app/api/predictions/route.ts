import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location') || 'Kigali'
    
    const client = await clientPromise
    const db = client.db()

    // Get predictions from database
    const predictions = await db.collection("predictions")
      .find({ location })
      .sort({ probability: -1, createdAt: -1 })
      .limit(10)
      .toArray()

    return NextResponse.json(predictions)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch predictions" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection("predictions").deleteOne({ id: params.id })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Prediction not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete prediction" },
      { status: 500 }
    )
  }
}