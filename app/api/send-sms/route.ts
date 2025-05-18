import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { to, text } = await request.json()
    
    // Replace with your actual PindoTest API credentials
    const PINDOTEST_API_KEY = process.env.PINDOTEST_API_KEY
    const PINDOTEST_SENDER = process.env.PINDOTEST_SENDER_NAME
    
    const response = await fetch('https://api.pindotest.com/v1/sms', {
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
      const error = await response.json()
      throw new Error(error.message || 'Failed to send SMS')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send SMS" },
      { status: 500 }
    )
  }
}