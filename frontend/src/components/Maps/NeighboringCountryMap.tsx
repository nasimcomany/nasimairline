import React from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

interface NeighboringCountryMapProps {
  country: string;
  color?: string;
}

const NeighboringCountryMap: React.FC<NeighboringCountryMapProps> = ({ 
  country, 
  color = '#1e40af' 
}) => {
  // Country ISO codes for filtering from world map
  const countryIsoCodes: Record<string, string> = {
    turkey: 'TUR',
    iraq: 'IRQ',
    turkmenistan: 'TKM',
    afghanistan: 'AFG',
    pakistan: 'PAK',
    azerbaijan: 'AZE',
  };

  const countryNames: Record<string, { fa: string; en: string; ar: string }> = {
    turkey: { fa: 'ترکیه', en: 'Turkey', ar: 'تركيا' },
    iraq: { fa: 'عراق', en: 'Iraq', ar: 'العراق' },
    turkmenistan: { fa: 'ترکمنستان', en: 'Turkmenistan', ar: 'تركمانستان' },
    afghanistan: { fa: 'افغانستان', en: 'Afghanistan', ar: 'أفغانستان' },
    pakistan: { fa: 'پاکستان', en: 'Pakistan', ar: 'باكستان' },
    azerbaijan: { fa: 'آذربایجان', en: 'Azerbaijan', ar: 'أذربيجان' },
  };

  // Geographic centers for each country (approximate)
  const countryProjections: Record<string, [number, number, number]> = {
    turkey: [35, 39, 4],      // [longitude, latitude, zoom]
    iraq: [43, 33, 4],
    turkmenistan: [59, 40, 4],
    afghanistan: [67, 33, 4],
    pakistan: [69, 30, 3.5],
    azerbaijan: [47.5, 40.5, 6],
  };

  const isoCode = countryIsoCodes[country.toLowerCase()] || countryIsoCodes.turkey;
  const name = countryNames[country.toLowerCase()] || countryNames.turkey;
  const projection = countryProjections[country.toLowerCase()] || countryProjections.turkey;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 group">
      <div className="w-full h-40 flex items-center justify-center">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            center: [projection[0], projection[1]],
            scale: 800 * projection[2],
          }}
          width={200}
          height={160}
          className="w-full h-full"
        >
          <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
            {({ geographies }) =>
              geographies
                .filter((geo) => geo.properties.ISO_A3 === isoCode)
                .map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={color}
                    stroke="#ffffff"
                    strokeWidth={1}
                    className="transition-all duration-300 group-hover:opacity-80"
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none' },
                      pressed: { outline: 'none' },
                    }}
                  />
                ))
            }
          </Geographies>
        </ComposableMap>
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
