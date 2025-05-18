import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { predictCategory } from "@/lib/ai-utils"

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db()

    const data = await request.json()
    const { sessionId, phoneNumber, text } = data

    // Parse USSD input
    const response = processUSSDRequest(sessionId, phoneNumber, text, db)

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Error processing USSD request:", error)
    return NextResponse.json({ error: "Failed to process USSD request" }, { status: 500 })
  }
}

async function processUSSDRequest(sessionId: string, phoneNumber: string, text: string, db: any): Promise<string> {
  // Store session data in database or use a cache like Redis in production

  // Initial menu
  if (!text) {
    return `CON Welcome to Igire
1. Submit complaint
2. Track complaint
3. View points
4. Redeem rewards`
  }

  // Process menu options
  const textParts = text.split("*")
  const level = textParts.length

  // Submit complaint flow
  if (textParts[0] === "1") {
    if (level === 1) {
      return `CON Select category:
1. Water
2. Sanitation
3. Roads
4. Electricity
5. Other`
    } else if (level === 2) {
      return "CON Enter your location:"
    } else if (level === 3) {
      return "CON Describe your complaint:"
    } else if (level === 4) {
      // Get category from selection
      const categoryMap: Record<string, string> = {
        "1": "Water",
        "2": "Sanitation",
        "3": "Roads",
        "4": "Electricity",
        "5": "Other",
      }

      const category = categoryMap[textParts[1]]
      const location = textParts[2]
      const description = textParts[3]

      // Use AI to predict category and assign agency
      const aiPrediction = predictCategory(description)

      // Generate complaint ID
      const complaintId = `C${Math.floor(1000 + Math.random() * 9000)}`

      // Save complaint to database
      await db.collection("complaints").insertOne({
        id: complaintId,
        phoneNumber,
        description,
        category,
        location,
        status: "submitted",
        aiConfidence: aiPrediction.confidence,
        aiCategory: aiPrediction.category,
        assignedAgency: aiPrediction.suggestedAgency,
        submissionMethod: "ussd",
        pointsAwarded: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // Update user points
      const user = await db.collection("users").findOne({ phoneNumber })

      if (user) {
        await db.collection("users").updateOne({ phoneNumber }, { $inc: { points: 50 } })
      }

      return `END Thank you! Your complaint has been submitted.
ID: ${complaintId}
You earned 50 Igire Points!
We will send updates via SMS.`
    }
  }

  // Track complaint flow
  else if (textParts[0] === "2") {
    if (level === 1) {
      return "CON Enter complaint ID:"
    } else if (level === 2) {
      const complaintId = textParts[1]

      // Find complaint in database
      const complaint = await db.collection("complaints").findOne({ id: complaintId })

      if (!complaint) {
        return "END Complaint not found. Please check the ID and try again."
      }

      return `END Complaint Status:
ID: ${complaint.id}
Status: ${formatStatus(complaint.status)}
Category: ${complaint.category}
Agency: ${complaint.assignedAgency || "Not assigned yet"}
Submitted: ${formatDate(complaint.createdAt)}`
    }
  }

  // View points flow
  else if (textParts[0] === "3") {
    // Find user by phone number
    const user = await db.collection("users").findOne({ phoneNumber })

    if (!user) {
      return "END No account found for this phone number. Please register on our website."
    }

    return `END Your Igire Points:
Points Balance: ${user.points}
50 points = 1000 RWF Airtime
100 points = 2000 RWF Airtime
Dial *677*4# to redeem.`
  }

  // Redeem rewards flow
  else if (textParts[0] === "4") {
    if (level === 1) {
      return `CON Select reward:
1. 1000 RWF Airtime (50 points)
2. 2000 RWF Airtime (100 points)
3. Priority Service (75 points)`
    } else if (level === 2) {
      // Find user by phone number
      const user = await db.collection("users").findOne({ phoneNumber })

      if (!user) {
        return "END No account found for this phone number. Please register on our website."
      }

      const selection = textParts[1]
      let pointsRequired = 0
      let reward = ""

      if (selection === "1") {
        pointsRequired = 50
        reward = "1000 RWF Airtime"
      } else if (selection === "2") {
        pointsRequired = 100
        reward = "2000 RWF Airtime"
      } else if (selection === "3") {
        pointsRequired = 75
        reward = "Priority Service"
      }

      if (user.points < pointsRequired) {
        return `END Insufficient points. You have ${user.points} points, but need ${pointsRequired}.`
      }

      // Update user points
      await db.collection("users").updateOne({ phoneNumber }, { $inc: { points: -pointsRequired } })

      // In a real app, integrate with mobile money or airtime API here

      return `END Reward redeemed successfully!
Reward: ${reward}
Points used: ${pointsRequired}
Remaining balance: ${user.points - pointsRequired} points
Thank you for using Igire!`
    }
  }

  return "END Invalid selection. Please try again."
}

function formatStatus(status: string): string {
  switch (status) {
    case "submitted":
      return "Submitted"
    case "in-progress":
      return "In Progress"
    case "resolved":
      return "Resolved"
    default:
      return status
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
