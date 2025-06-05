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

    // Prepare JWT payload
    const jwtPayload: any = {
      id: user._id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    }
    // Add department if present
    if (user.department) {
      jwtPayload.department = user.department
    }

    // Create JWT token
    const token = sign(
      jwtPayload,
      JWT_SECRET,
      { expiresIn: "7d" }
    )

    const cookie = cookies()
    cookie.set('userId', user._id.toString())
    cookie.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    // Set department cookie if present
    if (user.department) {
      cookie.set('department', user.department)
    }

    // Don't return the password
    const { password: _, ...userWithoutPassword } = user

    // Add department to response if present
    const responseUser = { ...userWithoutPassword }
    if (user.department) {
      responseUser.department = user.department
    }

    return NextResponse.json({
      user: responseUser,
      token,
      department: user.department || undefined,
    })
  } catch (error) {
    console.error("Error during login:", error)
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    )
  }
}