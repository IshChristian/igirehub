import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"
const options = {
  // SSL/TLS Configuration (choose one approach below)
  
  // APPROACH 1: For development/testing (less secure)
  tls: true,
  tlsAllowInvalidCertificates: process.env.NODE_ENV !== 'production',
  
  // OR APPROACH 2: For production (more secure)
  // tls: true,
  // tlsCAFile: process.env.MONGODB_CA_FILE_PATH,
  // tlsCertificateKeyFile: process.env.MONGODB_CERT_KEY_PATH,
  
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

let clientPromise: Promise<MongoClient>

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local')
}

clientPromise = (async () => {
  try {
    console.log('Connecting to MongoDB...')
    const connectedClient = await client.connect()
    await connectedClient.db().admin().ping()
    console.log('Successfully connected to MongoDB')
    return connectedClient
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    await client.close().catch(() => {})
    throw error
  }
})()

export default clientPromise