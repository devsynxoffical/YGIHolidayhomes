require('dotenv').config();
const { connectMongoDB, getBucket } = require('../config/mongodb');

async function testImageLookup() {
  try {
    console.log('🔍 Testing image lookup in MongoDB...');
    await connectMongoDB();
    const bucket = await getBucket();

    // Test with a known image path from properties.json
    const testPaths = [
      'Marina residency tower 2/Living room/85a505d4-a5e9-4622-9ef3-ad8db3584b31.avif',
      './Marina residency tower 2/Living room/85a505d4-a5e9-4622-9ef3-ad8db3584b31.avif',
      'Marina residency tower 2\\Living room\\85a505d4-a5e9-4622-9ef3-ad8db3584b31.avif',
      '85a505d4-a5e9-4622-9ef3-ad8db3584b31.avif'
    ];

    console.log('\n📋 Testing filename variations:');
    for (const testPath of testPaths) {
      const cleanPath = testPath.replace(/^\.\//, '').replace(/\\/g, '/');
      console.log(`\n  Testing: "${testPath}"`);
      console.log(`  Cleaned: "${cleanPath}"`);
      
      const files = await bucket.find({ filename: cleanPath }).toArray();
      if (files.length > 0) {
        console.log(`  ✅ FOUND: ${files[0].filename} (ID: ${files[0]._id})`);
      } else {
        console.log(`  ❌ NOT FOUND`);
        
        // Try UUID regex
        const uuidMatch = cleanPath.match(/([a-f0-9-]+\.(jpg|jpeg|png|gif|webp|avif))$/i);
        if (uuidMatch) {
          const uuidFilename = uuidMatch[1];
          console.log(`  🔍 Trying UUID regex: "${uuidFilename}"`);
          const regexFiles = await bucket.find({ 
            filename: { $regex: uuidFilename, $options: 'i' }
          }).toArray();
          if (regexFiles.length > 0) {
            console.log(`  ✅ FOUND via regex: ${regexFiles[0].filename} (ID: ${regexFiles[0]._id})`);
          } else {
            console.log(`  ❌ NOT FOUND via regex`);
          }
        }
      }
    }

    // List some files to see what's actually in MongoDB
    console.log('\n📦 Sample files in MongoDB:');
    const sampleFiles = await bucket.find({}).limit(5).toArray();
    sampleFiles.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.filename} (ID: ${file._id})`);
    });

    console.log('\n✅ Test completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testImageLookup();

