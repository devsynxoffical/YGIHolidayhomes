require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { connectMongoDB, getBucket } = require('../config/mongodb');
const { ObjectId } = require('mongodb');

const PUBLIC_DIR = path.join(__dirname, '../../frontend/public');

async function uploadImageToMongoDB(filePath, relativePath, bucket) {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const filename = relativePath.replace(/^\.\//, '').replace(/\\/g, '/');
    
    // Check if image already exists
    const existingFiles = await bucket.find({ filename }).toArray();
    if (existingFiles.length > 0) {
      console.log(`⏭️  Skipping ${filename} (already exists)`);
      return existingFiles[0]._id.toString();
    }

    const uploadStream = bucket.openUploadStream(filename, {
      metadata: {
        originalPath: relativePath,
        uploadedAt: new Date().toISOString(),
        migrated: true
      }
    });

    return new Promise((resolve, reject) => {
      uploadStream.end(fileBuffer);
      
      uploadStream.on('finish', () => {
        console.log(`✅ Uploaded: ${filename}`);
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

async function getAllImageFiles(dir, baseDir = dir, fileList = []) {
  const files = await fs.readdir(dir, { withFileTypes: true });

  for (const file of files) {
    const filePath = path.join(dir, file.name);
    const relativePath = path.relative(baseDir, filePath).replace(/\\/g, '/');

    if (file.isDirectory()) {
      await getAllImageFiles(filePath, baseDir, fileList);
    } else if (/\.(jpg|jpeg|png|gif|webp|avif)$/i.test(file.name)) {
      fileList.push({
        fullPath: filePath,
        relativePath: `./${relativePath}`
      });
    }
  }

  return fileList;
}

async function migrateImages() {
  try {
    console.log('🔄 Starting image migration to MongoDB...');
    await connectMongoDB();
    const bucket = await getBucket();

    // Get all image files
    console.log('📂 Scanning for image files...');
    const imageFiles = await getAllImageFiles(PUBLIC_DIR);
    console.log(`📸 Found ${imageFiles.length} image files`);

    // Upload images
    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      imageMap: {}
    };

    for (let i = 0; i < imageFiles.length; i++) {
      const { fullPath, relativePath } = imageFiles[i];
      try {
        const imageId = await uploadImageToMongoDB(fullPath, relativePath, bucket);
        results.imageMap[relativePath] = imageId;
        results.success++;
      } catch (error) {
        results.failed++;
        console.error(`Failed to upload ${relativePath}:`, error.message);
      }

      // Progress indicator
      if ((i + 1) % 10 === 0) {
        console.log(`Progress: ${i + 1}/${imageFiles.length} images processed`);
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successfully uploaded: ${results.success}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`⏭️  Skipped: ${results.skipped}`);

    // Save mapping file for reference
    const mappingPath = path.join(__dirname, '../data/image-mapping.json');
    await fs.mkdir(path.dirname(mappingPath), { recursive: true });
    await fs.writeFile(mappingPath, JSON.stringify(results.imageMap, null, 2));
    console.log(`\n💾 Image mapping saved to: ${mappingPath}`);

    console.log('\n✅ Migration completed!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run migration
if (require.main === module) {
  migrateImages();
}

module.exports = { migrateImages };

