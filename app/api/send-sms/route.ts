import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { to, text } = await request.json()
    const PINDOTEST_API_KEY = process.env.PINDOTEST_API_KEY
    const PINDOTEST_SENDER = process.env.PINDOTEST_SENDER_NAME

    // Debug logs (remove in production)
    console.log("to:", to, "text:", text)
    console.log("PINDOTEST_API_KEY set:", !!PINDOTEST_API_KEY)
    console.log("PINDOTEST_SENDER:", PINDOTEST_SENDER)

    const response = await fetch('https://api.pindo.io/v1/sms/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PINDOTEST_API_KEY}`
      },
      body: JSON.stringify({
        to,
        text,
        sender: PINDOTEST_SENDER
      })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      console.error("PindoTest error:", error)
      throw new Error(error.message || 'Failed to send SMS')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Send SMS error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send SMS" },
      { status: 500 }
    )
  }
}