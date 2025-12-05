/**
 * Coupon System for YGI Holiday Homes
 * Manages discount codes and validation
 */

export const COUPON_CODES = {
  WELCOME10: {
    code: 'WELCOME10',
    discount: 10, // percentage
    description: 'Welcome Offer - 10% Off',
    minBooking: 0,
    maxDiscount: null,
    active: true,
    expiryDate: null
  },
  FIRSTBOOK: {
    code: 'FIRSTBOOK',
    discount: 10,
    description: 'First Booking - 10% Off',
    minBooking: 0,
    maxDiscount: null,
    active: true,
    expiryDate: null
  },
  DUBAI10: {
    code: 'DUBAI10',
    discount: 10,
    description: 'Dubai Special - 10% Off',
    minBooking: 500,
    maxDiscount: null,
    active: true,
    expiryDate: null
  },
  LUXURY10: {
    code: 'LUXURY10',
    discount: 10,
    description: 'Luxury Stay - 10% Off',
    minBooking: 1000,
    maxDiscount: null,
    active: true,
    expiryDate: null
  }
};

/**
 * Validate a coupon code
 * @param {string} code - The coupon code to validate
 * @param {number} totalAmount - The booking total amount
 * @returns {Object} Validation result with success status and details
 */
export const validateCoupon = (code, totalAmount = 0) => {
  if (!code || typeof code !== 'string') {
    return {
      valid: false,
      message: 'Please enter a coupon code'
    };
  }

  const normalizedCode = code.toUpperCase().trim();
  const coupon = COUPON_CODES[normalizedCode];

  if (!coupon) {
    return {
      valid: false,
      message: 'Invalid coupon code'
    };
  }

  if (!coupon.active) {
    return {
      valid: false,
      message: 'This coupon is no longer active'
    };
  }

  if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
    return {
      valid: false,
      message: 'This coupon has expired'
    };
  }

  if (coupon.minBooking && totalAmount < coupon.minBooking) {
    return {
      valid: false,
      message: `Minimum booking of AED ${coupon.minBooking} required for this coupon`
    };
  }

  return {
    valid: true,
    coupon: coupon,
    message: `Coupon applied successfully! ${coupon.discount}% discount`
  };
};

/**
 * Calculate discount amount
 * @param {Object} coupon - The coupon object
 * @param {number} totalAmount - The booking total amount
 * @returns {Object} Discount details
 */
export const calculateDiscount = (coupon, totalAmount) => {
  if (!coupon || !totalAmount) {
    return {
      discountAmount: 0,
      finalAmount: totalAmount,
      discountPercentage: 0
    };
  }

  let discountAmount = (totalAmount * coupon.discount) / 100;

  // Apply max discount limit if exists
  if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
    discountAmount = coupon.maxDiscount;
  }

  const finalAmount = totalAmount - discountAmount;

  return {
    discountAmount: Math.round(discountAmount * 100) / 100,
    finalAmount: Math.round(finalAmount * 100) / 100,
    discountPercentage: coupon.discount,
    savings: Math.round(discountAmount * 100) / 100
  };
};

/**
 * Get all active coupons
 * @returns {Array} Array of active coupon codes
 */
export const getActiveCoupons = () => {
  return Object.values(COUPON_CODES).filter(coupon => coupon.active);
};

/**
 * Format coupon for display
 * @param {Object} coupon - The coupon object
 * @returns {string} Formatted coupon description
 */
export const formatCouponDisplay = (coupon) => {
  if (!coupon) return '';
  
  let display = `${coupon.code} - ${coupon.discount}% Off`;
  
  if (coupon.minBooking > 0) {
    display += ` (Min. AED ${coupon.minBooking})`;
  }
  
  return display;
};

