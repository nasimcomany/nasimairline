import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import { paymentService } from '../services/paymentService';
import { useLanguage } from '../contexts/LanguageContext';
import { cities } from '../data/cities';
import { getFlightSaleState, getFlightSaleCopy, FlightSaleState } from '../services/niraApi';
import {
  CreditCardIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { flight, passengers, contactInfo, totalPrice, bookingDraft } = location.state || {};
  const { t, language } = useLanguage();
  
  const getCityName = (cityCode: string) => {
    const city = cities.find(c => c.code === cityCode);
    if (!city) return cityCode;
    return language === 'en' ? city.name : city.nameFa;
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saleBlockNotice, setSaleBlockNotice] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<string>('zarinpal');

  const resolvedSaleState: FlightSaleState = (() => {
    if (!flight) return 'bookable';
    if (flight.saleState) return flight.saleState as FlightSaleState;
    if (flight.originalData) return getFlightSaleState(flight.originalData);
    if (flight.canBook === false) return 'sale_closed';
    if (Number(totalPrice || flight.price || 0) <= 0) return 'sale_closed';
    return 'bookable';
  })();
  const canBookFlight = resolvedSaleState === 'bookable' && Number(totalPrice || 0) > 0;
  const saleCopy = getFlightSaleCopy(resolvedSaleState, language);

  useEffect(() => {
    if (!flight || !passengers || !contactInfo) {
      navigate('/');
      return;
    }
    // Auto-redirect if soft-hold already came with Nira payment URL
    if (bookingDraft?.payment_mode === 'nira_redirect' && bookingDraft?.payment_url) {
      if (!canBookFlight) {
        setSaleBlockNotice(true);
        return;
      }
      sessionStorage.setItem('pendingBooking', JSON.stringify({
        flight,
        passengers,
        contactInfo,
        totalPrice,
        gateway: 'nira',
        bookingDraft,
      }));
      window.location.href = bookingDraft.payment_url;
    }
  }, [flight, passengers, contactInfo, navigate, bookingDraft, totalPrice, canBookFlight]);

  const handlePayment = async (gateway: string = selectedGateway) => {
    setError('');
    setSaleBlockNotice(false);

    if (!canBookFlight) {
      setSaleBlockNotice(true);
      return;
    }

    setLoading(true);
    setSelectedGateway(gateway);

    try {
      const callbackUrl = `${window.location.origin}/payment/verify`;
      
      const paymentData = {
        amount: totalPrice,
        description: `${t('payment.buyFlightTicket')} ${flight.flightNumber} - ${getCityName(flight.origin)} ${language === 'en' ? 'to' : language === 'ar' ? 'إلى' : 'به'} ${getCityName(flight.destination)}`,
        email: contactInfo.email,
        mobile: contactInfo.phone,
        callbackUrl,
        gateway
      };

      // Save booking data to sessionStorage for after payment
      sessionStorage.setItem('pendingBooking', JSON.stringify({
        flight,
        passengers,
        contactInfo,
        totalPrice,
        gateway,
        bookingDraft
      }));

      const response = await paymentService.requestPayment(paymentData);
      
      // Redirect to selected gateway
      paymentService.redirectToGateway(response.authority, gateway);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const paymentGateways = [
    { id: 'zarinpal', name: t('payment.payViaZarinpal'), icon: '💳', color: 'from-green-600 to-green-700' },
    { id: 'tejarat', name: t('payment.payViaTejarat'), icon: '🏦', color: 'from-blue-600 to-blue-700' },
    { id: 'mellat', name: t('payment.payViaMellat'), icon: '🏛️', color: 'from-purple-600 to-purple-700' },
    { id: 'pasargad', name: t('payment.payViaPasargad'), icon: '🏢', color: 'from-orange-600 to-orange-700' },
    { id: 'melli', name: t('payment.payViaMelli'), icon: '🏪', color: 'from-red-600 to-red-700' },
    { id: 'saderat', name: t('payment.payViaSaderat'), icon: '🏬', color: 'from-indigo-600 to-indigo-700' },
  ];

  if (!flight) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <EmiratesHeader />

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Payment Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-4 sm:p-6">
              <h1 className="text-xl sm:text-2xl font-bold text-white text-center flex items-center justify-center gap-2 sm:gap-3" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                <CreditCardIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                {t('payment.securePayment')}
              </h1>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <ExclamationCircleIcon className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="text-red-800 font-bold mb-1" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                      {t('payment.paymentError')}
                    </p>
                    <p className="text-sm text-red-700" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {saleBlockNotice && !canBookFlight ? (
                <div
                  className="p-4 bg-amber-50 border border-amber-200 rounded-lg"
                  style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
                  role="alert"
                >
                  <span
                    className={`inline-block mb-2 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      resolvedSaleState === 'sale_closed'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {saleCopy.badge}
                  </span>
                  <p className="font-bold text-amber-950 mb-1">{saleCopy.cta}</p>
                  <p className="text-sm text-amber-900 leading-relaxed">{saleCopy.notice}</p>
                </div>
              ) : null}

              {/* Flight Summary */}
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
                <h3 className="font-bold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                  {t('payment.bookingSummary')}
                </h3>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 min-w-0">
                    <span className="shrink-0" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>{t('payment.flightNumber')}</span>
                    <span className="font-bold break-words" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                      {flight.flightNumber}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 min-w-0">
                    <span className="shrink-0" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>{t('payment.route')}</span>
                    <span className="font-bold break-words text-left sm:text-right min-w-0" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                      {getCityName(flight.origin)} → {getCityName(flight.destination)}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 min-w-0">
                    <span className="shrink-0" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>{t('payment.passengerCount')}</span>
                    <span className="font-bold" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                      {passengers.length} {t('payment.person')}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 pt-2 border-t border-blue-300 min-w-0">
                    <span className="text-base sm:text-lg font-bold shrink-0" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                      {t('booking.payableAmount')}
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-blue-900 break-words" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                      {language === 'en' 
                        ? totalPrice.toLocaleString('en-US')
                        : language === 'ar'
                        ? totalPrice.toLocaleString('ar-SA')
                        : totalPrice.toLocaleString('fa-IR')} {t('flights.currency')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <ShieldCheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-green-900 mb-1 sm:mb-2 text-sm sm:text-base" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                      {t('payment.securePayment')}
                    </h4>
                    <p className="text-xs sm:text-sm text-green-800" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                      {t('payment.securePaymentNotice')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Gateways */}
              <div className="space-y-2 sm:space-y-3">
                <h3 className="font-bold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                  {t('payment.selectGateway')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {paymentGateways.map((gateway) => (
                    <button
                      key={gateway.id}
                      onClick={() => handlePayment(gateway.id)}
                      disabled={loading}
                      className={`w-full bg-gradient-to-r ${gateway.color} hover:opacity-90 text-white font-bold py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 text-xs sm:text-sm`}
                      style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
                    >
                      {loading && selectedGateway === gateway.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                          <span className="text-xs">{t('payment.redirecting')}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-lg sm:text-xl">{gateway.icon}</span>
                          <span className="text-xs sm:text-sm truncate">{gateway.name}</span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cancel Button */}
              <button
                onClick={() => navigate(-1)}
                disabled={loading}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base"
                style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
              >
                {t('payment.back')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;

