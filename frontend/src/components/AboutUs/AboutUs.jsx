import React, { useState } from 'react';
import './AboutUs.css';

const AboutUs = ({ onNavigate }) => {
  const [expertForm, setExpertForm] = useState({
    checkIn: '',
    guests: '',
    area: '',
    contactMethod: 'whatsapp'
  });
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleExpertFormSubmit = () => {
    // Basic validation
    if (!expertForm.checkIn || !expertForm.guests || !expertForm.area) {
      alert('Please fill in all fields');
      return;
    }

    // Create WhatsApp message
    const message = `Hi! I'd like 3 property options for:
- Check-in: ${expertForm.checkIn}
- Guests: ${expertForm.guests}
- Area: ${expertForm.area}
- Contact via: ${expertForm.contactMethod === 'whatsapp' ? 'WhatsApp' : 'Email'}`;

    if (expertForm.contactMethod === 'whatsapp') {
      // Open WhatsApp with pre-filled message
      const whatsappUrl = `https://wa.me/971585498899?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      // Open email client
      const emailUrl = `mailto:info@ygiholidayhomes.com?subject=Property Options Request&body=${encodeURIComponent(message)}`;
      window.location.href = emailUrl;
    }
    
    // Reset form
    setExpertForm({
      checkIn: '',
      guests: '',
      area: '',
      contactMethod: 'whatsapp'
    });
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail) {
      alert('Please enter your email address');
      return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newsletterEmail)) {
      alert('Please enter a valid email address');
      return;
    }
    
    // Here you would typically send to your newsletter service
    console.log('Newsletter signup:', newsletterEmail);
    alert('Thank you for subscribing! You\'ll receive our Dubai property deals.');
    setNewsletterEmail('');
  };

  const handleExpertInputChange = (field, value) => {
    setExpertForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactMethodToggle = (method) => {
    setExpertForm(prev => ({
      ...prev,
      contactMethod: method
    }));
  };

  const stats = [
    { number: "1,550+", label: "Apartments Rented" },
    { number: "4,300+", label: "Satisfied Clients" },
    { number: "10+", label: "Featured Buildings" }
  ];

  const features = [
    {
      title: "Prime Locations",
      description: "Closer to what you came for"
    },
    {
      title: "Fully Furnished", 
      description: "Everything ready, exactly how you expect"
    },
    {
      title: "Premium Quality",
      description: "Hotel-grade comfort with home warmth"
    },
    {
      title: "24/7 Support",
      description: "Help at any hour—by real people"
    },
    {
      title: "Transparent Pricing",
      description: "No surprises at checkout"
    },
    {
      title: "Flexible Stays",
      description: "Stay two nights or two months"
    }
  ];


  return (
    <div className="about-us">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <div className="hero-content-centered">
            <h1 className="hero-title">Your Gateway to Luxury in Dubai</h1>
            <p className="hero-subtitle">
              Hotel-grade comfort with home warmth.
            </p>
            
            {/* Highlight Boxes */}
            <div className="hero-highlights">
              <div className="highlight-box">
                <div className="highlight-number">4,300+</div>
                <div className="highlight-label">Happy Clients</div>
              </div>
              <div className="highlight-box">
                <div className="highlight-number">1,550+</div>
                <div className="highlight-label">Apartments Rented</div>
              </div>
              <div className="highlight-box">
                <div className="highlight-number">24/7</div>
                <div className="highlight-label">Support</div>
              </div>
            </div>
            
            <div className="hero-ctas">
              <button className="btn btn-primary" onClick={() => onNavigate('book')}>Book Now</button>
              <button className="btn btn-secondary rent-property-btn" onClick={() => onNavigate('expert')}>List Property</button>
            </div>
          </div>
        </div>
      </section>

      {/* About Story Section */}
      <section className="about-story">
        <div className="container">
          <div className="story-card">
            <h2>About YGI Holiday Homes</h2>
            <p>
              We host business travelers, families, and weekend escapes in Dubai's most connected 
              neighborhoods. Every YGI home is fully furnished, hotel-clean, and thoughtfully 
              equipped—so you can live better and spend smarter.
            </p>
            <div className="perks-chips">
              <span className="perk-chip">Flexible stays</span>
              <span className="perk-chip">Transparent pricing</span>
              <span className="perk-chip">24/7 support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="impact-stats">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-tile">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-underline"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose YGI */}
      <section className="why-choose">
        <div className="container">
          <h2>Why Choose YGI</h2>
           <div className="features-grid">
             {features.map((feature, index) => (
               <div key={index} className="feature-card">
                 <h3>{feature.title}</h3>
                 <p>{feature.description}</p>
               </div>
             ))}
           </div>
        </div>
      </section>


      {/* Ask an Expert */}
      <section className="ask-expert-section">
        <div className="container">
          <div className="expert-card">
            <div className="expert-avatar">
              <span>Z</span>
            </div>
            <div className="expert-content">
              <h3>Hi! I'm Zara from YGI. Tell me dates, guests & area—I'll send 3 options.</h3>
              <div className="expert-form">
                <input 
                  type="date" 
                  placeholder="Check-in date" 
                  value={expertForm.checkIn}
                  onChange={(e) => handleExpertInputChange('checkIn', e.target.value)}
                />
                <input 
                  type="number" 
                  placeholder="Guests" 
                  min="1"
                  max="10"
                  value={expertForm.guests}
                  onChange={(e) => handleExpertInputChange('guests', e.target.value)}
                />
                <select 
                  value={expertForm.area}
                  onChange={(e) => handleExpertInputChange('area', e.target.value)}
                >
                  <option value="">Select area</option>
                  <option value="Dubai Marina">Dubai Marina</option>
                  <option value="Palm Jumeirah">Palm Jumeirah</option>
                  <option value="Downtown">Downtown</option>
                  <option value="JBR">JBR</option>
                </select>
                <div className="contact-toggle">
                  <button 
                    className={`toggle-btn ${expertForm.contactMethod === 'whatsapp' ? 'active' : ''}`}
                    onClick={() => handleContactMethodToggle('whatsapp')}
                  >
                    WhatsApp
                  </button>
                  <button 
                    className={`toggle-btn ${expertForm.contactMethod === 'email' ? 'active' : ''}`}
                    onClick={() => handleContactMethodToggle('email')}
                  >
                    Email
                  </button>
                </div>
                <button className="expert-submit" onClick={handleExpertFormSubmit}>Send Options</button>
              </div>
              <p className="response-time">Avg response under 10 minutes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter">
        <div className="container">
          <div className="newsletter-card">
            <h3>Get 1–2 monthly deals on Dubai stays—no spam.</h3>
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input 
                type="email" 
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
              />
              <button type="submit" className="newsletter-btn">Subscribe</button>
            </form>
            <p className="privacy-note">We never share your data.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Experience Dubai?</h2>
            <p>Instant booking. Clear pricing. Local support.</p>
            <div className="cta-buttons">
              <button className="btn btn-primary" onClick={() => onNavigate('book')}>Book an Apartment</button>
              <button className="btn btn-secondary rent-property-btn" onClick={() => onNavigate('expert')}>Rent a Property</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
