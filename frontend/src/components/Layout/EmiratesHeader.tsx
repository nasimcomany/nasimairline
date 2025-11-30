import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { 
  Bars3Icon, 
  XMarkIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';

const EmiratesHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const languageDropdownTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { language, t, fontClass, setLanguage } = useLanguage();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
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
        { label: t('nav.faq') || 'سوالات متداول', path: '/support/faq' },
        { label: t('nav.travelInfo') || 'اطلاعات سفر', path: '/support/travel-info' },
      ]
    }
  ];

  const handleMouseEnter = (key: string) => {
    setActiveDropdown(key);
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
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 relative">
      <div className="flex h-16 relative">
        {/* Dark Navigation Section - Glassmorphism */}
        <div className="flex-1 bg-gray-900/80 backdrop-blur-lg border-b border-white/10 shadow-lg flex items-center justify-between">
          <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">

          {/* Desktop Navigation - White text */}
          <nav className="hidden lg:flex items-center space-x-1 space-x-reverse h-full">
            {menuItems.map((item) => (
              <div
                key={item.key}
                className="relative h-full flex items-center"
                onMouseEnter={() => handleMouseEnter(item.key)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  to={item.path}
                  className={`px-4 py-2 text-sm font-medium text-white hover:text-gray-300 transition-colors h-full flex items-center ${fontClass}`}
                  style={{ 
                    borderBottom: activeDropdown === item.key ? '2px solid white' : '2px solid transparent',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  {item.label}
                </Link>
                
                {/* Dropdown Menu */}
                {activeDropdown === item.key && item.dropdown && (
                  <div className={`absolute top-full ${language === 'en' ? 'left-0' : 'right-0'} mt-0 w-56 bg-gray-800/90 backdrop-blur-lg rounded-b-lg shadow-xl border-t-2 border-blue-600 border border-white/10 py-2 z-50`}>
                    {item.dropdown.map((subItem, index) => (
                      <Link
                        key={index}
                        to={subItem.path}
                        className={`block px-4 py-2 text-sm text-white hover:bg-gray-700 hover:text-blue-400 transition-colors ${fontClass} ${language === 'en' ? 'text-left' : 'text-right'}`}
                        onClick={() => setActiveDropdown(null)}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

            {/* Right Side Actions - White text */}
            <div className="hidden lg:flex items-center space-x-6 space-x-reverse relative">
              {/* Blue Flag Section - Next to "فارسی" */}
              <div 
                className={`bg-blue-600 flex flex-col items-center justify-end absolute ${language === 'en' ? 'right-full' : 'left-full'}`}
                style={{ 
                  width: '80px', // Narrower from sides
                  height: '130px', // Longer from bottom
                  top: '-40px', // 4cm higher (40px)
                  marginRight: language === 'en' ? '0' : '12px',
                  marginLeft: language === 'en' ? '12px' : '0',
                  padding: '8px',
                  paddingBottom: 'calc(-150px + 1cm)', // Extra padding at bottom + 2cm
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
                      width: '100px',
                      height: 'auto',
                      maxWidth: '100px'
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
                  className={`text-white text-sm font-medium hover:text-gray-300 transition-colors ${fontClass}`} 
                  style={{ textTransform: 'uppercase' }}
                >
                  فارسی
                </button>
                
                {/* Language Dropdown Menu */}
                {isLanguageDropdownOpen && (
                  <div 
                    className={`absolute ${language === 'en' ? 'left-0' : 'right-0'} top-full mt-2 w-40 bg-gray-800/90 backdrop-blur-lg rounded-lg shadow-xl border border-white/10 py-2 z-50`}
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
                      className={`w-full text-right px-4 py-2 text-sm text-white hover:bg-gray-700 hover:text-blue-400 transition-colors ${fontClass} ${
                        language === 'fa' ? 'bg-gray-700 text-blue-400 font-semibold' : ''
                      }`}
                    >
                      فارسی
                    </button>
                    <button
                      onClick={() => {
                        setLanguage('ar');
                        setIsLanguageDropdownOpen(false);
                      }}
                      className={`w-full text-right px-4 py-2 text-sm text-white hover:bg-gray-700 hover:text-blue-400 transition-colors ${fontClass} ${
                        language === 'ar' ? 'bg-gray-700 text-blue-400 font-semibold' : ''
                      }`}
                    >
                      العربية
                    </button>
                    <button
                      onClick={() => {
                        setLanguage('en');
                        setIsLanguageDropdownOpen(false);
                      }}
                      className={`w-full text-right px-4 py-2 text-sm text-white hover:bg-gray-700 hover:text-blue-400 transition-colors ${fontClass} ${
                        language === 'en' ? 'bg-gray-700 text-blue-400 font-semibold' : ''
                      }`}
                    >
                      English
                    </button>
                  </div>
                )}
              </div>

            {/* Search */}
            <button className="text-white hover:text-gray-300 transition-colors">
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>
            <span className={`text-white text-sm font-medium ${fontClass}`} style={{ textTransform: 'uppercase' }}>
              {t('nav.search') || 'SEARCH'}
            </span>

            {/* Login/Register/Logout */}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className={`text-white text-sm font-medium hover:text-gray-300 transition-colors ${fontClass}`}
                style={{ textTransform: 'uppercase' }}
              >
                خروج
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`text-white text-sm font-medium hover:text-gray-300 transition-colors ${fontClass}`}
                  style={{ textTransform: 'uppercase' }}
                >
                  {t('nav.login') || 'ورود'}
                </Link>
                <Link
                  to="/register"
                  className={`text-white text-sm font-medium hover:text-gray-300 transition-colors ${fontClass}`}
                  style={{ textTransform: 'uppercase' }}
                >
                  ثبت‌نام
                </Link>
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
                      className={`w-full text-right px-4 py-2 text-base font-medium text-white hover:bg-gray-800 hover:text-gray-300 transition-colors ${fontClass}`}
                    >
                      خروج
                    </button>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className={`block px-4 py-2 text-base font-medium text-white hover:bg-gray-800 hover:text-gray-300 transition-colors ${fontClass}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t('nav.login') || 'ورود'}
                      </Link>
                      <Link
                        to="/register"
                        className={`block px-4 py-2 text-base font-medium text-white hover:bg-gray-800 hover:text-gray-300 transition-colors ${fontClass}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        ثبت‌نام
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default EmiratesHeader;

