import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { sign } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Try multiple connection options to resolve SSL issues
const uri = process.env.MONGODB_URI

// More aggressive SSL options to bypass SSL verification issues
// IMPORTANT: These options reduce security and should only be used temporarily
// until you can fix the root cause of the SSL issues
const options = {
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
  directConnection: true,
  retryWrites: false,
  serverSelectionTimeoutMS: 5000,
}

export async function POST(request: Request) {
  let client

  try {
    // Try to parse the connection string and modify it if needed
    let connectionUri = uri

    // If the URI contains SSL parameters, try removing them as we're setting them explicitly
    if (connectionUri.includes("ssl=true")) {
      connectionUri = connectionUri.replace("ssl=true", "")
    }

    // Remove trailing & if present
    connectionUri = connectionUri.replace(/&$/, "")

    // Create a new client for each request
    client = new MongoClient(connectionUri, options)
    await client.connect()
    const db = client.db()

    const { email, phone, password } = await request.json()

    // Validate input
    if (!password || (!email && !phone)) {
      return NextResponse.json({ error: "Email or phone and password are required" }, { status: 400 })
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
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create JWT token
    const token = sign(
      {
        id: user._id,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    )

    const cookie = cookies()

    cookie.set("userId", user._id)
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

    // Provide more detailed error information for debugging
    return NextResponse.json(
      {
        error: "Login failed",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  } finally {
    // Make sure to close the connection when done
    if (client) {
      try {
        await client.close()
      } catch (err) {
        console.error("Error closing MongoDB connection:", err)
      }
    }
  }
}
