import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import { useLanguage } from '../contexts/LanguageContext';
import { getOriginCities, getDestinations, checkAvailability, FlightAvailability, OriginCity } from '../services/niraApi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { IranMap } from 'react-iran-map';
import NeighboringCountryMap from '../components/Maps/NeighboringCountryMap';
import { formatDateByLanguage, getCurrentDateFormatted } from '../utils/dateFormatter';
import { 
  MapPinIcon,
  CalendarDaysIcon,
  PaperAirplaneIcon,
  ClockIcon,
  XMarkIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

// Coordinates for major Iranian cities on the map
// Precisely adjusted to match react-iran-map SVG viewBox (0-600)
// Based on actual geographic positions within their provinces
const cityCoordinates: Record<string, { x: number; y: number }> = {
  'THR': { x: 248, y: 195 }, // Tehran - Tehran province (north-central)
  'IKA': { x: 245, y: 200 }, // Tehran Imam Khomeini - slightly south of Tehran
  'MHD': { x: 430, y: 140 }, // Mashhad - Razavi Khorasan (northeast, more accurate)
  'IFN': { x: 218, y: 275 }, // Isfahan - Isfahan province (center)
  'SYZ': { x: 175, y: 385 }, // Shiraz - Fars province (south-central)
  'TBZ': { x: 138, y: 118 }, // Tabriz - East Azerbaijan (northwest)
  'AWZ': { x: 108, y: 355 }, // Ahvaz - Khuzestan (southwest)
  'BND': { x: 228, y: 460 }, // Bandar Abbas - Hormozgan (south)
  'KIH': { x: 295, y: 495 }, // Kish - Hormozgan (island, more separated from Qeshm)
  'GSM': { x: 270, y: 525 }, // Qeshm - Hormozgan (island, more separated from Kish)
  'RAS': { x: 198, y: 162 }, // Rasht - Gilan (north, Caspian coast)
  'OMH': { x: 98, y: 102 }, // Urmia - West Azerbaijan (northwest)
  'KER': { x: 188, y: 385 }, // Kerman - Kerman province (southeast)
  'ZAH': { x: 425, y: 385 }, // Zahedan - Sistan and Baluchestan (east)
  'XBJ': { x: 385, y: 265 }, // Birjand - South Khorasan (east)
  'ZBR': { x: 490, y: 460 }, // Chabahar - Sistan and Baluchestan (southeast)
  'SRY': { x: 272, y: 178 }, // Sari - Mazandaran (north, Caspian coast)
  'GBT': { x: 262, y: 163 }, // Gorgan - Golestan (north, Caspian coast)
  'KSH': { x: 152, y: 238 }, // Kermanshah - Kermanshah province (west)
  'SDG': { x: 162, y: 208 }, // Sanandaj - Kurdistan (west)
  'ADU': { x: 128, y: 132 }, // Ardabil - Ardabil province (northwest)
  'IIL': { x: 118, y: 268 }, // Ilam - Ilam province (west)
  'BUZ': { x: 188, y: 430 }, // Bushehr - Bushehr province (south)
  'BXR': { x: 268, y: 415 }, // Bam - Kerman (southeast)
  'LRR': { x: 208, y: 430 }, // Lar - Fars (south)
  'MRX': { x: 128, y: 370 }, // Mahshahr - Khuzestan (south)
  'AZD': { x: 238, y: 340 }, // Yazd - Yazd province (center)
  'NJF': { x: 68, y: 312 }, // Najaf (Iraq) - outside Iran
  'IST': { x: 48, y: 132 }, // Istanbul - outside Iran
  'DXB': { x: 372, y: 535 }, // Dubai - outside Iran
  'MCT': { x: 447, y: 535 }, // Muscat - outside Iran
  'SHJ': { x: 367, y: 525 }, // Sharjah - outside Iran
  'TBS': { x: 153, y: 58 }, // Tbilisi - outside Iran
  'TAS': { x: 522, y: 162 }, // Tashkent - outside Iran
  'DYU': { x: 522, y: 132 }, // Dushanbe - outside Iran
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
  const [destinationCities, setDestinationCities] = useState<string[]>([]); // Cities with available flights from selected city

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

  const availableCityCodes = React.useMemo(() => 
    cities.map(c => c.CITY).filter(code => cityCoordinates[code]),
    [cities]
  );

  // Update destination cities when date changes
  useEffect(() => {
    if (selectedCity) {
      // Re-fetch flights and destinations when date changes
      const updateFlights = async () => {
        const cityCode = selectedCity;
        setDestinationCities([]);
        
        try {
          const departureDate = selectedDate.toISOString().split('T')[0];
          const availableDestinations: string[] = [];
          
          // First, get valid destinations for this origin city from API
          let validDestinations: string[] = [];
          try {
            const destinations = await getDestinations(cityCode);
            validDestinations = destinations
              .map(d => d.CITY)
              .filter(code => code && code !== cityCode);
            console.log(`Destinations from API for ${cityCode}:`, validDestinations);
          } catch (error) {
            console.error(`Error getting destinations for ${cityCode}:`, error);
            // If API fails, don't proceed
            setFlights([]);
            setShowFlights(false);
            return;
          }
          
          // Check flights from selected city to valid destinations and collect all flights
          // Use parallel requests in batches for better performance
          const allFlights: FlightAvailability[] = [];
          const BATCH_SIZE = 4; // Process 4 requests at a time
          
          for (let i = 0; i < validDestinations.length; i += BATCH_SIZE) {
            const batch = validDestinations.slice(i, i + BATCH_SIZE);
            const batchPromises = batch.map(async (destCode) => {
              try {
                console.log(`Checking flights from ${cityCode} to ${destCode} on ${departureDate}`);
                const flights = await checkAvailability({
                  origin: cityCode,
                  destination: destCode,
                  departure_date: departureDate,
                  round_trip: false,
                  adult_qty: 1,
                  child_qty: 0,
                  infant_qty: 0,
                });
                
                console.log(`Flights from ${cityCode} to ${destCode}:`, flights?.length || 0);
                return { destCode, flights };
              } catch (error) {
                console.error(`Error checking flights from ${cityCode} to ${destCode}:`, error);
                return { destCode, flights: [] };
              }
            });
            
            const batchResults = await Promise.all(batchPromises);
            
            batchResults.forEach(({ destCode, flights }) => {
              if (flights && Array.isArray(flights) && flights.length > 0) {
                availableDestinations.push(destCode);
                allFlights.push(...flights);
              }
            });
            
            // Small delay between batches to avoid overwhelming the API
            if (i + BATCH_SIZE < validDestinations.length) {
              await new Promise(resolve => setTimeout(resolve, 50));
            }
          }
          
          console.log(`Total flights collected: ${allFlights.length}`);
          
          setDestinationCities(availableDestinations);
          
          // Convert all collected flights to Flight format
          const convertedFlights: Flight[] = allFlights.flatMap((flight, index) => {
            const departureDateTime = new Date(flight.DepartureDateTime);
            const arrivalDateTime = new Date(flight.ArrivalDateTime);
            
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
                stops: 0,
                originalData: flight,
              }];
            }

            // If ClassStatus has items, create entries for each class
            return flight.ClassStatus.map((classStatus, classIndex) => {
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
          console.error('Error updating flights:', error);
        }
      };
      
      updateFlights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedCity, availableCityCodes]);

  const handleCityClick = async (cityCode: string) => {
    setSelectedCity(cityCode);
    setShowFlights(false);
    setFlights([]);
    setDestinationCities([]);
    
    try {
      setLoading(true);
      
      // Use selected city as origin and check available destinations
      const departureDate = selectedDate.toISOString().split('T')[0];
      const availableDestinations: string[] = [];
      
      // First, get valid destinations for this origin city from API
      let validDestinations: string[] = [];
      try {
        const destinations = await getDestinations(cityCode);
        validDestinations = destinations
          .map(d => d.CITY)
          .filter(code => code && code !== cityCode);
        console.log(`Destinations from API for ${cityCode}:`, validDestinations);
      } catch (error) {
        console.error(`Error getting destinations for ${cityCode}:`, error);
        // If API fails, don't proceed
        setFlights([]);
        setShowFlights(false);
        setLoading(false);
        return;
      }
      
      // Check flights from selected city to valid destinations and collect all flights
      // Use parallel requests in batches for better performance
      const allFlights: FlightAvailability[] = [];
      const BATCH_SIZE = 4; // Process 4 requests at a time
      
      for (let i = 0; i < validDestinations.length; i += BATCH_SIZE) {
        const batch = validDestinations.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map(async (destCode) => {
          try {
            console.log(`Checking flights from ${cityCode} to ${destCode} on ${departureDate}`);
            const flights = await checkAvailability({
              origin: cityCode,
              destination: destCode,
              departure_date: departureDate,
              round_trip: false,
              adult_qty: 1,
              child_qty: 0,
              infant_qty: 0,
            });
            
            console.log(`Flights from ${cityCode} to ${destCode}:`, flights?.length || 0);
            return { destCode, flights };
          } catch (error) {
            console.error(`Error checking flights from ${cityCode} to ${destCode}:`, error);
            return { destCode, flights: [] };
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        
        batchResults.forEach(({ destCode, flights }) => {
          if (flights && Array.isArray(flights) && flights.length > 0) {
            availableDestinations.push(destCode);
            allFlights.push(...flights);
          }
        });
        
        // Small delay between batches to avoid overwhelming the API
        if (i + BATCH_SIZE < validDestinations.length) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      
      console.log(`Total flights collected: ${allFlights.length}`);
      
      setDestinationCities(availableDestinations);
      
      // Convert all collected flights to Flight format
      const convertedFlights: Flight[] = allFlights.flatMap((flight, index) => {
        const departureDateTime = new Date(flight.DepartureDateTime);
        const arrivalDateTime = new Date(flight.ArrivalDateTime);
        
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
            stops: 0,
            originalData: flight,
          }];
        }

        // If ClassStatus has items, create entries for each class
        return flight.ClassStatus.map((classStatus, classIndex) => {
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
                    dateFormat={language === 'fa' ? 'yyyy/MM/dd' : 'yyyy/MM/dd'}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                    wrapperClassName="w-full"
                  />
                </div>
                {/* Current Date Display */}
                <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span 
                      className="text-sm text-gray-600"
                      style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
                    >
                      {language === 'fa' ? 'تاریخ امروز:' : 'Today\'s Date:'}
                    </span>
                    <span 
                      className="text-base font-bold text-blue-900"
                      style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
                    >
                      {getCurrentDateFormatted(language)}
                    </span>
                  </div>
                </div>
                {/* Selected Date Display */}
                <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <span 
                      className="text-sm text-gray-600"
                      style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
                    >
                      {language === 'fa' ? 'تاریخ انتخاب شده:' : 'Selected Date:'}
                    </span>
                    <span 
                      className="text-base font-bold text-green-900"
                      style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
                    >
                      {formatDateByLanguage(selectedDate, language)}
                    </span>
                  </div>
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
                            /* Hide province names on the map - we only want city names */
                            svg text {
                              display: none !important;
                              visibility: hidden !important;
                              opacity: 0 !important;
                            }
                            /* But keep city names visible in our overlay */
                            svg[viewBox="0 0 600 600"] text {
                              display: block !important;
                              visibility: visible !important;
                              opacity: 1 !important;
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
                                // Coordinates are already adjusted for react-iran-map (0-600 range)
                                const scaledX = coords.x;
                                const scaledY = coords.y;
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
                                      r={isSelected ? 8 : 5}
                                      fill={isSelected ? "#dc2626" : "#1e40af"}
                                      stroke="white"
                                      strokeWidth="1.5"
                                      className="cursor-pointer hover:opacity-80 transition-all"
                                      onClick={() => handleCityClick(cityCode)}
                                      style={{ pointerEvents: 'all', cursor: 'pointer' }}
                                    />
                                    {/* City Label - Only city name */}
                                    <text
                                      x={scaledX}
                                      y={scaledY - 12}
                                      textAnchor="middle"
                                      className="text-xs font-bold pointer-events-none"
                                      style={{ 
                                        fontFamily: 'DigiHamisheBold, Arial, sans-serif',
                                        pointerEvents: 'none',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        fill: '#ffffff',
                                        stroke: '#1e40af',
                                        strokeWidth: '1px',
                                        paintOrder: 'stroke fill'
                                      }}
                                    >
                                      {getCityName(cityCode)}
                                    </text>
                                  </g>
                                );
                              })}
                              
                              {/* Red lines from selected city to destination cities with available flights */}
                              {selectedCity && destinationCities.length > 0 && destinationCities.map((destCityCode) => {
                                const selectedCoords = getCityCoordinates(selectedCity);
                                const destCoords = getCityCoordinates(destCityCode);
                                
                                return (
                                  <line
                                    key={`line-${selectedCity}-${destCityCode}`}
                                    x1={selectedCoords.x}
                                    y1={selectedCoords.y}
                                    x2={destCoords.x}
                                    y2={destCoords.y}
                                    stroke="#dc2626"
                                    strokeWidth="2.5"
                                    strokeDasharray="4,4"
                                    opacity="0.8"
                                    style={{ pointerEvents: 'none' }}
                                  />
                                );
                              })}
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

          {/* Neighboring Countries Maps Section */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 
              className="text-2xl font-bold text-gray-900 mb-6 text-center"
              style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
            >
              {language === 'fa' ? '🗺️ کشورهای همسایه ایران' : language === 'ar' ? '🗺️ دول الجوار الإيرانية' : '🗺️ Iran\'s Neighboring Countries'}
            </h2>
            <p 
              className="text-center text-gray-600 mb-8"
              style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
            >
              {language === 'fa' 
                ? 'ایران با ۶ کشور همسایه مرز مشترک دارد' 
                : language === 'ar'
                ? 'إيران لها حدود مشتركة مع ٦ دول مجاورة'
                : 'Iran shares borders with 6 neighboring countries'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <NeighboringCountryMap country="turkey" color="#dc2626" />
              <NeighboringCountryMap country="iraq" color="#ea580c" />
              <NeighboringCountryMap country="azerbaijan" color="#ca8a04" />
              <NeighboringCountryMap country="turkmenistan" color="#16a34a" />
              <NeighboringCountryMap country="afghanistan" color="#2563eb" />
              <NeighboringCountryMap country="pakistan" color="#7c3aed" />
            </div>
            
            {/* Info box about neighboring countries */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
              <h3 
                className="text-lg font-bold text-gray-900 mb-3"
                style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
              >
                {language === 'fa' ? '📍 اطلاعات مرزهای ایران' : language === 'ar' ? '📍 معلومات حدود إيران' : '📍 Iran\'s Border Information'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-2xl">🇹🇷</span>
                  <div style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    <strong>{language === 'fa' ? 'ترکیه' : 'Turkey'}:</strong>
                    <span className="text-gray-600 mr-2">{language === 'fa' ? 'شمال غربی - ۵۰۰ کیلومتر مرز' : 'Northwest - 500 km border'}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-2xl">🇮🇶</span>
                  <div style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    <strong>{language === 'fa' ? 'عراق' : 'Iraq'}:</strong>
                    <span className="text-gray-600 mr-2">{language === 'fa' ? 'غرب - ۱,۴۵۸ کیلومتر مرز' : 'West - 1,458 km border'}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-2xl">🇦🇿</span>
                  <div style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    <strong>{language === 'fa' ? 'آذربایجان' : 'Azerbaijan'}:</strong>
                    <span className="text-gray-600 mr-2">{language === 'fa' ? 'شمال غربی - ۶۱۱ کیلومتر مرز' : 'Northwest - 611 km border'}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-2xl">🇹🇲</span>
                  <div style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    <strong>{language === 'fa' ? 'ترکمنستان' : 'Turkmenistan'}:</strong>
                    <span className="text-gray-600 mr-2">{language === 'fa' ? 'شمال شرقی - ۹۹۲ کیلومتر مرز' : 'Northeast - 992 km border'}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-2xl">🇦🇫</span>
                  <div style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    <strong>{language === 'fa' ? 'افغانستان' : 'Afghanistan'}:</strong>
                    <span className="text-gray-600 mr-2">{language === 'fa' ? 'شرق - ۹۳۶ کیلومتر مرز' : 'East - 936 km border'}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-2xl">🇵🇰</span>
                  <div style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    <strong>{language === 'fa' ? 'پاکستان' : 'Pakistan'}:</strong>
                    <span className="text-gray-600 mr-2">{language === 'fa' ? 'جنوب شرقی - ۹۰۹ کیلومتر مرز' : 'Southeast - 909 km border'}</span>
                  </div>
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
                    ? `پروازهای ${getCityName(selectedCity!)} به سایر شهرها`
                    : `Flights from ${getCityName(selectedCity!)} to other cities`}
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
