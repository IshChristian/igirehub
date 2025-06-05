import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const userId = cookieStore.get("userId")?.value

    if (!userId) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      )
    }

    const { currentPassword, newPassword } = await request.json()

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { message: "New password must be at least 8 characters long" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()
    // Support both ObjectId and string userId
    const user = await db.collection("users").findOne({
      _id: ObjectId.isValid(userId) ? new ObjectId(userId) : userId
    })

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password)

    if (!isMatch) {
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 400 }
      )
    }

    const hashed = await bcrypt.hash(newPassword, 10)
    await db.collection("users").updateOne(
      { _id: ObjectId.isValid(userId) ? new ObjectId(userId) : userId },
      { $set: { password: hashed } }
    )

    return NextResponse.json(
      { message: "Password changed successfully" },
      { status: 200 }
    )

  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}