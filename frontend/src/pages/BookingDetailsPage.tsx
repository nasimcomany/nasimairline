import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import { useLanguage } from '../contexts/LanguageContext';
import { cities } from '../data/cities';
import bookingService from '../services/bookingService';
import {
  PaperAirplaneIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  CalendarDaysIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface PassengerInfo {
  type: 'adult' | 'child' | 'infant';
  gender: 'male' | 'female';
  isForeign: boolean;
  firstName: string;
  lastName: string;
  nationalId: string;
  birthDate: string;
  passportNumber?: string;
}

const BookingDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { flightId } = useParams();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const searchParams = useSelector((state: RootState) => state.flight.searchParams);
  const { t, language } = useLanguage();

  // Timer state (15 minutes)
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  
  // Contact info
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: ''
  });

  // Passenger info
  const [passengers, setPassengers] = useState<PassengerInfo[]>([]);
  
  // Discount code
  const [discountCode, setDiscountCode] = useState('');
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  
  // Terms acceptance
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  // Errors
  const [errors, setErrors] = useState<string[]>([]);

  // Get flight data - try from state first, fallback to mock
  const flightFromState = (location.state as any)?.flight;
  
  // Debug: Log flight data
  console.log('🔍 Location state:', location.state);
  console.log('🔍 Flight from state:', flightFromState);
  console.log('🔍 Flight price:', flightFromState?.price);
  console.log('🔍 Flight basePrice:', flightFromState?.basePrice);
  
  // Determine base price from API - use exactly what Nira provides
  const getBasePrice = () => {
    // If basePrice exists in flight data (from Nira API), use it
    if (flightFromState?.basePrice) {
      console.log('✅ Using basePrice from Nira API:', flightFromState.basePrice);
      return flightFromState.basePrice;
    }
    
    // If price exists (from Nira API), calculate basePrice from it (even if 0)
    if (flightFromState?.price !== undefined) {
      console.log('✅ Using price from Nira API:', flightFromState.price);
      return {
        adult: flightFromState.price,
        child: Math.round(flightFromState.price * 0.75),
        infant: Math.round(flightFromState.price * 0.1)
      };
    }
    
    // No flight data - return 0 (no fallback price)
    console.warn('⚠️ No flight data! Price will be 0.');
    return {
      adult: 0,
      child: 0,
      infant: 0
    };
  };
  
  // Ensure basePrice exists
  const flight = {
    ...(flightFromState || {
      id: flightId,
      flightNumber: 'NA101',
      airline: 'Nasim Air',
      origin: 'Tehran',
      destination: 'Dubai',
      departureTime: '08:00',
      arrivalTime: '10:30',
      date: searchParams?.departureDate || '1404/09/15',
      duration: '2h 30m',
      class: searchParams?.class || 'Economy'
    }),
    basePrice: getBasePrice()
  };

  // Initialize passengers based on search params
  useEffect(() => {
    if (searchParams?.passengers) {
      const passengerList: PassengerInfo[] = [];
      const p = typeof searchParams.passengers === 'number' 
        ? { adults: searchParams.passengers, children: 0, infants: 0 }
        : searchParams.passengers;

      for (let i = 0; i < (p.adults || 1); i++) {
        passengerList.push({
          type: 'adult',
          gender: 'male',
          isForeign: false,
          firstName: '',
          lastName: '',
          nationalId: '',
          birthDate: ''
        });
      }
      for (let i = 0; i < (p.children || 0); i++) {
        passengerList.push({
          type: 'child',
          gender: 'male',
          isForeign: false,
          firstName: '',
          lastName: '',
          nationalId: '',
          birthDate: ''
        });
      }
      for (let i = 0; i < (p.infants || 0); i++) {
        passengerList.push({
          type: 'infant',
          gender: 'male',
          isForeign: false,
          firstName: '',
          lastName: '',
          nationalId: '',
          birthDate: ''
        });
      }
      
      setPassengers(passengerList);
    }
  }, [searchParams]);

  // Auto-fill first passenger national ID if logged in
  // Note: first_name contains the national ID (as per registration flow)
  useEffect(() => {
    console.log('🔍 Full user object:', user);
    console.log('🔍 Auto-fill check:', {
      isAuthenticated,
      hasUser: !!user,
      firstName: user?.first_name,
      nationalIdFromProfile: user?.national_id,
      passengersCount: passengers.length,
      firstPassengerNationalId: passengers[0]?.nationalId
    });
    
    if (isAuthenticated && user && user.first_name && passengers.length > 0) {
      const firstPassenger = passengers[0];
      // Only fill if national ID is empty
      // Use first_name as national ID (as per registration flow)
      if (!firstPassenger.nationalId) {
        console.log('✅ Auto-filling national ID from user first_name:', user.first_name);
        setPassengers(prev => {
          const updated = [...prev];
          updated[0] = { ...updated[0], nationalId: user.first_name || '' };
          return updated;
        });
      }
    }
  }, [isAuthenticated, user?.first_name, passengers]);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          alert(t('booking.reservationExpired'));
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const updatePassenger = (index: number, field: keyof PassengerInfo, value: any) => {
    setPassengers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const calculateTotalPrice = () => {
    let total = 0;
    passengers.forEach(p => {
      // Use exact price from Nira API (no fallback)
      if (p.type === 'adult') total += flight.basePrice?.adult || 0;
      if (p.type === 'child') total += flight.basePrice?.child || 0;
      if (p.type === 'infant') total += flight.basePrice?.infant || 0;
    });
    return total;
  };

  const getPassengerTypeLabel = (type: string) => {
    switch (type) {
      case 'adult': return t('passengers.adult');
      case 'child': return t('passengers.child');
      case 'infant': return t('passengers.infant');
      default: return type;
    }
  };
  
  const getCityName = (cityCode: string) => {
    const city = cities.find(c => c.code === cityCode);
    if (!city) return cityCode;
    return language === 'en' ? city.name : city.nameFa;
  };

  const validateNationalId = (nationalId: string): boolean => {
    if (nationalId.length !== 10) return false;
    const check = parseInt(nationalId[9]);
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(nationalId[i]) * (10 - i);
    }
    const remainder = sum % 11;
    return (remainder < 2 && check === remainder) || (remainder >= 2 && check === 11 - remainder);
  };

  const handlePayment = async () => {
    setErrors([]);
    const newErrors: string[] = [];

    // Validate terms
    if (!acceptedTerms) {
      newErrors.push(t('booking.acceptTermsError'));
    }

    // Validate contact info
    if (!contactInfo.phone || contactInfo.phone.length < 10) {
      newErrors.push(t('booking.validPhoneError'));
    }
    if (!contactInfo.email || !contactInfo.email.includes('@')) {
      newErrors.push(t('booking.validEmailError'));
    }

    // Validate passengers
    passengers.forEach((p, idx) => {
      if (!p.firstName) newErrors.push(`${t('booking.passengerFirstNameRequired')} ${idx + 1} ${t('booking.isRequired')}`);
      if (!p.lastName) newErrors.push(`${t('booking.passengerLastNameRequired')} ${idx + 1} ${t('booking.isRequired')}`);
      if (!p.isForeign && !p.nationalId) newErrors.push(`${t('booking.passengerNationalIdRequired')} ${idx + 1} ${t('booking.isRequired')}`);
      if (!p.isForeign && p.nationalId && !validateNationalId(p.nationalId)) {
        newErrors.push(`${t('booking.passengerNationalIdInvalid')} ${idx + 1} ${t('booking.isInvalid')}`);
      }
      if (!p.birthDate) newErrors.push(`${t('booking.passengerBirthDateRequired')} ${idx + 1} ${t('booking.isRequired')}`);
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!isAuthenticated) {
      setErrors(['برای ادامه پرداخت ابتدا وارد حساب کاربری خود شوید.']);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      // Persist booking/payment intent immediately when user clicks pay
      const initiated = await bookingService.initiatePayment({
        flight_data: flight,
        passengers,
        contact_info: contactInfo,
        total_amount: calculateTotalPrice(),
        cabin_class: String(flight.class || 'economy').toUpperCase(),
      });

      navigate('/payment', {
        state: {
          flight,
          passengers,
          contactInfo,
          totalPrice: calculateTotalPrice(),
          bookingDraft: initiated,
        },
      });
    } catch (err: any) {
      const apiMessage =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        'خطا در ثبت رزرو اولیه. لطفا دوباره تلاش کنید.';
      setErrors([apiMessage]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const totalPrice = calculateTotalPrice();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <EmiratesHeader />

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          {/* Errors */}
          {errors.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-800 mb-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    {t('booking.formErrors')}
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                    {errors.map((err, idx) => (
                      <li key={idx}>• {err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Form - Right Side */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Passenger Information */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    <h2 className="text-lg sm:text-xl font-bold text-white" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                      {t('booking.passengerInfo')}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 px-2 sm:px-3 py-1 rounded-lg">
                    <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    <span className="text-white font-bold text-sm sm:text-base" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {passengers.map((passenger, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 sm:pb-6 last:border-b-0 last:pb-0">
                      {/* Passenger Header */}
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-900 font-bold text-sm sm:text-base" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm sm:text-base" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                              {getPassengerTypeLabel(passenger.type)}
                            </h3>
                            <p className="text-xs text-gray-500" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                              {t('booking.passengerNumber')} {index + 1}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Gender */}
                      <div className="flex flex-wrap gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`gender-${index}`}
                            checked={passenger.gender === 'male'}
                            onChange={() => updatePassenger(index, 'gender', 'male')}
                            className="w-4 h-4 text-blue-900 focus:ring-blue-900"
                          />
                          <span style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>{t('booking.male')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`gender-${index}`}
                            checked={passenger.gender === 'female'}
                            onChange={() => updatePassenger(index, 'gender', 'female')}
                            className="w-4 h-4 text-blue-900 focus:ring-blue-900"
                          />
                          <span style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>{t('booking.female')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer mr-auto">
                          <input
                            type="checkbox"
                            checked={passenger.isForeign}
                            onChange={(e) => updatePassenger(index, 'isForeign', e.target.checked)}
                            className="w-4 h-4 text-blue-900 focus:ring-blue-900 rounded"
                          />
                          <span style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>{t('booking.foreignNational')}</span>
                        </label>
                      </div>

                      {/* Personal Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                            {t('booking.firstNameEnglish')} *
                          </label>
                          <input
                            type="text"
                            value={passenger.firstName}
                            onChange={(e) => updatePassenger(index, 'firstName', e.target.value)}
                            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                            style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'ltr', textAlign: 'left' }}
                            placeholder="First Name"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                            {t('booking.lastNameEnglish')} *
                          </label>
                          <input
                            type="text"
                            value={passenger.lastName}
                            onChange={(e) => updatePassenger(index, 'lastName', e.target.value)}
                            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                            style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'ltr', textAlign: 'left' }}
                            placeholder="Last Name"
                            required
                          />
                        </div>

                        {!passenger.isForeign && (
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                              {t('booking.nationalId')} *
                              {index === 0 && isAuthenticated && passenger.nationalId && (
                                <span className="text-xs text-green-600 mr-2">({t('booking.fromYourProfile') || 'از پروفایل شما'})</span>
                              )}
                            </label>
                            <input
                              type="text"
                              value={passenger.nationalId}
                              onChange={(e) => updatePassenger(index, 'nationalId', e.target.value.replace(/\D/g, '').slice(0, 10))}
                              disabled={index === 0 && isAuthenticated && !!passenger.nationalId}
                              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 ${
                                index === 0 && isAuthenticated && passenger.nationalId ? 'bg-gray-100 cursor-not-allowed' : ''
                              }`}
                              style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'ltr', textAlign: 'right' }}
                              placeholder={t('booking.nationalId10Digits')}
                              maxLength={10}
                              required
                            />
                          </div>
                        )}

                        {passenger.isForeign && (
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                              {t('booking.passportNumber')} *
                            </label>
                            <input
                              type="text"
                              value={passenger.passportNumber || ''}
                              onChange={(e) => updatePassenger(index, 'passportNumber', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                              style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'ltr', textAlign: 'left' }}
                              placeholder="Passport Number"
                              required
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                            {t('booking.birthDate')} *
                          </label>
                          <div className="relative">
                            <CalendarDaysIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            <input
                              type="date"
                              value={passenger.birthDate}
                              onChange={(e) => updatePassenger(index, 'birthDate', e.target.value)}
                              max={new Date().toISOString().split('T')[0]}
                              className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                              style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discount Code */}
              {!showDiscountInput ? (
                <button
                  onClick={() => setShowDiscountInput(true)}
                  className="text-blue-900 hover:text-blue-800 text-xs sm:text-sm font-bold"
                  style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
                >
                  {t('booking.haveDiscountCode')} {t('booking.enterDiscountCode')}
                </button>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                      style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'ltr', textAlign: 'left' }}
                      placeholder="Discount Code"
                    />
                    <button
                      type="button"
                      className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base"
                      style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
                    >
                      {t('booking.apply')}
                    </button>
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-3 sm:p-4">
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    <PhoneIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    {t('booking.contactInfo')}
                  </h2>
                </div>

                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                      {t('booking.passengerPhone')} *
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex items-center gap-2 px-2 sm:px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                        <span className="text-xl sm:text-2xl">🇮🇷</span>
                        <span className="font-bold text-sm sm:text-base" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>+98</span>
                      </div>
                      <input
                        type="tel"
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                        className="flex-1 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                        style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'ltr', textAlign: 'right' }}
                        placeholder="9123456789"
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                      {t('booking.emailAddress')} *
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                      <input
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full pr-8 sm:pr-10 pl-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                        style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'ltr', textAlign: 'left' }}
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Left Side */}
            <div className="space-y-4 sm:space-y-6">
              {/* Flight Info */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-3 sm:p-4">
                  <h3 className="font-bold text-white text-sm sm:text-base" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    {t('booking.flightInfo')}
                  </h3>
                </div>
                <div className="p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="text-center flex-1">
                      <div className="text-lg sm:text-2xl font-bold text-gray-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                        {flight.departureTime}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                        {getCityName(flight.origin)}
                      </div>
                    </div>
                    <div className="px-2 sm:px-4">
                      <PaperAirplaneIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-900 rotate-90" />
                    </div>
                    <div className="text-center flex-1">
                      <div className="text-lg sm:text-2xl font-bold text-gray-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                        {flight.arrivalTime}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                        {getCityName(flight.destination)}
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-xs sm:text-sm text-gray-500 mb-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    {flight.date}
                  </div>
                  <div className="text-center">
                    <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-xs font-bold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      {flight.flightNumber}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate('/flights/results')}
                    className="w-full mt-2 sm:mt-3 text-red-600 hover:text-red-700 text-xs sm:text-sm font-bold"
                    style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
                  >
                    {t('booking.changeFlight')}
                  </button>
                </div>
              </div>

              {/* Invoice */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-3 sm:p-4">
                  <h3 className="font-bold text-white text-sm sm:text-base" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    {t('booking.invoice')}
                  </h3>
                </div>
                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  {/* Price Breakdown */}
                  {passengers.filter(p => p.type === 'adult').length > 0 && (
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                        {t('passengers.adult')} ({passengers.filter(p => p.type === 'adult').length}):
                      </span>
                      <span className="font-bold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                        {language === 'en' 
                          ? ((flight.basePrice?.adult || 0) * passengers.filter(p => p.type === 'adult').length).toLocaleString('en-US')
                          : language === 'ar'
                          ? ((flight.basePrice?.adult || 0) * passengers.filter(p => p.type === 'adult').length).toLocaleString('ar-SA')
                          : ((flight.basePrice?.adult || 0) * passengers.filter(p => p.type === 'adult').length).toLocaleString('fa-IR')} {t('flights.currency')}
                      </span>
                    </div>
                  )}
                  {passengers.filter(p => p.type === 'child').length > 0 && (
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                        {t('passengers.child')} ({passengers.filter(p => p.type === 'child').length}):
                      </span>
                      <span className="font-bold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                        {language === 'en' 
                          ? ((flight.basePrice?.child || 0) * passengers.filter(p => p.type === 'child').length).toLocaleString('en-US')
                          : language === 'ar'
                          ? ((flight.basePrice?.child || 0) * passengers.filter(p => p.type === 'child').length).toLocaleString('ar-SA')
                          : ((flight.basePrice?.child || 0) * passengers.filter(p => p.type === 'child').length).toLocaleString('fa-IR')} {t('flights.currency')}
                      </span>
                    </div>
                  )}
                  {passengers.filter(p => p.type === 'infant').length > 0 && (
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                        {t('passengers.infant')} ({passengers.filter(p => p.type === 'infant').length}):
                      </span>
                      <span className="font-bold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                        {language === 'en' 
                          ? ((flight.basePrice?.infant || 0) * passengers.filter(p => p.type === 'infant').length).toLocaleString('en-US')
                          : language === 'ar'
                          ? ((flight.basePrice?.infant || 0) * passengers.filter(p => p.type === 'infant').length).toLocaleString('ar-SA')
                          : ((flight.basePrice?.infant || 0) * passengers.filter(p => p.type === 'infant').length).toLocaleString('fa-IR')} {t('flights.currency')}
                      </span>
                    </div>
                  )}

                  <div className="border-t pt-2 sm:pt-3 space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>{t('booking.discountAmount')}</span>
                      <span className="font-bold text-green-600" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                        0 {t('flights.currency')}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>{t('booking.extraCost')}</span>
                      <span className="font-bold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                        0 {t('flights.currency')}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-2 sm:pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-base sm:text-lg font-bold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                        {t('booking.payableAmount')}
                      </span>
                      <span className="text-xl sm:text-2xl font-bold text-blue-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                        {language === 'en' 
                          ? totalPrice.toLocaleString('en-US')
                          : language === 'ar'
                          ? totalPrice.toLocaleString('ar-SA')
                          : totalPrice.toLocaleString('fa-IR')} {t('flights.currency')}
                      </span>
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <label className="flex items-start gap-2 cursor-pointer mt-3 sm:mt-4">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="w-4 h-4 text-blue-900 focus:ring-blue-900 rounded mt-0.5 sm:mt-1 flex-shrink-0"
                    />
                    <span className="text-xs text-gray-700" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                      {t('booking.acceptTerms')}
                    </span>
                  </label>

                  {/* Payment Button */}
                  <button
                    onClick={handlePayment}
                    disabled={!acceptedTerms}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 sm:py-4 rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                    style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
                  >
                    {t('booking.payment')}
                  </button>
                </div>
              </div>

              {/* Info Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
                <div className="flex gap-2 sm:gap-3">
                  <InformationCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-blue-900 mb-1 sm:mb-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                      {t('booking.importantNotes')}
                    </h4>
                    <ul className="text-xs text-blue-800 space-y-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                      <li>• {t('booking.note1')}</li>
                      <li>• {t('booking.note2')}</li>
                      <li>• {t('booking.note3')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsPage;

