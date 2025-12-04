import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
  dropdownPosition?: 'top' | 'bottom' | 'auto';
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'انتخاب کنید',
  disabled = false,
  required = false,
  className = '',
  style = {},
  dropdownPosition: forcedPosition = 'auto'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownContentRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      if (forcedPosition === 'top') {
        setDropdownPosition('top');
      } else if (forcedPosition === 'bottom') {
        setDropdownPosition('bottom');
      } else {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;
        const dropdownHeight = Math.min(options.length * 36 + 12, 180); // Smaller: 36px per option, max 180px

        // If not enough space below but more space above, open upward
        if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
          setDropdownPosition('top');
        } else {
          setDropdownPosition('bottom');
        }
      }

      // Scroll to selected option
      setTimeout(() => {
        if (dropdownContentRef.current) {
          const selectedElement = dropdownContentRef.current.querySelector('[data-selected="true"]');
          if (selectedElement) {
            selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
        }
      }, 50);
    }
  }, [isOpen, options.length, forcedPosition]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`} style={{ ...style }}>
      {/* Selected Value Display */}
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all bg-white ${
            disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:border-gray-400'
          }`}
          style={{ 
            fontFamily: 'DigiHamisheBold, Arial, sans-serif',
            direction: 'rtl',
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem',
            paddingRight: '1rem',
            paddingLeft: '3rem',
            fontWeight: 'bold',
            textAlign: 'right',
            fontSize: '0.875rem',
            height: '100%',
            ...style
          }}
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </button>
        
        {/* Chevron Icon - Outside button to prevent layout issues */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <ChevronDownIcon 
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          />
        </div>
      </div>

      {/* Dropdown Options */}
      {isOpen && !disabled && (
        <div 
          ref={dropdownContentRef}
          className={`absolute z-[9999] w-full bg-white border border-gray-300 rounded-lg shadow-xl max-h-44 overflow-y-auto ${
            dropdownPosition === 'top' ? 'mb-1' : 'mt-1'
          }`}
          style={{
            fontFamily: 'DigiHamisheBold, Arial, sans-serif',
            direction: 'rtl',
            fontSize: '13px',
            ...(dropdownPosition === 'top' 
              ? { bottom: '100%', left: 0, right: 0 }
              : { top: '100%', left: 0, right: 0 }
            )
          }}
        >
          {options.map((option) => (
            <div
              key={option.value}
              data-selected={option.value === value}
              onClick={() => handleSelect(option.value)}
              className={`px-4 py-3 cursor-pointer transition-colors text-right ${
                option.value === value
                  ? 'bg-blue-100 text-blue-900'
                  : 'text-gray-900 hover:bg-gray-100'
              }`}
              style={{
                fontFamily: 'DigiHamisheBold, Arial, sans-serif',
                fontWeight: 'bold'
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;

