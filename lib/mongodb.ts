import { MongoClient, type MongoClientOptions } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to environment variables")
}

const uri = process.env.MONGODB_URI
const options: MongoClientOptions = {
  ssl: true,
  tls: true,
  // Uncomment these options only if you continue to have SSL issues
  // tlsInsecure: process.env.NODE_ENV !== "production",
  // tlsAllowInvalidCertificates: process.env.NODE_ENV !== "production",
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

// In development, use a global variable to preserve the value across hot reloads
if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production, create a new client
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise
