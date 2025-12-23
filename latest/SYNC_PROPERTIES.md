# How to Sync Properties to Admin Panel

## Problem
If your admin panel shows "No properties found", it means the `backend/data/properties.json` file is empty or doesn't exist.

## Solution 1: Sync from Local Machine (Recommended)

1. **On your local machine**, navigate to the backend folder:
   ```bash
   cd YGIholidayhomes/backend
   ```

2. **Run the sync script**:
   ```bash
   node sync-properties.js
   ```

3. **Commit and push the properties.json file**:
   ```bash
   git add data/properties.json
   git commit -m "Add properties.json with initial properties"
   git push
   ```

4. **Redeploy on Railway** (or wait for auto-deploy if enabled)

## Solution 2: Add Properties Manually

1. Log into the admin panel
2. Click "+ Add Property" 
3. Fill in all the property details
4. Click "Create Property"
5. Repeat for each property

## Solution 3: Use API to Sync (Advanced)

If you have access to the frontend properties data, you can use the sync endpoint:

```javascript
// In browser console on admin panel (after login)
const properties = [/* your properties array */];

fetch('https://ygiholidayhomes-production.up.railway.app/api/admin/sync-properties', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
  },
  body: JSON.stringify({ properties })
})
.then(res => res.json())
.then(data => console.log('Sync result:', data));
```

## Solution 4: Copy from Frontend (If you have access)

If you can access the frontend `properties.js` file:

1. Copy the properties array
2. Convert it to JSON format
3. Use Solution 3 to sync via API

## Verify Properties Are Loaded

After syncing, refresh the admin panel. You should see all your properties listed.

