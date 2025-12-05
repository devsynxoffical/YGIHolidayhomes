import { loadStripe } from '@stripe/stripe-js';

// Replace with your actual Stripe publishable key
// You can get this from your Stripe dashboard: https://dashboard.stripe.com/apikeys
const stripePublishableKey = 'pk_test_51234567890abcdef';

export const stripePromise = loadStripe(stripePublishableKey);

// Stripe configuration
export const stripeConfig = {
  // Your Stripe publishable key
  publishableKey: stripePublishableKey,
  
  // Currency settings
  currency: 'AED', // UAE Dirham
  currencySymbol: 'AED',
  
  // Payment settings
  paymentMethods: ['card'],
  
  // Appearance settings
  appearance: {
    theme: 'stripe',
    variables: {
      colorPrimary: '#0FA968',
      colorBackground: '#ffffff',
      colorText: '#0D3B2E',
      colorDanger: '#df1b41',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
    rules: {
      '.Input': {
        border: '2px solid #EAF7F1',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '16px',
      },
      '.Input:focus': {
        borderColor: '#0FA968',
        boxShadow: '0 0 0 3px rgba(15, 169, 104, 0.1)',
      },
      '.Label': {
        color: '#0D3B2E',
        fontWeight: '600',
        marginBottom: '8px',
      },
    },
  },
};

export default stripeConfig;
