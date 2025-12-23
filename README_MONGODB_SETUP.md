# MongoDB Image Storage Setup

This guide explains how to set up MongoDB for storing and serving images.

## Prerequisites

1. MongoDB connection string (already provided)
2. Node.js packages installed

## Installation

1. Install required packages:
```bash
cd backend
npm install
```

## Configuration

Add MongoDB URI to your `.env` file:
```env
MONGODB_URI=mongodb://mongo:OWqtebSVeHvkfzhcgKvXNwSTRGutReLq@centerbeam.proxy.rlwy.net:59981
```

## Migration Steps

### Step 1: Upload Existing Images to MongoDB

Run the migration script to upload all existing images from `frontend/public` to MongoDB:

```bash
cd backend
npm run migrate-images
```

This script will:
- Scan all image files in `frontend/public`
- Upload each image to MongoDB GridFS
- Create a mapping file at `backend/data/image-mapping.json`
- Skip images that already exist

### Step 2: Verify Migration

Check the migration output for:
- Number of images successfully uploaded
- Any errors or failures
- The image mapping file location

### Step 3: Update Frontend

The frontend has been updated to automatically fetch images from MongoDB. The `imageUtils.js` utility handles:
- Converting local paths to MongoDB URLs
- Fallback to local paths if MongoDB fails
- Error handling for missing images

## API Endpoints

### Public Endpoints (No Auth Required)

- `GET /api/images/:imageId` - Get image by MongoDB ID
- `GET /api/images/filename/:filename` - Get image by filename

### Admin Endpoints (Auth Required)

- `POST /api/images/upload` - Upload new image
- `GET /api/admin/images` - List all images
- `DELETE /api/admin/images/:imageId` - Delete image

## How It Works

1. **Image Storage**: Images are stored in MongoDB using GridFS, which is designed for large files
2. **Image Retrieval**: Frontend requests images via API endpoints
3. **Fallback**: If MongoDB image fails to load, frontend falls back to local path
4. **Caching**: Images are cached for 1 year via HTTP headers

## Testing

1. Start the backend server:
```bash
cd backend
npm start
```

2. Test image retrieval:
```bash
curl http://localhost:5000/api/images/filename/Marina%20residency%20tower%202/Living%20room/image.avif
```

3. Check frontend - images should load from MongoDB automatically

## Troubleshooting

- **Connection Issues**: Verify MongoDB URI in `.env`
- **Missing Images**: Run migration script again
- **404 Errors**: Check image filenames match exactly (case-sensitive)
- **CORS Issues**: Ensure backend CORS is configured correctly

## Notes

- Images are stored with their original filenames
- GridFS automatically handles large files
- Image metadata (property ID, category) is stored for organization
- The system gracefully falls back to local images if MongoDB is unavailable

