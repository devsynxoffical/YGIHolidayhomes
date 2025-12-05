// WhatsApp utility function
export const redirectToWhatsApp = () => {
  const phoneNumber = '+971585498899'; // Your WhatsApp number
  const message = encodeURIComponent('Hi! I would like to rent my property with YGI Holiday Homes in Dubai.');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
  
  // Open WhatsApp in a new tab
  window.open(whatsappUrl, '_blank');
};
