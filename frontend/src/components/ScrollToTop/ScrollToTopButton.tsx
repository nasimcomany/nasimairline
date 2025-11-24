import React, { useState, useEffect } from 'react';
import { ArrowUpIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';

const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { language, t, fontClass } = useLanguage();

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className={`fixed ${language === 'en' ? 'right-6' : 'left-6'} bottom-24 z-40 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-blue-500/50 group`}
      aria-label={t('scrollToTop.title') || 'بازگشت به ابتدای صفحه'}
      title={t('scrollToTop.title') || 'بازگشت به ابتدای صفحه'}
    >
      <div className="flex flex-col items-center justify-center">
        <ArrowUpIcon className="h-6 w-6 mb-1 group-hover:animate-bounce" />
        <span className={`text-xs font-medium ${fontClass} hidden sm:block`}>
          {t('scrollToTop.title') || 'بازگشت به ابتدای صفحه'}
        </span>
      </div>
      
      {/* Animated background effect */}
      <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
    </button>
  );
};

export default ScrollToTopButton;

