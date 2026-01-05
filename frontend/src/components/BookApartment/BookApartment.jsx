import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { startOfDay, endOfDay } from 'date-fns';
import PriceDisplay from '../PriceDisplay/PriceDisplay';
import { useProperties } from '../../contexts/PropertiesContext';
import { getImageUrlWithFallback } from '../../utils/imageUtils';
import './BookApartment.css';

const BookApartment = ({ onNavigate, onViewDetails, onBookNow, searchParams }) => {
  const { properties: allProperties, getBookedDates } = useProperties();
  const [properties, setProperties] = useState([]); // This state holds the currently displayed (filtered) properties
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [videoError, setVideoError] = useState(false);

  // Calculator form state
  const [calculatorForm, setCalculatorForm] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: 1
  });
  const [activeBookedDates, setActiveBookedDates] = useState([]);
  const [searchResults, setSearchResults] = useState(null);

  // Initial load - always load all properties first
  useEffect(() => {
    setProperties(allProperties);
    setLoading(false);
  }, [allProperties]);

  // Handle search parameters when they change
  useEffect(() => {
    if (searchParams && Object.keys(searchParams).length > 0) {
      applySearchFilters(searchParams);
    } else {
      // Reset to all properties if no search params
      setProperties(allProperties);
      setSearchResults(null);
    }
  }, [searchParams, allProperties]);

  // Apply search filters from SearchFilter component
  const applySearchFilters = (filters) => {
    let filteredProperties = [...allProperties];

    // Filter by property type
    if (filters.propertyType && filters.propertyType !== 'All Types') {
      filteredProperties = filteredProperties.filter(property =>
        property.title.toLowerCase().includes(filters.propertyType.toLowerCase()) ||
        filters.propertyType.toLowerCase() === 'apartment' // All our properties are apartments
      );
    }

    // Filter by city/location
    if (filters.city && filters.city !== 'All Cities') {
      filteredProperties = filteredProperties.filter(property =>
        property.area.toLowerCase().includes(filters.city.toLowerCase()) ||
        property.location.toLowerCase().includes(filters.city.toLowerCase()) ||
        property.title.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    // Filter by bedrooms
    if (filters.bedrooms && filters.bedrooms !== 'Any Bedrooms') {
      const bedroomCount = parseInt(filters.bedrooms);
      filteredProperties = filteredProperties.filter(property =>
        property.bedrooms >= bedroomCount
      );
    }

    // Filter by bathrooms
    if (filters.bathrooms && filters.bathrooms !== 'Any Bathrooms') {
      const bathroomCount = parseInt(filters.bathrooms);
      filteredProperties = filteredProperties.filter(property =>
        property.bathrooms >= bathroomCount
      );
    }

    // Filter by price range
    if (filters.minPrice && filters.minPrice !== 'Min Price') {
      const minPrice = parseInt(filters.minPrice);
      filteredProperties = filteredProperties.filter(property =>
        property.price >= minPrice
      );
    }

    if (filters.maxPrice && filters.maxPrice !== 'Max Price') {
      const maxPrice = parseInt(filters.maxPrice);
      filteredProperties = filteredProperties.filter(property =>
        property.price <= maxPrice
      );
    }

    // Update properties with filtered results
    setProperties(filteredProperties);

    // Set search results summary
    setSearchResults({
      destination: filters.city || 'All areas',
      checkIn: '',
      checkOut: '',
      guests: 1,
      nights: 1,
      totalResults: filteredProperties.length,
      averagePrice: filteredProperties.length > 0
        ? Math.round(filteredProperties.reduce((sum, prop) => sum + prop.price, 0) / filteredProperties.length)
        : 0
    });

    // Scroll to properties section
    setTimeout(() => {
      const propertiesSection = document.querySelector('.properties-section');
      if (propertiesSection) {
        propertiesSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleBookNow = (property) => {
    // Show booking modal to collect details first
    setSelectedProperty(property);
    setShowBookingModal(true);
  };

  const handleViewDetails = (property) => {
    // Navigate to property details page when property is clicked
    if (onNavigate) {
      onNavigate('property-details', property);
    }
  };

  const handleBookingSubmit = async (bookingData) => {
    try {
      // Create booking data for payment page
      // Ensure all property flags are preserved (especially excludeCleaningFee)
      const paymentBookingData = {
        ...selectedProperty,
        excludeCleaningFee: selectedProperty?.excludeCleaningFee || false, // Explicitly preserve flag
        excludeDiscount: selectedProperty?.excludeDiscount || false, // Explicitly preserve flag
        bookingData: {
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          guests: bookingData.guests,
          name: bookingData.name,
          email: bookingData.email,
          phone: bookingData.phone
        },
        totalPrice: bookingData.totalPrice,
        pricingBreakdown: bookingData.pricingBreakdown
      };

      // Close modal and navigate to payment page
      setShowBookingModal(false);
      setSelectedProperty(null);

      // Pass booking data to parent component for payment
      if (onBookNow) {
        onBookNow(paymentBookingData);
      }
    } catch (error) {
      console.error('Booking submission error:', error);
      alert('❌ An error occurred. Please try again.');
    }
  };

  // Calculator form handlers
  // Fetch booked dates for calculator if a specific property matches the destination
  useEffect(() => {
    const matchedProperty = properties.find(p =>
      p.title.toLowerCase().includes(calculatorForm.destination.toLowerCase())
    );

    if (matchedProperty && getBookedDates) {
      const fetchDates = async () => {
        const dates = await getBookedDates(matchedProperty.id);
        const formattedDates = dates.map(range => {
          const [sYear, sMonth, sDay] = range.checkIn.split('-').map(Number);
          const [eYear, eMonth, eDay] = range.checkOut.split('-').map(Number);
          return {
            start: new Date(sYear, sMonth - 1, sDay, 0, 0, 0),
            end: new Date(eYear, eMonth - 1, eDay, 23, 59, 59)
          };
        });
        setActiveBookedDates(formattedDates);
      };
      fetchDates();
    } else {
      setActiveBookedDates([]);
    }
  }, [calculatorForm.destination, properties, getBookedDates]);

  const handleCalculatorInputChange = (field, value) => {
    setCalculatorForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Smart search function that finds properties with flexible matching
  const smartPropertySearch = (searchTerm, property) => {
    if (!searchTerm) return true;

    const search = searchTerm.toLowerCase().trim();
    const searchWords = search.split(/\s+/);

    // Create a comprehensive search string from all property fields
    const searchableText = [
      property.title,
      property.area,
      property.location,
      property.highlights?.join(' '),
      property.slug,
      property.dtcm
    ].filter(Boolean).join(' ').toLowerCase();

    // Check for exact phrase match (highest priority)
    if (searchableText.includes(search)) {
      return { match: true, score: 100 };
    }

    // Check for individual word matches
    let matchScore = 0;
    let matchedWords = 0;

    searchWords.forEach(word => {
      if (word.length > 2) { // Only consider words longer than 2 characters
        if (searchableText.includes(word)) {
          matchScore += 20;
          matchedWords++;
        }
      }
    });

    // Partial word matching for longer search terms
    if (search.length > 3) {
      searchWords.forEach(word => {
        if (word.length > 3) {
          // Check if any word in the property text contains this search word
          const propertyWords = searchableText.split(/\s+/);
          propertyWords.forEach(propWord => {
            if (propWord.includes(word) || word.includes(propWord)) {
              matchScore += 10;
            }
          });
        }
      });
    }

    // Special keyword mappings for common search terms
    const keywordMappings = {
      'urban': ['modern', 'retreat', 'oasis', 'downtown', 'city'],
      'oasis': ['retreat', 'urban', 'modern', 'luxury'],
      'marina': ['princess', 'dorra', 'bay', 'waterfront'],
      'princess': ['tower', 'marina', 'dubai'],
      'downtown': ['burj', 'khalifa', 'dubai mall', 'standpoint'],
      'palm': ['jumeirah', 'marina', 'residence'],
      'bright': ['spacious', 'comfy', 'modern'],
      'family': ['friendly', 'kids', 'play'],
      'luxury': ['elegant', 'premium', 'upscale'],
      'beach': ['waterfront', 'jbr', 'coastal'],
      'pool': ['swimming', 'infinity', 'outdoor'],
      'modern': ['contemporary', 'sleek', 'urban']
    };

    // Check keyword mappings
    Object.entries(keywordMappings).forEach(([keyword, synonyms]) => {
      if (search.includes(keyword)) {
        synonyms.forEach(synonym => {
          if (searchableText.includes(synonym)) {
            matchScore += 15;
          }
        });
      }
    });

    // Return match if we found any matches
    return { match: matchScore > 0, score: matchScore };
  };

  const handleCalculatorSearch = () => {
    // Validate form
    if (!calculatorForm.destination || !calculatorForm.checkIn || !calculatorForm.checkOut) {
      alert('Please fill in all required fields');
      return;
    }

    // Check if check-out is after check-in
    const checkInDate = new Date(calculatorForm.checkIn);
    const checkOutDate = new Date(calculatorForm.checkOut);

    if (checkOutDate <= checkInDate) {
      alert('Check-out date must be after check-in date');
      return;
    }

    // Use smart search to filter properties
    const searchResults = realProperties.map(property => ({
      property,
      searchResult: smartPropertySearch(calculatorForm.destination, property)
    }))
      .filter(result => result.searchResult.match)
      .sort((a, b) => b.searchResult.score - a.searchResult.score) // Sort by relevance
      .map(result => result.property);

    // Update properties list with filtered results
    setProperties(searchResults);

    // Calculate search results summary
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalResults = searchResults.length;
    const averagePrice = searchResults.length > 0
      ? Math.round(searchResults.reduce((sum, prop) => sum + prop.price, 0) / searchResults.length)
      : 0;

    setSearchResults({
      destination: calculatorForm.destination,
      checkIn: calculatorForm.checkIn,
      checkOut: calculatorForm.checkOut,
      guests: calculatorForm.guests,
      nights,
      totalResults,
      averagePrice
    });

    // Scroll to properties section
    const propertiesSection = document.querySelector('.properties-section');
    if (propertiesSection) {
      propertiesSection.scrollIntoView({ behavior: 'smooth' });
    }

    console.log('Smart search completed:', {
      searchTerm: calculatorForm.destination,
      resultsFound: totalResults,
      searchResults: searchResults.map(p => p.title)
    });
  };

  const handleClearFilters = () => {
    setCalculatorForm({
      destination: '',
      checkIn: '',
      checkOut: '',
      guests: 1
    });

    // Reset to all properties
    setProperties(realProperties);
    setSearchResults(null);
  };

  return (
    <div className="book-apartment">
      {/* Hero Video Section */}
      <div className="hero-video-section">
        <div className="video-container">
          {!videoError ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="hero-video"
              onError={(e) => {
                console.error('Video failed to load:', e.target.src);
                setVideoError(true);
              }}
              onLoadStart={() => console.log('Video loading started')}
              onCanPlay={() => console.log('Video can play')}
            >
              <source src="/Images/IMG_1646.MP4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="video-fallback">
              <div className="fallback-bg"></div>
              <p style={{ color: 'white', textAlign: 'center', padding: '2rem' }}>
                Video unavailable - showing background
              </p>
            </div>
          )}
          <div className="video-overlay">
            <div className="video-content">
              <h1>Book Your Apartments in Dubai for a Luxurious Stay</h1>
              <p>Experience luxury accommodations in Dubai</p>
            </div>
          </div>
        </div>
      </div>

      {/* Explore Luxury Apartments Section */}
      <section className="book-explore-section">
        <div className="container">
          <h2>Explore Luxury Apartments for Rent in Dubai</h2>
          <p>
            Our apartments are designed to provide the perfect combination of style, comfort, and convenience. Whether you are looking for a modern apartment for rent in Dubai Marina, a cozy apartment in Jumeirah, or a high-rise penthouse in Downtown Dubai, we have options that meet your expectations.
          </p>
        </div>
      </section>

      {/* Calculator Section */}
      <div className="calculator-section">
        <div className="container">
          <div className="calculator-form">
            <h2>Calculate Your Stay</h2>
            <div className="calculator-fields">
              <div className="calc-field">
                <label>Destination/Area</label>
                <input
                  type="text"
                  placeholder="Where to in Dubai?"
                  value={calculatorForm.destination}
                  onChange={(e) => handleCalculatorInputChange('destination', e.target.value)}
                  list="destination-suggestions"
                />
                <datalist id="destination-suggestions">
                  <option value="Dubai Marina" />
                  <option value="Palm Jumeirah" />
                  <option value="Downtown Dubai" />
                  <option value="JBR Beach" />
                  <option value="Princess Tower" />
                  <option value="Urban Oasis" />
                  <option value="Dorra Bay" />
                  <option value="Marina Walk" />
                  <option value="Burj Khalifa" />
                  <option value="Dubai Mall" />
                  <option value="Modern Retreat" />
                  <option value="Family Friendly" />
                  <option value="Luxury Apartment" />
                  <option value="Waterfront" />
                  <option value="Beach View" />
                </datalist>
              </div>
              <div className="calc-field">
                <label>Check-in</label>
                <DatePicker
                  selected={calculatorForm.checkIn ? new Date(calculatorForm.checkIn) : null}
                  onChange={(date) => handleCalculatorInputChange('checkIn', date ? date.toISOString().split('T')[0] : '')}
                  selectsStart
                  startDate={calculatorForm.checkIn ? new Date(calculatorForm.checkIn) : null}
                  endDate={calculatorForm.checkOut ? new Date(calculatorForm.checkOut) : null}
                  minDate={startOfDay(new Date())}
                  excludeDateIntervals={activeBookedDates}
                  placeholderText="Select date"
                  className="calc-datepicker"
                />
              </div>
              <div className="calc-field">
                <label>Check-out</label>
                <DatePicker
                  selected={calculatorForm.checkOut ? new Date(calculatorForm.checkOut) : null}
                  onChange={(date) => handleCalculatorInputChange('checkOut', date ? date.toISOString().split('T')[0] : '')}
                  selectsEnd
                  startDate={calculatorForm.checkIn ? new Date(calculatorForm.checkIn) : null}
                  endDate={calculatorForm.checkOut ? new Date(calculatorForm.checkOut) : null}
                  minDate={calculatorForm.checkIn ? new Date(calculatorForm.checkIn) : startOfDay(new Date())}
                  excludeDateIntervals={activeBookedDates}
                  placeholderText="Select date"
                  className="calc-datepicker"
                />
              </div>
              <div className="calc-field">
                <label>Guests</label>
                <select
                  value={calculatorForm.guests}
                  onChange={(e) => handleCalculatorInputChange('guests', parseInt(e.target.value))}
                >
                  <option value={1}>1 Guest</option>
                  <option value={2}>2 Guests</option>
                  <option value={3}>3 Guests</option>
                  <option value={4}>4 Guests</option>
                  <option value={5}>5 Guests</option>
                  <option value={6}>6 Guests</option>
                </select>
              </div>
              <button className="calc-btn" onClick={handleCalculatorSearch}>
                Search
              </button>
            </div>
            <div className="calc-actions">
              <button className="clear-filters-btn" onClick={handleClearFilters}>
                Clear filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results Summary */}
      {searchResults && (
        <div className="search-results-summary">
          <div className="container">
            <div className="results-info">
              <h3>Search Results</h3>
              <div className="results-details">
                <span className="result-item">
                  <strong>{searchResults.destination || 'All areas'}</strong>
                </span>
                <span className="result-item">
                  {searchResults.checkIn} to {searchResults.checkOut}
                </span>
                <span className="result-item">
                  {searchResults.nights} night{searchResults.nights !== 1 ? 's' : ''}
                </span>
                <span className="result-item">
                  {searchResults.guests} guest{searchResults.guests !== 1 ? 's' : ''}
                </span>
                <span className="result-item">
                  {searchResults.totalResults} propert{searchResults.totalResults !== 1 ? 'ies' : 'y'} found
                </span>
                {searchResults.averagePrice > 0 && (
                  <span className="result-item price">
                    Avg: AED {searchResults.averagePrice}/night
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Properties Grid */}
      <div className="properties-section">
        <div className="container">
          <h2 className="properties-heading">{searchResults ? 'Available Properties' : 'Book an Apartment'}</h2>
          {loading ? (
            <div className="loading-state">
              <div className="skeleton-grid">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="skeleton-card"></div>
                ))}
              </div>
            </div>
          ) : properties.length === 0 && searchResults ? (
            <div className="no-results-state">
              <div className="no-results-content">
                <h3>No properties found for "{searchResults.destination}"</h3>
                <p>Try searching with different terms or browse all available properties:</p>
                <div className="search-suggestions">
                  <h4>Popular searches:</h4>
                  <div className="suggestion-tags">
                    <button
                      className="suggestion-tag"
                      onClick={() => {
                        setCalculatorForm(prev => ({ ...prev, destination: 'Dubai Marina' }));
                        setTimeout(() => handleCalculatorSearch(), 100);
                      }}
                    >
                      Dubai Marina
                    </button>
                    <button
                      className="suggestion-tag"
                      onClick={() => {
                        setCalculatorForm(prev => ({ ...prev, destination: 'Princess Tower' }));
                        setTimeout(() => handleCalculatorSearch(), 100);
                      }}
                    >
                      Princess Tower
                    </button>
                    <button
                      className="suggestion-tag"
                      onClick={() => {
                        setCalculatorForm(prev => ({ ...prev, destination: 'Downtown Dubai' }));
                        setTimeout(() => handleCalculatorSearch(), 100);
                      }}
                    >
                      Downtown Dubai
                    </button>
                    <button
                      className="suggestion-tag"
                      onClick={() => {
                        setCalculatorForm(prev => ({ ...prev, destination: 'Urban Oasis' }));
                        setTimeout(() => handleCalculatorSearch(), 100);
                      }}
                    >
                      Urban Oasis
                    </button>
                    <button
                      className="suggestion-tag"
                      onClick={() => {
                        setCalculatorForm(prev => ({ ...prev, destination: 'Luxury' }));
                        setTimeout(() => handleCalculatorSearch(), 100);
                      }}
                    >
                      Luxury
                    </button>
                    <button
                      className="suggestion-tag"
                      onClick={() => {
                        setCalculatorForm(prev => ({ ...prev, destination: 'Family' }));
                        setTimeout(() => handleCalculatorSearch(), 100);
                      }}
                    >
                      Family Friendly
                    </button>
                  </div>
                </div>
                <button
                  className="show-all-properties-btn"
                  onClick={handleClearFilters}
                >
                  Show All Properties
                </button>
              </div>
            </div>
          ) : (
            <div className="properties-grid">
              {properties.map(property => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onBookNow={handleBookNow}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FAQs Section */}
      <section className="book-faqs-section">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          <div className="faqs-list-book">
            <div className="faq-item-book">
              <h3>1. How do I book an apartment in Dubai?</h3>
              <p>Use our online search tool to select your dates, filter your preferences, and complete the booking instantly.</p>
            </div>
            <div className="faq-item-book">
              <h3>2. Can I book apartments for short stays?</h3>
              <p>Yes, we offer flexible booking options for both short-term and long-term stays.</p>
            </div>
            <div className="faq-item-book">
              <h3>3. Are the apartments fully furnished?</h3>
              <p>All apartments are fully furnished and equipped with modern amenities for a comfortable stay.</p>
            </div>
            <div className="faq-item-book">
              <h3>4. Can I find family-friendly apartments?</h3>
              <p>Yes, we offer family-friendly apartments with multiple bedrooms, kitchens, and entertainment facilities.</p>
            </div>
            <div className="faq-item-book">
              <h3>5. How do I know the property is safe and verified?</h3>
              <p>Every listing is inspected and verified to ensure safety, hygiene, and comfort for all guests.</p>
            </div>
            <div className="faq-item-book">
              <h3>6. Can I make multiple bookings for group stays?</h3>
              <p>Absolutely, our platform allows multiple bookings for families, corporate groups, or large parties.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="book-cta-section">
        <div className="container">
          <h2>Ready to Book Your Apartments in Dubai?</h2>
          <p>
            Experience the best of Dubai with YGI Holiday Homes. Our verified listings, premium locations, and seamless booking platform make it easy to find and reserve your ideal apartment.
          </p>
          <p>
            Book your apartments in Dubai today and enjoy a luxurious, hassle-free stay with all the comforts of home.
          </p>
        </div>
      </section>


      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          property={selectedProperty}
          onClose={() => setShowBookingModal(false)}
          onSubmit={handleBookingSubmit}
        />
      )}
    </div>
  );
};


// Property Card Component
const PropertyCard = ({ property, onBookNow, onViewDetails }) => {
  // Get all image URLs with fallbacks
  const getImageUrls = () => {
    if (!property.images || property.images.length === 0) return [];

    const urls = [];
    property.images.forEach(img => {
      // Handle both string URLs and object format {url: "...", category: "..."}
      const imagePath = typeof img === 'string' ? img : (img?.url || img?.originalUrl || '');
      if (imagePath) {
        // Clean the image path first to remove any query parameters
        let cleanPath = imagePath;
        if (cleanPath.includes('?')) {
          cleanPath = cleanPath.split('?')[0];
        }
        const url = getImageUrlWithFallback(cleanPath);
        if (url) {
          // Ensure the final URL is clean (no query parameters)
          const finalUrl = url.includes('?') ? url.split('?')[0] : url;
          urls.push(finalUrl);
        }
      }
    });
    return urls;
  };

  const imageUrls = getImageUrls();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Use refs to track image loading state and prevent infinite loops
  const imageIndexRef = useRef(0);
  const isHandlingErrorRef = useRef(false);
  const imgRef = useRef(null);

  // Reset state when property changes
  useEffect(() => {
    imageIndexRef.current = 0;
    setCurrentImageIndex(0);
    setImageError(false);
    isHandlingErrorRef.current = false;
  }, [property.id]);

  const handleImageError = (e) => {
    // Prevent multiple simultaneous error handler calls
    if (isHandlingErrorRef.current) {
      return;
    }

    isHandlingErrorRef.current = true;
    const img = e.target;
    const currentIndex = imageIndexRef.current;
    const nextIndex = currentIndex + 1;

    // Try next image in the array if available
    if (nextIndex < imageUrls.length) {
      let nextUrl = imageUrls[nextIndex];
      // Ensure URL is clean (remove any query parameters that might have been added)
      if (nextUrl.includes('?')) {
        nextUrl = nextUrl.split('?')[0];
      }
      console.log(`🔄 Trying next image (${nextIndex + 1}/${imageUrls.length}) for "${property.title}":`, nextUrl);

      // Update ref and state
      imageIndexRef.current = nextIndex;
      setCurrentImageIndex(nextIndex);

      // Update src immediately to try next image (ensure it's clean)
      img.src = nextUrl;

      // Reset error handler flag after a short delay to allow the new image to load
      setTimeout(() => {
        isHandlingErrorRef.current = false;
      }, 100);
      return;
    }

    // All images failed - show placeholder
    console.warn(`❌ All images failed to load for "${property.title}". Tried ${currentIndex + 1} image(s)`);
    setImageError(true);
    img.onerror = null; // Prevent infinite loop
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
    img.style.objectFit = 'contain';
    isHandlingErrorRef.current = false;
  };

  // Ensure the current image URL is clean (no query parameters)
  const currentImageUrl = imageUrls.length > 0 && !imageError
    ? (imageUrls[currentImageIndex]?.includes('?')
      ? imageUrls[currentImageIndex].split('?')[0]
      : imageUrls[currentImageIndex])
    : '';

  return (
    <article className="property-card">
      <div className="property-image">
        {currentImageUrl ? (
          <img
            ref={imgRef}
            key={`${property.id}-img`}
            src={currentImageUrl}
            alt={property.title}
            crossOrigin="anonymous"
            data-tried-index={currentImageIndex}
            onError={handleImageError}
            onLoad={() => {
              console.log(`✅ Image loaded for "${property.title}":`, currentImageUrl);
              isHandlingErrorRef.current = false; // Reset on successful load
            }}
          />
        ) : (
          <div className="no-image-placeholder">
            <span>Image not available</span>
          </div>
        )}
        {property.featured && <span className="badge featured">Featured</span>}
        <div className="rating-badge">
          <span className="star">★</span>
          <span>{property.rating}</span>
        </div>
      </div>

      <div className="property-content">
        <h3 className="property-title">{property.title}</h3>

        <div className="property-meta">
          <span>👥 {property.guests}</span>
          <span>🛏 {property.beds}</span>
          <span>🛁 {property.bathrooms}</span>
        </div>

        <p className="property-location">{property.location}</p>

        <div className="property-highlights">
          {property.highlights.slice(0, 2).map((highlight, index) => (
            <span key={index} className="highlight-tag">{highlight}</span>
          ))}
        </div>

        <div className="property-dtcm">
          <span className="dtcm-code">DTCM: {property.dtcm}</span>
        </div>

        <div className="property-price">
          <span className="price-label">From</span>
          <PriceDisplay
            price={property.price}
            showPeriod={true}
            period="/ night"
            size="small"
            className="price-amount"
          />
        </div>

        <div className="property-actions">
          <button
            className="btn-secondary"
            onClick={() => onViewDetails(property)}
          >
            View Details
          </button>
          <button
            className="btn-primary"
            onClick={() => onBookNow(property)}
          >
            Book Now
          </button>
        </div>
      </div>
    </article>
  );
};

// Booking Modal Component
const BookingModal = ({ property, onClose, onSubmit }) => {
  const { getBookedDates } = useProperties();
  const [bookedDates, setBookedDates] = useState([]);
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    checkIn: null,
    checkOut: null,
    guests: 1
  });

  // Fetch booked dates on mount
  useEffect(() => {
    if (property?.id && getBookedDates) {
      const fetchDates = async () => {
        const dates = await getBookedDates(property.id);
        const formattedDates = dates.map(range => {
          const [sYear, sMonth, sDay] = range.checkIn.split('-').map(Number);
          const [eYear, eMonth, eDay] = range.checkOut.split('-').map(Number);
          return {
            start: new Date(sYear, sMonth - 1, sDay, 0, 0, 0),
            end: new Date(eYear, eMonth - 1, eDay, 23, 59, 59)
          };
        });
        setBookedDates(formattedDates);
      };
      fetchDates();
    }
  }, [property?.id, getBookedDates]);


  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!bookingData.checkIn || !bookingData.checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }

    if (!bookingData.name || !bookingData.email || !bookingData.phone) {
      alert('Please fill in all contact information (name, email, and phone)');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Validate dates
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      alert('Check-in date cannot be in the past');
      return;
    }

    if (checkOut <= checkIn) {
      alert('Check-out date must be after check-in date');
      return;
    }

    const pricing = getPricingDetails();

    if (pricing.finalTotal <= 0) {
      alert('Please select valid dates for booking');
      return;
    }

    onSubmit({
      ...bookingData,
      checkIn: bookingData.checkIn.toISOString().split('T')[0],
      checkOut: bookingData.checkOut.toISOString().split('T')[0],
      propertyId: property.id,
      totalPrice: pricing.finalTotal,
      pricingBreakdown: pricing
    });
  };

  const calculateBaseTotal = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;

    const nights = Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24));
    if (nights <= 0) return 0;

    const basePrice = property.price * nights;
    const cleaningFee = property.excludeCleaningFee ? 0 : 400;
    const taxes = basePrice * 0.08;
    return basePrice + cleaningFee + taxes;
  };

  const getPricingDetails = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) {
      return {
        nights: 0,
        basePrice: 0,
        cleaningFee: 0,
        taxes: 0,
        subtotal: 0,
        automaticDiscount: 0,
        finalTotal: 0
      };
    }

    const nights = Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24));
    const basePrice = property.price * nights;
    const cleaningFee = property.excludeCleaningFee ? 0 : 400;
    const taxes = basePrice * 0.08;
    const subtotal = basePrice + cleaningFee + taxes;

    // Apply automatic dynamic discount (skip if property excludes discount)
    const discountRate = property.discountPercentage !== undefined ? property.discountPercentage : 30;
    const automaticDiscount = property.excludeDiscount ? 0 : subtotal * (discountRate / 100);
    const finalTotal = subtotal - automaticDiscount;

    return {
      nights,
      basePrice,
      cleaningFee,
      taxes,
      subtotal,
      automaticDiscount,
      discountAmount: 0,
      finalTotal,
      discountPercentage: discountRate
    };
  };

  return (
    <div className="booking-modal-overlay" style={{ pointerEvents: 'auto' }}>
      <div className="booking-modal" style={{ pointerEvents: 'auto' }}>
        <div className="modal-header">
          <h2>Book {property.title}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="booking-form" style={{ pointerEvents: 'auto' }}>
          <div className="booking-dates">
            <div className="date-field">
              <label>Check-in</label>
              <DatePicker
                selected={bookingData.checkIn}
                onChange={(date) => setBookingData(prev => ({ ...prev, checkIn: date }))}
                selectsStart
                startDate={bookingData.checkIn}
                endDate={bookingData.checkOut}
                minDate={new Date()}
                excludeDateIntervals={bookedDates}
                placeholderText="Select date"
                required
              />
            </div>
            <div className="date-field">
              <label>Check-out</label>
              <DatePicker
                selected={bookingData.checkOut}
                onChange={(date) => setBookingData(prev => ({ ...prev, checkOut: date }))}
                selectsEnd
                startDate={bookingData.checkIn}
                endDate={bookingData.checkOut}
                minDate={bookingData.checkIn || new Date()}
                excludeDateIntervals={bookedDates}
                placeholderText="Select date"
                required
              />
            </div>
            <div className="date-field">
              <label>Guests</label>
              <select
                value={bookingData.guests}
                onChange={(e) => setBookingData(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                required
              >
                <option value={1}>1 Guest</option>
                <option value={2}>2 Guests</option>
                <option value={3}>3 Guests</option>
                <option value={4}>4 Guests</option>
                <option value={5}>5+ Guests</option>
              </select>
            </div>
          </div>

          <div className="contact-info">
            <h3>Contact Information</h3>
            <div className="form-group">
              <label htmlFor="booking-name">Full Name</label>
              <input
                id="booking-name"
                name="name"
                type="text"
                value={bookingData.name}
                onChange={(e) => {
                  e.stopPropagation();
                  setBookingData(prev => ({ ...prev, name: e.target.value }));
                }}
                onInput={(e) => {
                  e.stopPropagation();
                  setBookingData(prev => ({ ...prev, name: e.target.value }));
                }}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                required
                autoComplete="name"
                tabIndex={1}
                readOnly={false}
                disabled={false}
                style={{
                  pointerEvents: 'auto',
                  cursor: 'text',
                  zIndex: 10000,
                  position: 'relative'
                }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="booking-email">Email</label>
              <input
                id="booking-email"
                name="email"
                type="email"
                value={bookingData.email}
                onChange={(e) => {
                  e.stopPropagation();
                  setBookingData(prev => ({ ...prev, email: e.target.value }));
                }}
                onInput={(e) => {
                  e.stopPropagation();
                  setBookingData(prev => ({ ...prev, email: e.target.value }));
                }}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                required
                autoComplete="email"
                tabIndex={2}
                readOnly={false}
                disabled={false}
                style={{
                  pointerEvents: 'auto',
                  cursor: 'text',
                  zIndex: 10000,
                  position: 'relative'
                }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="booking-phone">Phone</label>
              <input
                id="booking-phone"
                name="phone"
                type="tel"
                value={bookingData.phone}
                onChange={(e) => {
                  e.stopPropagation();
                  setBookingData(prev => ({ ...prev, phone: e.target.value }));
                }}
                onInput={(e) => {
                  e.stopPropagation();
                  setBookingData(prev => ({ ...prev, phone: e.target.value }));
                }}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                required
                autoComplete="tel"
                tabIndex={3}
                readOnly={false}
                disabled={false}
                style={{
                  pointerEvents: 'auto',
                  cursor: 'text',
                  zIndex: 10000,
                  position: 'relative'
                }}
              />
            </div>
          </div>

          <div className="booking-summary">
            <h3>Booking Summary</h3>
            {(() => {
              const pricing = getPricingDetails();
              return (
                <>
                  <div className="summary-line">
                    <span>
                      <PriceDisplay price={property.price} size="small" /> × {pricing.nights} nights
                    </span>
                    <PriceDisplay price={pricing.basePrice} size="small" />
                  </div>
                  {pricing.cleaningFee > 0 && (
                    <div className="summary-line">
                      <span>Cleaning fee</span>
                      <PriceDisplay price={pricing.cleaningFee} size="small" />
                    </div>
                  )}
                  <div className="summary-line">
                    <span>Service charges</span>
                    <PriceDisplay price={pricing.taxes} size="small" />
                  </div>

                  {!property.excludeDiscount && (
                    <div className="summary-line subtotal">
                      <span>Subtotal</span>
                      <PriceDisplay price={pricing.subtotal} size="small" />
                    </div>
                  )}

                  {/* Automatic 30% Discount - Only show if property doesn't exclude discount */}
                  {!property.excludeDiscount && pricing.automaticDiscount > 0 && (
                    <div className="summary-line discount automatic-discount">
                      <span className="discount-label">
                        🎉 Special Offer ({pricing.discountPercentage}% OFF)
                      </span>
                      <span className="discount-amount">
                        -<PriceDisplay price={pricing.automaticDiscount} size="small" />
                      </span>
                    </div>
                  )}

                  <div className="summary-line total">
                    <span>Total</span>
                    <PriceDisplay price={pricing.finalTotal} size="medium" className="price-primary" />
                  </div>

                  {!property.excludeDiscount && pricing.automaticDiscount > 0 && (
                    <div className="savings-badge automatic-savings">
                      💰 You saved <PriceDisplay price={pricing.automaticDiscount} size="small" /> with our special {pricing.discountPercentage}% offer!
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          <button type="submit" className="confirm-booking-btn">
            Confirm Booking
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookApartment;
