import React from 'react';
import './Hero.css';

const Hero = ({ onNavigate }) => {
  return (
    <section className="hero">
      <div className="hero-image">
        <img 
          src="/Images/66d6c5951dac7641e38ec4f8_Hero Visual.avif" 
          alt="Handmade Swedish furniture kitchen with marble countertops and wooden stools"
          className="hero-img"
        />
      </div>
      
      <div className="hero-overlay">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                <div className="highlight">YGI</div>
                <div>HOLIDAY HOMES</div>
              </h1>
              <p className="hero-sub">
                LUXURY DUBAI RENTALS
              </p>
              <div className="hero-btn-container">
                <button 
                  className="hero-btn"
                  onClick={() => onNavigate('book')}
                >
                  EXPLORE PROPERTIES
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;