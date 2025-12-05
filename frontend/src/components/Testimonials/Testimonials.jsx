import React from 'react';
import './Testimonials.css';

const Testimonials = () => {
    const testimonials = [
        {
            id: 1,
            rating: 5,
            text: "We had a wonderful stay! The apartment was spotless, comfortable, and exactly as described. YGI Holiday Homes made our short term rental in Dubai stress-free and enjoyable.",
            author: "Ayesha Malik",
            role: "Guest"
        },
        {
            id: 2,
            rating: 5,
            text: "The service was excellent, and check-in was so easy. This short term rental Dubai exceeded all our expectations. Highly recommended for families and business travelers.",
            author: "Omar Al Fahad",
            role: "Guest"
        },
        {
            id: 3,
            rating: 5,
            text: "Our experience with YGI Holiday Homes was fantastic. The apartment was modern, well-located, and the team provided 24/7 support throughout our short term rental in Dubai.",
            author: "Fatima Khan",
            role: "Guest"
        },
        {
            id: 4,
            rating: 5,
            text: "Booking was simple, and the stay was perfect. We loved the amenities and the proximity to Dubai Marina. This short term rental in Dubai made our trip memorable. We will definitely book again through YGI Holiday Homes.",
            author: "John Matthews",
            role: "Guest"
        },
        {
            id: 5,
            rating: 5,
            text: "YGI Holiday Homes helped us find the perfect apartment for our family. Everything from booking to check-out was seamless and professional. Best short term rental in Dubai we've stayed at!",
            author: "Sarah Ali",
            role: "Guest"
        }
    ];

    return (
        <section className="testimonials-section">
            <div className="container">
                <h2>What Our Clients Say</h2>
                <div className="testimonials-grid">
                    {testimonials.map((testimonial) => (
                        <div key={testimonial.id} className="testimonial-card">
                            <div className="rating">
                                {[...Array(testimonial.rating)].map((_, index) => (
                                    <span key={index} className="star">★</span>
                                ))}
                            </div>
                            <p className="testimonial-text">"{testimonial.text}"</p>
                            <div className="testimonial-author">
                                <p className="author-name">– {testimonial.author}</p>
                                <p className="author-role">{testimonial.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
