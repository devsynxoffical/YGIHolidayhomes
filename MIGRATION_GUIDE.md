# Image Migration Guide

This guide will help you migrate all local images to MongoDB and set up image upload in the admin panel.

## Step 1: Run Image Migration

To migrate all existing images from `frontend/public` to MongoDB:

```bash
cd backend
npm run migrate-images
```

This script will:
- ✅ Scan all image files in `frontend/public`
- ✅ Upload each image to MongoDB GridFS
- ✅ Skip images that already exist
- ✅ Create a mapping file at `backend/data/image-mapping.json`
- ✅ Show progress and summary

**Expected Output:**
```
🔄 Starting image migration to MongoDB...
📂 Scanning for image files...
📸 Found XXX image files
✅ Uploaded: image1.jpg
✅ Uploaded: image2.avif
...
📊 Migration Summary:
✅ Successfully uploaded: XXX
❌ Failed: 0
⏭️  Skipped: 0
```

## Step 2: Verify Migration

After migration, check:
1. MongoDB database has the images
2. Frontend can load images from MongoDB
3. Image mapping file is created

## Step 3: Use Admin Panel Image Upload

The admin panel now supports direct image uploads:

1. **Go to Admin Panel** → Properties → Add/Edit Property
2. **In the Images section**, you'll see:
   - **"📤 Upload Images" button** - Click to select and upload images directly to MongoDB
   - **Manual URL input** - Or enter image URLs/paths manually
3. **Upload Process:**
   - Select one or multiple images
   - Images are uploaded to MongoDB automatically
   - Image URLs are added to the property's image array
   - Preview grid shows all uploaded images

## Features

### Image Upload Features:
- ✅ Multiple image selection
- ✅ Direct upload to MongoDB
- ✅ Image preview grid
- ✅ Remove images before saving
- ✅ Automatic URL generation
- ✅ Fallback to local paths if needed

### Migration Features:
- ✅ Automatic scanning of all image files
- ✅ Skips duplicate images
- ✅ Progress tracking
- ✅ Error handling
- ✅ Mapping file generation

## Troubleshooting

### Migration Issues:
- **Connection Error**: Check MongoDB URI in `.env`
- **Permission Error**: Ensure backend has read access to `frontend/public`
- **Large Files**: GridFS handles large files automatically

### Upload Issues:
- **Upload Fails**: Check admin authentication token
- **Images Not Showing**: Verify MongoDB connection
- **CORS Error**: Ensure backend CORS is configured

## Next Steps

After migration:
1. ✅ All images are in MongoDB
2. ✅ Frontend fetches from MongoDB automatically
3. ✅ Admin panel can upload new images
4. ✅ Old local images can be kept as backup

## Notes

- Images are stored with original filenames
- GridFS handles large files efficiently
- Image metadata (property ID, category) is stored
- System gracefully falls back to local images if MongoDB fails

