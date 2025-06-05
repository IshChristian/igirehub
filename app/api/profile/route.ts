import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { cookies } from "next/headers"
import { ObjectId } from "mongodb"

interface UserProfile {
  id?: string
  name?: string
  email?: string
  phone?: string
  coins?: number
  joinedDate?: string
  lastActivity?: string
  rewardHistory?: Array<any>
}

const ALLOWED_UPDATE_FIELDS = ['name', 'phone', 'email']

export async function GET() {
  try {
    // Get userId from cookie (no await)
    const cookieStore = cookies()
    const userId = cookieStore.get("userId")?.value

    if (!userId) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      )
    }

    const client = await clientPromise
    const db = client.db()
    // Convert userId to ObjectId if needed
    const userObjectId = ObjectId.isValid(userId) ? new ObjectId(userId) : userId

    const user = await db.collection("users").findOne(
      { _id: userObjectId }
    )

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    // Aggregate coins from complaints where userId matches and status is "solved"
    const agg = await db.collection("complaints").aggregate([
      { $match: { userId: userId, status: "solved" } },
      { $group: { _id: null, totalPoints: { $sum: "$pointsAwarded" } } }
    ]).toArray()
    const coins = agg.length > 0 ? agg[0].totalPoints : 0

    const profileData: UserProfile = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      coins, // Use calculated coins
      joinedDate: user.joinedDate,
      lastActivity: user.lastActivity,
      rewardHistory: user.rewardHistory || []
    }

    return NextResponse.json(profileData, { status: 200 })

  } catch (error) {
    console.error("Failed to fetch user profile:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const userId = cookieStore.get("userId")?.value
    if (!userId) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const updates: Partial<UserProfile> = {}

    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { message: "No valid fields to update" },
        { status: 400 }
      )
    }

    updates.lastActivity = new Date().toISOString()

    const client = await clientPromise
    const db = client.db()

    const result = await db.collection("users").findOneAndUpdate(
      { _id: ObjectId.isValid(userId) ? new ObjectId(userId) : userId },
      { $set: updates },
      {
        returnDocument: 'after',
        projection: { password: 0 }
      }
    )

    const updatedUser = result.value

    if (!updatedUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    const profileData: UserProfile = {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      coins: updatedUser.coins,
      joinedDate: updatedUser.joinedDate,
      lastActivity: updatedUser.lastActivity,
      rewardHistory: updatedUser.rewardHistory || []
    }

    return NextResponse.json(profileData, { status: 200 })

  } catch (error) {
    console.error("Failed to update user profile:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}