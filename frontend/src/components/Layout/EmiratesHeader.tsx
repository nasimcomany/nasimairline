import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { 
  Bars3Icon, 
  XMarkIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  TicketIcon,
  ClipboardDocumentIcon,
  SparklesIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  QuestionMarkCircleIcon,
  PaperAirplaneIcon,
  CalendarDaysIcon,
  GiftIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  HeartIcon,
  StarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  TrophyIcon,
  CloudIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  GlobeAltIcon,
  UserIcon,
  UserPlusIcon,
  NewspaperIcon,
  PhotoIcon,
  WalletIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import AuthModal from '../Auth/AuthModal';
import StaffLoginModal from '../Auth/StaffLoginModal';

interface EmiratesHeaderProps {
  onWeatherClick?: () => void;
}

const EmiratesHeader: React.FC<EmiratesHeaderProps> = ({ onWeatherClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
  const [hoveredSubItem, setHoveredSubItem] = useState<{key: string, index: number} | null>(null);
  const [hoveredNestedPath, setHoveredNestedPath] = useState<number[]>([]); // e.g. [2] for مسافرین ویژه, [2,1] for درخواست ولیچر
  const [selectedDestinationIndex, setSelectedDestinationIndex] = useState<number | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isStaffLoginModalOpen, setIsStaffLoginModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const languageDropdownTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const loginDropdownTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const userDropdownTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const menuDropdownTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const whereweflyTriggerRef = useRef<HTMLDivElement | null>(null);
  const [whereweflyDropdownStyle, setWhereweflyDropdownStyle] = useState<{ top: number; left: number; width: number } | null>(null);
  const [flyDescModal, setFlyDescModal] = useState<{ title: string; descKey: string } | null>(null);
  const [aboutModal, setAboutModal] = useState<{ type: 'desc'; title: string; descKey: string } | { type: 'contact' } | null>(null);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { language, t, fontClass, setLanguage } = useLanguage();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  // Parse flatten path like "2-1" to { parentIndex: 2, childIndex: 1 }
  const parseFlattenPath = (path: string): { parentIndex: number; childIndex?: number } => {
    const parts = path.split('-').map(Number);
    return parts.length === 1 ? { parentIndex: parts[0] } : { parentIndex: parts[0], childIndex: parts[1] };
  };

  // Get description key for flyWithNasim menu items (for modal display)
  const getFlyDescKey = (parentIndex: number, childIndex?: number): string | null => {
    if (parentIndex === 0) return 'flyWithNasim.desc.checkInTime';
    if (parentIndex === 1) return 'flyWithNasim.desc.unacceptablePassengers';
    if (parentIndex === 2 && childIndex !== undefined) {
      if (childIndex === 0) return null; // seatSelection - goes to search form
      if (childIndex === 1) return 'flyWithNasim.desc.wheelchairRequest';
    }
    if (parentIndex === 3) return 'flyWithNasim.desc.refund';
    if (parentIndex === 4 && childIndex !== undefined) {
      const keys = ['flyWithNasim.desc.passengerBaggage', 'flyWithNasim.desc.carryOnAcceptance', 'flyWithNasim.desc.prohibitedItems', 'flyWithNasim.desc.excessBaggage'];
      return keys[childIndex] || null;
    }
    return null;
  };

  // Get modal config for about menu items (index: 0=history, 1=fleet/nav, 2=contact, 3=coop, 4=training, 5=magazine)
  const getAboutModalConfig = (index: number, label: string): { type: 'desc'; title: string; descKey: string } | { type: 'contact' } | null => {
    if (index === 2) return { type: 'contact' };
    if (index === 0) return { type: 'desc', title: label, descKey: 'about.desc.nasimHistory' };
    if (index === 3) return { type: 'desc', title: label, descKey: 'about.desc.cooperationRequest' };
    if (index === 4) return { type: 'desc', title: label, descKey: 'about.desc.nasimTraining' };
    return null; // index 1 (fleet) and 5 (magazine) navigate, no modal
  };

  // Get default image for each menu category
  const getDefaultImage = (key: string, subItemIndex?: number) => {
    const images: Record<string, string[]> = {
      'flyWithNasim': [
        '/images/airplane-clouds-night_864588-19786.jpg',
        '/images/airport-crew.jpg',
        '/images/skyward-soar-airplane-flying-blue-sky-clouds_391229-21566.jpg',
        '/images/collection-of-aerospace-and-aviation-website-templates-vayudoot-aviation.jpeg'
      ],
      'wherewefly': [
        '/images/skyward-soar-airplane-flying-blue-sky-clouds_391229-21566.jpg',
        '/images/airplane-clouds-night_864588-19786.jpg',
        '/images/airport-crew.jpg',
        '/images/collection-of-aerospace-and-aviation-website-templates-vayudoot-aviation.jpeg'
      ],
      'about': [
        '/images/airport-crew.jpg',
        '/images/airplane-clouds-night_864588-19786.jpg',
        '/images/airport-plane-photo_991869-62.jpg',
        '/images/collection-of-aerospace-and-aviation-website-templates-vayudoot-aviation.jpeg'
      ],
      'safetyReport': [
        '/images/airplane-clouds-night_864588-19786.jpg'
      ],
      'help': [
        '/images/airplane-clouds-night_864588-19786.jpg',
        '/images/airport-crew.jpg',
        '/images/skyward-soar-airplane-flying-blue-sky-clouds_391229-21566.jpg',
        '/images/airport-plane-photo_991869-62.jpg'
      ]
    };
    
    if (subItemIndex !== undefined && images[key] && images[key][subItemIndex]) {
      return images[key][subItemIndex];
    }
    return images[key]?.[0] || '/images/airplane-clouds-night_864588-19786.jpg';
  };

  // Get multiple destination images with names for wherewefly dropdown
  const getDestinationImages = (subItemIndex?: number): Array<{image: string, name: string}> => {
    const destinationData: Record<number, Array<{image: string, name: string}>> = {
      0: [ // مقاصد داخلی
        { image: '/images/tehran.jpg', name: language === 'fa' ? 'تهران' : language === 'ar' ? 'طهران' : 'Tehran' },
        { image: '/images/mashhad.jpeg', name: language === 'fa' ? 'مشهد' : language === 'ar' ? 'مشهد' : 'Mashhad' },
        { image: '/images/kish.jpg', name: language === 'fa' ? 'کیش' : language === 'ar' ? 'كيش' : 'Kish' },
        { image: '/images/abadan1.jpg', name: language === 'fa' ? 'آبادان' : language === 'ar' ? 'عبادان' : 'Abadan' },
        { image: '/images/tabriz.jpg', name: language === 'fa' ? 'تبریز' : language === 'ar' ? 'تبريز' : 'Tabriz' },
        { image: '/images/isfahan.jpg', name: language === 'fa' ? 'اصفهان' : language === 'ar' ? 'أصفهان' : 'Isfahan' }
      ],
      1: [ // مقاصد خارجی
        { image: '/images/360_F_600352190_78zb8hHbSeQdHtfGQliVRtHXEEXcvtHf.jpg', name: language === 'fa' ? 'دبی' : language === 'ar' ? 'دبي' : 'Dubai' },
        { image: '/images/skyward-soar-airplane-flying-blue-sky-clouds_391229-21566.jpg', name: language === 'fa' ? 'استانبول' : language === 'ar' ? 'إسطنبول' : 'Istanbul' },
        { image: '/images/airport-crew.jpg', name: language === 'fa' ? 'پاریس' : language === 'ar' ? 'باريس' : 'Paris' },
        { image: '/images/360_F_600352190_78zb8hHbSeQdHtfGQliVRtHXEEXcvtHf.jpg', name: language === 'fa' ? 'لندن' : language === 'ar' ? 'لندن' : 'London' },
        { image: '/images/skyward-soar-airplane-flying-blue-sky-clouds_391229-21566.jpg', name: language === 'fa' ? 'نیویورک' : language === 'ar' ? 'نيويورك' : 'New York' },
        { image: '/images/airport-crew.jpg', name: language === 'fa' ? 'توکیو' : language === 'ar' ? 'طوكيو' : 'Tokyo' }
      ],
      2: [ // همه مقاصد
        { image: '/images/tehran.jpg', name: language === 'fa' ? 'تهران' : language === 'ar' ? 'طهران' : 'Tehran' },
        { image: '/images/mashhad.jpeg', name: language === 'fa' ? 'مشهد' : language === 'ar' ? 'مشهد' : 'Mashhad' },
        { image: '/images/360_F_600352190_78zb8hHbSeQdHtfGQliVRtHXEEXcvtHf.jpg', name: language === 'fa' ? 'دبی' : language === 'ar' ? 'دبي' : 'Dubai' },
        { image: '/images/kish.jpg', name: language === 'fa' ? 'کیش' : language === 'ar' ? 'كيش' : 'Kish' },
        { image: '/images/skyward-soar-airplane-flying-blue-sky-clouds_391229-21566.jpg', name: language === 'fa' ? 'استانبول' : language === 'ar' ? 'إسطنبول' : 'Istanbul' },
        { image: '/images/isfahan.jpg', name: language === 'fa' ? 'اصفهان' : language === 'ar' ? 'أصفهان' : 'Isfahan' }
      ]
    };
    
    const index = subItemIndex !== undefined ? subItemIndex : 0;
    return destinationData[index] || destinationData[0];
  };

  type DropdownSubItem = { label: string; path: string; children?: DropdownSubItem[] };
  const menuItems: { key: string; label: string; path: string; dropdown: DropdownSubItem[] }[] = [
    {
      key: 'flyWithNasim',
      label: t('nav.flyWithNasim') || 'رزرو',
      path: '#',
      dropdown: [
        { label: t('nav.checkInTime') || 'زمان مراجعه و پذیرش', path: '#' },
        { label: t('nav.unacceptablePassengers') || 'مسافرین غیر قابل پذیرش', path: '#' },
        {
          label: t('nav.specialPassengers') || 'مسافرین ویژه',
          path: '#',
          children: [
            { label: t('nav.seatSelection') || 'انتخاب صندلی', path: '/#search-form' },
            { label: t('nav.wheelchairRequest') || 'درخواست ولیچر', path: '#' },
          ]
        },
        { label: t('nav.refund') || 'استرداد', path: '#' },
        {
          label: t('nav.baggage') || 'جامه دان',
          path: '#',
          children: [
            { label: t('nav.passengerBaggage') || 'بار همراه مسافر', path: '#' },
            { label: t('nav.carryOnAcceptance') || 'پذیرش بار همراه', path: '#' },
            { label: t('nav.prohibitedItems') || 'اقلام ممنوعه', path: '#' },
            { label: t('nav.excessBaggage') || 'اضافه بار', path: '#' },
          ]
        },
      ]
    },
    {
      key: 'wherewefly',
      label: t('nav.flightDestinations') || 'مقاصد',
      path: '#',
      dropdown: [
        { label: t('nav.domestic') || 'داخلی', path: '/flights/map' },
        { label: t('nav.international') || 'خارجی', path: '#' },
        { label: t('nav.allDestinations') || 'همه مقاصد', path: '/flights/map' },
      ]
    },
    {
      key: 'about',
      label: t('nav.about') || 'کمک',
      path: '#',
      dropdown: [
        { label: t('nav.nasimHistory') || 'تاریخچه نسیم', path: '#' },
        { label: t('nav.airlineFleet') || 'ناوگان هوایی', path: '/flights/map' },
        { label: t('nav.contactUs') || 'تماس با ما', path: '#' },
        { label: t('nav.cooperationRequest') || 'درخواست همکاری', path: '#' },
        { label: t('nav.nasimTraining') || 'آموزش نسیم', path: '#' },
        { label: t('nav.nasimMagazine') || 'مجله نسیم', path: '/magazine' },
        { label: t('nav.safetyHazardReport') || 'گزارش مخاطرات ایمنی (SHOR)', path: '/safety-report/safety' },
      ]
    },
  ];

  const handleMouseEnter = (key: string, hasDropdown: boolean) => {
    // Clear any pending timeout
    if (menuDropdownTimeoutRef.current) {
      clearTimeout(menuDropdownTimeoutRef.current);
      menuDropdownTimeoutRef.current = null;
    }
    
    if (hasDropdown) {
      setActiveDropdown(key);
    }
  };

  const handleMouseLeave = () => {
    // Add delay before closing dropdown
    menuDropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
      setSelectedDestinationIndex(null);
      setHoveredNestedPath([]);
    }, 200); // 200ms delay
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (languageDropdownTimeoutRef.current) {
        clearTimeout(languageDropdownTimeoutRef.current);
      }
      if (loginDropdownTimeoutRef.current) {
        clearTimeout(loginDropdownTimeoutRef.current);
      }
      if (menuDropdownTimeoutRef.current) {
        clearTimeout(menuDropdownTimeoutRef.current);
      }
    };
  }, []);

  // Handle scroll to collapse flag
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50); // Start collapsing after 50px scroll
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute wherewefly dropdown position for Portal (fixed, centered, never clipped)
  useEffect(() => {
    if (activeDropdown === 'wherewefly' && whereweflyTriggerRef.current) {
      const rect = whereweflyTriggerRef.current.getBoundingClientRect();
      const dropdownWidth = Math.min(1400, window.innerWidth - 48);
      const left = Math.max(24, Math.min(window.innerWidth - dropdownWidth - 24, rect.left + rect.width / 2 - dropdownWidth / 2));
      setWhereweflyDropdownStyle({ top: rect.bottom + 8, left, width: dropdownWidth });
    } else {
      setWhereweflyDropdownStyle(null);
    }
  }, [activeDropdown]);

  return (
    <header className="sticky top-0 z-50 relative" style={{ overflow: 'visible' }}>
      <div className="flex h-20 relative" style={{ overflow: 'visible' }}>
        {/* Dark Navigation Section - Glassmorphism */}
        <div className="flex-1 bg-gray-400/30 backdrop-blur-xl border-b border-gray-300/30 shadow-2xl flex items-center justify-between">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-center relative" style={{ overflow: 'visible' }}>

          {/* Logo with Blue Flag - در فارسی موازی با شروع رزرو پرواز (max-w-7xl + px-8) */}
          <div 
            className={`hidden lg:flex items-center absolute ${language === 'fa' ? '' : 'right-[215px]'}`}
            style={{ 
              ...(language === 'fa' ? { right: 'max(1.5rem, calc((100vw - 80rem) / 2 + 2rem))' } : {}),
              bottom: '-60px',
              transform: isScrolled ? 'translateY(-40px)' : 'translateY(0)',
              transition: 'transform 2.0s ease-in-out'
            }}
          >
            <Link to="/" className="flex items-center">
              <div 
                className="bg-blue-900 flex items-center justify-center"
                style={{ 
                  height: '120px',
                  paddingLeft: '25px',
                  paddingRight: '15px',
                  boxShadow: '2px 2px 8px rgba(0,0,0,0.2)',
                  zIndex: 60,
                  borderTopLeftRadius: '0',
                  borderTopRightRadius: '0',
                  borderBottomLeftRadius: '20px',
                  borderBottomRightRadius: '20px',
                  cursor: 'pointer'
                }}
              >
                <img 
                  src="/images/nasim0.png" 
                  alt="هواپیمایی نسیم" 
                  className="object-contain"
                  style={{ 
                    width: '130px',
                    height: 'auto',
                    maxWidth: '130px',
                    transform: 'translate(-10px, 20px) scale(1.27)'
                  }}
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - All items together and centered */}
          <nav className={`hidden lg:flex items-center justify-center h-full ${language === 'fa' ? 'space-x-3 space-x-reverse' : 'space-x-1 space-x-reverse'}`} style={{ overflow: 'visible' }}>
            {menuItems.map((item) => (
              <div
                key={item.key}
                ref={item.key === 'wherewefly' ? whereweflyTriggerRef : undefined}
                className="relative h-full flex items-center"
                onMouseEnter={() => handleMouseEnter(item.key, item.dropdown && item.dropdown.length > 0)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  to={item.path}
                  className={`font-bold text-black hover:text-black transition-all h-full flex items-center gap-2 ${fontClass} ${language === 'fa' ? 'px-3 py-2 text-sm' : 'px-2 py-1.5 text-xs'}`}
                  style={{ 
                    borderBottom: activeDropdown === item.key ? '2px solid #000' : '2px solid transparent',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderBottomColor = '#000';
                  }}
                  onMouseLeave={(e) => {
                    if (activeDropdown !== item.key) {
                      e.currentTarget.style.borderBottomColor = 'transparent';
                    } else {
                      e.currentTarget.style.borderBottomColor = '#000';
                    }
                  }}
                >
                  {item.key === 'flyWithNasim' && <CalendarDaysIcon className={language === 'fa' ? 'w-5 h-5 text-black' : 'w-4 h-4 text-black'} />}
                  {item.key === 'wherewefly' && <MapPinIcon className={language === 'fa' ? 'w-5 h-5 text-black' : 'w-4 h-4 text-black'} />}
                  {item.key === 'about' && <QuestionMarkCircleIcon className={language === 'fa' ? 'w-5 h-5 text-black' : 'w-4 h-4 text-black'} />}
                  {item.label}
                </Link>
                
                {/* Dropdown Menu with Image - wherewefly uses Portal to avoid clipping; others inline */}
                {activeDropdown === item.key && item.dropdown && item.dropdown.length > 0 && item.key !== 'wherewefly' && (
                  <div 
                    className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-gray-200 rounded-xl shadow-2xl border border-gray-300/30 z-[9999] overflow-hidden w-[900px] max-w-[calc(100vw-48px)]`}
                    onMouseEnter={() => {
                      // Clear timeout when mouse enters dropdown
                      if (menuDropdownTimeoutRef.current) {
                        clearTimeout(menuDropdownTimeoutRef.current);
                        menuDropdownTimeoutRef.current = null;
                      }
                    }}
                    onMouseLeave={() => {
                      handleMouseLeave();
                      setHoveredSubItem(null);
                      setHoveredNestedPath([]);
                    }}
                  >
                    <div className="flex">
                      {/* Menu Items Section */}
                      <div className={`${item.key === 'wherewefly' ? 'w-80' : 'flex-1'} py-6 px-6 flex gap-4 min-w-0`}>
                        {/* Column 1 - Main items (or single column for non-flyWithNasim) */}
                        <div className="space-y-2 flex-1 min-w-0">
                          {item.dropdown.map((subItem, index) => {
                            const hasChildren = 'children' in subItem && subItem.children && subItem.children.length > 0;
                            const isHovered = item.key === 'flyWithNasim' && hoveredNestedPath[0] === index;
                            // Get icon for each submenu item based on path and key (language-independent)
                            const getSubItemIcon = (label: string, key: string, itemIndex: number, path: string) => {
                              if (key === 'flyWithNasim') {
                                if (itemIndex === 0) return <CalendarDaysIcon className="w-7 h-7" style={{ color: '#2563eb' }} />;
                                if (itemIndex === 1) return <UserIcon className="w-7 h-7" style={{ color: '#16a34a' }} />;
                                if (itemIndex === 2) return <UserGroupIcon className="w-7 h-7" style={{ color: '#9333ea' }} />; // مسافرین ویژه
                                if (itemIndex === 3) return <ArrowPathIcon className="w-7 h-7" style={{ color: '#db2777' }} />; // استرداد
                                if (itemIndex === 4) return <TicketIcon className="w-7 h-7" style={{ color: '#ea580c' }} />; // جامه دان
                                return <PaperAirplaneIcon className="w-7 h-7" style={{ color: '#3b82f6' }} />;
                              }
                              if (key === 'wherewefly') {
                                return <MapPinIcon className="w-7 h-7" style={{ color: '#ea580c' }} />;
                              }
                              if (key === 'about') {
                                if (itemIndex === 0) return <BuildingOfficeIcon className="w-7 h-7" style={{ color: '#374151' }} />; // تاریخچه نسیم
                                if (itemIndex === 1) return <PaperAirplaneIcon className="w-7 h-7" style={{ color: '#2563eb' }} />; // ناوگان هوایی
                                if (itemIndex === 2) return <MapPinIcon className="w-7 h-7" style={{ color: '#22c55e' }} />; // تماس با ما
                                if (itemIndex === 3) return <UserGroupIcon className="w-7 h-7" style={{ color: '#a855f7' }} />; // درخواست همکاری
                                if (itemIndex === 4) return <TrophyIcon className="w-7 h-7" style={{ color: '#ea580c' }} />; // آموزش نسیم
                                if (itemIndex === 5) return <NewspaperIcon className="w-7 h-7" style={{ color: '#6366f1' }} />; // مجله نسیم
                                if (itemIndex === 6) return <ExclamationTriangleIcon className="w-7 h-7" style={{ color: '#dc2626' }} />; // گزارش ایمنی
                                return <BuildingOfficeIcon className="w-7 h-7" style={{ color: '#3b82f6' }} />;
                              }
                              return null;
                            };
                            
                            const linkClassName = `flex items-center gap-3 px-4 py-4 text-base text-black hover:bg-gray-300 rounded-lg transition-all duration-200 ${fontClass} ${language === 'en' ? 'text-left' : 'text-right'} ${item.key === 'wherewefly' && selectedDestinationIndex === index ? 'bg-gray-300' : ''} ${isHovered ? 'bg-gray-300' : ''}`;
                            return (
                              hasChildren ? (
                                <div
                                  key={index}
                                  className={linkClassName}
                                  onMouseEnter={() => {
                                    setHoveredSubItem({ key: item.key, index });
                                    setHoveredNestedPath([index]);
                                  }}
                                >
                                  {getSubItemIcon(subItem.label, item.key, index, subItem.path)}
                                  <span className="font-medium">{subItem.label}</span>
                                  <ChevronDownIcon className="w-4 h-4 flex-shrink-0" style={{ transform: language === 'fa' || language === 'ar' ? 'rotate(-90deg)' : 'rotate(90deg)' }} />
                                </div>
                              ) : (
                              <Link
                                key={index}
                                to={subItem.path}
                                className={linkClassName}
                                onClick={(e) => {
                                  // flyWithNasim: show description modal for items with path '#'
                                  if (item.key === 'flyWithNasim' && subItem.path === '#') {
                                    e.preventDefault();
                                    const descKey = getFlyDescKey(index);
                                    if (descKey) {
                                      setFlyDescModal({ title: subItem.label, descKey });
                                      setActiveDropdown(null);
                                    }
                                    return;
                                  }
                                  // about: show description or contact modal for items with path '#'
                                  if (item.key === 'about' && subItem.path === '#') {
                                    e.preventDefault();
                                    const config = getAboutModalConfig(index, subItem.label);
                                    if (config) {
                                      setAboutModal(config);
                                      setActiveDropdown(null);
                                    }
                                    return;
                                  }
                                  // Disable navigation for inactive menu items
                                  if (subItem.path === '#') {
                                    e.preventDefault();
                                    setActiveDropdown(null);
                                    return;
                                  }
                                  
                                  // For wherewefly dropdown, if it's a real destination link (like /flights/map), allow navigation
                                  if (item.key === 'wherewefly' && subItem.path !== '/flights/map') {
                                    e.preventDefault();
                                    setSelectedDestinationIndex(index);
                                    setActiveDropdown(item.key); // Keep dropdown open
                                    return;
                                  }
                                  
                                  setActiveDropdown(null);
                                  // Handle weather modal
                                  if (subItem.path === '/#weather') {
                                    e.preventDefault();
                                    // If not on homepage, navigate first then open modal
                                    if (window.location.pathname !== '/') {
                                      navigate('/', { state: { openWeather: true } });
                                    } else {
                                      // Already on homepage, just open modal
                                      if (onWeatherClick) {
                                        onWeatherClick();
                                      }
                                    }
                                    return;
                                  }
                                  // Handle scroll to sections on homepage
                                  if (subItem.path.startsWith('/#')) {
                                    e.preventDefault();
                                    const sectionId = subItem.path.substring(2); // Remove '/#'
                                    
                                    // If not on homepage, navigate first then scroll
                                    if (window.location.pathname !== '/') {
                                      navigate('/', { state: { scrollTo: sectionId } });
                                      setTimeout(() => {
                                        const targetSection = document.getElementById(sectionId);
                                        if (targetSection) {
                                          targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }
                                      }, 300);
                                    } else {
                                      // Already on homepage, just scroll
                                      const section = document.getElementById(sectionId);
                                      if (section) {
                                        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                      }
                                    }
                                    return;
                                  }
                                }}
                                onMouseEnter={() => setHoveredSubItem({key: item.key, index})}
                                onMouseLeave={() => setHoveredSubItem(null)}
                              >
                                {getSubItemIcon(subItem.label, item.key, index, subItem.path)}
                                <span className="font-medium">{subItem.label}</span>
                              </Link>
                              )
                            );
                          })}
                        </div>
                        {/* Nested columns for flyWithNasim - single container so hover between cols doesn't clear */}
                        {item.key === 'flyWithNasim' && hoveredNestedPath.length > 0 && (
                          <div className="flex gap-4 flex-shrink-0" onMouseLeave={() => setHoveredNestedPath([hoveredNestedPath[0]])}>
                            {(() => {
                              const parentItem = item.dropdown[hoveredNestedPath[0]] as DropdownSubItem;
                              if (!parentItem?.children) return null;
                              return (
                                <div className="space-y-2 w-56 border-r border-gray-300 pr-4">
                                  {parentItem.children.map((child, childIdx) => {
                                    const childHasChildren = child.children && child.children.length > 0;
                                    const childHovered = hoveredNestedPath[1] === childIdx;
                                    return childHasChildren ? (
                                      <div
                                        key={childIdx}
                                        className={`flex items-center gap-3 px-4 py-3 text-sm text-black hover:bg-gray-300 rounded-lg transition-all ${fontClass} ${language === 'en' ? 'text-left' : 'text-right'} ${childHovered ? 'bg-gray-300' : ''}`}
                                        onMouseEnter={() => setHoveredNestedPath([hoveredNestedPath[0], childIdx])}
                                      >
                                        <span className="font-medium">{child.label}</span>
                                        <ChevronDownIcon className="w-4 h-4 flex-shrink-0" style={{ transform: language === 'fa' || language === 'ar' ? 'rotate(-90deg)' : 'rotate(90deg)' }} />
                                      </div>
                                    ) : (
                                      <Link
                                        key={childIdx}
                                        to={child.path}
                                        className={`flex items-center gap-3 px-4 py-3 text-sm text-black hover:bg-gray-300 rounded-lg transition-all ${fontClass} ${language === 'en' ? 'text-left' : 'text-right'}`}
                                        onClick={(e) => {
                                          if (child.path === '#') {
                                            e.preventDefault();
                                            const descKey = getFlyDescKey(hoveredNestedPath[0], childIdx);
                                            if (descKey) {
                                              setFlyDescModal({ title: child.label, descKey });
                                              setActiveDropdown(null);
                                            }
                                          }
                                        }}
                                        onMouseEnter={() => setHoveredNestedPath([hoveredNestedPath[0], childIdx])}
                                      >
                                        <span className="font-medium">{child.label}</span>
                                      </Link>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                            {hoveredNestedPath.length > 1 && (() => {
                              const parentItem = item.dropdown[hoveredNestedPath[0]] as DropdownSubItem;
                              const childItem = parentItem?.children?.[hoveredNestedPath[1]];
                              if (!childItem?.children) return null;
                              return (
                                <div className="space-y-2 w-56">
                                  {childItem.children.map((grandChild, gIdx) => (
                                    <Link
                                      key={gIdx}
                                      to={grandChild.path}
                                      className={`flex items-center gap-3 px-4 py-3 text-sm text-black hover:bg-gray-300 rounded-lg transition-all ${fontClass} ${language === 'en' ? 'text-left' : 'text-right'}`}
                                      onClick={(e) => { if (grandChild.path === '#') { e.preventDefault(); setActiveDropdown(null); } }}
                                    >
                                      <span className="font-medium">{grandChild.label}</span>
                                    </Link>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                      
                      {/* Image Section */}
                      {item.key === 'wherewefly' ? (
                        // Multiple images grid for destinations
                        <div className="flex-1 min-w-0 h-[600px] bg-gray-100 flex-shrink relative overflow-hidden m-4 rounded-2xl p-4">
                          <div className="grid grid-cols-3 gap-4 h-full">
                            {getDestinationImages(
                              selectedDestinationIndex !== null 
                                ? selectedDestinationIndex 
                                : (hoveredSubItem && hoveredSubItem.key === item.key 
                                    ? hoveredSubItem.index 
                                    : 0)
                            ).map((destination, imgIndex) => (
                              <div 
                                key={imgIndex}
                                className="relative overflow-hidden rounded-lg group cursor-pointer"
                                style={{ minHeight: '180px' }}
                                onMouseEnter={(e) => {
                                  const labelDiv = e.currentTarget.querySelector('.city-label') as HTMLElement;
                                  const textWrapper = e.currentTarget.querySelector('.city-text-wrapper') as HTMLElement;
                                  if (labelDiv) {
                                    const parent = e.currentTarget;
                                    const parentWidth = parent.clientWidth;
                                    const parentHeight = parent.clientHeight;
                                    const labelRect = labelDiv.getBoundingClientRect();
                                    const labelWidth = labelRect.width;
                                    const labelHeight = labelRect.height;
                                    
                                    // Calculate scale to cover entire parent (add larger margin to ensure full coverage)
                                    // Account for the offset (bottom-2 left-2 = 8px) and add extra margin, especially for height
                                    const scaleX = (parentWidth + 30) / labelWidth;
                                    const scaleY = (parentHeight + 40) / labelHeight;
                                    
                                    labelDiv.style.transform = `scale(${scaleX}, ${scaleY})`;
                                    labelDiv.style.borderRadius = '0';
                                    labelDiv.style.display = 'flex';
                                    labelDiv.style.alignItems = 'center';
                                    labelDiv.style.justifyContent = 'center';
                                    labelDiv.style.backgroundColor = 'rgba(75, 85, 99, 0.85)';
                                    // Ensure it starts from bottom-left corner
                                    labelDiv.style.bottom = '0';
                                    labelDiv.style.left = '0';
                                    
                                    // Apply inverse scale to text wrapper to keep text same size
                                    if (textWrapper) {
                                      const inverseScaleX = 1 / scaleX;
                                      const inverseScaleY = 1 / scaleY;
                                      textWrapper.style.transform = `scale(${inverseScaleX}, ${inverseScaleY})`;
                                    }
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  const labelDiv = e.currentTarget.querySelector('.city-label') as HTMLElement;
                                  const textWrapper = e.currentTarget.querySelector('.city-text-wrapper') as HTMLElement;
                                  if (labelDiv) {
                                    labelDiv.style.transform = 'scale(1)';
                                    labelDiv.style.borderRadius = '0.375rem';
                                    labelDiv.style.display = 'block';
                                    labelDiv.style.alignItems = 'auto';
                                    labelDiv.style.justifyContent = 'auto';
                                    labelDiv.style.backgroundColor = 'rgba(55, 65, 81, 0.9)';
                                    labelDiv.style.bottom = '0.5rem';
                                    labelDiv.style.left = '0.5rem';
                                    labelDiv.style.width = 'auto';
                                    labelDiv.style.height = 'auto';
                                    
                                    if (textWrapper) {
                                      textWrapper.style.transform = 'scale(1)';
                                    }
                                  }
                                }}
                              >
                                <img 
                                  src={destination.image}
                                  alt={destination.name}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                  onError={(e) => {
                                    // Fallback to a default image if the image fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/images/airplane-clouds-night_864588-19786.jpg';
                                  }}
                                  loading="eager"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                                {/* City name label - expands to cover full image on hover, starting from bottom-left */}
                                <div 
                                  className="city-label absolute bottom-2 left-2 bg-gray-700/90 text-white px-4 py-2 rounded-md transition-all duration-300 ease-out"
                                  style={{
                                    transformOrigin: 'bottom left'
                                  }}
                                >
                                  <div 
                                    className="city-text-wrapper flex items-center justify-center w-full h-full"
                                    style={{
                                      minWidth: '100%',
                                      minHeight: '100%'
                                    }}
                                  >
                                    <span 
                                      className={`city-text text-sm font-medium ${fontClass}`}
                                      style={{
                                        fontFamily: language === 'fa' ? 'DigiHamishe, DigiHamisheBold, sans-serif' : language === 'en' ? 'Inter, sans-serif' : "'Noto Sans Arabic', sans-serif",
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      {destination.name}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        // Single image for other menus
                        <div className="w-80 h-[400px] bg-gray-100 flex-shrink-0 relative overflow-hidden m-4 rounded-2xl">
                          <img 
                            src={hoveredSubItem && hoveredSubItem.key === item.key 
                              ? getDefaultImage(item.key, hoveredSubItem.index)
                              : getDefaultImage(item.key, 0)
                            }
                            alt={item.label}
                            className="w-full h-full object-cover transition-opacity duration-300 rounded-2xl"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Wherewefly Dropdown via Portal - prevents icon/menu clipping */}
            {activeDropdown === 'wherewefly' && whereweflyDropdownStyle && (() => {
              const item = menuItems.find(m => m.key === 'wherewefly');
              if (!item?.dropdown) return null;
              const getSubItemIcon = (label: string, key: string, itemIndex: number, path: string) => {
                if (key === 'wherewefly') return <MapPinIcon className="w-7 h-7 flex-shrink-0" style={{ color: '#ea580c' }} />;
                return null;
              };
              return createPortal(
                <div
                  className="fixed bg-gray-200 rounded-xl shadow-2xl border border-gray-300/30 z-[9999] overflow-visible"
                  style={{ top: whereweflyDropdownStyle.top, left: whereweflyDropdownStyle.left, width: whereweflyDropdownStyle.width }}
                  onMouseEnter={() => {
                    if (menuDropdownTimeoutRef.current) {
                      clearTimeout(menuDropdownTimeoutRef.current);
                      menuDropdownTimeoutRef.current = null;
                    }
                  }}
                  onMouseLeave={() => { handleMouseLeave(); setHoveredSubItem(null); }}
                >
                  <div className="flex overflow-hidden rounded-xl">
                    <div className="w-80 flex-shrink-0 py-6 px-6">
                      <div className="space-y-2">
                        {item.dropdown.map((subItem, index) => (
                          <Link
                            key={index}
                            to={subItem.path}
                            className={`flex items-center gap-3 px-4 py-4 text-base text-black hover:bg-gray-300 rounded-lg transition-all duration-200 ${fontClass} ${language === 'en' ? 'text-left' : 'text-right'} ${selectedDestinationIndex === index ? 'bg-gray-300' : ''}`}
                            onClick={(e) => {
                              if (subItem.path === '#') { e.preventDefault(); setActiveDropdown(null); return; }
                              if (subItem.path !== '/flights/map') { e.preventDefault(); setSelectedDestinationIndex(index); return; }
                              setActiveDropdown(null);
                            }}
                            onMouseEnter={() => setHoveredSubItem({ key: 'wherewefly', index })}
                            onMouseLeave={() => setHoveredSubItem(null)}
                          >
                            {getSubItemIcon(subItem.label, 'wherewefly', index, subItem.path)}
                            <span className="font-medium truncate">{subItem.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                        <div className="flex-1 min-w-0 h-[600px] bg-gray-100 flex-shrink relative overflow-hidden m-4 rounded-2xl p-4">
                          <div className="grid grid-cols-3 grid-rows-2 gap-4 h-full w-full">
                            {getDestinationImages(
                              selectedDestinationIndex !== null ? selectedDestinationIndex : (hoveredSubItem?.key === 'wherewefly' ? hoveredSubItem.index : 0)
                            ).map((destination, imgIndex) => (
                          <div
                            key={imgIndex}
                            className="relative overflow-hidden rounded-lg group cursor-pointer min-h-0"
                            onMouseEnter={(e) => {
                              const labelDiv = e.currentTarget.querySelector('.city-label') as HTMLElement;
                              const textWrapper = e.currentTarget.querySelector('.city-text-wrapper') as HTMLElement;
                              if (labelDiv) {
                                const parent = e.currentTarget;
                                const scaleX = (parent.clientWidth + 30) / labelDiv.getBoundingClientRect().width;
                                const scaleY = (parent.clientHeight + 40) / labelDiv.getBoundingClientRect().height;
                                labelDiv.style.transform = `scale(${scaleX}, ${scaleY})`;
                                labelDiv.style.borderRadius = '0';
                                labelDiv.style.display = 'flex';
                                labelDiv.style.alignItems = 'center';
                                labelDiv.style.justifyContent = 'center';
                                labelDiv.style.backgroundColor = 'rgba(75, 85, 99, 0.85)';
                                labelDiv.style.bottom = '0';
                                labelDiv.style.left = '0';
                                if (textWrapper) {
                                  textWrapper.style.transform = `scale(${1/scaleX}, ${1/scaleY})`;
                                }
                              }
                            }}
                            onMouseLeave={(e) => {
                              const labelDiv = e.currentTarget.querySelector('.city-label') as HTMLElement;
                              const textWrapper = e.currentTarget.querySelector('.city-text-wrapper') as HTMLElement;
                              if (labelDiv) {
                                labelDiv.style.transform = 'scale(1)';
                                labelDiv.style.borderRadius = '0.375rem';
                                labelDiv.style.display = 'block';
                                labelDiv.style.alignItems = 'auto';
                                labelDiv.style.justifyContent = 'auto';
                                labelDiv.style.backgroundColor = 'rgba(55, 65, 81, 0.9)';
                                labelDiv.style.bottom = '0.5rem';
                                labelDiv.style.left = '0.5rem';
                                labelDiv.style.width = 'auto';
                                labelDiv.style.height = 'auto';
                                if (textWrapper) textWrapper.style.transform = 'scale(1)';
                              }
                            }}
                          >
                            <img src={destination.image} alt={destination.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              onError={(e) => { (e.target as HTMLImageElement).src = '/images/airplane-clouds-night_864588-19786.jpg'; }} loading="eager" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                            <div className="city-label absolute bottom-2 left-2 bg-gray-700/90 text-white px-4 py-2 rounded-md transition-all duration-300 ease-out" style={{ transformOrigin: 'bottom left' }}>
                              <div className="city-text-wrapper flex items-center justify-center w-full h-full" style={{ minWidth: '100%', minHeight: '100%' }}>
                                <span className={`city-text text-sm font-medium ${fontClass}`} style={{ fontFamily: language === 'fa' ? 'DigiHamishe, DigiHamisheBold, sans-serif' : language === 'en' ? 'Inter, sans-serif' : "'Noto Sans Arabic', sans-serif", whiteSpace: 'nowrap' }}>
                                  {destination.name}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>,
                document.body
              );
            })()}

            {false && <div 
                className="relative"
                onMouseEnter={() => {
                  if (languageDropdownTimeoutRef.current) {
                    clearTimeout(languageDropdownTimeoutRef.current);
                  }
                  setIsLanguageDropdownOpen(true);
                }}
                onMouseLeave={() => {
                  languageDropdownTimeoutRef.current = setTimeout(() => {
                    setIsLanguageDropdownOpen(false);
                  }, 200); // 200ms delay before closing
                }}
              >
                <button 
                  className={`px-4 py-2 font-medium text-black hover:text-black transition-all h-full flex items-center gap-2 ${fontClass} ${language === 'fa' ? 'text-lg' : 'text-base'}`} 
                  style={{ 
                    borderBottom: '2px solid transparent',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderBottomColor = '#000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderBottomColor = 'transparent';
                  }}
                >
                  <GlobeAltIcon className="w-5 h-5 text-black" />
                  فارسی
                </button>
                
                {/* Language Dropdown Menu */}
                {isLanguageDropdownOpen && (
                  <div 
                    className={`absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-40 bg-gray-200 rounded-lg shadow-lg border border-gray-300/30 py-2 z-50`}
                    onMouseEnter={() => {
                      if (languageDropdownTimeoutRef.current) {
                        clearTimeout(languageDropdownTimeoutRef.current);
                      }
                    }}
                    onMouseLeave={() => {
                      languageDropdownTimeoutRef.current = setTimeout(() => {
                        setIsLanguageDropdownOpen(false);
                      }, 200);
                    }}
                  >
                    <button
                      onClick={() => {
                        setLanguage('fa');
                        setIsLanguageDropdownOpen(false);
                      }}
                      className={`w-full text-right px-4 py-2 text-sm text-black hover:bg-gray-300 transition-colors ${fontClass} ${
                        language === 'fa' ? 'bg-gray-300 font-semibold' : ''
                      }`}
                    >
                      فارسی
                    </button>
                    <button
                      onClick={() => {
                        setLanguage('ar');
                        setIsLanguageDropdownOpen(false);
                      }}
                      className={`w-full text-right px-4 py-2 text-sm text-black hover:bg-gray-300 transition-colors ${fontClass} ${
                        language === 'ar' ? 'bg-gray-300 font-semibold' : ''
                      }`}
                    >
                      العربية
                    </button>
                    <button
                      onClick={() => {
                        setLanguage('en');
                        setIsLanguageDropdownOpen(false);
                      }}
                      className={`w-full text-right px-4 py-2 text-sm text-black hover:bg-gray-300 transition-colors ${fontClass} ${
                        language === 'en' ? 'bg-gray-300 font-semibold' : ''
                      }`}
                    >
                      English
                    </button>
                  </div>
                )}
              </div>}

            {/* Login/Register/Logout */}
            {isAuthenticated ? (
              <div 
                className="relative"
                onMouseEnter={() => {
                  if (userDropdownTimeoutRef.current) {
                    clearTimeout(userDropdownTimeoutRef.current);
                  }
                  setIsUserDropdownOpen(true);
                }}
                onMouseLeave={() => {
                  userDropdownTimeoutRef.current = setTimeout(() => {
                    setIsUserDropdownOpen(false);
                  }, 200);
                }}
              >
                <button
                  className={`px-3 py-2 font-medium text-black hover:text-black transition-all h-full flex items-center gap-2 ${fontClass} text-sm`}
                  style={{ 
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  <UserIcon className="w-5 h-5 text-black" />
                  {user?.first_name || user?.email || t('nav.user') || 'کاربر'}
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
                
                {/* User Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div 
                    className={`absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-48 bg-gray-200 rounded-lg shadow-lg border border-gray-300/30 py-2 z-50`}
                    onMouseEnter={() => {
                      if (userDropdownTimeoutRef.current) {
                        clearTimeout(userDropdownTimeoutRef.current);
                      }
                    }}
                    onMouseLeave={() => {
                      userDropdownTimeoutRef.current = setTimeout(() => {
                        setIsUserDropdownOpen(false);
                      }, 200);
                    }}
                  >
                    <Link
                      to="/wallet"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className={`w-full ${language === 'en' ? 'text-left' : 'text-right'} px-4 py-2 text-sm text-black hover:bg-gray-300 transition-colors flex items-center gap-2 ${fontClass}`}
                    >
                      <WalletIcon className="w-5 h-5" />
                      {t('nav.wallet') || 'کیف پول'}
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className={`w-full ${language === 'en' ? 'text-left' : 'text-right'} px-4 py-2 text-sm text-black hover:bg-gray-300 transition-colors flex items-center gap-2 ${fontClass}`}
                    >
                      <UserIcon className="w-5 h-5" />
                      {t('nav.profile') || 'پروفایل'}
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsUserDropdownOpen(false);
                      }}
                      className={`w-full ${language === 'en' ? 'text-left' : 'text-right'} px-4 py-2 text-sm text-black hover:bg-gray-300 transition-colors ${fontClass}`}
                    >
                      {t('nav.logout') || 'خروج'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Login Dropdown */}
                <div 
                  className="relative"
                  onMouseEnter={() => {
                    if (loginDropdownTimeoutRef.current) {
                      clearTimeout(loginDropdownTimeoutRef.current);
                    }
                    setIsLoginDropdownOpen(true);
                  }}
                  onMouseLeave={() => {
                    loginDropdownTimeoutRef.current = setTimeout(() => {
                      setIsLoginDropdownOpen(false);
                    }, 200);
                  }}
                >
                  <button
                    className={`font-medium text-black hover:text-black transition-all h-full flex items-center gap-2 ${fontClass} ${language === 'fa' ? 'px-3 py-2 text-sm' : 'px-2 py-1.5 text-xs'}`}
                    style={{ 
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    <UserIcon className={language === 'fa' ? 'w-5 h-5 text-black' : 'w-4 h-4 text-black'} />
                    {t('nav.login') || 'ورود'}
                    <ChevronDownIcon className="w-4 h-4" />
                  </button>
                  
                  {/* Simple Login Dropdown Menu */}
                  {isLoginDropdownOpen && (
                    <div 
                      className={`absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-48 bg-gray-200 rounded-lg shadow-lg border border-gray-300/30 py-2 z-50`}
                      onMouseEnter={() => {
                        if (loginDropdownTimeoutRef.current) {
                          clearTimeout(loginDropdownTimeoutRef.current);
                        }
                      }}
                      onMouseLeave={() => {
                        loginDropdownTimeoutRef.current = setTimeout(() => {
                          setIsLoginDropdownOpen(false);
                        }, 200);
                      }}
                    >
                      <button
                        onClick={() => {
                          setAuthModalMode('login');
                          setIsAuthModalOpen(true);
                          setIsLoginDropdownOpen(false);
                        }}
                        className={`w-full ${language === 'en' ? 'text-left' : 'text-right'} px-4 py-2 text-sm text-black hover:bg-gray-300 transition-colors ${fontClass}`}
                      >
                        {t('nav.loginUsers')}
                      </button>
                      <button
                        onClick={() => {
                          setIsStaffLoginModalOpen(true);
                          setIsLoginDropdownOpen(false);
                        }}
                        className={`w-full ${language === 'en' ? 'text-left' : 'text-right'} px-4 py-2 text-sm text-black hover:bg-gray-300 transition-colors ${fontClass}`}
                      >
                        {t('nav.loginStaff')}
                      </button>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    setAuthModalMode('register');
                    setIsAuthModalOpen(true);
                  }}
                  className={`font-medium text-black hover:text-black transition-all h-full flex items-center gap-2 ${fontClass} ${language === 'fa' ? 'px-3 py-2 text-sm' : 'px-2 py-1.5 text-xs'}`}
                  style={{ 
                    borderBottom: '2px solid transparent',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderBottomColor = '#000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderBottomColor = 'transparent';
                  }}
                >
                  <UserPlusIcon className={language === 'fa' ? 'w-5 h-5 text-black' : 'w-4 h-4 text-black'} />
                  {t('nav.register')}
                </button>
              </>
            )}

            {/* Language Dropdown - at end of header */}
            <div 
              className="relative"
              onMouseEnter={() => {
                if (languageDropdownTimeoutRef.current) clearTimeout(languageDropdownTimeoutRef.current);
                setIsLanguageDropdownOpen(true);
              }}
              onMouseLeave={() => {
                languageDropdownTimeoutRef.current = setTimeout(() => setIsLanguageDropdownOpen(false), 200);
              }}
            >
              <button 
                className={`font-medium text-black hover:text-black transition-all h-full flex items-center gap-2 ${fontClass} ${language === 'fa' ? 'px-3 py-2 text-sm' : 'px-2 py-1.5 text-xs'}`}
                style={{ borderBottom: '2px solid transparent', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderBottomColor = '#000'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderBottomColor = 'transparent'; }}
              >
                <GlobeAltIcon className={language === 'fa' ? 'w-5 h-5 text-black' : 'w-4 h-4 text-black'} />
                فارسی
              </button>
              {isLanguageDropdownOpen && (
                <div 
                  className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-40 bg-gray-200 rounded-lg shadow-lg border border-gray-300/30 py-2 z-50"
                  onMouseEnter={() => { if (languageDropdownTimeoutRef.current) clearTimeout(languageDropdownTimeoutRef.current); }}
                  onMouseLeave={() => { languageDropdownTimeoutRef.current = setTimeout(() => setIsLanguageDropdownOpen(false), 200); }}
                >
                  <button onClick={() => { setLanguage('fa'); setIsLanguageDropdownOpen(false); }} className={`w-full text-right px-4 py-2 text-sm text-black hover:bg-gray-300 transition-colors ${fontClass} ${language === 'fa' ? 'bg-gray-300 font-semibold' : ''}`}>فارسی</button>
                  <button onClick={() => { setLanguage('ar'); setIsLanguageDropdownOpen(false); }} className={`w-full text-right px-4 py-2 text-sm text-black hover:bg-gray-300 transition-colors ${fontClass} ${language === 'ar' ? 'bg-gray-300 font-semibold' : ''}`}>العربية</button>
                  <button onClick={() => { setLanguage('en'); setIsLanguageDropdownOpen(false); }} className={`w-full text-right px-4 py-2 text-sm text-black hover:bg-gray-300 transition-colors ${fontClass} ${language === 'en' ? 'bg-gray-300 font-semibold' : ''}`}>English</button>
                </div>
              )}
            </div>
          </nav>

            {/* Mobile brand + menu */}
            <div className="lg:hidden flex items-center justify-between w-full gap-2 min-w-0">
              <Link to="/" className="flex items-center gap-2 min-w-0 shrink">
                <div className="bg-blue-900 rounded-b-xl px-2.5 py-1.5 shadow-md">
                  <img src="/images/nasim0.png" alt="Nasim" className="h-8 w-auto max-w-[7rem] object-contain" />
                </div>
                <span className={`text-sm font-bold text-black truncate ${fontClass}`}>
                  {language === 'fa' ? 'نسیم ایر' : language === 'ar' ? 'نسيم إير' : 'Nasim Air'}
                </span>
              </Link>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setLanguage(language === 'fa' ? 'en' : language === 'en' ? 'ar' : 'fa')}
                  className={`p-2 text-xs font-bold text-black uppercase ${fontClass}`}
                  aria-label="Language"
                >
                  {language === 'fa' ? 'FA' : language === 'ar' ? 'AR' : 'EN'}
                </button>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 text-black hover:text-gray-700"
                  aria-label="Menu"
                >
                  {isMenuOpen ? (
                    <XMarkIcon className="w-6 h-6" />
                  ) : (
                    <Bars3Icon className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-700 py-4 bg-gray-900 max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain">
            <div className="px-4">
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <div key={item.key}>
                    <Link
                      to={item.path}
                      className={`block px-4 py-2 text-base font-bold text-white hover:bg-gray-800 hover:text-gray-300 transition-colors ${fontClass}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                    {item.dropdown && (
                      <div className="pr-4 mt-1 space-y-1">
                        {(function flattenItems(items: DropdownSubItem[], depth = 0, path = '', menuKey: string): React.ReactNode[] {
                          return items.flatMap((subItem, index) => {
                            const p = path ? `${path}-${index}` : `${index}`;
                            const { parentIndex } = parseFlattenPath(p);
                            const isFlyDesc = menuKey === 'flyWithNasim' && subItem.path === '#';
                            const flyDescKey = isFlyDesc ? getFlyDescKey(parentIndex, parseFlattenPath(p).childIndex) : null;
                            const aboutConfig = menuKey === 'about' && subItem.path === '#' ? getAboutModalConfig(parentIndex, subItem.label) : null;
                            return [
                            <Link
                              key={p}
                              to={subItem.path}
                              className={`block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${fontClass}`}
                              style={{ paddingLeft: `${16 + depth * 12}px` }}
                              onClick={(e) => {
                                if (flyDescKey) {
                                  e.preventDefault();
                                  setFlyDescModal({ title: subItem.label, descKey: flyDescKey });
                                } else if (aboutConfig) {
                                  e.preventDefault();
                                  setAboutModal(aboutConfig);
                                }
                                setIsMenuOpen(false);
                              }}
                            >
                              {subItem.label}
                            </Link>,
                            ...(subItem.children ? flattenItems(subItem.children, depth + 1, p, menuKey) : [])
                          ];
                          });
                        })(item.dropdown, 0, '', item.key)}
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="border-t border-gray-700 pt-4 mt-4">
                  {isAuthenticated ? (
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className={`w-full ${language === 'en' ? 'text-left' : 'text-right'} px-4 py-2 text-base font-medium text-white hover:bg-gray-800 hover:text-gray-300 transition-colors ${fontClass}`}
                    >
                      {t('nav.logout')}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setAuthModalMode('login');
                          setIsAuthModalOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className={`block w-full ${language === 'en' ? 'text-left' : 'text-right'} px-4 py-2 text-base font-medium text-white hover:bg-gray-800 hover:text-gray-300 transition-colors ${fontClass}`}
                      >
                        {t('nav.loginUsers')}
                      </button>
                      <button
                        onClick={() => {
                          setIsStaffLoginModalOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className={`block w-full ${language === 'en' ? 'text-left' : 'text-right'} px-4 py-2 text-base font-medium text-white hover:bg-gray-800 hover:text-gray-300 transition-colors ${fontClass}`}
                      >
                        {t('nav.loginStaff')}
                      </button>
                      <button
                        onClick={() => {
                          setAuthModalMode('register');
                          setIsAuthModalOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className={`block w-full ${language === 'en' ? 'text-left' : 'text-right'} px-4 py-2 text-base font-medium text-white hover:bg-gray-800 hover:text-gray-300 transition-colors ${fontClass}`}
                      >
                        {t('nav.register')}
                      </button>
                    </>
                  )}
                </div>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* Staff Login Modal - ورود پرسنل */}
      <StaffLoginModal
        isOpen={isStaffLoginModalOpen}
        onClose={() => setIsStaffLoginModalOpen(false)}
      />

      {/* Fly With Nasim Description Modal - blu900 theme */}
      {flyDescModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)' }}
          onClick={() => setFlyDescModal(null)}
        >
          <div
            className="relative w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-blue-800/50"
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)',
              boxShadow: '0 25px 50px -12px rgba(30, 58, 138, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <h3
                  className={`text-xl font-bold text-white ${fontClass}`}
                  style={{
                    fontFamily: language === 'fa' ? 'DigiHamishe, DigiHamisheBold, sans-serif' : language === 'en' ? 'Inter, sans-serif' : "'Noto Sans Arabic', sans-serif",
                  }}
                >
                  {flyDescModal.title}
                </h3>
                <button
                  onClick={() => setFlyDescModal(null)}
                  className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <p
                className={`text-white/95 leading-relaxed ${fontClass}`}
                style={{
                  fontFamily: language === 'fa' ? 'DigiHamishe, DigiHamisheBold, sans-serif' : language === 'en' ? 'Inter, sans-serif' : "'Noto Sans Arabic', sans-serif",
                  fontSize: '0.95rem',
                  lineHeight: '1.7',
                }}
              >
                {t(flyDescModal.descKey)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* About Description Modal - blu900 theme */}
      {aboutModal && aboutModal.type === 'desc' && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)' }}
          onClick={() => setAboutModal(null)}
        >
          <div
            className="relative w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-blue-800/50"
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)',
              boxShadow: '0 25px 50px -12px rgba(30, 58, 138, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <h3
                  className={`text-xl font-bold text-white ${fontClass}`}
                  style={{
                    fontFamily: language === 'fa' ? 'DigiHamishe, DigiHamisheBold, sans-serif' : language === 'en' ? 'Inter, sans-serif' : "'Noto Sans Arabic', sans-serif",
                  }}
                >
                  {aboutModal.title}
                </h3>
                <button
                  onClick={() => setAboutModal(null)}
                  className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <p
                className={`text-white/95 leading-relaxed ${fontClass}`}
                style={{
                  fontFamily: language === 'fa' ? 'DigiHamishe, DigiHamisheBold, sans-serif' : language === 'en' ? 'Inter, sans-serif' : "'Noto Sans Arabic', sans-serif",
                  fontSize: '0.95rem',
                  lineHeight: '1.7',
                }}
              >
                {t(aboutModal.descKey)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal - با تماس با ما */}
      {aboutModal && aboutModal.type === 'contact' && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)' }}
          onClick={() => setAboutModal(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-blue-800/50"
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)',
              boxShadow: '0 25px 50px -12px rgba(30, 58, 138, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3
                  className={`text-xl font-bold text-white ${fontClass}`}
                  style={{
                    fontFamily: language === 'fa' ? 'DigiHamishe, DigiHamisheBold, sans-serif' : language === 'en' ? 'Inter, sans-serif' : "'Noto Sans Arabic', sans-serif",
                  }}
                >
                  {t('nav.contactUs')}
                </h3>
                <button
                  onClick={() => setAboutModal(null)}
                  className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className={`space-y-3 mb-6 ${fontClass}`} style={{ fontFamily: language === 'fa' ? 'DigiHamishe, DigiHamisheBold, sans-serif' : language === 'en' ? 'Inter, sans-serif' : "'Noto Sans Arabic', sans-serif" }}>
                <div className="flex items-center gap-3 text-white/95">
                  <PhoneIcon className="w-5 h-5 flex-shrink-0 text-white/80" />
                  <span><strong>{t('contact.phone')}:</strong> 7340000</span>
                </div>
                <div className="flex items-center gap-3 text-white/95">
                  <DocumentTextIcon className="w-5 h-5 flex-shrink-0 text-white/80" />
                  <span><strong>{t('contact.fax')}:</strong> 77610753</span>
                </div>
                <div className="flex items-center gap-3 text-white/95">
                  <EnvelopeIcon className="w-5 h-5 flex-shrink-0 text-white/80" />
                  <a href="mailto:info@nasimair.com" className="text-white/95 hover:text-white underline">{t('contact.email')}: info@nasimair.com</a>
                </div>
                <div className="flex items-start gap-3 text-white/95">
                  <MapPinIcon className="w-5 h-5 flex-shrink-0 text-white/80 mt-0.5" />
                  <span><strong>{t('contact.address')}:</strong> شریعتی پایین تر از بهارشیراز کوچه عشایر پلاک ۱۳</span>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden border border-white/20" style={{ height: '280px' }}>
                <iframe
                  title={t('nav.contactUs')}
                  src="https://www.google.com/maps?q=35.712476,51.437845&z=18&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=35.712476,51.437845"
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-3 inline-flex items-center gap-2 text-white/90 hover:text-white text-sm ${fontClass}`}
                style={{ fontFamily: language === 'fa' ? 'DigiHamishe, DigiHamisheBold, sans-serif' : language === 'en' ? 'Inter, sans-serif' : "'Noto Sans Arabic', sans-serif" }}
              >
                <MapPinIcon className="w-4 h-4" />
                {language === 'fa' ? 'مشاهده در گوگل مپ' : language === 'ar' ? 'عرض في خرائط جوجل' : 'View in Google Maps'}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default EmiratesHeader;

