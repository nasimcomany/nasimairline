import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
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
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const { language, t, fontClass } = useLanguage();

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

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 space-x-reverse">
            <img 
              src="/images/favpng_9ba01589d5c7c5e413ee0b9efe7bd497.png" 
              alt="نسیم ایر" 
              className="h-10 w-10 object-contain"
            />
            <div>
              <div className={`text-xl font-bold text-gray-900 ${fontClass}`}>
                {language === 'fa' ? 'نسیم ایر' : language === 'ar' ? 'نسيم إير' : 'Nasim Air'}
              </div>
              <div className={`text-xs text-gray-500 ${fontClass}`}>
                NASIM AIR
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 space-x-reverse">
            {menuItems.map((item) => (
              <div
                key={item.key}
                className="relative"
                onMouseEnter={() => handleMouseEnter(item.key)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  to={item.path}
                  className={`px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors ${fontClass}`}
                >
                  {item.label}
                  <ChevronDownIcon className="inline-block w-4 h-4 mr-1" />
                </Link>
                
                {/* Dropdown Menu */}
                {activeDropdown === item.key && item.dropdown && (
                  <div className={`absolute top-full ${language === 'en' ? 'left-0' : 'right-0'} mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50`}>
                    {item.dropdown.map((subItem, index) => (
                      <Link
                        key={index}
                        to={subItem.path}
                        className={`block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${fontClass} ${language === 'en' ? 'text-left' : 'text-right'}`}
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

          {/* Right Side Actions */}
          <div className="hidden lg:flex items-center space-x-4 space-x-reverse">
            {/* Search */}
            <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>

            {/* Login/User */}
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className={`px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors ${fontClass}`}
              >
                {user?.first_name || t('nav.loginUsers')}
              </Link>
            ) : (
              <Link
                to="/login"
                className={`px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors ${fontClass}`}
              >
                {t('nav.loginUsers') || 'ورود'}
              </Link>
            )}

            {/* Language Selector */}
            <div className="flex items-center space-x-2 space-x-reverse border-r border-gray-300 pr-4">
              <span className={`text-sm text-gray-600 ${fontClass}`}>
                {language === 'fa' ? 'فا' : language === 'ar' ? 'ع' : 'EN'}
              </span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            {isMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <div key={item.key}>
                  <Link
                    to={item.path}
                    className={`block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors ${fontClass}`}
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
                          className={`block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors ${fontClass}`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className={`block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors ${fontClass}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {user?.first_name || t('nav.loginUsers')}
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className={`block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors ${fontClass}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.loginUsers') || 'ورود'}
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default EmiratesHeader;

