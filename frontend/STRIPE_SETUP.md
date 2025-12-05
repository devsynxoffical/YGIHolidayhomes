# Stripe Payment Integration Setup

## 1. Get Your Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Publishable Key** (starts with `pk_test_` for test mode)
3. Copy your **Secret Key** (starts with `sk_test_` for test mode) - Keep this secure!

## 2. Environment Configuration

Create a `.env` file in the frontend directory with:

```
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

## 3. Backend Setup (Required for Production)

For production, you'll need a backend server to:
- Create Payment Intents
- Handle webhooks
- Process payments securely

### Example Backend Code (Node.js/Express):

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create Payment Intent
app.post('/create-payment-intent', async (req, res) => {
  const { amount, currency = 'aed' } = req.body;
  
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: currency,
    });
    
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

## 4. Update Payment Component

In `src/components/Payment/Payment.jsx`, update the payment processing to use your backend:

```javascript
// Replace the demo payment logic with:
const response = await fetch('/create-payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: bookingDetails.totalAmount })
});

const { clientSecret } = await response.json();

const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: paymentMethod.id
});
```

## 5. Test Cards

Use these test card numbers for testing:

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Authentication**: 4000 0025 0000 3155

## 6. Webhook Setup

Set up webhooks to handle payment events:
- Go to Stripe Dashboard > Webhooks
- Add endpoint: `https://yourdomain.com/webhook`
- Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`

## 7. Production Checklist

- [ ] Replace test keys with live keys
- [ ] Set up webhook endpoints
- [ ] Test with real payment methods
- [ ] Implement proper error handling
- [ ] Add logging and monitoring
- [ ] Set up SSL certificate

## 8. Security Notes

- Never expose your secret key in frontend code
- Always validate payments on your backend
- Use HTTPS in production
- Implement proper error handling
- Log all payment attempts
