import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  // Connection settings
  serverSelectionTimeoutMS: 5000, // Reduce from 30s to 5s
  socketTimeoutMS: 30000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,
  
  // TLS/SSL configuration for Atlas
  tls: true,
  tlsAllowInvalidCertificates: false, // Set to true only for testing
  
  // Connection pool settings
  maxPoolSize: 50,
  minPoolSize: 10,
  maxIdleTimeMS: 10000
};

let client;
let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect()
    .then(connectedClient => {
      console.log('MongoDB connected successfully');
      return connectedClient;
    })
    .catch(err => {
      console.error('MongoDB connection error:', err);
      throw err;
    });
}
clientPromise = global._mongoClientPromise;

export default clientPromise;