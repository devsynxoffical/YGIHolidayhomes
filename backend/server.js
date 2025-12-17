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

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(morgan('combined'));
// Define allowed origins
const allowedOrigins = [
  'http://localhost:5173',
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
    console.log('Booking created:', booking);

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
