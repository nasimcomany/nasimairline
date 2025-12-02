import React, { useState, useRef, useEffect } from 'react';
import { MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { cities, City } from '../../data/cities';

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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCity = cities.find(city => city.code === value);

  const filteredCities = cities.filter(city =>
    city.nameFa.includes(searchTerm) ||
    city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.countryFa.includes(searchTerm)
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
          {selectedCity ? (
            <div className="text-right">
              <div className="text-sm text-gray-900 font-bold">{selectedCity.nameFa}</div>
              <div className="text-xs text-gray-500">{selectedCity.code}</div>
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
            {filteredCities.length > 0 ? (
              filteredCities.map((city) => (
                <button
                  key={city.code}
                  type="button"
                  onClick={() => handleSelect(city.code)}
                  className={`w-full px-4 py-3 text-right hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0 ${
                    city.code === value ? 'bg-blue-50' : ''
                  }`}
                  style={{
                    fontFamily: 'DigiHamisheBold, Arial, sans-serif'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{city.nameFa}</div>
                      <div className="text-sm text-gray-600">{city.name} - {city.countryFa}</div>
                    </div>
                    <div className="text-sm font-bold text-blue-900">{city.code}</div>
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

