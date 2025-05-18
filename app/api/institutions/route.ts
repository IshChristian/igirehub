import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { hash } from "bcryptjs"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()
    
    const institutions = await db.collection("institutions")
      .find({})
      .project({
        name: 1,
        department: 1,
        category: 1  // Include as fallback
      })
      .sort({ createdAt: -1 })
      .toArray()

    // Transform to ensure consistent format
    const formattedInstitutions = institutions.map(inst => ({
      name: inst.name,
      department: inst.department || inst.category // Use department if available, fallback to category
    }))

    return NextResponse.json(formattedInstitutions)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch institutions" },
      { status: 500 }
    )
  }
}
export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db()
    const data = await request.json()

    // Check if email already exists
    const existing = await db.collection("institutions").findOne({ email: data.email })
    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      )
    }

    // Hash password if provided
    if (data.password) {
      data.password = await hash(data.password, 12)
    }

    const institution = {
      ...data,
      id: `INST${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const resultInstitution = await db.collection("institutions").insertOne(institution)

    const user = {
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: data.role || "institution",
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const resultUser = await db.collection("users").insertOne(user)

    return NextResponse.json({
      institutionId: institution.id,
      userId: resultUser.insertedId,
      ...institution,
      _id: resultInstitution.insertedId
    })

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create institution and user" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db()
    const data = await request.json()

    // Hash password if provided
    if (data.password) {
      data.password = await hash(data.password, 12)
    }

    const result = await db.collection("institutions").updateOne(
      { id: params.id },
      { $set: { ...data, updatedAt: new Date() } }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Institution not found or not modified" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update institution" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection("institutions").deleteOne({ id: params.id })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Institution not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete institution" },
      { status: 500 }
    )
  }
}