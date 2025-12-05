import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { loginUser, registerUser } from '../store/slices/authSlice';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import { useLanguage } from '../contexts/LanguageContext';
import { cities } from '../data/cities';
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
  const { flightId } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const searchParams = useSelector((state: RootState) => state.flight.searchParams);
  const { t, language } = useLanguage();

  // Timer state (5 minutes)
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  
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
  const locationState = window.history.state?.usr;
  const flightFromState = locationState?.flight;
  
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
    basePrice: flightFromState?.basePrice || {
      adult: flightFromState?.price || 3500000,
      child: (flightFromState?.price || 3500000) * 0.75,
      infant: (flightFromState?.price || 3500000) * 0.1
    }
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

      // Don't auto-fill - let user enter manually
    }
  }, [searchParams]);

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
      if (p.type === 'adult') total += flight.basePrice?.adult || 3500000;
      if (p.type === 'child') total += flight.basePrice?.child || 2625000;
      if (p.type === 'infant') total += flight.basePrice?.infant || 350000;
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

    // Try to register/login if not authenticated (but don't block if it fails)
    if (!isAuthenticated) {
      const firstPassenger = passengers[0];
      
      // Background registration attempt - don't await or block on errors
      dispatch(registerUser({
        email: contactInfo.email,
        password: firstPassenger.nationalId,
        password_confirm: firstPassenger.nationalId,
        first_name: firstPassenger.firstName,
        last_name: firstPassenger.lastName,
        phone_number: contactInfo.phone,
        date_of_birth: firstPassenger.birthDate,
        nationality: 'iranian'
      }))
      .unwrap()
      .then(() => {
        // Try to login after registration
        return dispatch(loginUser({
          email: contactInfo.email,
          password: firstPassenger.nationalId
        })).unwrap();
      })
      .then(() => {
        console.log('User registered and logged in successfully');
      })
      .catch((error) => {
        // Try login if registration failed (user might exist)
        dispatch(loginUser({
          email: contactInfo.email,
          password: firstPassenger.nationalId
        }))
        .unwrap()
        .then(() => {
          console.log('Existing user logged in successfully');
        })
        .catch(() => {
          console.log('Proceeding as guest checkout');
        });
      });
    }

    // Proceed to payment - always allow
    console.log('Proceeding to payment with data:', {
      flight,
      passengers: passengers.length,
      contactInfo,
      totalPrice: calculateTotalPrice(),
      isAuthenticated
    });
    
    navigate('/payment', {
      state: {
        flight,
        passengers,
        contactInfo,
        totalPrice: calculateTotalPrice()
      }
    });
  };

  const totalPrice = calculateTotalPrice();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <EmiratesHeader />

      <div className="container mx-auto px-4 py-6">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form - Right Side */}
            <div className="lg:col-span-2 space-y-6">
              {/* Passenger Information */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserIcon className="w-6 h-6 text-white" />
                    <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                      {t('booking.passengerInfo')}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg">
                    <ClockIcon className="w-5 h-5 text-white" />
                    <span className="text-white font-bold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {passengers.map((passenger, index) => (
                    <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                      {/* Passenger Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-900 font-bold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                              {getPassengerTypeLabel(passenger.type)}
                            </h3>
                            <p className="text-xs text-gray-500" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                              {t('booking.passengerNumber')} {index + 1}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Gender */}
                      <div className="flex gap-4 mb-4">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                            {t('booking.firstNameEnglish')} *
                          </label>
                          <input
                            type="text"
                            value={passenger.firstName}
                            onChange={(e) => updatePassenger(index, 'firstName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                            style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'ltr', textAlign: 'left' }}
                            placeholder="First Name"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                            {t('booking.lastNameEnglish')} *
                          </label>
                          <input
                            type="text"
                            value={passenger.lastName}
                            onChange={(e) => updatePassenger(index, 'lastName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                            style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'ltr', textAlign: 'left' }}
                            placeholder="Last Name"
                            required
                          />
                        </div>

                        {!passenger.isForeign && (
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                              {t('booking.nationalId')} *
                            </label>
                            <input
                              type="text"
                              value={passenger.nationalId}
                              onChange={(e) => updatePassenger(index, 'nationalId', e.target.value.replace(/\D/g, '').slice(0, 10))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
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
                  className="text-blue-900 hover:text-blue-800 text-sm font-bold"
                  style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
                >
                  {t('booking.haveDiscountCode')} {t('booking.enterDiscountCode')}
                </button>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                      style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'ltr', textAlign: 'left' }}
                      placeholder="Discount Code"
                    />
                    <button
                      type="button"
                      className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-6 py-2 rounded-lg transition-colors"
                      style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
                    >
                      {t('booking.apply')}
                    </button>
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                    <PhoneIcon className="w-6 h-6" />
                    اطلاعات تماس
                  </h2>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      شماره تلفن همراه مسافر *
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                        <span className="text-2xl">🇮🇷</span>
                        <span className="font-bold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>+98</span>
                      </div>
                      <input
                        type="tel"
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                        style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'ltr', textAlign: 'right' }}
                        placeholder="9123456789"
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      آدرس ایمیل *
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <input
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
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
            <div className="space-y-6">
              {/* Flight Info */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-4">
                  <h3 className="font-bold text-white" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                    اطلاعات پرواز
                  </h3>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center flex-1">
                      <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                        {flight.departureTime}
                      </div>
                      <div className="text-sm text-gray-600" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                        {flight.origin}
                      </div>
                    </div>
                    <div className="px-4">
                      <PaperAirplaneIcon className="w-6 h-6 text-blue-900 rotate-90" />
                    </div>
                    <div className="text-center flex-1">
                      <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                        {flight.arrivalTime}
                      </div>
                      <div className="text-sm text-gray-600" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                        {flight.destination}
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-sm text-gray-500 mb-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                    {flight.date}
                  </div>
                  <div className="text-center">
                    <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-xs font-bold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      {flight.flightNumber}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate('/flights/results')}
                    className="w-full mt-3 text-red-600 hover:text-red-700 text-sm font-bold"
                    style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
                  >
                    تغییر پرواز
                  </button>
                </div>
              </div>

              {/* Invoice */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-4">
                  <h3 className="font-bold text-white" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                    پیش فاکتور
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {/* Price Breakdown */}
                  {passengers.filter(p => p.type === 'adult').length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                        بزرگسال ({passengers.filter(p => p.type === 'adult').length}):
                      </span>
                      <span className="font-bold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                        {((flight.basePrice?.adult || 3500000) * passengers.filter(p => p.type === 'adult').length).toLocaleString('fa-IR')} تومان
                      </span>
                    </div>
                  )}
                  {passengers.filter(p => p.type === 'child').length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                        کودک ({passengers.filter(p => p.type === 'child').length}):
                      </span>
                      <span className="font-bold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                        {((flight.basePrice?.child || 2625000) * passengers.filter(p => p.type === 'child').length).toLocaleString('fa-IR')} تومان
                      </span>
                    </div>
                  )}
                  {passengers.filter(p => p.type === 'infant').length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                        نوزاد ({passengers.filter(p => p.type === 'infant').length}):
                      </span>
                      <span className="font-bold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                        {((flight.basePrice?.infant || 350000) * passengers.filter(p => p.type === 'infant').length).toLocaleString('fa-IR')} تومان
                      </span>
                    </div>
                  )}

                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>مبلغ تخفیف:</span>
                      <span className="font-bold text-green-600" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                        0 تومان
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>هزینه اضافی:</span>
                      <span className="font-bold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                        0 تومان
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                        مبلغ قابل پرداخت:
                      </span>
                      <span className="text-2xl font-bold text-blue-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                        {totalPrice.toLocaleString('fa-IR')} تومان
                      </span>
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <label className="flex items-start gap-2 cursor-pointer mt-4">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="w-4 h-4 text-blue-900 focus:ring-blue-900 rounded mt-1"
                    />
                    <span className="text-xs text-gray-700" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      قوانین رزرو و استرداد پرواز را خوانده‌ام و می‌پذیرم
                    </span>
                  </label>

                  {/* Payment Button */}
                  <button
                    onClick={handlePayment}
                    disabled={!acceptedTerms}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
                  >
                    پرداخت
                  </button>
                </div>
              </div>

              {/* Info Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <InformationCircleIcon className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-blue-900 mb-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      نکات مهم
                    </h4>
                    <ul className="text-xs text-blue-800 space-y-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      <li>• نام و نام خانوادگی باید به انگلیسی و مطابق با گذرنامه باشد</li>
                      <li>• کد ملی باید معتبر باشد</li>
                      <li>• اطلاعات تماس برای ارسال بلیط الکترونیکی استفاده می‌شود</li>
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

