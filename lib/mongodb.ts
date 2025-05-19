// lib/mongodb.ts
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI environment variable not set');
}

const options = {
  // Connection settings
  serverSelectionTimeoutMS: 10000, // Increased from 5000ms
  socketTimeoutMS: 30000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,
  
  // TLS/SSL configuration
  tls: true,
  tlsAllowInvalidCertificates: false, // Keep false for production
  
  // Connection pool settings
  maxPoolSize: 50,
  minPoolSize: 5,
  maxIdleTimeMS: 30000
};

let client;
let clientPromise: Promise<MongoClient>;

async function connectWithRetry() {
  try {
    client = new MongoClient(uri, options);
    await client.connect();
    console.log('Successfully connected to MongoDB');
    return client;
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    await client?.close();
    throw error;
  }
}

if (!global._mongoClientPromise) {
  global._mongoClientPromise = connectWithRetry();
}
clientPromise = global._mongoClientPromise;

export default clientPromise;