require('dotenv').config();
const express = require('express');

// Global error handlers for debugging 502s
process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION:', err);
  // Keep process alive for a moment to flush logs? No, best to crash but log it clearly
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED REJECTION:', reason);
});


// Debug environment variables
console.log('🔍 Environment Variables Debug:');
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ Loaded' : '❌ Missing');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'Using default');

// Use environment variable - REQUIRED for security
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error('❌ CRITICAL: No Stripe secret key found!');
  process.exit(1);
}

const stripe = require('stripe')(STRIPE_SECRET_KEY);
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const { connectMongoDB, getBucket, getDB } = require('./config/mongodb');
const { ObjectId } = require('mongodb');

// Configure multer for file uploads (memory storage for GridFS)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const app = express();
const PORT = process.env.PORT || 5000;
const BOOKINGS_FILE = path.join(__dirname, 'data', 'bookings.json');
const BLOCKED_DATES_FILE = path.join(__dirname, 'data', 'blocked_dates.json');
const PROPERTIES_FILE = path.join(__dirname, 'data', 'properties.json');

// Middleware
// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('combined'));
// Define allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://ygiholidayhomes.com',
  'https://www.ygiholidayhomes.com',
  'https://ygiholidayhomes-production.up.railway.app',
  'https://script.google.com',
  'https://script.googleusercontent.com'
];

if (process.env.FRONTEND_URL) {
  const envOrigins = process.env.FRONTEND_URL.split(',').map(url => url.trim());
  allowedOrigins.push(...envOrigins);
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests, or health checks from load balancers)
    if (!origin) return callback(null, true);

    // Allow Railway domains (any *.up.railway.app)
    if (origin.includes('.up.railway.app')) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Also check for ygiholidayhomes.com variations (www and non-www)
      if (origin.includes('ygiholidayhomes.com')) {
        return callback(null, true);
      }
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize MongoDB connection
connectMongoDB().catch(console.error);

// Health check endpoint - should be accessible without CORS issues
app.get('/health', (req, res) => {
  try {
    res.json({
      status: 'OK',
      message: 'YGI Backend API is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed'
    });
  }
});

// Create Payment Intent
app.post('/create-payment-intent', async (req, res) => {
  try {
    console.log('🔍 Payment Intent Request Debug:');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Stripe key loaded:', !!STRIPE_SECRET_KEY);
    console.log('Stripe instance initialized:', !!stripe);

    const { amount, currency = 'aed', metadata = {} } = req.body;

    // Validate amount
    if (!amount || isNaN(amount) || amount < 50) {
      console.log('❌ Invalid amount:', amount);
      return res.status(400).json({
        error: 'Invalid amount. Minimum amount is AED 50',
        received: amount,
        type: typeof amount
      });
    }

    console.log('💰 Creating payment intent with amount:', amount, 'currency:', currency);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        ...metadata,
        source: 'ygi_website'
      }
    });

    console.log('✅ Payment intent created successfully:');
    console.log('- ID:', paymentIntent.id);
    console.log('- Status:', paymentIntent.status);
    console.log('- Amount:', paymentIntent.amount);
    console.log('- Currency:', paymentIntent.currency);
    console.log('- Client Secret:', paymentIntent.client_secret);

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('❌ Error creating payment intent:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error status:', error.status);
    console.error('Error stack:', error.stack);

    // More detailed error response
    const errorResponse = {
      error: 'Failed to create payment intent',
      message: error.message,
      type: error.constructor.name
    };

    if (error.code) errorResponse.code = error.code;
    if (error.status) errorResponse.status = error.status;

    res.status(500).json(errorResponse);
  }
});

// Confirm Payment Intent
app.post('/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId, paymentMethodId } = req.body;

    if (!paymentIntentId || !paymentMethodId) {
      return res.status(400).json({
        error: 'Payment intent ID and payment method ID are required'
      });
    }

    // Confirm the payment intent
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId
    });

    res.json({
      status: paymentIntent.status,
      paymentIntent: paymentIntent
    });

  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      error: 'Failed to confirm payment',
      message: error.message
    });
  }
});

// Get Payment Intent Status
app.get('/payment-status/:paymentIntentId', async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      created: paymentIntent.created
    });

  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    res.status(500).json({
      error: 'Failed to retrieve payment status',
      message: error.message
    });
  }
});

// Create Booking Record (after successful payment)
app.post('/create-booking', async (req, res) => {
  try {
    const {
      paymentIntentId,
      propertyId,
      propertyName,
      checkIn,
      checkOut,
      guests,
      totalAmount,
      guestName,
      email,
      phone
    } = req.body;

    // Verify payment was successful
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        error: 'Payment not completed'
      });
    }

    // Read existing bookings
    let bookings = [];
    try {
      const bookingsData = await fs.readFile(BOOKINGS_FILE, 'utf8');
      bookings = JSON.parse(bookingsData);
    } catch (error) {
      // File doesn't exist yet, start with empty array
      bookings = [];
    }

    // Calculate nights
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    // Create booking record
    const booking = {
      id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      paymentIntentId,
      propertyId: propertyId || null,
      propertyTitle: propertyName,
      guestName,
      guestEmail: email,
      phone: phone || null,
      checkIn,
      checkOut,
      nights,
      guests: guests || 1,
      totalAmount: parseFloat(totalAmount),
      status: 'confirmed',
      paymentStatus: 'paid',
      bookingDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    // Add to bookings array
    bookings.push(booking);

    // Save to file
    await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));

    console.log('📋 Booking created and saved:', booking.id);
    console.log('📊 Booking details for Google Sheets:', {
      propertyId: propertyId || 'Unknown',
      propertyName: propertyName,
      guestName: guestName,
      email: email,
      phone: phone,
      checkIn: checkIn,
      checkOut: checkOut,
      guests: guests,
      totalPrice: totalAmount,
      paymentIntentId: paymentIntentId
    });

    res.json({
      success: true,
      booking: booking
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      error: 'Failed to create booking',
      message: error.message
    });
  }
});

// Log Google Sheets submission attempts (called from frontend)
app.post('/log-sheets-submission', async (req, res) => {
  try {
    const { success, message, bookingData, error } = req.body;

    if (success) {
      console.log('✅ Google Sheets submission successful:', {
        message: message,
        bookingData: bookingData,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('❌ Google Sheets submission failed:', {
        message: message,
        error: error,
        bookingData: bookingData,
        timestamp: new Date().toISOString()
      });
    }

    res.json({ success: true, logged: true });
  } catch (error) {
    console.error('Error logging Google Sheets submission:', error);
    res.status(500).json({ error: 'Failed to log submission' });
  }
});

// ==================== ADMIN PANEL API ENDPOINTS ====================

// Simple authentication middleware (in production, use JWT or sessions)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'YGI@ADMIN4488';

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.substring(7);

  if (token !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  next();
};

// Ensured these are declared at the top of the file to prevent SyntaxError

// Ensure data directory exists
const ensureDataDirectory = async () => {
  const dataDir = path.dirname(PROPERTIES_FILE);
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
};

// Initialize properties file from frontend if it doesn't exist
const initializePropertiesFile = async () => {
  try {
    await ensureDataDirectory();
    await fs.access(PROPERTIES_FILE);
    // File exists, do nothing
  } catch (error) {
    // File doesn't exist, create empty array
    await fs.writeFile(PROPERTIES_FILE, JSON.stringify([], null, 2));
    console.log('✅ Created properties.json file');
  }
};

// Initialize on server start
initializePropertiesFile();

// ==================== IMAGE MANAGEMENT ENDPOINTS ====================

// Upload image to MongoDB GridFS
app.post('/api/images/upload', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const bucket = await getBucket();
    const filename = req.body.filename || req.file.originalname || `image_${Date.now()}`;
    const propertyId = req.body.propertyId || null;
    const category = req.body.category || 'general';

    // Create upload stream
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: {
        propertyId,
        category,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        uploadedAt: new Date().toISOString()
      }
    });

    // Write file buffer to GridFS
    uploadStream.end(req.file.buffer);

    uploadStream.on('finish', () => {
      // Return full URL for the image
      // Use environment variable or construct from request
      let baseUrl = process.env.BACKEND_URL || process.env.RAILWAY_PUBLIC_DOMAIN;

      // If BACKEND_URL is set but doesn't have protocol, add it
      if (baseUrl && !baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
        baseUrl = `https://${baseUrl}`;
      }

      if (!baseUrl) {
        // Fallback: construct from request
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
        const host = req.headers['x-forwarded-host'] || req.get('host') || 'ygiholidayhomes-production.up.railway.app';
        baseUrl = `${protocol}://${host}`;
      }

      // Ensure baseUrl doesn't end with /
      baseUrl = baseUrl.replace(/\/$/, '');

      // Construct image URL - ensure we don't duplicate the domain
      const imageUrl = `${baseUrl}/api/images/${uploadStream.id}`;

      console.log('✅ Image uploaded, returning URL:', imageUrl); // Debug log

      res.json({
        success: true,
        imageId: uploadStream.id.toString(),
        filename: uploadStream.filename,
        url: imageUrl,
        category: category
      });
    });

    uploadStream.on('error', (error) => {
      console.error('Error uploading image:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    });
  } catch (error) {
    console.error('Error in image upload:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Get image metadata (including category)
app.get('/api/images/:imageId/metadata', async (req, res) => {
  try {
    const bucket = await getBucket();
    const imageId = new ObjectId(req.params.imageId);

    const files = await bucket.find({ _id: imageId }).toArray();
    if (files.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const file = files[0];
    const baseUrl = process.env.BACKEND_URL || req.protocol + '://' + req.get('host');

    res.json({
      success: true,
      imageId: file._id.toString(),
      filename: file.filename,
      url: `${baseUrl}/api/images/${file._id}`,
      category: file.metadata?.category || 'Other',
      propertyId: file.metadata?.propertyId || null,
      uploadedAt: file.uploadDate,
      size: file.length,
      mimeType: file.metadata?.mimeType || 'image/jpeg'
    });
  } catch (error) {
    console.error('Error retrieving image metadata:', error);
    res.status(500).json({ error: 'Failed to retrieve image metadata' });
  }
});

// Handle OPTIONS preflight for image endpoint
app.options('/api/images/:imageId', (req, res) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400' // 24 hours
  });
  res.sendStatus(204);
});

// Get image from MongoDB GridFS
app.get('/api/images/:imageId', async (req, res) => {
  try {
    const bucket = await getBucket();

    // Set CORS headers before any response
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });

    let imageId;
    try {
      imageId = new ObjectId(req.params.imageId);
    } catch (error) {
      // Return 400 with CORS headers
      res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      });
      return res.status(400).json({ error: 'Invalid image ID format' });
    }

    // Check if file exists
    const files = await bucket.find({ _id: imageId }).toArray();
    if (files.length === 0) {
      // Return 404 with CORS headers
      res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      });
      return res.status(404).json({ error: 'Image not found' });
    }

    const file = files[0];

    // Set appropriate headers with CORS
    res.set({
      'Content-Type': file.metadata?.mimeType || 'image/jpeg',
      'Content-Length': file.length,
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    });

    // Stream the image
    const downloadStream = bucket.openDownloadStream(imageId);
    downloadStream.pipe(res);

    downloadStream.on('error', (error) => {
      console.error('Error streaming image:', error);
      if (!res.headersSent) {
        res.set({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.status(500).json({ error: 'Failed to retrieve image' });
      }
    });
  } catch (error) {
    console.error('Error retrieving image:', error);
    if (!res.headersSent) {
      res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      res.status(500).json({ error: 'Failed to retrieve image' });
    }
  }
});

// Get image by filename
app.get('/api/images/filename/:filename', async (req, res) => {
  try {
    const bucket = await getBucket();
    let filename = decodeURIComponent(req.params.filename);

    // Set CORS headers before any response
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    });

    // Try multiple filename variations
    const filenameVariations = [
      filename, // Original
      filename.replace(/^\.\//, ''), // Remove ./ prefix
      filename.replace(/\\/g, '/'), // Normalize backslashes
      filename.replace(/^\.\//, '').replace(/\\/g, '/'), // Both
      path.basename(filename), // Just the filename part (UUID + extension)
    ];

    let file = null;
    let foundVariation = null;

    // Try each variation
    for (const variation of filenameVariations) {
      const files = await bucket.find({ filename: variation }).sort({ uploadDate: -1 }).limit(1).toArray();
      if (files.length > 0) {
        file = files[0];
        foundVariation = variation;
        console.log(`✅ Found image with variation: "${variation}" (original: "${filename}")`);
        break;
      }
    }

    // If still not found, try to find by UUID (the filename part after last /)
    if (!file) {
      const uuidMatch = filename.match(/([a-f0-9-]+\.(jpg|jpeg|png|gif|webp|avif))$/i);
      if (uuidMatch) {
        const uuidFilename = uuidMatch[1];
        console.log(`🔍 Trying to find by UUID filename: "${uuidFilename}"`);
        const files = await bucket.find({
          filename: { $regex: uuidFilename, $options: 'i' }
        }).sort({ uploadDate: -1 }).limit(1).toArray();
        if (files.length > 0) {
          file = files[0];
          foundVariation = `regex:${uuidFilename}`;
          console.log(`✅ Found image by UUID regex: "${uuidFilename}"`);
        }
      }
    }

    if (!file) {
      console.log(`❌ Image not found. Tried variations:`, filenameVariations.slice(0, 3));
      // Return 404 with CORS headers explicitly set
      res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      });
      return res.status(404).json({
        error: 'Image not found',
        tried: filenameVariations.slice(0, 3) // Don't log all variations
      });
    }

    res.set({
      'Content-Type': file.metadata?.mimeType || 'image/jpeg',
      'Content-Length': file.length,
      'Cache-Control': 'public, max-age=31536000',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    });

    const downloadStream = bucket.openDownloadStream(file._id);
    downloadStream.pipe(res);

    downloadStream.on('error', (error) => {
      console.error('Error streaming image:', error);
      if (!res.headersSent) {
        res.set({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.status(500).json({ error: 'Failed to retrieve image' });
      }
    });
  } catch (error) {
    console.error('Error retrieving image by filename:', error);
    if (!res.headersSent) {
      res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      res.status(500).json({ error: 'Failed to retrieve image' });
    }
  }
});

// List all images (admin only)
app.get('/api/admin/images', authenticateAdmin, async (req, res) => {
  try {
    const bucket = await getBucket();
    const propertyId = req.query.propertyId;

    let query = {};
    if (propertyId) {
      query['metadata.propertyId'] = propertyId;
    }

    const files = await bucket.find(query).toArray();
    const images = files.map(file => ({
      id: file._id.toString(),
      filename: file.filename,
      url: `/api/images/${file._id}`,
      size: file.length,
      uploadedAt: file.uploadDate,
      metadata: file.metadata
    }));

    res.json({ success: true, images });
  } catch (error) {
    console.error('Error listing images:', error);
    res.status(500).json({ error: 'Failed to list images' });
  }
});

// Delete image (admin only)
app.delete('/api/admin/images/:imageId', authenticateAdmin, async (req, res) => {
  try {
    const bucket = await getBucket();
    const imageId = new ObjectId(req.params.imageId);

    await bucket.delete(imageId);
    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Public API endpoint for frontend (no authentication required)
app.get('/api/properties', async (req, res) => {
  try {
    // Add cache-control headers to prevent caching
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    const data = await fs.readFile(PROPERTIES_FILE, 'utf8');
    const properties = JSON.parse(data);
    res.json({ success: true, properties });
  } catch (error) {
    console.error('Error reading properties:', error);
    res.status(500).json({ error: 'Failed to read properties' });
  }
});

// Get booked dates for a property (public endpoint)
app.get('/api/properties/:id/booked-dates', async (req, res) => {
  try {
    const { id } = req.params;

    // Read bookings from file
    let bookings = [];
    try {
      const bookingsData = await fs.readFile(BOOKINGS_FILE, 'utf8').catch(() => '[]');
      bookings = JSON.parse(bookingsData);
    } catch (error) {
      bookings = [];
    }

    // Filter bookings for this property that are confirmed/paid
    const propertyBookings = bookings.filter(b =>
      String(b.propertyId) === String(id) &&
      (b.status === 'confirmed' || b.paymentStatus === 'paid')
    );

    // Map to simple date ranges
    const bookedDates = propertyBookings.map(b => ({
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      type: 'booking'
    }));

    // Read manual blocked dates
    let blockedDatesStore = {};
    try {
      if (await fs.access(BLOCKED_DATES_FILE).then(() => true).catch(() => false)) {
        const bdData = await fs.readFile(BLOCKED_DATES_FILE, 'utf8');
        blockedDatesStore = JSON.parse(bdData);
      }
    } catch (error) {
      console.warn('Could not read blocked dates file:', error.message);
    }

    const manualBlockedDates = (blockedDatesStore[id] || []).map(range => ({
      ...range,
      type: 'manual'
    }));

    res.json({
      success: true,
      propertyId: id,
      bookedDates: [...bookedDates, ...manualBlockedDates]
    });
  } catch (error) {
    console.error('Error fetching booked dates:', error);
    res.status(500).json({ error: 'Failed to fetch booked dates' });
  }
});

// Admin booking statistics endpoint
app.get('/api/admin/statistics', authenticateAdmin, async (req, res) => {
  try {
    // Get properties count
    const propertiesData = await fs.readFile(PROPERTIES_FILE, 'utf8').catch(() => '[]');
    const properties = JSON.parse(propertiesData);
    const totalProperties = Array.isArray(properties) ? properties.length : 0;
    const availableProperties = Array.isArray(properties)
      ? properties.filter(p => p.available !== false).length
      : 0;

    // Get bookings from file
    let bookings = [];
    try {
      const bookingsData = await fs.readFile(BOOKINGS_FILE, 'utf8').catch(() => '[]');
      bookings = JSON.parse(bookingsData);
    } catch (error) {
      bookings = [];
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // For live data, we'll use Stripe as the source of truth
    // Bookings file is secondary (for additional metadata)
    let totalRevenue = 0;
    let monthlyRevenue = 0;
    let totalBookings = 0;
    let currentBookings = 0;
    const bookingsPaymentIntentIds = new Set(bookings.map(b => b.paymentIntentId).filter(id => id));

    try {
      // Fetch all payment intents (paginate if needed for complete data)
      let allPaymentIntents = [];
      let hasMore = true;
      let startingAfter = null;

      while (hasMore) {
        const params = { limit: 100 };
        if (startingAfter) {
          params.starting_after = startingAfter;
        }

        const paymentIntents = await stripe.paymentIntents.list(params);
        allPaymentIntents = allPaymentIntents.concat(paymentIntents.data);

        hasMore = paymentIntents.has_more;
        if (hasMore && paymentIntents.data.length > 0) {
          startingAfter = paymentIntents.data[paymentIntents.data.length - 1].id;
        } else {
          hasMore = false;
        }

        // Safety limit: don't fetch more than 1000 payment intents
        if (allPaymentIntents.length >= 1000) {
          hasMore = false;
        }
      }

      // Only count valid bookings (payments with proper booking metadata)
      allPaymentIntents.forEach(pi => {
        if (pi.status === 'succeeded') {
          // Check if this is a valid booking (has required metadata)
          const hasPropertyName = pi.metadata?.propertyName &&
            pi.metadata.propertyName !== 'null' &&
            pi.metadata.propertyName !== 'Unknown Property';
          const hasGuestName = pi.metadata?.guestName &&
            pi.metadata.guestName !== 'null' &&
            pi.metadata.guestName !== 'Unknown Guest';
          const hasCheckIn = pi.metadata?.checkIn &&
            pi.metadata.checkIn !== 'null';
          const hasCheckOut = pi.metadata?.checkOut &&
            pi.metadata.checkOut !== 'null';

          // Only count if it has all required booking information
          if (hasPropertyName && hasGuestName && hasCheckIn && hasCheckOut) {
            const amount = pi.amount / 100;
            const created = new Date(pi.created * 1000);

            // Validate dates are not epoch or invalid
            try {
              const checkInDate = new Date(pi.metadata.checkIn);
              const checkOutDate = new Date(pi.metadata.checkOut);
              if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
                return; // Skip invalid dates
              }
              if (checkInDate.getFullYear() < 2000 || checkOutDate.getFullYear() < 2000) {
                return; // Skip epoch dates
              }
            } catch (e) {
              return; // Skip if date parsing fails
            }

            // Count as valid booking
            totalBookings++;
            if (created >= thirtyDaysAgo) {
              currentBookings++;
            }

            // Add revenue from valid bookings only
            totalRevenue += amount;
            if (created >= startOfMonth) {
              monthlyRevenue += amount;
            }
          }
        }
      });
    } catch (stripeError) {
      console.warn('Could not fetch Stripe statistics:', stripeError.message);
      // Fallback to bookings file if Stripe fails
      totalBookings = bookings.length;
      currentBookings = bookings.filter(b => {
        const bookingDate = new Date(b.bookingDate);
        return bookingDate >= thirtyDaysAgo;
      }).length;

      bookings.forEach(booking => {
        if (booking.paymentStatus === 'paid' || booking.status === 'confirmed') {
          totalRevenue += booking.totalAmount || 0;
          const bookingDate = new Date(booking.bookingDate);
          if (bookingDate >= startOfMonth) {
            monthlyRevenue += booking.totalAmount || 0;
          }
        }
      });
    }

    // Add cache-control headers to ensure fresh data
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    const statistics = {
      totalProperties,
      availableProperties,
      totalBookings,
      currentBookings,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
      lastUpdated: new Date().toISOString(), // Timestamp for when data was fetched
      dataSource: 'stripe' // Indicate this is live data from Stripe
    };

    // Log statistics for debugging
    console.log('📊 Live Statistics (Valid Bookings Only):', {
      totalBookings,
      currentBookings,
      totalRevenue: statistics.totalRevenue,
      monthlyRevenue: statistics.monthlyRevenue,
      timestamp: statistics.lastUpdated,
      note: 'Only counting payments with valid booking metadata (propertyName, guestName, checkIn, checkOut)'
    });

    res.json({
      success: true,
      statistics
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get all bookings (admin endpoint)
app.get('/api/admin/bookings', authenticateAdmin, async (req, res) => {
  try {
    const { filter } = req.query; // 'all', 'current', 'confirmed', 'pending'

    // Read bookings from file
    let bookings = [];
    try {
      const bookingsData = await fs.readFile(BOOKINGS_FILE, 'utf8').catch(() => '[]');
      bookings = JSON.parse(bookingsData);
    } catch (error) {
      bookings = [];
    }

    // Also get bookings from Stripe payment intents and merge
    try {
      const paymentIntents = await stripe.paymentIntents.list({
        limit: 100,
      });

      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      paymentIntents.data.forEach(pi => {
        if (pi.status === 'succeeded') {
          // Check if already in bookings
          const exists = bookings.some(b => b.paymentIntentId === pi.id);

          // Only create booking from Stripe if it has meaningful metadata
          // Skip incomplete bookings (missing property name, guest name, or dates)
          const hasPropertyName = pi.metadata?.propertyName &&
            pi.metadata.propertyName.trim() !== '' &&
            pi.metadata.propertyName !== 'Unknown Property';
          const hasGuestName = pi.metadata?.guestName &&
            pi.metadata.guestName.trim() !== '' &&
            pi.metadata.guestName !== 'Unknown Guest';
          const hasCheckIn = pi.metadata?.checkIn &&
            pi.metadata.checkIn.trim() !== '' &&
            pi.metadata.checkIn !== 'null';
          const hasCheckOut = pi.metadata?.checkOut &&
            pi.metadata.checkOut.trim() !== '' &&
            pi.metadata.checkOut !== 'null';

          if (!exists && hasPropertyName && hasGuestName && hasCheckIn && hasCheckOut) {
            // Create booking from Stripe metadata
            const booking = {
              id: `stripe_${pi.id}`,
              paymentIntentId: pi.id,
              propertyId: pi.metadata.propertyId || null,
              propertyTitle: pi.metadata.propertyName,
              guestName: pi.metadata.guestName,
              guestEmail: pi.metadata.email || pi.receipt_email || 'unknown@email.com',
              phone: pi.metadata.phone || null,
              checkIn: pi.metadata.checkIn,
              checkOut: pi.metadata.checkOut,
              nights: pi.metadata.nights ? parseInt(pi.metadata.nights) : 1,
              guests: pi.metadata.guests ? parseInt(pi.metadata.guests) : 1,
              totalAmount: pi.amount / 100,
              status: 'confirmed',
              paymentStatus: 'paid',
              bookingDate: new Date(pi.created * 1000).toISOString(),
              createdAt: new Date(pi.created * 1000).toISOString()
            };
            bookings.push(booking);
          }
          // Skip incomplete Stripe bookings - they're not useful without proper metadata
        }
      });
    } catch (stripeError) {
      console.warn('Could not fetch Stripe bookings:', stripeError.message);
    }

    // Filter out bookings with invalid dates or missing critical info
    bookings = bookings.filter(b => {
      // Must have valid check-in and check-out dates
      if (!b.checkIn || !b.checkOut) return false;
      try {
        const checkInDate = new Date(b.checkIn);
        const checkOutDate = new Date(b.checkOut);
        // Check if dates are valid (not epoch date or invalid)
        if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) return false;
        // Check if dates are not epoch (Jan 1, 1970)
        if (checkInDate.getFullYear() < 2000 || checkOutDate.getFullYear() < 2000) return false;
        return true;
      } catch (e) {
        return false;
      }
    });

    // Sort by booking date (newest first)
    bookings.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

    // Apply filters
    let filteredBookings = bookings;
    if (filter === 'current') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filteredBookings = bookings.filter(b => {
        const bookingDate = new Date(b.bookingDate);
        return bookingDate >= thirtyDaysAgo;
      });
    } else if (filter === 'confirmed') {
      filteredBookings = bookings.filter(b => b.status === 'confirmed');
    } else if (filter === 'pending') {
      filteredBookings = bookings.filter(b => b.status === 'pending');
    }

    res.json({
      success: true,
      bookings: filteredBookings,
      total: filteredBookings.length
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get revenue data (admin endpoint)
app.get('/api/admin/revenue', authenticateAdmin, async (req, res) => {
  try {
    // Read bookings from file
    let bookings = [];
    try {
      const bookingsData = await fs.readFile(BOOKINGS_FILE, 'utf8').catch(() => '[]');
      bookings = JSON.parse(bookingsData);
    } catch (error) {
      bookings = [];
    }

    // Get all valid bookings from Stripe (with pagination)
    let stripeTransactions = [];
    try {
      // Fetch all payment intents (paginate if needed for complete data)
      let allPaymentIntents = [];
      let hasMore = true;
      let startingAfter = null;

      while (hasMore) {
        const params = { limit: 100 };
        if (startingAfter) {
          params.starting_after = startingAfter;
        }

        const paymentIntents = await stripe.paymentIntents.list(params);
        allPaymentIntents = allPaymentIntents.concat(paymentIntents.data);

        hasMore = paymentIntents.has_more;
        if (hasMore && paymentIntents.data.length > 0) {
          startingAfter = paymentIntents.data[paymentIntents.data.length - 1].id;
        } else {
          hasMore = false;
        }

        // Safety limit: don't fetch more than 1000 payment intents
        if (allPaymentIntents.length >= 1000) {
          hasMore = false;
        }
      }

      // Only include valid bookings (same validation as statistics endpoint)
      stripeTransactions = allPaymentIntents
        .filter(pi => {
          if (pi.status !== 'succeeded') return false;

          // Check if this is a valid booking (has required metadata)
          const hasPropertyName = pi.metadata?.propertyName &&
            pi.metadata.propertyName !== 'null' &&
            pi.metadata.propertyName !== 'Unknown Property';
          const hasGuestName = pi.metadata?.guestName &&
            pi.metadata.guestName !== 'null' &&
            pi.metadata.guestName !== 'Unknown Guest';
          const hasCheckIn = pi.metadata?.checkIn &&
            pi.metadata.checkIn !== 'null';
          const hasCheckOut = pi.metadata?.checkOut &&
            pi.metadata.checkOut !== 'null';

          if (!hasPropertyName || !hasGuestName || !hasCheckIn || !hasCheckOut) {
            return false;
          }

          // Validate dates are not epoch or invalid
          try {
            const checkInDate = new Date(pi.metadata.checkIn);
            const checkOutDate = new Date(pi.metadata.checkOut);
            if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
              return false;
            }
            if (checkInDate.getFullYear() < 2000 || checkOutDate.getFullYear() < 2000) {
              return false;
            }
          } catch (e) {
            return false;
          }

          return true;
        })
        .map(pi => ({
          id: `stripe_${pi.id}`,
          date: new Date(pi.created * 1000).toISOString().split('T')[0],
          property: pi.metadata.propertyName,
          amount: pi.amount / 100,
          type: 'booking',
          paymentIntentId: pi.id
        }));
    } catch (stripeError) {
      console.warn('Could not fetch Stripe revenue:', stripeError.message);
    }

    // Combine bookings and Stripe transactions (avoid duplicates)
    const bookingsPaymentIntentIds = new Set(bookings.map(b => b.paymentIntentId).filter(id => id));
    const allTransactions = [
      ...bookings
        .filter(b => (b.paymentStatus === 'paid' || b.status === 'confirmed') && b.totalAmount > 0)
        .map(b => ({
          id: b.id,
          date: b.bookingDate ? b.bookingDate.split('T')[0] : new Date().toISOString().split('T')[0],
          property: b.propertyTitle || 'Unknown Property',
          amount: b.totalAmount || 0,
          type: 'booking',
          paymentIntentId: b.paymentIntentId
        })),
      ...stripeTransactions.filter(st =>
        !bookingsPaymentIntentIds.has(st.paymentIntentId)
      )
    ];

    // Calculate totals
    const totalRevenue = allTransactions.reduce((sum, t) => sum + t.amount, 0);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyTransactions = allTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startOfMonth;
    });
    const monthlyRevenue = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Monthly breakdown
    const monthlyBreakdown = {};
    allTransactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
      if (!monthlyBreakdown[monthKey]) {
        monthlyBreakdown[monthKey] = { revenue: 0, bookings: 0 };
      }
      monthlyBreakdown[monthKey].revenue += t.amount;
      monthlyBreakdown[monthKey].bookings += 1;
    });

    const monthlyBreakdownArray = Object.entries(monthlyBreakdown)
      .map(([month, data]) => ({
        month,
        revenue: Math.round(data.revenue * 100) / 100,
        bookings: data.bookings
      }))
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateB - dateA;
      });

    // Property breakdown
    const propertyBreakdown = {};
    allTransactions.forEach(t => {
      const property = t.property;
      if (!propertyBreakdown[property]) {
        propertyBreakdown[property] = { revenue: 0, bookings: 0 };
      }
      propertyBreakdown[property].revenue += t.amount;
      propertyBreakdown[property].bookings += 1;
    });

    const propertyBreakdownArray = Object.entries(propertyBreakdown)
      .map(([property, data]) => ({
        property,
        revenue: Math.round(data.revenue * 100) / 100,
        bookings: data.bookings
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Add cache-control headers to ensure fresh data
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    console.log('📊 Revenue Data (Valid Bookings Only):', {
      totalTransactions: allTransactions.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
      monthlyBreakdownCount: monthlyBreakdownArray.length,
      propertyBreakdownCount: propertyBreakdownArray.length
    });

    res.json({
      success: true,
      revenue: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
        transactions: allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)),
        monthlyBreakdown: monthlyBreakdownArray,
        propertyBreakdown: propertyBreakdownArray
      }
    });
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    res.status(500).json({ error: 'Failed to fetch revenue data' });
  }
});

// Get all properties (admin endpoint)
app.get('/api/admin/properties', authenticateAdmin, async (req, res) => {
  try {
    const data = await fs.readFile(PROPERTIES_FILE, 'utf8');
    const properties = JSON.parse(data);
    res.json({ success: true, properties });
  } catch (error) {
    console.error('Error reading properties:', error);
    res.status(500).json({ error: 'Failed to read properties' });
  }
});

// Get single property by ID
app.get('/api/admin/properties/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fs.readFile(PROPERTIES_FILE, 'utf8');
    const properties = JSON.parse(data);
    const property = properties.find(p => p.id === parseInt(id));

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json({ success: true, property });
  } catch (error) {
    console.error('Error reading property:', error);
    res.status(500).json({ error: 'Failed to read property' });
  }
});

// Create new property
app.post('/api/admin/properties', authenticateAdmin, async (req, res) => {
  try {
    const data = await fs.readFile(PROPERTIES_FILE, 'utf8');
    const properties = JSON.parse(data);

    // Generate new ID
    const newId = properties.length > 0
      ? Math.max(...properties.map(p => p.id)) + 1
      : 1;

    // Filter images: only keep full URLs (MongoDB URLs or valid http/https URLs)
    // Remove relative paths (old local paths) as they won't work with MongoDB
    let validImages = [];
    if (Array.isArray(req.body.images)) {
      validImages = req.body.images
        .map(img => typeof img === 'string' ? img : (img?.url || img))
        .filter(img => {
          if (!img || !img.trim()) return false;
          const trimmed = img.trim();
          // Only keep full URLs (http/https) or MongoDB API paths
          return trimmed.startsWith('http://') ||
            trimmed.startsWith('https://') ||
            trimmed.startsWith('/api/images/');
        });
    }

    const newProperty = {
      ...req.body,
      id: newId,
      images: validImages, // Use filtered images
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Ensure images array is properly saved
    if (newProperty.images) {
      console.log('Saving property with images:', newProperty.images.length, 'images');
      console.log('Image URLs:', newProperty.images);
      if (req.body.images && req.body.images.length !== validImages.length) {
        console.log('⚠️ Filtered out', req.body.images.length - validImages.length, 'invalid image paths (relative paths)');
      }
    }

    properties.push(newProperty);
    await fs.writeFile(PROPERTIES_FILE, JSON.stringify(properties, null, 2));

    console.log('✅ Property created:', newProperty.id);
    res.json({ success: true, property: newProperty });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ error: 'Failed to create property' });
  }
});

// Update property
app.put('/api/admin/properties/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fs.readFile(PROPERTIES_FILE, 'utf8');
    const properties = JSON.parse(data);

    const index = properties.findIndex(p => p.id === parseInt(id));

    if (index === -1) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const oldProperty = properties[index];
    const oldImages = oldProperty.images || [];

    // Filter images: only keep full URLs (MongoDB URLs or valid http/https URLs)
    // Remove relative paths (old local paths) as they won't work with MongoDB
    let validImages = [];
    if (Array.isArray(req.body.images)) {
      validImages = req.body.images
        .map(img => typeof img === 'string' ? img : (img?.url || img))
        .filter(img => {
          if (!img || !img.trim()) return false;
          const trimmed = img.trim();
          // Only keep full URLs (http/https) or MongoDB API paths
          return trimmed.startsWith('http://') ||
            trimmed.startsWith('https://') ||
            trimmed.startsWith('/api/images/');
        });
    } else if (req.body.images === undefined) {
      // If images not provided, keep existing images
      validImages = oldImages;
    }

    // Find images that were removed (exist in oldImages but not in validImages)
    const removedImages = oldImages.filter(oldImg => {
      const oldUrl = typeof oldImg === 'string' ? oldImg : (oldImg?.url || oldImg);
      return !validImages.some(newImg => {
        const newUrl = typeof newImg === 'string' ? newImg : (newImg?.url || newImg);
        return oldUrl === newUrl || oldUrl.trim() === newUrl.trim();
      });
    });

    // Delete removed images from MongoDB
    if (removedImages.length > 0) {
      const bucket = await getBucket();
      for (const removedImg of removedImages) {
        const imgUrl = typeof removedImg === 'string' ? removedImg : (removedImg?.url || removedImg);
        // Extract imageId from URL (format: https://domain/api/images/{imageId} or /api/images/{imageId})
        const imageIdMatch = imgUrl.match(/\/api\/images\/([a-fA-F0-9]{24})/);
        if (imageIdMatch && imageIdMatch[1]) {
          try {
            const imageId = new ObjectId(imageIdMatch[1]);
            await bucket.delete(imageId);
            console.log('✅ Deleted orphaned image from MongoDB:', imageIdMatch[1]);
          } catch (err) {
            console.error('Error deleting orphaned image:', err);
            // Continue even if deletion fails
          }
        }
      }
    }

    const updatedProperty = {
      ...oldProperty,
      ...req.body,
      id: parseInt(id),
      images: validImages, // Use filtered images
      updatedAt: new Date().toISOString()
    };

    // Ensure images array is properly saved
    if (updatedProperty.images) {
      console.log('Updating property with images:', updatedProperty.images.length, 'images');
      console.log('Image URLs:', updatedProperty.images);
      if (req.body.images && Array.isArray(req.body.images) && req.body.images.length !== validImages.length) {
        console.log('⚠️ Filtered out', req.body.images.length - validImages.length, 'invalid image paths (relative paths)');
      }
      if (removedImages.length > 0) {
        console.log('🗑️ Deleted', removedImages.length, 'orphaned image(s) from MongoDB');
      }
    }

    properties[index] = updatedProperty;
    await fs.writeFile(PROPERTIES_FILE, JSON.stringify(properties, null, 2));

    console.log('✅ Property updated:', id);
    res.json({ success: true, property: properties[index] });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ error: 'Failed to update property' });
  }
});

// Update manual blocked dates (admin endpoint)
app.put('/api/admin/properties/:id/blocked-dates', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { blockedDates } = req.body; // Array of { checkIn, checkOut, note }

    if (!Array.isArray(blockedDates)) {
      return res.status(400).json({ error: 'blockedDates must be an array' });
    }

    // Read existing store
    let blockedDatesStore = {};
    try {
      if (await fs.access(BLOCKED_DATES_FILE).then(() => true).catch(() => false)) {
        const bdData = await fs.readFile(BLOCKED_DATES_FILE, 'utf8');
        blockedDatesStore = JSON.parse(bdData);
      }
    } catch (error) {
      blockedDatesStore = {};
    }

    // Update for this property
    blockedDatesStore[id] = blockedDates;

    // Save back
    await fs.writeFile(BLOCKED_DATES_FILE, JSON.stringify(blockedDatesStore, null, 2));

    console.log('✅ Blocked dates updated for property:', id);
    res.json({ success: true, propertyId: id, blockedDates });
  } catch (error) {
    console.error('Error updating blocked dates:', error);
    res.status(500).json({ error: 'Failed to update blocked dates' });
  }
});

// Delete property
app.delete('/api/admin/properties/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fs.readFile(PROPERTIES_FILE, 'utf8');
    const properties = JSON.parse(data);

    const index = properties.findIndex(p => p.id === parseInt(id));

    if (index === -1) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const deletedProperty = properties[index];
    const propertyImages = deletedProperty.images || [];

    // Delete all associated images from MongoDB
    if (propertyImages.length > 0) {
      const bucket = await getBucket();
      let deletedCount = 0;

      for (const img of propertyImages) {
        const imgUrl = typeof img === 'string' ? img : (img?.url || img);
        // Extract imageId from URL (format: https://domain/api/images/{imageId} or /api/images/{imageId})
        const imageIdMatch = imgUrl.match(/\/api\/images\/([a-fA-F0-9]{24})/);
        if (imageIdMatch && imageIdMatch[1]) {
          try {
            const imageId = new ObjectId(imageIdMatch[1]);
            await bucket.delete(imageId);
            deletedCount++;
            console.log('✅ Deleted property image from MongoDB:', imageIdMatch[1]);
          } catch (err) {
            console.error('Error deleting property image:', err);
            // Continue even if deletion fails
          }
        }
      }

      if (deletedCount > 0) {
        console.log(`🗑️ Deleted ${deletedCount} image(s) from MongoDB for property ${id}`);
      }
    }

    properties.splice(index, 1);
    await fs.writeFile(PROPERTIES_FILE, JSON.stringify(properties, null, 2));

    console.log('✅ Property deleted:', id);
    res.json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

// Admin login endpoint
app.post('/api/admin/login', async (req, res) => {
  try {
    const { password } = req.body;

    if (password === ADMIN_PASSWORD) {
      res.json({
        success: true,
        token: ADMIN_PASSWORD,
        message: 'Login successful'
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid password'
      });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Sync properties from provided data (for initial setup)
app.post('/api/admin/sync-properties', authenticateAdmin, async (req, res) => {
  try {
    const { properties } = req.body;

    if (!Array.isArray(properties)) {
      return res.status(400).json({ error: 'Properties must be an array' });
    }

    await ensureDataDirectory();
    await fs.writeFile(PROPERTIES_FILE, JSON.stringify(properties, null, 2));

    console.log(`✅ Synced ${properties.length} properties to properties.json`);
    res.json({
      success: true,
      message: `Successfully synced ${properties.length} properties`,
      count: properties.length
    });
  } catch (error) {
    console.error('Error syncing properties:', error);
    res.status(500).json({ error: 'Failed to sync properties' });
  }
});

// Sync backend properties.json to frontend properties.js (only works locally, not on Railway)
app.post('/api/admin/sync-to-frontend', authenticateAdmin, async (req, res) => {
  try {
    // Check if we're in a local environment where frontend files are accessible
    const frontendPath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'properties.js');

    try {
      await fs.access(frontendPath);
    } catch {
      return res.status(404).json({
        error: 'Frontend files not accessible. This feature only works in local development. On Railway, the frontend fetches properties from the API automatically.',
        note: 'No sync needed - frontend uses /api/properties endpoint'
      });
    }

    const syncToFrontend = require('./sync-to-frontend');
    const result = await syncToFrontend();

    res.json({
      success: true,
      message: `Successfully synced ${result.count} properties to frontend`,
      count: result.count
    });
  } catch (error) {
    console.error('Error syncing to frontend:', error);
    res.status(500).json({
      error: 'Failed to sync to frontend',
      message: error.message,
      note: 'On Railway, frontend automatically fetches from /api/properties - no sync needed'
    });
  }
});

// Webhook endpoint for Stripe events
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      // Handle successful payment
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      // Handle failed payment
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Root handler for default health checks
app.get('/', (req, res) => {
  res.json({ status: 'OK', service: 'YGI Backend' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

// Bind to 0.0.0.0 to accept connections from all interfaces (required for reverse proxies/load balancers)
// Note: 0.0.0.0 is for server binding only - use localhost or 127.0.0.1 in your browser
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 YGI Backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Health check (alternative): http://127.0.0.1:${PORT}/health`);
  console.log(`💳 Stripe integration ready`);
});
