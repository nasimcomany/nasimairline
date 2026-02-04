import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { RootState } from '../store';
import { setSearchParams } from '../store/slices/flightSlice';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import { 
  PaperAirplaneIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { cities } from '../data/cities';
import CustomSelect from '../components/CustomSelect/CustomSelect';
import { useLanguage } from '../contexts/LanguageContext';
import { checkAvailability, FlightAvailability } from '../services/niraApi';

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
  originalData: FlightAvailability;
  // فیلدهای جدید برای اطلاعات لحظه‌ای
  actualDepartureTime?: string;
  actualArrivalTime?: string;
  delayMinutes?: number;
  departureGate?: string;
  arrivalGate?: string;
}

const FlightResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const searchParamsFromStore = useSelector((state: RootState) => state.flight.searchParams);
  const { t, language } = useLanguage();
  
  // Get searchParams from location state (if coming from map) or Redux store (if coming from homepage)
  const searchParams = (location.state as any)?.searchParams || searchParamsFromStore;
  
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'departure'>('price');
  const [filterStops, setFilterStops] = useState<'all' | 'direct' | 'one'>('all');

  // Save searchParams to Redux if coming from location state
  useEffect(() => {
    if ((location.state as any)?.searchParams) {
      dispatch(setSearchParams((location.state as any).searchParams));
    }
  }, [location.state, dispatch]);

  useEffect(() => {
    const fetchFlights = async () => {
      if (!searchParams) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get passenger counts
        const passengers = typeof searchParams.passengers === 'object' 
          ? searchParams.passengers 
          : { adults: 1, children: 0, infants: 0 };

        // Call NIRA API
        const availableFlights = await checkAvailability({
          origin: searchParams.origin,
          destination: searchParams.destination,
          departure_date: searchParams.departureDate,
          round_trip: searchParams.tripType === 'roundtrip',
          return_date: searchParams.returnDate,
          adult_qty: passengers.adults,
          child_qty: passengers.children,
          infant_qty: passengers.infants,
        });

        // Log full API response for debugging
        console.log('🔍 Full API Response:', JSON.stringify(availableFlights, null, 2));
        console.log('🔍 First Flight ClassStatus:', availableFlights[0]?.ClassStatus);

        // Convert API response to Flight format
        const convertedFlights: Flight[] = availableFlights.flatMap((flight, index) => {
          const departureDateTime = new Date(flight.DepartureDateTime);
          const arrivalDateTime = new Date(flight.ArrivalDateTime);
          
          // Calculate duration
          const durationMs = arrivalDateTime.getTime() - departureDateTime.getTime();
          const hours = Math.floor(durationMs / (1000 * 60 * 60));
          const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
          const duration = `${hours}h ${minutes}m`;

          // If ClassStatus is empty, create a single flight entry with default values
          if (!flight.ClassStatus || !Array.isArray(flight.ClassStatus) || flight.ClassStatus.length === 0) {
            return [{
              id: `${flight.FlightNo}-${index}-0`,
              airline: flight.AirLineCode || 'NSN',
              flightNumber: flight.FlightNo,
              origin: flight.Origin,
              destination: flight.Destination,
              departureTime: departureDateTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              }),
              arrivalTime: arrivalDateTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              }),
              duration: duration,
              price: 0,
              availableSeats: 0,
              class: 'economy' as const,
              stops: flight.Stops || 0,
              // فیلدهای جدید
              actualDepartureTime: flight.ActualDepartureDateTime 
                ? new Date(flight.ActualDepartureDateTime).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  })
                : undefined,
              actualArrivalTime: flight.ActualArrivalDateTime
                ? new Date(flight.ActualArrivalDateTime).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  })
                : undefined,
              delayMinutes: flight.DelayMinutes,
              departureGate: flight.DepartureGate,
              arrivalGate: flight.ArrivalGate,
              originalData: flight,
            }];
          }

          // If ClassStatus has items, create entries for each class
          return flight.ClassStatus.map((classStatus, classIndex) => {
            // Map cabin class
            let flightClass: 'economy' | 'business' | 'first' = 'economy';
            if (classStatus.CabinClass.toLowerCase().includes('business')) {
              flightClass = 'business';
            } else if (classStatus.CabinClass.toLowerCase().includes('first')) {
              flightClass = 'first';
            }

            return {
              id: `${flight.FlightNo}-${index}-${classIndex}`,
              airline: flight.AirLineCode || 'NSN',
              flightNumber: flight.FlightNo,
              origin: flight.Origin,
              destination: flight.Destination,
              departureTime: departureDateTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              }),
              arrivalTime: arrivalDateTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              }),
              duration: duration,
              price: classStatus.TotalPrice || 0,
              availableSeats: classStatus.Status === 'C' ? 10 : 0, // C means available
              class: flightClass,
              stops: flight.Stops || 0, // استفاده از فیلد جدید
              // فیلدهای جدید
              actualDepartureTime: flight.ActualDepartureDateTime 
                ? new Date(flight.ActualDepartureDateTime).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  })
                : undefined,
              actualArrivalTime: flight.ActualArrivalDateTime
                ? new Date(flight.ActualArrivalDateTime).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  })
                : undefined,
              delayMinutes: flight.DelayMinutes,
              departureGate: flight.DepartureGate,
              arrivalGate: flight.ArrivalGate,
              originalData: flight,
            };
          });
        });

        setFlights(convertedFlights);
      } catch (error) {
        console.error('Error fetching flights:', error);
        setFlights([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [searchParams]);

  if (!searchParams) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EmiratesHeader />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-xl text-gray-600 mb-6" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
            {t('flights.pleaseSearch')}
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-8 py-3 rounded-lg transition-colors"
            style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
          >
            {t('flights.backToHome')}
          </button>
        </div>
      </div>
    );
  }

  const originCity = cities.find(c => c.code === searchParams.origin);
  const destCity = cities.find(c => c.code === searchParams.destination);
  
  const getCityName = (city: typeof originCity) => {
    if (!city) return '';
    return language === 'en' ? city.name : city.nameFa;
  };

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
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 py-6 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h1 
              className="text-white text-2xl sm:text-4xl font-bold mb-3 sm:mb-4 text-center"
              style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
            >
              {t('flights.searchResults')}
            </h1>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 sm:p-6 flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
              <div className="flex items-center gap-2 text-white">
                <PaperAirplaneIcon className="w-5 h-5" />
                <span className="font-bold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  {getCityName(originCity)} → {getCityName(destCity)}
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
                    ? `${searchParams.passengers} ${t('flights.passenger')}`
                    : (() => {
                        const p = searchParams.passengers;
                        const parts = [];
                        if (p?.adults) parts.push(`${p.adults} ${t('passengers.adult')}`);
                        if (p?.children) parts.push(`${p.children} ${t('passengers.child')}`);
                        if (p?.infants) parts.push(`${p.infants} ${t('passengers.infant')}`);
                        return parts.join(language === 'en' ? ', ' : '، ') || `1 ${t('flights.passenger')}`;
                      })()
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 sticky top-4">
                <h3 
                  className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2"
                  style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
                >
                  <AdjustmentsHorizontalIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  {t('flights.filters')}
                </h3>

                {/* Sort By */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    {t('flights.sortBy')}
                  </label>
                  <div style={{ height: '42px' }}>
                    <CustomSelect
                      value={sortBy}
                      onChange={(value) => setSortBy(value as any)}
                      options={[
                        { value: 'price', label: t('flights.price') },
                        { value: 'duration', label: t('flights.duration') },
                        { value: 'departure', label: t('flights.departure') }
                      ]}
                      placeholder={t('flights.price')}
                    />
                  </div>
                </div>

                {/* Filter Stops */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    {t('flights.stops')}
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
                      <span style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>{t('flights.allFlights')}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="stops"
                        checked={filterStops === 'direct'}
                        onChange={() => setFilterStops('direct')}
                        className="w-4 h-4 text-blue-900 focus:ring-blue-900"
                      />
                      <span style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>{t('flights.directOnly')}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="stops"
                        checked={filterStops === 'one'}
                        onChange={() => setFilterStops('one')}
                        className="w-4 h-4 text-blue-900 focus:ring-blue-900"
                      />
                      <span style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>{t('flights.oneStop')}</span>
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
                  <p className="mt-4 text-gray-600" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    {t('flights.loadingFlights')}
                  </p>
                </div>
              ) : sortedFlights.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <XMarkIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-xl text-gray-600" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    {t('flights.noResults')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedFlights.map((flight) => (
                    <div
                      key={flight.id}
                      className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-300"
                    >
                      <div className="p-4 sm:p-6">
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
                          <div className="text-left" style={{ direction: language === 'en' ? 'ltr' : 'rtl' }}>
                            <div className="text-3xl font-bold text-blue-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                              {language === 'en' 
                                ? flight.price.toLocaleString('en-US')
                                : language === 'ar'
                                ? flight.price.toLocaleString('ar-SA')
                                : flight.price.toLocaleString('fa-IR')}
                            </div>
                            <div className="text-sm text-gray-500" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                              {t('flights.currency')}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4">
                          <div className="text-center">
                            <div className="text-lg sm:text-2xl font-bold text-gray-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                              {flight.departureTime}
                            </div>
                            {/* نمایش زمان واقعی اگر تأخیر داشته باشد */}
                            {flight.actualDepartureTime && flight.actualDepartureTime !== flight.departureTime && (
                              <div className="text-xs text-orange-600 font-bold mt-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                                ⏰ واقعی: {flight.actualDepartureTime}
                              </div>
                            )}
                            {/* نمایش تأخیر */}
                            {flight.delayMinutes && flight.delayMinutes > 0 && (
                              <div className="text-xs text-red-600 font-bold mt-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                                ⚠️ تأخیر: {flight.delayMinutes} دقیقه
                              </div>
                            )}
                            {/* نمایش گیت پرواز */}
                            {flight.departureGate && (
                              <div className="text-xs text-blue-600 font-bold mt-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                                🚪 گیت: {flight.departureGate}
                              </div>
                            )}
                            <div className="text-xs sm:text-sm text-gray-500" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                              {getCityName(originCity)}
                            </div>
                          </div>

                          <div className="flex flex-col items-center justify-center">
                            <div className="text-xs sm:text-sm text-gray-500 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                              {flight.duration}
                            </div>
                            <div className="w-full h-0.5 bg-gray-300 relative">
                              <PaperAirplaneIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-900 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-90" />
                            </div>
                            <div className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                              {flight.stops === 0 ? t('flights.noStops') : `${flight.stops} ${t('flights.stopsCount')}`}
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="text-lg sm:text-2xl font-bold text-gray-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                              {flight.arrivalTime}
                            </div>
                            {/* نمایش زمان واقعی فرود اگر تأخیر داشته باشد */}
                            {flight.actualArrivalTime && flight.actualArrivalTime !== flight.arrivalTime && (
                              <div className="text-xs text-orange-600 font-bold mt-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                                ⏰ واقعی: {flight.actualArrivalTime}
                              </div>
                            )}
                            {/* نمایش گیت فرود */}
                            {flight.arrivalGate && (
                              <div className="text-xs text-blue-600 font-bold mt-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                                🚪 گیت: {flight.arrivalGate}
                              </div>
                            )}
                            <div className="text-xs sm:text-sm text-gray-500" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                              {getCityName(destCity)}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 sm:pt-4 border-t border-gray-200 gap-3 sm:gap-0">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                              <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                              <span style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                                {flight.availableSeats} {t('flights.availableSeatsRemaining')}
                              </span>
                            </div>
                            <div className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-xs sm:text-sm font-bold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                              {flight.class === 'economy' ? t('class.economy') : flight.class === 'business' ? t('class.business') : t('class.first')}
                            </div>
                          </div>
                          <button
                            onClick={() => navigate(`/booking/details/${flight.id}`, { 
                              state: { 
                                flight: {
                                  ...flight,
                                  origin: originCity?.name || flight.origin,
                                  destination: destCity?.name || flight.destination
                                }
                              } 
                            })}
                            className="w-full sm:w-auto bg-blue-900 hover:bg-blue-800 text-white font-bold px-4 sm:px-8 py-2 sm:py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm sm:text-base"
                            style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                            {t('flights.selectFlight')}
                            <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
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

