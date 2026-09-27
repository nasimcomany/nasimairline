import React from 'react';
import GlassmorphismHeader from '../components/Layout/GlassmorphismHeader';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  MapPinIcon, 
  GlobeAltIcon, 
  StarIcon
} from '@heroicons/react/24/outline';

const DestinationsPage: React.FC = () => {
  const { t, language } = useLanguage();
  
  const destinations = [
    {
      id: 1,
      name: 'تهران',
      description: 'پایتخت ایران',
      country: 'ایران',
      flights: 'پرواز روزانه',
      price: 'از $120',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      gradient: 'from-blue-500 to-blue-700'
    },
    {
      id: 2,
      name: 'مشهد',
      description: 'شهر مقدس',
      country: 'ایران',
      flights: 'پرواز روزانه',
      price: 'از $95',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      gradient: 'from-orange-500 to-orange-700'
    },
    {
      id: 3,
      name: 'شیراز',
      description: 'شهر شعر و هنر',
      country: 'ایران',
      flights: 'پرواز روزانه',
      price: 'از $110',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      gradient: 'from-pink-500 to-pink-700'
    },
    {
      id: 4,
      name: 'دبی',
      description: 'شهر طلایی',
      country: 'امارات',
      flights: 'پرواز روزانه',
      price: 'از $280',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop',
      gradient: 'from-yellow-500 to-yellow-700'
    },
    {
      id: 5,
      name: 'استانبول',
      description: 'شهر دو قاره',
      country: 'ترکیه',
      flights: 'پرواز روزانه',
      price: 'از $320',
      image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&h=300&fit=crop',
      gradient: 'from-purple-500 to-purple-700'
    },
    {
      id: 6,
      name: 'پاریس',
      description: 'شهر عشق',
      country: 'فرانسه',
      flights: 'پرواز هفتگی',
      price: 'از $450',
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop',
      gradient: 'from-indigo-500 to-indigo-700'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <GlassmorphismHeader />

      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/airport-crew.jpg)'
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* Runway lights effect */}
        <div className="absolute bottom-0 left-0 right-0 h-32">
          <div className="flex justify-between px-8">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="w-1 h-20 bg-yellow-400/60 blur-sm"></div>
            ))}
          </div>
        </div>
        
        {/* Misty atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 pt-20 sm:pt-32 pb-8 sm:pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          {/* Header */}
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
              {t('destinations.title')}
            </h1>
            <p className="text-blue-200 text-xs sm:text-sm" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
              {t('destinations.subtitle')}
            </p>
          </div>

          {/* Destinations Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {destinations.map((destination) => (
              <div key={destination.id} className="group bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300 hover:scale-105">
                {/* Image */}
                <div className="relative h-24 sm:h-32 overflow-hidden">
                  <img 
                    src={destination.image} 
                    alt={destination.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${destination.gradient} opacity-60`}></div>
                  <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-1 sm:p-1.5">
                      <MapPinIcon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-1.5 sm:px-2 py-0.5 sm:py-1">
                      <span className="text-white text-xs font-medium" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>{destination.country}</span>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <h3 className="text-base sm:text-lg font-semibold text-white" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                      {destination.name}
                    </h3>
                    <div className="text-white/60 text-xs" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                      {destination.flights}
                    </div>
                  </div>
                  
                  <p className="text-white/70 text-xs sm:text-sm mb-2 sm:mb-3" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    {destination.description}
                  </p>
                  
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-white font-semibold text-xs sm:text-sm" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                      {destination.price}
                    </div>
                    <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-1 sm:py-1.5 px-2 sm:px-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-xs" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                      {language === 'en' ? 'View' : language === 'ar' ? 'عرض' : 'مشاهده'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationsPage;
