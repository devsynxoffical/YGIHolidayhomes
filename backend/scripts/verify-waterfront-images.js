require('dotenv').config();
const { connectMongoDB, getBucket } = require('../config/mongodb');
const { ObjectId } = require('mongodb');

const IMAGE_IDS = [
  '694c74cb08576ef1f7fb7216',
  '694c74ca08576ef1f7fb7212',
  '694c74cb08576ef1f7fb7214',
  '694c74ca08576ef1f7fb7210',
  '694c74cb08576ef1f7fb7218'
];

async function verifyImages() {
  try {
    console.log('🔍 Verifying Waterfront property images in MongoDB...\n');
    
    await connectMongoDB();
    const bucket = await getBucket();
    
    const apiBaseUrl = process.env.BACKEND_URL || 'https://ygiholidayhomes-production.up.railway.app';
    
    console.log('Checking image IDs:\n');
    
    for (const imageId of IMAGE_IDS) {
      try {
        const objectId = new ObjectId(imageId);
        const files = await bucket.find({ _id: objectId }).toArray();
        
        if (files.length > 0) {
          const file = files[0];
          const imageUrl = `${apiBaseUrl}/api/images/${imageId}`;
          console.log(`✅ Image ID: ${imageId}`);
          console.log(`   Filename: ${file.filename}`);
          console.log(`   Size: ${file.length} bytes`);
          console.log(`   URL: ${imageUrl}`);
          console.log(`   Category: ${file.metadata?.category || 'N/A'}\n`);
        } else {
          console.log(`❌ Image ID: ${imageId} - NOT FOUND in MongoDB\n`);
        }
      } catch (error) {
        console.log(`❌ Image ID: ${imageId} - Error: ${error.message}\n`);
      }
    }
    
    console.log('✅ Verification complete!');
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

if (require.main === module) {
  verifyImages();
}

module.exports = { verifyImages };

