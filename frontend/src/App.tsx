import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { LanguageProvider } from './contexts/LanguageContext';
import SplashPage from './pages/SplashPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import FlightSearchPage from './pages/FlightSearchPage';
import FlightResultsPage from './pages/FlightResultsPage';
import FlightMapPage from './pages/FlightMapPage';
import BookingPage from './pages/BookingPage';
import BookingManagePage from './pages/BookingManagePage';
import FlightStatusPage from './pages/FlightStatusPage';
import BookingDetailsPage from './pages/BookingDetailsPage';
import PaymentPage from './pages/PaymentPage';
import PaymentVerifyPage from './pages/PaymentVerifyPage';
import DashboardPage from './pages/DashboardPage';
import WalletPage from './pages/WalletPage';
import ServicesPage from './pages/ServicesPage';
import GalleryPage from './pages/GalleryPage';
import NewsPage from './pages/NewsPage';
import DestinationsPage from './pages/DestinationsPage';
import OffersPage from './pages/OffersPage';
import MembershipPage from './pages/MembershipPage';
import SupportPage from './pages/SupportPage';
import TicketPage from './pages/TicketPage';
import ComplaintPage from './pages/ComplaintPage';
import SurveyPage from './pages/SurveyPage';
import MagazinePage from './pages/MagazinePage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import IranologyPage from './pages/IranologyPage';
import CityArticlesPage from './pages/CityArticlesPage';
import IranologyArticleDetailPage from './pages/IranologyArticleDetailPage';
import MealFeedbackPage from './pages/MealFeedbackPage';
import StaffDashboardPage from './pages/StaffDashboardPage';
import SafetyReportCabinPage from './pages/SafetyReportCabinPage';
import SafetyReportSafetyPage from './pages/SafetyReportSafetyPage';
import ChatWidget from './components/Chat/ChatWidget';
import ScrollToTopButton from './components/ScrollToTop/ScrollToTopButton';
import DisabledRoute from './components/DisabledRoute';
import { ChatProvider } from './contexts/ChatContext';

function App() {
  return (
    <Provider store={store}>
      <LanguageProvider>
        <ChatProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Active Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/flights/results" element={<FlightResultsPage />} />
              <Route path="/flights/map" element={<FlightMapPage />} />
              <Route path="/booking/details/:flightId" element={<BookingDetailsPage />} />
              <Route path="/booking/manage" element={<BookingManagePage />} />
              <Route path="/flight/status/:flightId?" element={<FlightStatusPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/payment/verify" element={<PaymentVerifyPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/membership" element={<MembershipPage />} />
              <Route path="/tickets" element={<TicketPage />} />
              <Route path="/complaint" element={<ComplaintPage />} />
              <Route path="/survey" element={<SurveyPage />} />
              <Route path="/magazine" element={<MagazinePage />} />
              <Route path="/magazine/:slug" element={<ArticleDetailPage />} />
              <Route path="/iranology" element={<IranologyPage />} />
              <Route path="/iranology/:slug" element={<CityArticlesPage />} />
              <Route path="/iranology/:city_slug/:slug" element={<IranologyArticleDetailPage />} />
              <Route path="/meal-feedback" element={<MealFeedbackPage />} />

              {/* Auth Routes */}
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/staff-dashboard" element={<StaffDashboardPage />} />

              {/* Safety Reports - accessible from header */}
              <Route path="/safety-report/cabin" element={<SafetyReportCabinPage />} />
              <Route path="/safety-report/safety" element={<SafetyReportSafetyPage />} />

              {/* Disabled Routes - Redirect to Home for Security */}
              <Route path="/splash" element={<DisabledRoute />} />
              <Route path="/login" element={<DisabledRoute />} />
              <Route path="/register" element={<DisabledRoute />} />
              <Route path="/flights/search" element={<DisabledRoute />} />
              <Route path="/booking" element={<DisabledRoute />} />
              <Route path="/booking/:flightId" element={<DisabledRoute />} />
              <Route path="/services" element={<DisabledRoute />} />
              <Route path="/news" element={<DisabledRoute />} />
              <Route path="/destinations" element={<DisabledRoute />} />
              <Route path="/offers" element={<DisabledRoute />} />
              <Route path="/support" element={<DisabledRoute />} />
            </Routes>
            {/* Chat Widget - Available on all pages */}
            <ChatWidget />
            {/* Scroll to Top Button - Available on all pages */}
            <ScrollToTopButton />
          </div>
        </Router>
        </ChatProvider>
      </LanguageProvider>
    </Provider>
  );
}

export default App;
