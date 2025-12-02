import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { LanguageProvider } from './contexts/LanguageContext';
import SplashPage from './pages/SplashPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FlightSearchPage from './pages/FlightSearchPage';
import FlightResultsPage from './pages/FlightResultsPage';
import BookingPage from './pages/BookingPage';
import BookingManagePage from './pages/BookingManagePage';
import FlightStatusPage from './pages/FlightStatusPage';
import DashboardPage from './pages/DashboardPage';
import ServicesPage from './pages/ServicesPage';
import GalleryPage from './pages/GalleryPage';
import NewsPage from './pages/NewsPage';
import DestinationsPage from './pages/DestinationsPage';
import OffersPage from './pages/OffersPage';
import MembershipPage from './pages/MembershipPage';
import SupportPage from './pages/SupportPage';
import TicketPage from './pages/TicketPage';
import ComplaintPage from './pages/ComplaintPage';
import ChatWidget from './components/Chat/ChatWidget';
import ScrollToTopButton from './components/ScrollToTop/ScrollToTopButton';

function App() {
  return (
    <Provider store={store}>
      <LanguageProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/splash" element={<SplashPage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/flights/search" element={<FlightSearchPage />} />
              <Route path="/flights/results" element={<FlightResultsPage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/booking/:flightId" element={<BookingPage />} />
              <Route path="/booking/manage" element={<BookingManagePage />} />
              <Route path="/flight/status" element={<FlightStatusPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/destinations" element={<DestinationsPage />} />
              <Route path="/offers" element={<OffersPage />} />
              <Route path="/membership" element={<MembershipPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/tickets" element={<TicketPage />} />
              <Route path="/complaint" element={<ComplaintPage />} />
            </Routes>
            {/* Chat Widget - Available on all pages */}
            <ChatWidget />
            {/* Scroll to Top Button - Available on all pages */}
            <ScrollToTopButton />
          </div>
        </Router>
      </LanguageProvider>
    </Provider>
  );
}

export default App;
