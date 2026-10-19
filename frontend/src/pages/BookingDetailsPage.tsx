import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setUser } from '../store/slices/authSlice';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import AuthModal from '../components/Auth/AuthModal';
import { useLanguage } from '../contexts/LanguageContext';
import { cities } from '../data/cities';
import bookingService from '../services/bookingService';
import { authService } from '../services/authService';
import { getFlightSaleState, getFlightSaleCopy, FlightSaleState } from '../services/niraApi';
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

const isTenDigitId = (value?: string | null) => /^\d{10}$/.test(String(value || '').trim());
const BOGUS_NAME = /^(iranian|afghan|iraqi|other|ایرانی|افغان|عراقی|سایر)$/i;

/** Resolve national ID from profile — new users store it in national_id; legacy used first_name */
const resolveProfileNationalId = (user: { national_id?: string; first_name?: string } | null | undefined) => {
  if (!user) return '';
  if (isTenDigitId(user.national_id)) return String(user.national_id).trim();
  if (isTenDigitId(user.first_name)) return String(user.first_name).trim();
  return '';
};

const resolveProfileName = (value?: string | null) => {
  const name = String(value || '').trim();
  if (!name || isTenDigitId(name) || BOGUS_NAME.test(name)) return '';
  return name;
};

const resolveProfileBirthDate = (value?: string | null) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  // Accept YYYY-MM-DD or ISO datetime
  const m = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : '';
};

const resolveProfilePhone = (value?: string | null) => {
  let phone = String(value || '').replace(/[\s\-]/g, '');
  if (phone.startsWith('+98')) phone = `0${phone.slice(3)}`;
  else if (phone.startsWith('0098')) phone = `0${phone.slice(4)}`;
  else if (phone.startsWith('98') && phone.length === 12) phone = `0${phone.slice(2)}`;
  return /^09\d{9}$/.test(phone) ? phone : String(value || '').replace(/\D/g, '').slice(0, 11);
};

const lockedInputClass =
  'w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-700';
const editableInputClass =
  'w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900';

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
  const dispatch = useDispatch();
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
  const [saleBlockNotice, setSaleBlockNotice] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

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

  // Re-check sale state so deep-link / stale state cannot reach payment
  const resolvedSaleState: FlightSaleState = (() => {
    if (flightFromState?.saleState) return flightFromState.saleState as FlightSaleState;
    if (flightFromState?.originalData) {
      return getFlightSaleState(flightFromState.originalData);
    }
    if (flightFromState?.canBook === false) return 'sale_closed';
    if (Number(flightFromState?.price || 0) <= 0) return 'sale_closed';
    return 'bookable';
  })();
  const canBookFlight = resolvedSaleState === 'bookable' && Number(flight.basePrice?.adult || 0) > 0;
  const saleCopy = getFlightSaleCopy(resolvedSaleState, language);

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

  // After login/register on this page, drop the "please login" banner
  useEffect(() => {
    if (isAuthenticated) {
      setErrors((prev) => prev.filter((e) => !e.includes('وارد حساب')));
      setIsAuthModalOpen(false);
    }
  }, [isAuthenticated]);

  // Refresh profile from API so first/last name & DOB are not stale from localStorage
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    (async () => {
      try {
        const profile = await authService.getProfile();
        if (!cancelled && profile) {
          dispatch(setUser(profile));
        }
      } catch {
        // keep cached user if profile fetch fails
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, dispatch]);

  const profileFirstName = resolveProfileName(user?.first_name);
  const profileLastName = resolveProfileName(user?.last_name);
  const profileNationalId = resolveProfileNationalId(user);
  const profileBirthDate = resolveProfileBirthDate(user?.date_of_birth);
  const profilePhone = resolveProfilePhone(user?.phone_number);
  const profileEmail = String(user?.email || '').trim();
  const profileGender =
    user?.gender === 'female' || user?.gender === 'F' || user?.gender === 'زن'
      ? 'female'
      : user?.gender === 'male' || user?.gender === 'M' || user?.gender === 'مرد'
        ? 'male'
        : '';
  const profilePassport = String(user?.passport_number || '').trim();
  const lockFirstPassenger = isAuthenticated && !!user;

  // Auto-fill first passenger + contact from logged-in profile (overwrite empty / keep in sync)
  useEffect(() => {
    if (!isAuthenticated || !user || passengers.length === 0) return;

    setPassengers((prev) => {
      if (prev.length === 0) return prev;
      const first = prev[0];
      const next = { ...first };
      let changed = false;

      if (profileNationalId && first.nationalId !== profileNationalId) {
        next.nationalId = profileNationalId;
        next.isForeign = false;
        changed = true;
      }
      if (profileFirstName && first.firstName !== profileFirstName) {
        next.firstName = profileFirstName;
        changed = true;
      }
      if (profileLastName && first.lastName !== profileLastName) {
        next.lastName = profileLastName;
        changed = true;
      } else if (!profileLastName && BOGUS_NAME.test(first.lastName || '')) {
        // Clear mistaken nationality values typed into last name
        next.lastName = '';
        changed = true;
      }
      if (profileBirthDate && first.birthDate !== profileBirthDate) {
        next.birthDate = profileBirthDate;
        changed = true;
      }
      if (profileGender && first.gender !== profileGender) {
        next.gender = profileGender;
        changed = true;
      }
      if (profilePassport && first.isForeign && first.passportNumber !== profilePassport) {
        next.passportNumber = profilePassport;
        changed = true;
      }
      if (!changed) return prev;
      const updated = [...prev];
      updated[0] = next;
      return updated;
    });

    setContactInfo((prev) => ({
      phone: profilePhone || prev.phone,
      email: profileEmail || prev.email,
    }));
  }, [
    isAuthenticated,
    user,
    passengers.length,
    profileNationalId,
    profileFirstName,
    profileLastName,
    profileBirthDate,
    profilePhone,
    profileEmail,
    profileGender,
    profilePassport,
  ]);

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
    setSaleBlockNotice(false);
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
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      const idempotencyKey =
        (typeof crypto !== 'undefined' && crypto.randomUUID)
          ? crypto.randomUUID()
          : `hold-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const initiated = await bookingService.initiatePayment({
        flight_data: flight,
        passengers,
        contact_info: contactInfo,
        total_amount: calculateTotalPrice(),
        cabin_class: String(flight.class || 'economy').toUpperCase(),
        idempotency_key: idempotencyKey,
      });

      // If airline configured Nira-hosted payment UI, go there directly
      if (initiated.payment_mode === 'nira_redirect' && initiated.payment_url) {
        sessionStorage.setItem('pendingBooking', JSON.stringify({
          flight,
          passengers,
          contactInfo,
          totalPrice: calculateTotalPrice(),
          bookingDraft: initiated,
          paymentMode: 'nira_redirect',
        }));
        window.location.href = initiated.payment_url;
        return;
      }

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
        'خطا در رزرو موقت. لطفا دوباره تلاش کنید.';
      const code = err?.response?.data?.code;
      if (!canBookFlight || code === 'sold_out' || code === 'flight_gone') {
        setSaleBlockNotice(true);
      }
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
                  <h4 className="font-bold text-red-800 mb-2" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    {t('booking.formErrors')}
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
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
                    <h2 className="text-lg sm:text-xl font-bold text-white" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                      {t('booking.passengerInfo')}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 px-2 sm:px-3 py-1 rounded-lg">
                    <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    <span className="text-white font-bold text-sm sm:text-base" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
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
                            <span className="text-blue-900 font-bold text-sm sm:text-base" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm sm:text-base" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                              {getPassengerTypeLabel(passenger.type)}
                            </h3>
                            <p className="text-xs text-gray-500" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                              {t('booking.passengerNumber')} {index + 1}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Gender */}
                      {(() => {
                        const isPrimary = lockFirstPassenger && index === 0;
                        const lockGender = isPrimary && !!profileGender;
                        const lockForeign = isPrimary && !!profileNationalId;
                        // Always lock name fields for logged-in primary passenger
                        const lockFirst = isPrimary;
                        const lockLast = isPrimary;
                        const lockNid = isPrimary && !!profileNationalId;
                        const lockDob = isPrimary && !!profileBirthDate;
                        const lockPassport = isPrimary && !!profilePassport;
                        const profileTag = (
                          <span className="text-xs text-green-600 mr-2">({t('booking.fromYourProfile')})</span>
                        );
                        return (
                      <>
                      <div className="flex flex-wrap gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <label className={`flex items-center gap-2 ${lockGender ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}>
                          <input
                            type="radio"
                            name={`gender-${index}`}
                            checked={passenger.gender === 'male'}
                            onChange={() => updatePassenger(index, 'gender', 'male')}
                            disabled={lockGender}
                            className="w-4 h-4 text-blue-900 focus:ring-blue-900"
                          />
                          <span style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>{t('booking.male')}</span>
                        </label>
                        <label className={`flex items-center gap-2 ${lockGender ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}>
                          <input
                            type="radio"
                            name={`gender-${index}`}
                            checked={passenger.gender === 'female'}
                            onChange={() => updatePassenger(index, 'gender', 'female')}
                            disabled={lockGender}
                            className="w-4 h-4 text-blue-900 focus:ring-blue-900"
                          />
                          <span style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>{t('booking.female')}</span>
                        </label>
                        <label className={`flex items-center gap-2 mr-auto ${lockForeign ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}>
                          <input
                            type="checkbox"
                            checked={passenger.isForeign}
                            onChange={(e) => updatePassenger(index, 'isForeign', e.target.checked)}
                            disabled={lockForeign}
                            className="w-4 h-4 text-blue-900 focus:ring-blue-900 rounded"
                          />
                          <span style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>{t('booking.foreignNational')}</span>
                        </label>
                      </div>

                      {/* Personal Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                            {t('booking.firstNameEnglish')} *
                            {lockFirst ? profileTag : null}
                          </label>
                          <input
                            type="text"
                            value={passenger.firstName}
                            onChange={(e) => updatePassenger(index, 'firstName', e.target.value)}
                            disabled={lockFirst}
                            readOnly={lockFirst}
                            className={lockFirst ? lockedInputClass : editableInputClass}
                            style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: 'ltr', textAlign: 'left' }}
                            placeholder="First Name"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                            {t('booking.lastNameEnglish')} *
                            {lockLast ? profileTag : null}
                          </label>
                          <input
                            type="text"
                            value={passenger.lastName}
                            onChange={(e) => updatePassenger(index, 'lastName', e.target.value)}
                            disabled={lockLast}
                            readOnly={lockLast}
                            className={lockLast ? lockedInputClass : editableInputClass}
                            style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: 'ltr', textAlign: 'left' }}
                            placeholder="Last Name"
                            required
                          />
                        </div>

                        {!passenger.isForeign && (
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                              {t('booking.nationalId')} *
                              {lockNid ? profileTag : null}
                            </label>
                            <input
                              type="text"
                              value={passenger.nationalId}
                              onChange={(e) => updatePassenger(index, 'nationalId', e.target.value.replace(/\D/g, '').slice(0, 10))}
                              disabled={lockNid}
                              readOnly={lockNid}
                              className={lockNid ? lockedInputClass : editableInputClass}
                              style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: 'ltr', textAlign: 'right' }}
                              placeholder={t('booking.nationalId10Digits')}
                              maxLength={10}
                              required
                            />
                          </div>
                        )}

                        {passenger.isForeign && (
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                              {t('booking.passportNumber')} *
                              {lockPassport ? profileTag : null}
                            </label>
                            <input
                              type="text"
                              value={passenger.passportNumber || ''}
                              onChange={(e) => updatePassenger(index, 'passportNumber', e.target.value)}
                              disabled={lockPassport}
                              readOnly={lockPassport}
                              className={lockPassport ? lockedInputClass : editableInputClass}
                              style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: 'ltr', textAlign: 'left' }}
                              placeholder="Passport Number"
                              required
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                            {t('booking.birthDate')} *
                            {lockDob ? profileTag : null}
                          </label>
                          <div className="relative">
                            <CalendarDaysIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            <input
                              type="date"
                              value={passenger.birthDate}
                              onChange={(e) => updatePassenger(index, 'birthDate', e.target.value)}
                              max={new Date().toISOString().split('T')[0]}
                              disabled={lockDob}
                              readOnly={lockDob}
                              className={`pr-10 pl-3 ${lockDob ? lockedInputClass : editableInputClass}`}
                              style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}
                              required
                            />
                          </div>
                        </div>
                      </div>
                      </>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              </div>

              {/* Discount Code */}
              {!showDiscountInput ? (
                <button
                  onClick={() => setShowDiscountInput(true)}
                  className="text-blue-900 hover:text-blue-800 text-xs sm:text-sm font-bold"
                  style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
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
                      style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: 'ltr', textAlign: 'left' }}
                      placeholder="Discount Code"
                    />
                    <button
                      type="button"
                      className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base"
                      style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
                    >
                      {t('booking.apply')}
                    </button>
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-3 sm:p-4">
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    <PhoneIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    {t('booking.contactInfo')}
                  </h2>
                </div>

                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                      {t('booking.passengerPhone')} *
                      {lockFirstPassenger && profilePhone ? (
                        <span className="text-xs text-green-600 mr-2">({t('booking.fromYourProfile')})</span>
                      ) : null}
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex items-center gap-2 px-2 sm:px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                        <span className="text-xl sm:text-2xl">🇮🇷</span>
                        <span className="font-bold text-sm sm:text-base" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>+98</span>
                      </div>
                      <input
                        type="tel"
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 11) }))}
                        disabled={lockFirstPassenger && !!profilePhone}
                        readOnly={lockFirstPassenger && !!profilePhone}
                        className={`flex-1 ${lockFirstPassenger && profilePhone ? lockedInputClass : editableInputClass}`}
                        style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: 'ltr', textAlign: 'right' }}
                        placeholder="09123456789"
                        maxLength={11}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                      {t('booking.emailAddress')} *
                      {lockFirstPassenger && profileEmail ? (
                        <span className="text-xs text-green-600 mr-2">({t('booking.fromYourProfile')})</span>
                      ) : null}
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                      <input
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                        disabled={lockFirstPassenger && !!profileEmail}
                        readOnly={lockFirstPassenger && !!profileEmail}
                        className={`pr-8 sm:pr-10 pl-3 ${lockFirstPassenger && profileEmail ? lockedInputClass : editableInputClass}`}
                        style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: 'ltr', textAlign: 'left' }}
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
                  <h3 className="font-bold text-white text-sm sm:text-base" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    {t('booking.flightInfo')}
                  </h3>
                </div>
                <div className="p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="text-center flex-1">
                      <div className="text-lg sm:text-2xl font-bold text-gray-900" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                        {flight.departureTime}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                        {getCityName(flight.origin)}
                      </div>
                    </div>
                    <div className="px-2 sm:px-4">
                      <PaperAirplaneIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-900 rotate-90" />
                    </div>
                    <div className="text-center flex-1">
                      <div className="text-lg sm:text-2xl font-bold text-gray-900" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                        {flight.arrivalTime}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                        {getCityName(flight.destination)}
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-xs sm:text-sm text-gray-500 mb-2" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    {flight.date}
                  </div>
                  <div className="text-center">
                    <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-xs font-bold" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                      {flight.flightNumber}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate('/flights/results')}
                    className="w-full mt-2 sm:mt-3 text-red-600 hover:text-red-700 text-xs sm:text-sm font-bold"
                    style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
                  >
                    {t('booking.changeFlight')}
                  </button>
                </div>
              </div>

              {/* Invoice */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-3 sm:p-4">
                  <h3 className="font-bold text-white text-sm sm:text-base" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    {t('booking.invoice')}
                  </h3>
                </div>
                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  {/* Price Breakdown */}
                  {passengers.filter(p => p.type === 'adult').length > 0 && (
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                        {t('passengers.adult')} ({passengers.filter(p => p.type === 'adult').length}):
                      </span>
                      <span className="font-bold" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
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
                      <span style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                        {t('passengers.child')} ({passengers.filter(p => p.type === 'child').length}):
                      </span>
                      <span className="font-bold" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
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
                      <span style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                        {t('passengers.infant')} ({passengers.filter(p => p.type === 'infant').length}):
                      </span>
                      <span className="font-bold" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
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
                      <span style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>{t('booking.discountAmount')}</span>
                      <span className="font-bold text-green-600" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                        0 {t('flights.currency')}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>{t('booking.extraCost')}</span>
                      <span className="font-bold" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                        0 {t('flights.currency')}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-2 sm:pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-base sm:text-lg font-bold" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                        {t('booking.payableAmount')}
                      </span>
                      <span className="text-xl sm:text-2xl font-bold text-blue-900" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
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
                    <span className="text-xs text-gray-700" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                      {t('booking.acceptTerms')}
                    </span>
                  </label>

                  {saleBlockNotice && !canBookFlight ? (
                    <div
                      className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-3 text-sm text-amber-950 leading-relaxed"
                      style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
                      role="alert"
                    >
                      <span
                        className={`inline-block mb-2 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          resolvedSaleState === 'sale_closed'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {saleCopy.badge}
                      </span>
                      <p className="font-semibold mb-1">{saleCopy.cta}</p>
                      <p>{saleCopy.notice}</p>
                    </div>
                  ) : null}

                  {/* Payment Button — always clickable; sale status explained after click */}
                  <button
                    onClick={handlePayment}
                    disabled={!acceptedTerms}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 sm:py-4 rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                    style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
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
                    <h4 className="text-xs sm:text-sm font-bold text-blue-900 mb-1 sm:mb-2" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                      {t('booking.importantNotes')}
                    </h4>
                    <ul className="text-xs text-blue-800 space-y-1" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
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

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          if (isAuthenticated) {
            setErrors((prev) => prev.filter((e) => !e.includes('وارد حساب')));
          }
        }}
        initialMode={authModalMode}
        stayOnPage
      />
    </div>
  );
};

export default BookingDetailsPage;

