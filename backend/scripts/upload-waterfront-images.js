require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { connectMongoDB, getBucket } = require('../config/mongodb');
const { ObjectId } = require('mongodb');

const PROPERTIES_FILE = path.join(__dirname, '../data/properties.json');
const PUBLIC_DIR = path.join(__dirname, '../../frontend/public');

// Images for Waterfront 2BHK property (ID: 2)
const WATERFRONT_IMAGES = [
  { path: 'princess-tower-waterfront/kitchen/01695d3d-0834-4278-8fb7-4e894ba2f90c.avif', category: 'kitchen' },
  { path: 'princess-tower-waterfront/br1/188031da-df38-49ab-ac71-ccdd65a7c1e4.jpeg', category: 'bedroom-1' },
  { path: 'princess-tower-waterfront/br2/027f21fd-508e-4174-a894-fe6eb0a9b03e.avif', category: 'bedroom-2' },
  { path: 'princess-tower-waterfront/balcony/0122b155-7516-46f9-b4d0-d86d930260e0.avif', category: 'balcony' },
  { path: 'princess-tower-waterfront/living-room/12996379-3a7c-46ce-bb22-678686ede8f9.jpeg', category: 'living-room' }
];

async function uploadImageToMongoDB(filePath, relativePath, category, propertyId, bucket) {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const filename = relativePath.replace(/^\.\//, '').replace(/\\/g, '/');
    
    // Check if image already exists
    const existingFiles = await bucket.find({ filename }).toArray();
    if (existingFiles.length > 0) {
      console.log(`⏭️  Skipping ${filename} (already exists with ID: ${existingFiles[0]._id})`);
      return existingFiles[0]._id.toString();
    }

    const uploadStream = bucket.openUploadStream(filename, {
      metadata: {
        propertyId: propertyId.toString(),
        category: category,
        originalPath: relativePath,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'script'
      }
    });

    return new Promise((resolve, reject) => {
      uploadStream.end(fileBuffer);
      
      uploadStream.on('finish', () => {
        console.log(`✅ Uploaded: ${filename} (ID: ${uploadStream.id})`);
        resolve(uploadStream.id.toString());
      });

      uploadStream.on('error', (error) => {
        console.error(`❌ Error uploading ${filename}:`, error);
        reject(error);
      });
    });
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    throw error;
  }
}

async function updatePropertyImages(propertyId, imageIds, apiBaseUrl) {
  try {
    const data = await fs.readFile(PROPERTIES_FILE, 'utf8');
    const properties = JSON.parse(data);

    const propertyIndex = properties.findIndex(p => p.id === propertyId);
    if (propertyIndex === -1) {
      throw new Error(`Property with ID ${propertyId} not found`);
    }

    // Create image URLs with category query parameters
    const imageUrls = imageIds.map((imageId, index) => {
      const category = WATERFRONT_IMAGES[index].category;
      return `${apiBaseUrl}/api/images/${imageId}?category=${category}`;
    });

    properties[propertyIndex].images = imageUrls;
    properties[propertyIndex].updatedAt = new Date().toISOString();

    await fs.writeFile(PROPERTIES_FILE, JSON.stringify(properties, null, 2));
    console.log(`✅ Updated property ${propertyId} with ${imageUrls.length} images`);
    
    return properties[propertyIndex];
  } catch (error) {
    console.error('❌ Error updating property:', error);
    throw error;
  }
}

async function uploadWaterfrontImages() {
  try {
    console.log('🔄 Starting upload of Waterfront 2BHK images to MongoDB...\n');
    
    // Connect to MongoDB
    await connectMongoDB();
    const bucket = await getBucket();
    
    const propertyId = 2; // Waterfront 2BHK property ID
    const apiBaseUrl = process.env.BACKEND_URL || 'https://ygiholidayhomes-production.up.railway.app';
    
    const uploadedImageIds = [];
    
    // Upload each image
    console.log('📤 Uploading images...\n');
    for (const imageInfo of WATERFRONT_IMAGES) {
      const fullPath = path.join(PUBLIC_DIR, imageInfo.path);
      const relativePath = `./${imageInfo.path}`;
      
      // Check if file exists
      try {
        await fs.access(fullPath);
      } catch (error) {
        console.error(`❌ Image file not found: ${fullPath}`);
        continue;
      }
      
      try {
        const imageId = await uploadImageToMongoDB(
          fullPath,
          relativePath,
          imageInfo.category,
          propertyId,
          bucket
        );
        uploadedImageIds.push(imageId);
      } catch (error) {
        console.error(`❌ Failed to upload ${imageInfo.path}:`, error.message);
      }
    }
    
    if (uploadedImageIds.length === 0) {
      console.log('\n❌ No images were uploaded. Please check the file paths.');
      process.exit(1);
    }
    
    console.log(`\n✅ Successfully uploaded ${uploadedImageIds.length} images`);
    console.log('📝 Image IDs:', uploadedImageIds);
    
    // Update property record
    console.log('\n🔄 Updating property record...');
    await updatePropertyImages(propertyId, uploadedImageIds, apiBaseUrl);
    
    console.log('\n✅ All done! The property images have been uploaded and the property record has been updated.');
    console.log('\n📋 Summary:');
    console.log(`   - Uploaded: ${uploadedImageIds.length} images`);
    console.log(`   - Property ID: ${propertyId}`);
    console.log(`   - Image URLs will be: ${apiBaseUrl}/api/images/{imageId}?category={category}`);
    
  } catch (error) {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run upload
if (require.main === module) {
  uploadWaterfrontImages();
}

module.exports = { uploadWaterfrontImages };

