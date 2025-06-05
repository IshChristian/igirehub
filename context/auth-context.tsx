"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type User = {
  id: string
  name: string
  email?: string
  phone?: string
  role: "user" | "admin" | "institution"
  points: number
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (identifier: string, password: string) => Promise<void>
  register: (data: {
    name: string
    email?: string
    phone?: string
    password: string
  }) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          // Verify token is still valid
          const token = localStorage.getItem("token")
          if (token) {
            const response = await fetch("/api/auth/verify", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            
            if (response.ok) {
              setUser(JSON.parse(storedUser))
            } else {
              // Token is invalid, clear storage
              localStorage.removeItem("user")
              localStorage.removeItem("token")
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (identifier: string, password: string): Promise<void> => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: identifier.includes("@") ? identifier : undefined,
          phone: !identifier.includes("@") ? identifier : undefined,
          password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Login failed")
      }

      const { user: userData, token } = await response.json()
      
      // Store user data and token
      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
      localStorage.setItem("token", token)

      // Set cookies for server-side usage
      document.cookie = `userId=${userData._id}; path=/; max-age=${60 * 60 * 24 * 7}` // 1 week
      document.cookie = `sessionToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}` // 1 week
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: {
    name: string
    email?: string
    phone?: string
    password: string
  }): Promise<User> => {
    setLoading(true)
    try {
      // Validate at least one contact method is provided
      if (!data.email && !data.phone) {
        throw new Error("Please provide either email or phone number")
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const contentType = response.headers.get('Content-Type')
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Registration failed")
        } else {
          throw new Error("Server error")
        }
      }

      const { user: userData, token } = await response.json()
      
      // Store user data and token
      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
      localStorage.setItem("token", token)

      // Set cookies for server-side usage
      document.cookie = `userId=${userData.id}; path=/; max-age=${60 * 60 * 24 * 7}` // 1 week
      document.cookie = `sessionToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}` // 1 week

      return userData
    } catch (error: any) {
      console.error("Registration error:", error)
      throw new Error(error.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")

    // Clear all auth-related cookies
    document.cookie = 'sessionToken=; Max-Age=0; path=/;'
    document.cookie = 'userId=; Max-Age=0; path=/;'
    document.cookie = 'userEmail=; Max-Age=0; path=/;'
    document.cookie = 'next-auth.session-token=; Max-Age=0; path=/;'
    document.cookie = 'auth_token=; Max-Age=0; path=/;'
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}