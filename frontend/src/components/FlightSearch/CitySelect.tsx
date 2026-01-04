import React, { useState, useRef, useEffect } from 'react';
import { MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import { getOriginCities, OriginCity } from '../../services/niraApi';

interface CitySelectProps {
  value: string;
  onChange: (cityCode: string) => void;
  label: string;
  placeholder?: string;
}

const CitySelect: React.FC<CitySelectProps> = ({
  value,
  onChange,
  label,
  placeholder = 'جستجوی شهر یا فرودگاه'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cities, setCities] = useState<OriginCity[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { language } = useLanguage();

  // Fetch cities from API on component mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        const originCities = await getOriginCities();
        setCities(originCities);
      } catch (error) {
        console.error('Error loading cities:', error);
        // Fallback to empty array if API fails
        setCities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  const selectedCity = cities.find(city => city.CITY === value);
  
  const getCityName = (city: OriginCity) => {
    return language === 'en' ? city.CITYNAME_EN : city.CITYNAME_FA;
  };

  const filteredCities = cities.filter(city =>
    city.CITYNAME_FA.includes(searchTerm) ||
    city.CITYNAME_EN.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.CITY.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (cityCode: string) => {
    onChange(cityCode);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-xs font-medium text-gray-600 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
        {label}
      </label>
      
      {/* Selected City Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all bg-white text-right flex items-center justify-between hover:border-gray-400"
        style={{
          fontFamily: 'DigiHamisheBold, Arial, sans-serif',
          direction: 'rtl'
        }}
      >
        <div className="flex items-center gap-1">
          <MapPinIcon className="w-4 h-4 text-gray-400" />
          {loading ? (
            <span className="text-sm text-gray-400">در حال بارگذاری...</span>
          ) : selectedCity ? (
            <div className={language === 'en' ? 'text-left' : 'text-right'}>
              <div className="text-sm text-gray-900 font-bold">{getCityName(selectedCity)}</div>
              <div className="text-xs text-gray-500">{selectedCity.CITY}</div>
            </div>
          ) : (
            <span className="text-sm text-gray-400">{placeholder}</span>
          )}
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-96 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200 sticky top-0 bg-white">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو..."
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                style={{
                  fontFamily: 'DigiHamisheBold, Arial, sans-serif',
                  direction: 'rtl'
                }}
              />
            </div>
          </div>

          {/* Cities List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center text-gray-500" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                در حال بارگذاری...
              </div>
            ) : filteredCities.length > 0 ? (
              filteredCities.map((city) => (
                <button
                  key={city.CITY}
                  type="button"
                  onClick={() => handleSelect(city.CITY)}
                  className={`w-full px-3 py-1.5 ${language === 'en' ? 'text-left' : 'text-right'} hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0 ${
                    city.CITY === value ? 'bg-blue-50' : ''
                  }`}
                  style={{
                    fontFamily: 'DigiHamisheBold, Arial, sans-serif'
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className={`flex-1 min-w-0 ${language === 'en' ? 'text-left' : 'text-right'}`}>
                      <div className="text-sm font-bold text-gray-900 truncate leading-tight">{getCityName(city)}</div>
                      <div className="text-xs text-gray-600 truncate leading-tight">
                        {language === 'en' ? city.CITYNAME_FA : city.CITYNAME_EN}
                      </div>
                    </div>
                    <div className="text-xs font-bold text-blue-900 whitespace-nowrap flex-shrink-0">{city.CITY}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                نتیجه‌ای یافت نشد
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CitySelect;

