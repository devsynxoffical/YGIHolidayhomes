import React, { useState } from 'react';
import './PropertyDetails.css';

const PropertyDetails = ({ property, onNavigate, onBookNow }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 4
  });
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  // Add a simple loading state
  const [isLoading, setIsLoading] = useState(false);
  
  React.useEffect(() => {
    // Component mounted
  }, []);

  // Princess Tower property data
  const princessTowerProperty = {
    id: 1,
    title: "2BR in Princess Tower | Furnished | Close to Metro",
    area: "Dubai Marina",
    bedrooms: 2,
    bathrooms: 2,
    guests: 4,
    beds: 3,
    price: 800,
    rating: 4.8,
    dtcm: "DUB-PRI-YJVVG",
    sleeps: "3 beds",
    featured: true,
    new: true,
    images: [
      // Living Room Images
      "/2BR in Princess Tower  Furnished  Close to Metro/Living Room/12996379-3a7c-46ce-bb22-678686ede8f9.jpeg",
      "/2BR in Princess Tower  Furnished  Close to Metro/Living Room/2384c853-b9d4-426a-837d-bcd7d3857fb8.avif",
      "/2BR in Princess Tower  Furnished  Close to Metro/Living Room/2888347b-5c04-494e-af82-8d4ad6decd5b.avif",
      "/2BR in Princess Tower  Furnished  Close to Metro/Living Room/37272c9f-acf9-445e-b387-4b47eae7b50f.avif",
      "/2BR in Princess Tower  Furnished  Close to Metro/Living Room/53328143-3754-473d-b80d-dd50bc93b3bb.jpeg",
      "/2BR in Princess Tower  Furnished  Close to Metro/Living Room/53404ea3-5a99-4bc3-9cef-a0ff8b6f4071.avif",
      "/2BR in Princess Tower  Furnished  Close to Metro/Living Room/6f108955-6072-458c-9036-6f7d84946aa0.avif",
      "/2BR in Princess Tower  Furnished  Close to Metro/Living Room/7fb70c61-6d8e-4259-8f2a-fb3f5ad93705.avif",
      "/2BR in Princess Tower  Furnished  Close to Metro/Living Room/921e9809-51a8-4354-8752-c2bfb6293689.avif",
      "/2BR in Princess Tower  Furnished  Close to Metro/Living Room/d1ff2713-d44e-47a7-b314-ee10f7e92850.avif",
      "/2BR in Princess Tower  Furnished  Close to Metro/Living Room/dd19c01f-1e10-4a0b-870f-36428c76b4d2.jpeg",
      
      // Bedroom 1 Images
      "/2BR in Princess Tower  Furnished  Close to Metro/BR1/188031da-df38-49ab-ac71-ccdd65a7c1e4.jpeg",
      "/2BR in Princess Tower  Furnished  Close to Metro/BR1/18dd0183-b98c-43b7-ade7-cf40e8cb40f9.avif",
      "/2BR in Princess Tower  Furnished  Close to Metro/BR1/4f9c3cc5-a5e4-4bd5-a37a-bea70f2d19a8.avif",
      "/2BR in Princess Tower  Furnished  Close to Metro/BR1/523150b9-19d3-45fd-aa8b-58d70d60ba56.avif",
      "/2BR in Princess Tower  Furnished  Close to Metro/BR1/5d7888e5-f563-4e46-844e-cae6ee9eab4b.avif",
      
      // Bedroom 2 Images
      "/2BR in Princess Tower  Furnished  Close to Metro/BR2/027f21fd-508e-4174-a894-fe6eb0a9b03e.avif",
      "/2BR in Princess Tower  Furnished  Close to Metro/BR2/2479f095-e549-4208-9f24-189906d73efe.avif",
      "/2BR in Princess Tower  Furnished  Close to Metro/BR2/6bfa0b99-6311-4df1-8c62-036db358498f.jpeg",
      "/2BR in Princess Tower  Furnished  Close to Metro/BR2/c07fb509-8b34-46c4-a977-05de26559633.avif",
      "/2BR in Princess Tower  Furnished  Close to Metro/BR2/c8516ca1-6792-4703-bd02-521d35e0862b.avif",
      
      // Dining Room Images
      "/2BR in Princess Tower  Furnished  Close to Metro/Dinning Room/0228c67d-90b3-4b4f-bf8e-37c57f9f58a4.jpeg",
      "/2BR in Princess Tower  Furnished  Close to Metro/Dinning Room/0d30c8e1-ed10-49b3-aac2-1c426f5f575c.avif",
      "/2BR in Princess Tower  Furnished  Close to Metro/Dinning Room/21179480-837d-472e-9f74-5b0789150607.avif",
      "/2BR in Princess Tower  Furnished  Close to Metro/Dinning Room/a5e52420-17a8-4fc4-907e-dea30ed31064.avif",
      "/2BR in Princess Tower  Furnished  Close to Metro/Dinning Room/a78a0936-19ea-4a57-b98b-0363e397bbfb.jpeg",
      "/2BR in Princess Tower  Furnished  Close to Metro/Dinning Room/be92771a-630d-413f-ae6c-182ec4342ae6.jpeg",
      
      // Kitchen Images
      "/2BR in Princess Tower  Furnished  Close to Metro/kitchen/01695d3d-0834-4278-8fb7-4e894ba2f90c.avif",
      "/2BR in Princess Tower  Furnished  Close to Metro/kitchen/f3609b97-580e-442c-a4de-ee5451820042.avif",
      
      // Bathroom Images
      "/2BR in Princess Tower  Furnished  Close to Metro/Bathroom 1/3e9b7f83-4a3e-42df-8760-c036b8fe79e1.avif",
      "/2BR in Princess Tower  Furnished  Close to Metro/Bathroom 1/9146b978-86ec-4ca9-8875-838b009b6df0.avif",
      "/2BR in Princess Tower  Furnished  Close to Metro/Bathroom2/10590021-6aa7-478b-8981-c6a8dc76655e.avif",
      
      // Balcony Images
      "/2BR in Princess Tower  Furnished  Close to Metro/Balcony/0122b155-7516-46f9-b4d0-d86d930260e0.avif",
      "/2BR in Princess Tower  Furnished  Close to Metro/Balcony/303c3ae4-b3ba-4b74-b3f6-5db38f134707.avif",
      "/2BR in Princess Tower  Furnished  Close to Metro/Balcony/6c873a87-3972-4b68-a78b-4240b7d4ff62.avif",
      "/2BR in Princess Tower  Furnished  Close to Metro/Balcony/d4515d2f-90e3-417d-9fbc-b6c4f35a2c59.jpeg",
      
      // Other Pictures
      "/2BR in Princess Tower  Furnished  Close to Metro/Otherpics/1f543d1b-b1c5-48a1-8a5a-ff32903e6586.jpeg",
      "/2BR in Princess Tower  Furnished  Close to Metro/Otherpics/8f6adf3c-23a4-46a1-b3ef-d00259b29dda.avif",
      "/2BR in Princess Tower  Furnished  Close to Metro/Otherpics/cd388680-f4d7-402f-9a76-f27db853c2c8.avif",
      "/2BR in Princess Tower  Furnished  Close to Metro/Otherpics/d869b25f-343f-417e-9c89-74749a71d0b8.avif",
      "/2BR in Princess Tower  Furnished  Close to Metro/Otherpics/effc3776-654e-48f3-8343-0b47334ed1bf.avif"
    ],
    location: "Princess Tower, Dubai Marina",
    highlights: [
      "Self check-in (smartlock)",
      "Indoor & outdoor pools", 
      "Gym & kids' play area",
      "24/7 security & concierge",
      "Allocated parking",
      "Prime Dubai Marina location"
    ],
    description: "Princess Tower, in the heart of Dubai Marina, is the world's tallest residential building. This bright, fully furnished 2-bedroom apartment offers sweeping day-and-night views with the tram a short stroll away. Beneath the tower you'll find everyday markets and cafés along the Marina. Marina Mall and JBR Beach are close by, and the iconic Palm Jumeirah is just ahead, making this a perfect base for your Dubai stay.",
    space: {
      kitchen: "Fully equipped — dishwasher, fridge, cooktop, microwave, toaster, cookware & utensils.",
      living: "Sunny lounge with clean linen and quiet ambience.",
      facilities: "🏊‍♀️ Indoor/outdoor pools · 🛝 Kids' play · 🏋️‍♂️ Gym · 🎱 Games area · 👮‍♂️ 24/7 security & concierge · 🚗 Allocated parking."
    },
    sleeping: [
      { room: "Bedroom 1", beds: "1 Queen bed" },
      { room: "Bedroom 2", beds: "2 Single beds" },
      { room: "Bathrooms", beds: "2 full baths" }
    ],
    access: [
      { place: "Tram", time: "~3 min walk" },
      { place: "Marina Walk", time: "2–3 min walk" },
      { place: "SkyDive Dubai", time: "~10 min walk" },
      { place: "Barasti Beach", time: "~5 min walk" }
    ],
    rules: [
      "DTCM requirement: Valid Passport/Emirates ID for all guests prior to check-in; building security registration required.",
      "Check-in: 3:00 PM–8:00 PM · Check-out: before 11:00 AM",
      "Max guests: 4",
      "Safety: Smoke alarm & CO alarm present."
    ],
     amenities: [
       "Beach access", "Kitchen", "Wi-Fi", "Free parking", "Pool", "Elevator", 
       "Washer", "Air conditioning", "Bathtub", "Private balcony/patio",
       "Gym", "Kids play area", "24/7 Security", "Concierge", "Smart lock",
       "Dishwasher", "Microwave", "Coffee maker", "Balcony", "City view",
       "Cable TV", "Hair dryer", "Iron", "Towels", "Bed linens", "Dining area",
       "Refrigerator", "Stove", "Oven", "Dishes and silverware", "Cooking basics",
       "Hot water", "Private entrance", "Long term stays allowed", "Laptop friendly workspace",
       "Carbon monoxide alarm", "Smoke alarm", "First aid kit", "Fire extinguisher"
     ],
    host: {
      name: "Alpha Homes",
      rating: 5.0,
      responseRate: "100%",
      responseTime: "<1h",
      bio: "Professional property management with over 5 years of experience in Dubai Marina. We ensure every guest has a memorable stay."
    },
    coordinates: { lat: 25.0769, lng: 55.1378 },
    reviews: [
      {
        id: 1,
        name: "Sarah M.",
        rating: 5,
        date: "2024-01-15",
        comment: "Amazing location and beautiful apartment. The view of Dubai Marina was incredible! The smart lock check-in was so convenient."
      },
      {
        id: 2,
        name: "Ahmed K.",
        rating: 4,
        date: "2024-01-10",
        comment: "Great place to stay. Clean and well-equipped. The pools and gym facilities were excellent. Would definitely book again."
      },
      {
        id: 3,
        name: "Emma L.",
        rating: 5,
        date: "2024-01-08",
        comment: "Perfect for families! The kids loved the play area and pools. Location is fantastic - walking distance to Marina Walk and tram."
      }
    ],
    policies: {
      cancellation: "Free cancellation for 48 hours. After that, cancel before 3:00 PM on Nov 27 for a partial refund.",
      houseRules: "No smoking, No pets, No parties or events, Check-in after 3:00 PM, Check-out before 11:00 AM"
    },
    availability: {
      checkIn: "3:00 PM - 8:00 PM",
      checkOut: "Before 11:00 AM",
      minNights: 1,
      maxNights: 30
    }
  };

  // Merge property data with default data
  const mockProperty = property ? {
    ...princessTowerProperty,
    ...property,
    // Override specific fields if they exist in the passed property
    title: property.title || princessTowerProperty.title,
    area: property.area || princessTowerProperty.area,
    bedrooms: property.bedrooms || princessTowerProperty.bedrooms,
    bathrooms: property.bathrooms || princessTowerProperty.bathrooms,
    bathroomType: property.bathroomType || princessTowerProperty.bathroomType,
    guests: property.guests || princessTowerProperty.guests,
    beds: property.beds || princessTowerProperty.beds,
    price: property.price || princessTowerProperty.price,
    rating: property.rating || princessTowerProperty.rating,
    dtcm: property.dtcm || princessTowerProperty.dtcm,
    location: property.location || princessTowerProperty.location,
    images: property.images || princessTowerProperty.images,
    highlights: property.highlights || princessTowerProperty.highlights,
    // Prioritize the sleeps field from passed property
    sleeps: property.sleeps ? property.sleeps : princessTowerProperty.sleeps,
    // Clear the default sleeping array if sleeps field is provided
    sleeping: property.sleeps ? [] : (property.sleeping || princessTowerProperty.sleeping),
    // Generate rules dynamically based on the property's guest limit
    rules: [
      "DTCM requirement: Valid Passport/Emirates ID for all guests prior to check-in; building security registration required.",
      "Check-in: 3:00 PM–8:00 PM · Check-out: before 11:00 AM",
      `Max guests: ${property.guests || princessTowerProperty.guests}`,
      "Safety: Smoke alarm & CO alarm present."
    ]
  } : princessTowerProperty;

  // Ensure we always have a property to render
  if (!mockProperty) {
    return (
      <div className="property-details">
        <div className="container">
          <div className="error-state">
            <h2>Property not found</h2>
            <p>Sorry, we couldn't find the property you're looking for.</p>
            <button onClick={() => onNavigate('book')}>Back to Properties</button>
          </div>
        </div>
      </div>
    );
  }

  const calculateTotal = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    const nights = Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24));
    const basePrice = mockProperty.price * nights;
    const cleaningFee = 400;
    const taxes = basePrice * 0.08;
    return basePrice + cleaningFee + taxes;
  };

  const handleBookNow = () => {
    const bookingDataForPayment = {
      ...mockProperty,
      bookingData,
      totalPrice: calculateTotal()
    };
    
    onBookNow(bookingDataForPayment);
  };

  return (
    <div className="property-details">
      <div className="container">
        {/* Debug Info */}
        
        {/* Back Button */}
        <button 
          className="back-btn"
          onClick={() => onNavigate('book')}
        >
          ← Back to Properties
        </button>

        {/* Photo Preview Section */}
        <div className="photo-preview-section">
          <div className="photo-preview-grid">
            {/* Main Large Photo */}
            <div className="main-photo">
              <img 
                src={mockProperty.images[selectedImage]} 
                alt={mockProperty.title}
                onError={(e) => {
                  console.error('Image failed to load:', e.target.src);
                  e.target.src = '/Images/hero1.avif'; // Fallback image
                }}
              />
              <div className="gallery-badges">
                {mockProperty.new && <span className="badge new">New</span>}
                {mockProperty.featured && <span className="badge featured">Featured</span>}
                <div className="rating-badge">
                  <span className="star">★</span>
                  <span>{mockProperty.rating}</span>
                </div>
              </div>
            </div>
            
            {/* Thumbnail Grid */}
            <div className="thumbnail-grid">
              {mockProperty.images.slice(1, 8).map((image, index) => (
                <div 
                  key={index} 
                  className="thumbnail-item"
                  onClick={() => setSelectedImage(index + 1)}
                >
                  <img
                    src={image}
                    alt={`${mockProperty.title} ${index + 2}`}
                    className={selectedImage === index + 1 ? 'active' : ''}
                    onError={(e) => {
                      console.error('Thumbnail failed to load:', e.target.src);
                      e.target.src = '/Images/hero1.avif'; // Fallback image
                    }}
                  />
                </div>
              ))}
              
              {/* Show All Photos Button */}
              <div className="show-all-photos-btn" onClick={() => onNavigate('property-photos')}>
                <div className="btn-content">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21,15 16,10 5,21"/>
                  </svg>
                  <span className="btn-text">View All</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="details-content">
          {/* Main Content */}
          <div className="main-content">
            {/* Header Block */}
            <div className="property-header">
              <h1>{mockProperty.title}</h1>
              <p className="property-subline">
                {mockProperty.location} · <strong>DTCM:</strong> {mockProperty.dtcm}
              </p>
              <div className="quick-facts">
                <span>👥 {mockProperty.guests} guests</span>
                <span>🛏 {mockProperty.sleeps || `${mockProperty.beds} beds`}</span>
                <span>🛁 {mockProperty.bathroomType || `${mockProperty.bathrooms} baths`}</span>
                <span>🏢 Entire rental unit</span>
              </div>
            </div>

            {/* Highlights */}
            <div className="highlights-section">
              <h3>Highlights</h3>
              <div className="highlights-grid">
                {mockProperty.highlights.map((highlight, index) => (
                  <div key={index} className="highlight-pill">
                    {highlight}
                  </div>
                ))}
              </div>
              <p className="highlights-microcopy">
                Tram, Marina Walk, shops, and restaurants are minutes away. JBR Beach & Marina Mall nearby; Palm Jumeirah a short drive.
              </p>
            </div>

            {/* About this home */}
            <div className="about-section">
              <h3>About this home</h3>
              <p>{mockProperty.description}</p>
            </div>

            {/* The space */}
            <div className="space-section">
              <h3>The space</h3>
              <div className="space-details">
                <div className="space-item">
                  <strong>Kitchen:</strong> {mockProperty.space.kitchen}
                </div>
                <div className="space-item">
                  <strong>Living:</strong> {mockProperty.space.living}
                </div>
                <div className="space-item">
                  <strong>Facilities:</strong> {mockProperty.space.facilities}
                </div>
              </div>
            </div>

             {/* Sleeping arrangements */}
             <div className="sleeping-section">
               <h3>Sleeping arrangements</h3>
               <div className="sleeping-grid">
                 {mockProperty.sleeps ? (
                   <div className="sleeping-item">
                     <strong>Beds:</strong> {mockProperty.sleeps}
                   </div>
                 ) : (
                   mockProperty.sleeping.map((room, index) => (
                     <div key={index} className="sleeping-item">
                       <strong>{room.room}:</strong> {room.beds}
                     </div>
                   ))
                 )}
                 {mockProperty.bathroomType && (
                   <div className="sleeping-item">
                     <strong>Bathrooms:</strong> {mockProperty.bathroomType}
                   </div>
                 )}
               </div>
             </div>

            {/* Guest access */}
            <div className="access-section">
              <h3>Guest access</h3>
              <p>Excellent connectivity:</p>
              <div className="access-grid">
                {mockProperty.access.map((item, index) => (
                  <div key={index} className="access-item">
                    <strong>{item.place}:</strong> {item.time}
                  </div>
                ))}
              </div>
              <p>Easy public transport access across Dubai.</p>
            </div>

            {/* Things to know */}
            <div className="rules-section">
              <h3>Things to know (DTCM & rules)</h3>
              <ul className="rules-list">
                {mockProperty.rules.map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ul>
            </div>

            {/* Amenities */}
            <div className="amenities-section">
              <h3>Amenities</h3>
              <div className="amenities-grid">
                {mockProperty.amenities.slice(0, 10).map((amenity, index) => (
                  <div key={index} className="amenity-item">
                    <span className="amenity-icon">✓</span>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
              <button 
                className="show-all-amenities"
                onClick={() => setShowAllAmenities(true)}
              >
                Show all {mockProperty.amenities.length} amenities
              </button>
            </div>

            {/* Location */}
            <div className="location-section">
              <h3>Location</h3>
              <div className="location-info">
                <p>📍 {mockProperty.location}</p>
                <p>Nearby: {mockProperty.nearby || 'Marina Walk, JBR Beach, Marina Mall, Palm Jumeirah'}</p>
              </div>
              <div className="map-container">
                <div style={{ 
                  height: '400px', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  border: '2px solid #e9ecef',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🗺️</div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#333', fontSize: '1.2rem' }}>📍 {mockProperty.location}</h4>
                    <p style={{ margin: '0 0 1rem 0', color: '#666' }}>Interactive map view</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <a 
                        href={`https://www.google.com/maps/search/${encodeURIComponent(mockProperty.location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ 
                          color: '#0FA968', 
                          textDecoration: 'none',
                          padding: '12px 24px',
                          border: '2px solid #0FA968',
                          borderRadius: '8px',
                          display: 'inline-block',
                          fontWeight: '600',
                          backgroundColor: 'white',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = '#0FA968';
                          e.target.style.color = 'white';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = 'white';
                          e.target.style.color = '#0FA968';
                        }}
                      >
                        🗺️ View on Google Maps
                      </a>
                      <a 
                        href={`https://www.google.com/maps/dir//${encodeURIComponent(mockProperty.location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ 
                          color: '#666', 
                          textDecoration: 'none',
                          padding: '12px 24px',
                          border: '2px solid #666',
                          borderRadius: '8px',
                          display: 'inline-block',
                          fontWeight: '600',
                          backgroundColor: 'white',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = '#666';
                          e.target.style.color = 'white';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = 'white';
                          e.target.style.color = '#666';
                        }}
                      >
                        🧭 Get Directions
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="reviews-section">
              <h3>Reviews</h3>
              <div className="reviews-summary">
                <div className="rating-overview">
                  <span className="overall-rating">{mockProperty.rating}</span>
                  <div className="rating-stars">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`star ${i < Math.floor(mockProperty.rating) ? 'filled' : ''}`}>★</span>
                    ))}
                  </div>
                  <span className="review-count">({mockProperty.reviews.length} reviews)</span>
                </div>
              </div>
              
              <div className="reviews-list">
                {mockProperty.reviews.map(review => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <span className="reviewer-name">{review.name}</span>
                        <div className="review-rating">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`star ${i < review.rating ? 'filled' : ''}`}>★</span>
                          ))}
                        </div>
                      </div>
                      <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>


            {/* Policies */}
            <div className="policies-section">
              <h3>Policies</h3>
              <div className="policies-content">
                <div className="policy-item">
                  <h4>Cancellation policy</h4>
                  <p>{mockProperty.policies.cancellation}</p>
                </div>
                <div className="policy-item">
                  <h4>House rules</h4>
                  <p>{mockProperty.policies.houseRules}</p>
                </div>
                <div className="policy-item">
                  <h4>Check-in & Check-out</h4>
                  <p>Check-in: {mockProperty.availability.checkIn} · Check-out: {mockProperty.availability.checkOut}</p>
                </div>
              </div>
              <button className="view-full-policy-btn" onClick={() => setShowPolicyModal(true)}>View full policy</button>
            </div>
          </div>

          {/* Sticky Booking Module */}
          <div className="booking-sidebar">
            <div className="booking-card">
              <div className="price-section">
                <span className="price-amount">AED {mockProperty.price}</span>
                <span className="price-unit">/ night</span>
              </div>

              <div className="booking-form">
                <div className="date-inputs">
                  <div className="input-group">
                    <label>Check-in</label>
                    <input
                      type="date"
                      value={bookingData.checkIn}
                      onChange={(e) => setBookingData(prev => ({ ...prev, checkIn: e.target.value }))}
                    />
                  </div>
                  <div className="input-group">
                    <label>Check-out</label>
                    <input
                      type="date"
                      value={bookingData.checkOut}
                      onChange={(e) => setBookingData(prev => ({ ...prev, checkOut: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Guests</label>
                  <select
                    value={bookingData.guests}
                    onChange={(e) => setBookingData(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                  >
                    <option value={1}>1 Guest</option>
                    <option value={2}>2 Guests</option>
                    <option value={3}>3 Guests</option>
                    <option value={4}>4 Guests</option>
                    <option value={5}>5 Guests</option>
                    <option value={6}>6 Guests</option>
                  </select>
                </div>

                {bookingData.checkIn && bookingData.checkOut ? (
                  <div className="price-breakdown">
                    <div className="breakdown-line">
                      <span>AED {mockProperty.price} × {Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24))} nights</span>
                      <span>AED {mockProperty.price * Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24))}</span>
                    </div>
                    <div className="breakdown-line">
                      <span>Cleaning fee</span>
                      <span>AED 400</span>
                    </div>
                    <div className="breakdown-line">
                      <span>Service charges</span>
                      <span>AED {(mockProperty.price * Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24)) * 0.08).toFixed(2)}</span>
                    </div>
                    <div className="breakdown-line total">
                      <span>Total</span>
                      <span>AED {calculateTotal().toFixed(0)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="calendar-empty-state">Add your dates to see the exact price</p>
                )}

                <button 
                  className="book-now-btn"
                  onClick={handleBookNow}
                  disabled={!bookingData.checkIn || !bookingData.checkOut}
                >
                  Book Now
                </button>
                <p className="booking-note">You won't be charged yet</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Amenities Modal */}
      {showAllAmenities && (
        <div className="amenities-modal" onClick={() => setShowAllAmenities(false)}>
          <div className="amenities-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="amenities-modal-header">
              <h2>Amenities</h2>
              <button 
                className="amenities-modal-close"
                onClick={() => setShowAllAmenities(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <div className="amenities-modal-grid">
              {mockProperty.amenities.map((amenity, index) => (
                <div key={index} className="amenity-modal-item">
                  <span className="amenity-icon">✓</span>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Policy Modal */}
      {showPolicyModal && (
        <div className="policy-modal" onClick={() => setShowPolicyModal(false)}>
          <div className="policy-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="policy-modal-header">
              <h2>Full Property Policies</h2>
              <button 
                className="policy-modal-close"
                onClick={() => setShowPolicyModal(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <div className="policy-modal-body">
              <div className="policy-section">
                <h3>Cancellation Policy</h3>
                <p>{mockProperty.policies.cancellation}</p>
                <p>Please note that cancellation terms may vary based on booking date and length of stay. For bookings during peak seasons (Dec-Mar), stricter cancellation policies may apply.</p>
              </div>

              <div className="policy-section">
                <h3>House Rules</h3>
                <ul>
                  <li>No smoking anywhere in the property</li>
                  <li>No pets allowed</li>
                  <li>No parties or events</li>
                  <li>Quiet hours: 10 PM - 7 AM</li>
                  <li>Maximum occupancy: {mockProperty.guests} guests</li>
                  <li>Check-in: {mockProperty.availability.checkIn}</li>
                  <li>Check-out: {mockProperty.availability.checkOut}</li>
                </ul>
              </div>

              <div className="policy-section">
                <h3>Safety & Property</h3>
                <ul>
                  <li>Smoke alarm and carbon monoxide alarm are installed</li>
                  <li>First aid kit is available</li>
                  <li>Security cameras are present in common areas (lobby, elevators)</li>
                  <li>Building has 24/7 security</li>
                </ul>
              </div>

              <div className="policy-section">
                <h3>Additional Information</h3>
                <ul>
                  <li>Property is professionally cleaned before each stay</li>
                  <li>Linens and towels are provided</li>
                  <li>Kitchen is fully equipped with cookware and utensils</li>
                  <li>Wi-Fi password will be provided upon check-in</li>
                  <li>Parking space is allocated and included</li>
                  <li>Pool and gym access hours: 6 AM - 10 PM</li>
                </ul>
              </div>

              <div className="policy-section">
                <h3>Check-in Process</h3>
                <p>Self check-in with smart lock. You'll receive detailed instructions and access codes 24 hours before your arrival. Property manager is available for assistance if needed.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;
