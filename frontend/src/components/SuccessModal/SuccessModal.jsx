import React from 'react';
import './SuccessModal.css';

const SuccessModal = ({ isOpen, onClose, bookingData }) => {
  if (!isOpen) return null;

  return (
    <div className="success-modal-overlay" onClick={onClose}>
      <div className="success-modal" onClick={(e) => e.stopPropagation()}>
        <div className="success-modal-content">
          {/* Success Icon */}
          <div className="success-icon">
            <div className="checkmark">
              <div className="checkmark-circle">
                <div className="checkmark-stem"></div>
                <div className="checkmark-kick"></div>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="success-message">
            <h2>Booking Confirmed! 🎉</h2>
            <p className="success-subtitle">
              Your booking has been submitted successfully
            </p>
          </div>

          {/* Booking Details */}
          <div className="booking-details">
            <div className="booking-id">
              <span className="label">Booking ID:</span>
              <span className="value">{bookingData?.bookingId || 'N/A'}</span>
            </div>
            
            {bookingData?.propertyName && (
              <div className="property-name">
                <span className="label">Property:</span>
                <span className="value">{bookingData.propertyName}</span>
              </div>
            )}

            {bookingData?.totalPrice && bookingData.totalPrice > 0 && (
              <div className="total-price">
                <span className="label">Total Amount:</span>
                <span className="value">AED {bookingData.totalPrice}</span>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="next-steps">
            <h3>What's Next?</h3>
            <ul>
              <li>📧 You'll receive a confirmation email shortly</li>
              <li>📞 Our team will contact you within 12-24 hours</li>
              <li>🏠 Get ready for your amazing stay!</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="success-actions">
            <button className="btn-primary" onClick={onClose}>
              Continue Browsing
            </button>
            <button className="btn-secondary" onClick={() => window.print()}>
              Print Confirmation
            </button>
          </div>

          {/* Close Button */}
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
