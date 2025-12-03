import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import { 
  PaperAirplaneIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { cities } from '../data/cities';

interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  availableSeats: number;
  class: 'economy' | 'business' | 'first';
  stops: number;
}

const FlightResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const searchParams = useSelector((state: RootState) => state.flight.searchParams);
  
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'departure'>('price');
  const [filterStops, setFilterStops] = useState<'all' | 'direct' | 'one'>('all');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockFlights: Flight[] = [
        {
          id: '1',
          airline: 'نسیم ایر',
          flightNumber: 'NA101',
          origin: searchParams?.origin || 'THR',
          destination: searchParams?.destination || 'DXB',
          departureTime: '08:00',
          arrivalTime: '10:30',
          duration: '2h 30m',
          price: 3500000,
          availableSeats: 12,
          class: 'economy',
          stops: 0
        },
        {
          id: '2',
          airline: 'نسیم ایر',
          flightNumber: 'NA103',
          origin: searchParams?.origin || 'THR',
          destination: searchParams?.destination || 'DXB',
          departureTime: '14:00',
          arrivalTime: '16:30',
          duration: '2h 30m',
          price: 3200000,
          availableSeats: 8,
          class: 'economy',
          stops: 0
        },
        {
          id: '3',
          airline: 'نسیم ایر',
          flightNumber: 'NA105',
          origin: searchParams?.origin || 'THR',
          destination: searchParams?.destination || 'DXB',
          departureTime: '18:30',
          arrivalTime: '21:00',
          duration: '2h 30m',
          price: 2900000,
          availableSeats: 15,
          class: 'economy',
          stops: 0
        },
        {
          id: '4',
          airline: 'نسیم ایر',
          flightNumber: 'NA201',
          origin: searchParams?.origin || 'THR',
          destination: searchParams?.destination || 'DXB',
          departureTime: '10:00',
          arrivalTime: '12:30',
          duration: '2h 30m',
          price: 7500000,
          availableSeats: 6,
          class: 'business',
          stops: 0
        },
      ];
      
      setFlights(mockFlights);
      setLoading(false);
    }, 1000);
  }, [searchParams]);

  if (!searchParams) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EmiratesHeader />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-xl text-gray-600 mb-6" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
            لطفاً ابتدا جستجوی پرواز را انجام دهید
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-8 py-3 rounded-lg transition-colors"
            style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
          >
            بازگشت به صفحه اصلی
          </button>
        </div>
      </div>
    );
  }

  const originCity = cities.find(c => c.code === searchParams.origin);
  const destCity = cities.find(c => c.code === searchParams.destination);

  const filteredFlights = flights.filter(flight => {
    if (filterStops === 'direct') return flight.stops === 0;
    if (filterStops === 'one') return flight.stops === 1;
    return true;
  });

  const sortedFlights = [...filteredFlights].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'duration') return a.duration.localeCompare(b.duration);
    if (sortBy === 'departure') return a.departureTime.localeCompare(b.departureTime);
    return 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <EmiratesHeader />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h1 
              className="text-white text-4xl font-bold mb-4 text-center"
              style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'rtl' }}
            >
              نتایج جستجوی پرواز
            </h1>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 flex items-center justify-center gap-8 flex-wrap">
              <div className="flex items-center gap-2 text-white">
                <PaperAirplaneIcon className="w-5 h-5" />
                <span className="font-bold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  {originCity?.nameFa} → {destCity?.nameFa}
                </span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <ClockIcon className="w-5 h-5" />
                <span style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  {searchParams.departureDate}
                  {searchParams.returnDate && ` - ${searchParams.returnDate}`}
                </span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <UserGroupIcon className="w-5 h-5" />
                <span style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  {typeof searchParams.passengers === 'number' 
                    ? `${searchParams.passengers} مسافر`
                    : (() => {
                        const p = searchParams.passengers;
                        const total = (p?.adults || 0) + (p?.children || 0) + (p?.infants || 0);
                        const parts = [];
                        if (p?.adults) parts.push(`${p.adults} بزرگسال`);
                        if (p?.children) parts.push(`${p.children} کودک`);
                        if (p?.infants) parts.push(`${p.infants} نوزاد`);
                        return parts.join('، ') || '1 مسافر';
                      })()
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                <h3 
                  className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"
                  style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'rtl' }}
                >
                  <AdjustmentsHorizontalIcon className="w-6 h-6" />
                  فیلترها
                </h3>

                {/* Sort By */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-3" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'rtl' }}>
                    مرتب‌سازی بر اساس
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                    style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'rtl' }}
                  >
                    <option value="price">ارزان‌ترین</option>
                    <option value="duration">سریع‌ترین</option>
                    <option value="departure">زودترین پرواز</option>
                  </select>
                </div>

                {/* Filter Stops */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'rtl' }}>
                    تعداد توقف
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="stops"
                        checked={filterStops === 'all'}
                        onChange={() => setFilterStops('all')}
                        className="w-4 h-4 text-blue-900 focus:ring-blue-900"
                      />
                      <span style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>همه پروازها</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="stops"
                        checked={filterStops === 'direct'}
                        onChange={() => setFilterStops('direct')}
                        className="w-4 h-4 text-blue-900 focus:ring-blue-900"
                      />
                      <span style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>بدون توقف</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="stops"
                        checked={filterStops === 'one'}
                        onChange={() => setFilterStops('one')}
                        className="w-4 h-4 text-blue-900 focus:ring-blue-900"
                      />
                      <span style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>یک توقف</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Flights List */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-900"></div>
                  <p className="mt-4 text-gray-600" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                    در حال جستجوی پروازها...
                  </p>
                </div>
              ) : sortedFlights.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <XMarkIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-xl text-gray-600" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                    پروازی یافت نشد
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedFlights.map((flight) => (
                    <div
                      key={flight.id}
                      className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-300"
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center">
                              <PaperAirplaneIcon className="w-8 h-8 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                                {flight.airline}
                              </h3>
                              <p className="text-sm text-gray-500" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                                {flight.flightNumber}
                              </p>
                            </div>
                          </div>
                          <div className="text-left">
                            <div className="text-3xl font-bold text-blue-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                              {flight.price.toLocaleString('fa-IR')}
                            </div>
                            <div className="text-sm text-gray-500" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                              تومان
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                              {flight.departureTime}
                            </div>
                            <div className="text-sm text-gray-500" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                              {originCity?.nameFa}
                            </div>
                          </div>

                          <div className="flex flex-col items-center justify-center">
                            <div className="text-sm text-gray-500 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                              {flight.duration}
                            </div>
                            <div className="w-full h-0.5 bg-gray-300 relative">
                              <PaperAirplaneIcon className="w-5 h-5 text-blue-900 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-90" />
                            </div>
                            <div className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                              {flight.stops === 0 ? 'بدون توقف' : `${flight.stops} توقف`}
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                              {flight.arrivalTime}
                            </div>
                            <div className="text-sm text-gray-500" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                              {destCity?.nameFa}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <CheckCircleIcon className="w-5 h-5 text-green-600" />
                              <span style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                                {flight.availableSeats} صندلی باقی‌مانده
                              </span>
                            </div>
                            <div className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-sm font-bold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                              {flight.class === 'economy' ? 'اکونومی' : flight.class === 'business' ? 'بیزینس' : 'فرست کلاس'}
                            </div>
                          </div>
                          <button
                            onClick={() => navigate(`/booking/details/${flight.id}`)}
                            className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-8 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
                            style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                            انتخاب پرواز
                            <ArrowRightIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightResultsPage;

