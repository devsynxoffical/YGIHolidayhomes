# YGI Holiday Homes Admin Panel

Admin panel for managing properties on the YGI Holiday Homes website.

## Features

- 🔐 Secure login authentication
- 📋 List all properties
- ➕ Add new properties
- ✏️ Edit existing properties
- 🗑️ Delete properties
- 📊 Dashboard overview

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (optional):
Create a `.env` file in the root directory:
```
VITE_API_URL=http://localhost:5000
```

3. Make sure the backend server is running on port 5000 (or update the API URL).

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to the admin panel URL (usually `http://localhost:5173`).

## Default Login

- **Password**: `admin123`

⚠️ **Important**: Change the default password in production by setting the `ADMIN_PASSWORD` environment variable in the backend.

## Usage

### Viewing Properties

1. Click on "Properties" in the navigation menu
2. All properties will be displayed in a grid view
3. Each property card shows:
   - Property image
   - Title and location
   - Price and room details
   - Featured/Unavailable badges

### Adding a New Property

1. Click on "+ Add Property" in the navigation
2. Fill in all the required fields (marked with *)
3. Add highlights, images, amenities, etc.
4. Click "Create Property" to save

### Editing a Property

1. Go to the Properties list
2. Click "Edit" on the property card you want to modify
3. Update the fields as needed
4. Click "Update Property" to save changes

### Deleting a Property

1. Go to the Properties list
2. Click "Delete" on the property card
3. Confirm the deletion

## API Endpoints

The admin panel communicates with the backend API:

- `GET /api/admin/properties` - Get all properties
- `GET /api/admin/properties/:id` - Get single property
- `POST /api/admin/properties` - Create new property
- `PUT /api/admin/properties/:id` - Update property
- `DELETE /api/admin/properties/:id` - Delete property
- `POST /api/admin/login` - Admin login

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

## Notes

- Properties are stored in `backend/data/properties.json`
- Make sure to sync properties from the frontend if needed using the sync script
- The admin panel requires the backend server to be running
