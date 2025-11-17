import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'fa' | 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation data
const translations = {
  fa: {
    // Navigation
    'nav.home': 'خانه',
    'nav.about': 'درباره ما',
    'nav.flights': 'پروازها',
    'nav.booking': 'رزرو',
    'nav.services': 'خدمات',
    'nav.gallery': 'گالری',
    'nav.news': 'اخبار',
    'nav.contact': 'تماس',
    'nav.destinations': 'مقاصد',
    'nav.offers': 'پیشنهادات',
    'nav.membership': 'عضویت',
    'nav.support': 'پشتیبانی',
    'nav.login': 'ورود',
    'nav.register': 'ثبت نام',
    'nav.language': 'انتخاب زبان',
    
    // Language names
    'lang.farsi': 'فارسی',
    'lang.arabic': 'عربی',
    'lang.english': 'انگلیسی',
    
    // Common
    'common.welcome': 'خوش آمدید',
    'common.loading': 'در حال بارگذاری...',
    'common.error': 'خطا',
    'common.success': 'موفقیت',
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.about': 'من نحن',
    'nav.flights': 'الرحلات',
    'nav.booking': 'الحجز',
    'nav.services': 'الخدمات',
    'nav.gallery': 'المعرض',
    'nav.news': 'الأخبار',
    'nav.contact': 'اتصل بنا',
    'nav.destinations': 'الوجهات',
    'nav.offers': 'العروض',
    'nav.membership': 'العضوية',
    'nav.support': 'الدعم',
    'nav.login': 'تسجيل الدخول',
    'nav.register': 'إنشاء حساب',
    'nav.language': 'اختيار اللغة',
    
    // Language names
    'lang.farsi': 'الفارسية',
    'lang.arabic': 'العربية',
    'lang.english': 'الإنجليزية',
    
    // Common
    'common.welcome': 'مرحبا',
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجح',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About Us',
    'nav.flights': 'Flights',
    'nav.booking': 'Booking',
    'nav.services': 'Services',
    'nav.gallery': 'Gallery',
    'nav.news': 'News',
    'nav.contact': 'Contact',
    'nav.destinations': 'Destinations',
    'nav.offers': 'Offers',
    'nav.membership': 'Membership',
    'nav.support': 'Support',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.language': 'Select Language',
    
    // Language names
    'lang.farsi': 'Farsi',
    'lang.arabic': 'Arabic',
    'lang.english': 'English',
    
    // Common
    'common.welcome': 'Welcome',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
  },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fa');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
