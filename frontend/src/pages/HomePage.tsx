import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import EmiratesFlightSearchForm from '../components/FlightSearch/EmiratesFlightSearchForm';
import WeatherWidget from '../components/Weather/WeatherWidget';
import { useLanguage } from '../contexts/LanguageContext';
import galleryService, { HeroSlider } from '../services/galleryService';
import { 
  PaperAirplaneIcon, 
  BuildingOfficeIcon, 
  GiftIcon,
  ShieldCheckIcon,
  ClockIcon,
  UserGroupIcon,
  SparklesIcon,
  StarIcon,
  GlobeAltIcon,
  HeartIcon,
  MapPinIcon,
  FireIcon,
  CalendarDaysIcon,
  TrophyIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  TruckIcon,
  WifiIcon,
  PhotoIcon,
  EyeIcon,
  XMarkIcon,
  NewspaperIcon,
  UserIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  TicketIcon,
  ClipboardDocumentIcon,
  ArrowPathIcon,
  CreditCardIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, fontClass, language } = useLanguage();
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [selectedFAQ, setSelectedFAQ] = useState<string | null>(null);
  
  // Hero Slider state
  // تصاویر از API دریافت می‌شوند و هر 12 ثانیه به صورت افقی تغییر می‌کنند
  const [heroSliders, setHeroSliders] = useState<HeroSlider[]>([]);
  const [heroImages, setHeroImages] = useState<string[]>([
    '/images/tstnasim.jpg',
    '/images/tstnasim2.jpg',
    '/images/tstnasim3.jpg',
    '/images/tstnasim4.jpg',
    '/images/tstnasim5.jpg'
  ]);
  const [currentHeroImageIndex, setCurrentHeroImageIndex] = useState(0);

  // Flight Search state
  const [tripType, setTripType] = useState<'round' | 'oneway' | 'multi'>('round');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departDate, setDepartDate] = useState('2024-01-15');
  const [returnDate, setReturnDate] = useState('2024-01-22');
  const [priceRange, setPriceRange] = useState([200, 1200]);
  const [passengers, setPassengers] = useState('');

  // Booking state
  const [passengerInfo, setPassengerInfo] = useState({
    firstName: '',
    lastName: '',
    nationalId: '',
    email: '',
    phone: '',
    address: ''
  });

  const [flightInfo, setFlightInfo] = useState({
    from: '',
    to: '',
    date: '2024-01-15',
    passengers: '',
    seat: '12A',
    price: '$450'
  });

  const [extras, setExtras] = useState({
    insurance: false,
    extraBaggage: false,
    meal: false
  });

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [showSeatModal, setShowSeatModal] = useState(false);
  const [show3DViewer, setShow3DViewer] = useState(false);
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const [hoveredService, setHoveredService] = useState<number | null>(null);
  const [activeFlightTab, setActiveFlightTab] = useState<'search' | 'manage' | 'whatson' | 'status' | 'services'>('search');

  const reservedSeats = ['A1', 'B2', 'C3', 'D4', 'A5', 'B6'];
  
  // Memoized cities array to prevent re-renders
  const weatherCities = useMemo(() => ['Tehran', 'Mashhad', 'Kish', 'Abadan', 'Isfahan'], []);

  // Special Offers Cards Data and Rotation State
  interface OfferCard {
    id: number;
    from: { fa: string; ar: string; en: string };
    to: { fa: string; ar: string; en: string };
    price: { fa: string; ar: string; en: string };
    date: { fa: string; ar: string; en: string };
    image: string;
    alt: string;
    fallbackImage: string;
  }

  const allOfferCards: OfferCard[] = [
    {
      id: 1,
      from: { fa: 'تهران', ar: 'طهران', en: 'Tehran' },
      to: { fa: 'دبی', ar: 'دبي', en: 'Dubai' },
      price: { fa: '۱۵,۸۰۰,۰۰۰ تومان', ar: '۱۵,۸۰۰,۰۰۰ ريال', en: '15,800,000 Toman' },
      date: { fa: '۱۴۰۴/۱۰/۰۵', ar: '۱۴۰۴/۱۰/۰۵', en: '2025/12/26' },
      image: '/images/tehran.jpg',
      alt: 'تهران - دبی',
      fallbackImage: '/images/airport-plane-photo_991869-62.jpg'
    },
    {
      id: 2,
      from: { fa: 'مشهد', ar: 'مشهد', en: 'Mashhad' },
      to: { fa: 'کیش', ar: 'كيش', en: 'Kish' },
      price: { fa: '۹,۵۰۰,۰۰۰ تومان', ar: '۹,۵۰۰,۰۰۰ ريال', en: '9,500,000 Toman' },
      date: { fa: '۱۴۰۴/۱۰/۰۸', ar: '۱۴۰۴/۱۰/۰۸', en: '2025/12/29' },
      image: '/images/mashhad.jpeg',
      alt: 'مشهد - کیش',
      fallbackImage: '/images/airplane-clouds-night_864588-19786.jpg'
    },
    {
      id: 3,
      from: { fa: 'اصفهان', ar: 'أصفهان', en: 'Isfahan' },
      to: { fa: 'تهران', ar: 'طهران', en: 'Tehran' },
      price: { fa: '۶,۲۰۰,۰۰۰ تومان', ar: '۶,۲۰۰,۰۰۰ ريال', en: '6,200,000 Toman' },
      date: { fa: '۱۴۰۴/۱۰/۱۰', ar: '۱۴۰۴/۱۰/۱۰', en: '2025/12/31' },
      image: '/images/isfahan.jpg',
      alt: 'اصفهان - تهران',
      fallbackImage: '/images/skyward-soar-airplane-flying-blue-sky-clouds_391229-21566.jpg'
    },
    {
      id: 4,
      from: { fa: 'تبریز', ar: 'تبريز', en: 'Tabriz' },
      to: { fa: 'مشهد', ar: 'مشهد', en: 'Mashhad' },
      price: { fa: '۸,۹۰۰,۰۰۰ تومان', ar: '۸,۹۰۰,۰۰۰ ريال', en: '8,900,000 Toman' },
      date: { fa: '۱۴۰۴/۱۰/۱۲', ar: '۱۴۰۴/۱۰/۱۲', en: '2026/01/02' },
      image: '/images/tabriz.jpg',
      alt: 'تبریز - مشهد',
      fallbackImage: '/images/sheremetyevo-airport-view-in-rainy-evening-moscow-free-video.jpg'
    },
    {
      id: 5,
      from: { fa: 'کیش', ar: 'كيش', en: 'Kish' },
      to: { fa: 'تهران', ar: 'طهران', en: 'Tehran' },
      price: { fa: '۱۰,۳۰۰,۰۰۰ تومان', ar: '۱۰,۳۰۰,۰۰۰ ريال', en: '10,300,000 Toman' },
      date: { fa: '۱۴۰۴/۱۰/۱۵', ar: '۱۴۰۴/۱۰/۱۵', en: '2026/01/05' },
      image: '/images/kish.jpg',
      alt: 'کیش - تهران',
      fallbackImage: '/images/airport-crew.jpg'
    },
    {
      id: 6,
      from: { fa: 'آبادان', ar: 'أبادان', en: 'Abadan' },
      to: { fa: 'مشهد', ar: 'مشهد', en: 'Mashhad' },
      price: { fa: '۱۱,۷۰۰,۰۰۰ تومان', ar: '۱۱,۷۰۰,۰۰۰ ريال', en: '11,700,000 Toman' },
      date: { fa: '۱۴۰۴/۱۰/۱۸', ar: '۱۴۰۴/۱۰/۱۸', en: '2026/01/08' },
      image: '/images/abadan.jpeg',
      alt: 'آبادان - مشهد',
      fallbackImage: '/images/airplane-clouds-night_864588-19786.jpg'
    },
    {
      id: 7,
      from: { fa: 'تهران', ar: 'طهران', en: 'Tehran' },
      to: { fa: 'اصفهان', ar: 'أصفهان', en: 'Isfahan' },
      price: { fa: '۷,۴۰۰,۰۰۰ تومان', ar: '۷,۴۰۰,۰۰۰ ريال', en: '7,400,000 Toman' },
      date: { fa: '۱۴۰۴/۱۰/۲۰', ar: '۱۴۰۴/۱۰/۲۰', en: '2026/01/10' },
      image: '/images/tehran.jpg',
      alt: 'تهران - اصفهان',
      fallbackImage: '/images/skyward-soar-airplane-flying-blue-sky-clouds_391229-21566.jpg'
    },
    {
      id: 8,
      from: { fa: 'مشهد', ar: 'مشهد', en: 'Mashhad' },
      to: { fa: 'تبریز', ar: 'تبريز', en: 'Tabriz' },
      price: { fa: '۹,۸۰۰,۰۰۰ تومان', ar: '۹,۸۰۰,۰۰۰ ريال', en: '9,800,000 Toman' },
      date: { fa: '۱۴۰۴/۱۰/۲۲', ar: '۱۴۰۴/۱۰/۲۲', en: '2026/01/12' },
      image: '/images/mashhad.jpeg',
      alt: 'مشهد - تبریز',
      fallbackImage: '/images/airport-plane-photo_991869-62.jpg'
    },
    {
      id: 9,
      from: { fa: 'کیش', ar: 'كيش', en: 'Kish' },
      to: { fa: 'مشهد', ar: 'مشهد', en: 'Mashhad' },
      price: { fa: '۱۲,۱۰۰,۰۰۰ تومان', ar: '۱۲,۱۰۰,۰۰۰ ريال', en: '12,100,000 Toman' },
      date: { fa: '۱۴۰۴/۱۰/۲۵', ar: '۱۴۰۴/۱۰/۲۵', en: '2026/01/15' },
      image: '/images/kish.jpg',
      alt: 'کیش - مشهد',
      fallbackImage: '/images/airplane-clouds-night_864588-19786.jpg'
    },
    {
      id: 10,
      from: { fa: 'تهران', ar: 'طهران', en: 'Tehran' },
      to: { fa: 'کیش', ar: 'كيش', en: 'Kish' },
      price: { fa: '۸,۶۰۰,۰۰۰ تومان', ar: '۸,۶۰۰,۰۰۰ ريال', en: '8,600,000 Toman' },
      date: { fa: '۱۴۰۴/۱۰/۲۸', ar: '۱۴۰۴/۱۰/۲۸', en: '2026/01/18' },
      image: '/images/tehran.jpg',
      alt: 'تهران - کیش',
      fallbackImage: '/images/skyward-soar-airplane-flying-blue-sky-clouds_391229-21566.jpg'
    }
  ];

  // State for managing visible cards and queue
  const [visibleCardIds, setVisibleCardIds] = useState<number[]>([1, 2, 3, 4]);
  const [queueCardIds, setQueueCardIds] = useState<number[]>([5, 6, 7, 8, 9, 10]);
  const [newCardId, setNewCardId] = useState<number | null>(null);
  const [removingCard, setRemovingCard] = useState<OfferCard | null>(null);
  
  // Use refs to access current state in interval
  const visibleRef = useRef(visibleCardIds);
  const queueRef = useRef(queueCardIds);
  
  useEffect(() => {
    visibleRef.current = visibleCardIds;
  }, [visibleCardIds]);
  
  useEffect(() => {
    queueRef.current = queueCardIds;
  }, [queueCardIds]);

  useEffect(() => {
    setIsLoaded(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Update default values when language changes
  useEffect(() => {
    if (!from) setFrom(t('home.flightSearch.defaultFrom'));
    if (!to) setTo(t('home.flightSearch.defaultTo'));
    if (!passengers) setPassengers(t('home.flightSearch.defaultPassengers'));
    if (!flightInfo.from) setFlightInfo(prev => ({ ...prev, from: t('home.flightSearch.defaultFrom') }));
    if (!flightInfo.to) setFlightInfo(prev => ({ ...prev, to: t('home.flightSearch.defaultTo') }));
    if (!flightInfo.passengers) setFlightInfo(prev => ({ ...prev, passengers: t('home.flightSearch.defaultPassengers') }));
  }, [t]);

  // Fetch Hero Slider images from API
  useEffect(() => {
    const fetchHeroSliders = async () => {
      try {
        console.log('Fetching hero sliders from API...');
        const sliders = await galleryService.getHeroSliders();
        console.log('Hero sliders received:', sliders);
        
        if (sliders && sliders.length > 0) {
          setHeroSliders(sliders);
          // Extract image URLs from API response
          const imageUrls = sliders.map(slider => slider.image_url);
          console.log('Image URLs extracted:', imageUrls);
          setHeroImages(imageUrls);
        } else {
          console.log('No sliders received from API, using default images');
        }
        // If no sliders from API, keep default images
      } catch (error) {
        console.error('Error loading hero sliders:', error);
        // Keep default images on error
      }
    };

    fetchHeroSliders();
  }, []);

  // Handle smooth scroll to search form when hash is present or from navigation state
  useEffect(() => {
    const hash = window.location.hash;
    const scrollToSection = (location.state as any)?.scrollTo;
    
    if (hash === '#search-form' || scrollToSection === 'search-form') {
      setTimeout(() => {
        const element = document.getElementById('search-form');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }, [location]);

  // Handle opening weather modal from navigation state
  useEffect(() => {
    const openWeather = (location.state as any)?.openWeather;
    
    if (openWeather) {
      setTimeout(() => {
        setShowWeatherModal(true);
      }, 500);
    }
  }, [location]);

  // Hero Slider auto-play
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 12000); // 12 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Special Offers Cards Rotation - Every 3.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const currentVisible = visibleRef.current;
      const currentQueue = queueRef.current;
      
      if (currentVisible.length === 0 || currentQueue.length === 0) {
        return; // Don't rotate if arrays are empty
      }
      
      // Move first visible card to end of queue
      const cardToHideId = currentVisible[0];
      // Move first card from queue to visible
      const cardToShowId = currentQueue[0];
      const cardToHide = allOfferCards.find(c => c.id === cardToHideId) || null;
      
      // Remember the card that is leaving so we can animate its exit
      setRemovingCard(cardToHide);
      // Mark new card for slide-in animation (will be visible after arrays update)
      setNewCardId(cardToShowId);
      
      // Update visible cards: remove first, add first from queue
      setVisibleCardIds(prev => {
        const [, ...rest] = prev; // drop first (cardToHideId)
        return [...rest, cardToShowId];
      });
      
      // Update queue: remove first, add hidden card to end
      setQueueCardIds(prev => {
        const [, ...rest] = prev; // drop first (cardToShowId)
        return [...rest, cardToHideId];
      });
      
      // Clear animation markers after animations complete
      setTimeout(() => {
        setRemovingCard(null);
        setNewCardId(null);
      }, 600); // animation duration (must match CSS)
    }, 3500); // 3.5 seconds

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: PaperAirplaneIcon,
      title: t('home.features.diverseFlights'),
      description: t('home.features.diverseFlightsDesc'),
      gradient: 'from-blue-500 to-cyan-500',
      delay: '0ms'
    },
    {
      icon: BuildingOfficeIcon,
      title: t('home.features.hotelBooking'),
      description: t('home.features.hotelBookingDesc'),
      gradient: 'from-purple-500 to-pink-500',
      delay: '100ms'
    },
    {
      icon: GiftIcon,
      title: t('home.features.specialPackages'),
      description: t('home.features.specialPackagesDesc'),
      gradient: 'from-emerald-500 to-teal-500',
      delay: '200ms'
    },
    {
      icon: ShieldCheckIcon,
      title: t('home.features.highSecurity'),
      description: t('home.features.highSecurityDesc'),
      gradient: 'from-amber-500 to-orange-500',
      delay: '300ms'
    },
    {
      icon: ClockIcon,
      title: t('home.features.support247'),
      description: t('home.features.support247Desc'),
      gradient: 'from-red-500 to-rose-500',
      delay: '400ms'
    },
    {
      icon: UserGroupIcon,
      title: t('home.features.loyaltyProgram'),
      description: t('home.features.loyaltyProgramDesc'),
      gradient: 'from-indigo-500 to-blue-500',
      delay: '500ms'
    }
  ];

  // Destinations data
  const destinations = useMemo(() => [
    {
      id: 1,
      name: t('destinations.tehran.name'),
      description: t('destinations.tehran.desc'),
      country: t('destinations.iran'),
      flights: t('destinations.dailyFlights'),
      price: `${t('destinations.from')} $120`,
      image: '/images/tehran.jpg',
      gradient: 'from-blue-500 to-blue-700'
    },
    {
      id: 2,
      name: t('destinations.mashhad.name'),
      description: t('destinations.mashhad.desc'),
      country: t('destinations.iran'),
      flights: t('destinations.dailyFlights'),
      price: `${t('destinations.from')} $95`,
      image: '/images/mashhad.jpeg',
      gradient: 'from-orange-500 to-orange-700'
    },
    {
      id: 7,
      name: t('destinations.kish.name'),
      description: t('destinations.kish.desc'),
      country: t('destinations.iran'),
      flights: t('destinations.dailyFlights'),
      price: `${t('destinations.from')} $85`,
      image: '/images/kish.jpg',
      gradient: 'from-cyan-500 to-cyan-700'
    },
    {
      id: 8,
      name: t('destinations.abadan.name'),
      description: t('destinations.abadan.desc'),
      country: t('destinations.iran'),
      flights: t('destinations.dailyFlights'),
      price: `${t('destinations.from')} $90`,
      image: '/images/abadan1.jpg',
      gradient: 'from-green-500 to-green-700'
    },
    {
      id: 9,
      name: t('destinations.tabriz.name'),
      description: t('destinations.tabriz.desc'),
      country: t('destinations.iran'),
      flights: t('destinations.dailyFlights'),
      price: `${t('destinations.from')} $100`,
      image: '/images/tabriz.jpg',
      gradient: 'from-red-500 to-red-700'
    },
    {
      id: 10,
      name: t('destinations.isfahan.name'),
      description: t('destinations.isfahan.desc'),
      country: t('destinations.iran'),
      flights: t('destinations.dailyFlights'),
      price: `${t('destinations.from')} $105`,
      image: '/images/isfahan.jpg',
      gradient: 'from-blue-500 to-blue-700'
    },
    {
      id: 3,
      name: t('destinations.shiraz.name'),
      description: t('destinations.shiraz.desc'),
      country: t('destinations.iran'),
      flights: t('destinations.dailyFlights'),
      price: `${t('destinations.from')} $110`,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      gradient: 'from-pink-500 to-pink-700'
    },
    {
      id: 4,
      name: t('destinations.dubai.name'),
      description: t('destinations.dubai.desc'),
      country: t('destinations.uae'),
      flights: t('destinations.dailyFlights'),
      price: `${t('destinations.from')} $280`,
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop',
      gradient: 'from-yellow-500 to-yellow-700'
    },
    {
      id: 5,
      name: t('destinations.istanbul.name'),
      description: t('destinations.istanbul.desc'),
      country: t('destinations.turkey'),
      flights: t('destinations.dailyFlights'),
      price: `${t('destinations.from')} $320`,
      image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&h=300&fit=crop',
      gradient: 'from-purple-500 to-purple-700'
    },
    {
      id: 6,
      name: t('destinations.paris.name'),
      description: t('destinations.paris.desc'),
      country: t('destinations.france'),
      flights: t('destinations.weeklyFlights'),
      price: `${t('destinations.from')} $450`,
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop',
      gradient: 'from-indigo-500 to-indigo-700'
    }
  ], [t]);

  // Services data
  const services = useMemo(() => [
    {
      id: 1,
      title: t('services.domesticFlights.title'),
      description: t('services.domesticFlights.description'),
      icon: PaperAirplaneIcon,
      gradient: 'from-blue-500 to-blue-700',
      features: [t('services.feature.dailyFlights'), t('services.feature.goodPrice'), t('services.feature.highSecurity')]
    },
    {
      id: 2,
      title: t('services.internationalFlights.title'),
      description: t('services.internationalFlights.description'),
      icon: GlobeAltIcon,
      gradient: 'from-green-500 to-green-700',
      features: [t('services.feature.diverseDestinations'), t('services.feature.directFlight'), t('services.feature.internationalServices')]
    },
    {
      id: 3,
      title: t('services.vip.title'),
      description: t('services.vip.description'),
      icon: StarIcon,
      gradient: 'from-purple-500 to-purple-700',
      features: [t('services.feature.privateLounge'), t('services.feature.personalService'), t('services.feature.moreComfort')]
    },
    {
      id: 4,
      title: t('services.hotelBooking.title'),
      description: t('services.hotelBooking.description'),
      icon: BuildingOfficeIcon,
      gradient: 'from-orange-500 to-orange-700',
      features: [t('services.feature.luxuryHotels'), t('services.feature.competitivePrice'), t('services.feature.easyBooking')]
    },
    {
      id: 5,
      title: t('services.travelPackages.title'),
      description: t('services.travelPackages.description'),
      icon: GiftIcon,
      gradient: 'from-pink-500 to-pink-700',
      features: [t('services.feature.specialDiscount'), t('services.feature.completePackage'), t('services.feature.savings')]
    },
    {
      id: 6,
      title: t('services.travelInsurance.title'),
      description: t('services.travelInsurance.description'),
      icon: ShieldCheckIcon,
      gradient: 'from-red-500 to-red-700',
      features: [t('services.feature.fullCoverage'), t('services.feature.fastPayment'), t('services.feature.support247')]
    },
    {
      id: 7,
      title: t('services.extraBaggage.title'),
      description: t('services.extraBaggage.description'),
      icon: TruckIcon,
      gradient: 'from-indigo-500 to-indigo-700',
      features: [t('services.feature.moreCapacity'), t('services.feature.goodPrice'), t('services.feature.baggageSecurity')]
    },
    {
      id: 8,
      title: t('services.freeInternet.title'),
      description: t('services.freeInternet.description'),
      icon: WifiIcon,
      gradient: 'from-teal-500 to-teal-700',
      features: [t('services.feature.highSpeed'), t('services.feature.free'), t('services.feature.unlimited')]
    },
    {
      id: 9,
      title: t('services.support247.title'),
      description: t('services.support247.description'),
      icon: ClockIcon,
      gradient: 'from-yellow-500 to-yellow-700',
      features: [t('services.feature.alwaysAvailable'), t('services.feature.quickResponse'), t('services.feature.problemSolving')]
    }
  ], [t]);

  // Offers data
  const offers = useMemo(() => [
    {
      id: 1,
      title: t('offers.50off.title'),
      description: t('offers.50off.description'),
      icon: FireIcon,
      gradient: 'from-red-500 to-red-700',
      discount: '50%',
      originalPrice: '$200',
      newPrice: '$100',
      validUntil: t('offers.validUntil.endOfMonth'),
      features: [t('offers.feature.domesticFlight'), t('offers.feature.goodPrice'), t('offers.feature.specialDiscount')]
    },
    {
      id: 2,
      title: t('offers.familyPackage.title'),
      description: t('offers.familyPackage.description'),
      icon: UserGroupIcon,
      gradient: 'from-pink-500 to-pink-700',
      discount: '30%',
      originalPrice: '$800',
      newPrice: '$560',
      validUntil: t('offers.validUntil.15Days'),
      features: [t('offers.feature.4people'), t('offers.feature.savings'), t('offers.feature.completePackage')]
    },
    {
      id: 3,
      title: t('offers.earlyBooking.title'),
      description: t('offers.earlyBooking.description'),
      icon: CalendarDaysIcon,
      gradient: 'from-blue-500 to-blue-700',
      discount: '25%',
      originalPrice: '$400',
      newPrice: '$300',
      validUntil: t('offers.validUntil.3Months'),
      features: [t('offers.feature.earlyBooking'), t('offers.feature.specialDiscount'), t('offers.feature.planning')]
    },
    {
      id: 4,
      title: t('offers.weekend.title'),
      description: t('offers.weekend.description'),
      icon: SparklesIcon,
      gradient: 'from-purple-500 to-purple-700',
      discount: '40%',
      originalPrice: '$300',
      newPrice: '$180',
      validUntil: t('offers.validUntil.weekendOnly'),
      features: [t('offers.feature.weekend'), t('offers.feature.specialPrice'), t('offers.feature.fast')]
    },
    {
      id: 5,
      title: t('offers.student.title'),
      description: t('offers.student.description'),
      icon: StarIcon,
      gradient: 'from-green-500 to-green-700',
      discount: '35%',
      originalPrice: '$250',
      newPrice: '$162',
      validUntil: t('offers.validUntil.always'),
      features: [t('offers.feature.student'), t('offers.feature.permanentDiscount'), t('offers.feature.studentCard')]
    },
    {
      id: 6,
      title: t('offers.romantic.title'),
      description: t('offers.romantic.description'),
      icon: HeartIcon,
      gradient: 'from-rose-500 to-rose-700',
      discount: '20%',
      originalPrice: '$500',
      newPrice: '$400',
      validUntil: t('offers.validUntil.10Days'),
      features: [t('offers.feature.couple'), t('offers.feature.romantic'), t('offers.feature.specialDiscount')]
    }
  ], [t]);

  // Gallery data
  const galleryImages = useMemo(() => [
    {
      id: 1,
      title: t('gallery.modernPlane.title'),
      description: t('gallery.modernPlane.description'),
      image: '/images/airport-plane-photo_991869-62.jpg',
      category: t('gallery.category.airplane')
    },
    {
      id: 2,
      title: t('gallery.nightFlight.title'),
      description: t('gallery.nightFlight.description'),
      image: '/images/airplane-clouds-night_864588-19786.jpg',
      category: t('gallery.category.flight')
    },
    {
      id: 3,
      title: t('gallery.blueSky.title'),
      description: t('gallery.blueSky.description'),
      image: '/images/skyward-soar-airplane-flying-blue-sky-clouds_391229-21566.jpg',
      category: t('gallery.category.sky')
    },
    {
      id: 4,
      title: t('gallery.nightAirport.title'),
      description: t('gallery.nightAirport.description'),
      image: '/images/sheremetyevo-airport-view-in-rainy-evening-moscow-free-video.jpg',
      category: t('gallery.category.airport')
    },
    {
      id: 5,
      title: t('gallery.aerialView.title'),
      description: t('gallery.aerialView.description'),
      image: '/images/360_F_600352190_78zb8hHbSeQdHtfGQliVRtHXEEXcvtHf.jpg',
      category: t('gallery.category.view')
    },
    {
      id: 6,
      title: t('gallery.beautifulCity.title'),
      description: t('gallery.beautifulCity.description'),
      image: '/images/1697200583302.jpg',
      category: t('gallery.category.city')
    }
  ], [t]);

  // News data
  const newsItems = useMemo(() => [
    {
      id: 1,
      title: t('news.newRoute.title'),
      description: t('news.newRoute.description'),
      author: t('news.author.editorial'),
      date: t('news.date.2daysAgo'),
      category: t('news.category.newRoutes'),
      icon: GlobeAltIcon,
      gradient: 'from-blue-500 to-blue-700',
      image: '/images/airport-plane-photo_991869-62.jpg',
      readTime: t('news.readTime.3min')
    },
    {
      id: 2,
      title: t('news.newServices.title'),
      description: t('news.newServices.description'),
      author: t('news.author.serviceManagement'),
      date: t('news.date.1weekAgo'),
      category: t('news.category.services'),
      icon: SparklesIcon,
      gradient: 'from-green-500 to-green-700',
      image: '/images/airplane-clouds-night_864588-19786.jpg',
      readTime: t('news.readTime.4min')
    },
    {
      id: 3,
      title: t('news.specialOffers.title'),
      description: t('news.specialOffers.description'),
      author: t('news.author.marketing'),
      date: t('news.date.2weeksAgo'),
      category: t('news.category.discounts'),
      icon: GiftIcon,
      gradient: 'from-purple-500 to-purple-700',
      image: '/images/skyward-soar-airplane-flying-blue-sky-clouds_391229-21566.jpg',
      readTime: t('news.readTime.2min')
    }
  ], [t]);

  // Membership data
  const membershipTiers = useMemo(() => [
    {
      id: 1,
      name: t('home.membership.bronze.name'),
      description: t('home.membership.bronze.desc'),
      icon: StarIcon,
      gradient: 'from-amber-500 to-amber-700',
      price: t('home.membership.bronze.price'),
      points: t('home.membership.bronze.points'),
      features: [
        t('home.membership.feature.onlineBooking'),
        t('home.membership.feature.flightNotification'),
        t('home.membership.feature.basicSupport'),
        t('home.membership.feature.discount5')
      ],
      benefits: [
        t('home.membership.benefit.free'),
        t('home.membership.benefit.easyStart'),
        t('home.membership.benefit.basicBenefits')
      ]
    },
    {
      id: 2,
      name: t('home.membership.silver.name'),
      description: t('home.membership.silver.desc'),
      icon: GiftIcon,
      gradient: 'from-gray-500 to-gray-700',
      price: t('home.membership.silver.price'),
      points: t('home.membership.silver.points'),
      features: [
        t('home.membership.feature.allBronzeBenefits'),
        t('home.membership.feature.discount10'),
        t('home.membership.feature.priorityBooking'),
        t('home.membership.feature.freeExtraBaggage'),
        t('home.membership.feature.loungeAccess')
      ],
      benefits: [
        t('home.membership.benefit.specialBenefits'),
        t('home.membership.benefit.moreDiscount'),
        t('home.membership.benefit.priority')
      ]
    },
    {
      id: 3,
      name: t('home.membership.gold.name'),
      description: t('home.membership.gold.desc'),
      icon: TrophyIcon,
      gradient: 'from-yellow-500 to-yellow-700',
      price: t('home.membership.gold.price'),
      points: t('home.membership.gold.points'),
      features: [
        t('home.membership.feature.allSilverBenefits'),
        t('home.membership.feature.discount20'),
        t('home.membership.feature.privateLounge'),
        t('home.membership.feature.personalService'),
        t('home.membership.feature.freeUpgrade'),
        t('home.membership.feature.freeInternet')
      ],
      benefits: [
        t('home.membership.benefit.vip'),
        t('home.membership.benefit.fullBenefits'),
        t('home.membership.benefit.personalService')
      ]
    }
  ], [t]);

  // Support data
  const supportMethods = useMemo(() => [
    {
      id: 1,
      title: t('support.phone'),
      description: t('support.phoneDesc'),
      contact: t('support.phoneNumber'),
      icon: PhoneIcon,
      gradient: 'from-blue-500 to-blue-700',
      availability: t('support.availability24_7'),
      responseTime: t('support.immediate')
    },
    {
      id: 2,
      title: t('support.email'),
      description: t('support.emailDesc'),
      contact: 'support@nasimair.com',
      icon: EnvelopeIcon,
      gradient: 'from-green-500 to-green-700',
      availability: t('support.availability24_7'),
      responseTime: t('support.within2Hours')
    },
    {
      id: 3,
      title: t('support.chat'),
      description: t('support.chatDesc'),
      contact: t('support.online'),
      icon: ChatBubbleLeftRightIcon,
      gradient: 'from-purple-500 to-purple-700',
      availability: t('support.availability24_7'),
      responseTime: t('support.immediate')
    }
  ], [t]);

  const faqCategories = useMemo(() => [
    { id: 'general', name: t('support.faqCategories.general'), icon: QuestionMarkCircleIcon },
    { id: 'booking', name: t('support.faqCategories.booking'), icon: DocumentTextIcon },
    { id: 'flight', name: t('support.faqCategories.flight'), icon: GlobeAltIcon },
    { id: 'payment', name: t('support.faqCategories.payment'), icon: CheckCircleIcon }
  ], [t]);

  const faqs = useMemo(() => ({
    general: [
      { question: t('support.faqs.general.cancel.question'), answer: t('support.faqs.general.cancel.answer') },
      { question: t('support.faqs.general.changeDate.question'), answer: t('support.faqs.general.changeDate.answer') }
    ],
    booking: [
      { question: t('support.faqs.booking.howTo.question'), answer: t('support.faqs.booking.howTo.answer') },
      { question: t('support.faqs.booking.group.question'), answer: t('support.faqs.booking.group.answer') }
    ],
    flight: [
      { question: t('support.faqs.flight.documents.question'), answer: t('support.faqs.flight.documents.answer') },
      { question: t('support.faqs.flight.seatSelection.question'), answer: t('support.faqs.flight.seatSelection.answer') }
    ],
    payment: [
      { question: t('support.faqs.payment.methods.question'), answer: t('support.faqs.payment.methods.answer') },
      { question: t('support.faqs.payment.security.question'), answer: t('support.faqs.payment.security.answer') }
    ]
  }), [t]);

  const openModal = (image: string) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  // Flight Search functions
  const handleSwapCities = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  // Booking functions
  const handleInputChange = (field: string, value: string) => {
    setPassengerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExtraChange = (field: string, checked: boolean) => {
    setExtras(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const handleSeatSelection = (seatId: string) => {
    if (reservedSeats.includes(seatId)) return;
    
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(seat => seat !== seatId);
      } else {
        return [...prev, seatId];
      }
    });
  };

  const getSeatPrice = (seatId: string) => {
    const row = parseInt(seatId.slice(1));
    const seat = seatId[0];
    
    if (seat === 'A' || seat === 'D') {
      return row <= 5 ? 25 : 15;
    }
    return row <= 5 ? 15 : 0;
  };

  const getSeatStatus = (seatId: string) => {
    if (reservedSeats.includes(seatId)) return 'reserved';
    if (selectedSeats.includes(seatId)) return 'selected';
    return 'available';
  };

  return (
    <div className="min-h-screen bg-white">
      <EmiratesHeader onWeatherClick={() => setShowWeatherModal(true)} />

      {/* Hero Section with Flight Search - Emirates Style - اسلایدر با نسبت ۴:۳ برای کاهش فضای خالی کناره‌ها */}
      <section id="search-form" className="relative z-10 flex flex-col" style={{ minHeight: 'max(75vh, min(75vw, 85vh) + 280px)' }}>
        {/* Hero Image Background - Slider Container - نسبت ۴:۳ برای پر کردن عرض و کاهش فضای خالی */}
        <div 
          className="absolute inset-x-0 top-0 overflow-hidden"
          style={{
            width: '100%',
            height: 'min(75vw, 85vh)',
            maxHeight: '85vh',
            backgroundColor: 'rgba(15, 23, 42, 0.3)'
          }}
        >
          {/* Slider - Dynamic images from API */}
          {heroImages.map((imageUrl, index) => {
            const slider = heroSliders[index]; // Get corresponding slider data if available
            console.log(`🖼️ Slider ${index}:`, slider);
            console.log(`🔗 Link URL:`, slider?.link_url);
            
            const SliderWrapper = slider?.link_url ? 'a' : 'div';
            const wrapperProps = slider?.link_url ? {
              href: slider.link_url,
              target: slider.link_url.startsWith('/') || slider.link_url.includes(window.location.hostname) ? '_self' : '_blank',
              rel: slider.link_url.startsWith('/') ? undefined : 'noopener noreferrer',
              onClick: (e: React.MouseEvent) => {
                console.log('🖱️ Image clicked! Index:', index);
                console.log('🔗 Slider data:', slider);
                console.log('🔗 Link URL:', slider.link_url);
                console.log('✅ Navigating to:', slider.link_url);
              },
              title: `کلیک کنید برای مشاهده: ${slider.title}`
            } : {};
            
            return (
              <SliderWrapper
                key={index}
                {...wrapperProps}
                className={`absolute inset-0 h-full w-full transition-transform duration-1000 ease-in-out block ${slider?.link_url ? 'cursor-pointer' : ''}`}
                style={{
                  transform: `translateX(${index * 100 - currentHeroImageIndex * 100}%)`,
                  left: '0%'
                }}
              >
                <img
                  src={imageUrl}
                  alt={slider?.alt_text || `Hero image ${index + 1}`}
                  className={`w-full h-full object-cover ${slider?.link_url ? 'hover:opacity-95' : ''} transition-opacity`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center center',
                    display: 'block',
                    pointerEvents: 'none'
                  }}
                />
                {/* Overlay - must not block clicks */}
                <div className="absolute inset-0 bg-black/10" style={{ pointerEvents: 'none' }}></div>
              </SliderWrapper>
            );
          })}
            </div>
            
        {/* Navigation Arrows - Minimal and Elegant */}
        <button
          onClick={() => setCurrentHeroImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length)}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-300 group"
          style={{
            backdropFilter: 'blur(8px)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
          aria-label="Previous image"
        >
          <ChevronLeftIcon className="w-6 h-6 text-white group-hover:text-white/90 transition-colors" />
        </button>
        <button
          onClick={() => setCurrentHeroImageIndex((prev) => (prev + 1) % heroImages.length)}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-300 group"
          style={{
            backdropFilter: 'blur(8px)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
          aria-label="Next image"
        >
          <ChevronRightIcon className="w-6 h-6 text-white group-hover:text-white/90 transition-colors" />
        </button>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col" style={{ pointerEvents: 'none', minHeight: 'min(75vw, 85vh)' }}>
          {/* Promotional Text - Centered */}
          <div className="flex-1 flex items-start justify-center" style={{ paddingTop: 'clamp(24px, 4vw, 48px)', pointerEvents: 'auto' }}>
            <div className="text-center max-w-3xl px-4 sm:px-6">
              <h1 
                className="text-white mb-3"
                style={{ 
                  fontFamily: 'DigiHamisheBold, Arial, sans-serif',
                  fontSize: 'clamp(1.8rem, 5vw, 3rem)',
                  fontWeight: 'bold',
                  lineHeight: '1.2',
                  textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
                  direction: language === 'en' ? 'ltr' : 'rtl'
                }}
              >
                {t('home.hero.flyWithNasim')}
              </h1>
              <p 
                className="text-white mb-4"
                style={{ 
                  fontFamily: 'DigiHamisheBold, Arial, sans-serif',
                  fontSize: 'clamp(0.9rem, 2vw, 1.2rem)',
                  fontWeight: '500',
                  lineHeight: '1.5',
                  textShadow: '1px 1px 4px rgba(0,0,0,0.5)',
                  direction: language === 'en' ? 'ltr' : 'rtl'
                }}
              >
                {t('home.hero.safeTripDescription')}
              </p>
            </div>
          </div>

          {/* Flight Search Form at Bottom - سایز بزرگتر */}
          <div className="max-w-7xl mx-auto w-full px-6 sm:px-8 pb-6 sm:pb-10 overflow-visible" style={{ marginTop: 'clamp(48px, 7vw, 88px)', padding: 'clamp(28px, 4vw, 48px)', pointerEvents: 'auto' }}>
            <EmiratesFlightSearchForm onTabChange={setActiveFlightTab} />
              </div>
            </div>
      </section>

      {/* Elegant Quote Section */}
      <section className="relative z-10 py-6 sm:py-12 bg-gradient-to-b from-white to-gray-50" style={{ paddingTop: '1.25rem', marginTop: '-28px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <h2 
              className="text-gray-500 flex items-center justify-center gap-2 sm:gap-3 flex-nowrap whitespace-nowrap"
              style={{ 
                fontFamily: 'DigiHamisheBold, Arial, sans-serif',
                fontSize: 'clamp(1.25rem, 3.2vw, 2.2rem)',
                fontWeight: 'bold',
                lineHeight: '1.4',
                letterSpacing: '0.3px'
              }}
            >
              <span style={{ direction: language === 'en' ? 'ltr' : 'rtl' }}>
                {language === 'fa' ? (
                  <>سفری امن، <span className="text-gray-900" style={{ fontWeight: 900 }}>راحت</span> و به یادماندنی</>
                ) : language === 'ar' ? (
                  <>رحلة آمنة، <span className="text-gray-900" style={{ fontWeight: 900 }}>مريحة</span> لا تُنسى</>
                ) : (
                  <>A safe, <span className="text-gray-900" style={{ fontWeight: 900 }}>comfortable</span> and memorable journey</>
                )}
              </span>
              <span className="text-gray-400 mx-2 shrink-0">|</span>
              <span style={{ direction: 'ltr' }}>
                A safe, <span className="text-gray-900" style={{ fontWeight: 900 }}>comfortable</span> and memorable trip
              </span>
            </h2>
          </div>
        </div>
      </section>

      {/* Special Services Section */}
      <section className="relative z-10 py-6 sm:py-12 bg-white" style={{ marginTop: '-32px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Section Title */}
          <div className="text-center mb-5 sm:mb-10">
            <h2 
              className="text-gray-900"
              style={{ 
                fontFamily: 'DigiHamisheBold, Arial, sans-serif',
                fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                fontWeight: 'bold',
                lineHeight: '1.4',
                letterSpacing: '0.5px',
                direction: language === 'en' ? 'ltr' : 'rtl'
              }}
            >
              {t('home.services.specialTitle')}
            </h2>
          </div>

          {/* Services Grid - Simple Horizontal Cards with Text Overlay */}
          <div className="flex flex-col sm:flex-row items-stretch gap-4 sm:gap-6" style={{ justifyContent: 'center' }}>
            {/* Service 1: Seat Selection - Wider by default */}
            <div 
              className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 w-full sm:flex-1"
              style={{ 
                flexBasis: hoveredService === null || hoveredService === 1 ? '32.5%' : '25%',
                flexGrow: 0,
                flexShrink: 0,
                transition: 'flex-basis 0.3s ease-out'
              }}
              onMouseEnter={() => setHoveredService(1)}
              onMouseLeave={() => setHoveredService(null)}
            >
              <div className="relative w-full" style={{ height: 'clamp(320px, 40vw, 480px)' }}>
                <img 
                  src="/images/chair.jpeg" 
                  alt="انتخاب صندلی"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = '/images/airplane-clouds-night_864588-19786.jpg';
                  }}
                />
                {/* Text and Line - Right side of element */}
                <div className="absolute right-0 bottom-0 p-4" style={{ direction: language === 'en' ? 'ltr' : 'rtl' }}>
                  <p 
                    className="text-black text-right font-semibold mb-2"
                    style={{ 
                      fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                      fontSize: '1.1rem'
                    }}
                  >
                    {t('home.flightSearch.seatSelection')}
                  </p>
                  <div 
                    className="h-0.5 transition-colors duration-300"
                    style={{
                      backgroundColor: hoveredService === 1 ? '#1e3a8a' : '#9ca3af'
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Service 2: Extra Baggage */}
            <div 
              className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 w-full sm:flex-1"
              style={{ 
                flexBasis: hoveredService === 2 ? '32.5%' : '25%',
                flexGrow: 0,
                flexShrink: 0,
                transition: 'flex-basis 0.3s ease-out'
              }}
              onMouseEnter={() => setHoveredService(2)}
              onMouseLeave={() => setHoveredService(null)}
            >
              <div className="relative w-full" style={{ height: 'clamp(320px, 40vw, 480px)' }}>
                <img 
                  src="/images/overload.jpeg" 
                  alt="خرید اضافه بار"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = '/images/airplane-clouds-night_864588-19786.jpg';
                  }}
                />
                {/* Text and Line - Right side of element */}
                <div className="absolute right-0 bottom-0 p-4" style={{ direction: language === 'en' ? 'ltr' : 'rtl' }}>
                  <p 
                    className="text-black text-right font-semibold mb-2"
                    style={{ 
                      fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                      fontSize: '1.1rem'
                    }}
                  >
                    {t('home.flightSearch.extraBaggage')}
                  </p>
                  <div 
                    className="h-0.5 transition-colors duration-300"
                    style={{
                      backgroundColor: hoveredService === 2 ? '#1e3a8a' : '#9ca3af'
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Service 3: Pet Travel */}
            <div 
              className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 w-full sm:flex-1"
              style={{ 
                flexBasis: hoveredService === 3 ? '32.5%' : '25%',
                flexGrow: 0,
                flexShrink: 0,
                transition: 'flex-basis 0.3s ease-out'
              }}
              onMouseEnter={() => setHoveredService(3)}
              onMouseLeave={() => setHoveredService(null)}
            >
              <div className="relative w-full" style={{ height: 'clamp(320px, 40vw, 480px)' }}>
                <img 
                  src="/images/TravelingWithPets.jpg" 
                  alt="سفر با حیوان خانگی"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = '/images/airplane-clouds-night_864588-19786.jpg';
                  }}
                />
                {/* Text and Line - Right side of element */}
                <div className="absolute right-0 bottom-0 p-4" style={{ direction: language === 'en' ? 'ltr' : 'rtl' }}>
                  <p 
                    className="text-black text-right font-semibold mb-2"
                    style={{ 
                      fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                      fontSize: '1.1rem'
                    }}
                  >
                    {t('home.services.petTravelFull')}
                  </p>
                  <div 
                    className="h-0.5 transition-colors duration-300"
                    style={{
                      backgroundColor: hoveredService === 3 ? '#1e3a8a' : '#9ca3af'
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Service 4: Wheelchair Request */}
            <div 
              className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 w-full sm:flex-1"
              style={{ 
                flexBasis: hoveredService === 4 ? '32.5%' : '25%',
                flexGrow: 0,
                flexShrink: 0,
                transition: 'flex-basis 0.3s ease-out'
              }}
              onMouseEnter={() => setHoveredService(4)}
              onMouseLeave={() => setHoveredService(null)}
            >
              <div className="relative w-full" style={{ height: 'clamp(320px, 40vw, 480px)' }}>
                <img 
                  src="/images/travelwheelchair.jpeg" 
                  alt="درخواست ویلچر"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = '/images/airplane-clouds-night_864588-19786.jpg';
                  }}
                />
                {/* Text and Line - Right side of element */}
                <div className="absolute right-0 bottom-0 p-4" style={{ direction: language === 'en' ? 'ltr' : 'rtl' }}>
                  <p 
                    className="text-black text-right font-semibold mb-2"
                    style={{ 
                      fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                      fontSize: '1.1rem'
                    }}
                  >
                    {t('home.flightSearch.wheelchair')}
                  </p>
                  <div 
                    className="h-0.5 transition-colors duration-300"
                    style={{
                      backgroundColor: hoveredService === 4 ? '#1e3a8a' : '#9ca3af'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Elegant Quote Section - Repeated with Airline Logo */}
      <section className="relative z-10 py-6 sm:py-12 bg-gradient-to-b from-white to-gray-50" style={{ paddingTop: '1.25rem', marginTop: '-28px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <p 
              className="text-gray-700 flex items-center justify-center gap-2 sm:gap-3 flex-wrap"
              style={{ 
                fontFamily: 'DigiHamisheBold, Arial, sans-serif',
                fontSize: 'clamp(1.55rem, 3.5vw, 2.35rem)',
                fontWeight: 'normal',
                lineHeight: '1.4',
                letterSpacing: '0.5px',
                direction: 'ltr'
              }}
            >
              <span style={{ fontWeight: 'bold' }}>Excellence in every flight</span>
              <span className="text-gray-400 mx-1">|</span>
              <span style={{ fontWeight: 'normal', color: '#6b7280' }}>Trusted by Millions</span>
              <svg 
                width="32" 
                height="32" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="text-blue-900"
                style={{ flexShrink: 0 }}
              >
                <path 
                  d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" 
                  fill="currentColor"
                />
              </svg>
            </p>
          </div>
        </div>
      </section>

      {/* عضویت در برنامه وفاداری نسیم ایر banner section */}
      <section className="relative z-10 py-5" style={{ overflow: 'visible', marginTop: '1.5rem' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" style={{ overflow: 'visible' }}>
          <div 
            className="bg-blue-900 flex flex-col md:flex-row items-center justify-between gap-5 px-8 py-6 relative"
            style={{
              borderRadius: '12px',
              overflow: 'visible'
            }}
          >
            <div 
              className="flex items-center" 
              style={{ 
                position: 'absolute',
                right: '-20px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                height: '0'
              }}
            >
              <div 
                className="square-full flex flex-col items-center justify-center"
                style={{ 
                  width: '100px',
                  height: '100px',
                  background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.45), 0 5px 10px rgba(0, 0, 0, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  marginRight: '-12px',
                  transform: 'rotate(-40deg) translateZ(0)'
                }}
              >
                <div 
                  className="text-gray-700 font-bold"
                  style={{
                    fontSize: '11px',
                    letterSpacing: '2px',
                    transform: 'rotate(40deg)', // خنثی‌کردن چرخش والد
                    transformOrigin: 'center',
                    display: 'inline-block'   
                  }}
                >
                  SILVER
                </div>
              </div>
              <div 
                className="square-full flex flex-col items-center justify-center"
                style={{ 
                  width: '100px',
                  height: '100px',
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.45), 0 5px 10px rgba(0, 0, 0, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transform: 'rotate(-40deg)',
                  display: 'flex',
                  alignItems:'center',
                  justifyContent: 'center'
                }}
              >
                <div 
                  className="text-gray-700 font-bold"
                  style={{
                    fontSize: '11px',
                    letterSpacing: '2px',
                    transform: 'rotate(40deg)', // خنثی‌کردن چرخش والد
                    transformOrigin: 'center',
                    display: 'inline-block'   
                  }}
                >
                  GOLD
                </div>
              </div>
              <div 
                className="square-full flex flex-col items-center justify-center"
                style={{ 
                  width: '100px',
                  height: '100px',
                  background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.45), 0 5px 10px rgba(0, 0, 0, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transform: 'rotate(-40deg) translateZ(0)'
                }}
              >
               <div 
                  className="text-gray-700 font-bold"
                  style={{
                    fontSize: '11px',
                    letterSpacing: '2px',
                    transform: 'rotate(40deg)', // خنثی‌کردن چرخش والد
                    transformOrigin: 'center',
                    display: 'inline-block'   
                  }}
                >
                  PLATINUM
                </div>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left" style={{ paddingRight: language === 'en' ? '0' : '0' }}>
              <h3 className={`text-base sm:text-lg md:text-xl font-semibold text-white mb-1 ${fontClass}`} style={{ 
                fontFamily: 'DigiHamisheBold, Arial, sans-serif',
                direction: language === 'en' ? 'ltr' : 'rtl'
              }}>
                {t('home.loyalty.joinTitle')}
              </h3>
              <p className={`text-gray-400 text-xs md:text-sm ${fontClass}`} style={{ 
                fontFamily: 'DigiHamisheBold, Arial, sans-serif',
                direction: language === 'en' ? 'ltr' : 'rtl'
              }}>
                {t('home.loyalty.joinDescription')}
              </p>
            </div>

            <button 
              onClick={() => navigate('/membership')}
              className="bg-white hover:bg-gray-100 text-gray-900 font-medium px-4 sm:px-6 py-2 rounded-lg transition-colors whitespace-nowrap text-xs sm:text-sm" style={{ 
                fontFamily: 'DigiHamisheBold, Arial, sans-serif',
                direction: language === 'en' ? 'ltr' : 'rtl'
              }}
            >
              {t('home.loyalty.joinNow')}
            </button>
          </div>
        </div>
      </section>

      {/* Special Offers Section */}
      <section className="relative z-10 py-6 sm:py-8 bg-gray-100" style={{ marginTop: '24px' }}>
        <style>{`
          @keyframes slideInFromRight {
            from {
              opacity: 0;
              transform: translateX(40px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          @keyframes slideOutToLeft {
            from {
              opacity: 1;
              transform: translateX(0);
            }
            to {
              opacity: 0;
              transform: translateX(-40px);
            }
          }
        `}</style>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ overflow: 'hidden' }}>
          {/* Section Title */}
          <div className="text-center mb-4 sm:mb-6">
            <h2
              className="text-gray-900"
              style={{
                fontFamily: 'DigiHamisheBold, Arial, sans-serif',
                fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                fontWeight: 'bold',
                lineHeight: '1.4',
                letterSpacing: '0.5px',
                direction: language === 'en' ? 'ltr' : 'rtl'
              }}
            >
              {language === 'fa' ? 'مسیرهای پرتقاضا' : language === 'ar' ? 'المسارات ذات الطلب' : 'Popular Routes'}
            </h2>
          </div>

          {/* Helper function to render offer card */}
          {(() => {
            const renderOfferCard = (card: OfferCard, index: number, variant: 'normal' | 'outgoing' = 'normal'): React.ReactElement => {
              const isNewCard = variant === 'normal' && newCardId === card.id;
              const isOutgoing = variant === 'outgoing';

              let animation = 'none';
              if (isNewCard) {
                animation = 'slideInFromRight 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
              } else if (isOutgoing) {
                animation = 'slideOutToLeft 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
              }
              
              return (
              <div 
                key={`${card.id}-${variant}-${index}`} 
                className="group bg-white rounded-xl shadow-md hover:shadow-xl overflow-hidden cursor-pointer"
                style={{
                  animation,
                  direction: 'ltr',
                  transition: isNewCard || isOutgoing ? 'none' : 'all 0.3s ease-in-out'
                }}
              >
              <div className="relative h-[420px] overflow-hidden">
              <img
                  src={card.image}
                  alt={card.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = card.fallbackImage;
                  }}
                />
                {/* Unified Overlay Design - No Gap */}
                <div className="absolute top-0 left-0 right-0 transition-all duration-500 h-[100px] group-hover:h-[140px]">
                  {/* Main Glass Overlay - Ultra Glassy */}
                  <div 
                    className="absolute inset-0 backdrop-blur-3xl transition-all duration-300 group-hover:backdrop-blur-[40px]"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.12) 100%)',
                      borderTopLeftRadius: '12px',
                      borderTopRightRadius: '12px',
                      boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.3), 0 2px 8px rgba(0, 0, 0, 0.03)'
                    }}
                  ></div>
                  
                  {/* Buy Ticket Button - Appears on Hover */}
                  <button
                    className="absolute top-0 left-4 right-4 transform -translate-y-full group-hover:translate-y-3 transition-all duration-500 ease-out bg-blue-900 hover:bg-blue-800 text-white py-3 rounded-lg shadow-lg font-semibold text-sm z-10 w-[calc(100%-2rem)]"
                    style={{
                      fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                    }}
                  >
                    {language === 'fa' ? 'خرید بلیط' : language === 'ar' ? 'شراء التذكرة' : 'Buy Ticket'}
                  </button>
                  
                  {/* Content Container */}
                    <div className="relative h-full flex items-center justify-between px-6 transition-all duration-500 group-hover:pt-10" style={{ direction: 'ltr' }}>
                    {/* Left: Flight Info & Price */}
                    <div className="flex flex-col items-start gap-2">
                      {/* Flight Route */}
                      <div className="flex items-center gap-2">
                        <span className={`text-gray-900 font-semibold text-base ${fontClass}`} style={{
                          fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                        }}>
                            {card.from[language]}
                        </span>
                          <PaperAirplaneIcon className="w-4 h-4 text-blue-900" />
                        <span className={`text-gray-900 font-semibold text-base ${fontClass}`} style={{
                          fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                        }}>
                            {card.to[language]}
                        </span>
                      </div>
                      {/* Price */}
                      <div className={`text-xl font-bold text-gray-900 ${fontClass}`} style={{
                        fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                          direction: 'ltr'
                      }}>
                          {card.price[language]}
                      </div>
                    </div>
                    
                    {/* Right: Date Section */}
                    <div className="flex items-center">
                      <div className="px-4 py-2 bg-white/30 rounded-lg backdrop-blur-sm border border-white/40">
                          <div className="text-xs font-medium text-gray-800" style={{ direction: 'ltr' }}>
                            {card.date[language]}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
              );
            };

            return (
              /* Offers Grid */
              <div className="relative">
                <div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" 
                      style={{
                    direction: 'ltr'
                      }}
                    >
                  {visibleCardIds.map((cardId, index) => {
                    const card = allOfferCards.find(c => c.id === cardId);
                    return card ? renderOfferCard(card, index, 'normal') : null;
                  })}
                </div>
                {removingCard && (
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-full sm:w-1/2 lg:w-1/4 pr-6">
                    {renderOfferCard(removingCard, -1, 'outgoing')}
                  </div>
                )}
              </div>
            );
          })()}
                      </div>
      </section>

      {/* Skywards+ Section - Emirates Style */}
      <section className="relative z-10 py-8 sm:py-16 bg-white overflow-hidden" style={{ marginTop: '48px' }}>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/images/airport-crew.jpg)'
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div 
          className="relative z-10 max-w-7xl mx-auto flex"
          style={{ direction: 'ltr', justifyContent: 'flex-end', paddingLeft: '12rem', paddingRight: '0cm' }}
        >
          <div className="max-w-2xl w-full" style={{ textAlign: language === 'fa' || language === 'ar' ? 'right' : 'left' }}>
            <p className={`text-white text-xs sm:text-sm uppercase tracking-wider mb-2 ${fontClass}`} style={{ 
              fontFamily: 'DigiHamisheBold, Arial, sans-serif',
              direction: language === 'en' ? 'ltr' : 'rtl',
              textTransform: 'none'
            }}>
              {t('home.loyalty.programTitle')}
            </p>
            <h2 className={`text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 ${fontClass}`} style={{ 
              fontFamily: 'DigiHamisheBold, Arial, sans-serif',
              direction: language === 'en' ? 'ltr' : 'rtl',
              fontWeight: 700,
              lineHeight: 1.2
            }}>
              {t('home.loyalty.enhanceTitle')}
            </h2>
            <p className={`text-white text-sm sm:text-lg mb-4 sm:mb-6 ${fontClass}`} style={{ 
              fontFamily: 'DigiHamisheBold, Arial, sans-serif',
              direction: language === 'en' ? 'ltr' : 'rtl',
              lineHeight: '1.8'
            }}>
              {t('home.loyalty.fullDescription')}
            </p>
            <button className="bg-white hover:bg-gray-100 text-gray-900 font-medium px-4 sm:px-8 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base" style={{ 
              fontFamily: 'DigiHamisheBold, Arial, sans-serif',
              direction: language === 'en' ? 'ltr' : 'rtl'
            }}>
              {t('common.learnMore') || 'بیشتر بدانید'}
            </button>
          </div>
        </div>
      </section>

      {/* Featured Destinations Section - Images Only (No Text) */}
      <section className="relative py-6 sm:py-12 bg-white" style={{ paddingBottom: 'clamp(48px, 5vw, 64px)', overflow: 'visible', zIndex: 20, direction: 'rtl' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ direction: 'rtl' }}>
          {/* Title Section - Same style as Section 2 */}
          <div className="text-center mb-4 sm:mb-8">
            <div style={{ 
              fontFamily: 'DigiHamisheBold, Arial, sans-serif',
              color: '#000000',
              opacity: 1
            }}>
              {/* First line - Small and Bold */}
              <p style={{ 
                fontSize: 'clamp(14px, 3vw, 16.5px)',
                fontWeight: 700,
                letterSpacing: '0.2px',
                marginBottom: '6px',
                color: '#000000',
                opacity: 1,
                fontFamily: "'IranNastaliq', 'Nastaliq', 'Al Qalam Taj Nastaleeq', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif",
                fontStyle: 'normal',
                fontVariant: 'normal',
                textDecoration: 'none'
              }}>
                {t('home.experience.flyWithNasim')}
              </p>
              
              {/* Second line - Large */}
              <h2 style={{ 
                fontSize: 'clamp(24px, 6vw, 42px)',
                fontWeight: language === 'fa' ? 300 : 400,
                letterSpacing: '0.2px',
                marginBottom: '8px',
                color: '#000000',
                opacity: 1,
                fontFeatureSettings: language === 'fa' ? "'kern' 1" : 'normal',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                fontFamily: 'DigiHamisheBold, Arial, sans-serif'
              }}>
                {t('home.experience.exploreNasim')}
              </h2>
              
              {/* Third line - Small */}
              <p style={{ 
                fontSize: '16.5px',
                fontWeight: language === 'fa' ? 300 : 400,
                letterSpacing: '0.2px',
                marginBottom: '0',
                color: '#000000',
                opacity: 1,
                fontFamily: 'DigiHamisheBold, Arial, sans-serif'
              }}>
                {t('home.experience.planUnforgettable')}
              </p>
            </div>
          </div>

          {/* Layout: 4 Small Images Left (2x2), Large Image Right */}
          <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-0 justify-center items-center" style={{ perspective: '1000px', overflow: 'visible', direction: 'rtl' }}>
            {/* 4 Small Images - Left Side (60% width, 2x2 grid) - First in order */}
            <div className="grid grid-cols-2 gap-1 sm:gap-2 order-1 lg:order-1" style={{ perspective: '1000px', width: '100%', overflow: 'visible', direction: 'rtl' }}>
              {/* Image 1 - two.png - Left page of book */}
              <div 
                className="bg-white overflow-visible group cursor-pointer transition-all duration-500 mx-auto"
                style={{
                  borderRadius: '16px',
                  border: '0.5px solid #d1d5db',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
                  opacity: 0.95,
                  transform: 'translateY(0)',
                  transformStyle: 'preserve-3d',
                  transformOrigin: 'right center',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  width: '68%',
                  maxWidth: '100%',
                  marginRight: '170px',
                  position: 'relative',
                  zIndex: 25
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateY(-4px) rotateY(-15deg) translateZ(20px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.03)';
                  e.currentTarget.style.opacity = '0.95';
                  e.currentTarget.style.transform = 'translateY(0) rotateY(0deg) translateZ(0px)';
                }}
              >
                <div className="relative w-full" style={{ 
                  height: 'calc((500px - 24px) / 2)',
                  borderRadius: '16px',
                  overflow: 'hidden'
                }}>
                  <img 
                    src="/images/two.png" 
                    alt="Image 1"
                    className="w-full h-full object-contain transition-opacity duration-300"
                    style={{ 
                      objectPosition: 'center center',
                      transition: 'opacity 0.3s ease',
                      height: '100%',
                      width: '100%',
                      imageRendering: '-webkit-optimize-contrast',
                      borderRadius: '16px'
                    }}
                  />
                </div>
              </div>

              {/* Image 2 - three.png - Right page of book */}
              <div 
                className="bg-white overflow-visible group cursor-pointer transition-all duration-500 mx-auto"
                style={{ 
                  borderRadius: '16px',
                  border: '0.5px solid #d1d5db',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
                  opacity: 0.95,
                  transform: 'translateY(0)',
                  transformStyle: 'preserve-3d',
                  transformOrigin: 'left center',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  width: '68%',
                  maxWidth: '100%',
                  position: 'relative',
                  zIndex: 25
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateY(-4px) rotateY(15deg) translateZ(20px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.03)';
                  e.currentTarget.style.opacity = '0.95';
                  e.currentTarget.style.transform = 'translateY(0) rotateY(0deg) translateZ(0px)';
                }}
              >
                <div className="relative w-full" style={{ 
                  height: 'calc((500px - 24px) / 2)',
                  borderRadius: '16px',
                  overflow: 'hidden'
                }}>
                  <img 
                    src="/images/three.png" 
                    alt="Image 2"
                    className="w-full h-full object-contain transition-opacity duration-300"
                    style={{ 
                      objectPosition: 'center center',
                      transition: 'opacity 0.3s ease',
                      height: '100%',
                      width: '100%',
                      imageRendering: '-webkit-optimize-contrast',
                      borderRadius: '16px'
                    }}
                  />
                    </div>
                  </div>

              {/* Image 3 - 4reza.jpeg - Left page of book */}
              <div 
                className="bg-white overflow-visible group cursor-pointer transition-all duration-500 mx-auto"
                style={{ 
                  borderRadius: '16px',
                  border: '0.5px solid #d1d5db',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
                  opacity: 0.95,
                  transform: 'translateY(0)',
                  transformStyle: 'preserve-3d',
                  transformOrigin: 'right center',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  width: '68%',
                  maxWidth: '100%',
                  marginRight: '170px',
                  position: 'relative',
                  zIndex: 25
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateY(-4px) rotateY(-15deg) translateZ(20px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.03)';
                  e.currentTarget.style.opacity = '0.95';
                  e.currentTarget.style.transform = 'translateY(0) rotateY(0deg) translateZ(0px)';
                }}
              >
                <div className="relative w-full" style={{ 
                  height: 'calc((500px - 24px) / 2)',
                  borderRadius: '16px',
                  overflow: 'hidden'
                }}>
                  <img 
                    src="/images/4reza.jpeg" 
                    alt="Image 3"
                    className="w-full h-full object-contain transition-opacity duration-300"
                    style={{ 
                      objectPosition: 'center center',
                      transition: 'opacity 0.3s ease',
                      height: '100%',
                      width: '100%',
                      imageRendering: '-webkit-optimize-contrast',
                      borderRadius: '16px'
                    }}
                  />
                </div>
              </div>

              {/* Image 4 - 5reza.jpeg - Right page of book */}
              <div 
                className="bg-white overflow-visible group cursor-pointer transition-all duration-500 mx-auto"
                style={{ 
                  borderRadius: '16px',
                  border: '0.5px solid #d1d5db',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
                  opacity: 0.95,
                  transform: 'translateY(0)',
                  transformStyle: 'preserve-3d',
                  transformOrigin: 'left center',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  width: '68%',
                  maxWidth: '100%',
                  position: 'relative',
                  zIndex: 25
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateY(-4px) rotateY(15deg) translateZ(20px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.03)';
                  e.currentTarget.style.opacity = '0.95';
                  e.currentTarget.style.transform = 'translateY(0) rotateY(0deg) translateZ(0px)';
                }}
              >
                <div className="relative w-full" style={{ 
                  height: 'calc((500px - 24px) / 2)',
                  borderRadius: '16px',
                  overflow: 'hidden'
                }}>
                  <img 
                    src="/images/5reza.jpeg" 
                    alt="Image 4"
                    className="w-full h-full object-contain transition-opacity duration-300"
                    style={{ 
                      objectPosition: 'center center',
                      transition: 'opacity 0.3s ease',
                      height: '100%',
                      width: '100%',
                      imageRendering: '-webkit-optimize-contrast',
                      borderRadius: '16px'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Large Image - Right Side (40% width) - Second in order */}
            <div 
              className="bg-white overflow-hidden group cursor-pointer transition-all duration-300 order-2 lg:order-2"
              style={{ 
                borderRadius: '16px',
                border: '0.5px solid #d1d5db',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
                opacity: 0.95,
                transform: 'translateY(0)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                zIndex: 75,
                marginRight: '-50px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'translateY(-14px)';
                e.currentTarget.style.marginRight = '-50px';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.03)';
                e.currentTarget.style.opacity = '0.95';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.marginRight = '-50px';
              }}
            >
              {/* Large Image - Using 6reza.jpeg */}
              <div className="relative w-full" style={{ 
                height: 'clamp(320px, 40vw, 480px)',
                borderRadius: '16px',
                overflow: 'hidden'
              }}>
                <img 
                  src="/images/6reza.jpeg" 
                  alt="Featured destination"
                  className="w-full h-full object-cover transition-opacity duration-300"
                  style={{ 
                    objectPosition: 'center center',
                    transition: 'opacity 0.3s ease',
                    imageRendering: '-webkit-optimize-contrast',
                    borderRadius: '16px'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Old Booking Section - Remove this */}
      <section className="hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className={`text-3xl font-bold text-white mb-2 ${fontClass}`}>
              {t('booking.title')}
            </h1>
            <p className={`text-blue-200 text-sm ${fontClass}`}>
              {t('booking.subtitle')}
            </p>
          </div>

          {/* Booking form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
            
            {/* Flight Summary */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/30">
              <h3 className={`text-white font-semibold mb-3 text-sm ${fontClass} flex items-center gap-2`}>
                <MapPinIcon className="w-4 h-4" />
                {t('booking.flightSummary')}
                  </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className={`text-blue-200 ${fontClass}`}>{t('booking.from')}</span>
                  <span className={`text-white mr-2 ${fontClass}`}>{flightInfo.from}</span>
                </div>
                <div>
                  <span className={`text-blue-200 ${fontClass}`}>{t('booking.to')}</span>
                  <span className={`text-white mr-2 ${fontClass}`}>{flightInfo.to}</span>
                </div>
                <div>
                  <span className={`text-blue-200 ${fontClass}`}>{t('booking.date')}</span>
                  <span className={`text-white mr-2 ${fontClass}`}>{flightInfo.date}</span>
                </div>
                <div>
                  <span className={`text-blue-200 ${fontClass}`}>{t('booking.passengers')}</span>
                  <span className={`text-white mr-2 ${fontClass}`}>{flightInfo.passengers}</span>
                </div>
              </div>
            </div>

            {/* Passenger Information */}
            <div className="mb-6">
              <h3 className={`text-white font-semibold mb-4 text-sm ${fontClass} flex items-center gap-2`}>
                <UserIcon className="w-4 h-4" />
                {t('booking.passengerInfo')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`flex items-center gap-1.5 text-white font-medium mb-1.5 text-sm ${fontClass}`}>
                    <UserIcon className="w-4 h-4" />
                    {t('auth.firstName')}
                  </label>
                  <input
                    type="text"
                    value={passengerInfo.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-white/50 text-blue-900 placeholder-blue-600/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm ${fontClass}`}
                    placeholder={t('auth.firstNamePlaceholder')}
                  />
                </div>

                <div>
                  <label className={`flex items-center gap-1.5 text-white font-medium mb-1.5 text-sm ${fontClass}`}>
                    <UserIcon className="w-4 h-4" />
                    {t('auth.lastName')}
                  </label>
                  <input
                    type="text"
                    value={passengerInfo.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-white/50 text-blue-900 placeholder-blue-600/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm ${fontClass}`}
                    placeholder={t('auth.lastNamePlaceholder')}
                  />
                </div>

                <div>
                  <label className={`flex items-center gap-1.5 text-white font-medium mb-1.5 text-sm ${fontClass}`}>
                    <UserIcon className="w-4 h-4" />
                    {t('booking.nationalId')}
                  </label>
                  <input
                    type="text"
                    value={passengerInfo.nationalId}
                    onChange={(e) => handleInputChange('nationalId', e.target.value)}
                    className={`w-full bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-white/50 text-blue-900 placeholder-blue-600/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm ${fontClass}`}
                    placeholder={t('booking.nationalIdPlaceholder')}
                  />
                </div>

                <div>
                  <label className={`flex items-center gap-1.5 text-white font-medium mb-1.5 text-sm ${fontClass}`}>
                    <EnvelopeIcon className="w-4 h-4" />
                    {t('auth.email')}
                  </label>
                  <input
                    type="email"
                    value={passengerInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-white/50 text-blue-900 placeholder-blue-600/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm ${fontClass}`}
                    placeholder={t('auth.emailPlaceholder')}
                  />
                </div>

                <div>
                  <label className={`flex items-center gap-1.5 text-white font-medium mb-1.5 text-sm ${fontClass}`}>
                    <PhoneIcon className="w-4 h-4" />
                    {t('auth.phone')}
                  </label>
                  <input
                    type="tel"
                    value={passengerInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-white/50 text-blue-900 placeholder-blue-600/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm ${fontClass}`}
                    placeholder={t('auth.phonePlaceholder')}
                  />
                </div>

                <div>
                  <label className={`flex items-center gap-1.5 text-white font-medium mb-1.5 text-sm ${fontClass}`}>
                    <MapPinIcon className="w-4 h-4" />
                    {t('booking.address')}
                  </label>
                  <input
                    type="text"
                    value={passengerInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`w-full bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-white/50 text-blue-900 placeholder-blue-600/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm ${fontClass}`}
                    placeholder={t('booking.addressPlaceholder')}
                  />
                </div>
              </div>
            </div>

            {/* Seat Selection */}
            <div className="mb-6">
              <h3 className={`text-white font-semibold mb-4 text-sm ${fontClass} flex items-center gap-2`}>
                <UserGroupIcon className="w-4 h-4" />
                {t('booking.selectSeat')}
              </h3>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-white text-sm ${fontClass} mb-1`}>
                      {t('booking.selectedSeats')}: {selectedSeats.length > 0 ? selectedSeats.join(', ') : t('common.none')}
                    </div>
                    {selectedSeats.length > 0 && (
                      <div className={`text-blue-200 text-xs ${fontClass}`}>
                        {t('booking.seatPrice')}: ${selectedSeats.reduce((total, seat) => total + getSeatPrice(seat), 0)}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowSeatModal(true)}
                      className={`bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${fontClass} text-sm`}
                    >
                      {t('booking.selectSeat')}
                    </button>
                    <button
                      onClick={() => setShow3DViewer(true)}
                      className={`bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${fontClass} text-sm`}
                    >
                      {t('booking.view3D')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Extras */}
            <div className="mb-6">
              <h3 className={`text-white font-semibold mb-4 text-sm ${fontClass} flex items-center gap-2`}>
                <CheckCircleIcon className="w-4 h-4" />
                {t('booking.extras')}
              </h3>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={extras.insurance}
                    onChange={(e) => handleExtraChange('insurance', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-white/80 border-white/50 rounded focus:ring-blue-500/50"
                  />
                  <span className={`text-white text-sm ${fontClass}`}>{t('booking.insurance')} (+$25)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={extras.extraBaggage}
                    onChange={(e) => handleExtraChange('extraBaggage', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-white/80 border-white/50 rounded focus:ring-blue-500/50"
                  />
                  <span className={`text-white text-sm ${fontClass}`}>{t('booking.extraBaggage')} (+$35)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={extras.meal}
                    onChange={(e) => handleExtraChange('meal', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-white/80 border-white/50 rounded focus:ring-blue-500/50"
                  />
                  <span className={`text-white text-sm ${fontClass}`}>{t('booking.meal')} (+$15)</span>
                </label>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/30">
              <h3 className={`text-white font-semibold mb-3 text-sm ${fontClass} flex items-center gap-2`}>
                <CreditCardIcon className="w-4 h-4" />
                {t('booking.paymentSummary')}
              </h3>
                <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className={`text-blue-200 ${fontClass}`}>{t('booking.flightTicket')}:</span>
                  <span className={`text-white ${fontClass}`}>{flightInfo.price}</span>
                </div>
                {selectedSeats.length > 0 && (
                  <div className="flex justify-between">
                    <span className={`text-blue-200 ${fontClass}`}>{t('booking.seatPrice')}:</span>
                    <span className={`text-white ${fontClass}`}>+${selectedSeats.reduce((total, seat) => total + getSeatPrice(seat), 0)}</span>
                  </div>
                )}
                {extras.insurance && (
                  <div className="flex justify-between">
                    <span className={`text-blue-200 ${fontClass}`}>{t('booking.insurance')}:</span>
                    <span className={`text-white ${fontClass}`}>+$25</span>
                  </div>
                )}
                {extras.extraBaggage && (
                  <div className="flex justify-between">
                    <span className={`text-blue-200 ${fontClass}`}>{t('booking.extraBaggage')}:</span>
                    <span className={`text-white ${fontClass}`}>+$35</span>
                  </div>
                )}
                {extras.meal && (
                  <div className="flex justify-between">
                    <span className={`text-blue-200 ${fontClass}`}>{t('booking.meal')}:</span>
                    <span className={`text-white ${fontClass}`}>+$15</span>
                  </div>
                )}
                <div className="border-t border-white/30 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className={`text-white font-semibold ${fontClass}`}>{t('booking.totalPrice')}:</span>
                    <span className={`text-white font-semibold ${fontClass}`}>
                      ${450 + selectedSeats.reduce((total, seat) => total + getSeatPrice(seat), 0) + 
                        (extras.insurance ? 25 : 0) + 
                        (extras.extraBaggage ? 35 : 0) + 
                        (extras.meal ? 15 : 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <button className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${fontClass}`}>
              {t('booking.completeBooking')}
            </button>
          </div>
        </div>
      </section>

      {/* COMMENTED OUT: مقصدهای ویژه در ایران زیبا section */}
      {/* <section className="relative z-10 py-12 bg-white" style={{ marginTop: '-30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className={`text-2xl md:text-3xl ${fontClass}`} style={{ 
              fontFamily: 'DigiHamisheBold, Arial, sans-serif',
              fontWeight: language === 'fa' ? 300 : 400,
              letterSpacing: language === 'en' ? '1.5px' : '0.2px',
              marginBottom: '0',
              color: '#000000',
              opacity: 1,
              textTransform: language === 'en' ? 'uppercase' : 'none',
              fontFeatureSettings: language === 'fa' ? "'kern' 1" : 'normal',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {language === 'fa' ? (
                <>
                  مقصدهای ویژه در ایران{' '}
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    زیبا
                    <img 
                      src="/images/iran.png" 
                      alt="ایران" 
                      style={{ 
                        width: '1em', 
                        height: '1em', 
                        display: 'inline-block',
                        verticalAlign: 'middle',
                        objectFit: 'contain'
                      }} 
                    />
                  </span>
                </>
              ) : (
                t('destinations.featured') || 'Featured destinations'
              )}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.filter(d => [1, 2, 7, 8, 9, 10].includes(d.id)).map((destination) => (
              <div 
                key={destination.id} 
                className="bg-white overflow-hidden group cursor-pointer transition-all duration-300"
                style={{ 
                  borderRadius: '6px',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  opacity: 0.95,
                  transform: 'translateY(0)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.opacity = '0.95';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                }}
              >
                <div className="relative w-full overflow-hidden" style={{ 
                  height: '180px',
                  borderRadius: '6px 6px 0 0'
                }}>
                  <img 
                    src={destination.image} 
                    alt={destination.name}
                    className="w-full h-full object-cover transition-opacity duration-300"
                    style={{ 
                      objectPosition: 'center center',
                      transition: 'opacity 0.3s ease'
                    }}
                  />
                </div>
                
                <div className="bg-white px-5 py-4">
                  <p 
                    className={`mb-2 text-center ${fontClass}`} 
                    style={{ 
                      letterSpacing: language === 'en' ? '1.5px' : '0.2px',
                      fontFamily: 'DigiHamisheBold, Arial, sans-serif',
                      textTransform: language === 'en' ? 'uppercase' : 'none',
                      fontWeight: language === 'fa' ? 300 : 400,
                      lineHeight: '1.4',
                      fontSize: '9px',
                      color: language === 'fa' ? '#9ca3af' : '#9ca3af',
                      opacity: 0.85
                    }}
                  >
                    {destination.country}
                  </p>
                  
                  <h3 
                    className={`mb-2 text-center ${fontClass}`} 
                    style={{ 
                      fontFamily: 'DigiHamisheBold, Arial, sans-serif',
                      fontWeight: language === 'fa' ? 600 : 700,
                      lineHeight: language === 'fa' ? '1.3' : '1.2',
                      letterSpacing: language === 'en' ? '-0.3px' : 'normal',
                      marginBottom: '10px',
                      fontSize: language === 'fa' ? '20px' : '24px',
                      color: language === 'fa' ? '#374151' : '#111827',
                      fontFeatureSettings: language === 'fa' ? "'kern' 1" : 'normal'
                    }}
                  >
                    {destination.name}
                  </h3>
                  
                  <p 
                    className={`text-center ${fontClass}`} 
                    style={{ 
                      fontFamily: 'DigiHamisheBold, Arial, sans-serif',
                      fontWeight: language === 'fa' ? 300 : 400,
                      lineHeight: '1.5',
                      fontSize: language === 'fa' ? '11px' : '13px',
                      color: language === 'fa' ? '#6b7280' : '#4b5563',
                      opacity: language === 'fa' ? 0.9 : 1
                    }}
                  >
                    {destination.id === 1 
                      ? (language === 'fa' ? 'شهر هزار رنگ و هزار داستان' : language === 'ar' ? 'مدينة الألوان والأساطير' : 'City of a thousand colors and stories')
                      : destination.id === 2
                      ? (language === 'fa' ? 'مهمان‌نواز و روحانی' : language === 'ar' ? 'مضياف وروحاني' : 'Welcoming and spiritual')
                      : destination.id === 7
                      ? (language === 'fa' ? 'جزیره رویایی و تفریحی' : language === 'ar' ? 'جزيرة الأحلام والترفيه' : 'Dreamy and recreational island')
                      : destination.id === 8
                      ? (language === 'fa' ? 'شهر مقاومت و افتخار' : language === 'ar' ? 'مدينة المقاومة والفخر' : 'City of resistance and honor')
                      : destination.id === 9
                      ? (language === 'fa' ? 'شهر تاریخ و معماری اصیل' : language === 'ar' ? 'مدينة التاريخ والعمارة الأصيلة' : 'City of history and authentic architecture')
                      : destination.id === 10
                      ? (language === 'fa' ? 'نصف جهان، شهر هنر و زیبایی' : language === 'ar' ? 'نصف العالم، مدينة الفن والجمال' : 'Half of the world, city of art and beauty')
                      : destination.description
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Old Flight Search Section - Remove */}
      <section className="hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-6">
            <h2 className={`text-2xl font-bold text-white mb-1 ${fontClass}`}>
              {t('home.flightSearch.title')}
            </h2>
            <p className={`text-blue-200 text-xs ${fontClass}`}>
              {t('home.flightSearch.subtitle')}
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            {/* Main search panel */}
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/30">
              {/* Trip type selection */}
              <div className="flex gap-1.5 mb-6">
                <button
                  onClick={() => setTripType('round')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${fontClass} transition-all duration-300 ${
                    tripType === 'round'
                      ? 'bg-blue-900 text-white'
                      : 'bg-blue-900/50 text-white hover:bg-blue-800/50'
                  }`}
                >
                  {t('home.flightSearch.roundTrip')}
                </button>
                <button
                  onClick={() => setTripType('oneway')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${fontClass} transition-all duration-300 ${
                    tripType === 'oneway'
                      ? 'bg-blue-900 text-white'
                      : 'bg-blue-900/50 text-white hover:bg-blue-800/50'
                  }`}
                >
                  {t('home.flightSearch.oneWay')}
                </button>
                <button
                  onClick={() => setTripType('multi')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${fontClass} transition-all duration-300 ${
                    tripType === 'multi'
                      ? 'bg-blue-900 text-white'
                      : 'bg-blue-900/50 text-white hover:bg-blue-800/50'
                  }`}
                >
                  {t('home.flightSearch.multiCity')}
                </button>
              </div>

              {/* Search form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* From */}
                <div>
                  <label className={`flex items-center gap-1.5 text-white font-medium mb-1.5 text-sm ${fontClass}`}>
                    <PaperAirplaneIcon className="w-4 h-4" />
                    {t('home.flightSearch.from')}
                  </label>
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                    <input
                      type="text"
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      className={`w-full bg-transparent text-blue-900 font-medium placeholder-blue-600/60 focus:outline-none text-sm ${fontClass}`}
                      placeholder={t('home.flightSearch.cityOrAirport')}
                    />
                  </div>
                </div>

                {/* To */}
                <div>
                  <label className={`flex items-center gap-1.5 text-white font-medium mb-1.5 text-sm ${fontClass}`}>
                    <PaperAirplaneIcon className="w-4 h-4" />
                    {t('home.flightSearch.to')}
                  </label>
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                    <input
                      type="text"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      className={`w-full bg-transparent text-blue-900 font-medium placeholder-blue-600/60 focus:outline-none text-sm ${fontClass}`}
                      placeholder={t('home.flightSearch.cityOrAirport')}
                    />
                  </div>
                </div>

                {/* Depart date */}
                <div>
                  <label className={`flex items-center gap-1.5 text-white font-medium mb-1.5 text-sm ${fontClass}`}>
                    <CalendarDaysIcon className="w-4 h-4" />
                    {t('home.flightSearch.departDate')}
                  </label>
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                    <input
                      type="date"
                      value={departDate}
                      onChange={(e) => setDepartDate(e.target.value)}
                      className={`w-full bg-transparent text-blue-900 font-medium focus:outline-none text-sm ${fontClass}`}
                    />
                  </div>
                </div>

                {/* Return date */}
                {tripType === 'round' && (
                  <div>
                    <label className={`flex items-center gap-1.5 text-white font-medium mb-1.5 text-sm ${fontClass}`}>
                      <CalendarDaysIcon className="w-4 h-4" />
                      {t('home.flightSearch.returnDate')}
                    </label>
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className={`w-full bg-transparent text-blue-900 font-medium focus:outline-none text-sm ${fontClass}`}
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
                  <label className={`flex items-center gap-1.5 text-white font-medium mb-1.5 text-sm ${fontClass}`}>
                    <CurrencyDollarIcon className="w-4 h-4" />
                    {t('home.flightSearch.priceRange')}
                  </label>
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                    <input
                      type="text"
                      value={`$${priceRange[0]} - $${priceRange[1]}`}
                      readOnly
                      className={`w-full bg-transparent text-blue-900 font-medium placeholder-blue-600/60 focus:outline-none text-sm ${fontClass}`}
                      placeholder={t('home.flightSearch.priceRange')}
                    />
                  </div>
                </div>

                {/* Passengers */}
                <div>
                  <label className={`flex items-center gap-1.5 text-white font-medium mb-1.5 text-sm ${fontClass}`}>
                    <UserGroupIcon className="w-4 h-4" />
                    {t('home.flightSearch.passengers')}
                  </label>
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                    <input
                      type="text"
                      value={passengers}
                      onChange={(e) => setPassengers(e.target.value)}
                      className={`w-full bg-transparent text-blue-900 font-medium placeholder-blue-600/60 focus:outline-none text-sm ${fontClass}`}
                      placeholder={t('home.flightSearch.passengersPlaceholder')}
                    />
                  </div>
                </div>
              </div>

              {/* Search button */}
              <div className="flex justify-center">
                <button className="bg-blue-900 hover:bg-blue-800 text-white p-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                  <PaperAirplaneIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Section - Additional (if needed) */}
      <section id="destinations" className="relative z-10 py-16 bg-white hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-bold text-gray-900 mb-2 ${fontClass}`}>
              {t('destinations.title')}
            </h2>
            <p className={`text-gray-600 ${fontClass}`}>
              {t('destinations.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((destination) => (
              <div key={destination.id} className="group bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200">
                <div className="relative h-32 overflow-hidden">
                  <img 
                    src={destination.image} 
                    alt={destination.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${destination.gradient} opacity-60`}></div>
                  <div className="absolute top-2 right-2">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-1.5">
                      <MapPinIcon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">
                      <span className={`text-white text-xs font-medium ${fontClass}`}>{destination.country}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-lg font-semibold text-gray-900 ${fontClass}`}>
                      {destination.name}
                    </h3>
                    <div className={`text-gray-500 text-xs ${fontClass}`}>
                      {destination.flights}
                    </div>
                  </div>
                  <p className={`text-gray-600 text-sm mb-3 ${fontClass}`}>
                    {destination.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className={`text-gray-900 font-semibold text-sm ${fontClass}`}>
                      {destination.price}
                    </div>
                    <button className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-3 rounded-lg transition-colors ${fontClass} text-xs`}>
                      {t('common.view')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Section - Hidden (can be shown if needed) */}
      <section id="membership" className="relative z-10 py-20 hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-6">
            <h2 className={`text-2xl font-bold text-white mb-1 ${fontClass}`}>
              {t('home.membership.title')}
            </h2>
            <p className={`text-blue-200 text-xs ${fontClass}`}>
              {t('home.membership.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {membershipTiers.map((tier) => (
              <div key={tier.id} className={`group bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300 hover:scale-105 ${tier.id === 2 ? 'ring-2 ring-blue-400' : ''}`}>
                <div className={`h-20 bg-gradient-to-r ${tier.gradient} flex items-center justify-center relative`}>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                    <tier.icon className="h-8 w-8 text-white" />
                  </div>
                  {tier.id === 2 && (
                    <div className={`absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full ${fontClass}`}>
                      {t('home.membership.popular')}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className={`text-lg font-semibold text-white mb-1 ${fontClass}`}>
                    {tier.name}
                  </h3>
                  <p className={`text-white/70 text-sm mb-3 ${fontClass}`}>
                    {tier.description}
                  </p>
                  <div className="text-center mb-4">
                    <div className={`text-white font-bold text-xl ${fontClass}`}>
                      {tier.price}
                    </div>
                    <div className={`text-white/60 text-xs ${fontClass}`}>
                      {tier.points}
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircleIcon className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span className={`text-white/70 text-xs ${fontClass}`}>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {tier.benefits.map((benefit, idx) => (
                      <span key={idx} className={`bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs ${fontClass}`}>
                        {benefit}
                      </span>
                    ))}
                  </div>
                  <button className={`w-full font-medium py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${fontClass} text-xs ${
                    tier.id === 1 
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white' 
                      : tier.id === 2
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                      : 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white'
                  }`}>
                    {tier.id === 1 ? t('home.membership.freeMembership') : t('home.membership.upgradeMembership')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section - Hidden (replaced by Experience) */}
      <section id="services" className="relative z-10 py-20 hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-6">
            <h2 className={`text-2xl font-bold text-white mb-1 ${fontClass}`}>
              {t('services.title')}
            </h2>
            <p className={`text-blue-200 text-xs ${fontClass}`}>
              {t('services.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <div key={service.id} className="group bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className={`h-20 bg-gradient-to-r ${service.gradient} flex items-center justify-center`}>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                    <service.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className={`text-lg font-semibold text-white mb-2 ${fontClass}`}>
                    {service.title}
                  </h3>
                  <p className={`text-white/70 text-sm mb-3 ${fontClass}`}>
                    {service.description}
                  </p>
                  <div className="space-y-1 mb-3">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                        <span className={`text-white/60 text-xs ${fontClass}`}>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <button className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${fontClass} text-xs`}>
                    {t('common.moreInfo')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offers Section - Hidden (already shown in Featured Destinations) */}
      <section id="offers" className="relative z-10 py-20 hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-6">
            <h2 className={`text-2xl font-bold text-white mb-1 ${fontClass}`}>
              {t('offers.title')}
            </h2>
            <p className={`text-blue-200 text-xs ${fontClass}`}>
              {t('offers.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {offers.map((offer) => (
              <div key={offer.id} className="group bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className="absolute top-2 right-2 z-10">
                  <div className={`bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-1 rounded-full ${fontClass}`}>
                    {offer.discount} {t('offers.discount')}
                  </div>
                </div>
                <div className={`h-20 bg-gradient-to-r ${offer.gradient} flex items-center justify-center relative`}>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                    <offer.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className={`text-lg font-semibold text-white mb-2 ${fontClass}`}>
                    {offer.title}
                  </h3>
                  <p className={`text-white/70 text-sm mb-3 ${fontClass}`}>
                    {offer.description}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-white/50 text-sm line-through ${fontClass}`}>
                      {offer.originalPrice}
                    </span>
                    <span className={`text-white font-bold text-lg ${fontClass}`}>
                      {offer.newPrice}
                    </span>
                  </div>
                  <div className="space-y-1 mb-3">
                    {offer.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                        <span className={`text-white/60 text-xs ${fontClass}`}>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    <ClockIcon className="h-3 w-3 text-yellow-400" />
                    <span className={`text-yellow-400 text-xs ${fontClass}`}>
                      {offer.validUntil}
                    </span>
                  </div>
                  <button className={`w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${fontClass} text-xs`}>
                    {t('offers.useOffer')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section - Hidden (not in Emirates design) */}
      <section id="gallery" className="relative z-10 py-20 hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-6">
            <h2 className={`text-2xl font-bold text-white mb-1 ${fontClass}`}>
              {t('gallery.title')}
            </h2>
            <p className={`text-blue-200 text-xs ${fontClass}`}>
              {t('gallery.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {galleryImages.map((item) => (
              <div key={item.id} className="group bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => openModal(item.image)}>
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                      <EyeIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">
                      <span className={`text-white text-xs font-medium ${fontClass}`}>{item.category}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className={`text-lg font-semibold text-white mb-1 ${fontClass}`}>
                    {item.title}
                  </h3>
                  <p className={`text-white/70 text-sm ${fontClass}`}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News Section - Hidden (not in Emirates design) */}
      <section id="news" className="relative z-10 py-20 hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-6">
            <h2 className={`text-2xl font-bold text-white mb-1 ${fontClass}`}>
              {t('news.title')}
            </h2>
            <p className={`text-blue-200 text-xs ${fontClass}`}>
              {t('news.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {newsItems.map((news) => (
              <div key={news.id} className="group bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className="relative h-32 overflow-hidden">
                  <img 
                    src={news.image} 
                    alt={news.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300"></div>
                  <div className="absolute top-2 right-2">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">
                      <span className={`text-white text-xs font-medium ${fontClass}`}>{news.category}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-1.5">
                      <news.icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className={`text-lg font-semibold text-white mb-2 ${fontClass}`}>
                    {news.title}
                  </h3>
                  <p className={`text-white/70 text-sm mb-3 ${fontClass}`}>
                    {news.description}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-3 w-3 text-white/60" />
                      <span className={`text-white/60 text-xs ${fontClass}`}>{news.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-3 w-3 text-white/60" />
                      <span className={`text-white/60 text-xs ${fontClass}`}>{news.readTime}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    <CalendarDaysIcon className="h-3 w-3 text-yellow-400" />
                    <span className={`text-yellow-400 text-xs ${fontClass}`}>
                      {news.date}
                    </span>
                  </div>
                  <button className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${fontClass} text-xs`}>
                    {t('common.readMore')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seat Selection Modal */}
      {showSeatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowSeatModal(false)}
          ></div>
          <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 rounded-3xl p-8 max-w-4xl w-full mx-4 border border-white/20 shadow-2xl">
            <button
              onClick={() => setShowSeatModal(false)}
              className="absolute top-4 left-4 text-white/70 hover:text-white"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2 ${fontClass}">انتخاب صندلی</h2>
              <p className="text-blue-200 text-sm ${fontClass}">صندلی‌های دلخواه خود را انتخاب کنید</p>
            </div>
            <div className="bg-gradient-to-b from-gray-100 to-gray-50 rounded-xl p-4">
              <div className="max-w-lg mx-auto">
                <div className="flex justify-center gap-2 mb-2">
                  <div className="w-8 text-center text-xs font-bold text-gray-700">ردیف</div>
                  <div className="w-8 text-center text-xs font-bold text-gray-700">A</div>
                  <div className="w-8 text-center text-xs font-bold text-gray-700">B</div>
                  <div className="w-6 text-center text-xs font-bold text-gray-700">راهرو</div>
                  <div className="w-8 text-center text-xs font-bold text-gray-700">C</div>
                  <div className="w-8 text-center text-xs font-bold text-gray-700">D</div>
                </div>
                <div className="space-y-1">
                  {[1,2,3,4,5,6,7,8,9,10].map(row => (
                    <div key={row} className="flex items-center justify-center gap-2">
                      <div className="w-8 text-center text-xs font-bold text-gray-600">{row}</div>
                      {['A', 'B'].map(seat => {
                        const seatId = `${seat}${row}`;
                        const status = getSeatStatus(seatId);
                        return (
                          <button
                            key={seatId}
                            onClick={() => handleSeatSelection(seatId)}
                            disabled={status === 'reserved'}
                            className={`w-8 h-8 rounded text-xs font-bold ${
                              status === 'reserved' ? 'bg-red-500 text-white cursor-not-allowed' :
                              status === 'selected' ? 'bg-blue-600 text-white' :
                              'bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white'
                            }`}
                          >
                            {seat}
                          </button>
                        );
                      })}
                      <div className="w-6 h-8 bg-amber-200 rounded"></div>
                      {['C', 'D'].map(seat => {
                        const seatId = `${seat}${row}`;
                        const status = getSeatStatus(seatId);
                        return (
                          <button
                            key={seatId}
                            onClick={() => handleSeatSelection(seatId)}
                            disabled={status === 'reserved'}
                            className={`w-8 h-8 rounded text-xs font-bold ${
                              status === 'reserved' ? 'bg-red-500 text-white cursor-not-allowed' :
                              status === 'selected' ? 'bg-blue-600 text-white' :
                              'bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white'
                            }`}
                          >
                            {seat}
                          </button>
                        );
                      })}
              </div>
            ))}
          </div>
        </div>
            </div>
            <div className="flex gap-4 justify-center mt-6">
              <button onClick={() => setShowSeatModal(false)} className="bg-slate-600 text-white px-6 py-3 rounded-lg ${fontClass}">لغو</button>
              <button onClick={() => setShowSeatModal(false)} className="bg-blue-600 text-white px-6 py-3 rounded-lg ${fontClass}">تأیید</button>
            </div>
          </div>
        </div>
      )}

      {/* 3D Viewer Modal */}
      {show3DViewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShow3DViewer(false)}
          ></div>
          <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 rounded-3xl p-6 max-w-6xl w-full mx-4 border border-white/20 shadow-2xl">
            <button
              onClick={() => setShow3DViewer(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2 ${fontClass}">مشاهده فضای سه‌بعدی کابین</h2>
            </div>
            <div className="relative w-full h-96 bg-gray-900 rounded-2xl overflow-hidden">
              <iframe
                src="https://sketchfab.com/models/3d075f94c48a437bb67b417fd509c658/embed?autostart=1&ui_controls=1"
                width="100%"
                height="100%"
                frameBorder="0"
                allow="autoplay; fullscreen; vr"
                allowFullScreen
                title="Airplane Cabin 3D"
              ></iframe>
            </div>
            <div className="flex gap-4 justify-center mt-6">
              <button onClick={() => setShow3DViewer(false)} className="bg-slate-600 text-white px-6 py-3 rounded-lg ${fontClass}">بستن</button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeModal}
          ></div>
          <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-4 max-w-4xl w-full mx-4 border border-white/20 shadow-2xl">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors duration-200 z-10"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <div className="relative">
              <img 
                src={selectedImage} 
                alt="Gallery Image"
                className="w-full h-auto rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

    {/* FAQ Section - استایل جدید دایره‌ای و جدا از فوتر */}
<section
  id="faq"
  className="relative flex flex-col justify-center items-center"
  style={{
    marginTop: '0',
    marginBottom: '72px',
    padding: '0 20px',
    zIndex: 10,
    gap: '24px'
  }}
>
  {/* عنوان و توضیح بخش FAQ */}
  <div className="text-center max-w-2xl">
    <h2 
      style={{
        fontSize: 'clamp(24px, 6vw, 42px)',
        fontWeight: language === 'fa' ? 300 : 400,
        letterSpacing: '0.2px',
        marginBottom: '8px',
        color: '#000000',
        opacity: 1,
        fontFamily: 'DigiHamisheBold, Arial, sans-serif'
      }}
    >
      {language === 'fa' ? 'سوالات متداول' : language === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
    </h2>
    <p 
      style={{
        fontSize: '16.5px',
        fontWeight: language === 'fa' ? 300 : 400,
        letterSpacing: '0.2px',
        marginBottom: '0',
        color: '#000000',
        opacity: 1,
        fontFamily: 'DigiHamisheBold, Arial, sans-serif'
      }}
    >
      {language === 'fa' 
        ? 'پاسخ سوالات رایج خود را در مورد رزرو، پرواز، خدمات و پشتیبانی پیدا کنید'
        : language === 'ar'
        ? 'ابحث عن إجابات لأسئلتك الشائعة حول الحجز والرحلات والخدمات والدعم'
        : 'Find answers to your common questions about booking, flights, services and support'}
    </p>
  </div>

  {/* دایره‌های FAQ با عکس و توضیح زیر دایره‌ها */}
  <div className="flex justify-center items-center flex-wrap" style={{ gap: '42px', padding: '20px 0' }}>
    {[
      { 
        id: 'booking', 
        description: language === 'fa' ? 'راهنمای رزرو و خرید بلیط' : language === 'ar' ? 'دليل الحجز وشراء التذاكر' : 'Booking guide'
      },
      { 
        id: 'services', 
        description: language === 'fa' ? 'امکانات و خدمات در پرواز' : language === 'ar' ? 'المرافق والخدمات' : 'Flight amenities'
      },
      { 
        id: 'flight-info', 
        description: language === 'fa' ? 'وضعیت پرواز و جزئیات' : language === 'ar' ? 'حالة الرحلة والتفاصيل' : 'Flight status'
      },
      { 
        id: 'support', 
        description: language === 'fa' ? 'راه‌های ارتباط با پشتیبانی' : language === 'ar' ? 'طرق الاتصال بالدعم' : 'Contact support'
      }
    ].map((faq) => {
      return (
        <div key={faq.id} className="flex flex-col items-center">
          <button
            onClick={() => setSelectedFAQ(faq.id)}
            className="group flex items-center justify-center text-white transition-all"
            style={{
              fontFamily:
                language === 'fa'
                  ? "'Vazirmatn', sans-serif"
                  : language === 'en'
                  ? 'Arial, sans-serif'
                  : "'Noto Sans Arabic', sans-serif",
              width: '195px',
              height: '195px',
              borderRadius: '9999px',
              border: '3px solid #1e40af',
              boxShadow: '0 18px 35px rgba(0,0,0,0.4)',
              transform: 'translateY(0)',
              transition: 'all 0.25s ease',
              backgroundColor: '#93c5fd',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px) scale(1.03)';
              e.currentTarget.style.boxShadow = '0 22px 40px rgba(0,0,0,0.55)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 18px 35px rgba(0,0,0,0.4)';
            }}
          >
            <span
              className={`text-sm sm:text-base font-medium text-center ${fontClass}`}
              style={{ 
                position: 'relative',
                zIndex: 2,
                lineHeight: 1.4,
                color: '#ffffff',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
              }}
            >
             
            </span>
          </button>
          
          {/* توضیح زیر دایره (خارج از دایره) */}
          <span
            className={`text-xs text-center mt-3 ${fontClass}`}
            style={{ 
              lineHeight: 3,
              color: '#000000',
              fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
              fontSize: '16px'
            }}
          >
            {faq.description}
          </span>
        </div>
      );
    })}
  </div>
</section>

{/* FAQ Modal */}
{selectedFAQ && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div 
      className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      onClick={() => setSelectedFAQ(null)}
    ></div>
    <div className="relative bg-gray-900 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 px-6 py-4 border-b border-gray-700 flex items-center justify-between">
        <h3 className={`text-xl font-semibold text-white ${fontClass}`} style={{
          fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
        }}>
          {selectedFAQ === 'booking' && (language === 'fa' ? 'رزرو پرواز' : language === 'ar' ? 'حجز الطيران' : 'Flight Booking')}
          {selectedFAQ === 'services' && (language === 'fa' ? 'خدمات مسافران' : language === 'ar' ? 'خدمات الركاب' : 'Passenger Services')}
          {selectedFAQ === 'flight-info' && (language === 'fa' ? 'اطلاعات پرواز' : language === 'ar' ? 'معلومات الرحلة' : 'Flight Information')}
          {selectedFAQ === 'support' && (language === 'fa' ? 'پشتیبانی و تماس' : language === 'ar' ? 'الدعم والاتصال' : 'Support & Contact')}
        </h3>
        <button
          onClick={() => setSelectedFAQ(null)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-80px)]">
        <div className="space-y-6">
          {selectedFAQ === 'booking' && (
            <>
              <div>
                <h4 className={`text-lg font-semibold text-white mb-3 ${fontClass}`} style={{
                  fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                }}>
                  {language === 'fa' ? 'چگونه می‌توانم پرواز خود را رزرو کنم؟' : language === 'ar' ? 'كيف يمكنني حجز رحلتي؟' : 'How can I book my flight?'}
                </h4>
                <p className={`text-gray-300 leading-relaxed ${fontClass}`} style={{
                  fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                }}>
                  {language === 'fa' 
                    ? 'شما می‌توانید به راحتی از طریق وب‌سایت نسیم ایر، اپلیکیشن موبایل یا تماس با مرکز رزرواسیون ما پرواز خود را رزرو کنید. ما با مجوز رسمی از سازمان هواپیمایی کشوری و دارای نماد اعتماد الکترونیکی هستیم و تمامی تراکنش‌های شما به صورت امن انجام می‌شود.'
                    : language === 'ar'
                    ? 'يمكنك بسهولة حجز رحلتك من خلال موقع نسيم إير الإلكتروني أو تطبيق الهاتف المحمول أو الاتصال بمركز الحجز لدينا. نحن مرخصون رسمياً من منظمة الطيران المدني ونتحلى بشارة الثقة الإلكترونية، وجميع معاملاتك تتم بأمان.'
                    : 'You can easily book your flight through Nasim Air website, mobile app, or by contacting our reservation center. We are officially licensed by the Civil Aviation Organization and have an electronic trust badge, and all your transactions are secure.'}
                </p>
              </div>
              <div>
                <h4 className={`text-lg font-semibold text-white mb-3 ${fontClass}`} style={{
                  fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                }}>
                  {language === 'fa' ? 'آیا امکان تغییر یا لغو رزرو وجود دارد؟' : language === 'ar' ? 'هل يمكن تغيير أو إلغاء الحجز؟' : 'Can I change or cancel my booking?'}
                </h4>
                <p className={`text-gray-300 leading-relaxed ${fontClass}`} style={{
                  fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                }}>
                  {language === 'fa'
                    ? 'بله، شما می‌توانید با توجه به قوانین و شرایط بلیط خود، تغییرات یا لغو را از طریق پنل کاربری یا تماس با پشتیبانی انجام دهید. ما به عنوان یک ایرلاین معتبر ایرانی، تمام تلاش خود را برای رضایت شما انجام می‌دهیم.'
                    : language === 'ar'
                    ? 'نعم، يمكنك إجراء التغييرات أو الإلغاء من خلال لوحة المستخدم أو الاتصال بالدعم وفقاً لقواعد وشروط تذكرتك. كشركة طيران إيرانية موثوقة، نبذل قصارى جهدنا لإرضائك.'
                    : 'Yes, you can make changes or cancellations through your user panel or by contacting support, according to your ticket rules and conditions. As a trusted Iranian airline, we do our best to satisfy you.'}
                </p>
              </div>
            </>
          )}

          {selectedFAQ === 'services' && (
            <>
              <div>
                <h4 className={`text-lg font-semibold text-white mb-3 ${fontClass}`} style={{
                  fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                }}>
                  {language === 'fa' ? 'چه خدماتی در طول پرواز ارائه می‌شود؟' : language === 'ar' ? 'ما هي الخدمات المقدمة أثناء الرحلة؟' : 'What services are provided during the flight?'}
                </h4>
                <p className={`text-gray-300 leading-relaxed ${fontClass}`} style={{
                  fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                }}>
                  {language === 'fa'
                    ? 'نسیم ایر با افتخار خدمات متنوعی از جمله پذیرایی، اینترنت وای‌فای، سرگرمی‌های پرواز و خدمات ویژه برای مسافران VIP ارائه می‌دهد. تمامی خدمت‌رسانان ما آموزش‌دیده و متعهد به ارائه بهترین تجربه سفر برای شما هستند.'
                    : language === 'ar'
                    ? 'تقدم نسيم إير بفخر خدمات متنوعة تشمل الضيافة والإنترنت اللاسلكي ووسائل الترفيه وخدمات خاصة لركاب VIP. جميع موظفينا مدربون وملتزمون بتقديم أفضل تجربة سفر لك.'
                    : 'Nasim Air proudly provides various services including catering, WiFi internet, in-flight entertainment, and special services for VIP passengers. All our staff are trained and committed to providing you with the best travel experience.'}
                </p>
              </div>
              <div>
                <h4 className={`text-lg font-semibold text-white mb-3 ${fontClass}`} style={{
                  fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                }}>
                  {language === 'fa' ? 'آیا امکان حمل بار اضافی وجود دارد؟' : language === 'ar' ? 'هل يمكن نقل أمتعة إضافية؟' : 'Can I carry extra baggage?'}
                </h4>
                <p className={`text-gray-300 leading-relaxed ${fontClass}`} style={{
                  fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                }}>
                  {language === 'fa'
                    ? 'بله، شما می‌توانید با پرداخت هزینه اضافی، بار اضافی حمل کنید. اطلاعات دقیق در مورد وزن و ابعاد مجاز را می‌توانید در وب‌سایت ما مشاهده کنید. ما به عنوان یک ایرلاین معتبر، تمام قوانین بین‌المللی را رعایت می‌کنیم.'
                    : language === 'ar'
                    ? 'نعم، يمكنك نقل أمتعة إضافية مقابل دفع رسوم إضافية. يمكنك الاطلاع على معلومات دقيقة حول الوزن والأبعاد المسموحة على موقعنا. كشركة طيران موثوقة، نلتزم بجميع القوانين الدولية.'
                    : 'Yes, you can carry extra baggage for an additional fee. You can find detailed information about allowed weight and dimensions on our website. As a trusted airline, we comply with all international regulations.'}
                </p>
              </div>
            </>
          )}

          {selectedFAQ === 'flight-info' && (
            <>
              <div>
                <h4 className={`text-lg font-semibold text-white mb-3 ${fontClass}`} style={{
                  fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                }}>
                  {language === 'fa' ? 'چگونه می‌توانم وضعیت پرواز خود را بررسی کنم؟' : language === 'ar' ? 'كيف يمكنني التحقق من حالة رحلتي؟' : 'How can I check my flight status?'}
                </h4>
                <p className={`text-gray-300 leading-relaxed ${fontClass}`} style={{
                  fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                }}>
                  {language === 'fa'
                    ? 'شما می‌توانید از طریق وب‌سایت نسیم ایر، اپلیکیشن موبایل یا با وارد کردن شماره پرواز در بخش "وضعیت پرواز" اطلاعات دقیق پرواز خود را مشاهده کنید. ما به عنوان یک ایرلاین معتبر ایرانی، تمام تلاش خود را برای اطلاع‌رسانی به موقع انجام می‌دهیم.'
                    : language === 'ar'
                    ? 'يمكنك الاطلاع على معلومات دقيقة لرحلتك من خلال موقع نسيم إير أو تطبيق الهاتف المحمول أو بإدخال رقم الرحلة في قسم "حالة الرحلة". كشركة طيران إيرانية موثوقة، نبذل قصارى جهدنا لإعلامك في الوقت المناسب.'
                    : 'You can view detailed information about your flight through the Nasim Air website, mobile app, or by entering the flight number in the "Flight Status" section. As a trusted Iranian airline, we do our best to inform you in a timely manner.'}
                </p>
              </div>
              <div>
                <h4 className={`text-lg font-semibold text-white mb-3 ${fontClass}`} style={{
                  fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                }}>
                  {language === 'fa' ? 'چه زمانی باید در فرودگاه حاضر شوم؟' : language === 'ar' ? 'متى يجب أن أكون في المطار؟' : 'When should I arrive at the airport?'}
                </h4>
                <p className={`text-gray-300 leading-relaxed ${fontClass}`} style={{
                  fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                }}>
                  {language === 'fa'
                    ? 'برای پروازهای داخلی حداقل 90 دقیقه و برای پروازهای بین‌المللی حداقل 3 ساعت قبل از زمان پرواز در فرودگاه حاضر شوید. نسیم ایر با رعایت تمام استانداردهای امنیتی و ایمنی، تجربه سفر امنی را برای شما فراهم می‌کند.'
                    : language === 'ar'
                    ? 'للرحلات الداخلية، يجب أن تكون في المطار قبل 90 دقيقة على الأقل، وللرحلات الدولية قبل 3 ساعات على الأقل من وقت الرحلة. تلتزم نسيم إير بجميع معايير الأمن والسلامة لتوفير تجربة سفر آمنة لك.'
                    : 'For domestic flights, arrive at least 90 minutes before, and for international flights, at least 3 hours before the flight time. Nasim Air, complying with all security and safety standards, provides you with a safe travel experience.'}
                </p>
              </div>
            </>
          )}

          {selectedFAQ === 'support' && (
            <>
              <div>
                <h4 className={`text-lg font-semibold text-white mb-3 ${fontClass}`} style={{
                  fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                }}>
                  {language === 'fa' ? 'چگونه می‌توانم با پشتیبانی نسیم ایر تماس بگیرم؟' : language === 'ar' ? 'كيف يمكنني الاتصال بدعم نسيم إير؟' : 'How can I contact Nasim Air support?'}
                </h4>
                <p className={`text-gray-300 leading-relaxed ${fontClass}`} style={{
                  fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                }}>
                  {language === 'fa'
                    ? 'شما می‌توانید از طریق شماره تلفن 021-91000000، ایمیل support@nasimair.ir یا چت آنلاین در وب‌سایت با تیم پشتیبانی ما در ارتباط باشید. تیم پشتیبانی نسیم ایر 24/7 آماده پاسخگویی به سوالات شماست. ما به عنوان یک ایرلاین معتبر ایرانی با نماد اعتماد الکترونیکی، متعهد به ارائه بهترین خدمات به شما هستیم.'
                    : language === 'ar'
                    ? 'يمكنك التواصل مع فريق الدعم لدينا عبر الهاتف 021-91000000 أو البريد الإلكتروني support@nasimair.ir أو الدردشة المباشرة على الموقع. فريق دعم نسيم إير جاهز للرد على استفساراتك على مدار الساعة. كشركة طيران إيرانية موثوقة بشارة الثقة الإلكترونية، ملتزمون بتقديم أفضل الخدمات لك.'
                    : 'You can contact our support team via phone 021-91000000, email support@nasimair.ir, or online chat on the website. Nasim Air support team is available 24/7 to answer your questions. As a trusted Iranian airline with an electronic trust badge, we are committed to providing you with the best services.'}
                </p>
              </div>
              <div>
                <h4 className={`text-lg font-semibold text-white mb-3 ${fontClass}`} style={{
                  fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                }}>
                  {language === 'fa' ? 'آیا نسیم ایر دارای مجوز و اعتبار است؟' : language === 'ar' ? 'هل تمتلك نسيم إير ترخيصاً ومصداقية؟' : 'Is Nasim Air licensed and credible?'}
                </h4>
                <p className={`text-gray-300 leading-relaxed ${fontClass}`} style={{
                  fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                }}>
                  {language === 'fa'
                    ? 'بله، نسیم ایر با مجوز رسمی از سازمان هواپیمایی کشوری فعالیت می‌کند و دارای نماد اعتماد الکترونیکی (اینماد) است. ما تمام استانداردهای ایمنی و امنیتی بین‌المللی را رعایت می‌کنیم و به عنوان یک ایرلاین معتبر ایرانی، سال‌هاست که خدمات پروازی ایمن و با کیفیت ارائه می‌دهیم.'
                    : language === 'ar'
                    ? 'نعم، تعمل نسيم إير بترخيص رسمي من منظمة الطيران المدني وتحمل شارة الثقة الإلكترونية. نلتزم بجميع معايير الأمن والسلامة الدولية وكشركة طيران إيرانية موثوقة، نقدم منذ سنوات خدمات طيران آمنة وعالية الجودة.'
                    : 'Yes, Nasim Air operates with an official license from the Civil Aviation Organization and has an electronic trust badge. We comply with all international safety and security standards, and as a trusted Iranian airline, we have been providing safe and quality flight services for years.'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  </div>
)}
      {/* Footer - Emirates Style */}
      <footer className="relative z-10 py-8 sm:py-16" style={{ backgroundColor: '#1e3a8a', color: '#ffffff', marginTop: '-56px', borderTop: '2px solid rgba(255, 255, 255, 0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* درباره نسیم ایر Column */}
            <div>
              <h4 className={`text-sm font-medium mb-6 text-white ${fontClass}`} style={{
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
              }}>{language === 'fa' ? 'درباره نسیم ایر' : language === 'ar' ? 'حول نسيم إير' : 'About Nasim Air'}</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className={`group flex items-center gap-2 text-sm font-medium text-white hover:text-gray-300 transition-all ${fontClass}`} style={{
                    fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                    borderBottom: '2px solid transparent',
                    paddingBottom: '4px',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderBottomColor = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderBottomColor = 'transparent';
                  }}>
                    <DocumentTextIcon className="w-4 h-4 text-white" />
                    {language === 'fa' ? 'تاریخچه نسیم ایر' : language === 'ar' ? 'تاريخ نسيم إير' : 'Nasim Air History'}
                  </a>
                </li>
                <li>
                  <a href="#" className={`group flex items-center gap-2 text-sm font-medium text-white hover:text-gray-300 transition-all ${fontClass}`} style={{
                    fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                    borderBottom: '2px solid transparent',
                    paddingBottom: '4px',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderBottomColor = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderBottomColor = 'transparent';
                  }}>
                    <ShieldCheckIcon className="w-4 h-4 text-white" />
                    {language === 'fa' ? 'مجوز سازمان هواپیمایی' : language === 'ar' ? 'ترخيص منظمة الطيران' : 'Aviation License'}
                  </a>
                </li>
                <li>
                  <a href="#" className={`group flex items-center gap-2 text-sm font-medium text-white hover:text-gray-300 transition-all ${fontClass}`} style={{
                    fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                    borderBottom: '2px solid transparent',
                    paddingBottom: '4px',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderBottomColor = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderBottomColor = 'transparent';
                  }}>
                    <UserGroupIcon className="w-4 h-4 text-white" />
                    {language === 'fa' ? 'فرصت‌های شغلی' : language === 'ar' ? 'فرص العمل' : 'Careers'}
                  </a>
                </li>
                <li>
                  <a href="#" className={`group flex items-center gap-2 text-sm font-medium text-white hover:text-gray-300 transition-all ${fontClass}`} style={{
                    fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                    borderBottom: '2px solid transparent',
                    paddingBottom: '4px',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderBottomColor = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderBottomColor = 'transparent';
                  }}>
                    <PhoneIcon className="w-4 h-4 text-white" />
                    {language === 'fa' ? 'تماس با ما' : language === 'ar' ? 'اتصل بنا' : 'Contact Us'}
                  </a>
                </li>
                <li>
                  <a href="#" className={`group flex items-center gap-2 text-sm font-medium text-white hover:text-gray-300 transition-all ${fontClass}`} style={{
                    fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                    borderBottom: '2px solid transparent',
                    paddingBottom: '4px',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderBottomColor = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderBottomColor = 'transparent';
                  }}>
                    <NewspaperIcon className="w-4 h-4 text-white" />
                    {language === 'fa' ? 'مرکز رسانه' : language === 'ar' ? 'مركز الإعلام' : 'Media Center'}
                  </a>
                </li>
              </ul>
            </div>

            {/* خدمات Column */}
            <div>
              <h4 className={`text-sm font-medium mb-6 text-white ${fontClass}`} style={{
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
              }}>{language === 'fa' ? 'خدمات' : language === 'ar' ? 'الخدمات' : 'Services'}</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className={`group flex items-center gap-2 text-sm font-medium text-white hover:text-gray-300 transition-all ${fontClass}`} style={{
                    fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                    borderBottom: '2px solid transparent',
                    paddingBottom: '4px',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderBottomColor = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderBottomColor = 'transparent';
                  }}>
                    <PaperAirplaneIcon className="w-4 h-4 text-white" />
                    {language === 'fa' ? 'رزرو پرواز داخلی' : language === 'ar' ? 'حجز رحلة داخلية' : 'Domestic Flights'}
                  </a>
                </li>
                <li>
                  <a href="#" className={`group flex items-center gap-2 text-sm font-medium text-white hover:text-gray-300 transition-all ${fontClass}`} style={{
                    fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                    borderBottom: '2px solid transparent',
                    paddingBottom: '4px',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderBottomColor = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderBottomColor = 'transparent';
                  }}>
                    <GlobeAltIcon className="w-4 h-4 text-white" />
                    {language === 'fa' ? 'رزرو پرواز بین‌المللی' : language === 'ar' ? 'حجز رحلة دولية' : 'International Flights'}
                  </a>
                </li>
                <li>
                  <a href="#" className={`group flex items-center gap-2 text-sm font-medium text-white hover:text-gray-300 transition-all ${fontClass}`} style={{
                    fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                    borderBottom: '2px solid transparent',
                    paddingBottom: '4px',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderBottomColor = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderBottomColor = 'transparent';
                  }}>
                    <UserIcon className="w-4 h-4 text-white" />
                    {language === 'fa' ? 'خدمات مسافران' : language === 'ar' ? 'خدمات الركاب' : 'Passenger Services'}
                  </a>
                </li>
                <li>
                  <a href="#" className={`group flex items-center gap-2 text-sm font-medium text-white hover:text-gray-300 transition-all ${fontClass}`} style={{
                    fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                    borderBottom: '2px solid transparent',
                    paddingBottom: '4px',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderBottomColor = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderBottomColor = 'transparent';
                  }}>
                    <TruckIcon className="w-4 h-4 text-white" />
                    {language === 'fa' ? 'بار اضافی' : language === 'ar' ? 'أمتعة إضافية' : 'Extra Baggage'}
                  </a>
                </li>
                <li>
                  <a href="#" className={`group flex items-center gap-2 text-sm font-medium text-white hover:text-gray-300 transition-all ${fontClass}`} style={{
                    fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                    borderBottom: '2px solid transparent',
                    paddingBottom: '4px',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderBottomColor = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderBottomColor = 'transparent';
                  }}>
                    <SparklesIcon className="w-4 h-4 text-white" />
                    {language === 'fa' ? 'خدمات ویژه' : language === 'ar' ? 'خدمات خاصة' : 'Special Services'}
                  </a>
                </li>
              </ul>
            </div>

            {/* اطلاعات پرواز Column */}
            <div>
              <h4 className={`text-sm font-medium mb-6 text-white ${fontClass}`} style={{
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
              }}>{language === 'fa' ? 'اطلاعات پرواز' : language === 'ar' ? 'معلومات الرحلة' : 'Flight Information'}</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className={`group flex items-center gap-2 text-sm font-medium text-white hover:text-gray-300 transition-all ${fontClass}`} style={{
                    fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                  }}>
                    <ClockIcon className="w-4 h-4 text-white" />
                    {language === 'fa' ? 'وضعیت پرواز' : language === 'ar' ? 'حالة الرحلة' : 'Flight Status'}
                  </a>
                </li>
                <li>
                  <a href="#" className={`group flex items-center gap-2 text-sm font-medium text-white hover:text-gray-300 transition-all ${fontClass}`} style={{
                    fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                  }}>
                    <MapPinIcon className="w-4 h-4 text-white" />
                    {language === 'fa' ? 'مقصدهای پروازی' : language === 'ar' ? 'الوجهات' : 'Destinations'}
                  </a>
                </li>
                <li>
                  <a href="#" className={`group flex items-center gap-2 text-sm font-medium text-white hover:text-gray-300 transition-all ${fontClass}`} style={{
                    fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                  }}>
                    <CheckCircleIcon className="w-4 h-4 text-white" />
                    {language === 'fa' ? 'چک این آنلاین' : language === 'ar' ? 'تسجيل الوصول عبر الإنترنت' : 'Online Check-in'}
                  </a>
                </li>
                <li>
                  <a href="#" className={`group flex items-center gap-2 text-sm font-medium text-white hover:text-gray-300 transition-all ${fontClass}`} style={{
                    fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                  }}>
                    <ClipboardDocumentIcon className="w-4 h-4 text-white" />
                    {language === 'fa' ? 'مدیریت رزرو' : language === 'ar' ? 'إدارة الحجز' : 'Manage Booking'}
                  </a>
                </li>
                <li>
                  <a href="#" className={`group flex items-center gap-2 text-sm font-medium text-white hover:text-gray-300 transition-all ${fontClass}`} style={{
                    fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                  }}>
                    <QuestionMarkCircleIcon className="w-4 h-4 text-white" />
                    {language === 'fa' ? 'سوالات متداول' : language === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}
                  </a>
                </li>
                <li>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      setShowWeatherModal(true);
                    }}
                    className={`group flex items-center gap-2 text-sm font-medium text-white hover:text-gray-300 transition-all ${fontClass}`} 
                    style={{
                      fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      width: '100%',
                      textAlign: language === 'fa' || language === 'ar' ? 'right' : 'left'
                    }}
                  >
                    <CloudIcon className="w-4 h-4 text-white" />
                    {language === 'fa' ? 'وضعیت آب و هوا' : language === 'ar' ? 'حالة الطقس' : 'Weather'}
                  </button>
                </li>
              </ul>
              </div>

            {/* مجوزها و اعتبارات Column */}
            <div>
              <h4 className={`text-sm font-medium mb-6 text-white ${fontClass}`} style={{
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
              }}>{language === 'fa' ? 'مجوزها و اعتبارات' : language === 'ar' ? 'التراخيص والاعتمادات' : 'Licenses & Credentials'}</h4>
              <ul className="space-y-3">
                <li>
                  <a href="https://www.enamad.ir" target="_blank" rel="noopener noreferrer" className={`group flex items-center gap-2 text-sm font-medium text-white hover:text-gray-300 transition-all ${fontClass}`} style={{
                    fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                  }}>
                    <ShieldCheckIcon className="w-4 h-4 text-white" />
                    {language === 'fa' ? 'نماد اعتماد الکترونیکی (اینماد)' : language === 'ar' ? 'شارة الثقة الإلكترونية' : 'Electronic Trust Badge (Enamad)'}
                  </a>
                </li>
                <li>
                  <a href="#" className={`group flex items-center gap-2 text-sm font-medium text-white hover:text-gray-300 transition-all ${fontClass}`} style={{
                    fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                  }}>
                    <ShieldCheckIcon className="w-4 h-4 text-white" />
                    {language === 'fa' ? 'مجوز سازمان هواپیمایی کشوری' : language === 'ar' ? 'ترخيص منظمة الطيران المدني' : 'CAO License'}
                  </a>
                </li>
                <li>
                  <a href="#" className={`group flex items-center gap-2 text-sm font-medium text-white hover:text-gray-300 transition-all ${fontClass}`} style={{
                    fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                  }}>
                    <ShieldCheckIcon className="w-4 h-4 text-white" />
                    {language === 'fa' ? 'استانداردهای ایمنی' : language === 'ar' ? 'معايير السلامة' : 'Safety Standards'}
                  </a>
                </li>
                <li>
                  <a href="#" className={`group flex items-center gap-2 text-sm font-medium text-white hover:text-gray-300 transition-all ${fontClass}`} style={{
                    fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                  }}>
                    <ShieldCheckIcon className="w-4 h-4 text-white" />
                    {language === 'fa' ? 'گواهینامه‌های بین‌المللی' : language === 'ar' ? 'الشهادات الدولية' : 'International Certificates'}
                  </a>
                </li>
                <li>
                  <a href="#" className={`group flex items-center gap-2 text-sm font-medium text-white hover:text-gray-300 transition-all ${fontClass}`} style={{
                    fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                  }}>
                    <ShieldCheckIcon className="w-4 h-4 text-white" />
                    {language === 'fa' ? 'حریم خصوصی و امنیت' : language === 'ar' ? 'الخصوصية والأمان' : 'Privacy & Security'}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className={`border-t mt-12 pt-8 pb-16 ${fontClass}`} style={{
            borderColor: '#3b82f6',
            fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
          }}>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm font-medium text-white text-center md:text-right">
                &copy; 2024 {t('common.nasimAir')} {t('footer.copyright') || 'تمام حقوق محفوظ است'}.
              </p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <a 
                  href="https://www.instagram.com/flynasim" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-9 h-9 rounded-full text-white hover:bg-white/20 transition-colors"
                  title="Instagram"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.218 4.771 1.693 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a 
                  href="https://wa.me" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-9 h-9 rounded-full text-white hover:bg-white/20 transition-colors"
                  title="WhatsApp"
                  aria-label="WhatsApp"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.linkedin.com/company/flynasim" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-9 h-9 rounded-full text-white hover:bg-white/20 transition-colors"
                  title="LinkedIn"
                  aria-label="LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <span className="text-gray-400">|</span>
                <a 
                  href="https://www.enamad.ir" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-medium text-white hover:text-gray-300 transition-colors"
                >
                  <ShieldCheckIcon className="w-5 h-5 text-white" />
                  <span>{language === 'fa' ? 'نماد اعتماد الکترونیکی' : language === 'ar' ? 'شارة الثقة الإلكترونية' : 'Electronic Trust Badge'}</span>
                </a>
                <span className="text-gray-400">|</span>
                <span className="text-sm text-white">
                  {language === 'fa' ? 'مجوز سازمان هواپیمایی کشوری' : language === 'ar' ? 'ترخيص منظمة الطيران المدني' : 'CAO Licensed'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Weather Modal */}
      {showWeatherModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowWeatherModal(false)}
        >
          <div 
            className="bg-gray-200 rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-scroll border border-gray-300"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '1400px',
              transform: 'translateZ(0)',
              WebkitOverflowScrolling: 'touch',
              contain: 'layout style paint',
            }}
          >
            <div className="p-6 sm:p-8">
              <div className="relative flex items-center justify-center mb-6">
                <h3 className={`text-xl sm:text-2xl font-bold text-gray-900 ${fontClass} flex items-center gap-2`} style={{
                  fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                }}>
                  <CloudIcon className="w-6 h-6 sm:w-7 sm:h-7 text-gray-900" />
                  {language === 'fa' ? 'وضعیت آب و هوا' : language === 'ar' ? 'حالة الطقس' : 'Weather'}
                </h3>
                <button
                  onClick={() => setShowWeatherModal(false)}
                  className="absolute right-0 text-gray-700 hover:text-gray-900 p-1 rounded-full hover:bg-gray-300"
                  aria-label="Close"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <div style={{ contain: 'layout style paint' }}>
                <WeatherWidget cities={weatherCities} />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


export default HomePage;
