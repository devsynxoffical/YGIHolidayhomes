import React, { useState, useEffect } from 'react';
import { getImageUrlWithFallback } from '../../utils/imageUtils';
import './PropertyDetails.css';

const PropertyDetails = ({ property, onNavigate, onBookNow }) => {
  const [activeImage, setActiveImage] = useState(0);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    name: '',
    email: '',
    phone: ''
  });

  // Calculate discount and totals (for display only - discount will be applied in booking page)
  const calculateTotal = () => {
    if (!bookingData.checkIn || !bookingData.checkOut || !property) return 0;
    const start = new Date(bookingData.checkIn);
    const end = new Date(bookingData.checkOut);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (nights < 1) return 0;

    // Use original price - discount will be applied on booking page
    const basePrice = property.price * nights;
    const cleaningFee = property.excludeCleaningFee ? 0 : 400;
    const serviceFee = basePrice * 0.08;
    const subtotal = basePrice + cleaningFee + serviceFee;

    // Apply 30% discount for display only (if property doesn't exclude discount)
    const discount = property.excludeDiscount ? 0 : subtotal * 0.30;
    return subtotal - discount;
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();

    // Validate dates
    if (!bookingData.checkIn || !bookingData.checkOut) {
      alert("Please select check-in and check-out dates.");
      return;
    }

    // Structure data to match Payment component expectations
    // Pass ORIGINAL price - discount will be applied in BookApartment component
    // Explicitly preserve all property flags
    const paymentData = {
      ...property, // Include all property details (price, title, etc.) - use original price
      excludeCleaningFee: property?.excludeCleaningFee || false, // Explicitly preserve flag
      excludeDiscount: property?.excludeDiscount || false, // Explicitly preserve flag
      bookingData: {
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: bookingData.guests,
        // Optional fields that Payment.jsx handles defaults for
        name: bookingData.name,
        email: bookingData.email,
        phone: bookingData.phone
      }
    };

    onBookNow(paymentData);
  };

  if (!property) {
    return <div className="property-loading">Loading property details...</div>;
  }

  return (
    <div className="property-details-page">
      {/* Hero Section - Image Grid */}
      <section className="property-hero">
        <div className="property-gallery-grid">
          <div className="main-image">
            {property.images && property.images.length > 0 ? (
              <img 
                src={getImageUrlWithFallback(property.images[0])} 
                alt={property.title}
                crossOrigin="anonymous"
                onError={(e) => {
                  // Fallback to placeholder if all attempts fail
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
                  e.target.style.objectFit = 'contain';
                }}
              />
            ) : (
              <div className="placeholder-image">No Image Available</div>
            )}
            <div className="hero-badges-overlay">
              {property.featured && <span className="hero-badge featured">Featured</span>}
              {property.new && <span className="hero-badge new">New</span>}
            </div>
          </div>
          <div className="side-images">
            {property.images && property.images.slice(1, 5).map((img, index) => (
              <div key={index} className="side-image-item">
                <img 
                  src={getImageUrlWithFallback(img)} 
                  alt={`View ${index + 1}`}
                  crossOrigin="anonymous"
                  onError={(e) => {
                    // Fallback to placeholder if all attempts fail
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
                    e.target.style.objectFit = 'contain';
                  }}
                />
              </div>
            ))}
          </div>

          <button className="view-all-photos-btn" onClick={() => onNavigate('property-photos', property)}>
            Show all photos
          </button>
        </div>
      </section>

      <div className="property-container">
        {/* Main Content Column */}
        <div className="property-main-content">
          {/* Header Info */}
          <div className="property-header">
            {/* Badges moved to Hero Image Overlay */}
            <h1 className="property-title">{property.title}</h1>
            <div className="property-meta">
              <span className="location">📍 {property.location}</span>
              <span className="rating">★ {property.rating} ({property.reviews?.length || 0} reviews)</span>
            </div>
          </div>

          <hr className="divider" />

          {/* Quick Stats */}
          <div className="property-stats">
            <div className="stat-item">
              <span className="stat-icon">👥</span>
              <span>{property.guests} Guests</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🛏️</span>
              <span>{property.bedrooms} Bedrooms</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🛌</span>
              <span>{property.beds} Beds</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🚿</span>
              <span>{property.bathrooms} Baths</span>
            </div>
          </div>

          <hr className="divider" />

          {/* Description */}
          <section className="property-section description-section">
            <h2>About this place</h2>
            <p className="description-text">{property.description}</p>

            {property.space && (
              <div className="space-details">
                <h3>The space</h3>
                <ul>
                  {property.space.living && <li><strong>Living:</strong> {property.space.living}</li>}
                  {property.space.kitchen && <li><strong>Kitchen:</strong> {property.space.kitchen}</li>}
                  {property.space.facilities && <li><strong>Facilities:</strong> {property.space.facilities}</li>}
                </ul>
              </div>
            )}
          </section>

          <hr className="divider" />

          {/* Amenities */}
          <section className="property-section amenities-section">
            <h2>What this place offers</h2>
            <div className="amenities-grid">
              {(property.amenities ? (showAllAmenities ? property.amenities : property.amenities.slice(0, 10)) : []).map((amenity, idx) => (
                <div key={idx} className="amenity-item">
                  <span className="check-icon">✓</span> {amenity}
                </div>
              ))}
            </div>
            {property.amenities && property.amenities.length > 10 && (
              <button
                className="show-more-btn"
                onClick={() => setShowAllAmenities(!showAllAmenities)}
              >
                {showAllAmenities ? 'Show less' : `Show all ${property.amenities.length} amenities`}
              </button>
            )}

            {/* Guest Access & Notes */}
            {property.guestAccess && (
              <div className="property-subsection" style={{ marginTop: '24px' }}>
                <h3>Guest access</h3>
                <p className="description-text">{property.guestAccess}</p>
              </div>
            )}

            {property.otherNotes && (
              <div className="property-subsection" style={{ marginTop: '24px' }}>
                <h3>Other notes</h3>
                <p className="description-text">{property.otherNotes}</p>
              </div>
            )}
          </section>

          <hr className="divider" />

          {/* Location */}
          <section className="property-section location-section">
            <h2>Where you'll be</h2>
            <p className="location-text">{property.location}</p>
            <div className="map-placeholder">
              {/* In a real app, this would be a Google Map component */}
              <div className="map-mockup">
                <span>📍 Map View of {property.area}</span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="map-link-btn"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
          </section>

          <hr className="divider" />

          {/* Reviews */}
          <section className="property-section reviews-section">
            <h2>Reviews</h2>
            <div className="review-stats-large">
              <span className="star-large">★</span>
              <span className="rating-large">{property.rating}</span>
              <span className="dot">·</span>
              <span className="count-large">{property.reviews?.length || 0} reviews</span>
            </div>
            <div className="reviews-grid">
              {property.reviews?.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="avatar-placeholder">{review.name.charAt(0)}</div>
                    <div className="reviewer-details">
                      <span className="reviewer-name">{review.name}</span>
                      <span className="review-date">{review.date}</span>
                    </div>
                  </div>
                  <div className="review-body">
                    {review.comment}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <hr className="divider" />

          {/* Policies */}
          <section className="property-section policies-section">
            <h2>Things to know</h2>
            <div className="policies-grid">
              <div className="policy-col">
                <h3>House rules</h3>
                <p>{property.policies?.houseRules || "Check-in after 3:00 PM"}</p>
                <p>{property.guests} guests maximum</p>
              </div>
              <div className="policy-col">
                <h3>Cancellation policy</h3>
                <p>{property.policies?.cancellation || "Free cancellation for 48 hours."}</p>
              </div>
            </div>

            {(property.rules && property.rules.length > 0) && (
              <div className="additional-rules" style={{ marginTop: '24px' }}>
                <h3>Additional Rules</h3>
                <ul style={{ paddingLeft: '20px', color: '#444' }}>
                  {property.rules.map((rule, idx) => (
                    <li key={idx} style={{ marginBottom: '8px' }}>{rule}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar - Booking Widget */}
        <div className="property-sidebar">
          <div className="booking-widget-card">
            <div className="widget-header">
              <div className="price-display">
                {property.id !== 4 ? (
                  <>
                    <span className="amount original-price" style={{ textDecoration: 'line-through', fontSize: '16px', color: '#888', marginRight: '8px' }}>
                      AED {property.price}
                    </span>
                    <span className="amount discounted-price" style={{ color: '#e51d53' }}>
                      AED {(property.price * 0.7).toFixed(0)}
                    </span>
                  </>
                ) : (
                  <span className="amount">AED {property.price}</span>
                )}
                <span className="unit"> / night</span>
              </div>
              <div className="rating-mini">
                ★ {property.rating}
              </div>
            </div>

            <div className="booking-inputs">
              <div className="date-picker-row">
                <div className="date-input-group">
                  <label>CHECK-IN</label>
                  <input
                    type="date"
                    value={bookingData.checkIn}
                    onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })}
                  />
                </div>
                <div className="date-input-group">
                  <label>CHECKOUT</label>
                  <input
                    type="date"
                    value={bookingData.checkOut}
                    onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })}
                  />
                </div>
              </div>
              <div className="guests-input-group">
                <label>GUESTS</label>
                <select
                  value={bookingData.guests}
                  onChange={(e) => setBookingData({ ...bookingData, guests: parseInt(e.target.value) })}
                >
                  {[...Array(property.guests)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1} guest{i !== 0 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contact Details Inputs */}
            <div className="contact-input-group" style={{ padding: '10px', borderTop: '1px solid #aaa' }}>
              <input
                type="text"
                placeholder="Full Name"
                value={bookingData.name}
                onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                className="booking-input-field"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={bookingData.email}
                onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                className="booking-input-field"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={bookingData.phone}
                onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                className="booking-input-field"
              />
            </div>

            <button className="pro-book-btn" onClick={handleBookingSubmit}>
              Reserve
            </button>
            <p className="no-charge-text">You won't be charged yet</p>

            {bookingData.checkIn && bookingData.checkOut && (() => {
              const nights = Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24));
              const basePrice = property.price * nights;
              const cleaningFee = property.excludeCleaningFee ? 0 : 400;
              const taxes = basePrice * 0.08;
              const subtotal = basePrice + cleaningFee + taxes;
              const discount = property.excludeDiscount ? 0 : subtotal * 0.30;
              const total = subtotal - discount;
              
              return (
                <div className="price-calculation">
                  <div className="calc-row">
                    <span>
                      AED {property.price} x {nights} nights
                    </span>
                    <span>
                      AED {basePrice.toFixed(0)}
                    </span>
                  </div>
                  {!property.excludeCleaningFee && (
                    <div className="calc-row">
                      <span>Cleaning fee</span>
                      <span>AED 400</span>
                    </div>
                  )}
                  <div className="calc-row">
                    <span>Service fee</span>
                    <span>
                      AED {taxes.toFixed(0)}
                    </span>
                  </div>
                  {!property.excludeDiscount && discount > 0 && (
                    <>
                      <div className="calc-row subtotal">
                        <span>Subtotal</span>
                        <span>AED {subtotal.toFixed(0)}</span>
                      </div>
                      <div className="calc-row discount">
                        <span>🎉 Special Offer (30% OFF)</span>
                        <span>-AED {discount.toFixed(0)}</span>
                      </div>
                    </>
                  )}
                  <hr />
                  <div className="calc-row total">
                    <span>Total</span>
                    <span>AED {total.toFixed(0)}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
