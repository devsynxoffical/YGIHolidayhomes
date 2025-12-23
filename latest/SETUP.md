# Admin Panel Setup Guide

## Quick Start

1. **Initialize Properties Database**
   ```bash
   cd ../backend
   node sync-properties.js
   ```
   This will create `backend/data/properties.json` from the existing frontend properties.

2. **Start Backend Server**
   ```bash
   cd backend
   npm install  # if not already done
   npm start
   ```
   The backend should run on `http://localhost:5000`

3. **Start Admin Panel**
   ```bash
   cd latest
   npm install  # if not already done
   npm run dev
   ```
   The admin panel will open at `http://localhost:5173` (or the port Vite assigns)

4. **Login**
   - Default password: `admin123`
   - Change this in production by setting `ADMIN_PASSWORD` environment variable in backend

## Environment Variables

### Backend (.env file in backend folder)
```
ADMIN_PASSWORD=your_secure_password_here
STRIPE_SECRET_KEY=your_stripe_key
FRONTEND_URL=http://localhost:5173
PORT=5000
```

### Frontend (.env file in latest folder)
```
VITE_API_URL=http://localhost:5000
```

## Features

✅ **Property Management**
- List all properties with images and details
- Add new properties with full form
- Edit existing properties
- Delete properties with confirmation

✅ **Authentication**
- Secure login system
- Token-based authentication
- Session persistence

✅ **User-Friendly Interface**
- Modern, responsive design
- Easy-to-use forms
- Real-time validation
- Error handling

## API Endpoints

All endpoints require authentication via Bearer token:

- `GET /api/admin/properties` - List all properties
- `GET /api/admin/properties/:id` - Get single property
- `POST /api/admin/properties` - Create property
- `PUT /api/admin/properties/:id` - Update property
- `DELETE /api/admin/properties/:id` - Delete property
- `POST /api/admin/login` - Login (no auth required)

## File Structure

```
latest/
├── src/
│   ├── App.jsx              # Main app component
│   ├── components/
│   │   ├── Login.jsx        # Login component
│   │   ├── Dashboard.jsx    # Navigation dashboard
│   │   ├── PropertyList.jsx # Property listing
│   │   └── PropertyForm.jsx # Add/Edit form
│   └── ...
└── ...

backend/
├── server.js                # Express server with admin API
├── data/
│   └── properties.json     # Properties database (created by sync script)
└── sync-properties.js      # Sync script
```

## Troubleshooting

### Properties not showing?
- Make sure you ran `sync-properties.js` to create the JSON file
- Check that `backend/data/properties.json` exists
- Verify backend server is running

### Can't connect to API?
- Check that backend is running on port 5000
- Verify `VITE_API_URL` in frontend `.env` matches backend URL
- Check CORS settings in backend `server.js`

### Login not working?
- Default password is `admin123`
- Check backend console for errors
- Verify `ADMIN_PASSWORD` environment variable if changed

## Production Deployment

1. Set strong `ADMIN_PASSWORD` in backend environment
2. Update `VITE_API_URL` to production backend URL
3. Build admin panel: `npm run build`
4. Deploy `dist` folder to your hosting
5. Ensure backend CORS allows your admin panel domain

