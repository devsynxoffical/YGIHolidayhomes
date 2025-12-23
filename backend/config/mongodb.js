const { MongoClient, GridFSBucket } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:OWqtebSVeHvkfzhcgKvXNwSTRGutReLq@centerbeam.proxy.rlwy.net:59981';
const DB_NAME = 'ygi_holidayhomes';
const BUCKET_NAME = 'images';

let client = null;
let db = null;
let bucket = null;

async function connectMongoDB() {
  try {
    if (!client) {
      client = new MongoClient(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      await client.connect();
      console.log('✅ Connected to MongoDB');
      
      db = client.db(DB_NAME);
      bucket = new GridFSBucket(db, { bucketName: BUCKET_NAME });
    }
    return { client, db, bucket };
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

async function getBucket() {
  if (!bucket) {
    await connectMongoDB();
  }
  return bucket;
}

async function getDB() {
  if (!db) {
    await connectMongoDB();
  }
  return db;
}

async function closeMongoDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    bucket = null;
    console.log('MongoDB connection closed');
  }
}

module.exports = {
  connectMongoDB,
  getBucket,
  getDB,
  closeMongoDB,
  DB_NAME,
  BUCKET_NAME
};

