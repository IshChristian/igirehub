import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db()

    const { name, email, phone, password } = await request.json()

    // Validate input
    if (!name || !password || (!email && !phone)) {
      return NextResponse.json(
        { error: "Name, email or phone, and password are required" },
        { status: 400 }
      )
    }

    // Check if email or phone already exists
    const existingUser = await db.collection("users").findOne({
      $or: [
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : [])
      ]
    })

    if (existingUser) {
      const conflictField = existingUser.email === email ? "email" : "phone"
      return NextResponse.json(
        { error: `User with this ${conflictField} already exists` },
        { status: 409 }
      )
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create new user
    const newUser = {
      name,
      ...(email && { email }),
      ...(phone && { phone }),
      password: hashedPassword,
      role: "user", // default role
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection("users").insertOne(newUser)

    // Don't return the password
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json(
      { 
        user: { 
          ...userWithoutPassword, 
          _id: result.insertedId 
        },
        message: "Registration successful" 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error during registration:", error)
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    )
  }
}