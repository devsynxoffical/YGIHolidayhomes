require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { connectMongoDB, getBucket } = require('../config/mongodb');

const PROPERTIES_FILE = path.join(__dirname, '../data/properties.json');

async function updatePropertyImageUrls() {
  try {
    console.log('🔄 Updating property image URLs to use MongoDB...');
    await connectMongoDB();
    const bucket = await getBucket();

    // Read properties
    const data = await fs.readFile(PROPERTIES_FILE, 'utf8');
    const properties = JSON.parse(data);

    let updatedCount = 0;
    let totalImagesUpdated = 0;

    for (const property of properties) {
      if (!property.images || !Array.isArray(property.images)) continue;

      let hasChanges = false;
      const updatedImages = [];

      for (const img of property.images) {
        const imgPath = typeof img === 'string' ? img : (img?.url || img);
        
        // If already a full MongoDB URL, keep it
        if (imgPath && (imgPath.startsWith('http://') || imgPath.startsWith('https://'))) {
          updatedImages.push(imgPath);
          continue;
        }

        // If it's a relative path, try to find it in MongoDB and convert to MongoDB URL
        if (imgPath && imgPath.startsWith('./')) {
          const cleanPath = imgPath.replace(/^\.\//, '').replace(/\\/g, '/');
          
          // Try to find the image in MongoDB
          const files = await bucket.find({ filename: cleanPath }).sort({ uploadDate: -1 }).limit(1).toArray();
          
          if (files.length > 0) {
            // Found in MongoDB - convert to MongoDB URL
            const baseUrl = process.env.BACKEND_URL || 'https://ygiholidayhomes-production.up.railway.app';
            const cleanBaseUrl = baseUrl.replace(/\/$/, '');
            const mongoUrl = `${cleanBaseUrl}/api/images/${files[0]._id}`;
            updatedImages.push(mongoUrl);
            hasChanges = true;
            totalImagesUpdated++;
            console.log(`  ✅ Updated: "${imgPath}" -> MongoDB URL (ID: ${files[0]._id})`);
          } else {
            // Not found - try UUID regex
            const uuidMatch = cleanPath.match(/([a-f0-9-]+\.(jpg|jpeg|png|gif|webp|avif))$/i);
            if (uuidMatch) {
              const uuidFilename = uuidMatch[1];
              const regexFiles = await bucket.find({ 
                filename: { $regex: uuidFilename, $options: 'i' }
              }).sort({ uploadDate: -1 }).limit(1).toArray();
              
              if (regexFiles.length > 0) {
                const baseUrl = process.env.BACKEND_URL || 'https://ygiholidayhomes-production.up.railway.app';
                const cleanBaseUrl = baseUrl.replace(/\/$/, '');
                const mongoUrl = `${cleanBaseUrl}/api/images/${regexFiles[0]._id}`;
                updatedImages.push(mongoUrl);
                hasChanges = true;
                totalImagesUpdated++;
                console.log(`  ✅ Updated (via UUID): "${imgPath}" -> MongoDB URL (ID: ${regexFiles[0]._id})`);
              } else {
                // Keep original if not found
                updatedImages.push(imgPath);
                console.warn(`  ⚠️  Not found in MongoDB: "${imgPath}"`);
              }
            } else {
              // Keep original if can't parse
              updatedImages.push(imgPath);
              console.warn(`  ⚠️  Could not parse UUID from: "${imgPath}"`);
            }
          }
        } else {
          // Keep as is if not a relative path
          updatedImages.push(imgPath);
        }
      }

      if (hasChanges) {
        property.images = updatedImages;
        updatedCount++;
      }
    }

    // Save updated properties
    await fs.writeFile(PROPERTIES_FILE, JSON.stringify(properties, null, 2));

    console.log('\n📊 Update Summary:');
    console.log(`✅ Properties updated: ${updatedCount}`);
    console.log(`✅ Total images converted: ${totalImagesUpdated}`);
    console.log(`\n💾 Updated properties saved to: ${PROPERTIES_FILE}`);

    console.log('\n✅ Update completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  }
}

updatePropertyImageUrls();

