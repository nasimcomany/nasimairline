import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { LanguageProvider } from './contexts/LanguageContext';
import ChatWidget from './components/Chat/ChatWidget';
import ScrollToTopButton from './components/ScrollToTop/ScrollToTopButton';
import DisabledRoute from './components/DisabledRoute';
import { ChatProvider } from './contexts/ChatContext';

const HomePage = lazy(() => import('./pages/HomePage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const FlightResultsPage = lazy(() => import('./pages/FlightResultsPage'));
const FlightMapPage = lazy(() => import('./pages/FlightMapPage'));
const BookingManagePage = lazy(() => import('./pages/BookingManagePage'));
const FlightStatusPage = lazy(() => import('./pages/FlightStatusPage'));
const BookingDetailsPage = lazy(() => import('./pages/BookingDetailsPage'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const PaymentVerifyPage = lazy(() => import('./pages/PaymentVerifyPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const WalletPage = lazy(() => import('./pages/WalletPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const MembershipPage = lazy(() => import('./pages/MembershipPage'));
const TicketPage = lazy(() => import('./pages/TicketPage'));
const ComplaintPage = lazy(() => import('./pages/ComplaintPage'));
const SurveyPage = lazy(() => import('./pages/SurveyPage'));
const MagazinePage = lazy(() => import('./pages/MagazinePage'));
const ArticleDetailPage = lazy(() => import('./pages/ArticleDetailPage'));
const CategoryArticlesPage = lazy(() => import('./pages/CategoryArticlesPage'));
const IranologyPage = lazy(() => import('./pages/IranologyPage'));
const CityArticlesPage = lazy(() => import('./pages/CityArticlesPage'));
const IranologyArticleDetailPage = lazy(() => import('./pages/IranologyArticleDetailPage'));
const MealFeedbackPage = lazy(() => import('./pages/MealFeedbackPage'));
const StaffDashboardPage = lazy(() => import('./pages/StaffDashboardPage'));
const SafetyReportCabinPage = lazy(() => import('./pages/SafetyReportCabinPage'));
const SafetyReportSafetyPage = lazy(() => import('./pages/SafetyReportSafetyPage'));

const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-600" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
        در حال بارگذاری...
      </p>
    </div>
  </div>
);

function App() {
  return (
    <Provider store={store}>
      <LanguageProvider>
        <ChatProvider>
          <Router>
            <div className="App">
              <Suspense fallback={<PageLoader />}>
                <Routes>
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
                  <Route path="/magazine/category/:slug" element={<CategoryArticlesPage />} />
                  <Route path="/magazine/:slug" element={<ArticleDetailPage />} />
                  <Route path="/iranology" element={<IranologyPage />} />
                  <Route path="/iranology/:slug" element={<CityArticlesPage />} />
                  <Route path="/iranology/:city_slug/:slug" element={<IranologyArticleDetailPage />} />
                  <Route path="/meal-feedback" element={<MealFeedbackPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/staff-dashboard" element={<StaffDashboardPage />} />
                  <Route path="/safety-report/cabin" element={<SafetyReportCabinPage />} />
                  <Route path="/safety-report/safety" element={<SafetyReportSafetyPage />} />

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
              </Suspense>
              <ChatWidget />
              <ScrollToTopButton />
            </div>
          </Router>
        </ChatProvider>
      </LanguageProvider>
    </Provider>
  );
}

export default App;
