import React, { useState, useEffect, useRef } from 'react';
import { Bars3Icon, XMarkIcon, ChevronDownIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useLanguage, Language } from '../../contexts/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';

const GlassmorphismHeader: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isLoginMenuOpen, setIsLoginMenuOpen] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const loginMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const loginMenuRef = useRef<HTMLDivElement>(null);
  
  const { language, setLanguage, t, fontClass } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const slides = [
    { id: 'home', title: 'صفحه اصلی', path: '/home' },
    { id: 'flights', title: 'پروازها', path: '/flights/search' },
    { id: 'booking', title: 'رزرو', path: '/booking' },
    { id: 'destinations', title: 'مقاصد', path: '/destinations' },
    { id: 'services', title: 'خدمات', path: '/services' },
    { id: 'offers', title: 'پیشنهادات', path: '/offers' },
    { id: 'gallery', title: 'گالری', path: '/gallery' },
    { id: 'news', title: 'اخبار', path: '/news' },
    { id: 'membership', title: 'عضویت', path: '/membership' },
    { id: 'support', title: 'پشتیبانی', path: '/support' },
    { id: 'tickets', title: 'تیکتینگ', path: '/tickets' }
  ];

  const currentSlideIndex = slides.findIndex(slide => slide.path === location.pathname);
  const currentSlide = currentSlideIndex >= 0 ? currentSlideIndex : 0;

  const languages = [
    { code: 'fa' as Language, name: t('lang.farsi') },
    { code: 'ar' as Language, name: t('lang.arabic') },
    { code: 'en' as Language, name: t('lang.english') }
  ];

  const handleLanguageChange = (langCode: Language) => {
    setLanguage(langCode);
    setIsLanguageMenuOpen(false);
  };

  const getCurrentLanguageName = () => {
    return languages.find(lang => lang.code === language)?.name || t('lang.farsi');
  };

  const nextSlide = () => {
    const nextIndex = (currentSlide + 1) % slides.length;
    navigate(slides[nextIndex].path);
  };

  const prevSlide = () => {
    const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
    navigate(slides[prevIndex].path);
  };

  // Handle navigation - scroll to section if on homepage, otherwise navigate
  const handleNavigation = (path: string, sectionId?: string) => {
    const isHomePage = location.pathname === '/' || location.pathname === '/home';
    
    const scrollToSection = (id: string) => {
      const element = document.getElementById(id);
      if (element) {
        const headerHeight = 100; // Approximate header height
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    };
    
    if (isHomePage && sectionId) {
      // Scroll to section on homepage
      scrollToSection(sectionId);
    } else {
      // Navigate to page
      if (path === '/home' || path === '/') {
        navigate('/');
        // Wait for navigation then scroll
        setTimeout(() => {
          if (sectionId) {
            scrollToSection(sectionId);
          }
        }, 100);
      } else {
        navigate(path);
      }
    }
  };

  // Close language menu and login menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false);
      }
      if (loginMenuRef.current && !loginMenuRef.current.contains(event.target as Node)) {
        if (loginMenuTimeoutRef.current) {
          clearTimeout(loginMenuTimeoutRef.current);
        }
        setIsLoginMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (loginMenuTimeoutRef.current) {
        clearTimeout(loginMenuTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="absolute top-0 left-0 right-0 z-50">
      
      {/* Main header - Single Row Layout */}
      <div className="relative px-8 py-4">
        {/* Glass background */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-lg border-b border-white/10 shadow-2xl"></div>
        
        {/* Content */}
        <div className="relative z-10 flex items-center justify-between max-w-7xl mx-auto">
          
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <img 
              src="/images/favpng_9ba01589d5c7c5e413ee0b9efe7bd497.png" 
              alt="هواپیمایی نسیم" 
              className="w-12 h-12 object-contain"
            />
            <div className="text-white">
              <div className={`text-lg font-medium text-white ${fontClass}`}>
                {language === 'fa' ? 'هواپیمایی نسیم' : language === 'ar' ? 'نسيم إير' : 'Nasim Air'}
              </div>
              <div className={`text-xs text-blue-200 font-light tracking-wider ${fontClass}`}>
                NASIM AIR
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden xl:flex items-center space-x-4">
            <button onClick={() => handleNavigation('/home', 'home')} className={`text-white/85 hover:text-white transition-all duration-300 font-medium relative group ${fontClass} px-2 py-2 text-sm`}>
              {t('nav.home')}
              <span className="absolute -bottom-1 left-2 right-2 h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300 group-hover:scale-x-100 scale-x-0"></span>
            </button>
            <button onClick={() => handleNavigation('/flights/search', 'flights')} className={`text-white/85 hover:text-white transition-all duration-300 font-medium relative group ${fontClass} px-2 py-2 text-sm`}>
              {t('nav.flights')}
              <span className="absolute -bottom-1 left-2 right-2 h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300 group-hover:scale-x-100 scale-x-0"></span>
            </button>
            <button onClick={() => handleNavigation('/booking', 'booking')} className={`text-white/85 hover:text-white transition-all duration-300 font-medium relative group ${fontClass} px-2 py-2 text-sm`}>
              {t('nav.booking')}
              <span className="absolute -bottom-1 left-2 right-2 h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300 group-hover:scale-x-100 scale-x-0"></span>
            </button>
            <button onClick={() => handleNavigation('/destinations', 'destinations')} className={`text-white/85 hover:text-white transition-all duration-300 font-medium relative group ${fontClass} px-2 py-2 text-sm`}>
              {t('nav.destinations')}
              <span className="absolute -bottom-1 left-2 right-2 h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300 group-hover:scale-x-100 scale-x-0"></span>
            </button>
            <button onClick={() => handleNavigation('/services', 'services')} className={`text-white/85 hover:text-white transition-all duration-300 font-medium relative group ${fontClass} px-2 py-2 text-sm`}>
              {t('nav.services')}
              <span className="absolute -bottom-1 left-2 right-2 h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300 group-hover:scale-x-100 scale-x-0"></span>
            </button>
            <button onClick={() => handleNavigation('/offers', 'offers')} className={`text-white/85 hover:text-white transition-all duration-300 font-medium relative group ${fontClass} px-2 py-2 text-sm`}>
              {t('nav.offers')}
              <span className="absolute -bottom-1 left-2 right-2 h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300 group-hover:scale-x-100 scale-x-0"></span>
            </button>
            <button onClick={() => handleNavigation('/gallery', 'gallery')} className={`text-white/85 hover:text-white transition-all duration-300 font-medium relative group ${fontClass} px-2 py-2 text-sm`}>
              {t('nav.gallery')}
              <span className="absolute -bottom-1 left-2 right-2 h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300 group-hover:scale-x-100 scale-x-0"></span>
            </button>
            <button onClick={() => handleNavigation('/news', 'news')} className={`text-white/85 hover:text-white transition-all duration-300 font-medium relative group ${fontClass} px-2 py-2 text-sm`}>
              {t('nav.news')}
              <span className="absolute -bottom-1 left-2 right-2 h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300 group-hover:scale-x-100 scale-x-0"></span>
            </button>
            <button onClick={() => handleNavigation('/membership', 'membership')} className={`text-white/85 hover:text-white transition-all duration-300 font-medium relative group ${fontClass} px-2 py-2 text-sm`}>
              {t('nav.membership')}
              <span className="absolute -bottom-1 left-2 right-2 h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300 group-hover:scale-x-100 scale-x-0"></span>
            </button>
            <button onClick={() => handleNavigation('/support', 'support')} className={`text-white/85 hover:text-white transition-all duration-300 font-medium relative group ${fontClass} px-2 py-2 text-sm`}>
              {t('nav.support')}
              <span className="absolute -bottom-1 left-2 right-2 h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300 group-hover:scale-x-100 scale-x-0"></span>
            </button>
          </nav>

          {/* Action Buttons & Mobile Menu */}
          <div className="flex items-center space-x-0">
            {/* Login Dropdown */}
            <div 
              className="relative hidden md:block" 
              ref={loginMenuRef}
              onMouseEnter={() => {
                if (loginMenuTimeoutRef.current) {
                  clearTimeout(loginMenuTimeoutRef.current);
                  loginMenuTimeoutRef.current = null;
                }
                setIsLoginMenuOpen(true);
              }}
              onMouseLeave={() => {
                loginMenuTimeoutRef.current = setTimeout(() => {
                  setIsLoginMenuOpen(false);
                }, 200); // 200ms delay before closing
              }}
            >
              <button 
                className={`px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium ${fontClass} rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl text-sm flex items-center gap-1`}
              >
                {t('nav.loginUsers')}
                <ChevronDownIcon className="h-3 w-3" />
              </button>
              
              {/* Login Dropdown Menu */}
              {isLoginMenuOpen && (
                <div 
                  className={`absolute top-full ${language === 'en' ? 'left-0' : 'right-0'} mt-1 w-48 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-white/20 overflow-hidden z-50`}
                >
                  <button
                    onClick={() => {
                      setShowTermsModal(true);
                      setIsLoginMenuOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 ${language === 'en' ? 'text-left' : 'text-right'} hover:bg-blue-50 transition-colors duration-200 ${fontClass} text-gray-700 text-sm border-b border-gray-100`}
                  >
                    {t('nav.loginUsers')}
                  </button>
                  <button
                    onClick={() => {
                      window.location.href = '/limited-admin/';
                      setIsLoginMenuOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 ${language === 'en' ? 'text-left' : 'text-right'} hover:bg-blue-50 transition-colors duration-200 ${fontClass} text-gray-700 text-sm border-b border-gray-100`}
                  >
                    {t('nav.loginStaff')}
                  </button>
                  <button
                    onClick={() => {
                      navigate('/admin/login?type=admin');
                      setIsLoginMenuOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 ${language === 'en' ? 'text-left' : 'text-right'} hover:bg-blue-50 transition-colors duration-200 ${fontClass} text-gray-700 text-sm`}
                  >
                    {t('nav.loginAdmin')}
                  </button>
                </div>
              )}
            </div>
            <button 
              onClick={() => navigate('/register')} 
              className={`hidden md:block px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium ${fontClass} rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl text-sm`}
            >
              {t('nav.register')}
            </button>
            
            {/* Language Selector */}
            <div className="relative hidden md:block" ref={languageMenuRef}>
              <button 
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className={`flex items-center px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium ${fontClass} rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl text-sm`}
              >
                <span className="mr-1">{getCurrentLanguageName()}</span>
                <ChevronDownIcon className="h-3 w-3" />
              </button>
            
              {/* Language Dropdown */}
              {isLanguageMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-28 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-white/20 overflow-hidden z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full px-3 py-2 text-right hover:bg-blue-50 transition-colors duration-200 ${fontClass} text-sm ${
                        language === lang.code ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 text-white/85 hover:text-white transition-all duration-300"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white/10 backdrop-blur-lg border-b border-white/10 shadow-2xl">
            <div className="px-8 py-6 space-y-4">
              {/* Mobile Navigation */}
              <nav className="space-y-4">
                <button onClick={() => {handleNavigation('/home', 'home'); setIsMobileMenuOpen(false);}} className={`block w-full text-right text-white/85 hover:text-white transition-all duration-300 font-medium ${fontClass} py-2 border-b border-white/10`}>
                  {t('nav.home')}
                </button>
                <button onClick={() => {handleNavigation('/flights/search', 'flights'); setIsMobileMenuOpen(false);}} className={`block w-full text-right text-white/85 hover:text-white transition-all duration-300 font-medium ${fontClass} py-2 border-b border-white/10`}>
                  {t('nav.flights')}
                </button>
                <button onClick={() => {handleNavigation('/booking', 'booking'); setIsMobileMenuOpen(false);}} className={`block w-full text-right text-white/85 hover:text-white transition-all duration-300 font-medium ${fontClass} py-2 border-b border-white/10`}>
                  {t('nav.booking')}
                </button>
                <button onClick={() => {handleNavigation('/destinations', 'destinations'); setIsMobileMenuOpen(false);}} className={`block w-full text-right text-white/85 hover:text-white transition-all duration-300 font-medium ${fontClass} py-2 border-b border-white/10`}>
                  {t('nav.destinations')}
                </button>
                <button onClick={() => {handleNavigation('/services', 'services'); setIsMobileMenuOpen(false);}} className={`block w-full text-right text-white/85 hover:text-white transition-all duration-300 font-medium ${fontClass} py-2 border-b border-white/10`}>
                  {t('nav.services')}
                </button>
                <button onClick={() => {handleNavigation('/offers', 'offers'); setIsMobileMenuOpen(false);}} className={`block w-full text-right text-white/85 hover:text-white transition-all duration-300 font-medium ${fontClass} py-2 border-b border-white/10`}>
                  {t('nav.offers')}
                </button>
                <button onClick={() => {handleNavigation('/gallery', 'gallery'); setIsMobileMenuOpen(false);}} className={`block w-full text-right text-white/85 hover:text-white transition-all duration-300 font-medium ${fontClass} py-2 border-b border-white/10`}>
                  {t('nav.gallery')}
                </button>
                <button onClick={() => {handleNavigation('/news', 'news'); setIsMobileMenuOpen(false);}} className={`block w-full text-right text-white/85 hover:text-white transition-all duration-300 font-medium ${fontClass} py-2 border-b border-white/10`}>
                  {t('nav.news')}
                </button>
                <button onClick={() => {handleNavigation('/membership', 'membership'); setIsMobileMenuOpen(false);}} className={`block w-full text-right text-white/85 hover:text-white transition-all duration-300 font-medium ${fontClass} py-2 border-b border-white/10`}>
                  {t('nav.membership')}
                </button>
                <button onClick={() => {handleNavigation('/support', 'support'); setIsMobileMenuOpen(false);}} className={`block w-full text-right text-white/85 hover:text-white transition-all duration-300 font-medium ${fontClass} py-2 border-b border-white/10`}>
                  {t('nav.support')}
                </button>
              </nav>
              
              {/* Mobile Action Buttons */}
              <div className="pt-4 space-y-4">
                <div className={`text-white/70 text-sm font-medium ${fontClass} mb-2`}>{t('nav.loginUsers')}:</div>
                <button onClick={() => {setShowTermsModal(true); setIsMobileMenuOpen(false);}} className={`w-full px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium ${fontClass} rounded-lg transition-all duration-300 shadow-lg`}>
                  {t('nav.loginUsers')}
                </button>
                <button onClick={() => {window.location.href = '/limited-admin/'; setIsMobileMenuOpen(false);}} className={`w-full px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium ${fontClass} rounded-lg transition-all duration-300 shadow-lg`}>
                  {t('nav.loginStaff')}
                </button>
                <button onClick={() => {navigate('/admin/login?type=admin'); setIsMobileMenuOpen(false);}} className={`w-full px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium ${fontClass} rounded-lg transition-all duration-300 shadow-lg`}>
                  {t('nav.loginAdmin')}
                </button>
                <button onClick={() => {navigate('/register'); setIsMobileMenuOpen(false);}} className={`w-full px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium ${fontClass} rounded-lg transition-all duration-300 shadow-lg`}>
                  {t('nav.register')}
                </button>
                
                {/* Mobile Language Selector */}
                <div className="space-y-2">
                  <div className={`text-white/70 text-sm font-medium ${fontClass} mb-2`}>{t('nav.language')}:</div>
                  <div className="grid grid-cols-3 gap-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium ${fontClass} transition-all duration-300 ${
                          language === lang.code 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white/20 text-white/85 hover:bg-white/30'
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✨ مودال شرایط هواپیمایی - در انتهای کامپوننت */}
      {showTermsModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setShowTermsModal(false)}
        >
          <div 
            className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md p-6 relative border border-white/40"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              background: 'linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(240,248,255,0.85) 100%)',
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.35)'
            }}
          >
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-blue-100 rounded-full opacity-70 blur-2xl"></div>
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-sky-100 rounded-full opacity-60 blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center mb-5 pb-3 border-b border-blue-100">
                <div className="bg-blue-600 text-white rounded-full p-2 mr-3 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className={`text-xl font-bold text-gray-800 ${fontClass}`}>
                  شرایط برنامه وفاداری هواپیمایی نسیم
                </h2>
              </div>
              
              <div className="mb-6 max-h-60 overflow-y-auto pr-2">
                <p className={`text-sm text-gray-700 leading-relaxed ${fontClass}`}>
                  با ثبت‌نام در برنامه وفاداری «هواپیمایی نسیم»، شما موافقت می‌کنید که:
                </p>
                <ul className={`mt-3 space-y-2 pr-3 text-sm text-gray-800 ${fontClass}`}>
                  <li className="flex items-start">
                    <span className="text-blue-600 ml-2 mt-1">•</span>
                    <span>اطلاعات پروازهای شما جهت محاسبه و اهدای امتیاز وفاداری توسط شرکت هواپیمایی هواپیمایی نسیم جمع‌آوری گردد.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 ml-2 mt-1">•</span>
                    <span>امتیازات کسب‌شده قابل استفاده برای تخفیف در خرید بلیط‌های آتی، ارتقاء کلاس پرواز و خدمات ویژه باشد.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 ml-2 mt-1">•</span>
                    <span>شرکت هواپیمایی نسیم متعهد به رعایت کامل حریم خصوصی شما و عدم اشتراک‌گذاری داده‌ها با سایر جهات بدون رضایت کتبی شماست.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 ml-2 mt-1">•</span>
                    <span>عدم پذیرش این شرایط، امکان عضویت در برنامه وفاداری را منتفی می‌سازد.</span>
                  </li>
                </ul>
                <p className={`mt-4 text-xs text-gray-500 italic ${fontClass}`}>
                  این موارد مطابق با قوانین هواپیمایی جمهوری اسلامی ایران و مقررات بین‌المللی حفظ حریم خصوصی تنظیم شده است.
                </p>
              </div>
              
              <div className="flex justify-between gap-3 pt-4 border-t border-blue-50">
                <button
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className="flex-1 py-2.5 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTermsModal(false);
                    navigate('/login');
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl font-medium text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 shadow-lg hover:shadow-xl"
                >
                  موافقم و ادامه می‌دهم
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlassmorphismHeader;