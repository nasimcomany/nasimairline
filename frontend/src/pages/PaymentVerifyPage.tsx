import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import { paymentService } from '../services/paymentService';
import { generateTicketPDF } from '../utils/pdfGenerator';
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
        setStatus('success');
        setRefId(result.refId);
        sessionStorage.removeItem('pendingBooking');
        
        // Save booking to localStorage
        const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        bookings.push({
          ...booking,
          refId: result.refId,
          bookingDate: new Date().toISOString(),
          pnr: generatePNR()
        });
        localStorage.setItem('userBookings', JSON.stringify(bookings));
      } else {
        setStatus('failed');
      }
    } catch (error) {
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

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Verifying State */}
            {status === 'verifying' && (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-900 mb-6"></div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  در حال تایید پرداخت...
                </h2>
                <p className="text-gray-600" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  لطفاً صبر کنید
                </p>
              </div>
            )}

            {/* Success State */}
            {status === 'success' && (
              <div>
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-8 text-center">
                  <CheckCircleIcon className="w-20 h-20 text-white mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                    پرداخت موفق!
                  </h2>
                  <p className="text-white/90" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                    رزرو شما با موفقیت انجام شد
                  </p>
                </div>

                <div className="p-8 space-y-6">
                  {/* Reference ID */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="text-sm text-gray-600 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      شماره پیگیری تراکنش:
                    </div>
                    <div className="text-2xl font-bold text-blue-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'ltr' }}>
                      {refId}
                    </div>
                  </div>

                  {/* Flight Info */}
                  {bookingData && (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>شماره پرواز:</span>
                        <span className="font-bold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                          {bookingData.flight.flightNumber}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>مسیر:</span>
                        <span className="font-bold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                          {bookingData.flight.origin} → {bookingData.flight.destination}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>مبلغ پرداختی:</span>
                        <span className="font-bold text-green-600" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                          {bookingData.totalPrice.toLocaleString('fa-IR')} تومان
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-4">
                    <button
                      onClick={handleDownloadPDF}
                      className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                      style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
                    >
                      <ArrowDownTrayIcon className="w-5 h-5" />
                      دانلود بلیط (PDF)
                    </button>

                    <button
                      onClick={handleDownloadPDF}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                      style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
                    >
                      <PrinterIcon className="w-5 h-5" />
                      چاپ بلیط
                    </button>

                    <button
                      onClick={() => navigate('/')}
                      className="w-full bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                      style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
                    >
                      <HomeIcon className="w-5 h-5" />
                      بازگشت به صفحه اصلی
                    </button>
                  </div>

                  {/* Notice */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <ClockIcon className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                      <p className="text-xs text-yellow-800" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                        بلیط الکترونیکی به ایمیل شما ارسال شده است. لطفاً قبل از پرواز، بلیط را چاپ کنید یا روی موبایل ذخیره کنید.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Failed State */}
            {status === 'failed' && (
              <div>
                <div className="bg-gradient-to-r from-red-600 to-red-700 p-8 text-center">
                  <XCircleIcon className="w-20 h-20 text-white mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                    پرداخت ناموفق
                  </h2>
                  <p className="text-white/90" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                    متأسفانه پرداخت شما انجام نشد
                  </p>
                </div>

                <div className="p-8 space-y-4">
                  <p className="text-center text-gray-600" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                    پرداخت توسط شما لغو شد یا با خطا مواجه شد
                  </p>

                  <button
                    onClick={() => navigate('/flights/results')}
                    className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 rounded-lg transition-colors"
                    style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
                  >
                    جستجوی مجدد پرواز
                  </button>

                  <button
                    onClick={() => navigate('/')}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
                  >
                    <HomeIcon className="w-5 h-5" />
                    بازگشت به صفحه اصلی
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

