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
  const [pnr, setPnr] = useState('');
  const [tickets, setTickets] = useState<string[]>([]);
  const [bookingData, setBookingData] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const provider = (searchParams.get('provider') || '').toLowerCase();
      const authority = searchParams.get('Authority');
      const statusParam = searchParams.get('Status');
      const bookingRef =
        searchParams.get('ref') ||
        searchParams.get('booking_reference') ||
        searchParams.get('OrderId') ||
        '';

      const pendingBookingRaw = sessionStorage.getItem('pendingBooking');
      let booking: any = null;
      if (pendingBookingRaw) {
        try {
          booking = JSON.parse(pendingBookingRaw);
          setBookingData(booking);
        } catch {
          booking = null;
        }
      }

      // ---- Nira IBE return (airline pattern) ----
      if (provider === 'nira' || (!authority && bookingRef)) {
        try {
          const params: Record<string, string> = {};
          searchParams.forEach((value, key) => {
            params[key] = value;
          });
          if (!params.ref && bookingRef) {
            params.ref = bookingRef;
          }
          // Default success if Nira only redirects on success without status
          if (!params.status && !params.Status && !params.result) {
            params.status = 'success';
          }

          const result = await paymentService.verifyNiraReturn(params);
          const pollRef = result.booking_reference || bookingRef;
          let confirmed = Boolean(result.ok);
          let finalPnr = result.pnr || '';
          let finalTickets = result.tickets || [];

          // Callback may arrive slightly after browser return — poll briefly
          if (pollRef && !confirmed) {
            for (let i = 0; i < 6; i++) {
              await new Promise((r) => setTimeout(r, 1500));
              const st = await paymentService.getNiraPaymentStatus(pollRef);
              if (st.confirmed) {
                confirmed = true;
                finalPnr = st.pnr || finalPnr;
                finalTickets = st.tickets || finalTickets;
                break;
              }
              if (st.booking_status === 'CANCELLED' || st.booking_status === 'EXPIRED') {
                break;
              }
            }
          } else if (pollRef && confirmed) {
            try {
              const st = await paymentService.getNiraPaymentStatus(pollRef);
              finalPnr = st.pnr || finalPnr;
              finalTickets = st.tickets || finalTickets;
            } catch {
              /* ignore */
            }
          }

          if (!confirmed) {
            setStatus('failed');
            sessionStorage.removeItem('pendingBooking');
            return;
          }

          setStatus('success');
          setRefId(pollRef || bookingRef);
          setPnr(finalPnr);
          setTickets(finalTickets);
          sessionStorage.removeItem('pendingBooking');

          if (booking) {
            const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
            bookings.push({
              ...booking,
              refId: pollRef || bookingRef,
              pnr: finalPnr || booking?.bookingDraft?.booking?.booking_reference || '',
              tickets: finalTickets,
              bookingDate: new Date().toISOString(),
              bookingId: booking?.bookingDraft?.booking?.id || null,
              provider: 'nira',
            });
            localStorage.setItem('userBookings', JSON.stringify(bookings));
          }
        } catch (error) {
          console.error('Nira payment return failed:', error);
          setStatus('failed');
        }
        return;
      }

      // ---- Local gateways (Zarinpal etc.) ----
      if (!pendingBookingRaw || !booking) {
        setStatus('failed');
        return;
      }

      if (statusParam === 'NOK' || !authority) {
        setStatus('failed');
        sessionStorage.removeItem('pendingBooking');
        return;
      }

      try {
        const result = await paymentService.verifyPayment({
          authority,
          amount: booking.totalPrice
        });

        if (result.status !== 'success') {
          setStatus('failed');
          return;
        }

        const paymentId = booking?.bookingDraft?.payment?.id;
        if (paymentId) {
          await bookingService.confirmPayment(paymentId, result.refId);
        }

        setStatus('success');
        setRefId(result.refId);
        sessionStorage.removeItem('pendingBooking');

        const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        bookings.push({
          ...booking,
          refId: result.refId,
          bookingDate: new Date().toISOString(),
          pnr: booking?.bookingDraft?.booking?.booking_reference || '',
          bookingId: booking?.bookingDraft?.booking?.id || null,
        });
        localStorage.setItem('userBookings', JSON.stringify(bookings));
      } catch (error) {
        console.error('Payment verification/confirmation failed:', error);
        setStatus('failed');
      }
    };

    verifyPayment();
  }, [searchParams]);

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
            {status === 'verifying' && (
              <div className="p-6 sm:p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-blue-900 mb-4 sm:mb-6"></div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                  {t('payment.verifying')}
                </h2>
                <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                  {t('payment.pleaseWait')}
                </p>
              </div>
            )}

            {status === 'success' && (
              <div>
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 sm:p-8 text-center">
                  <CheckCircleIcon className="w-16 h-16 sm:w-20 sm:h-20 text-white mx-auto mb-3 sm:mb-4" />
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    {t('payment.paymentSuccessful')}
                  </h2>
                  <p className="text-sm sm:text-base text-white/90" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    {t('payment.bookingSuccessful')}
                  </p>
                </div>

                <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
                  <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
                    <div className="text-xs sm:text-sm text-gray-600 mb-1" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                      {t('payment.transactionId')}
                    </div>
                    <div className="text-lg sm:text-2xl font-bold text-blue-900" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: 'ltr' }}>
                      {refId}
                    </div>
                  </div>

                  {(pnr || tickets.length > 0) && (
                    <div className="bg-emerald-50 rounded-lg p-3 sm:p-4 border border-emerald-200 space-y-2">
                      {pnr && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>PNR</span>
                          <span className="font-bold" style={{ direction: 'ltr' }}>{pnr}</span>
                        </div>
                      )}
                      {tickets.length > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>E-Ticket</span>
                          <span className="font-bold" style={{ direction: 'ltr' }}>{tickets.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {bookingData && (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>{t('payment.flightNumber')}</span>
                        <span className="font-bold" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                          {bookingData.flight?.flightNumber}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>{t('payment.route')}</span>
                        <span className="font-bold" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                          {getCityName(bookingData.flight?.origin)} → {getCityName(bookingData.flight?.destination)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>{t('payment.paidAmount')}</span>
                        <span className="font-bold text-green-600" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                          {language === 'en' 
                            ? Number(bookingData.totalPrice || 0).toLocaleString('en-US')
                            : language === 'ar'
                            ? Number(bookingData.totalPrice || 0).toLocaleString('ar-SA')
                            : Number(bookingData.totalPrice || 0).toLocaleString('fa-IR')} {t('flights.currency')}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 sm:space-y-3 pt-2 sm:pt-4">
                    <button
                      onClick={handleDownloadPDF}
                      className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-2.5 sm:py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                      style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
                    >
                      <ArrowDownTrayIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      {t('payment.downloadTicket')}
                    </button>

                    <button
                      onClick={handleDownloadPDF}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 sm:py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                      style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
                    >
                      <PrinterIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      {t('payment.printTicket')}
                    </button>

                    <button
                      onClick={() => navigate('/')}
                      className="w-full bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 font-bold py-2.5 sm:py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                      style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
                    >
                      <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      {t('payment.returnToHome')}
                    </button>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-yellow-800" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                        {t('payment.ticketEmailSent')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {status === 'failed' && (
              <div>
                <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 sm:p-8 text-center">
                  <XCircleIcon className="w-16 h-16 sm:w-20 sm:h-20 text-white mx-auto mb-3 sm:mb-4" />
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    {t('payment.paymentFailed')}
                  </h2>
                  <p className="text-sm sm:text-base text-white/90" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    {t('payment.paymentNotCompleted')}
                  </p>
                </div>

                <div className="p-4 sm:p-8 space-y-3 sm:space-y-4">
                  <p className="text-center text-sm sm:text-base text-gray-600" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    {t('payment.paymentCancelled')}
                  </p>

                  <button
                    onClick={() => navigate('/flights/results')}
                    className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base"
                    style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
                  >
                    {t('payment.searchAgain')}
                  </button>

                  <button
                    onClick={() => navigate('/')}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 sm:py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                    style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
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
