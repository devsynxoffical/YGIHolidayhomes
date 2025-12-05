import React from 'react';
import './FeatureTiles.css';

const FeatureTiles = ({ onNavigate }) => {
  const tiles = [
    {
      id: 1,
      title: "Dubai Communities",
      subtitle: "Covering 100+ communities, we can help you find one that ticks your boxes",
      cta: "Explore Dubai",
      image: "/Images/66deceb807bb4e3770db189e_RHONJ_S5E13_The Miraval Resort and Spa_1.avif",
      navigateTo: "contact"
    },
    {
      id: 2,
      title: "Explore Best Apartments",
      subtitle: "Search our team of 289 properties to get professional guidance",
      cta: "Explore Properties",
      image: "/Images/66ded2500ba8686872db2330_RHONJ_S8E10-11_Casa Baglioni _1-topaz.avif",
      navigateTo: "book"
    },
    {
      id: 3,
      title: "Find Short Term Rentals",
      subtitle: "Premium locations in Dubai with luxury amenities",
      cta: "View Rentals",
      image: "/Images/66ded489b23da42fb7825969_RHONJ_S10E11-12_Hamptons-3.avif",
      navigateTo: "expert"
    }
  ];

  return (
    <section className="feature-tiles section">
      <div className="container">
        <div className="tiles-grid grid grid-3">
          {tiles.map((tile) => (
            <div key={tile.id} className="feature-tile">
              <div className="tile-image-container">
                <img 
                  src={tile.image} 
                  alt={tile.title}
                  className="tile-image"
                />
                <div className="tile-overlay">
                  <div className="tile-content">
                    <h3 className="tile-title">{tile.title}</h3>
                    <p className="tile-subtitle">{tile.subtitle}</p>
                    <button 
                      className="tile-cta"
                      onClick={() => onNavigate(tile.navigateTo)}
                    >
                      {tile.cta}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureTiles;
