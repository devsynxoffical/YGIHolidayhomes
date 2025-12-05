import React, { useState } from 'react';
import { submitBookingToGoogleSheets } from '../../utils/googleSheets';
import SuccessModal from '../SuccessModal/SuccessModal';
import './RentProperty.css';

const RentProperty = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    propertyLocation: '',
    buildingName: '',
    bedrooms: '',
    furnished: '',
    preferredModel: '',
    message: '',
    consent: false
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [inquiryResult, setInquiryResult] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Prepare booking data for Google Sheets
      const bookingData = {
        propertyId: 'RENT_PROPERTY_INQUIRY',
        propertyName: 'Property Listing Inquiry',
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        checkIn: 'N/A',
        checkOut: 'N/A',
        guests: 1,
        totalPrice: 0,
        message: formData.message,
        propertyLocation: formData.propertyLocation,
        buildingName: formData.buildingName,
        bedrooms: formData.bedrooms,
        furnished: formData.furnished,
        preferredModel: formData.preferredModel
      };

      // Submit to Google Sheets
      const result = await submitBookingToGoogleSheets(bookingData);
      
      if (result.success) {
        // Set inquiry result and show success modal
        setInquiryResult({
          ...result,
          propertyName: 'Property Listing Inquiry',
          totalPrice: 0
        });
        setShowSuccessModal(true);
        
        // Reset form
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          propertyLocation: '',
          buildingName: '',
          bedrooms: '',
          furnished: '',
          preferredModel: '',
          message: '',
          consent: false
        });
      } else {
        // Show error message
        alert(`❌ Failed to submit your inquiry.\n\n${result.message || 'Please try again or contact us directly.'}`);
      }
    } catch (error) {
      console.error('Inquiry submission error:', error);
      alert('❌ An error occurred. Please try again or contact us directly.');
    }
  };

  return (
    <div className="rent-property">
      {/* Hero Section - Completely Redesigned */}
      <section className="rent-hero-new">
        <div className="hero-background-image"></div>
        <div className="hero-background-overlay"></div>
        <div className="container">
          <div className="hero-content-new">
            {/* Left Content */}
            <div className="hero-left">
              <h1 className="hero-title-new">
                <span className="title-highlight">EARN MORE</span>
                <span className="title-main">From Your Dubai Property</span>
                <span className="title-sub">With Our Expert Management</span>
              </h1>
              
              <div className="hero-stats">
                <div className="stat-item">
                  <div className="stat-number">25%</div>
                  <div className="stat-label">Higher Income</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">0</div>
                  <div className="stat-label">Management Hassle</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">Support</div>
                </div>
              </div>
              
                <div className="hero-ctas-new">
                  <button 
                    className="btn btn-primary-new"
                    onClick={() => onNavigate('contact')}
                  >
                    Book Free Consultation
                  </button>
                </div>
              
            </div>
            
            {/* Right Visual */}
            <div className="hero-right">
              <div className="hero-visual-container">
                <div className="main-property-card">
                  <div className="property-image">
                    <img src="/Images/66ded2500ba8686872db2330_RHONJ_S8E10-11_Casa Baglioni _1-topaz.avif" alt="Luxury Dubai apartment" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="welcome-section">
        <div className="container">
          <div className="welcome-content">
            <div className="welcome-text">
              <h2>List your Dubai property with YGI Holiday Homes</h2>
              <p>
                Welcome to YGI Holiday Homes! We transform your property into a profitable, fully-equipped home. 
                From furnishing and décor to tenant sourcing and maintenance, we deliver a turn-key experience.
              </p>
              <div className="perks-list">
                <div className="perk-item">
                  <div className="perk-icon">✓</div>
                  <span>Higher occupancy</span>
                </div>
                <div className="perk-item">
                  <div className="perk-icon">✓</div>
                  <span>Furnishing & décor set up</span>
                </div>
                <div className="perk-item">
                  <div className="perk-icon">✓</div>
                  <span>Transparency — no commission or hidden fees</span>
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => onNavigate('contact')}>BOOK A MEETING</button>
            </div>
            <div className="welcome-image">
              <img src="/Images/66deceb807bb4e3770db189e_RHONJ_S5E13_The Miraval Resort and Spa_1.avif" alt="Styled interior vignette" />
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="process-steps">
        <div className="container">
          <h2>Easy Steps to Partner with Us</h2>
          <div className="steps-rail">
            <div className="step-item">
              <div className="step-icon">1</div>
              <h3>Introduce Your Property</h3>
              <p>Provide details—photos, location, bedroom count.</p>
            </div>
            <div className="step-item">
              <div className="step-icon">2</div>
              <h3>Connect With Us</h3>
              <p>We'll review and discuss collaboration options.</p>
            </div>
            <div className="step-item">
              <div className="step-icon">3</div>
              <h3>Property Transformation</h3>
              <p>We style, furnish, and ready the home for renters.</p>
            </div>
            <div className="step-item">
              <div className="step-icon">4</div>
              <h3>Simplified Rental Process</h3>
              <p>We handle tenant search, maintenance, and contracts.</p>
            </div>
          </div>
          <div className="process-cta">
            <button className="btn btn-outline" onClick={() => onNavigate('contact')}>Start the process →</button>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="benefits-section">
        <div className="container">
          <h2>Unlocking Advantages</h2>
          <h3>Great Benefits for Landlords</h3>
          <div className="benefits-grid">
            <div className="benefit-card">
              <h4>Earn more, rent faster</h4>
            </div>
            <div className="benefit-card">
              <h4>Access to premium clients (corporate & individual)</h4>
            </div>
            <div className="benefit-card">
              <h4>No hidden fees — clear, transparent deals</h4>
            </div>
            <div className="benefit-card">
              <h4>Dedicated support & proactive updates</h4>
            </div>
            <div className="benefit-card">
              <h4>Design-led styling & ongoing upkeep</h4>
            </div>
            <div className="benefit-card">
              <h4>End-to-end compliance & maintenance</h4>
            </div>
          </div>
          <p className="benefits-note">
            Choose revenue sharing or traditional leasing—whatever suits your strategy.
          </p>
        </div>
      </section>

      {/* Revenue Models */}
      <section className="revenue-models">
        <div className="container">
          <div className="models-tabs">
            <button className="tab-btn active">Revenue Sharing</button>
            <button className="tab-btn">Traditional Lease</button>
          </div>
          <div className="model-content">
            <div className="model-info">
              <h3>Revenue Sharing</h3>
              <p>Higher upside; dynamic pricing; owner statements monthly.</p>
            </div>
            <div className="model-info">
              <h3>Traditional Lease</h3>
              <p>Fixed income; zero vacancy risk; predictable cash flow.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="container">
          <h2>Our Testimonials — What They Say</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-image">
                <img src="/Images/66ded489b23da42fb7825969_RHONJ_S10E11-12_Hamptons-3.avif" alt="Luxury property interior" />
              </div>
              <div className="testimonial-content">
                <p>"As a property owner, working with YGI Holiday Homes has been a game-changer. Their team maximized my rental income while keeping guests delighted."</p>
                <div className="testimonial-author">
                  <div className="author-avatar">S</div>
                  <div className="author-info">
                    <h4>Sarah T.</h4>
                    <span>Landlord</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-image">
                <img src="/Images/66e1a30b95c34f2839373ced_RHOP_S3E14-16_Hôtel Martinez part of The Unbound Collection by Hyatt_1-topaz.avif" alt="Luxury hotel interior" />
              </div>
              <div className="testimonial-content">
                <p>"Best decision. Beautiful apartment and exceptional 24/7 support. Will book again!"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">A</div>
                  <div className="author-info">
                    <h4>Ahmed K.</h4>
                    <span>Guest</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-image">
                <img src="/Images/66e1ae0ccc2bceb71f9cf83c_RHOD_S2E7-9_Grand Velas Resort_3-topaz.avif" alt="Resort interior" />
              </div>
              <div className="testimonial-content">
                <p>"Stunning setup, very responsive management. Hassle-free and profitable."</p>
                <div className="testimonial-author">
                  <div className="author-avatar">L</div>
                  <div className="author-info">
                    <h4>Landlord</h4>
                    <span>Anonymous</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="testimonial-proof">
            <span>★★★★★ average rating</span>
            <span>•</span>
            <span>1,000+ nights managed recently</span>
          </div>
        </div>
      </section>

      {/* Lead Capture Form */}
      <section className="lead-capture">
        <div className="container">
          <div className="form-container">
            <h2>Find out if your property meets our criteria</h2>
            <form className="rent-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone/WhatsApp *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="propertyLocation">Property Location *</label>
                  <input
                    type="text"
                    id="propertyLocation"
                    name="propertyLocation"
                    value={formData.propertyLocation}
                    onChange={handleInputChange}
                    placeholder="e.g., Dubai Marina"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="buildingName">Building Name</label>
                  <input
                    type="text"
                    id="buildingName"
                    name="buildingName"
                    value={formData.buildingName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="bedrooms">Bedrooms *</label>
                  <select
                    id="bedrooms"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select bedrooms</option>
                    <option value="1">1 Bedroom</option>
                    <option value="2">2 Bedrooms</option>
                    <option value="3">3 Bedrooms</option>
                    <option value="4+">4+ Bedrooms</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="furnished">Furnished?</label>
                  <select
                    id="furnished"
                    name="furnished"
                    value={formData.furnished}
                    onChange={handleInputChange}
                  >
                    <option value="">Select option</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="preferredModel">Preferred Model</label>
                  <select
                    id="preferredModel"
                    name="preferredModel"
                    value={formData.preferredModel}
                    onChange={handleInputChange}
                  >
                    <option value="">Select model</option>
                    <option value="revenue-share">Revenue Share</option>
                    <option value="lease">Lease</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Tell us more about your property..."
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleInputChange}
                    required
                  />
                  <span className="checkmark"></span>
                  I agree to be contacted via WhatsApp/email.
                </label>
              </div>

              <button type="submit" className="btn btn-primary">Check Eligibility</button>
            </form>
            <p className="form-note">Response within 12–24 hours.</p>
          </div>
        </div>
      </section>

      {/* Secondary CTA */}
      <section className="secondary-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to list your property?</h2>
            <div className="cta-buttons">
              <button className="btn btn-primary" onClick={() => onNavigate('contact')}>Book a Call</button>
              <button className="btn btn-outline" onClick={() => onNavigate('contact')}>List your Property</button>
            </div>
          </div>
        </div>
      </section>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        bookingData={inquiryResult}
      />
    </div>
  );
};

export default RentProperty;
