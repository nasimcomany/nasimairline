import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import {
  PaperAirplaneIcon,
  ClockIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  CalendarDaysIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface FlightStatus {
  flightNumber: string;
  airline: string;
  status: 'on-time' | 'delayed' | 'cancelled' | 'departed' | 'arrived';
  origin: string;
  destination: string;
  scheduledDeparture: string;
  actualDeparture: string;
  scheduledArrival: string;
  estimatedArrival: string;
  gate: string;
  terminal: string;
  delay: number; // minutes
}

const FlightStatusPage: React.FC = () => {
  const navigate = useNavigate();

  // Mock data
  const mockFlight: FlightStatus = {
    flightNumber: 'NA101',
    airline: 'نسیم ایر',
    status: 'on-time',
    origin: 'تهران (THR)',
    destination: 'دبی (DXB)',
    scheduledDeparture: '08:00',
    actualDeparture: '08:00',
    scheduledArrival: '10:30',
    estimatedArrival: '10:30',
    gate: 'A12',
    terminal: '1',
    delay: 0
  };

  const [flight] = useState<FlightStatus>(mockFlight);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'on-time':
        return {
          color: 'bg-green-100 text-green-800 border-green-300',
          icon: <CheckCircleIcon className="w-8 h-8 text-green-600" />,
          text: 'به موقع',
          description: 'پرواز طبق برنامه انجام می‌شود'
        };
      case 'delayed':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icon: <ExclamationCircleIcon className="w-8 h-8 text-yellow-600" />,
          text: 'تاخیر',
          description: 'پرواز با تاخیر انجام می‌شود'
        };
      case 'cancelled':
        return {
          color: 'bg-red-100 text-red-800 border-red-300',
          icon: <XCircleIcon className="w-8 h-8 text-red-600" />,
          text: 'لغو شده',
          description: 'پرواز لغو شده است'
        };
      case 'departed':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: <PaperAirplaneIcon className="w-8 h-8 text-blue-600" />,
          text: 'پرواز کرده',
          description: 'هواپیما از مبدأ پرواز کرده است'
        };
      case 'arrived':
        return {
          color: 'bg-purple-100 text-purple-800 border-purple-300',
          icon: <CheckCircleIcon className="w-8 h-8 text-purple-600" />,
          text: 'فرود آمده',
          description: 'هواپیما به مقصد رسیده است'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: <ClockIcon className="w-8 h-8 text-gray-600" />,
          text: 'نامشخص',
          description: ''
        };
    }
  };

  const statusConfig = getStatusConfig(flight.status);

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
              وضعیت پرواز
            </h1>
            <p className="text-white/80 text-sm" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
              شماره پرواز: {flight.flightNumber}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Status Banner */}
          <div className={`mb-6 p-6 rounded-xl border-2 ${statusConfig.color}`}>
            <div className="flex items-center gap-4">
              {statusConfig.icon}
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  {statusConfig.text}
                </h2>
                <p className="text-sm" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  {statusConfig.description}
                </p>
                {flight.delay > 0 && (
                  <p className="text-sm font-bold mt-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                    تاخیر: {flight.delay} دقیقه
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Flight Details Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                  <PaperAirplaneIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                    {flight.airline}
                  </h3>
                  <p className="text-white/80" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                    {flight.flightNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* Route */}
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                    {flight.actualDeparture}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-700 mb-1">
                    <MapPinIcon className="w-5 h-5" />
                    <span className="font-bold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      {flight.origin}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                    زمان برنامه‌ریزی: {flight.scheduledDeparture}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="w-full h-0.5 bg-gray-300 relative">
                    <PaperAirplaneIcon className="w-6 h-6 text-blue-900 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-90 bg-white" />
                  </div>
                  <div className="text-xs text-gray-400 mt-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                    پرواز مستقیم
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                    {flight.estimatedArrival}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-700 mb-1">
                    <MapPinIcon className="w-5 h-5" />
                    <span className="font-bold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      {flight.destination}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                    زمان برنامه‌ریزی: {flight.scheduledArrival}
                  </div>
                </div>
              </div>

              {/* Terminal & Gate Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-sm text-gray-600 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                    ترمینال
                  </div>
                  <div className="text-2xl font-bold text-blue-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                    {flight.terminal}
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-sm text-gray-600 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                    گیت
                  </div>
                  <div className="text-2xl font-bold text-blue-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                    {flight.gate}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/')}
              className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-8 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
              style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
            >
              <ArrowRightIcon className="w-5 h-5" />
              بازگشت به صفحه اصلی
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightStatusPage;

