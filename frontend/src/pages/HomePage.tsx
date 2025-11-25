import React, { useState, useEffect, useMemo } from 'react';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import EmiratesFlightSearchForm from '../components/FlightSearch/EmiratesFlightSearchForm';
import WeatherWidget from '../components/Weather/WeatherWidget';
import { useLanguage } from '../contexts/LanguageContext';
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
  CreditCardIcon
} from '@heroicons/react/24/outline';

const HomePage: React.FC = () => {
  const { t, fontClass } = useLanguage();
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('general');

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

  const reservedSeats = ['A1', 'B2', 'C3', 'D4', 'A5', 'B6'];

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
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      gradient: 'from-blue-500 to-blue-700'
    },
    {
      id: 2,
      name: t('destinations.mashhad.name'),
      description: t('destinations.mashhad.desc'),
      country: t('destinations.iran'),
      flights: t('destinations.dailyFlights'),
      price: `${t('destinations.from')} $95`,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      gradient: 'from-orange-500 to-orange-700'
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
      <EmiratesHeader />

      {/* Hero Section with Flight Search - Emirates Style */}
      <section className="relative z-10 min-h-[700px] flex flex-col justify-end pb-8">
        {/* Hero Image Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/images/airport-crew.jpg)'
          }}
        >
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          {/* Promotional Text - Like Emirates */}
          <div className="mb-12 text-center">
            <p className={`text-white text-xl italic mb-4 ${fontClass}`}>
              {t('home.hero.subtitle') || 'It\'s arrived, the'}
            </p>
            <h1 className={`text-7xl md:text-8xl font-bold text-white mb-4 ${fontClass}`}>
              {t('home.hero.title') || 'PREMIUM ECONOMY'}
            </h1>
            <p className={`text-white text-xl italic mb-6 ${fontClass}`}>
              {t('home.hero.description') || 'you\'ve been waiting for'}
            </p>
            <button className="bg-red-600 hover:bg-red-700 text-white font-medium px-8 py-3 rounded-lg transition-colors">
              {t('common.learnMore') || 'بیشتر بدانید'}
            </button>
          </div>

          {/* Flight Search Form at Bottom */}
          <div className="max-w-6xl mx-auto">
            <EmiratesFlightSearchForm />
          </div>
        </div>
      </section>

      {/* Featured Destinations Section - Emirates Style */}
      <section className="relative z-10 py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-bold text-gray-900 mb-2 ${fontClass}`}>
              {t('destinations.featured') || 'مقاصد ویژه'}
            </h2>
          </div>
          
          {/* Two Large Destination Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {destinations.slice(0, 2).map((destination) => (
              <div key={destination.id} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative h-80 overflow-hidden">
                  <img 
                    src={destination.image} 
                    alt={destination.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
                <div className="p-6 bg-white">
                  <p className={`text-gray-500 text-xs uppercase tracking-wider mb-2 ${fontClass}`}>
                    {destination.country}
                  </p>
                  <h3 className={`text-3xl font-bold text-gray-900 mb-2 ${fontClass}`}>
                    {destination.name}
                  </h3>
                  <p className={`text-gray-600 ${fontClass}`}>
                    {t('destinations.discover') || 'کشف کنید'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Links */}
          <div className="flex items-center justify-between mt-6">
            <button className={`border border-gray-300 bg-white hover:bg-gray-50 px-6 py-3 rounded transition-colors ${fontClass}`}>
              {t('destinations.moreDestinations') || 'مقاصد بیشتر'}
            </button>
            <a href="#" className={`text-blue-600 hover:text-blue-700 underline ${fontClass}`}>
              {t('destinations.inspiredByRouteMap') || 'از نقشه مسیرهای ما الهام بگیرید >'}
            </a>
          </div>
        </div>
      </section>

      {/* Old Booking Section - Remove this */}
      <section className="hidden">
        <div className="max-w-3xl mx-auto px-6">
          
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

      {/* Skywards+ Section - Emirates Style */}
      <section className="relative z-10 py-24 bg-white overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/images/airport-crew.jpg)'
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <p className={`text-white text-sm uppercase tracking-wider mb-2 ${fontClass}`}>
              SKYWARDS+
            </p>
            <h2 className={`text-4xl md:text-5xl font-bold text-white mb-4 ${fontClass}`}>
              {t('loyalty.enhanceBenefits') || 'مزایای خود را با Skywards+ افزایش دهید'}
            </h2>
            <p className={`text-white text-lg mb-6 ${fontClass}`}>
              {t('loyalty.choosePackages') || 'از بین 3 بسته انتخاب کنید که شامل آنچه دوست دارید است، از دسترسی به لانژ فرودگاه و بار اضافی، تا نرخ‌های انحصاری Cash+Miles و تخفیف‌ها.'}
            </p>
            <button className="bg-white hover:bg-gray-100 text-gray-900 font-medium px-8 py-3 rounded-lg transition-colors">
              {t('common.learnMore') || 'بیشتر بدانید'}
            </button>
          </div>
        </div>
      </section>

      {/* Experience Section - Emirates Style */}
      <section id="experience" className="relative z-10 py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-2">
            <p className={`text-gray-500 text-sm uppercase tracking-wider text-center ${fontClass}`}>
              {t('nav.experience') || 'FLYING WITH EMIRATES'}
            </p>
          </div>
          <div className="text-center mb-8">
            <h2 className={`text-4xl md:text-5xl font-bold text-gray-900 mb-4 ${fontClass}`}>
              {t('experience.makeIncredible') || 'سفر خود را فوق‌العاده کنید'}
            </h2>
            <p className={`text-gray-600 text-lg ${fontClass}`}>
              {t('experience.subtitle') || 'تجربه Emirates را کاوش کنید و سفری فراموش‌نشدنی فراتر از پرواز خود برنامه‌ریزی کنید.'}
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Large Left Card */}
            <div className="lg:col-span-2 bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200">
              <div className="relative h-96">
                <img 
                  src="/images/airport-crew.jpg" 
                  alt="Discover Dubai"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <p className={`text-gray-500 text-xs uppercase tracking-wider mb-2 ${fontClass}`}>
                  {t('destinations.dubai') || 'DUBAI AND THE UAE'}
                </p>
                <h3 className={`text-3xl font-bold text-gray-900 mb-4 ${fontClass}`}>
                  {t('destinations.discoverDubai') || 'کشف دبی'}
                </h3>
                <a href="#" className={`text-red-600 hover:text-red-700 underline font-medium ${fontClass}`}>
                  {t('common.learnMore') || 'بیشتر بدانید'}
                </a>
              </div>
            </div>

            {/* Right Side - 2x2 Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              {services.slice(0, 4).map((service, idx) => (
                <div key={service.id} className="bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200 relative">
                  <div className="relative h-48">
                    <div className={`absolute inset-0 bg-gradient-to-r ${service.gradient} opacity-80`}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <service.icon className="h-16 w-16 text-white" />
                    </div>
                  </div>
                  <div className="p-4">
                    <p className={`text-gray-500 text-xs uppercase tracking-wider mb-2 ${fontClass}`}>
                      {t('experience.cabinFeatures') || 'CABIN FEATURES'}
                    </p>
                    <h3 className={`text-xl font-bold text-gray-900 mb-2 ${fontClass}`}>
                      {service.title}
                    </h3>
                    <a href="#" className={`text-red-600 hover:text-red-700 underline text-sm ${fontClass}`}>
                      {t('common.learnMore') || 'بیشتر بدانید'}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

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
                      ? 'bg-blue-200 text-blue-900'
                      : 'bg-blue-900/50 text-white hover:bg-blue-800/50'
                  }`}
                >
                  {t('home.flightSearch.roundTrip')}
                </button>
                <button
                  onClick={() => setTripType('oneway')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${fontClass} transition-all duration-300 ${
                    tripType === 'oneway'
                      ? 'bg-blue-200 text-blue-900'
                      : 'bg-blue-900/50 text-white hover:bg-blue-800/50'
                  }`}
                >
                  {t('home.flightSearch.oneWay')}
                </button>
                <button
                  onClick={() => setTripType('multi')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${fontClass} transition-all duration-300 ${
                    tripType === 'multi'
                      ? 'bg-blue-200 text-blue-900'
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
                <button className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                  <PaperAirplaneIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Section - Additional (if needed) */}
      <section id="destinations" className="relative z-10 py-16 bg-white hidden">
        <div className="max-w-7xl mx-auto px-6">
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

      {/* Support Section */}
      <section id="support" className="relative z-10 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-6">
            <h2 className={`text-2xl font-bold text-white mb-1 ${fontClass}`}>
              {t('support.title')}
            </h2>
            <p className={`text-blue-200 text-xs ${fontClass}`}>
              {t('support.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {supportMethods.map((method) => (
              <div key={method.id} className="group bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className={`h-20 bg-gradient-to-r ${method.gradient} flex items-center justify-center`}>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                    <method.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className={`text-lg font-semibold text-white mb-2 ${fontClass}`}>
                    {method.title}
                  </h3>
                  <p className={`text-white/70 text-sm mb-3 ${fontClass}`}>
                    {method.description}
                  </p>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-3">
                    <div className={`text-white font-bold text-lg ${fontClass}`}>
                      {method.contact}
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-white/60 text-xs ${fontClass}`}>{t('support.availability')}:</span>
                      <span className={`text-green-400 text-xs ${fontClass}`}>{method.availability}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-white/60 text-xs ${fontClass}`}>{t('support.responseTime')}:</span>
                      <span className={`text-blue-400 text-xs ${fontClass}`}>{method.responseTime}</span>
                    </div>
                  </div>
                  <button className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${fontClass} text-xs`}>
                    {t('support.contactUs')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="text-center mb-6 mt-12">
            <h2 className={`text-xl font-bold text-white mb-2 ${fontClass}`}>
              {t('support.faq')}
            </h2>
            <p className={`text-blue-200 text-sm ${fontClass}`}>
              {t('support.faqSubtitle')}
            </p>
          </div>

          {/* FAQ Categories */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {faqCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${fontClass} ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <category.icon className="h-4 w-4" />
                {category.name}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqs[selectedCategory as keyof typeof faqs].map((faq, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 shadow-xl">
                <div className="flex items-start gap-3">
                  <QuestionMarkCircleIcon className="h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-2 ${fontClass}">
                      {faq.question}
                    </h3>
                    <p className="text-white/70 text-sm ${fontClass}">
                      {faq.answer}
                    </p>
                  </div>
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

      {/* Weather Section */}
      <section id="weather" className="relative z-10 py-20 bg-gradient-to-b from-transparent to-black/30">
        <WeatherWidget cities={['Tehran', 'Mashhad', 'Kish', 'Abadan']} />
      </section>

      {/* Footer - Emirates Style */}
      <footer className="relative z-10 bg-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* About Us Column */}
            <div>
              <h4 className={`text-lg font-bold mb-6 ${fontClass}`}>{t('nav.about') || 'درباره ما'}</h4>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#" className={`hover:text-white transition-colors ${fontClass}`}>{t('nav.about') || 'درباره ما'}</a></li>
                <li><a href="#" className={`hover:text-white transition-colors ${fontClass}`}>{t('footer.careers') || 'فرصت‌های شغلی'}</a></li>
                <li><a href="#" className={`hover:text-white transition-colors ${fontClass}`}>{t('footer.mediaCenter') || 'مرکز رسانه'}</a></li>
                <li><a href="#" className={`hover:text-white transition-colors ${fontClass}`}>{t('footer.ourPlanet') || 'سیاره ما'}</a></li>
                <li><a href="#" className={`hover:text-white transition-colors ${fontClass}`}>{t('footer.ourPeople') || 'مردم ما'}</a></li>
                <li><a href="#" className={`hover:text-white transition-colors ${fontClass}`}>{t('footer.ourCommunities') || 'جوامع ما'}</a></li>
              </ul>
            </div>

            {/* Help Column */}
            <div>
              <h4 className={`text-lg font-bold mb-6 ${fontClass}`}>{t('nav.help') || 'کمک'}</h4>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#" className={`hover:text-white transition-colors ${fontClass}`}>{t('nav.helpCenter') || 'مرکز کمک'}</a></li>
                <li><a href="#" className={`hover:text-white transition-colors ${fontClass}`}>{t('footer.travelUpdates') || 'به‌روزرسانی‌های سفر'}</a></li>
                <li><a href="#" className={`hover:text-white transition-colors ${fontClass}`}>{t('footer.specialAssistance') || 'کمک ویژه'}</a></li>
                <li><a href="#" className={`hover:text-white transition-colors ${fontClass}`}>{t('nav.faq') || 'سوالات متداول'}</a></li>
              </ul>
            </div>

            {/* Book Column */}
            <div>
              <h4 className={`text-lg font-bold mb-6 ${fontClass}`}>{t('nav.book') || 'رزرو'}</h4>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#" className={`hover:text-white transition-colors ${fontClass}`}>{t('nav.bookFlights') || 'رزرو پرواز'}</a></li>
                <li><a href="#" className={`hover:text-white transition-colors ${fontClass}`}>{t('footer.travelServices') || 'خدمات سفر'}</a></li>
                <li><a href="#" className={`hover:text-white transition-colors ${fontClass}`}>{t('footer.transportation') || 'حمل و نقل'}</a></li>
                <li><a href="#" className={`hover:text-white transition-colors ${fontClass}`}>{t('footer.planningTrip') || 'برنامه‌ریزی سفر'}</a></li>
              </ul>
            </div>

            {/* Manage Column */}
            <div>
              <h4 className={`text-lg font-bold mb-6 ${fontClass}`}>{t('nav.manage') || 'مدیریت'}</h4>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#" className={`hover:text-white transition-colors ${fontClass}`}>{t('nav.checkIn') || 'چک این'}</a></li>
                <li><a href="#" className={`hover:text-white transition-colors ${fontClass}`}>{t('nav.manageBooking') || 'مدیریت رزرو'}</a></li>
                <li><a href="#" className={`hover:text-white transition-colors ${fontClass}`}>{t('footer.chauffeurDrive') || 'راننده شخصی'}</a></li>
                <li><a href="#" className={`hover:text-white transition-colors ${fontClass}`}>{t('nav.flightStatus') || 'وضعیت پرواز'}</a></li>
              </ul>
            </div>
          </div>
          <div className={`border-t border-gray-700 mt-12 pt-8 text-center text-gray-400 ${fontClass}`}>
            <p>&copy; 2024 {t('common.nasimAir')} {t('footer.copyright') || 'تمام حقوق محفوظ است'}.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default HomePage;
