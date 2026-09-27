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
      className="fixed right-6 bottom-24 z-40 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg p-3 shadow-lg transition-all duration-300 hover:shadow-xl group border border-gray-300/50"
      style={{
        backdropFilter: 'blur(10px)',
        minWidth: '56px',
        minHeight: '56px'
      }}
      aria-label={t('scrollToTop.title') || 'بازگشت به ابتدای صفحه'}
      title={t('scrollToTop.title') || 'بازگشت به ابتدای صفحه'}
    >
      <div className="flex flex-col items-center justify-center">
        <ArrowUpIcon className="h-5 w-5 group-hover:translate-y-[-2px] transition-transform duration-300" />
        <span 
          className={`text-[10px] font-medium ${fontClass} hidden sm:block mt-1`}
          style={{
            fontFamily: language === 'fa' ? 'DigiHamishe, DigiHamisheBold, sans-serif' : language === 'en' ? 'Inter, sans-serif' : "'Noto Sans Arabic', sans-serif"
          }}
        >
          {t('scrollToTop.title') || 'بازگشت به ابتدای صفحه'}
        </span>
      </div>
    </button>
  );
};

export default ScrollToTopButton;

