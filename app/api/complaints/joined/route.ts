import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()

    const complaints = await db.collection("complaints").aggregate([
      // Convert userId to ObjectId if needed (for string userId)
      {
        $addFields: {
          userIdObj: {
            $cond: [
              { $eq: [ { $type: "$userId" }, "objectId" ] },
              "$userId",
              { $convert: { input: "$userId", to: "objectId", onError: null, onNull: null } }
            ]
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "userIdObj",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          complaint: 1,
          category: 1,
          translatedDescription: 1,
          location: 1,
          coordinates: 1,
          district: 1,
          sector: 1,
          cell: 1,
          aiConfidence: 1,
          aiCategory: 1,
          assignedAgency: 1,
          effects: 1,
          consequences: 1,
          severity: 1,
          suggestedActions: 1,
          language: 1,
          submissionMethod: 1,
          pointsAwarded: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          // Optionally include user info:
          "user.name": 1,
          "user.email": 1,
          "user.phone": 1
        }
      }
    ]).toArray()

    return NextResponse.json(complaints)
  } catch (error) {
    console.error("Error fetching complaints:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch complaints" },
      { status: 500 }
    )
  }
}