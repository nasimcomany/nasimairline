import React from 'react';

interface NeighboringCountryMapProps {
  country: string;
  color?: string;
}

const NeighboringCountryMap: React.FC<NeighboringCountryMapProps> = ({ 
  country, 
  color = '#1e40af' 
}) => {
  // Simple SVG paths for neighboring countries
  // These are simplified representations
  const countryPaths: Record<string, string> = {
    // Turkey - simplified shape
    turkey: "M10,30 L80,20 L120,30 L150,25 L180,35 L190,50 L180,65 L150,70 L100,75 L50,70 L20,60 L10,45 Z",
    
    // Iraq - simplified shape
    iraq: "M30,20 L80,15 L120,25 L140,40 L145,60 L140,80 L120,100 L80,110 L50,105 L30,90 L25,70 L20,50 L25,35 Z",
    
    // Turkmenistan - simplified shape
    turkmenistan: "M20,30 L60,25 L100,30 L140,35 L170,45 L185,60 L180,80 L160,90 L120,95 L80,90 L40,85 L15,70 L10,50 Z",
    
    // Afghanistan - simplified shape
    afghanistan: "M30,25 L70,20 L110,30 L140,35 L165,50 L175,70 L170,90 L150,105 L120,110 L80,105 L50,95 L25,80 L20,60 L25,40 Z",
    
    // Pakistan - simplified shape
    pakistan: "M40,20 L80,15 L115,25 L140,40 L155,65 L160,90 L150,120 L130,145 L100,160 L70,170 L50,165 L35,145 L25,115 L20,85 L25,55 L30,35 Z",
    
    // Azerbaijan - simplified shape
    azerbaijan: "M25,40 L55,35 L85,40 L105,50 L115,65 L110,80 L95,90 L70,95 L45,90 L25,80 L20,65 L22,52 Z",
  };

  const countryNames: Record<string, { fa: string; en: string; ar: string }> = {
    turkey: { fa: 'ترکیه', en: 'Turkey', ar: 'تركيا' },
    iraq: { fa: 'عراق', en: 'Iraq', ar: 'العراق' },
    turkmenistan: { fa: 'ترکمنستان', en: 'Turkmenistan', ar: 'تركمانستان' },
    afghanistan: { fa: 'افغانستان', en: 'Afghanistan', ar: 'أفغانستان' },
    pakistan: { fa: 'پاکستان', en: 'Pakistan', ar: 'باكستان' },
    azerbaijan: { fa: 'آذربایجان', en: 'Azerbaijan', ar: 'أذربيجان' },
  };

  const path = countryPaths[country.toLowerCase()] || countryPaths.turkey;
  const name = countryNames[country.toLowerCase()] || countryNames.turkey;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300">
      <svg
        viewBox="0 0 200 200"
        className="w-full h-32"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Country shape */}
        <path
          d={path}
          fill={color}
          stroke="#ffffff"
          strokeWidth="2"
          className="transition-all duration-300 hover:opacity-80"
        />
      </svg>
      
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
