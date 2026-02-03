import React from 'react';

interface NeighboringCountryMapProps {
  country: string;
  color?: string;
}

const NeighboringCountryMap: React.FC<NeighboringCountryMapProps> = ({ 
  country, 
  color = '#1e40af' 
}) => {
  const countryNames: Record<string, { fa: string; en: string; ar: string }> = {
    turkey: { fa: 'ترکیه', en: 'Turkey', ar: 'تركيا' },
    iraq: { fa: 'عراق', en: 'Iraq', ar: 'العراق' },
    turkmenistan: { fa: 'ترکمنستان', en: 'Turkmenistan', ar: 'تركمانستان' },
    afghanistan: { fa: 'افغانستان', en: 'Afghanistan', ar: 'أفغانستان' },
    pakistan: { fa: 'پاکستان', en: 'Pakistan', ar: 'باكستان' },
    azerbaijan: { fa: 'آذربایجان', en: 'Azerbaijan', ar: 'أذربيجان' },
    emirates: { fa: 'امارات', en: 'Emirates', ar: 'الإمارات' },
    armenia: { fa: 'ارمنستان', en: 'Armenia', ar: 'أرمينيا' },
    armanistan: { fa: 'ارمنستان', en: 'Armenia', ar: 'أرمينيا' },
  };

  // Country image paths
  const countryImages: Record<string, string> = {
    turkey: '/images/turkey.png',
    iraq: '/images/iraq.png',
    turkmenistan: '/images/turkimanistan.png',
    afghanistan: '/images/Afghanistan.png',
    pakistan: '/images/pakistan.png',
    azerbaijan: '/images/azerbaijan.png',
    emirates: '/images/emirates.png',
    armenia: '/images/armenia.png',
    armanistan: '/images/armenia.png',
  };

  const name = countryNames[country.toLowerCase()] || countryNames.turkey;
  const imagePath = countryImages[country.toLowerCase()] || countryImages.turkey;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 group">
      <div className="w-full h-40 flex items-center justify-center">
        <img
          src={imagePath}
          alt={name.fa}
          className="w-full h-full object-contain transition-all duration-300 group-hover:scale-105 group-hover:opacity-90 drop-shadow-lg"
        />
      </div>
      
      {/* Country name in Persian */}
      <div className="mt-2 text-center">
        <p 
          className="text-sm font-bold text-gray-800"
          style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
        >
          {name.fa}
        </p>
        <p 
          className="text-xs text-gray-600"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          {name.en}
        </p>
      </div>
    </div>
  );
};

export default NeighboringCountryMap;
