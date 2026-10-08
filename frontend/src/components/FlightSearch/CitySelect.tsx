import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import { getOriginCities, getDestinations, OriginCity } from '../../services/niraApi';
import { clampDropdownToViewport, ClampedDropdown } from '../../utils/viewportDropdown';

interface CitySelectProps {
  value: string;
  onChange: (cityCode: string) => void;
  label: string;
  placeholder?: string;
  /** origin = all Nira origins; destination = routes from originCode */
  mode?: 'origin' | 'destination';
  /** Required when mode=destination */
  originCode?: string;
}

const CitySelect: React.FC<CitySelectProps> = ({
  value,
  onChange,
  label,
  placeholder = 'جستجوی شهر یا فرودگاه',
  mode = 'origin',
  originCode = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cities, setCities] = useState<OriginCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [dropdownStyle, setDropdownStyle] = useState<ClampedDropdown | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { language } = useLanguage();

  useEffect(() => {
    let cancelled = false;

    const fetchCities = async () => {
      try {
        setLoading(true);
        if (mode === 'destination') {
          if (!originCode) {
            if (!cancelled) setCities([]);
            return;
          }
          const destCities = await getDestinations(originCode);
          if (!cancelled) setCities(destCities.filter((c) => c.CITY !== originCode));
        } else {
          const originCities = await getOriginCities();
          if (!cancelled) setCities(originCities);
        }
      } catch (error) {
        console.error('Error loading cities:', error);
        if (!cancelled) setCities([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCities();
    return () => {
      cancelled = true;
    };
  }, [mode, originCode]);

  const selectedCity = cities.find(city => city.CITY === value);

  const getCityName = (city: OriginCity) => {
    return language === 'en' ? city.CITYNAME_EN : city.CITYNAME_FA;
  };

  const filteredCities = cities.filter(city =>
    city.CITYNAME_FA.includes(searchTerm) ||
    city.CITYNAME_EN.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.CITY.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Prefer opening above the field; always clamp inside the viewport
  const updateDropdownPosition = useCallback(() => {
    if (!isOpen || !triggerRef.current) {
      setDropdownStyle(null);
      return;
    }

    const rect = triggerRef.current.getBoundingClientRect();
    setDropdownStyle(
      clampDropdownToViewport({
        trigger: rect,
        preferredWidth: Math.min(320, window.innerWidth - 16),
        preferredHeight: 360,
        preferAbove: true,
        gap: 8,
        margin: 8,
      }),
    );
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        portalRef.current && !portalRef.current.contains(target)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    updateDropdownPosition();
  }, [updateDropdownPosition]);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('scroll', updateDropdownPosition, true);
    window.addEventListener('resize', updateDropdownPosition);
    return () => {
      window.removeEventListener('scroll', updateDropdownPosition, true);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [isOpen, updateDropdownPosition]);

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

  const listMaxHeight = dropdownStyle ? Math.max(140, dropdownStyle.maxHeight - 64) : 280;

  return (
    <>
      <style>{`
        .city-select-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .city-select-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .city-select-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .city-select-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
      <div ref={dropdownRef} className="relative">
        <label className="block text-sm font-medium text-gray-600 mb-1.5" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
          {label}
        </label>

        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all bg-white text-right flex items-center justify-between hover:border-gray-400"
          style={{
            fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif',
            direction: 'rtl',
            minHeight: '48px',
            height: '48px'
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

        {isOpen && dropdownStyle && createPortal(
          <div
            ref={portalRef}
            className="fixed z-[99999] bg-white border border-gray-300 rounded-xl shadow-2xl"
            style={{
              left: dropdownStyle.left,
              width: dropdownStyle.width,
              maxHeight: dropdownStyle.maxHeight,
              minHeight: Math.min(160, dropdownStyle.maxHeight),
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              ...(dropdownStyle.bottom !== undefined
                ? { bottom: dropdownStyle.bottom }
                : { top: dropdownStyle.top }),
            }}
          >
            <div className="p-3 border-b border-gray-200 bg-white flex-shrink-0">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="جستجو..."
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                  style={{
                    fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif',
                    direction: 'rtl'
                  }}
                />
              </div>
            </div>

            <div
              className="overflow-y-auto city-select-scrollbar flex-1"
              style={{
                maxHeight: listMaxHeight,
                minHeight: 140,
                scrollbarWidth: 'thin',
                scrollbarColor: '#cbd5e1 #f1f5f9'
              }}
            >
              {loading ? (
                <div className="px-4 py-8 text-center text-gray-500" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                  در حال بارگذاری...
                </div>
              ) : filteredCities.length > 0 ? (
                filteredCities.map((city) => (
                  <button
                    key={city.CITY}
                    type="button"
                    onClick={() => handleSelect(city.CITY)}
                    className={`w-full px-4 py-3.5 ${language === 'en' ? 'text-left' : 'text-right'} cursor-pointer transition-colors border-b border-gray-50 last:border-b-0 ${
                      city.CITY === value
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-900 hover:bg-gray-100'
                    }`}
                    style={{
                      fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif',
                      fontWeight: 'bold',
                      fontSize: '13px'
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className={`flex-1 min-w-0 ${language === 'en' ? 'text-left' : 'text-right'}`}>
                        <div className="text-sm font-bold truncate leading-tight">{getCityName(city)}</div>
                        <div className="text-xs opacity-80 truncate leading-tight mt-0.5">
                          {language === 'en' ? city.CITYNAME_FA : city.CITYNAME_EN}
                        </div>
                      </div>
                      <div className="text-xs font-bold text-blue-900 whitespace-nowrap flex-shrink-0">{city.CITY}</div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-gray-500" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                  نتیجه‌ای یافت نشد
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
      </div>
    </>
  );
};

export default CitySelect;
