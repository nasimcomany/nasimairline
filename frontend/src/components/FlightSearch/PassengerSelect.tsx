import React, { useState, useRef, useEffect } from 'react';
import { UserGroupIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';

interface PassengerCount {
  adults: number;
  children: number;
  infants: number;
}

interface PassengerSelectProps {
  value: PassengerCount;
  onChange: (passengers: PassengerCount) => void;
  label: string;
}

const PassengerSelect: React.FC<PassengerSelectProps> = ({
  value,
  onChange,
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalPassengers = value.adults + value.children + value.infants;

  const handleChange = (type: keyof PassengerCount, delta: number) => {
    const newValue = { ...value };
    newValue[type] = Math.max(0, newValue[type] + delta);
    
    // At least one adult required
    if (type === 'adults' && newValue.adults < 1) {
      newValue.adults = 1;
    }
    
    // Infants cannot exceed adults
    if (newValue.infants > newValue.adults) {
      newValue.infants = newValue.adults;
    }
    
    onChange(newValue);
  };

  const getPassengerText = () => {
    const parts = [];
    if (value.adults > 0) parts.push(`${value.adults} ${t('passengers.adult')}`);
    if (value.children > 0) parts.push(`${value.children} ${t('passengers.child')}`);
    if (value.infants > 0) parts.push(`${value.infants} ${t('passengers.infant')}`);
    return parts.join('، ') || t('passengers.selectPassengers');
  };

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-xs font-medium text-gray-600 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
        {label}
      </label>
      
      {/* Display Button */}
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
          <UserGroupIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900 font-bold">{getPassengerText()}</span>
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-[9999] w-full bottom-full mb-1 bg-white border border-gray-300 rounded-lg shadow-xl p-1.5">
          {/* Adults */}
          <div className="flex items-center justify-between py-1 px-1 border-b border-gray-200">
            <div className={`${language === 'en' ? 'text-left' : 'text-right'} flex-1`} style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
              <div className="text-xs font-bold text-gray-900">{t('passengers.adult')}</div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleChange('adults', -1)}
                disabled={value.adults <= 1}
                className="w-5 h-5 rounded-full border border-blue-900 text-blue-900 flex items-center justify-center hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <MinusIcon className="w-2.5 h-2.5" />
              </button>
              <span className="w-5 text-center text-xs font-bold text-gray-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                {value.adults}
              </span>
              <button
                type="button"
                onClick={() => handleChange('adults', 1)}
                disabled={value.adults >= 9}
                className="w-5 h-5 rounded-full border border-blue-900 text-blue-900 flex items-center justify-center hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <PlusIcon className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>

          {/* Children */}
          <div className="flex items-center justify-between py-1 px-1 border-b border-gray-200">
            <div className={`${language === 'en' ? 'text-left' : 'text-right'} flex-1`} style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
              <div className="text-xs font-bold text-gray-900">{t('passengers.child')}</div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleChange('children', -1)}
                disabled={value.children <= 0}
                className="w-5 h-5 rounded-full border border-blue-900 text-blue-900 flex items-center justify-center hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <MinusIcon className="w-2.5 h-2.5" />
              </button>
              <span className="w-5 text-center text-xs font-bold text-gray-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                {value.children}
              </span>
              <button
                type="button"
                onClick={() => handleChange('children', 1)}
                disabled={value.children >= 9}
                className="w-5 h-5 rounded-full border border-blue-900 text-blue-900 flex items-center justify-center hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <PlusIcon className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>

          {/* Infants */}
          <div className="flex items-center justify-between py-1 px-1">
            <div className={`${language === 'en' ? 'text-left' : 'text-right'} flex-1`} style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
              <div className="text-xs font-bold text-gray-900">{t('passengers.infant')}</div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleChange('infants', -1)}
                disabled={value.infants <= 0}
                className="w-5 h-5 rounded-full border border-blue-900 text-blue-900 flex items-center justify-center hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <MinusIcon className="w-2.5 h-2.5" />
              </button>
              <span className="w-5 text-center text-xs font-bold text-gray-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                {value.infants}
              </span>
              <button
                type="button"
                onClick={() => handleChange('infants', 1)}
                disabled={value.infants >= value.adults || value.infants >= 9}
                className="w-5 h-5 rounded-full border border-blue-900 text-blue-900 flex items-center justify-center hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <PlusIcon className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>

          {/* Done Button */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full mt-1 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold py-1 rounded transition-colors"
            style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
          >
            تایید
          </button>
        </div>
      )}
    </div>
  );
};

export default PassengerSelect;

