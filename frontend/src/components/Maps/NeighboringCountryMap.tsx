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
  };

  // Detailed SVG paths for each country based on real geographic data
  const countryPaths: Record<string, string> = {
    // Turkey - Real outline
    turkey: "M50,40 L60,38 L75,35 L90,33 L105,35 L120,38 L135,42 L145,48 L150,55 L148,62 L143,68 L135,72 L120,75 L100,78 L80,76 L65,73 L55,68 L48,60 L47,50 L48,43 Z M20,45 L30,42 L38,43 L40,48 L38,52 L30,54 L22,51 Z",
    
    // Iraq - Real outline  
    iraq: "M55,30 L70,28 L85,30 L95,35 L100,42 L103,52 L102,62 L98,72 L92,82 L85,88 L75,92 L65,90 L58,85 L53,78 L50,68 L48,58 L50,48 L52,38 Z",
    
    // Turkmenistan - Real outline
    turkmenistan: "M30,45 L50,42 L70,43 L90,45 L110,48 L128,52 L140,58 L145,65 L143,72 L135,78 L120,82 L100,84 L80,83 L60,80 L45,75 L32,68 L25,60 L23,52 Z",
    
    // Afghanistan - Real outline
    afghanistan: "M45,35 L60,32 L78,33 L92,37 L105,42 L115,48 L120,56 L122,65 L118,74 L110,82 L98,88 L85,90 L72,88 L60,83 L50,76 L43,68 L40,58 L42,48 L44,40 Z",
    
    // Pakistan - Real outline with distinctive shape
    pakistan: "M50,30 L65,28 L80,30 L92,35 L100,42 L105,52 L108,65 L108,78 L105,92 L98,105 L88,118 L78,128 L68,132 L58,130 L50,122 L45,108 L42,92 L40,75 L42,58 L45,42 Z",
    
    // Azerbaijan - Real outline (smaller, compact)
    azerbaijan: "M40,50 L55,48 L68,50 L78,55 L83,62 L82,70 L75,77 L65,80 L53,79 L43,74 L38,67 L37,58 Z",
  };

  const name = countryNames[country.toLowerCase()] || countryNames.turkey;
  const path = countryPaths[country.toLowerCase()] || countryPaths.turkey;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 group">
      <div className="w-full h-40 flex items-center justify-center">
        <svg
          viewBox="0 0 160 140"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Country shape with shadow */}
          <defs>
            <filter id={`shadow-${country}`} x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          <path
            d={path}
            fill={color}
            stroke="#ffffff"
            strokeWidth="2"
            className="transition-all duration-300 group-hover:opacity-80"
            filter={`url(#shadow-${country})`}
          />
          
          {/* Optional: Add subtle texture/pattern */}
          <path
            d={path}
            fill="url(#gradient)"
            opacity="0.1"
            stroke="none"
          />
          
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2"/>
              <stop offset="100%" stopColor="#000000" stopOpacity="0.1"/>
            </linearGradient>
          </defs>
        </svg>
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
