import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import GlassmorphismHeader from '../components/Layout/GlassmorphismHeader';
import { 
  PaperAirplaneIcon, 
  CalendarDaysIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const FlightSearchPage: React.FC = () => {
  const { flights, loading, searchParams } = useSelector((state: RootState) => state.flight);
  
  // Form state
  const [tripType, setTripType] = useState<'round' | 'oneway' | 'multi'>('round');
  const [from, setFrom] = useState('تهران (THR)');
  const [to, setTo] = useState('دبی (DXB)');
  const [departDate, setDepartDate] = useState('2024-01-15');
  const [returnDate, setReturnDate] = useState('2024-01-22');
  const [priceRange, setPriceRange] = useState([200, 1200]);
  const [passengers, setPassengers] = useState('2 بزرگسال، 1 کودک');

  const handleSwapCities = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <GlassmorphismHeader />

      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/airport-crew.jpg)'
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* Runway lights effect */}
        <div className="absolute bottom-0 left-0 right-0 h-32">
          <div className="flex justify-between px-8">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="w-1 h-20 bg-yellow-400/60 blur-sm"></div>
            ))}
          </div>
        </div>
        
        {/* Misty atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-3xl">

          {/* Main search panel */}
          <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/30">
            {/* Trip type selection */}
            <div className="flex gap-1.5 mb-6">
              <button
                onClick={() => setTripType('round')}
                className={`px-4 py-2 rounded-lg text-sm font-medium persian-font-vazir transition-all duration-300 ${
                  tripType === 'round'
                    ? 'bg-blue-200 text-blue-900'
                    : 'bg-blue-900/50 text-white hover:bg-blue-800/50'
                }`}
              >
                رفت و برگشت
              </button>
              <button
                onClick={() => setTripType('oneway')}
                className={`px-4 py-2 rounded-lg text-sm font-medium persian-font-vazir transition-all duration-300 ${
                  tripType === 'oneway'
                    ? 'bg-blue-200 text-blue-900'
                    : 'bg-blue-900/50 text-white hover:bg-blue-800/50'
                }`}
              >
                یک طرفه
              </button>
              <button
                onClick={() => setTripType('multi')}
                className={`px-4 py-2 rounded-lg text-sm font-medium persian-font-vazir transition-all duration-300 ${
                  tripType === 'multi'
                    ? 'bg-blue-200 text-blue-900'
                    : 'bg-blue-900/50 text-white hover:bg-blue-800/50'
                }`}
              >
                چند شهری
              </button>
            </div>

            {/* Search form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* From */}
              <div>
                <label className="flex items-center gap-1.5 text-white font-medium mb-1.5 text-sm persian-font-vazir">
                  <PaperAirplaneIcon className="w-4 h-4" />
                  از
                </label>
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                  <input
                    type="text"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="w-full bg-transparent text-blue-900 font-medium placeholder-blue-600/60 focus:outline-none text-sm persian-font-vazir"
                    placeholder="شهر یا فرودگاه"
                  />
                </div>
              </div>

              {/* To */}
              <div>
                <label className="flex items-center gap-1.5 text-white font-medium mb-1.5 text-sm persian-font-vazir">
                  <PaperAirplaneIcon className="w-4 h-4" />
                  به
                </label>
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                  <input
                    type="text"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full bg-transparent text-blue-900 font-medium placeholder-blue-600/60 focus:outline-none text-sm persian-font-vazir"
                    placeholder="شهر یا فرودگاه"
                  />
                </div>
              </div>

              {/* Depart date */}
              <div>
                <label className="flex items-center gap-1.5 text-white font-medium mb-1.5 text-sm persian-font-vazir">
                  <CalendarDaysIcon className="w-4 h-4" />
                  تاریخ رفت
                </label>
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                  <input
                    type="date"
                    value={departDate}
                    onChange={(e) => setDepartDate(e.target.value)}
                    className="w-full bg-transparent text-blue-900 font-medium focus:outline-none text-sm persian-font-vazir"
                  />
                </div>
              </div>

              {/* Return date */}
              {tripType === 'round' && (
                <div>
                  <label className="flex items-center gap-1.5 text-white font-medium mb-1.5 text-sm persian-font-vazir">
                    <CalendarDaysIcon className="w-4 h-4" />
                    تاریخ برگشت
                  </label>
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full bg-transparent text-blue-900 font-medium focus:outline-none text-sm persian-font-vazir"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Swap button */}
            <div className="flex justify-center mb-4">
              <button
                onClick={handleSwapCities}
                className="p-2 bg-blue-900/50 hover:bg-blue-800/50 text-white rounded-full transition-all duration-300"
              >
                <ArrowPathIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Price and passengers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Price range */}
              <div>
                <label className="flex items-center gap-1.5 text-white font-medium mb-1.5 text-sm persian-font-vazir">
                  <CurrencyDollarIcon className="w-4 h-4" />
                  محدوده قیمت
                </label>
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                  <input
                    type="text"
                    value={`$${priceRange[0]} - $${priceRange[1]}`}
                    readOnly
                    className="w-full bg-transparent text-blue-900 font-medium placeholder-blue-600/60 focus:outline-none text-sm persian-font-vazir"
                    placeholder="محدوده قیمت"
                  />
                </div>
              </div>

              {/* Passengers */}
              <div>
                <label className="flex items-center gap-1.5 text-white font-medium mb-1.5 text-sm persian-font-vazir">
                  <UserGroupIcon className="w-4 h-4" />
                  مسافران
                </label>
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                  <input
                    type="text"
                    value={passengers}
                    onChange={(e) => setPassengers(e.target.value)}
                    className="w-full bg-transparent text-blue-900 font-medium placeholder-blue-600/60 focus:outline-none text-sm persian-font-vazir"
                    placeholder="تعداد مسافران"
                  />
                </div>
              </div>
            </div>

            {/* Search button */}
            <div className="flex justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                <PaperAirplaneIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default FlightSearchPage;
