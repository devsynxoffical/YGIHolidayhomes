import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { submitBookingToGoogleSheets } from '../../utils/googleSheets';
import './Payment.css';

// Initialize Stripe with environment variable
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_live_51RAZ1pDx3aQl1WbOuU3AvkSEOU0tEQiTkIKSvwrObhDgweCM0X8PWqowELKZ1dtRGCFcDFLb0NxDyfCWcwuqqkVk007vXj2nV1');

const PaymentForm = ({ bookingDetails, onPaymentSuccess, onPaymentError, bookingData }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Create payment intent on backend
      const backendUrl = import.meta.env.VITE_API_URL || 'https://ygiholidayhomes-production.up.railway.app';
      console.log('Backend URL:', backendUrl);

      const response = await fetch(`${backendUrl}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: bookingDetails.totalAmount,
          currency: 'aed',
          metadata: {
            propertyName: bookingDetails.propertyName,
            checkIn: bookingDetails.checkIn,
            checkOut: bookingDetails.checkOut,
            guests: bookingDetails.guests,
            guestName: bookingDetails.guestName,
            email: bookingDetails.email
          }
        }),
      });

      if (!response.ok) {
        const responseText = await response.text();
        console.error('Server error response:', responseText);
        throw new Error(`Server error: ${response.status} - ${responseText}`);
      }

      const responseText = await response.text();
      console.log('Backend response:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response was not JSON:', responseText);
        throw new Error(`Backend returned invalid JSON: ${responseText.substring(0, 100)}...`);
      }

      const { clientSecret, error: serverError } = responseData;

      if (serverError) {
        console.error('Payment intent creation error:', serverError);
        throw new Error(`Payment setup failed: ${serverError.message || serverError}`);
      }

      if (!clientSecret) {
        console.error('No client secret received from server');
        throw new Error('Payment setup failed: No client secret received');
      }

      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: bookingDetails.guestName,
            email: bookingDetails.email,
          },
        }
      });

      if (stripeError) {
        setPaymentError(stripeError.message);
        setIsProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Create booking record
        const bookingResponse = await fetch(`${import.meta.env.VITE_API_URL || 'https://ygiholidayhomes-production.up.railway.app'}/create-booking`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            ...bookingDetails
          }),
        });

        // Save booking details to Google Sheets
        try {
          const sheetsData = {
            propertyId: bookingData?.id || 'Unknown',
            propertyName: bookingDetails.propertyName,
            name: bookingDetails.guestName,
            email: bookingDetails.email,
            phone: bookingDetails.phone,
            checkIn: bookingDetails.checkIn,
            checkOut: bookingDetails.checkOut,
            guests: bookingDetails.guests,
            totalPrice: bookingDetails.totalAmount,
            paymentIntentId: paymentIntent.id,
            status: 'confirmed'
          };

          console.log('Submitting booking to Google Sheets:', sheetsData);
          const sheetsResult = await submitBookingToGoogleSheets(sheetsData);
          console.log('Google Sheets submission result:', sheetsResult);

          if (sheetsResult.success) {
            console.log('✅ Booking saved to Google Sheets successfully');
          } else {
            console.warn('⚠️ Google Sheets submission failed:', sheetsResult.message);
          }
        } catch (sheetsError) {
          console.error('❌ Error saving to Google Sheets:', sheetsError);
          // Don't fail the payment if Google Sheets fails
        }

        setPaymentSuccess(true);
        setIsProcessing(false);
        onPaymentSuccess(paymentIntent);
      }

    } catch (err) {
      console.error('Payment error:', err);
      setPaymentError('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="payment-success">
        <div className="success-icon">✓</div>
        <h2>Payment Successful!</h2>
        <p>Your booking has been confirmed. You will receive a confirmation email shortly.</p>
        <button
          className="btn btn-primary"
          onClick={() => window.location.href = '/'}
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="payment-section">
        <h3>Payment Details</h3>

        <div className="form-group">
          <label htmlFor="card-element">Card Information</label>
          <div className="card-element-container">
            <CardElement
              id="card-element"
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#0D3B2E',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                    '::placeholder': {
                      color: '#9CA3AF',
                    },
                  },
                  invalid: {
                    color: '#df1b41',
                  },
                },
              }}
            />
          </div>
        </div>

        {paymentError && (
          <div className="payment-error">
            {paymentError}
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className={`btn btn-primary payment-btn ${isProcessing ? 'processing' : ''}`}
        >
          {isProcessing ? 'Processing...' : `Pay AED ${bookingDetails.totalAmount}`}
        </button>
      </div>
    </form>
  );
};

const Payment = ({ onNavigate, bookingData }) => {
  // Use bookingData if provided, otherwise fallback to default values
  const [bookingDetails, setBookingDetails] = useState(() => {
    if (bookingData) {
      // Check if pricing breakdown is provided from BookingModal
      if (bookingData.pricingBreakdown) {
        const pricing = bookingData.pricingBreakdown;
        return {
          propertyName: bookingData.title,
          checkIn: bookingData.bookingData.checkIn,
          checkOut: bookingData.bookingData.checkOut,
          guests: bookingData.bookingData.guests,
          nights: pricing.nights,
          basePrice: bookingData.price,
          totalBasePrice: pricing.basePrice,
          taxes: pricing.taxes,
          cleaningFee: pricing.cleaningFee,
          subtotal: pricing.subtotal,
          automaticDiscount: pricing.automaticDiscount || 0,
          discountAmount: pricing.discountAmount,
          totalAmount: pricing.finalTotal,
          coupon: bookingData.coupon,
          guestName: bookingData.bookingData.name || 'Guest Name',
          email: bookingData.bookingData.email || 'guest@example.com',
          phone: bookingData.bookingData.phone || '+971501234567'
        };
      }

      // Fallback: Calculate pricing from booking data
      const nights = Math.ceil((new Date(bookingData.bookingData.checkOut) - new Date(bookingData.bookingData.checkIn)) / (1000 * 60 * 60 * 24));
      const basePrice = bookingData.price * nights;
      const taxes = basePrice * 0.08;
      const cleaningFee = bookingData.excludeCleaningFee ? 0 : 400;
      const subtotal = basePrice + taxes + cleaningFee;
      // Apply automatic 30% discount (skip if property excludes discount)
      const automaticDiscount = bookingData.excludeDiscount ? 0 : subtotal * 0.30;
      const totalAmount = subtotal - automaticDiscount;

      return {
        propertyName: bookingData.title,
        checkIn: bookingData.bookingData.checkIn,
        checkOut: bookingData.bookingData.checkOut,
        guests: bookingData.bookingData.guests,
        nights: nights,
        basePrice: bookingData.price,
        totalBasePrice: basePrice,
        taxes: taxes,
        cleaningFee: cleaningFee,
        subtotal: subtotal,
        automaticDiscount: automaticDiscount,
        totalAmount: totalAmount,
        discountAmount: 0,
        coupon: null,
        guestName: bookingData.bookingData.name || 'Guest Name',
        email: bookingData.bookingData.email || 'guest@example.com',
        phone: bookingData.bookingData.phone || '+971501234567'
      };
    }

    // Fallback default values
    return {
      propertyName: 'Luxury Dubai Apartment',
      checkIn: '2024-01-15',
      checkOut: '2024-01-20',
      guests: 2,
      nights: 5,
      basePrice: 500,
      totalBasePrice: 2500,
      taxes: 250,
      cleaningFee: 400,
      totalAmount: 2800,
      guestName: 'John Doe',
      email: 'john@example.com',
      phone: '+971501234567'
    };
  });

  const handlePaymentSuccess = (paymentMethod) => {
    console.log('Payment successful:', paymentMethod);
    // Here you would typically send the booking details to your backend
    // to create a booking record
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
  };

  return (
    <div className="payment-page">
      <div className="container">
        <div className="payment-header">
          <h1>Complete Your Booking</h1>
          <p>Review your booking details and complete payment</p>
        </div>

        <div className="payment-content">
          <div className="booking-summary">
            <h3>Booking Summary</h3>
            <div className="property-info">
              <h4>{bookingDetails.propertyName}</h4>
              <div className="booking-details">
                <div className="detail-row">
                  <span>Check-in:</span>
                  <span>{new Date(bookingDetails.checkIn).toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                  <span>Check-out:</span>
                  <span>{new Date(bookingDetails.checkOut).toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                  <span>Guests:</span>
                  <span>{bookingDetails.guests}</span>
                </div>
                <div className="detail-row">
                  <span>Nights:</span>
                  <span>{bookingDetails.nights}</span>
                </div>
              </div>
            </div>

            <div className="guest-info">
              <h4>Guest Information</h4>
              <div className="guest-details">
                <div className="detail-row">
                  <span>Name:</span>
                  <span>{bookingDetails.guestName}</span>
                </div>
                <div className="detail-row">
                  <span>Email:</span>
                  <span>{bookingDetails.email}</span>
                </div>
                <div className="detail-row">
                  <span>Phone:</span>
                  <span>{bookingDetails.phone}</span>
                </div>
              </div>
            </div>

            <div className="pricing-breakdown">
              <div className="price-row">
                <span>Base Price (AED {bookingDetails.basePrice}/night × {bookingDetails.nights} nights)</span>
                <span>AED {Math.round(bookingDetails.totalBasePrice)}</span>
              </div>
              <div className="price-row">
                <span>Cleaning Fee</span>
                <span>AED {bookingDetails.cleaningFee}</span>
              </div>
              <div className="price-row">
                <span>Service charges (8%)</span>
                <span>AED {Math.round(bookingDetails.taxes)}</span>
              </div>

              {bookingDetails.automaticDiscount > 0 && (
                <>
                  <div className="price-row subtotal-row">
                    <span>Subtotal</span>
                    <span>AED {Math.round(bookingDetails.subtotal || (bookingDetails.totalBasePrice + bookingDetails.cleaningFee + bookingDetails.taxes))}</span>
                  </div>

                  {/* Automatic 30% Discount */}
                  <div className="price-row discount-row automatic-discount">
                    <span className="discount-label">
                      🎉 Special Offer (30% OFF)
                    </span>
                    <span className="discount-amount">
                      -AED {Math.round(bookingDetails.automaticDiscount || ((bookingDetails.subtotal || (bookingDetails.totalBasePrice + bookingDetails.cleaningFee + bookingDetails.taxes)) * 0.30))}
                    </span>
                  </div>
                </>
              )}

              {bookingDetails.coupon && bookingDetails.discountAmount > 0 && (
                <div className="price-row discount-row coupon-discount">
                  <span className="discount-label">
                    🎉 Additional Discount ({bookingDetails.coupon.discount}%)
                    <small>{bookingDetails.coupon.code}</small>
                  </span>
                  <span className="discount-amount">
                    -AED {Math.round(bookingDetails.discountAmount)}
                  </span>
                </div>
              )}

              <div className="price-row total">
                <span>Total Amount</span>
                <span>AED {Math.round(bookingDetails.totalAmount)}</span>
              </div>

              {(bookingDetails.automaticDiscount || 0) > 0 && (
                <div className="savings-badge automatic-savings">
                  💰 You saved AED {Math.round((bookingDetails.automaticDiscount || ((bookingDetails.subtotal || (bookingDetails.totalBasePrice + bookingDetails.cleaningFee + bookingDetails.taxes)) * 0.30)) + (bookingDetails.discountAmount || 0))} with our special offer!
                </div>
              )}
            </div>
          </div>

          <div className="payment-section">
            <Elements stripe={stripePromise}>
              <PaymentForm
                bookingDetails={bookingDetails}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                bookingData={bookingData}
              />
            </Elements>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
