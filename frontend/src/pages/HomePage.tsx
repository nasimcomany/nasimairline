import React, { useState, useEffect } from 'react';
import GlassmorphismHeader from '../components/Layout/GlassmorphismHeader';
import FlightSearchForm from '../components/FlightSearch/FlightSearchForm';
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('general');

  // Flight Search state
  const [tripType, setTripType] = useState<'round' | 'oneway' | 'multi'>('round');
  const [from, setFrom] = useState('تهران (THR)');
  const [to, setTo] = useState('دبی (DXB)');
  const [departDate, setDepartDate] = useState('2024-01-15');
  const [returnDate, setReturnDate] = useState('2024-01-22');
  const [priceRange, setPriceRange] = useState([200, 1200]);
  const [passengers, setPassengers] = useState('2 بزرگسال، 1 کودک');

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
    from: 'تهران (THR)',
    to: 'دبی (DXB)',
    date: '2024-01-15',
    passengers: '2 بزرگسال، 1 کودک',
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

  const features = [
    {
      icon: PaperAirplaneIcon,
      title: 'پروازهای متنوع',
      description: 'انتخاب از بین هزاران پرواز داخلی و بین‌المللی',
      gradient: 'from-blue-500 to-cyan-500',
      delay: '0ms'
    },
    {
      icon: BuildingOfficeIcon,
      title: 'رزرو هتل',
      description: 'رزرو هتل در تمام مقاصد با بهترین قیمت',
      gradient: 'from-purple-500 to-pink-500',
      delay: '100ms'
    },
    {
      icon: GiftIcon,
      title: 'پکیج‌های ویژه',
      description: 'پکیج‌های سفر کامل با تخفیف‌های ویژه',
      gradient: 'from-emerald-500 to-teal-500',
      delay: '200ms'
    },
    {
      icon: ShieldCheckIcon,
      title: 'امنیت بالا',
      description: 'پرداخت امن و اطلاعات محافظت شده',
      gradient: 'from-amber-500 to-orange-500',
      delay: '300ms'
    },
    {
      icon: ClockIcon,
      title: 'پشتیبانی 24/7',
      description: 'پشتیبانی آنلاین در تمام ساعات شبانه‌روز',
      gradient: 'from-red-500 to-rose-500',
      delay: '400ms'
    },
    {
      icon: UserGroupIcon,
      title: 'برنامه وفاداری',
      description: 'کسب امتیاز و استفاده از مزایای ویژه',
      gradient: 'from-indigo-500 to-blue-500',
      delay: '500ms'
    }
  ];

  // Destinations data
  const destinations = [
    {
      id: 1,
      name: 'تهران',
      description: 'پایتخت ایران',
      country: 'ایران',
      flights: 'پرواز روزانه',
      price: 'از $120',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      gradient: 'from-blue-500 to-blue-700'
    },
    {
      id: 2,
      name: 'مشهد',
      description: 'شهر مقدس',
      country: 'ایران',
      flights: 'پرواز روزانه',
      price: 'از $95',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      gradient: 'from-orange-500 to-orange-700'
    },
    {
      id: 3,
      name: 'شیراز',
      description: 'شهر شعر و هنر',
      country: 'ایران',
      flights: 'پرواز روزانه',
      price: 'از $110',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      gradient: 'from-pink-500 to-pink-700'
    },
    {
      id: 4,
      name: 'دبی',
      description: 'شهر طلایی',
      country: 'امارات',
      flights: 'پرواز روزانه',
      price: 'از $280',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop',
      gradient: 'from-yellow-500 to-yellow-700'
    },
    {
      id: 5,
      name: 'استانبول',
      description: 'شهر دو قاره',
      country: 'ترکیه',
      flights: 'پرواز روزانه',
      price: 'از $320',
      image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&h=300&fit=crop',
      gradient: 'from-purple-500 to-purple-700'
    },
    {
      id: 6,
      name: 'پاریس',
      description: 'شهر عشق',
      country: 'فرانسه',
      flights: 'پرواز هفتگی',
      price: 'از $450',
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop',
      gradient: 'from-indigo-500 to-indigo-700'
    }
  ];

  // Services data
  const services = [
    {
      id: 1,
      title: 'پروازهای داخلی',
      description: 'پرواز به تمام شهرهای ایران با بهترین قیمت و کیفیت',
      icon: PaperAirplaneIcon,
      gradient: 'from-blue-500 to-blue-700',
      features: ['پرواز روزانه', 'قیمت مناسب', 'امنیت بالا']
    },
    {
      id: 2,
      title: 'پروازهای خارجی',
      description: 'پرواز به مقاصد بین‌المللی محبوب در سراسر جهان',
      icon: GlobeAltIcon,
      gradient: 'from-green-500 to-green-700',
      features: ['مقاصد متنوع', 'پرواز مستقیم', 'خدمات بین‌المللی']
    },
    {
      id: 3,
      title: 'خدمات VIP',
      description: 'خدمات ویژه و لوکس برای مسافران ممتاز',
      icon: StarIcon,
      gradient: 'from-purple-500 to-purple-700',
      features: ['لانژ اختصاصی', 'خدمات شخصی', 'راحتی بیشتر']
    },
    {
      id: 4,
      title: 'رزرو هتل',
      description: 'رزرو هتل در تمام مقاصد با بهترین قیمت',
      icon: BuildingOfficeIcon,
      gradient: 'from-orange-500 to-orange-700',
      features: ['هتل‌های لوکس', 'قیمت رقابتی', 'رزرو آسان']
    },
    {
      id: 5,
      title: 'پکیج‌های سفر',
      description: 'پکیج‌های کامل سفر با تخفیف‌های ویژه',
      icon: GiftIcon,
      gradient: 'from-pink-500 to-pink-700',
      features: ['تخفیف ویژه', 'پکیج کامل', 'صرفه‌جویی']
    },
    {
      id: 6,
      title: 'بیمه مسافرتی',
      description: 'بیمه کامل برای امنیت سفر شما',
      icon: ShieldCheckIcon,
      gradient: 'from-red-500 to-red-700',
      features: ['پوشش کامل', 'پرداخت سریع', 'پشتیبانی 24/7']
    },
    {
      id: 7,
      title: 'بار اضافی',
      description: 'خدمات بار اضافی با قیمت مناسب',
      icon: TruckIcon,
      gradient: 'from-indigo-500 to-indigo-700',
      features: ['ظرفیت بیشتر', 'قیمت مناسب', 'امنیت بار']
    },
    {
      id: 8,
      title: 'اینترنت رایگان',
      description: 'دسترسی به اینترنت رایگان در تمام پروازها',
      icon: WifiIcon,
      gradient: 'from-teal-500 to-teal-700',
      features: ['سرعت بالا', 'رایگان', 'بدون محدودیت']
    },
    {
      id: 9,
      title: 'پشتیبانی 24/7',
      description: 'پشتیبانی آنلاین در تمام ساعات شبانه‌روز',
      icon: ClockIcon,
      gradient: 'from-yellow-500 to-yellow-700',
      features: ['همیشه در دسترس', 'پاسخ سریع', 'حل مشکل']
    }
  ];

  // Offers data
  const offers = [
    {
      id: 1,
      title: 'تخفیف ۵۰٪',
      description: 'برای سفرهای داخلی با بهترین قیمت',
      icon: FireIcon,
      gradient: 'from-red-500 to-red-700',
      discount: '50%',
      originalPrice: '$200',
      newPrice: '$100',
      validUntil: 'تا پایان ماه',
      features: ['پرواز داخلی', 'قیمت مناسب', 'تخفیف ویژه']
    },
    {
      id: 2,
      title: 'پکیج خانوادگی',
      description: 'سفر برای ۴ نفر با صرفه‌جویی فوق‌العاده',
      icon: UserGroupIcon,
      gradient: 'from-pink-500 to-pink-700',
      discount: '30%',
      originalPrice: '$800',
      newPrice: '$560',
      validUntil: 'تا ۱۵ روز',
      features: ['۴ نفر', 'صرفه‌جویی', 'پکیج کامل']
    },
    {
      id: 3,
      title: 'پرواز زودهنگام',
      description: 'رزرو تا ۳ ماه قبل و دریافت تخفیف',
      icon: CalendarDaysIcon,
      gradient: 'from-blue-500 to-blue-700',
      discount: '25%',
      originalPrice: '$400',
      newPrice: '$300',
      validUntil: 'تا ۳ ماه',
      features: ['رزرو زودهنگام', 'تخفیف ویژه', 'برنامه‌ریزی']
    },
    {
      id: 4,
      title: 'پیشنهاد آخر هفته',
      description: 'سفرهای آخر هفته با قیمت ویژه',
      icon: SparklesIcon,
      gradient: 'from-purple-500 to-purple-700',
      discount: '40%',
      originalPrice: '$300',
      newPrice: '$180',
      validUntil: 'فقط آخر هفته',
      features: ['آخر هفته', 'قیمت ویژه', 'سریع']
    },
    {
      id: 5,
      title: 'پیشنهاد دانشجویی',
      description: 'تخفیف ویژه برای دانشجویان',
      icon: StarIcon,
      gradient: 'from-green-500 to-green-700',
      discount: '35%',
      originalPrice: '$250',
      newPrice: '$162',
      validUntil: 'همیشه',
      features: ['دانشجویی', 'تخفیف دائمی', 'کارت دانشجویی']
    },
    {
      id: 6,
      title: 'پیشنهاد عاشقانه',
      description: 'سفرهای دونفره با تخفیف ویژه',
      icon: HeartIcon,
      gradient: 'from-rose-500 to-rose-700',
      discount: '20%',
      originalPrice: '$500',
      newPrice: '$400',
      validUntil: 'تا ۱۰ روز',
      features: ['دونفره', 'رمانتیک', 'تخفیف ویژه']
    }
  ];

  // Gallery data
  const galleryImages = [
    {
      id: 1,
      title: 'هواپیمای مدرن',
      description: 'ناوگان هوایی پیشرفته و مدرن',
      image: '/images/airport-plane-photo_991869-62.jpg',
      category: 'هواپیما'
    },
    {
      id: 2,
      title: 'پرواز در شب',
      description: 'پرواز زیبا در آسمان شب',
      image: '/images/airplane-clouds-night_864588-19786.jpg',
      category: 'پرواز'
    },
    {
      id: 3,
      title: 'آسمان آبی',
      description: 'پرواز در آسمان صاف و آبی',
      image: '/images/skyward-soar-airplane-flying-blue-sky-clouds_391229-21566.jpg',
      category: 'آسمان'
    },
    {
      id: 4,
      title: 'فرودگاه شبانه',
      description: 'فرودگاه زیبا در شب بارانی',
      image: '/images/sheremetyevo-airport-view-in-rainy-evening-moscow-free-video.jpg',
      category: 'فرودگاه'
    },
    {
      id: 5,
      title: 'منظره هوایی',
      description: 'منظره زیبای شهر از بالا',
      image: '/images/360_F_600352190_78zb8hHbSeQdHtfGQliVRtHXEEXcvtHf.jpg',
      category: 'منظره'
    },
    {
      id: 6,
      title: 'شهر زیبا',
      description: 'تصویر زیبای شهر در شب',
      image: '/images/1697200583302.jpg',
      category: 'شهر'
    }
  ];

  // News data
  const newsItems = [
    {
      id: 1,
      title: 'افتتاح مسیر جدید',
      description: 'راه‌اندازی پروازهای جدید به شهرهای مختلف با بهترین قیمت و کیفیت',
      author: 'تیم تحریریه',
      date: '۲ روز پیش',
      category: 'مسیرهای جدید',
      icon: GlobeAltIcon,
      gradient: 'from-blue-500 to-blue-700',
      image: '/images/airport-plane-photo_991869-62.jpg',
      readTime: '۳ دقیقه'
    },
    {
      id: 2,
      title: 'خدمات جدید',
      description: 'ارائه خدمات ویژه و لوکس به مسافران با بالاترین استانداردها',
      author: 'مدیریت خدمات',
      date: '۱ هفته پیش',
      category: 'خدمات',
      icon: SparklesIcon,
      gradient: 'from-green-500 to-green-700',
      image: '/images/airplane-clouds-night_864588-19786.jpg',
      readTime: '۴ دقیقه'
    },
    {
      id: 3,
      title: 'تخفیف‌های ویژه',
      description: 'فرصت‌های طلایی برای سفر با تخفیف‌های فوق‌العاده',
      author: 'تیم بازاریابی',
      date: '۲ هفته پیش',
      category: 'تخفیف',
      icon: GiftIcon,
      gradient: 'from-purple-500 to-purple-700',
      image: '/images/skyward-soar-airplane-flying-blue-sky-clouds_391229-21566.jpg',
      readTime: '۲ دقیقه'
    }
  ];

  // Membership data
  const membershipTiers = [
    {
      id: 1,
      name: 'عضو برنزی',
      description: 'مزایای پایه برای شروع سفر',
      icon: StarIcon,
      gradient: 'from-amber-500 to-amber-700',
      price: 'رایگان',
      points: '0 امتیاز',
      features: ['رزرو آنلاین', 'اطلاع‌رسانی پرواز', 'پشتیبانی پایه', 'تخفیف ۵٪'],
      benefits: ['رایگان', 'شروع آسان', 'مزایای پایه']
    },
    {
      id: 2,
      name: 'عضو نقره‌ای',
      description: 'مزایای ویژه برای مسافران منظم',
      icon: GiftIcon,
      gradient: 'from-gray-500 to-gray-700',
      price: '۱۰۰۰ امتیاز',
      points: '1000 امتیاز',
      features: ['همه مزایای برنزی', 'تخفیف ۱۰٪', 'اولویت رزرو', 'بار اضافی رایگان', 'لانژ دسترسی'],
      benefits: ['مزایای ویژه', 'تخفیف بیشتر', 'اولویت']
    },
    {
      id: 3,
      name: 'عضو طلایی',
      description: 'مزایای ممتاز برای مسافران VIP',
      icon: TrophyIcon,
      gradient: 'from-yellow-500 to-yellow-700',
      price: '۵۰۰۰ امتیاز',
      points: '5000 امتیاز',
      features: ['همه مزایای نقره‌ای', 'تخفیف ۲۰٪', 'لانژ اختصاصی', 'خدمات شخصی', 'ارتقاء رایگان', 'اینترنت رایگان'],
      benefits: ['VIP', 'مزایای کامل', 'خدمات شخصی']
    }
  ];

  // Support data
  const supportMethods = [
    {
      id: 1,
      title: 'تماس تلفنی',
      description: '۲۴ ساعته در خدمت شما',
      contact: '۰۲۱-۱۲۳۴۵۶۷۸',
      icon: PhoneIcon,
      gradient: 'from-blue-500 to-blue-700',
      availability: '۲۴/۷',
      responseTime: 'فوری'
    },
    {
      id: 2,
      title: 'ایمیل',
      description: 'پاسخ در کمتر از ۲ ساعت',
      contact: 'support@nasimair.com',
      icon: EnvelopeIcon,
      gradient: 'from-green-500 to-green-700',
      availability: '۲۴/۷',
      responseTime: 'کمتر از ۲ ساعت'
    },
    {
      id: 3,
      title: 'چت آنلاین',
      description: 'پشتیبانی فوری و آنلاین',
      contact: 'آنلاین',
      icon: ChatBubbleLeftRightIcon,
      gradient: 'from-purple-500 to-purple-700',
      availability: '۲۴/۷',
      responseTime: 'فوری'
    }
  ];

  const faqCategories = [
    { id: 'general', name: 'عمومی', icon: QuestionMarkCircleIcon },
    { id: 'booking', name: 'رزرو', icon: DocumentTextIcon },
    { id: 'flight', name: 'پرواز', icon: GlobeAltIcon },
    { id: 'payment', name: 'پرداخت', icon: CheckCircleIcon }
  ];

  const faqs = {
    general: [
      { question: 'چگونه می‌توانم بلیط خود را لغو کنم؟', answer: 'می‌توانید از طریق پنل کاربری یا تماس با پشتیبانی بلیط خود را لغو کنید.' },
      { question: 'آیا امکان تغییر تاریخ پرواز وجود دارد؟', answer: 'بله، با توجه به شرایط بلیط می‌توانید تاریخ پرواز را تغییر دهید.' }
    ],
    booking: [
      { question: 'چگونه بلیط رزرو کنم؟', answer: 'از طریق فرم جستجو در صفحه اصلی می‌توانید بلیط مورد نظر خود را رزرو کنید.' },
      { question: 'آیا امکان رزرو گروهی وجود دارد؟', answer: 'بله، برای رزرو گروهی با پشتیبانی تماس بگیرید.' }
    ],
    flight: [
      { question: 'چه مدارکی برای پرواز نیاز دارم؟', answer: 'کارت ملی یا پاسپورت معتبر برای پروازهای داخلی و بین‌المللی.' },
      { question: 'آیا امکان انتخاب صندلی وجود دارد؟', answer: 'بله، در زمان رزرو می‌توانید صندلی مورد نظر خود را انتخاب کنید.' }
    ],
    payment: [
      { question: 'چه روش‌های پرداختی پشتیبانی می‌شود؟', answer: 'کارت‌های بانکی، پرداخت آنلاین و پرداخت در فرودگاه.' },
      { question: 'آیا پرداخت امن است؟', answer: 'بله، تمام پرداخت‌ها با بالاترین استانداردهای امنیتی انجام می‌شود.' }
    ]
  };

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
    <div className="min-h-screen relative overflow-hidden">
      {/* Background image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
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

      <GlassmorphismHeader />

      {/* Booking Section */}
      <section id="booking" className="relative z-10 pt-24 pb-8">
        <div className="max-w-3xl mx-auto px-6">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 persian-font-vazir">
              رزرو بلیط پرواز
            </h1>
            <p className="text-blue-200 text-sm persian-font-vazir">
              اطلاعات خود را تکمیل کنید تا رزرو شما نهایی شود
            </p>
          </div>

          {/* Booking form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
            
            {/* Flight Summary */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/30">
              <h3 className="text-white font-semibold mb-3 text-sm persian-font-vazir flex items-center gap-2">
                <MapPinIcon className="w-4 h-4" />
                خلاصه پرواز
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-blue-200 persian-font-vazir">مبدا:</span>
                  <span className="text-white mr-2 persian-font-vazir">{flightInfo.from}</span>
                </div>
                <div>
                  <span className="text-blue-200 persian-font-vazir">مقصد:</span>
                  <span className="text-white mr-2 persian-font-vazir">{flightInfo.to}</span>
                </div>
                <div>
                  <span className="text-blue-200 persian-font-vazir">تاریخ:</span>
                  <span className="text-white mr-2 persian-font-vazir">{flightInfo.date}</span>
                </div>
                <div>
                  <span className="text-blue-200 persian-font-vazir">مسافران:</span>
                  <span className="text-white mr-2 persian-font-vazir">{flightInfo.passengers}</span>
                </div>
              </div>
            </div>

            {/* Passenger Information */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-4 text-sm persian-font-vazir flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                اطلاعات مسافر
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-white font-medium mb-1.5 text-sm persian-font-vazir">
                    <UserIcon className="w-4 h-4" />
                    نام
                  </label>
                  <input
                    type="text"
                    value={passengerInfo.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-white/50 text-blue-900 placeholder-blue-600/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm persian-font-vazir"
                    placeholder="نام خود را وارد کنید"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-white font-medium mb-1.5 text-sm persian-font-vazir">
                    <UserIcon className="w-4 h-4" />
                    نام خانوادگی
                  </label>
                  <input
                    type="text"
                    value={passengerInfo.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-white/50 text-blue-900 placeholder-blue-600/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm persian-font-vazir"
                    placeholder="نام خانوادگی خود را وارد کنید"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-white font-medium mb-1.5 text-sm persian-font-vazir">
                    <UserIcon className="w-4 h-4" />
                    کد ملی
                  </label>
                  <input
                    type="text"
                    value={passengerInfo.nationalId}
                    onChange={(e) => handleInputChange('nationalId', e.target.value)}
                    className="w-full bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-white/50 text-blue-900 placeholder-blue-600/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm persian-font-vazir"
                    placeholder="کد ملی خود را وارد کنید"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-white font-medium mb-1.5 text-sm persian-font-vazir">
                    <EnvelopeIcon className="w-4 h-4" />
                    ایمیل
                  </label>
                  <input
                    type="email"
                    value={passengerInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-white/50 text-blue-900 placeholder-blue-600/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm persian-font-vazir"
                    placeholder="ایمیل خود را وارد کنید"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-white font-medium mb-1.5 text-sm persian-font-vazir">
                    <PhoneIcon className="w-4 h-4" />
                    شماره تلفن
                  </label>
                  <input
                    type="tel"
                    value={passengerInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-white/50 text-blue-900 placeholder-blue-600/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm persian-font-vazir"
                    placeholder="شماره تلفن خود را وارد کنید"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-white font-medium mb-1.5 text-sm persian-font-vazir">
                    <MapPinIcon className="w-4 h-4" />
                    آدرس
                  </label>
                  <input
                    type="text"
                    value={passengerInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-white/50 text-blue-900 placeholder-blue-600/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm persian-font-vazir"
                    placeholder="آدرس خود را وارد کنید"
                  />
                </div>
              </div>
            </div>

            {/* Seat Selection */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-4 text-sm persian-font-vazir flex items-center gap-2">
                <UserGroupIcon className="w-4 h-4" />
                انتخاب صندلی
              </h3>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white text-sm persian-font-vazir mb-1">
                      صندلی‌های انتخاب شده: {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'هیچ صندلی انتخاب نشده'}
                    </div>
                    {selectedSeats.length > 0 && (
                      <div className="text-blue-200 text-xs persian-font-vazir">
                        هزینه صندلی‌ها: ${selectedSeats.reduce((total, seat) => total + getSeatPrice(seat), 0)}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowSeatModal(true)}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl persian-font-vazir text-sm"
                    >
                      انتخاب صندلی
                    </button>
                    <button
                      onClick={() => setShow3DViewer(true)}
                      className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl persian-font-vazir text-sm"
                    >
                      مشاهده فضای سه‌بعدی
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Extras */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-4 text-sm persian-font-vazir flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4" />
                خدمات اضافی
              </h3>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={extras.insurance}
                    onChange={(e) => handleExtraChange('insurance', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-white/80 border-white/50 rounded focus:ring-blue-500/50"
                  />
                  <span className="text-white text-sm persian-font-vazir">بیمه مسافرتی (+$25)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={extras.extraBaggage}
                    onChange={(e) => handleExtraChange('extraBaggage', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-white/80 border-white/50 rounded focus:ring-blue-500/50"
                  />
                  <span className="text-white text-sm persian-font-vazir">بار اضافی (+$35)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={extras.meal}
                    onChange={(e) => handleExtraChange('meal', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-white/80 border-white/50 rounded focus:ring-blue-500/50"
                  />
                  <span className="text-white text-sm persian-font-vazir">غذای ویژه (+$15)</span>
                </label>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/30">
              <h3 className="text-white font-semibold mb-3 text-sm persian-font-vazir flex items-center gap-2">
                <CreditCardIcon className="w-4 h-4" />
                خلاصه پرداخت
              </h3>
                <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-blue-200 persian-font-vazir">بلیط پرواز:</span>
                  <span className="text-white persian-font-vazir">{flightInfo.price}</span>
                </div>
                {selectedSeats.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-blue-200 persian-font-vazir">هزینه صندلی‌ها:</span>
                    <span className="text-white persian-font-vazir">+${selectedSeats.reduce((total, seat) => total + getSeatPrice(seat), 0)}</span>
                  </div>
                )}
                {extras.insurance && (
                  <div className="flex justify-between">
                    <span className="text-blue-200 persian-font-vazir">بیمه مسافرتی:</span>
                    <span className="text-white persian-font-vazir">+$25</span>
                  </div>
                )}
                {extras.extraBaggage && (
                  <div className="flex justify-between">
                    <span className="text-blue-200 persian-font-vazir">بار اضافی:</span>
                    <span className="text-white persian-font-vazir">+$35</span>
                  </div>
                )}
                {extras.meal && (
                  <div className="flex justify-between">
                    <span className="text-blue-200 persian-font-vazir">غذای ویژه:</span>
                    <span className="text-white persian-font-vazir">+$15</span>
                  </div>
                )}
                <div className="border-t border-white/30 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-white font-semibold persian-font-vazir">مجموع:</span>
                    <span className="text-white font-semibold persian-font-vazir">
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
            <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl persian-font-vazir">
              تکمیل رزرو و پرداخت
            </button>
          </div>
        </div>
      </section>

      {/* Flight Search Section */}
      <section id="flights" className="relative z-10 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-1 persian-font-vazir">
              جستجوی پرواز
            </h2>
            <p className="text-blue-200 text-xs persian-font-vazir">
              جستجو و رزرو پروازهای داخلی و بین‌المللی
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
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
      </section>

      {/* Stats Section */}
      <section id="home" className="relative z-10 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            {[
              { number: '500+', label: 'مقصد', icon: GlobeAltIcon },
              { number: '1M+', label: 'مسافر راضی', icon: HeartIcon },
              { number: '24/7', label: 'پشتیبانی', icon: ClockIcon },
              { number: '99%', label: 'رضایت مشتری', icon: StarIcon }
            ].map((stat, index) => (
              <div
                key={index}
                className="group bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300"
              >
                <div className="p-6">
                  <div className="relative mb-4">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-3 mx-auto w-fit">
                      <stat.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl font-black text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-white/70 text-sm font-medium persian-font-vazir">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section id="destinations" className="relative z-10 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-1 persian-font-vazir">
              مقاصد پروازی
            </h2>
            <p className="text-blue-200 text-xs persian-font-vazir">
              مقاصد مختلف داخلی و خارجی نسیم ایر
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {destinations.map((destination) => (
              <div key={destination.id} className="group bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300 hover:scale-105">
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
                      <span className="text-white text-xs font-medium persian-font-vazir">{destination.country}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white persian-font-vazir">
                      {destination.name}
                    </h3>
                    <div className="text-white/60 text-xs persian-font-vazir">
                      {destination.flights}
                    </div>
                  </div>
                  <p className="text-white/70 text-sm mb-3 persian-font-vazir">
                    {destination.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-white font-semibold text-sm persian-font-vazir">
                      {destination.price}
                    </div>
                    <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-1.5 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl persian-font-vazir text-xs">
                      مشاهده
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Section */}
      <section id="membership" className="relative z-10 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-1 persian-font-vazir">
              برنامه عضویت
            </h2>
            <p className="text-blue-200 text-xs persian-font-vazir">
              مزایای عضویت در باشگاه نسیم ایر
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
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full persian-font-vazir">
                      محبوب
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-1 persian-font-vazir">
                    {tier.name}
                  </h3>
                  <p className="text-white/70 text-sm mb-3 persian-font-vazir">
                    {tier.description}
                  </p>
                  <div className="text-center mb-4">
                    <div className="text-white font-bold text-xl persian-font-vazir">
                      {tier.price}
                    </div>
                    <div className="text-white/60 text-xs persian-font-vazir">
                      {tier.points}
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircleIcon className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span className="text-white/70 text-xs persian-font-vazir">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {tier.benefits.map((benefit, idx) => (
                      <span key={idx} className="bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs persian-font-vazir">
                        {benefit}
                      </span>
                    ))}
                  </div>
                  <button className={`w-full font-medium py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl persian-font-vazir text-xs ${
                    tier.id === 1 
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white' 
                      : tier.id === 2
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                      : 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white'
                  }`}>
                    {tier.id === 1 ? 'عضویت رایگان' : 'ارتقاء عضویت'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="relative z-10 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-1 persian-font-vazir">
              خدمات ما
            </h2>
            <p className="text-blue-200 text-xs persian-font-vazir">
              خدمات متنوع و باکیفیت هواپیمایی نسیم ایر
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
                  <h3 className="text-lg font-semibold text-white mb-2 persian-font-vazir">
                    {service.title}
                  </h3>
                  <p className="text-white/70 text-sm mb-3 persian-font-vazir">
                    {service.description}
                  </p>
                  <div className="space-y-1 mb-3">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                        <span className="text-white/60 text-xs persian-font-vazir">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl persian-font-vazir text-xs">
                    اطلاعات بیشتر
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offers Section */}
      <section id="offers" className="relative z-10 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-1 persian-font-vazir">
              پیشنهادات ویژه
            </h2>
            <p className="text-blue-200 text-xs persian-font-vazir">
              تخفیف‌ها و پیشنهادات جذاب نسیم ایر
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {offers.map((offer) => (
              <div key={offer.id} className="group bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className="absolute top-2 right-2 z-10">
                  <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-1 rounded-full persian-font-vazir">
                    {offer.discount} تخفیف
                  </div>
                </div>
                <div className={`h-20 bg-gradient-to-r ${offer.gradient} flex items-center justify-center relative`}>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                    <offer.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2 persian-font-vazir">
                    {offer.title}
                  </h3>
                  <p className="text-white/70 text-sm mb-3 persian-font-vazir">
                    {offer.description}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-white/50 text-sm line-through persian-font-vazir">
                      {offer.originalPrice}
                    </span>
                    <span className="text-white font-bold text-lg persian-font-vazir">
                      {offer.newPrice}
                    </span>
                  </div>
                  <div className="space-y-1 mb-3">
                    {offer.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                        <span className="text-white/60 text-xs persian-font-vazir">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    <ClockIcon className="h-3 w-3 text-yellow-400" />
                    <span className="text-yellow-400 text-xs persian-font-vazir">
                      {offer.validUntil}
                    </span>
                  </div>
                  <button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl persian-font-vazir text-xs">
                    استفاده از پیشنهاد
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="relative z-10 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-1 persian-font-vazir">
              گالری تصاویر
            </h2>
            <p className="text-blue-200 text-xs persian-font-vazir">
              تصاویر زیبا از هواپیماها و خدمات ما
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
                      <span className="text-white text-xs font-medium persian-font-vazir">{item.category}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-1 persian-font-vazir">
                    {item.title}
                  </h3>
                  <p className="text-white/70 text-sm persian-font-vazir">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section id="news" className="relative z-10 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-1 persian-font-vazir">
              اخبار هواپیمایی
            </h2>
            <p className="text-blue-200 text-xs persian-font-vazir">
              آخرین اخبار و رویدادهای نسیم ایر
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
                      <span className="text-white text-xs font-medium persian-font-vazir">{news.category}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-1.5">
                      <news.icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2 persian-font-vazir">
                    {news.title}
                  </h3>
                  <p className="text-white/70 text-sm mb-3 persian-font-vazir">
                    {news.description}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-3 w-3 text-white/60" />
                      <span className="text-white/60 text-xs persian-font-vazir">{news.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-3 w-3 text-white/60" />
                      <span className="text-white/60 text-xs persian-font-vazir">{news.readTime}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    <CalendarDaysIcon className="h-3 w-3 text-yellow-400" />
                    <span className="text-yellow-400 text-xs persian-font-vazir">
                      {news.date}
                    </span>
                  </div>
                  <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl persian-font-vazir text-xs">
                    مطالعه بیشتر
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
            <h2 className="text-2xl font-bold text-white mb-1 persian-font-vazir">
              پشتیبانی مشتریان
            </h2>
            <p className="text-blue-200 text-xs persian-font-vazir">
              راه‌های ارتباط با تیم پشتیبانی نسیم ایر
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
                  <h3 className="text-lg font-semibold text-white mb-2 persian-font-vazir">
                    {method.title}
                  </h3>
                  <p className="text-white/70 text-sm mb-3 persian-font-vazir">
                    {method.description}
                  </p>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-3">
                    <div className="text-white font-bold text-lg persian-font-vazir">
                      {method.contact}
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-xs persian-font-vazir">دسترسی:</span>
                      <span className="text-green-400 text-xs persian-font-vazir">{method.availability}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-xs persian-font-vazir">زمان پاسخ:</span>
                      <span className="text-blue-400 text-xs persian-font-vazir">{method.responseTime}</span>
                    </div>
                  </div>
                  <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl persian-font-vazir text-xs">
                    تماس بگیرید
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="text-center mb-6 mt-12">
            <h2 className="text-xl font-bold text-white mb-2 persian-font-vazir">
              سوالات متداول
            </h2>
            <p className="text-blue-200 text-sm persian-font-vazir">
              پاسخ سوالات رایج شما
            </p>
          </div>

          {/* FAQ Categories */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {faqCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 persian-font-vazir ${
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
                    <h3 className="text-white font-semibold mb-2 persian-font-vazir">
                      {faq.question}
                    </h3>
                    <p className="text-white/70 text-sm persian-font-vazir">
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
              <h2 className="text-2xl font-bold text-white mb-2 persian-font-vazir">انتخاب صندلی</h2>
              <p className="text-blue-200 text-sm persian-font-vazir">صندلی‌های دلخواه خود را انتخاب کنید</p>
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
              <button onClick={() => setShowSeatModal(false)} className="bg-slate-600 text-white px-6 py-3 rounded-lg persian-font-vazir">لغو</button>
              <button onClick={() => setShowSeatModal(false)} className="bg-blue-600 text-white px-6 py-3 rounded-lg persian-font-vazir">تأیید</button>
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
              <h2 className="text-2xl font-bold text-white mb-2 persian-font-vazir">مشاهده فضای سه‌بعدی کابین</h2>
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
              <button onClick={() => setShow3DViewer(false)} className="bg-slate-600 text-white px-6 py-3 rounded-lg persian-font-vazir">بستن</button>
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

      {/* Footer */}
      <footer className="relative z-10 bg-black/50 backdrop-blur-xl border-t border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <img 
                  src="/images/favpng_9ba01589d5c7c5e413ee0b9efe7bd497.png" 
                  alt="نسیم ایر" 
                  className="w-12 h-12 object-contain"
                />
                <div className="text-white">
                  <div className="text-lg font-medium persian-font-vazir text-white">
                    نسیم ایر
                  </div>
                  <div className="text-xs text-blue-200 font-light tracking-wider persian-font-vazir">
                    NASIM AIR
                  </div>
                </div>
              </div>
              <p className="text-white/70 leading-relaxed persian-font-vazir">
                بهترین خدمات سفر با بالاترین کیفیت و امنیت در سطح بین‌المللی
              </p>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-6 text-white persian-font-vazir">خدمات</h4>
              <ul className="space-y-3 text-white/70">
                <li><span className="hover:text-blue-400 transition-colors cursor-pointer persian-font-vazir">پروازهای داخلی</span></li>
                <li><span className="hover:text-blue-400 transition-colors cursor-pointer persian-font-vazir">پروازهای بین‌المللی</span></li>
                <li><span className="hover:text-blue-400 transition-colors cursor-pointer persian-font-vazir">رزرو هتل</span></li>
                <li><span className="hover:text-blue-400 transition-colors cursor-pointer persian-font-vazir">پکیج‌های سفر</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-6 text-white persian-font-vazir">پشتیبانی</h4>
              <ul className="space-y-3 text-white/70">
                <li><span className="hover:text-blue-400 transition-colors cursor-pointer persian-font-vazir">مرکز راهنمایی</span></li>
                <li><span className="hover:text-blue-400 transition-colors cursor-pointer persian-font-vazir">تماس با ما</span></li>
                <li><span className="hover:text-blue-400 transition-colors cursor-pointer persian-font-vazir">سوالات متداول</span></li>
                <li><span className="hover:text-blue-400 transition-colors cursor-pointer persian-font-vazir">شرایط و قوانین</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-6 text-white persian-font-vazir">تماس با ما</h4>
              <div className="space-y-3 text-white/70 persian-font-vazir">
                <p>📞 تلفن: 021-12345678</p>
                <p>✉️ ایمیل: info@nasimbehesht.com</p>
                <p>📍 آدرس: تهران، خیابان ولیعصر</p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-white/50 persian-font-vazir">
            <p>&copy; 2024 نسیم ایر ایرلاین. تمامی حقوق محفوظ است.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default HomePage;
