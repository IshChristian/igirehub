import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"
const options = {
  // SSL/TLS Configuration
  tls: true,
  tlsAllowInvalidCertificates: process.env.NODE_ENV !== 'production', // Only allow invalid certs in development
  tlsInsecure: process.env.NODE_ENV !== 'production', // Only in development
  
  // Connection Pool Settings
  maxPoolSize: 10,
  minPoolSize: 2,
  
  // Timeout Settings
  connectTimeoutMS: 5000,
  socketTimeoutMS: 30000,
  
  // Server Selection Timeout
  serverSelectionTimeoutMS: 5000,
  
  // Retry Settings
  retryWrites: true,
  retryReads: true,
  
  // Heartbeat Frequency
  heartbeatFrequencyMS: 10000
}

// Create a new MongoClient instance
const client = new MongoClient(uri, options)

// Create a reusable promise for the connection
let clientPromise: Promise<MongoClient>

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local')
}

// Initialize the connection promise
clientPromise = (async () => {
  try {
    console.log('Connecting to MongoDB...')
    const connectedClient = await client.connect()
    
    // Verify connection
    await connectedClient.db().admin().ping()
    console.log('Successfully connected to MongoDB')
    
    return connectedClient
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    
    // Close any existing connection
    await client.close().catch(() => {})
    throw error
  }
})()

// Export the promise
export default clientPromise