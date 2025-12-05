import { useEffect } from 'react';

const PAGE_METADATA = {
    'home': {
        title: 'YGI Holiday Homes | Luxury Short Term Rentals in Dubai',
        description: 'Find premium short-term rentals in Dubai with YGI Holiday Homes. Apartments for rent in Dubai with 24/7 support, flexible stays, and prime locations.'
    },
    'book': {
        title: 'Book Your Apartments in Dubai | YGI Holiday Homes',
        description: 'Book your apartments in Dubai with YGI Holiday Homes. Find verified luxury apartments, seamless booking, and enjoy a hassle-free stay in Dubai.'
    },
    'expert': {
        title: 'Maximize Income From Your Dubai Rental Properties',
        description: 'List your Dubai rental properties with YGI Holiday Homes. Enjoy higher income, full management, and expert support for hassle-free property rentals.'
    },
    'about': {
        title: 'About YGI Holiday Homes | Book Apartments in Dubai',
        description: 'Learn about YGI Holiday Homes: 1,550+ apartments rented, 4,300+ clients, 24/7 support, flexible stays & luxury comfort in Dubai.'
    },
    'contact': {
        title: 'Contact YGI Holiday Homes | Dubai Apartments Support',
        description: 'Get in touch with YGI Holiday Homes for questions, bookings, or support. Reach our Dubai team 24/7 for assistance with holiday apartment rentals.'
    },
    'privacy': {
        title: 'Privacy Policy | YGI Holiday Homes Dubai',
        description: 'Read YGI Holiday Homes’ Privacy Policy to understand how we collect, protect, & use your information when booking apartments or listing properties in Dubai.'
    },
    'terms': {
        title: 'Terms & Conditions | YGI Holiday Homes Dubai',
        description: 'Read YGI Holiday Homes Terms & Conditions for Dubai apartments. Booking rules, payments, cancellations, guest and owner responsibilities explained.'
    },
    'payment': {
        title: 'Secure Payment | YGI Holiday Homes Dubai',
        description: 'Complete your booking securely with YGI Holiday Homes. Safe and easy payment processing for your luxury apartment rental in Dubai.'
    }
};

const PageMetadata = ({ currentPage, selectedProperty }) => {
    useEffect(() => {
        let title = 'YGI Holiday Homes';
        let description = 'Luxury Short Term Rentals in Dubai';

        if (currentPage === 'property-details' && selectedProperty) {
            // Use property specific metadata if available, otherwise fallback to generated
            title = selectedProperty.metaTitle || `${selectedProperty.title} | Dubai Apartments`;
            description = selectedProperty.metaDescription || `Stay in ${selectedProperty.title}. ${selectedProperty.location}.`;
        } else if (currentPage === 'property-photos' && selectedProperty) {
            title = `Photos of ${selectedProperty.title} | YGI Holiday Homes`;
            description = `View photos of ${selectedProperty.title} in ${selectedProperty.location}. Explore the luxury interiors and amenities.`;
        } else if (PAGE_METADATA[currentPage]) {
            title = PAGE_METADATA[currentPage].title;
            description = PAGE_METADATA[currentPage].description;
        }

        // Update document title
        document.title = title;

        // Update meta description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.name = 'description';
            document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', description);

    }, [currentPage, selectedProperty]);

    return null;
};

export default PageMetadata;
