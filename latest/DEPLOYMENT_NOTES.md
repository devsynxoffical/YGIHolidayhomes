# Admin Panel Deployment Notes

## How Property Updates Work

### The Problem
When you update a property in the admin panel, it updates `backend/data/properties.json`, but the website uses `frontend/src/data/properties.js` (a static file).

### The Solution
The admin panel now **automatically syncs** changes to the frontend file after every create/update/delete operation.

## How It Works

1. **You update a property** in the admin panel
2. **Backend updates** `backend/data/properties.json`
3. **Auto-sync runs** and updates `frontend/src/data/properties.js`
4. **You commit and push** the updated `frontend/src/data/properties.js` file
5. **Frontend redeploys** with the new data
6. **Website shows updated properties**

## Manual Sync

If auto-sync fails or you want to manually sync:

1. Click the **"🔄 Sync to Website"** button in the Properties list
2. Or run locally: `cd backend && node sync-to-frontend.js`

## For Railway Deployment

### Option 1: Auto-Sync (Recommended)
- Auto-sync happens automatically on create/update/delete
- After making changes, commit and push the updated `frontend/src/data/properties.js` file
- Railway will auto-deploy the frontend with new data

### Option 2: Manual Sync
1. Make changes in admin panel
2. Click "🔄 Sync to Website" button
3. Commit the updated `frontend/src/data/properties.js` file
4. Push to GitHub
5. Railway auto-deploys

## Important Notes

⚠️ **Changes won't appear on the live website until:**
- The `frontend/src/data/properties.js` file is updated (auto-sync does this)
- The file is committed and pushed to GitHub
- The frontend is redeployed on Railway

✅ **To see changes immediately:**
1. Update property in admin panel
2. Wait for auto-sync (or click sync button)
3. Commit: `git add frontend/src/data/properties.js`
4. Commit: `git commit -m "Update properties"`
5. Push: `git push`
6. Railway will auto-deploy

## Troubleshooting

### Properties not updating on website?
1. Check if `frontend/src/data/properties.js` was updated
2. Check if the file was committed and pushed
3. Check Railway deployment logs
4. Try manual sync button

### Sync button not working?
- Check backend logs for errors
- Verify backend has access to frontend folder
- On Railway, sync might need to be done locally then committed

## API Endpoints

- `GET /api/properties` - Public endpoint for frontend (no auth)
- `GET /api/admin/properties` - Admin endpoint (auth required)
- `POST /api/admin/sync-to-frontend` - Manual sync endpoint

