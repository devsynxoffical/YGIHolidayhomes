# How to Update Property Images on Railway

The local `properties.json` has been updated with the correct image IDs, but Railway is still serving the old data.

## Option 1: Deploy Updated properties.json (Recommended)

1. **Commit the updated file:**
   ```bash
   git add backend/data/properties.json
   git commit -m "Update Waterfront property with correct image IDs"
   git push
   ```

2. **Railway will auto-deploy** and the images should work.

## Option 2: Update via Admin Dashboard

1. Go to your admin dashboard
2. Navigate to Properties → Edit Property (ID: 2)
3. The images section should show the current (old) image URLs
4. Replace them with these new URLs:
   - `https://ygiholidayhomes-production.up.railway.app/api/images/694c74cb08576ef1f7fb7216?category=kitchen`
   - `https://ygiholidayhomes-production.up.railway.app/api/images/694c74ca08576ef1f7fb7212?category=bedroom-1`
   - `https://ygiholidayhomes-production.up.railway.app/api/images/694c74cb08576ef1f7fb7214?category=bedroom-2`
   - `https://ygiholidayhomes-production.up.railway.app/api/images/694c74ca08576ef1f7fb7210?category=balcony`
   - `https://ygiholidayhomes-production.up.railway.app/api/images/694c74cb08576ef1f7fb7218?category=living-room`
5. Save the property

## Option 3: Manual Update via API (if you have admin token)

Use the admin API endpoint:
```
PUT https://ygiholidayhomes-production.up.railway.app/api/admin/properties/2
Authorization: Bearer {your-admin-token}
Content-Type: application/json

{
  "images": [
    "https://ygiholidayhomes-production.up.railway.app/api/images/694c74cb08576ef1f7fb7216?category=kitchen",
    "https://ygiholidayhomes-production.up.railway.app/api/images/694c74ca08576ef1f7fb7212?category=bedroom-1",
    "https://ygiholidayhomes-production.up.railway.app/api/images/694c74cb08576ef1f7fb7214?category=bedroom-2",
    "https://ygiholidayhomes-production.up.railway.app/api/images/694c74ca08576ef1f7fb7210?category=balcony",
    "https://ygiholidayhomes-production.up.railway.app/api/images/694c74cb08576ef1f7fb7218?category=living-room"
  ]
}
```

