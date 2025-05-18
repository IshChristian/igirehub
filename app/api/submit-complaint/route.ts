import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import clientPromise from "@/lib/mongodb"
import { transcribeAudio } from "@/lib/audio-processing"
import { cookies } from "next/headers"


export async function POST(request: Request) {
  try {
    // Properly await cookies() call
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value

    const formData = await request.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      )
    }

    // Process audio
    const buffer = Buffer.from(await audioFile.arrayBuffer())
    const { text, language } = await transcribeAudio(buffer)

    if (!text) {
      throw new Error("Transcription returned empty text")
    }

    // Save to database
    const client = await clientPromise
    const db = client.db()
    const complaintId = uuidv4()
    const fileName = `${complaintId}.webm`

    await db.collection("complaints").insertOne({
      id: complaintId,
      userId: userId, // Use the authenticated user's ID
      audioUrl: `/complaints/${fileName}`,
      transcription: text, // Ensure this gets populated
      language,
      status: "submitted",
      pointsAwarded: 50,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Save audio file
    const audioDir = path.join(process.cwd(), "public", "complaints")
    await writeFile(path.join(audioDir, fileName), buffer)

    return NextResponse.json({
      success: true,
      complaintId,
      message: "Complaint submitted successfully"
    })

  } catch (error) {
    console.error("Error submitting complaint:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process complaint" },
      { status: 500 }
    )
  }
}