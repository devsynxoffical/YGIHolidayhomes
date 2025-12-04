# YGI Backend API

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file with:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 3. Get Your Stripe Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Secret Key** (starts with `sk_live_` for live mode)
3. Add it to your `.env` file

### 4. Run the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Check if server is running

### Payment Endpoints
- `POST /create-payment-intent` - Create a new payment intent
- `POST /confirm-payment` - Confirm a payment
- `GET /payment-status/:id` - Get payment status
- `POST /create-booking` - Create booking after successful payment

### Webhook
- `POST /webhook` - Stripe webhook for payment events

## Testing

Use these test card numbers:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Authentication**: 4000 0025 0000 3155

## Production Checklist

- [ ] Use live Stripe keys
- [ ] Set up webhook endpoints
- [ ] Add database integration
- [ ] Implement proper logging
- [ ] Add rate limiting
- [ ] Set up SSL certificate
