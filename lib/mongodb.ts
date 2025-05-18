import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"
const options = {
  // Add any additional connection options here
  maxPoolSize: 10, // Default pool size
  connectTimeoutMS: 5000, // 5 seconds connection timeout
  socketTimeoutMS: 30000, // 30 seconds socket timeout
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
    console.log('Successfully connected to MongoDB')
    return connectedClient
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    throw error // Re-throw to handle in calling code
  }
})()

// Export the promise
export default clientPromise