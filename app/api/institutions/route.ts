import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()
    // Find all users with role "institution" and project only name and department
    const institutions = await db.collection("institutions")
      .find({ role: "institution" }, { projection: { name: 1, department: 1, _id: 1 } })
      .toArray()

    return NextResponse.json(institutions)
  } catch (error) {
    console.error("Error fetching institutions:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch institutions" },
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

    // Generate a random password and hash it
    const plainPassword = generateRandomPassword(12)
    const hashedPassword = await hash("Password@1", 12)

    const institution = {
      ...data,
      password: hashedPassword,
      id: `INST${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Send SMS with password
    // const smsRes = await fetch("http://localhost:3000/api/send-sms", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     to: data.phone,
    //     text: `Welcome to IGIREHUB! Your account has been created. Your password is: ${plainPassword}`
    //   })
    // })
    // if (!smsRes.ok) {
    //   const smsErr = await smsRes.text()
    //   console.error("SMS send failed:", smsErr)
    //   return NextResponse.json(
    //     { error: "Failed to send SMS" },
    //     { status: 500 }
    //   )
    // }

    // console.log('sms send ok')

    const resultInstitution = await db.collection("institutions").insertOne(institution)

    const user = {
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
      department: data.department,
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
    console.log(error)
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