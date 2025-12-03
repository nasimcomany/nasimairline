import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
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
  HomeIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import AuthModal from '../Auth/AuthModal';

const EmiratesHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
  const [hoveredSubItem, setHoveredSubItem] = useState<{key: string, index: number} | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const languageDropdownTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const loginDropdownTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { language, t, fontClass, setLanguage } = useLanguage();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  // Get default image for each menu category
  const getDefaultImage = (key: string, subItemIndex?: number) => {
    const images: Record<string, string[]> = {
      'book': [
        '/images/airplane-clouds-night_864588-19786.jpg',
        '/images/airport-crew.jpg',
        '/images/skyward-soar-airplane-flying-blue-sky-clouds_391229-21566.jpg',
        '/images/collection-of-aerospace-and-aviation-website-templates-vayudoot-aviation.jpeg'
      ],
      'manage': [
        '/images/airport-crew.jpg',
        '/images/airplane-clouds-night_864588-19786.jpg',
        '/images/airport-plane-photo_991869-62.jpg',
        '/images/skyward-soar-airplane-flying-blue-sky-clouds_391229-21566.jpg'
      ],
      'experience': [
        '/images/collection-of-aerospace-and-aviation-website-templates-vayudoot-aviation.jpeg',
        '/images/airport-crew.jpg',
        '/images/airplane-clouds-night_864588-19786.jpg',
        '/images/airport-plane-photo_991869-62.jpg'
      ],
      'wherewefly': [
        '/images/skyward-soar-airplane-flying-blue-sky-clouds_391229-21566.jpg',
        '/images/airplane-clouds-night_864588-19786.jpg',
        '/images/airport-crew.jpg',
        '/images/collection-of-aerospace-and-aviation-website-templates-vayudoot-aviation.jpeg'
      ],
      'loyalty': [
        '/images/airport-plane-photo_991869-62.jpg',
        '/images/airport-crew.jpg',
        '/images/airplane-clouds-night_864588-19786.jpg',
        '/images/skyward-soar-airplane-flying-blue-sky-clouds_391229-21566.jpg'
      ],
      'about': [
        '/images/airport-crew.jpg',
        '/images/airplane-clouds-night_864588-19786.jpg',
        '/images/airport-plane-photo_991869-62.jpg',
        '/images/collection-of-aerospace-and-aviation-website-templates-vayudoot-aviation.jpeg'
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

  const menuItems = [
    {
      key: 'home',
      label: 'خانه',
      path: '/',
      dropdown: []
    },
    {
      key: 'book',
      label: t('nav.book') || 'رزرو',
      path: '/flights/search',
      dropdown: [
        { label: t('nav.bookFlights') || 'رزرو پرواز', path: '/flights/search' },
        { label: t('nav.flightSchedules') || 'برنامه پروازها', path: '/flights/schedules' },
        { label: t('nav.featuredFares') || 'پیشنهادات ویژه', path: '/offers' },
        { label: t('nav.specialOffers') || 'پیشنهادات خاص', path: '/offers' },
      ]
    },
    {
      key: 'manage',
      label: t('nav.manage') || 'مدیریت',
      path: '/dashboard',
      dropdown: [
        { label: t('nav.manageBooking') || 'مدیریت رزرو', path: '/dashboard' },
        { label: t('nav.retrieveBooking') || 'بازیابی رزرو', path: '/booking/retrieve' },
        { label: t('nav.checkIn') || 'چک این', path: '/checkin' },
        { label: t('nav.flightStatus') || 'وضعیت پرواز', path: '/flights/status' },
      ]
    },
    {
      key: 'experience',
      label: t('nav.experience') || 'تجربه',
      path: '/experience',
      dropdown: [
        { label: t('nav.cabinFeatures') || 'ویژگی‌های کابین', path: '/experience/cabins' },
        { label: t('nav.inflightEntertainment') || 'سرگرمی در پرواز', path: '/experience/entertainment' },
        { label: t('nav.dining') || 'غذا و نوشیدنی', path: '/experience/dining' },
        { label: t('nav.ourFleet') || 'ناوگان ما', path: '/experience/fleet' },
      ]
    },
    {
      key: 'wherewefly',
      label: t('nav.whereWeFly') || 'مقاصد',
      path: '/destinations',
      dropdown: [
        { label: t('nav.destinations') || 'مقاصد', path: '/destinations' },
        { label: t('nav.routeMap') || 'نقشه مسیرها', path: '/destinations/map' },
        { label: t('nav.popularDestinations') || 'مقاصد محبوب', path: '/destinations' },
      ]
    },
    {
      key: 'loyalty',
      label: t('nav.loyalty') || 'برنامه وفاداری',
      path: '/membership',
      dropdown: [
        { label: t('nav.joinLoyalty') || 'عضویت در برنامه', path: '/membership' },
        { label: t('nav.earnMiles') || 'کسب امتیاز', path: '/membership' },
        { label: t('nav.spendMiles') || 'استفاده از امتیاز', path: '/membership' },
        { label: t('nav.loyaltyPartners') || 'شرکای برنامه', path: '/membership/partners' },
      ]
    },
    {
      key: 'help',
      label: t('nav.help') || 'کمک',
      path: '/support',
      dropdown: [
        { label: t('nav.helpCenter') || 'مرکز کمک', path: '/support' },
        { label: t('nav.contactUs') || 'تماس با ما', path: '/support' },
        { label: t('nav.faq') || 'سوالات متداول', path: '/#faq' },
        { label: t('nav.travelInfo') || 'اطلاعات سفر', path: '/support/travel-info' },
        { label: 'وضعیت آب و هوا', path: '/#weather' },
        { label: 'ثبت شکایت', path: '/tickets' },
      ]
    }
  ];

  const handleMouseEnter = (key: string, hasDropdown: boolean) => {
    if (hasDropdown) {
      setActiveDropdown(key);
    }
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
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
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 relative">
      <div className="flex h-20 relative">
        {/* Dark Navigation Section - Glassmorphism */}
        <div className="flex-1 bg-white/5 backdrop-blur-xl border-b border-white/20 shadow-2xl flex items-center justify-between">
          <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">

          {/* Desktop Navigation - White text */}
          <nav className="hidden lg:flex items-center space-x-1 space-x-reverse h-full">
            {menuItems.map((item) => (
              <div
                key={item.key}
                className="relative h-full flex items-center"
                onMouseEnter={() => handleMouseEnter(item.key, item.dropdown && item.dropdown.length > 0)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  to={item.path}
                  className={`px-4 py-2 text-base font-medium text-black hover:text-black transition-all h-full flex items-center gap-2 ${fontClass}`}
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
                  {item.key === 'home' && <HomeIcon className="w-5 h-5 text-black" />}
                  {item.key === 'book' && <TicketIcon className="w-5 h-5 text-black" />}
                  {item.key === 'manage' && <ClipboardDocumentIcon className="w-5 h-5 text-black" />}
                  {item.key === 'experience' && <SparklesIcon className="w-5 h-5 text-black" />}
                  {item.key === 'wherewefly' && <MapPinIcon className="w-5 h-5 text-black" />}
                  {item.key === 'loyalty' && <StarIcon className="w-5 h-5 text-black" />}
                  {item.key === 'about' && <BuildingOfficeIcon className="w-5 h-5 text-black" />}
                  {item.key === 'help' && <QuestionMarkCircleIcon className="w-5 h-5 text-black" />}
                  {item.label}
                </Link>
                
                {/* Dropdown Menu with Image */}
                {activeDropdown === item.key && item.dropdown && item.dropdown.length > 0 && (
                  <div 
                    className={`absolute top-full ${language === 'en' ? 'left-0' : 'right-0'} mt-2 w-[900px] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden`}
                    onMouseLeave={() => {
                      handleMouseLeave();
                      setHoveredSubItem(null);
                    }}
                  >
                    <div className="flex">
                      {/* Menu Items Section */}
                      <div className="flex-1 py-6 px-6">
                        <div className="space-y-2">
                          {item.dropdown.map((subItem, index) => {
                            // Get icon for each submenu item based on label with colors
                            const getSubItemIcon = (label: string, key: string) => {
                              if (key === 'book') {
                                if (label.includes('پرواز') || label.includes('Flight')) return <TicketIcon className="w-7 h-7 text-blue-600" />;
                                if (label.includes('برنامه') || label.includes('Schedule')) return <CalendarDaysIcon className="w-7 h-7 text-green-600" />;
                                if (label.includes('پیشنهاد') || label.includes('Offer')) return <GiftIcon className="w-7 h-7 text-purple-600" />;
                              }
                              if (key === 'manage') {
                                if (label.includes('مدیریت') || label.includes('Manage')) return <ClipboardDocumentIcon className="w-7 h-7 text-indigo-600" />;
                                if (label.includes('بازیابی') || label.includes('Retrieve')) return <ArrowPathIcon className="w-7 h-7 text-cyan-600" />;
                                if (label.includes('چک') || label.includes('Check')) return <CheckCircleIcon className="w-7 h-7 text-emerald-600" />;
                                if (label.includes('وضعیت') || label.includes('Status')) return <PaperAirplaneIcon className="w-7 h-7 text-blue-500" />;
                              }
                              if (key === 'experience') {
                                if (label.includes('کابین') || label.includes('Cabin')) return <BuildingOfficeIcon className="w-7 h-7 text-amber-600" />;
                                if (label.includes('سرگرمی') || label.includes('Entertainment')) return <SparklesIcon className="w-7 h-7 text-pink-600" />;
                                if (label.includes('غذا') || label.includes('Dining')) return <HeartIcon className="w-7 h-7 text-red-500" />;
                                if (label.includes('ناوگان') || label.includes('Fleet')) return <PaperAirplaneIcon className="w-7 h-7 text-sky-600" />;
                              }
                              if (key === 'wherewefly') {
                                return <MapPinIcon className="w-7 h-7 text-orange-600" />;
                              }
                              if (key === 'loyalty') {
                                if (label.includes('عضویت') || label.includes('Join')) return <StarIcon className="w-7 h-7 text-yellow-500" />;
                                if (label.includes('کسب') || label.includes('Earn')) return <CurrencyDollarIcon className="w-7 h-7 text-green-600" />;
                                if (label.includes('استفاده') || label.includes('Spend')) return <TrophyIcon className="w-7 h-7 text-amber-600" />;
                                if (label.includes('شریک') || label.includes('شرکا') || label.includes('Partner')) return <UserGroupIcon className="w-7 h-7 text-blue-600" />;
                              }
                              if (key === 'about') {
                                return <BuildingOfficeIcon className="w-7 h-7 text-gray-700" />;
                              }
                              if (key === 'help') {
                                if (label.includes('آب و هوا') || label.includes('Weather')) return <CloudIcon className="w-7 h-7 text-blue-500" />;
                                if (label.includes('شکایت') || label.includes('Complaint')) return <ExclamationTriangleIcon className="w-7 h-7 text-red-500" />;
                                return <QuestionMarkCircleIcon className="w-7 h-7 text-blue-500" />;
                              }
                              return null;
                            };
                            
                            return (
                              <Link
                                key={index}
                                to={subItem.path}
                                className={`flex items-center gap-3 px-4 py-4 text-base text-black hover:bg-gray-50 rounded-lg transition-all duration-200 ${fontClass} ${language === 'en' ? 'text-left' : 'text-right'}`}
                                onClick={(e) => {
                                  setActiveDropdown(null);
                                  // Handle scroll to sections on homepage
                                  if (subItem.path.startsWith('/#')) {
                                    e.preventDefault();
                                    const sectionId = subItem.path.substring(2); // Remove '/#'
                                    const section = document.getElementById(sectionId);
                                    if (section) {
                                      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                      // If not on homepage, navigate first
                                      if (window.location.pathname !== '/') {
                                        navigate('/');
                                        setTimeout(() => {
                                          const targetSection = document.getElementById(sectionId);
                                          if (targetSection) {
                                            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                          }
                                        }, 100);
                                      }
                                    }
                                  }
                                }}
                                onMouseEnter={() => setHoveredSubItem({key: item.key, index})}
                                onMouseLeave={() => setHoveredSubItem(null)}
                              >
                                {getSubItemIcon(subItem.label, item.key)}
                                <span className="font-medium">{subItem.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Image Section */}
                      <div className="w-80 h-[400px] bg-gray-100 flex-shrink-0 relative overflow-hidden">
                        <img 
                          src={hoveredSubItem && hoveredSubItem.key === item.key 
                            ? getDefaultImage(item.key, hoveredSubItem.index)
                            : getDefaultImage(item.key, 0)
                          }
                          alt={item.label}
                          className="w-full h-full object-cover transition-opacity duration-300"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

            {/* Right Side Actions - White text */}
            <div className="hidden lg:flex items-center space-x-2 space-x-reverse relative">
              {/* Blue Flag Section - Next to "فارسی" */}
              <div 
                className={`bg-blue-900 flex flex-col items-center justify-end absolute`}
                style={{ 
                  width: '125px', // Wider
                  height: '160px', // Longer from bottom
                  top: '-30px', // 4cm higher (40px)
                  ...(language === 'en' ? { right: 'calc(100% - 1px)' } : { left: 'calc(100% - 1px)' }), // 50cm (500px) closer to center
                  padding: '8px',
                  paddingBottom: '-150px', // More padding at bottom
                  boxShadow: '2px 2px 8px rgba(0,0,0,0.2)',
                  zIndex: 60
                }}
              >
                <Link to="/" className="flex items-center justify-center w-full">
                  {/* Only Logo Image - No text */}
                  <img 
                    src="/images/nasim0.png" 
                    alt="نسیم ایر" 
                    className="object-contain"
                    style={{ 
                      width: '165px',
                      height: 'auto',
                      maxWidth: '165px',
                      transform: 'translateY(15px)' // Move down
                    }}
                  />
                </Link>
              </div>

              {/* Global/Language Dropdown */}
              <div 
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
                  className={`text-black text-sm font-medium hover:text-black transition-all ${fontClass}`} 
                  style={{ 
                    textTransform: 'uppercase',
                    borderBottom: '2px solid transparent',
                    paddingBottom: '2px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderBottomColor = '#000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderBottomColor = 'transparent';
                  }}
                >
                  فارسی
                </button>
                
                {/* Language Dropdown Menu */}
                {isLanguageDropdownOpen && (
                  <div 
                    className={`absolute ${language === 'en' ? 'left-0' : 'right-0'} top-full mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50`}
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
                      className={`w-full text-right px-4 py-2 text-sm text-black hover:bg-gray-100 transition-colors ${fontClass} ${
                        language === 'fa' ? 'bg-gray-100 font-semibold' : ''
                      }`}
                    >
                      فارسی
                    </button>
                    <button
                      onClick={() => {
                        setLanguage('ar');
                        setIsLanguageDropdownOpen(false);
                      }}
                      className={`w-full text-right px-4 py-2 text-sm text-black hover:bg-gray-100 transition-colors ${fontClass} ${
                        language === 'ar' ? 'bg-gray-100 font-semibold' : ''
                      }`}
                    >
                      العربية
                    </button>
                    <button
                      onClick={() => {
                        setLanguage('en');
                        setIsLanguageDropdownOpen(false);
                      }}
                      className={`w-full text-right px-4 py-2 text-sm text-black hover:bg-gray-100 transition-colors ${fontClass} ${
                        language === 'en' ? 'bg-gray-100 font-semibold' : ''
                      }`}
                    >
                      English
                    </button>
                  </div>
                )}
              </div>

            {/* Search */}
            <button className="text-black hover:text-black transition-colors flex items-center gap-2">
              <MagnifyingGlassIcon className="w-5 h-5" />
              <span className={`text-black text-sm font-medium ${fontClass}`} style={{ textTransform: 'uppercase' }}>
                {t('nav.search') || 'SEARCH'}
              </span>
            </button>

            {/* Login/Register/Logout */}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className={`text-black text-sm font-medium hover:text-black transition-all ${fontClass}`}
                style={{ 
                  textTransform: 'uppercase',
                  borderBottom: '2px solid transparent',
                  paddingBottom: '2px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderBottomColor = '#000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderBottomColor = 'transparent';
                }}
              >
                {t('nav.logout')}
              </button>
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
                    className={`text-black text-sm font-medium hover:text-black transition-all ${fontClass} flex items-center gap-1`}
                    style={{ 
                      textTransform: 'uppercase',
                      borderBottom: '2px solid transparent',
                      paddingBottom: '2px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderBottomColor = '#000';
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoginDropdownOpen) {
                        e.currentTarget.style.borderBottomColor = 'transparent';
                      } else {
                        e.currentTarget.style.borderBottomColor = '#000';
                      }
                    }}
                  >
                    {t('nav.login') || 'ورود'}
                    <ChevronDownIcon className="w-4 h-4" />
                  </button>
                  
                  {/* Simple Login Dropdown Menu */}
                  {isLoginDropdownOpen && (
                    <div 
                      className={`absolute ${language === 'en' ? 'left-0' : 'right-0'} top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50`}
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
                        className={`w-full ${language === 'en' ? 'text-left' : 'text-right'} px-4 py-2 text-sm text-black hover:bg-gray-100 transition-colors ${fontClass}`}
                      >
                        {t('nav.loginUsers')}
                      </button>
                      <button
                        onClick={() => {
                          // No action for now - will be linked later
                          setIsLoginDropdownOpen(false);
                        }}
                        className={`w-full ${language === 'en' ? 'text-left' : 'text-right'} px-4 py-2 text-sm text-black hover:bg-gray-100 transition-colors ${fontClass}`}
                      >
                        {t('nav.loginPartner')}
                      </button>
                      <button
                        onClick={() => {
                          window.location.href = '/limited-admin/';
                          setIsLoginDropdownOpen(false);
                        }}
                        className={`w-full ${language === 'en' ? 'text-left' : 'text-right'} px-4 py-2 text-sm text-black hover:bg-gray-100 transition-colors ${fontClass}`}
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
                  className={`text-black text-sm font-medium hover:text-black transition-all ${fontClass}`}
                  style={{ 
                    textTransform: 'uppercase',
                    borderBottom: '2px solid transparent',
                    paddingBottom: '2px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderBottomColor = '#000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderBottomColor = 'transparent';
                  }}
                >
                  ثبت‌نام
                </button>
              </>
            )}
          </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-white hover:text-gray-300"
            >
              {isMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-700 py-4 bg-gray-900">
            <div className="px-4">
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <div key={item.key}>
                    <Link
                      to={item.path}
                      className={`block px-4 py-2 text-base font-medium text-white hover:bg-gray-800 hover:text-gray-300 transition-colors ${fontClass}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                    {item.dropdown && (
                      <div className="pr-4 mt-1 space-y-1">
                        {item.dropdown.map((subItem, index) => (
                          <Link
                            key={index}
                            to={subItem.path}
                            className={`block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${fontClass}`}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {subItem.label}
                          </Link>
                        ))}
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
                          // No action for now - will be linked later
                          setIsMenuOpen(false);
                        }}
                        className={`block w-full ${language === 'en' ? 'text-left' : 'text-right'} px-4 py-2 text-base font-medium text-white hover:bg-gray-800 hover:text-gray-300 transition-colors ${fontClass}`}
                      >
                        {t('nav.loginPartner')}
                      </button>
                      <button
                        onClick={() => {
                          window.location.href = '/limited-admin/';
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
    </header>
  );
};

export default EmiratesHeader;

