import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import { paymentService } from '../services/paymentService';
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
  const { flight, passengers, contactInfo, totalPrice } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!flight || !passengers || !contactInfo) {
      navigate('/');
    }
  }, [flight, passengers, contactInfo, navigate]);

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const callbackUrl = `${window.location.origin}/payment/verify`;
      
      const paymentData = {
        amount: totalPrice,
        description: `خرید بلیط پرواز ${flight.flightNumber} - ${flight.origin} به ${flight.destination}`,
        email: contactInfo.email,
        mobile: contactInfo.phone,
        callbackUrl
      };

      // Save booking data to sessionStorage for after payment
      sessionStorage.setItem('pendingBooking', JSON.stringify({
        flight,
        passengers,
        contactInfo,
        totalPrice
      }));

      const response = await paymentService.requestPayment(paymentData);
      
      // Redirect to ZarinPal
      paymentService.redirectToGateway(response.authority);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (!flight) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <EmiratesHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Payment Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6">
              <h1 className="text-2xl font-bold text-white text-center flex items-center justify-center gap-3" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                <CreditCardIcon className="w-8 h-8" />
                پرداخت امن
              </h1>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <ExclamationCircleIcon className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="text-red-800 font-bold mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      خطا در پرداخت
                    </p>
                    <p className="text-sm text-red-700" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* Flight Summary */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-bold text-gray-900 mb-3" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  خلاصه رزرو
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>شماره پرواز:</span>
                    <span className="font-bold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      {flight.flightNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>مسیر:</span>
                    <span className="font-bold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      {flight.origin} → {flight.destination}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>تعداد مسافران:</span>
                    <span className="font-bold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      {passengers.length} نفر
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-blue-300">
                    <span className="text-lg font-bold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      مبلغ قابل پرداخت:
                    </span>
                    <span className="text-xl font-bold text-blue-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      {totalPrice.toLocaleString('fa-IR')} تومان
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheckIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-green-900 mb-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      پرداخت امن
                    </h4>
                    <p className="text-sm text-green-800" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      پرداخت شما از طریق درگاه امن زرین‌پال انجام می‌شود. اطلاعات کارت شما کاملاً محفوظ است.
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    در حال انتقال به درگاه پرداخت...
                  </>
                ) : (
                  <>
                    <CreditCardIcon className="w-6 h-6" />
                    پرداخت از طریق زرین‌پال
                  </>
                )}
              </button>

              {/* Cancel Button */}
              <button
                onClick={() => navigate(-1)}
                disabled={loading}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-lg transition-colors"
                style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
              >
                بازگشت
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;

