# Frontend API Integration

## Overview

The frontend now fetches properties from the Railway backend API instead of using a static file. This means **all changes made in the admin panel will automatically appear on the website** without needing to rebuild or redeploy the frontend.

## How It Works

1. **PropertiesContext** - A React context that fetches properties from the API on app load
2. **Fallback** - If the API fails, it falls back to the static `properties.js` file
3. **Auto-update** - Properties are fetched fresh from the API every time the app loads

## Configuration

### Environment Variable

Create a `.env` file in the `frontend` folder:

```env
VITE_API_URL=https://ygiholidayhomes-production.up.railway.app
```

**Default**: If not set, it uses `https://ygiholidayhomes-production.up.railway.app`

### For Local Development

If running backend locally:

```env
VITE_API_URL=http://localhost:5000
```

## API Endpoint

The frontend uses the public endpoint:
- `GET /api/properties` - Returns all properties (no authentication required)

## Benefits

✅ **Real-time updates** - Changes in admin panel appear on website immediately  
✅ **No rebuild needed** - Frontend doesn't need to be rebuilt when properties change  
✅ **Single source of truth** - All property data comes from the backend  
✅ **Fallback support** - Works offline with static file if API is unavailable  

## Components Updated

- ✅ `App.jsx` - Uses PropertiesContext
- ✅ `BookApartment.jsx` - Uses context instead of static import
- ✅ `Bestsellers.jsx` - Uses context instead of static import
- ✅ `slugUtils.js` - Updated to work with dynamic properties
- ✅ `PropertiesContext.jsx` - New context provider

## Testing

1. Update a property in the admin panel
2. Refresh the website
3. The updated property should appear immediately

## Troubleshooting

### Properties not updating?
- Check browser console for API errors
- Verify `VITE_API_URL` is set correctly
- Check Railway backend is running and accessible
- Check CORS settings in backend

### API fails?
- Frontend will automatically fall back to static `properties.js` file
- Check browser console for error messages
- Verify Railway backend URL is correct

