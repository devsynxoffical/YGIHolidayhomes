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
      {/* Hero Section */}
      <section className="rent-hero-new">
        <div className="hero-background-image"></div>
        <div className="hero-background-overlay"></div>
        <div className="container">
          <div className="hero-content-new">
            <div className="hero-left">
              <h1 className="hero-title-new">
                <span className="title-highlight">Maximize Your Rental Property in Dubai With Expert Management</span>
                <span className="title-main">Earn More From Your Dubai Property</span>
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

            <div className="hero-right">
              <div className="hero-visual-container">
                <div className="main-property-card">
                  <div className="property-image">
                    <img src="/Images/66ded2500ba8686872db2330_RHONJ_S8E10-11_Casa Baglioni _1-topaz.avif" alt="Luxury Dubai Apartment" />
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
              <h2>List Your Property for Rent and Unlock the Potential of Your Rental Property in Dubai</h2>
              <p>
                Welcome to YGI Holiday Homes, your trusted partner for professional property management. We specialize in turning your apartments and villas into fully managed, high-performing rental property in Dubai. Whether you are listing your property for rent for the first time or already have experience, we ensure your property attracts premium tenants, achieves higher occupancy, and generates maximum income.
              </p>
              <p>
                By partnering with us, you do not need to worry about furnishing, maintenance, guest communication, or compliance. Our team handles every detail, giving you a hands-free, profitable rental property in Dubai experience. Renting your property in Dubai with YGI Holiday Homes ensures transparency, professional care, and higher returns than traditional self-managed rentals.
              </p>
              <div className="perks-list">
                <div className="perk-item">
                  <div className="perk-icon">✓</div>
                  <span>Higher occupancy rates</span>
                </div>
                <div className="perk-item">
                  <div className="perk-icon">✓</div>
                  <span>Furnishing and interior styling</span>
                </div>
                <div className="perk-item">
                  <div className="perk-icon">✓</div>
                  <span>Transparent and commission-free management</span>
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => onNavigate('contact')}>BOOK A MEETING</button>
            </div>
            <div className="welcome-image">
              <img src="/Images/66deceb807bb4e3770db189e_RHONJ_S5E13_The Miraval Resort and Spa_1.avif" alt="Luxury Dubai apartment interior" />
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="process-steps">
        <div className="container">
          <h2>Easy Steps to Rent Your Property and Maximize Your Rental Property in Dubai</h2>
          <div className="steps-rail">
            <div className="step-item">
              <div className="step-icon">1</div>
              <h3>Introduce Your Property</h3>
              <p>Provide details such as photos, location, number of bedrooms, and current furnishing. This allows us to evaluate your property and create a strategy to maximize income from your rental property in Dubai.</p>
            </div>
            <div className="step-item">
              <div className="step-icon">2</div>
              <h3>Connect With Our Team</h3>
              <p>After reviewing your property, we discuss collaboration options. You can choose the best model to rent your property, whether revenue sharing or traditional lease.</p>
            </div>
            <div className="step-item">
              <div className="step-icon">3</div>
              <h3>Property Transformation</h3>
              <p>We style, furnish, and prepare your property to attract tenants. From décor improvements to setting up appliances, every detail is optimized to enhance your rental property in Dubai and increase its visibility on Dubai rental platforms.</p>
            </div>
            <div className="step-item">
              <div className="step-icon">4</div>
              <h3>Simplified Rental Process</h3>
              <p>We handle tenant sourcing, contracts, cleaning, maintenance, and guest communication. Renting your property in Dubai becomes stress-free while you enjoy regular updates and transparent reporting.</p>
            </div>
          </div>
          <div className="process-cta">
            <button className="btn btn-outline" onClick={() => onNavigate('contact')}>Start the process →</button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <h2>Advantages That Make Your Rental Property in Dubai More Profitable</h2>
          <h3>Benefits for Property Owners</h3>
          <p className="benefits-intro">
            Listing your property for rent with YGI Holiday Homes brings multiple advantages. We help you earn more, reduce vacancy, and simplify management.
          </p>
          <div className="benefits-grid">
            <div className="benefit-card">
              <h4>Access to premium tenants including corporate clients and international travelers</h4>
            </div>
            <div className="benefit-card">
              <h4>Dynamic pricing strategies to maximize earnings</h4>
            </div>
            <div className="benefit-card">
              <h4>Design-led interior styling to attract better guests</h4>
            </div>
            <div className="benefit-card">
              <h4>End-to-end management including compliance and ongoing maintenance</h4>
            </div>
            <div className="benefit-card">
              <h4>Clear reporting with no hidden fees</h4>
            </div>
            <div className="benefit-card">
              <h4>Flexible options: revenue sharing or traditional leasing</h4>
            </div>
          </div>
          <p className="benefits-note">
            By renting your property in Dubai through YGI Holiday Homes, your investment is positioned for long-term success. Our team ensures your rental property in Dubai always stands out in the competitive market.
          </p>
        </div>
      </section>

      {/* Revenue Models */}
      <section className="revenue-models">
        <div className="container">
          <h2>Management Options for Your Rental Property in Dubai</h2>
          <div className="model-content">
            <div className="model-info">
              <h3>Revenue Sharing</h3>
              <p>Dynamic pricing ensures maximum rental income from your property. You receive monthly statements with full transparency. This model is perfect for property owners who want to rent your property in Dubai for higher returns and performance-based income.</p>
            </div>
            <div className="model-info">
              <h3>Traditional Lease</h3>
              <p>A fixed income model provides predictable cash flow and eliminates vacancy risks. This model is suitable for property owners seeking a stable monthly income while renting out your property in Dubai.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Rent With Us */}
      <section className="why-rent-section">
        <div className="container">
          <h2>Why Rent Your Property With Us</h2>
          <p className="why-rent-intro">
            Renting your property in Dubai can be overwhelming without expert guidance. YGI Holiday Homes provides full-service management, ensuring your rental property in Dubai operates at its highest potential.
          </p>
          <h3 className="why-rent-subtitle">Key Benefits of Partnering With Us</h3>
          <div className="why-rent-grid">
            <div className="why-rent-item">
              <h4>Interior styling and décor improvements increase occupancy and revenue</h4>
            </div>
            <div className="why-rent-item">
              <h4>Pricing is optimized daily for maximum earnings</h4>
            </div>
            <div className="why-rent-item">
              <h4>Maintenance, cleaning, and guest communication handled 24 by 7</h4>
            </div>
            <div className="why-rent-item">
              <h4>Transparent reports and updates to keep you informed</h4>
            </div>
            <div className="why-rent-item">
              <h4>Flexible management models to suit your goals</h4>
            </div>
            <div className="why-rent-item">
              <h4>Peace of mind with a complete hands-off approach</h4>
            </div>
          </div>
          <p className="why-rent-note">
            Whether you own one apartment or multiple Dubai rental properties, our system ensures smooth operations and consistent income.
          </p>
        </div>
      </section>

      {/* About Us Section */}
      <section className="about-rent-section">
        <div className="container">
          <h2>About Us</h2>
          <p>
            YGI Holiday Homes is a leading property management company specializing in Dubai rental properties. We help landlords list their property for rent and maximize revenue while ensuring a stress-free experience. Our team combines expertise in interior styling, property care, tenant management, and market analytics to deliver consistent results for every client.
          </p>
          <p>
            We have successfully managed thousands of nights across Dubai rental properties and consistently deliver high occupancy and rental returns. Our mission is to provide transparent, reliable, and professional management for property owners. Partnering with us allows you to rent your property in Dubai confidently and enjoy higher income without the day-to-day hassle.
          </p>
        </div>
      </section>

      {/* Maximize Income Section */}
      <section className="maximize-income-section">
        <div className="container">
          <h2>Maximize Income From Your Dubai Rental Properties</h2>
          <div className="maximize-grid">
            <div className="maximize-item">
              <h3>Market Analysis and Strategic Planning</h3>
              <p>Before listing your property, we analyze market trends, competitor pricing, and tenant preferences. This ensures your Dubai rental properties are positioned to achieve maximum occupancy and revenue.</p>
            </div>
            <div className="maximize-item">
              <h3>Professional Photography and Listing</h3>
              <p>High-quality images and compelling descriptions attract premium tenants. We create listings that showcase your property's best features and highlight its unique selling points, making your Dubai rental properties stand out.</p>
            </div>
            <div className="maximize-item">
              <h3>Guest Experience Management</h3>
              <p>We manage guest check-ins, cleaning, and maintenance to ensure excellent reviews and repeat bookings. This increases occupancy and revenue potential for your Dubai rental properties.</p>
            </div>
            <div className="maximize-item">
              <h3>Flexible Renting Models</h3>
              <p>Choose between revenue sharing or traditional lease depending on your financial goals. We advise on which model works best for your Dubai rental properties to maximize returns.</p>
            </div>
            <div className="maximize-item">
              <h3>Transparency and Reporting</h3>
              <p>Property owners receive clear monthly statements with detailed income, occupancy, and maintenance reports. Managing your Dubai rental properties has never been more transparent.</p>
            </div>
            <div className="maximize-item">
              <h3>Compliance and Legal Support</h3>
              <p>We ensure all Dubai rental properties comply with DTCM regulations and local laws. Our team handles all necessary documentation, licensing, and legal requirements, giving you complete peace of mind.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="container">
          <h2>Testimonials — What They Say</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-image">
                <img src="/Images/66ded489b23da42fb7825969_RHONJ_S10E11-12_Hamptons-3.avif" alt="Luxury property interior" />
              </div>
              <div className="testimonial-content">
                <p>"As a property owner, working with YGI Holiday Homes has been a game-changer. They maximized my rental income while keeping tenants delighted."</p>
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
                <img
                  src="/Images/66deceb807bb4e3770db189e_RHONJ_S5E13_The Miraval Resort and Spa_1.avif"
                  alt="Luxury hotel interior"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/Images/66ded2500ba8686872db2330_RHONJ_S8E10-11_Casa Baglioni _1-topaz.avif";
                  }}
                />
              </div>
              <div className="testimonial-content">
                <p>"Beautiful apartment and exceptional 24 by 7 support. Highly recommended for anyone renting their property in Dubai."</p>
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
                <p>"Stunning setup, very responsive management, hassle-free and profitable."</p>
                <div className="testimonial-author">
                  <div className="author-avatar">L</div>
                  <div className="author-info">
                    <h4>L</h4>
                    <span>Landlord</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="testimonial-proof">
            <span>★★★★★ Average rating with 1,000+ nights managed recently</span>
          </div>
        </div>
      </section>



      {/* Lead Capture Form */}
      <section className="lead-capture">
        <div className="container">
          <div className="form-container">
            <h2>Find Out If Your Property Meets Our Criteria</h2>
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

      {/* FAQs Section */}
      <section className="faqs-rent-section">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          <div className="faqs-list">
            <div className="faq-item">
              <h3>1. How do I start renting my property in Dubai with YGI Holiday Homes?</h3>
              <p>Provide your property details, and our team will guide you through furnishing, listing, tenant sourcing, and full management. Your rental property in Dubai will be optimized for maximum income.</p>
            </div>
            <div className="faq-item">
              <h3>2. Can I list an unfurnished apartment?</h3>
              <p>Yes, we furnish and style your property to attract premium tenants and achieve high occupancy.</p>
            </div>
            <div className="faq-item">
              <h3>3. How do you find tenants for my rental property in Dubai?</h3>
              <p>We use online platforms, corporate partnerships, and direct marketing to secure high-quality tenants and maximize bookings.</p>
            </div>
            <div className="faq-item">
              <h3>4. Which model is better, revenue sharing or traditional lease?</h3>
              <p>Revenue sharing maximizes income, while traditional lease provides predictable, stable income. We guide you in choosing the best model for your property.</p>
            </div>
            <div className="faq-item">
              <h3>5. Do you handle maintenance and guest communication?</h3>
              <p>Yes, we manage repairs, cleaning, check-ins, and all tenant communication, giving you a hassle-free rental property in Dubai experience.</p>
            </div>
            <div className="faq-item">
              <h3>6. Can I rent multiple properties with you?</h3>
              <p>Absolutely, our team can manage multiple Dubai rental properties efficiently and profitably.</p>
            </div>
            <div className="faq-item">
              <h3>7. Is my property eligible for listing?</h3>
              <p>Properties in prime locations and well-maintained units are preferred. Our team will assess your property and provide recommendations for optimization.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="secondary-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to List Your Property for Rent?</h2>
            <p className="cta-description">
              Maximize your rental property in Dubai with YGI Holiday Homes. Enjoy higher income, zero hassle, and full transparency. Whether you are renting your property in Dubai for the first time or managing multiple units, we handle everything from furnishing to tenant management so you can relax and watch your investment grow.
            </p>
            <div className="cta-buttons">
              <button className="btn btn-primary" onClick={() => onNavigate('contact')}>Book a Call</button>
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
