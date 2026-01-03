# Bookings and Revenue API Documentation

## Overview
This document describes the backend API endpoints for managing bookings and revenue data in the YGI Holiday Homes admin panel.

## Data Storage
- **Bookings**: Stored in `backend/data/bookings.json`
- **Properties**: Stored in `backend/data/properties.json`
- **Stripe Integration**: Bookings are also tracked via Stripe Payment Intents

## API Endpoints

### 1. Statistics Endpoint
**GET** `/api/admin/statistics`

Returns dashboard statistics including:
- Total Properties
- Available Properties
- Total Bookings
- Current Bookings (last 30 days)
- Total Revenue
- Monthly Revenue

**Authentication**: Required (Bearer token)

**Response**:
```json
{
  "success": true,
  "statistics": {
    "totalProperties": 7,
    "availableProperties": 7,
    "totalBookings": 82,
    "currentBookings": 10,
    "totalRevenue": 99754.43,
    "monthlyRevenue": 8454.43
  }
}
```

### 2. Get All Bookings
**GET** `/api/admin/bookings?filter={filter}`

Returns list of all bookings with optional filtering.

**Query Parameters**:
- `filter` (optional): `all`, `current`, `confirmed`, `pending`
  - `all`: All bookings (default)
  - `current`: Bookings from last 30 days
  - `confirmed`: Only confirmed bookings
  - `pending`: Only pending bookings

**Authentication**: Required (Bearer token)

**Response**:
```json
{
  "success": true,
  "bookings": [
    {
      "id": "booking_1234567890_abc123",
      "paymentIntentId": "pi_xxx",
      "propertyId": "1",
      "propertyTitle": "Luxury Downtown Apartment",
      "guestName": "John Smith",
      "guestEmail": "john@email.com",
      "phone": "+1234567890",
      "checkIn": "2025-01-15",
      "checkOut": "2025-01-20",
      "nights": 5,
      "guests": 2,
      "totalAmount": 2250.00,
      "status": "confirmed",
      "paymentStatus": "paid",
      "bookingDate": "2025-01-10T10:00:00.000Z",
      "createdAt": "2025-01-10T10:00:00.000Z"
    }
  ],
  "total": 82
}
```

### 3. Get Revenue Data
**GET** `/api/admin/revenue`

Returns comprehensive revenue data including:
- Total and monthly revenue
- All transactions
- Monthly breakdown
- Property breakdown

**Authentication**: Required (Bearer token)

**Response**:
```json
{
  "success": true,
  "revenue": {
    "totalRevenue": 99754.43,
    "monthlyRevenue": 8454.43,
    "transactions": [
      {
        "id": "booking_123",
        "date": "2025-01-15",
        "property": "Luxury Downtown Apartment",
        "amount": 2250.00,
        "type": "booking",
        "paymentIntentId": "pi_xxx"
      }
    ],
    "monthlyBreakdown": [
      {
        "month": "January 2025",
        "revenue": 91300.00,
        "bookings": 6
      },
      {
        "month": "February 2025",
        "revenue": 8454.43,
        "bookings": 4
      }
    ],
    "propertyBreakdown": [
      {
        "property": "Penthouse with Panoramic Views",
        "revenue": 28000.00,
        "bookings": 2
      }
    ]
  }
}
```

### 4. Create Booking
**POST** `/create-booking`

Creates a new booking record after successful payment.

**Request Body**:
```json
{
  "paymentIntentId": "pi_xxx",
  "propertyId": "1",
  "propertyName": "Luxury Downtown Apartment",
  "checkIn": "2025-01-15",
  "checkOut": "2025-01-20",
  "guests": 2,
  "totalAmount": 2250.00,
  "guestName": "John Smith",
  "email": "john@email.com",
  "phone": "+1234567890"
}
```

**Response**:
```json
{
  "success": true,
  "booking": {
    "id": "booking_1234567890_abc123",
    "paymentIntentId": "pi_xxx",
    "propertyId": "1",
    "propertyTitle": "Luxury Downtown Apartment",
    "guestName": "John Smith",
    "guestEmail": "john@email.com",
    "phone": "+1234567890",
    "checkIn": "2025-01-15",
    "checkOut": "2025-01-20",
    "nights": 5,
    "guests": 2,
    "totalAmount": 2250.00,
    "status": "confirmed",
    "paymentStatus": "paid",
    "bookingDate": "2025-01-10T10:00:00.000Z",
    "createdAt": "2025-01-10T10:00:00.000Z"
  }
}
```

## Data Sources

### Primary Source: Bookings File
Bookings are primarily stored in `backend/data/bookings.json`. This file is updated whenever a new booking is created via the `/create-booking` endpoint.

### Secondary Source: Stripe Payment Intents
The system also queries Stripe Payment Intents to:
1. Find bookings that may not be in the bookings file
2. Calculate revenue from successful payments
3. Merge data from both sources to provide comprehensive statistics

## How It Works

1. **Booking Creation**: When a payment succeeds, the frontend calls `/create-booking` which:
   - Verifies the payment with Stripe
   - Creates a booking record
   - Saves it to `bookings.json`

2. **Statistics Calculation**: The `/api/admin/statistics` endpoint:
   - Reads bookings from `bookings.json`
   - Queries Stripe for additional payment data
   - Calculates totals and filters by date ranges
   - Returns aggregated statistics

3. **Bookings List**: The `/api/admin/bookings` endpoint:
   - Reads bookings from `bookings.json`
   - Queries Stripe for missing bookings (based on payment intents)
   - Applies filters (all, current, confirmed, pending)
   - Returns filtered and sorted list

4. **Revenue Data**: The `/api/admin/revenue` endpoint:
   - Combines data from bookings file and Stripe
   - Calculates monthly and property breakdowns
   - Returns comprehensive revenue analytics

## Frontend Integration

The frontend components automatically:
- Fetch data from these endpoints
- Fall back to dummy data if backend is unavailable
- Display appropriate error messages
- Refresh data periodically (dashboard refreshes every 30 seconds)

## Error Handling

All endpoints include proper error handling:
- Returns appropriate HTTP status codes
- Provides error messages in JSON format
- Logs errors to console for debugging
- Gracefully handles missing files or data

## Authentication

All admin endpoints require authentication via Bearer token:
```
Authorization: Bearer {admin_password}
```

The admin password is set via `ADMIN_PASSWORD` environment variable (defaults to 'YGI@ADMIN4488').

