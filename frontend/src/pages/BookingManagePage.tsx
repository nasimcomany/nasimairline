import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import {
  PaperAirplaneIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  TicketIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  PrinterIcon,
  EnvelopeIcon,
  PhoneIcon,
  ArrowDownTrayIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

interface BookingDetails {
  pnr: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  passenger: {
    name: string;
    nationalId: string;
    email: string;
    phone: string;
  };
  flight: {
    flightNumber: string;
    airline: string;
    origin: string;
    destination: string;
    departureDate: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    class: string;
    seat: string;
  };
  payment: {
    amount: number;
    method: string;
    status: string;
    date: string;
  };
}

const BookingManagePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Mock data - در آینده از API دریافت می‌شود
  const mockBooking: BookingDetails = {
    pnr: 'NA12345',
    status: 'confirmed',
    passenger: {
      name: 'علی احمدی',
      nationalId: '1234567890',
      email: 'ali@example.com',
      phone: '09123456789'
    },
    flight: {
      flightNumber: 'NA101',
      airline: 'Nasim Air',
      origin: 'Tehran',
      destination: 'Dubai',
      departureDate: '1403/09/15',
      departureTime: '08:00',
      arrivalTime: '10:30',
      duration: '2h 30m',
      class: 'اکونومی',
      seat: '12A'
    },
    payment: {
      amount: 3500000,
      method: 'کارت بانکی',
      status: 'پرداخت شده',
      date: '1403/09/10'
    }
  };

  const [booking] = useState<BookingDetails>(mockBooking);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'تایید شده';
      case 'pending':
        return 'در انتظار تایید';
      case 'cancelled':
        return 'لغو شده';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <EmiratesHeader />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1
              className="text-white text-3xl font-bold mb-2"
              style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'rtl' }}
            >
              جزئیات رزرو
            </h1>
            <p className="text-white/80 text-sm" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
              کد رهگیری: {booking.pnr}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Status Banner */}
          <div className={`mb-6 p-4 rounded-xl border-2 flex items-center justify-between ${getStatusColor(booking.status)}`}>
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="w-8 h-8" />
              <div>
                <h3 className="text-lg font-bold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  وضعیت رزرو: {getStatusText(booking.status)}
                </h3>
                <p className="text-sm" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  رزرو شما با موفقیت ثبت شده است
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="bg-white/50 hover:bg-white/80 p-2 rounded-lg transition-colors" title="چاپ">
                <PrinterIcon className="w-5 h-5" />
              </button>
              <button className="bg-white/50 hover:bg-white/80 p-2 rounded-lg transition-colors" title="دانلود">
                <ArrowDownTrayIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Flight Details - Main Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                        <PaperAirplaneIcon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                          {booking.flight.airline}
                        </h2>
                        <p className="text-white/80 text-sm" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                          {booking.flight.flightNumber}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-sm" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                        کلاس پرواز
                      </div>
                      <div className="text-white text-lg font-bold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                        {booking.flight.class}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Flight Route */}
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                        {booking.flight.departureTime}
                      </div>
                      <div className="text-sm text-gray-500 mb-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                        {booking.flight.departureDate}
                      </div>
                      <div className="flex items-center justify-center gap-2 text-gray-700">
                        <MapPinIcon className="w-5 h-5" />
                        <span className="font-bold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                          {booking.flight.origin}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <div className="text-sm text-gray-500 mb-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                        {booking.flight.duration}
                      </div>
                      <div className="w-full h-0.5 bg-gray-300 relative">
                        <PaperAirplaneIcon className="w-6 h-6 text-blue-900 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-90 bg-white" />
                      </div>
                      <div className="text-xs text-gray-400 mt-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                        پرواز مستقیم
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                        {booking.flight.arrivalTime}
                      </div>
                      <div className="text-sm text-gray-500 mb-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                        {booking.flight.departureDate}
                      </div>
                      <div className="flex items-center justify-center gap-2 text-gray-700">
                        <MapPinIcon className="w-5 h-5" />
                        <span className="font-bold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                          {booking.flight.destination}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Seat Info */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TicketIcon className="w-5 h-5 text-blue-900" />
                        <span className="text-sm font-bold text-gray-700" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                          شماره صندلی:
                        </span>
                      </div>
                      <span className="text-2xl font-bold text-blue-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                        {booking.flight.seat}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Passenger Info */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  <UserIcon className="w-6 h-6 text-blue-900" />
                  اطلاعات مسافر
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      نام و نام خانوادگی
                    </div>
                    <div className="text-sm font-bold text-gray-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      {booking.passenger.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      کد ملی
                    </div>
                    <div className="text-sm font-bold text-gray-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      {booking.passenger.nationalId}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                    <span style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      {booking.passenger.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <PhoneIcon className="w-4 h-4 text-gray-400" />
                    <span style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      {booking.passenger.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  <CreditCardIcon className="w-6 h-6 text-blue-900" />
                  اطلاعات پرداخت
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      مبلغ کل:
                    </span>
                    <span className="text-lg font-bold text-gray-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      {booking.payment.amount.toLocaleString('fa-IR')} تومان
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      روش پرداخت:
                    </span>
                    <span className="text-sm font-bold text-gray-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      {booking.payment.method}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      وضعیت:
                    </span>
                    <span className="text-sm font-bold text-green-600" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      {booking.payment.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      تاریخ پرداخت:
                    </span>
                    <span className="text-sm text-gray-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      {booking.payment.date}
                    </span>
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <ExclamationCircleIcon className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-yellow-800 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      نکات مهم
                    </h4>
                    <ul className="text-xs text-yellow-700 space-y-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      <li>• لطفاً 2 ساعت قبل از پرواز در فرودگاه حضور یابید</li>
                      <li>• مدارک شناسایی معتبر همراه داشته باشید</li>
                      <li>• بلیط الکترونیکی را چاپ کنید یا روی موبایل ذخیره کنید</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-8 py-3 rounded-lg transition-colors"
              style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
            >
              بازگشت به صفحه اصلی
            </button>
            <button
              className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-8 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg"
              style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
            >
              چک‌این آنلاین
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingManagePage;

