import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { cookies } from "next/headers"
import { ObjectId } from "mongodb"

// Define reward types and config
type RewardType = "airtime" | "internet" | "electricity"
const CONVERSION_RATES = {
  airtime: 0.2,
  internet: 0.25,
  electricity: 0.2
}
const MIN_AMOUNT = 100
const MAX_AMOUNT = 10000

export async function POST(request: NextRequest) {
  try {
    // Authentication
    const userId = cookies().get("userId")?.value
    if (!userId) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      )
    }

    // Request validation
    const { type, amount } = await request.json()
    
    if (!type || !CONVERSION_RATES[type as RewardType]) {
      return NextResponse.json(
        { message: "Invalid reward type" },
        { status: 400 }
      )
    }

    if (!amount || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      return NextResponse.json(
        { message: `Amount must be between ${MIN_AMOUNT} and ${MAX_AMOUNT}` },
        { status: 400 }
      )
    }

    // Calculate required coins
    const requiredCoins = Math.ceil(amount * CONVERSION_RATES[type as RewardType])
    
    // Database operations
    const client = await clientPromise
    const db = client.db()

    // Support both string and ObjectId userId
    const user = await db.collection("users").findOne({
      _id: ObjectId.isValid(userId) ? new ObjectId(userId) : userId
    })

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    if (user.coins < requiredCoins) {
      return NextResponse.json(
        { message: "Not enough coins" },
        { status: 400 }
      )
    }

    // Create reward record
    const rewardItem = {
      id: `rwd-${Date.now()}`,
      type,
      amount,
      coins: requiredCoins,
      date: new Date().toISOString(),
      status: "pending"
    }

    // Update user
    await db.collection("users").updateOne(
      { _id: ObjectId.isValid(userId) ? new ObjectId(userId) : userId },
      {
        $inc: { coins: -requiredCoins },
        $push: { rewardHistory: rewardItem },
        $set: { lastUpdated: new Date() }
      }
    )

    return NextResponse.json(
      { 
        success: true,
        message: "Reward processed",
        coinsDeducted: requiredCoins
      },
      { status: 200 }
    )

  } catch (error) {
    console.error("Reward error:", error)
    return NextResponse.json(
      { 
        success: false,
        message: "Something went wrong"
      },
      { status: 500 }
    )
  }
}