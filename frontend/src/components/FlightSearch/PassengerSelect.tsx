import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [dropdownStyle, setDropdownStyle] = useState<{ top?: number; bottom?: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        (!portalRef.current || !portalRef.current.contains(target))
      ) {
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

  const updateDropdownPosition = () => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownHeight = 220;
      const gap = 6;
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceAbove >= dropdownHeight + gap || spaceAbove >= spaceBelow) {
        setDropdownStyle({
          bottom: window.innerHeight - rect.top + gap,
          left: rect.left,
          width: Math.max(rect.width, 220)
        });
      } else {
        setDropdownStyle({
          top: rect.bottom + gap,
          left: rect.left,
          width: Math.max(rect.width, 220)
        });
      }
    } else {
      setDropdownStyle(null);
    }
  };

  useEffect(() => {
    updateDropdownPosition();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('scroll', updateDropdownPosition, true);
    window.addEventListener('resize', updateDropdownPosition);
    return () => {
      window.removeEventListener('scroll', updateDropdownPosition, true);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [isOpen]);

  const getPassengerText = () => {
    const parts = [];
    if (value.adults > 0) parts.push(`${value.adults} ${t('passengers.adult')}`);
    if (value.children > 0) parts.push(`${value.children} ${t('passengers.child')}`);
    if (value.infants > 0) parts.push(`${value.infants} ${t('passengers.infant')}`);
    return parts.join('، ') || t('passengers.selectPassengers');
  };

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-sm font-medium text-gray-600 mb-1.5" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
        {label}
      </label>
      
      {/* Display Button */}
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
        <div className="flex items-center gap-1.5">
          <UserGroupIcon className="w-5 h-5 text-gray-400" />
          <span className="text-base text-gray-900 font-bold">{getPassengerText()}</span>
        </div>
      </button>

      {/* Dropdown - Portal برای نمایش کامل و بدون clipping - عین کلاس */}
      {isOpen && dropdownStyle && createPortal(
        <div
          ref={portalRef}
          className="fixed z-[99999] bg-white border border-gray-300 rounded-xl shadow-2xl overflow-hidden"
          style={{
            left: dropdownStyle.left,
            width: dropdownStyle.width,
            ...(dropdownStyle.bottom !== undefined 
              ? { bottom: dropdownStyle.bottom } 
              : { top: dropdownStyle.top })
          }}
        >
          <div className="p-3">
          {/* Adults */}
          <div className="flex items-center justify-between py-3 px-2 border-b border-gray-100 last:border-b-0">
            <div className={`${language === 'en' ? 'text-left' : 'text-right'} flex-1`} style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
              <div className="text-sm font-bold text-gray-900">{t('passengers.adult')}</div>
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
              <span className="w-5 text-center text-xs font-bold text-gray-900" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
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
          <div className="flex items-center justify-between py-3 px-2 border-b border-gray-100">
            <div className={`${language === 'en' ? 'text-left' : 'text-right'} flex-1`} style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
              <div className="text-sm font-bold text-gray-900">{t('passengers.child')}</div>
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
              <span className="w-5 text-center text-xs font-bold text-gray-900" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
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
          <div className="flex items-center justify-between py-3 px-2">
            <div className={`${language === 'en' ? 'text-left' : 'text-right'} flex-1`} style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
              <div className="text-sm font-bold text-gray-900">{t('passengers.infant')}</div>
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
              <span className="w-5 text-center text-xs font-bold text-gray-900" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
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
            className="w-full mt-3 bg-blue-900 hover:bg-blue-800 text-white text-sm font-bold py-3 rounded-lg transition-colors"
            style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}
          >
            تایید
          </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PassengerSelect;

