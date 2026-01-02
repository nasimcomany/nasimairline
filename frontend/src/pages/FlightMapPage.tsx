import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import { useLanguage } from '../contexts/LanguageContext';
import { getOriginCities, checkAvailability, FlightAvailability, OriginCity } from '../services/niraApi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { IranMap } from 'react-iran-map';
import { 
  MapPinIcon,
  CalendarDaysIcon,
  PaperAirplaneIcon,
  ClockIcon,
  XMarkIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

// Coordinates for major Iranian cities on the map (normalized to fit Iran's actual shape)
// Based on actual geographic coordinates mapped to SVG viewBox
const cityCoordinates: Record<string, { x: number; y: number }> = {
  'THR': { x: 420, y: 280 }, // Tehran
  'MHD': { x: 620, y: 200 }, // Mashhad
  'IKA': { x: 420, y: 280 }, // Tehran Imam Khomeini
  'IFN': { x: 360, y: 380 }, // Isfahan
  'SYZ': { x: 300, y: 520 }, // Shiraz
  'TBZ': { x: 240, y: 160 }, // Tabriz
  'AWZ': { x: 180, y: 480 }, // Ahvaz
  'BND': { x: 380, y: 620 }, // Bandar Abbas
  'KIH': { x: 480, y: 680 }, // Kish
  'GSM': { x: 460, y: 680 }, // Qeshm
  'RAS': { x: 360, y: 220 }, // Rasht
  'OMH': { x: 180, y: 140 }, // Urmia
  'KER': { x: 320, y: 520 }, // Kerman
  'ZAH': { x: 560, y: 520 }, // Zahedan
  'XBJ': { x: 600, y: 360 }, // Birjand
  'ZBR': { x: 660, y: 620 }, // Chabahar
  'SRY': { x: 460, y: 240 }, // Sari
  'GBT': { x: 440, y: 220 }, // Gorgan
  'KSH': { x: 260, y: 320 }, // Kermanshah
  'SDG': { x: 280, y: 280 }, // Sanandaj
  'ADU': { x: 220, y: 180 }, // Ardabil
  'IIL': { x: 200, y: 360 }, // Ilam
  'BUZ': { x: 320, y: 580 }, // Bushehr
  'BXR': { x: 360, y: 560 }, // Bam
  'LRR': { x: 280, y: 580 }, // Lar
  'MRX': { x: 220, y: 500 }, // Mahshahr
  'AZD': { x: 360, y: 460 }, // Yazd
  'NJF': { x: 120, y: 420 }, // Najaf (Iraq)
  'IST': { x: 80, y: 180 }, // Istanbul
  'DXB': { x: 500, y: 720 }, // Dubai
  'MCT': { x: 600, y: 720 }, // Muscat
  'SHJ': { x: 490, y: 710 }, // Sharjah
  'TBS': { x: 260, y: 80 }, // Tbilisi
  'TAS': { x: 700, y: 220 }, // Tashkent
  'DYU': { x: 700, y: 180 }, // Dushanbe
};

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
}

// All Iran provinces data for react-iran-map
const allProvincesData = {
  tehran: 0,
  isfahan: 0,
  fars: 0,
  khorasanRazavi: 0,
  khorasanJonubi: 0,
  khorasanShomali: 0,
  kerman: 0,
  yazd: 0,
  khorasan: 0,
  sistan: 0,
  hormozgan: 0,
  bushehr: 0,
  chaharMahal: 0,
  kohgiluyeh: 0,
  lorestan: 0,
  ilam: 0,
  kermanshah: 0,
  kurdistan: 0,
  westAzerbaijan: 0,
  eastAzerbaijan: 0,
  ardebil: 0,
  gilan: 0,
  mazandaran: 0,
  golestan: 0,
  semnan: 0,
  markazi: 0,
  qom: 0,
  alborz: 0,
  qazvin: 0,
  zanjan: 0,
  hamadan: 0
};

const FlightMapPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  
  const [cities, setCities] = useState<OriginCity[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCities, setLoadingCities] = useState(true);
  const [showFlights, setShowFlights] = useState(false);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoadingCities(true);
        const originCities = await getOriginCities();
        setCities(originCities);
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, []);

  const handleCityClick = async (cityCode: string) => {
    setSelectedCity(cityCode);
    setShowFlights(false);
    setFlights([]);
    
    try {
      setLoading(true);
      
      // Use Tehran as origin and selected city as destination
      const availableFlights = await checkAvailability({
        origin: 'THR',
        destination: cityCode,
        departure_date: selectedDate.toISOString().split('T')[0],
        round_trip: false,
        adult_qty: 1,
        child_qty: 0,
        infant_qty: 0,
      });

      // Convert API response to Flight format
      const convertedFlights: Flight[] = availableFlights.flatMap((flight, index) => {
        return flight.ClassStatus.map((classStatus, classIndex) => {
          const departureDateTime = new Date(flight.DepartureDateTime);
          const arrivalDateTime = new Date(flight.ArrivalDateTime);
          
          const durationMs = arrivalDateTime.getTime() - departureDateTime.getTime();
          const hours = Math.floor(durationMs / (1000 * 60 * 60));
          const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
          const duration = `${hours}h ${minutes}m`;

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
            availableSeats: classStatus.Status === 'C' ? 10 : 0,
            class: flightClass,
            stops: 0,
            originalData: flight,
          };
        });
      });

      setFlights(convertedFlights);
      setShowFlights(true);
    } catch (error) {
      console.error('Error fetching flights:', error);
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const getCityName = (cityCode: string) => {
    const city = cities.find(c => c.CITY === cityCode);
    if (!city) return cityCode;
    return language === 'en' ? city.CITYNAME_EN : city.CITYNAME_FA;
  };

  const getCityCoordinates = (cityCode: string) => {
    return cityCoordinates[cityCode] || { x: 420, y: 280 };
  };

  const availableCityCodes = cities.map(c => c.CITY).filter(code => cityCoordinates[code]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <EmiratesHeader />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 
              className="text-white text-3xl sm:text-5xl font-bold mb-4"
              style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
            >
              {language === 'fa' ? 'نقشه پروازهای ایران' : 'Iran Flight Map'}
            </h1>
            <p 
              className="text-white/90 text-lg sm:text-xl"
              style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
            >
              {language === 'fa' 
                ? 'شهر مورد نظر خود را روی نقشه انتخاب کنید و پروازهای موجود را مشاهده کنید'
                : 'Select your desired city on the map and view available flights'}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                <h3 
                  className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"
                  style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
                >
                  <CalendarDaysIcon className="w-6 h-6 text-blue-900" />
                  {language === 'fa' ? 'انتخاب تاریخ' : 'Select Date'}
                </h3>
                <div className="mb-4">
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date: Date | null) => {
                      if (date) {
                        setSelectedDate(date);
                        if (selectedCity) {
                          handleCityClick(selectedCity);
                        }
                      }
                    }}
                    minDate={new Date()}
                    dateFormat="yyyy/MM/dd"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                    wrapperClassName="w-full"
                  />
                </div>
                {selectedCity && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                      {language === 'fa' ? 'شهر انتخاب شده:' : 'Selected City:'}
                    </p>
                    <p className="text-lg font-bold text-blue-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      {getCityName(selectedCity)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Map Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="relative" style={{ height: '600px', overflow: 'hidden' }}>
                  {loadingCities ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-900"></div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 50%, #dbeafe 100%)' }}>
                      {/* Iran Map using react-iran-map library */}
                      <div className="w-full h-full flex items-center justify-center">
                        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                          <style>{`
                            /* Force all provinces to have blue color */
                            svg path[fill] {
                              fill: #1e40af !important;
                            }
                            svg path:not([fill]) {
                              fill: #1e40af !important;
                            }
                            /* Make province text visible and white with stroke for better readability */
                            svg text {
                              fill: #ffffff !important;
                              font-size: 11px !important;
                              font-weight: bold !important;
                              stroke: #1e40af !important;
                              stroke-width: 1px !important;
                              paint-order: stroke fill !important;
                              opacity: 1 !important;
                              visibility: visible !important;
                              display: block !important;
                            }
                            /* Ensure text elements are visible */
                            svg g text,
                            svg text[fill],
                            svg text[stroke] {
                              fill: #ffffff !important;
                              stroke: #1e40af !important;
                              stroke-width: 1px !important;
                              font-weight: bold !important;
                            }
                          `}</style>
                          <IranMap
                            data={allProvincesData}
                            width={600}
                            textColor="#ffffff"
                            deactiveProvinceColor="#1e40af"
                            selectedProvinceColor="#1e40af"
                            defaultSelectedProvince=""
                            colorRange="30, 58, 175"
                            selectProvinceHandler={(province: string) => {
                              // Log province name to see all available provinces
                              console.log('Selected province:', province);
                            }}
                          />
                          
                          {/* City Markers Overlay */}
                          <div 
                            className="absolute inset-0 pointer-events-none"
                            style={{ 
                              width: '100%', 
                              height: '100%',
                              pointerEvents: 'none'
                            }}
                          >
                            <svg
                              viewBox="0 0 600 600"
                              className="w-full h-full"
                              style={{ position: 'absolute', top: 0, left: 0 }}
                            >
                              {/* City Markers */}
                              {availableCityCodes.map((cityCode) => {
                                const coords = getCityCoordinates(cityCode);
                                // Scale coordinates to match react-iran-map dimensions
                                const scaledX = (coords.x / 1000) * 600;
                                const scaledY = (coords.y / 1000) * 600;
                                const isSelected = selectedCity === cityCode;
                                
                                return (
                                  <g 
                                    key={cityCode}
                                    style={{ pointerEvents: 'all' }}
                                  >
                                    {/* City Circle */}
                                    <circle
                                      cx={scaledX}
                                      cy={scaledY}
                                      r={isSelected ? 10 : 6}
                                      fill={isSelected ? "#dc2626" : "#1e40af"}
                                      stroke="white"
                                      strokeWidth="2"
                                      className="cursor-pointer hover:opacity-80 transition-all"
                                      onClick={() => handleCityClick(cityCode)}
                                      style={{ pointerEvents: 'all', cursor: 'pointer' }}
                                    />
                                    {/* City Label */}
                                    <text
                                      x={scaledX}
                                      y={scaledY - 15}
                                      textAnchor="middle"
                                      className="text-xs font-bold fill-gray-800 pointer-events-none"
                                      style={{ 
                                        fontFamily: 'DigiHamisheBold, Arial, sans-serif',
                                        pointerEvents: 'none',
                                        fontSize: '12px'
                                      }}
                                    >
                                      {getCityName(cityCode)}
                                    </text>
                                    {/* City Code */}
                                    <text
                                      x={scaledX}
                                      y={scaledY + 8}
                                      textAnchor="middle"
                                      className="text-[10px] fill-gray-600 pointer-events-none"
                                      style={{ 
                                        fontFamily: 'DigiHamisheBold, Arial, sans-serif',
                                        pointerEvents: 'none',
                                        fontSize: '10px'
                                      }}
                                    >
                                      {cityCode}
                                    </text>
                                  </g>
                                );
                              })}
                              
                              {/* Connection Lines from Tehran to other cities */}
                              {selectedCity && selectedCity !== 'THR' && (() => {
                                const thrCoords = getCityCoordinates('THR');
                                const selectedCoords = getCityCoordinates(selectedCity);
                                return (
                                  <line
                                    x1={(thrCoords.x / 1000) * 600}
                                    y1={(thrCoords.y / 1000) * 600}
                                    x2={(selectedCoords.x / 1000) * 600}
                                    y2={(selectedCoords.y / 1000) * 600}
                                    stroke="#3b82f6"
                                    strokeWidth="2"
                                    strokeDasharray="5,5"
                                    opacity="0.7"
                                    style={{ pointerEvents: 'none' }}
                                  />
                                );
                              })()}
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Flights Results */}
          {showFlights && (
            <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 
                  className="text-2xl font-bold text-gray-900 flex items-center gap-2"
                  style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
                >
                  <PaperAirplaneIcon className="w-6 h-6 text-blue-900" />
                  {language === 'fa' 
                    ? `پروازهای تهران به ${getCityName(selectedCity!)}`
                    : `Flights from Tehran to ${getCityName(selectedCity!)}`}
                </h2>
                <button
                  onClick={() => {
                    setShowFlights(false);
                    setSelectedCity(null);
                    setFlights([]);
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-900"></div>
                  <p className="mt-4 text-gray-600" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    {language === 'fa' ? 'در حال بارگذاری پروازها...' : 'Loading flights...'}
                  </p>
                </div>
              ) : flights.length === 0 ? (
                <div className="text-center py-12">
                  <XMarkIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-xl text-gray-600" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    {language === 'fa' ? 'پروازی یافت نشد' : 'No flights found'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {flights.map((flight) => (
                    <div
                      key={flight.id}
                      className="bg-gradient-to-r from-blue-50 to-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center">
                            <PaperAirplaneIcon className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                              {flight.airline} {flight.flightNumber}
                            </h3>
                            <p className="text-sm text-gray-500" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                              {flight.origin} → {flight.destination}
                            </p>
                          </div>
                        </div>
                        <div className="text-right" style={{ direction: language === 'en' ? 'ltr' : 'rtl' }}>
                          <div className="text-3xl font-bold text-blue-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                            {language === 'en' 
                              ? flight.price.toLocaleString('en-US')
                              : language === 'ar'
                              ? flight.price.toLocaleString('ar-SA')
                              : flight.price.toLocaleString('fa-IR')}
                          </div>
                          <div className="text-sm text-gray-500" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                            {t('flights.currency')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                            {flight.departureTime}
                          </div>
                          <div className="text-sm text-gray-500" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                            {language === 'fa' ? 'خروج' : 'Departure'}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg text-gray-600 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                            {flight.duration}
                          </div>
                          <div className="w-full h-0.5 bg-gray-300 relative">
                            <PaperAirplaneIcon className="w-4 h-4 text-blue-900 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-90" />
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                            {flight.arrivalTime}
                          </div>
                          <div className="text-sm text-gray-500" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                            {language === 'fa' ? 'ورود' : 'Arrival'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlightMapPage;
