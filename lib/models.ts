export interface User {
  id: string
  name: string
  email: string
  password?: string // Hashed
  role: "citizen" | "admin" | "agency"
  points: number
  phoneNumber?: string
  location?: string
  createdAt: Date
  updatedAt: Date
}

export interface Complaint {
  id: string
  userId: string
  description: string
  category: string
  location: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  status: "submitted" | "in-progress" | "resolved"
  aiConfidence?: number
  aiCategory?: string
  assignedAgency?: string
  submissionMethod: "web" | "sms" | "ussd" | "voice"
  pointsAwarded: number
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
}

export interface Agency {
  id: string
  name: string
  category: string
  contactEmail: string
  contactPhone: string
  resolvedCount: number
  averageResolutionTime: number
  satisfactionRate: number
  createdAt: Date
  updatedAt: Date
}

export interface Prediction {
  id: string
  category: string
  location: string
  predictedIssue: string
  confidence: number
  predictedDate: Date
  status: "predicted" | "occurred" | "prevented"
  createdAt: Date
  updatedAt: Date
}
