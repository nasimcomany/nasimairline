import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import { paymentService } from '../services/paymentService';
import bookingService from '../services/bookingService';
import { generateTicketPDF } from '../utils/pdfGenerator';
import { useLanguage } from '../contexts/LanguageContext';
import { cities } from '../data/cities';
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  HomeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const PaymentVerifyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  
  const getCityName = (cityCode: string) => {
    const city = cities.find(c => c.code === cityCode);
    if (!city) return cityCode;
    return language === 'en' ? city.name : city.nameFa;
  };
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [refId, setRefId] = useState('');
  const [bookingData, setBookingData] = useState<any>(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    const authority = searchParams.get('Authority');
    const statusParam = searchParams.get('Status');

    // Get booking data from session
    const pendingBooking = sessionStorage.getItem('pendingBooking');
    if (!pendingBooking) {
      setStatus('failed');
      return;
    }

    const booking = JSON.parse(pendingBooking);
    setBookingData(booking);

    if (statusParam === 'NOK') {
      setStatus('failed');
      sessionStorage.removeItem('pendingBooking');
      return;
    }

    if (!authority) {
      setStatus('failed');
      return;
    }

    try {
      const result = await paymentService.verifyPayment({
        authority,
        amount: booking.totalPrice
      });

      if (result.status === 'success') {
        // ساخت Booking و Payment در دیتابیس بک‌اند
        try {
          const bookingResponse = await bookingService.createBookingAfterPayment({
            flight_data: booking.flight,
            passengers: booking.passengers,
            contact_info: booking.contactInfo,
            total_amount: booking.totalPrice,
            cabin_class: 'ECONOMY',
            payment_ref_id: result.refId
          });
          
          console.log('✅ Booking و Payment با موفقیت ساخته شد!', bookingResponse);
          
          setStatus('success');
          setRefId(result.refId);
          sessionStorage.removeItem('pendingBooking');
          
          // همچنان در localStorage هم ذخیره کن (برای سازگاری با کد قبلی)
          const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
          bookings.push({
            ...booking,
            refId: result.refId,
            bookingDate: new Date().toISOString(),
            pnr: bookingResponse.booking.booking_reference,
            bookingId: bookingResponse.booking.id
          });
          localStorage.setItem('userBookings', JSON.stringify(bookings));
          
        } catch (bookingError) {
          console.error('❌ خطا در ساخت Booking:', bookingError);
          // حتی اگه ساخت Booking خطا داد، پرداخت موفق بوده
          setStatus('success');
          setRefId(result.refId);
          sessionStorage.removeItem('pendingBooking');
        }
      } else {
        setStatus('failed');
      }
    } catch (error) {
      console.error('❌ خطا در verify پرداخت:', error);
      setStatus('failed');
    }
  };

  const generatePNR = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let pnr = '';
    for (let i = 0; i < 6; i++) {
      pnr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pnr;
  };

  const handleDownloadPDF = () => {
    if (bookingData && refId) {
      const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
      const currentBooking = bookings[bookings.length - 1];
      generateTicketPDF(currentBooking);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <EmiratesHeader />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Verifying State */}
            {status === 'verifying' && (
              <div className="p-6 sm:p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-blue-900 mb-4 sm:mb-6"></div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                  {t('payment.verifying')}
                </h2>
                <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                  {t('payment.pleaseWait')}
                </p>
              </div>
            )}

            {/* Success State */}
            {status === 'success' && (
              <div>
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 sm:p-8 text-center">
                  <CheckCircleIcon className="w-16 h-16 sm:w-20 sm:h-20 text-white mx-auto mb-3 sm:mb-4" />
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    {t('payment.paymentSuccessful')}
                  </h2>
                  <p className="text-sm sm:text-base text-white/90" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    {t('payment.bookingSuccessful')}
                  </p>
                </div>

                <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
                  {/* Reference ID */}
                  <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
                    <div className="text-xs sm:text-sm text-gray-600 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                      {t('payment.transactionId')}
                    </div>
                    <div className="text-lg sm:text-2xl font-bold text-blue-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'ltr' }}>
                      {refId}
                    </div>
                  </div>

                  {/* Flight Info */}
                  {bookingData && (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>{t('payment.flightNumber')}</span>
                        <span className="font-bold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                          {bookingData.flight.flightNumber}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>{t('payment.route')}</span>
                        <span className="font-bold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                          {getCityName(bookingData.flight.origin)} → {getCityName(bookingData.flight.destination)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>{t('payment.paidAmount')}</span>
                        <span className="font-bold text-green-600" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                          {language === 'en' 
                            ? bookingData.totalPrice.toLocaleString('en-US')
                            : language === 'ar'
                            ? bookingData.totalPrice.toLocaleString('ar-SA')
                            : bookingData.totalPrice.toLocaleString('fa-IR')} {t('flights.currency')}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2 sm:space-y-3 pt-2 sm:pt-4">
                    <button
                      onClick={handleDownloadPDF}
                      className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-2.5 sm:py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                      style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
                    >
                      <ArrowDownTrayIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      {t('payment.downloadTicket')}
                    </button>

                    <button
                      onClick={handleDownloadPDF}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 sm:py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                      style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
                    >
                      <PrinterIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      {t('payment.printTicket')}
                    </button>

                    <button
                      onClick={() => navigate('/')}
                      className="w-full bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 font-bold py-2.5 sm:py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                      style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
                    >
                      <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      {t('payment.returnToHome')}
                    </button>
                  </div>

                  {/* Notice */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-yellow-800" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                        {t('payment.ticketEmailSent')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Failed State */}
            {status === 'failed' && (
              <div>
                <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 sm:p-8 text-center">
                  <XCircleIcon className="w-16 h-16 sm:w-20 sm:h-20 text-white mx-auto mb-3 sm:mb-4" />
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    {t('payment.paymentFailed')}
                  </h2>
                  <p className="text-sm sm:text-base text-white/90" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    {t('payment.paymentNotCompleted')}
                  </p>
                </div>

                <div className="p-4 sm:p-8 space-y-3 sm:space-y-4">
                  <p className="text-center text-sm sm:text-base text-gray-600" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    {t('payment.paymentCancelled')}
                  </p>

                  <button
                    onClick={() => navigate('/flights/results')}
                    className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base"
                    style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
                  >
                    {t('payment.searchAgain')}
                  </button>

                  <button
                    onClick={() => navigate('/')}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 sm:py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                    style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
                  >
                    <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    {t('payment.returnToHome')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentVerifyPage;

