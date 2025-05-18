import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";

// Basic connection options that work in most cases
const options = {
  // Connection pool settings
  maxPoolSize: 10,
  minPoolSize: 2,
  
  // Timeout settings
  connectTimeoutMS: 5000,
  socketTimeoutMS: 30000,
  
  // Server selection timeout
  serverSelectionTimeoutMS: 5000,
  
  // Retry settings
  retryWrites: true,
  retryReads: true
};

// For MongoDB Atlas (cloud) connections
if (uri.includes('mongodb+srv://')) {
  options.tls = true;
  // For development/testing only - remove in production
  options.tlsAllowInvalidCertificates = true;
}

let client;
let clientPromise: Promise<MongoClient>;

// Global connection promise for reuse
if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export default clientPromise;