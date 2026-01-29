import React from 'react';
import './HomeExploreInfo.css';

const HomeExploreInfo = ({ onNavigate }) => {
    return (
        <div className="home-explore-info">
            {/* Explore Best Apartments Section */}
            <section className="explore-apartments section">
                <div className="container">
                    <h2>Explore Best Apartments in Dubai</h2>
                    <div className="content-wrapper">
                        <p className="primary-text">
                            Browse our portfolio of apartments for rent in Dubai featuring modern furnishings, fully equipped kitchens, and premium amenities. We offer flexible booking options, ensuring guests can stay for a few nights or several months in comfort and style.
                        </p>
                        <p className="secondary-text">
                            Each apartment is selected to meet the highest standards of cleanliness, safety, and design, making it ideal for both leisure and business travelers.
                        </p>
                        <div className="button-wrapper">
                            <button
                                className="btn btn-primary"
                                onClick={() => onNavigate('book')}
                            >
                                Explore Properties
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Flexible Short Term Rentals Section */}
            <section className="flexible-rentals-home section">
                <div className="container">
                    <h2>Flexible Short Term Rentals</h2>
                    <div className="content-wrapper">
                        <p className="intro-text">
                            YGI Holiday Homes offers flexible short term rentals in Dubai with convenient booking and stay options:
                        </p>
                        <ul className="benefits-list">
                            <li>
                                <span className="check-icon">✓</span>
                                Daily, weekly, or monthly stays available
                            </li>
                            <li>
                                <span className="check-icon">✓</span>
                                Options for families, couples, and solo travelers
                            </li>
                            <li>
                                <span className="check-icon">✓</span>
                                Secure online booking with instant confirmation
                            </li>
                        </ul>
                        <p className="closing-text">
                            Our team is dedicated to providing a seamless experience from reservation to check-out, ensuring every guest enjoys comfort and convenience in their stay.
                        </p>
                        <div className="button-wrapper">
                            <button
                                className="btn btn-primary"
                                onClick={() => onNavigate('book')}
                            >
                                View Rentals
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomeExploreInfo;
