import React, { useState, useEffect } from 'react';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import SearchFilter from './components/SearchFilter/SearchFilter';
import Bestsellers from './components/Bestsellers/Bestsellers';
import FeatureTiles from './components/FeatureTiles/FeatureTiles';
import AboutUs from './components/AboutUs/AboutUs';
import Contact from './components/Contact/Contact';
import RentProperty from './components/RentProperty/RentProperty';
import BookApartment from './components/BookApartment/BookApartment';
import PropertyDetails from './components/PropertyDetails/PropertyDetails';
import PropertyPhotos from './components/PropertyPhotos/PropertyPhotos';
import DiscoverHolidayHomes from './components/DiscoverHolidayHomes/DiscoverHolidayHomes';
import Payment from './components/Payment/Payment';
import TestBooking from './components/TestBooking/TestBooking';
import GoogleSheetsTest from './components/GoogleSheetsTest/GoogleSheetsTest';
import Footer from './components/Footer/Footer';
import PageMetadata from './components/PageMetadata/PageMetadata';
import PrivacyPolicy from './components/Legal/PrivacyPolicy';
import TermsAndConditions from './components/Legal/TermsAndConditions';
import SEOContent from './components/SEOContent/SEOContent';
import Testimonials from './components/Testimonials/Testimonials';
import ExploreProperties from './components/ExploreProperties/ExploreProperties';
import WhyChooseYGI from './components/WhyChooseYGI/WhyChooseYGI';
import HomeFAQs from './components/HomeFAQs/HomeFAQs';
import DubaiCommunities from './components/DubaiCommunities/DubaiCommunities';
import HomeCTA from './components/HomeCTA/HomeCTA';
import {
  getPageFromSlug,
  getSlugFromPage,
  updateUrl,
  getCurrentSlug,
  getSearchParamsFromUrl,
  getPropertyBySlug,
  setProperties as setSlugUtilsProperties
} from './utils/slugUtils';
import { useProperties } from './contexts/PropertiesContext';
import './App.css';

function App() {
  const { properties } = useProperties();
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [searchParams, setSearchParams] = useState(null);

  // Update slugUtils with current properties whenever they change
  useEffect(() => {
    setSlugUtilsProperties(properties);
  }, [properties]);

  // Initialize page from URL slug on component mount
  useEffect(() => {
    const currentSlug = getCurrentSlug();
    const page = getPageFromSlug(currentSlug);
    setCurrentPage(page);

    // Handle property pages
    if (page === 'property-details') {
      const property = getPropertyBySlug(currentSlug);
      if (property) {
        setSelectedProperty(property);
      }
    }

    // Parse search parameters from URL if on book page
    if (page === 'book') {
      const urlSearchParams = getSearchParamsFromUrl();
      if (Object.keys(urlSearchParams).length > 0) {
        setSearchParams(urlSearchParams);
      }
    }
  }, []);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const currentSlug = getCurrentSlug();
      const page = getPageFromSlug(currentSlug);
      setCurrentPage(page);

      // Handle property pages
      if (page === 'property-details') {
        const property = getPropertyBySlug(currentSlug);
        if (property) {
          setSelectedProperty(property);
        }
      }

      // Parse search parameters from URL if on book page
      if (page === 'book') {
        const urlSearchParams = getSearchParamsFromUrl();
        if (Object.keys(urlSearchParams).length > 0) {
          setSearchParams(urlSearchParams);
        } else {
          setSearchParams(null);
        }
      } else {
        setSearchParams(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (page, property = null, searchParams = null) => {
    console.log('Navigating to:', page, 'with search params:', searchParams);
    setCurrentPage(page);

    // Update URL with slug and search parameters
    // Update URL with slug and search parameters
    let slug = getSlugFromPage(page);

    // For property details, use the property's slug
    if (page === 'property-details' && property && property.slug) {
      slug = property.slug;
    }

    updateUrl(slug, { property, searchParams });

    // Set selected property if provided
    if (property) {
      setSelectedProperty(property);
    }

    // Set or clear search parameters
    if (searchParams !== null) {
      setSearchParams(searchParams);
    } else {
      // Explicitly clear search parameters
      setSearchParams(null);
    }
  };

  // Scroll to top whenever the page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const handleViewDetails = (property) => {
    // Navigate to property details page
    handleNavigate('property-details', property);
  };

  const handleBookNow = (bookingData) => {
    // Set booking data and navigate to payment page
    setBookingData(bookingData);
    handleNavigate('payment');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'about':
        return <AboutUs onNavigate={handleNavigate} />;
      case 'contact':
        return <Contact onNavigate={handleNavigate} />;
      case 'expert':
        return <RentProperty onNavigate={handleNavigate} />;
      case 'book':
        return <BookApartment onNavigate={handleNavigate} onViewDetails={handleViewDetails} onBookNow={handleBookNow} searchParams={searchParams} />;
      case 'payment':
        return <Payment onNavigate={handleNavigate} bookingData={bookingData} />;
      case 'property-details':
        return <PropertyDetails property={selectedProperty} onNavigate={handleNavigate} onBookNow={handleBookNow} />;
      case 'property-photos':
        return <PropertyPhotos property={selectedProperty} onNavigate={handleNavigate} />;
      case 'privacy':
        return <PrivacyPolicy />;
      case 'terms':
        return <TermsAndConditions />;
      case 'test':
        return <TestBooking />;
      case 'sheets-test':
        return <GoogleSheetsTest />;
      case 'home':
      default:
        return (
          <>
            <Hero onNavigate={handleNavigate} />
            <DiscoverHolidayHomes />
            <ExploreProperties onNavigate={handleNavigate} />
            <SearchFilter onNavigate={handleNavigate} />
            <Bestsellers onNavigate={handleNavigate} />
            <DubaiCommunities onNavigate={handleNavigate} />
            <WhyChooseYGI />
            <Testimonials />
            <HomeFAQs />
          </>
        );
    }
  };

  return (
    <div className="App">
      <PageMetadata currentPage={currentPage} selectedProperty={selectedProperty} />
      <Header onNavigate={handleNavigate} currentPage={currentPage} />
      <main className={currentPage === 'home' ? 'home-page' : ''}>
        {renderPage()}
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;