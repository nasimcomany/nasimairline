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
  UserPlusIcon,
  NewspaperIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import AuthModal from '../Auth/AuthModal';

interface EmiratesHeaderProps {
  onWeatherClick?: () => void;
}

const EmiratesHeader: React.FC<EmiratesHeaderProps> = ({ onWeatherClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
  const [hoveredSubItem, setHoveredSubItem] = useState<{key: string, index: number} | null>(null);
  const [selectedDestinationIndex, setSelectedDestinationIndex] = useState<number | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isScrolled, setIsScrolled] = useState(false);
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
        { image: '/images/airplane-clouds-night_864588-19786.jpg', name: language === 'fa' ? 'دبی' : language === 'ar' ? 'دبي' : 'Dubai' },
        { image: '/images/skyward-soar-airplane-flying-blue-sky-clouds_391229-21566.jpg', name: language === 'fa' ? 'استانبول' : language === 'ar' ? 'إسطنبول' : 'Istanbul' },
        { image: '/images/airport-crew.jpg', name: language === 'fa' ? 'پاریس' : language === 'ar' ? 'باريس' : 'Paris' },
        { image: '/images/collection-of-aerospace-and-aviation-website-templates-vayudoot-aviation.jpeg', name: language === 'fa' ? 'لندن' : language === 'ar' ? 'لندن' : 'London' },
        { image: '/images/airport-plane-photo_991869-62.jpg', name: language === 'fa' ? 'نیویورک' : language === 'ar' ? 'نيويورك' : 'New York' },
        { image: '/images/airplane-clouds-night_864588-19786.jpg', name: language === 'fa' ? 'توکیو' : language === 'ar' ? 'طوكيو' : 'Tokyo' }
      ],
      2: [ // همه مقاصد
        { image: '/images/tehran.jpg', name: language === 'fa' ? 'تهران' : language === 'ar' ? 'طهران' : 'Tehran' },
        { image: '/images/mashhad.jpeg', name: language === 'fa' ? 'مشهد' : language === 'ar' ? 'مشهد' : 'Mashhad' },
        { image: '/images/airplane-clouds-night_864588-19786.jpg', name: language === 'fa' ? 'دبی' : language === 'ar' ? 'دبي' : 'Dubai' },
        { image: '/images/kish.jpg', name: language === 'fa' ? 'کیش' : language === 'ar' ? 'كيش' : 'Kish' },
        { image: '/images/skyward-soar-airplane-flying-blue-sky-clouds_391229-21566.jpg', name: language === 'fa' ? 'استانبول' : language === 'ar' ? 'إسطنبول' : 'Istanbul' },
        { image: '/images/isfahan.jpg', name: language === 'fa' ? 'اصفهان' : language === 'ar' ? 'أصفهان' : 'Isfahan' }
      ]
    };
    
    const index = subItemIndex !== undefined ? subItemIndex : 0;
    return destinationData[index] || destinationData[0];
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
        { label: t('nav.domesticDestinations') || 'مقاصد داخلی', path: '/destinations?type=domestic' },
        { label: t('nav.internationalDestinations') || 'مقاصد خارجی', path: '/destinations?type=international' },
        { label: t('nav.allDestinations') || 'همه مقاصد', path: '/destinations' },
      ]
    },
    {
      key: 'help',
      label: t('nav.help') || 'کمک',
      path: '/support',
      dropdown: [
        { label: t('nav.contactUs') || 'تماس با ما', path: '/#faq' },
        { label: t('nav.faq') || 'سوالات متداول', path: '/#faq' },
        { label: t('nav.weather') || 'وضعیت آب و هوا', path: '/#weather' },
        { label: t('nav.complaint') || 'ثبت شکایت', path: '/tickets' },
        { label: t('nav.magazine') || 'مجله', path: '/magazine' },
        { label: t('nav.photoGallery') || 'گالری عکس', path: '/gallery' },
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
    setSelectedDestinationIndex(null); // Reset selected destination when dropdown closes
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

  // Handle scroll to collapse flag
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50); // Start collapsing after 50px scroll
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 relative" style={{ overflow: 'visible' }}>
      <div className="flex h-20 relative" style={{ overflow: 'visible' }}>
        {/* Dark Navigation Section - Glassmorphism */}
        <div className="flex-1 bg-gray-400/30 backdrop-blur-xl border-b border-gray-300/30 shadow-2xl flex items-center justify-between">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-center relative">

          {/* Logo with Blue Flag - Smaller copy in center */}
          <div 
            className="hidden lg:flex items-center absolute right-[290px]" 
            style={{ 
              bottom: '-60px',
              transform: isScrolled ? 'translateY(-120px)' : 'translateY(0)',
              transition: 'transform 2.0s ease-in-out'
            }}
          >
            <Link to="/" className="flex items-center">
              <div 
                className="bg-blue-900 flex items-center justify-center"
                style={{ 
                  height: '120px',
                  paddingLeft: '20px',
                  paddingRight: '10px',
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
                  alt="نسیم ایر" 
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
                    className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 ${item.key === 'wherewefly' ? 'w-[1400px]' : 'w-[900px]'} bg-gray-200 rounded-xl shadow-2xl border border-gray-300/30 z-50 overflow-hidden`}
                    onMouseLeave={() => {
                      handleMouseLeave();
                      setHoveredSubItem(null);
                    }}
                  >
                    <div className="flex">
                      {/* Menu Items Section */}
                      <div className={`${item.key === 'wherewefly' ? 'w-80' : 'flex-1'} py-6 px-6`}>
                        <div className="space-y-2">
                          {item.dropdown.map((subItem, index) => {
                            // Get icon for each submenu item based on path and key (language-independent)
                            const getSubItemIcon = (label: string, key: string, itemIndex: number, path: string) => {
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
                                // Use path and index to determine icon
                                if (path === '/#faq' && itemIndex === 0) return <MapPinIcon className="w-7 h-7 text-green-500" />; // تماس با ما
                                if (path === '/#faq' && itemIndex === 1) return <ClipboardDocumentIcon className="w-7 h-7 text-orange-500" />; // سوالات متداول
                                if (path === '/#weather') return <CloudIcon className="w-7 h-7 text-blue-500" />; // وضعیت آب و هوا
                                if (path === '/tickets') return <TicketIcon className="w-7 h-7 text-purple-500" />; // ثبت شکایت
                                if (path === '/magazine') return <NewspaperIcon className="w-7 h-7 text-indigo-500" />; // مجله
                                if (path === '/gallery') return <PhotoIcon className="w-7 h-7 text-cyan-500" />; // گالری عکس
                                return <QuestionMarkCircleIcon className="w-7 h-7 text-blue-500" />;
                              }
                              return null;
                            };
                            
                            return (
                              <Link
                                key={index}
                                to={subItem.path}
                                className={`flex items-center gap-3 px-4 py-4 text-base text-black hover:bg-gray-300 rounded-lg transition-all duration-200 ${fontClass} ${language === 'en' ? 'text-left' : 'text-right'} ${item.key === 'wherewefly' && selectedDestinationIndex === index ? 'bg-gray-300' : ''}`}
                                onClick={(e) => {
                                  // For wherewefly dropdown, keep it open and set selected index
                                  if (item.key === 'wherewefly') {
                                    e.preventDefault();
                                    setSelectedDestinationIndex(index);
                                    setActiveDropdown(item.key); // Keep dropdown open
                                    return;
                                  }
                                  
                                  setActiveDropdown(null);
                                  // Handle weather modal
                                  if (subItem.path === '/#weather' && onWeatherClick) {
                                    e.preventDefault();
                                    onWeatherClick();
                                    return;
                                  }
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
                                {getSubItemIcon(subItem.label, item.key, index, subItem.path)}
                                <span className="font-medium">{subItem.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Image Section */}
                      {item.key === 'wherewefly' ? (
                        // Multiple images grid for destinations - Larger size
                        <div className="flex-1 h-[600px] bg-gray-100 flex-shrink-0 relative overflow-hidden m-4 rounded-2xl p-4">
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
                                        fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
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
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    <UserIcon className="w-5 h-5 text-black" />
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
                          // No action for now - will be linked later
                          setIsLoginDropdownOpen(false);
                        }}
                        className={`w-full ${language === 'en' ? 'text-left' : 'text-right'} px-4 py-2 text-sm text-black hover:bg-gray-300 transition-colors ${fontClass}`}
                      >
                        {t('nav.loginPartner')}
                      </button>
                      <button
                        onClick={() => {
                          window.location.href = '/limited-admin/';
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

