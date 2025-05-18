import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { sign } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db()

    const { email, phone, password } = await request.json()

    // Validate input
    if (!password || (!email && !phone)) {
      return NextResponse.json(
        { error: "Email or phone and password are required" },
        { status: 400 }
      )
    }

    // Build query to find user by email or phone
    const query: any = {}
    if (email) {
      query.email = email
    } else if (phone) {
      query.phone = phone
    }

    // Find user by email or phone
    const user = await db.collection("users").findOne(query)

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }


    // Create JWT token
    const token = sign(
      {
        id: user._id, // Changed from user.id to user._id (MongoDB default)
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    )

    const cookie = await cookies();
    
    cookie.set('userId', user._id);
    cookie.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    // Don't return the password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      user: userWithoutPassword,
      token,
    })
  } catch (error) {
    console.error("Error during login:", error)
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    )
  }
}