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

// Middleware
app.use(helmet());
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

    // Create booking record (in a real app, save to database)
    const booking = {
      id: `booking_${Date.now()}`,
      paymentIntentId,
      propertyName,
      checkIn,
      checkOut,
      guests,
      totalAmount,
      guestName,
      email,
      phone,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    // In production, save to database here
    console.log('📋 Booking created:', booking);
    console.log('📊 Booking details for Google Sheets:', {
      propertyId: req.body.propertyId || 'Unknown',
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
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

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

// Properties file path
const PROPERTIES_FILE = path.join(__dirname, 'data', 'properties.json');

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
      res.json({
        success: true,
        imageId: uploadStream.id.toString(),
        filename: uploadStream.filename,
        url: `/api/images/${uploadStream.id}`
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

// Get image from MongoDB GridFS
app.get('/api/images/:imageId', async (req, res) => {
  try {
    const bucket = await getBucket();
    const imageId = new ObjectId(req.params.imageId);

    // Check if file exists
    const files = await bucket.find({ _id: imageId }).toArray();
    if (files.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const file = files[0];
    
    // Set appropriate headers
    res.set({
      'Content-Type': file.metadata?.mimeType || 'image/jpeg',
      'Content-Length': file.length,
      'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
    });

    // Stream the image
    const downloadStream = bucket.openDownloadStream(imageId);
    downloadStream.pipe(res);

    downloadStream.on('error', (error) => {
      console.error('Error streaming image:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to retrieve image' });
      }
    });
  } catch (error) {
    console.error('Error retrieving image:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to retrieve image' });
    }
  }
});

// Get image by filename
app.get('/api/images/filename/:filename', async (req, res) => {
  try {
    const bucket = await getBucket();
    const filename = decodeURIComponent(req.params.filename);

    const files = await bucket.find({ filename }).sort({ uploadDate: -1 }).limit(1).toArray();
    if (files.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const file = files[0];
    res.set({
      'Content-Type': file.metadata?.mimeType || 'image/jpeg',
      'Content-Length': file.length,
      'Cache-Control': 'public, max-age=31536000'
    });

    const downloadStream = bucket.openDownloadStream(file._id);
    downloadStream.pipe(res);

    downloadStream.on('error', (error) => {
      console.error('Error streaming image:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to retrieve image' });
      }
    });
  } catch (error) {
    console.error('Error retrieving image by filename:', error);
    if (!res.headersSent) {
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
    const data = await fs.readFile(PROPERTIES_FILE, 'utf8');
    const properties = JSON.parse(data);
    res.json({ success: true, properties });
  } catch (error) {
    console.error('Error reading properties:', error);
    res.status(500).json({ error: 'Failed to read properties' });
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

    // Get booking statistics from Stripe
    let totalBookings = 0;
    let currentBookings = 0;
    let totalRevenue = 0;
    let monthlyRevenue = 0;
    
    try {
      // Get all payment intents (succeeded ones are bookings)
      const paymentIntents = await stripe.paymentIntents.list({
        limit: 100,
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      totalBookings = paymentIntents.data.filter(pi => pi.status === 'succeeded').length;
      
      // Calculate current bookings (check-ins in the future or recent past)
      // For now, we'll estimate based on recent payments
      const recentPayments = paymentIntents.data.filter(pi => {
        if (pi.status !== 'succeeded') return false;
        const created = new Date(pi.created * 1000);
        const daysSince = (now - created) / (1000 * 60 * 60 * 24);
        return daysSince <= 30; // Bookings in last 30 days
      });
      currentBookings = recentPayments.length;

      // Calculate revenue
      paymentIntents.data.forEach(pi => {
        if (pi.status === 'succeeded') {
          const amount = pi.amount / 100; // Convert from cents
          totalRevenue += amount;
          
          const created = new Date(pi.created * 1000);
          if (created >= startOfMonth) {
            monthlyRevenue += amount;
          }
        }
      });
    } catch (stripeError) {
      console.warn('Could not fetch Stripe statistics:', stripeError.message);
      // Continue with zero values if Stripe fails
    }

    res.json({
      success: true,
      statistics: {
        totalProperties,
        availableProperties,
        totalBookings,
        currentBookings,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
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
    
    const newProperty = {
      ...req.body,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
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
    
    properties[index] = {
      ...properties[index],
      ...req.body,
      id: parseInt(id),
      updatedAt: new Date().toISOString()
    };
    
    await fs.writeFile(PROPERTIES_FILE, JSON.stringify(properties, null, 2));
    
    console.log('✅ Property updated:', id);
    res.json({ success: true, property: properties[index] });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ error: 'Failed to update property' });
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
    
    const deletedProperty = properties.splice(index, 1)[0];
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
