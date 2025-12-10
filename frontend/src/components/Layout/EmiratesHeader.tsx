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
  HomeIcon,
  GlobeAltIcon,
  UserIcon,
  UserPlusIcon
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
      key: 'help',
      label: t('nav.help') || 'کمک',
      path: '/support',
      dropdown: [
        { label: t('nav.helpCenter') || 'مرکز کمک', path: '/support' },
        { label: t('nav.contactUs') || 'تماس با ما', path: '/#faq' },
        { label: t('nav.faq') || 'سوالات متداول', path: '/#faq' },
        { label: t('nav.travelInfo') || 'اطلاعات سفر', path: '/support/travel-info' },
        { label: t('nav.weather') || 'وضعیت آب و هوا', path: '/#weather' },
        { label: t('nav.complaint') || 'ثبت شکایت', path: '/tickets' },
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
        <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-center relative">

          {/* Logo with Blue Flag - Horizontal on the right */}
          <div className="hidden lg:flex items-center absolute right-0">
            <div 
              className="bg-blue-900 flex items-center justify-center px-3 py-2"
              style={{ 
                height: '80px',
                boxShadow: '2px 2px 8px rgba(0,0,0,0.2)',
                zIndex: 60,
                borderTopLeftRadius: '20px',
                borderBottomLeftRadius: '20px'
              }}
            >
              <Link to="/" className="flex items-center">
                <img 
                  src="/images/nasim0.png" 
                  alt="نسیم ایر" 
                  className="object-contain"
                  style={{ 
                    width: '120px',
                    height: 'auto',
                    maxWidth: '120px'
                  }}
                />
              </Link>
            </div>
          </div>

          {/* Desktop Navigation - All items together and centered */}
          <nav className="hidden lg:flex items-center justify-center space-x-3 space-x-reverse h-full">
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
                  {item.key === 'book' && <TicketIcon className="w-5 h-5 text-black" />}
                  {item.key === 'wherewefly' && <MapPinIcon className="w-5 h-5 text-black" />}
                  {item.key === 'about' && <BuildingOfficeIcon className="w-5 h-5 text-black" />}
                  {item.key === 'help' && <QuestionMarkCircleIcon className="w-5 h-5 text-black" />}
                  {item.label}
                </Link>
                
                {/* Dropdown Menu with Image */}
                {activeDropdown === item.key && item.dropdown && item.dropdown.length > 0 && (
                  <div 
                    className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-[900px] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden`}
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
                            // Get icon for each submenu item based on index and key (language-independent)
                            const getSubItemIcon = (label: string, key: string, itemIndex: number) => {
                              if (key === 'book') {
                                if (itemIndex === 0) return <TicketIcon className="w-7 h-7 text-blue-600" />;
                                if (itemIndex === 1) return <CalendarDaysIcon className="w-7 h-7 text-green-600" />;
                                if (itemIndex === 2) return <GiftIcon className="w-7 h-7 text-purple-600" />;
                                if (itemIndex === 3) return <SparklesIcon className="w-7 h-7 text-pink-600" />;
                              }
                              if (key === 'wherewefly') {
                                return <MapPinIcon className="w-7 h-7 text-orange-600" />;
                              }
                              if (key === 'about') {
                                return <BuildingOfficeIcon className="w-7 h-7 text-gray-700" />;
                              }
                              if (key === 'help') {
                                if (itemIndex === 0) return <CloudIcon className="w-7 h-7 text-blue-500" />;
                                if (itemIndex === 1) return <ExclamationTriangleIcon className="w-7 h-7 text-red-500" />;
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
                                {getSubItemIcon(subItem.label, item.key, index)}
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

            {/* Language Dropdown */}
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
                  className={`px-4 py-2 text-base font-medium text-black hover:text-black transition-all h-full flex items-center gap-2 ${fontClass}`} 
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
                    className={`px-4 py-2 text-base font-medium text-black hover:text-black transition-all h-full flex items-center gap-2 ${fontClass}`}
                    style={{ 
                      borderBottom: '2px solid transparent',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
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
                    <UserIcon className="w-5 h-5 text-black" />
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
                  className={`px-4 py-2 text-base font-medium text-black hover:text-black transition-all h-full flex items-center gap-2 ${fontClass}`}
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
                  <UserPlusIcon className="w-5 h-5 text-black" />
                  {t('nav.register')}
                </button>
              </>
            )}
          </nav>

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

