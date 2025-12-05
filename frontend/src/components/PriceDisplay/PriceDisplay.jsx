import React from 'react';
import './PriceDisplay.css';

const PriceDisplay = ({ 
  price, 
  currency = 'AED', 
  showSymbol = true, 
  showPeriod = false, 
  period = '/ night',
  className = '',
  size = 'medium'
}) => {
  if (price === null || price === undefined) {
    return <span className={`price-display ${className}`}>N/A</span>;
  }

  // Simple price formatting without currency conversion
  const formatPrice = (price, currency, showSymbol) => {
    const formattedPrice = price.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    
    if (!showSymbol) return formattedPrice;
    
    const currencySymbols = {
      'AED': 'AED',
      'USD': '$',
      'EUR': '€',
      'GBP': '£'
    };
    
    const symbol = currencySymbols[currency] || currency;
    return `${symbol} ${formattedPrice}`;
  };

  const displayPrice = formatPrice(price, currency, showSymbol);

  return (
    <span className={`price-display price-${size} ${className}`}>
      <span className="price-amount">
        {displayPrice}
        {showPeriod && <span className="price-period">{period}</span>}
      </span>
    </span>
  );
};

export default PriceDisplay;
