import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { v4 as uuidv4 } from "uuid"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()

    const users = await db
      .collection("users")
      .find({})
      .project({ password: 0 }) // Don't return passwords
      .toArray()

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db()

    const data = await request.json()

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email: data.email })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = {
      id: uuidv4(),
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || "citizen",
      points: 0,
      phoneNumber: data.phoneNumber,
      location: data.location,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection("users").insertOne(user)

    // Don't return the password
    const { password, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
